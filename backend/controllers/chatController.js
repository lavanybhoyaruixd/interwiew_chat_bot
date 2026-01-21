/* eslint-env node */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
// Chat controller centralizes interview-focused chat logic
// Note: We are not removing existing logic; this refactors it into controller methods
// and enhances prompts + history handling. Routes will delegate to these methods.

const aiService = require('../services/aiService');
const enhancedAI = require('../services/enhancedAiService');
const { getResumeText } = require('../services/resumeContext');
const { ApiError } = require('../utils/ApiError');
const logger = require('../utils/logger');

// Utility: limit and normalize conversation history for token optimization
function buildMessagesFromHistory(systemContent, history = [], userMessage) {
  const messages = [{ role: 'system', content: systemContent }];
  // Keep last 8 messages max, trim long messages
  const recent = (history || []).slice(-8).map((m) => ({
    role: m.role || (m.sender === 'user' ? 'user' : 'assistant'),
    content: (m.content || m.text || '').toString().slice(0, 800)
  }));
  messages.push(...recent);
  if (userMessage) messages.push({ role: 'user', content: userMessage.toString().slice(0, 1200) });
  return messages;
}

// Simple cache for common questions and responses
const responseCache = new Map();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

// Base, interview-focused system prompt (PRIVACY: NO resume context by default)
function baseInterviewSystemPrompt() {
  return `You are HireMate, a professional Tech Interview Assistant.
Output must be interview-ready, human-readable, and safe to render in UI.

FORMAT RULES (strict):
- Use ### for headings only
- Use - for bullet points only
- Use **bold** sparingly and only when necessary
- Never repeat words, phrases, or Markdown symbols
- Remove any duplicated tokens or corrupted formatting
- Each section must contain unique information

STYLE:
- Be concise and clear
- Focus on key points
- Keep responses under 200 words unless detailed explanation is needed
- Internally rewrite and clean the answer before returning it

IMPORTANT: Do not use any uploaded resume data. Answer based on general knowledge only.
Resume data is only provided when the user explicitly asks for resume-based analysis.`;
}

function buildResumeContextSection(resumeText) {
  // DEPRECATED: This function is no longer used.
  // Resume data is ONLY injected in resume-specific endpoints.
  // This prevents privacy leaks into general chatbot responses.
  if (!resumeText || typeof resumeText !== 'string') return '';
  const clean = resumeText.replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  const snippet = clean.slice(0, 1500);
  return `\nCandidate Resume Context (use when relevant):\n- Use details below to tailor answers, examples, and suggestions.\n- Do not quote long passages; summarize briefly.\n\n【RESUME_SNIPPET】\n${snippet}\n【/RESUME_SNIPPET】\n`;
}

async function message(req, res) {
  try {
    const { message: userMessage, history = [] } = req.body;
    if (!userMessage?.trim()) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    if (req.user?.hasCredits && !req.user.hasCredits(1)) {
      return res.status(402).json({
        success: false,
        message: 'Insufficient credits. Please purchase more credits to continue.',
        credits: req.user.credits
      });
    }

    // Check cache first
    const cacheKey = `${userMessage.toLowerCase().trim().substring(0, 100)}`;
    const cached = responseCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      return res.json({ 
        success: true, 
        response: cached.response,
        cached: true
      });
    }
    
    // PRIVACY PROTECTION: Do NOT inject resume into general chat
    // Resume data is only used in resume-specific endpoints (/api/resume/ask, /api/ats/analyze)
    // This ensures user privacy and correct AI behavior in general interview discussions

    if (!userMessage || !userMessage.trim()) throw new ApiError(400, 'Message is required');

    // Enforce topic scope
    const allowed = await enhancedAI.checkIfInterviewRelated(userMessage);
    if (!allowed) {
      return res.json({ success: true, response: "> \"I specialize in interview and tech-related topics 😊. Please ask me something about careers, coding, or job preparation!\"", timestamp: new Date().toISOString() });
    }

    const system = baseInterviewSystemPrompt();
    const messages = buildMessagesFromHistory(system, history, userMessage);

    const result = await withTimeout(() =>
      enhancedAI.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages,
        temperature: 0.4,
        max_tokens: 350
      }),
    25000);

    const content = result.choices?.[0]?.message?.content || fallback();
    
    // Deduct credit after successful response
    if (req.user && req.user.deductCredits) {
      await req.user.deductCredits(1);
      logger.info(`Credit deducted for user: ${req.user.email}, remaining: ${req.user.credits}`);
    }
    
    res.json({ 
      success: true, 
      response: ensureMarkdown(formatInterviewAnswer(content)), 
      timestamp: new Date().toISOString(),
      creditsRemaining: req.user?.credits ?? null
    });
  } catch (err) {
    logger.error('Error in message:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

async function explain(req, res) {
  const { topic, level = 'beginner', history = [] } = req.body || {};
  if (!topic || !topic.trim()) throw new ApiError(400, 'Topic is required');

  if (req.user?.hasCredits && !req.user.hasCredits(1)) {
    return res.status(402).json({
      success: false,
      message: 'Insufficient credits. Please purchase more credits to continue.',
      credits: req.user.credits
    });
  }

  // Enforce topic scope
  const allowed = await enhancedAI.checkIfInterviewRelated(topic);
  if (!allowed) {
    return res.json({ success: true, explanation: "> \"I specialize in interview and tech-related topics 😊. Please ask me something about careers, coding, or job preparation!\"", topic, level, timestamp: new Date().toISOString() });
  }

  const system = `${baseInterviewSystemPrompt()}\nTailor to ${level}. Prefer short, role-relevant explanations.`;
  const messages = buildMessagesFromHistory(system, history, `Explain ${topic} for ${level} interview prep.`);

  const result = await withTimeout(() =>
    enhancedAI.groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages,
      temperature: 0.3,
      max_tokens: 400
    }),
  25000);

  const content = result.choices?.[0]?.message?.content || fallback();
  
  // Deduct credit after successful response
  if (req.user && req.user.deductCredits) {
    await req.user.deductCredits(1);
  }
  
  res.json({ 
    success: true, 
    explanation: ensureMarkdown(formatInterviewAnswer(content)), 
    topic, 
    level, 
    timestamp: new Date().toISOString(),
    creditsRemaining: req.user?.credits ?? null
  });
}

async function ask(req, res) {
  const { question, history = [], domain = null, level = 'mid', useResume = false } = req.body || {};
  if (!question || !question.trim()) throw new ApiError(400, 'Question is required');

  if (req.user?.hasCredits && !req.user.hasCredits(1)) {
    return res.status(402).json({
      success: false,
      message: 'Insufficient credits. Please purchase more credits to continue.',
      credits: req.user.credits
    });
  }

  // Quick intent detection: requests like "give questions on python" or single tech tokens
  const intent = parseQuestionIntent(question);

  // Use enhancedAI for interview-scope gating and trend awareness (after parsing intent)
  const isInterview = await enhancedAI.checkIfInterviewRelated(question);
  if (!isInterview) {
    // If classification failed but intent is tech question, still proceed
    if (intent.type === 'generate_questions') {
      return handleTechQuestion(intent, level, question, res);
    }
    return res.json({ success: true, response: "> \"I specialize in interview and tech-related topics 😊. Please ask me something about careers, coding, or job preparation!\"" });
  }

  if (intent.type === 'generate_questions') {
    return handleTechQuestion(intent, level, question, res);
  }
  
  // PRIVACY PROTECTION: Only use resume if explicitly requested via useResume flag
  if (useResume === true) {
    const resumeText = getResumeText();
    if (resumeText) {
      const system = baseInterviewSystemPrompt() + `\n\nCandidate Resume:\n${resumeText.substring(0, 1500)}`;
      const messages = buildMessagesFromHistory(system, history, question);
      const result = await withTimeout(() =>
        aiService.groq.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          messages,
          temperature: 0.4,
          max_tokens: 420
        }),
      25000);
      const content = result.choices?.[0]?.message?.content || fallback();
      if (req.user && req.user.deductCredits) {
        await req.user.deductCredits(1);
      }
      return res.json({ success: true, response: ensureMarkdown(formatInterviewAnswer(content)), question, timestamp: new Date().toISOString(), creditsRemaining: req.user?.credits ?? null });
    }
  }

  // Default: NO resume context (privacy-safe)
  const response = await enhancedAI.generateContextualChatResponse(question, domain, level, history);
  
  // Deduct credit after successful response
  if (req.user && req.user.deductCredits) {
    await req.user.deductCredits(1);
  }
  
  res.json({ 
    success: true, 
    response: ensureMarkdown(formatInterviewAnswer(response)), 
    question, 
    timestamp: new Date().toISOString(),
    creditsRemaining: req.user?.credits ?? null
  });
}

async function help(req, res) {
  const { question, language, difficulty = 'intermediate', history = [] } = req.body || {};
  if (!question || !question.trim()) throw new ApiError(400, 'Question is required');

  if (req.user?.hasCredits && !req.user.hasCredits(1)) {
    return res.status(402).json({
      success: false,
      message: 'Insufficient credits. Please purchase more credits to continue.',
      credits: req.user.credits
    });
  }

  // Enforce topic scope
  const allowed = await enhancedAI.checkIfInterviewRelated(question);
  if (!allowed) {
    return res.json({ success: true, help: "> \"I specialize in interview and tech-related topics 😊. Please ask me something about careers, coding, or job preparation!\"", question, language, difficulty, timestamp: new Date().toISOString() });
  }

  const system = `${baseInterviewSystemPrompt()}\nKeep it practical. Difficulty: ${difficulty}.`;
  const prefix = language ? `[${language}] ` : '';
  const messages = buildMessagesFromHistory(system, history, `${prefix}${question}`);

  const result = await withTimeout(() =>
    aiService.groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages,
      temperature: 0.3,
      max_tokens: 420
    }),
  25000);

  const helpText = result.choices?.[0]?.message?.content || fallback();
  if (req.user && req.user.deductCredits) {
    await req.user.deductCredits(1);
  }
  res.json({ success: true, help: ensureMarkdown(formatInterviewAnswer(helpText)), question, language, difficulty, timestamp: new Date().toISOString(), creditsRemaining: req.user?.credits ?? null });
}

// Streaming using SSE (same endpoint signature). We keep legacy SSE contract.
async function stream(req, res) {
  const { question, history: historyParam } = req.query;
  if (!question || !question.trim()) throw new ApiError(400, 'Question is required');

  if (req.user?.hasCredits && !req.user.hasCredits(1)) {
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Insufficient credits. Please purchase more credits to continue.' })}\n\n`);
    res.write('data: {"type":"done"}\n\n');
    return res.end();
  }

  // Parse history from query params if provided
  let history = [];
  if (historyParam) {
    try {
      history = JSON.parse(historyParam);
    } catch (e) {
      logger.warn('Failed to parse history from query params:', e);
    }
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.status(200);
  res.write('data: {"type":"connected"}\n\n');

  try {
    // Only allow interview/career/tech questions
    const isInterview = await enhancedAI.checkIfInterviewRelated(question);
    if (!isInterview) {
      const rejection = { type: 'chunk', content: "I specialize in interview, tech, and career topics. Please ask about job interviews, coding, or professional development!" };
      res.write(`data: ${JSON.stringify(rejection)}\n\n`);
      res.write('data: {"type":"done"}\n\n');
      return res.end();
    }

    // Real-time AI prompt for interview/career/tech
    const systemPrompt = `You are HireMate, a professional Tech Interview Assistant.\n\nFORMAT RULES (strict):\n- Use ### for headings only\n- Use - for bullet points only\n- Use **bold** sparingly and only when necessary\n- Never repeat words, phrases, or Markdown symbols\n- Remove any duplicated tokens or corrupted formatting\n- Each section must contain unique information\n\nGuidelines:\n- Be concise and clear\n- Provide actionable advice\n- Focus on practical interview and career preparation\n- Internally rewrite and clean the answer before returning it\n- Do NOT echo the user's message; always provide a helpful, original answer.`;
    
    // Build messages with history for context
    const messages = buildMessagesFromHistory(systemPrompt, history, question);

    const stream = await aiService.groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages,
      temperature: 0.3,
      max_tokens: 350,
      stream: true
    });

    const deadline = Date.now() + 25000;
    for await (const chunk of stream) {
      if (Date.now() > deadline) break;
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) res.write(`data: ${JSON.stringify({ type: 'chunk', content })}\n\n`);
    }
    
    // Deduct credit after successful streaming
    if (req.user && req.user.deductCredits) {
      await req.user.deductCredits(1);
      logger.info(`Credit deducted for streaming user: ${req.user.email}, remaining: ${req.user.credits}`);
    }
    
  } catch (err) {
    logger.error('SSE stream error:', err);
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Failed to generate response' })}\n\n`);
  } finally {
    res.write('data: {"type":"done"}\n\n');
    res.end();
  }
}

// ----- helpers -----
function fallback() {
  return 'I had trouble processing that. Please rephrase or ask another interview question.';
}

function withTimeout(fn, ms) {
  return Promise.race([
    fn(),
    new Promise((_, reject) => setTimeout(() => reject(new ApiError(504, 'AI provider timeout')), ms))
  ]);
}

// Normalize AI answers for readability: bullets, numbered lists, spacing, and length
function formatInterviewAnswer(raw) {
  if (!raw || typeof raw !== 'string') return raw;
  let text = raw.trim();
  // Remove obvious markdown corruption
  text = cleanMarkdownArtifacts(text);
  // Collapse consecutive duplicate words/punctuation
  text = dedupeText(text);
  // Remove common polite prefaces
  text = text.replace(/^(sure|certainly|of course|absolutely|here(?:'|’)s|here are)[,\s]+/i, '');
  // Normalize headings to ###
  text = text.replace(/^\s*#{1,6}\s+/gm, '### ');
  // Normalize numbered lists and bullet symbols to '- '
  text = text.replace(/^\s*\d+\.\s+/gm, '- ');
  text = text.replace(/^\s*[•*+-]\s+/gm, '- ');
  // Collapse >2 blank lines
  text = text.replace(/\n{3,}/g, '\n\n');
  // Soft cap overly long responses
  if (text.length > 1800) text = text.slice(0, 1800).trimEnd() + '...';
  return text;
}

// Guarantee minimal markdown structure even if model returns plain text
function ensureMarkdown(text) {
  if (!text) return text;
  const cleaned = cleanMarkdownArtifacts(text);
  const hasBullet = /(^|\n)\s*(-)\s+/.test(cleaned);
  if (hasBullet) return cleaned;
  // Wrap plain paragraphs into a markdown section with bullets if absent
  const lines = cleaned.split(/\n+/).filter(l => l.trim());
  return lines.map(l => `- ${l.replace(/^[-*•+]\s*/, '')}`).join('\n');
}

// Remove repeated markdown symbols and malformed list markers
function cleanMarkdownArtifacts(input) {
  let t = String(input || '');
  // Normalize repeated asterisks and stray markers
  t = t.replace(/\*{3,}/g, '**');
  t = t.replace(/(\*\*)\s*(\*\*)+/g, '**');
  t = t.replace(/(^|\n)\s*-\s*\*\s+/g, '$1- ');
  t = t.replace(/(^|\n)\s*\+{2,}\s+/g, '$1- ');
  t = t.replace(/(^|\n)\s*\*\s*\*\s+/g, '$1- ');
  // Remove duplicated markdown punctuation like "- *" or "** **"
  t = t.replace(/\*\*\s+\*\*/g, '**');
  return t;
}

// Collapse immediate repeated words and punctuation (server-side cleanup)
function dedupeText(input) {
  let t = String(input);
  // Normalize whitespace
  t = t.replace(/[\t\r]+/g, ' ').replace(/ +/g, ' ').replace(/\s*\n\s*/g, '\n');
  // Deduplicate immediate repeated words (case-insensitive)
  t = t.replace(/\b([A-Za-z0-9]+)(\s+\1\b)+/gi, '$1');
  // Deduplicate punctuation sequences
  t = t.replace(/([.!?,;:])(\s*\1)+/g, '$1');
  // Fix repeated heading word patterns
  t = t.replace(/(^|\n)\s*(#+\s+)([A-Za-z0-9]+)(\s+\3\b)/g, (m, pre, hashes, w) => `${pre}${hashes}${w}`);
  // Trim excessive blank lines
  t = t.replace(/\n{3,}/g, '\n\n');
  return t.trim();
}

// Intent parser for commands like "give question on python" or "python questions"
function parseQuestionIntent(text) {
  const q = (text || '').trim().toLowerCase();
  const questionRegex = /(give|ask|create|generate)\s+(me\s+)?(some\s+)?(interview\s+)?questions?\s*(on|about|for)?\s*(.+)/i;
  const m = q.match(questionRegex);
  if (m && m[6]) {
    const topic = sanitizeTopic(m[6]);
    return { type: 'generate_questions', topic, count: 5 };
  }

  // Single token tech like "python" or "react" should trigger question generation too
  if (q.split(/\s+/).length === 1 && q.length <= 20) {
    const topic = sanitizeTopic(q);
    return { type: 'generate_questions', topic, count: 5 };
  }

  return { type: 'chat' };
}

function sanitizeTopic(raw) {
  return String(raw || '')
    .replace(/[^a-z0-9+.#\-\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(on|about|for)\s+/i, '')
    .replace(/\s+questions?$/i, '')
    .toLowerCase();
}

async function handleTechQuestion(intent, level, originalQuestion, res) {
  try {
    const resumeData = { skills: [intent.topic], experience: '', currentRole: `${intent.topic} Developer` };
    const difficulty = level === 'junior' ? 'easy' : level === 'senior' ? 'hard' : 'medium';
    const items = await aiService.generateQuestions(resumeData, intent.topic + ' Developer', difficulty, intent.count);
    const list = (items || []).slice(0, intent.count).map((q) => `- ${q.question || q}`).join('\n');
    const text = list || `- What are your most-used ${intent.topic} features?\n- How do you structure a ${intent.topic} project?\n- Explain a recent ${intent.topic} challenge you solved.`;
    return res.json({ success: true, response: text, question: originalQuestion, intent: intent.type, technology: intent.topic, timestamp: new Date().toISOString() });
  } catch (err) {
    logger.warn('Tech question generation failed; falling back:', err.message);
    return res.json({ success: true, response: `Could not generate ${intent.topic} questions right now. Ask again or refine your request.`, question: originalQuestion, intent: intent.type });
  }
}

module.exports = {
  message,
  explain,
  ask,
  help,
  stream
};
