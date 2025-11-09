const express = require('express');
const { authenticate, optionalAuth } = require('../middleware/auth');
const aiService = require('../services/aiService');
const logger = require('../utils/logger');

const router = express.Router();

// @route   POST /api/chat/message
// @desc    Send a general chat message to AI
// @access  Public (with optional auth for enhanced features)
router.post('/message', optionalAuth, async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // For general chat, we'll create a more conversational AI response
    const response = await generateGeneralChatResponse(message, context, req.user);

    logger.info(`General chat response generated for message: ${message.substring(0, 50)}...`);

    res.json({
      success: true,
      response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Chat message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat message'
    });
  }
});

// @route   POST /api/chat/explain
// @desc    Get detailed explanation about a topic
// @access  Public
router.post('/explain', optionalAuth, async (req, res) => {
  try {
    const { topic, level = 'beginner' } = req.body;

    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required'
      });
    }

    const explanation = await generateTopicExplanation(topic, level);

    logger.info(`Topic explanation generated for: ${topic}`);

    res.json({
      success: true,
      explanation,
      topic,
      level,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Topic explanation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate explanation'
    });
  }
});

// @route   POST /api/chat/ask
// @desc    Smart AI response that adapts to question type
// @access  Public
router.post('/ask', optionalAuth, async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Question is required'
      });
    }

    const smartResponse = await generateSmartResponse(question, req.user);

    logger.info(`Smart response generated for: ${question.substring(0, 50)}...`);

    res.json({
      success: true,
      response: smartResponse,
      question,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Smart response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate response'
    });
  }
});

// @route   GET /api/chat/stream
// @desc    Stream AI response using Server-Sent Events
// @access  Public
router.get('/stream', optionalAuth, async (req, res) => {
  try {
    const { question } = req.query;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Question is required'
      });
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.status(200);

    // Send initial connection event
    res.write('data: {"type":"connected"}\n\n');

    try {
      await generateStreamingResponse(question, req.user, res);
    } catch (streamError) {
      logger.error('Streaming error:', streamError);
      res.write(`data: {"type":"error","message":"Failed to generate response"}\n\n`);
    }

    res.write('data: {"type":"done"}\n\n');
    res.end();

    logger.info(`Streaming response completed for: ${question.substring(0, 50)}...`);

  } catch (error) {
    logger.error('Stream setup error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to setup stream'
      });
    }
  }
});

// @route   POST /api/chat/help
// @desc    Get help with coding or technical questions
// @access  Public
router.post('/help', optionalAuth, async (req, res) => {
  try {
    const { question, language, difficulty = 'intermediate' } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Question is required'
      });
    }

    const help = await generateTechnicalHelp(question, language, difficulty);

    logger.info(`Technical help generated for: ${question.substring(0, 50)}...`);

    res.json({
      success: true,
      help,
      question,
      language,
      difficulty,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Technical help error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate technical help'
    });
  }
});

// Helper function to generate general chat responses
async function generateGeneralChatResponse(message, context = {}, user = null) {
  const systemPrompt = `You are a helpful AI assistant for programming, web development, and technology topics.

Format your responses clearly:
- Use bullet points (*) for lists of items
- Keep explanations concise and practical
- Use line breaks to separate different topics
- Be conversational but professional
- Avoid excessive technical jargon

${user ? `Responding to ${user.name}:` : 'General user conversation.'}`

  const response = await aiService.groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: message
      }
    ],
    temperature: 0.5,
    max_tokens: 500
  });

  return response.choices[0]?.message?.content || 
    'I apologize, but I had trouble processing your request. Please try again.';
}

// Helper function to generate topic explanations
async function generateTopicExplanation(topic, level) {
  const systemPrompt = `You are an expert technical educator. Provide concise explanations.

Tailor to ${level} level:
- Highlight essentials
- Offer examples sparingly
- Be brief and to the point`;

  const response = await aiService.groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: `Explain ${topic} for a ${level} level developer`
      }
    ],
    temperature: 0.4,
    max_tokens: 500
  });

  return response.choices[0]?.message?.content || 
    'I apologize, but I had trouble generating the explanation. Please try again.';
}

// Helper function to generate technical help
async function generateTechnicalHelp(question, language, difficulty) {
  const systemPrompt = `You are a senior developer mentor. Provide concise technical help.

Response guidelines:
- Clear, brief explanations
- Essential steps only
- Minimal examples

Focus on ${difficulty} level.`;

  const response = await aiService.groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: `${language ? `[${language}] ` : ''}${question}`
      }
    ],
    temperature: 0.3,
    max_tokens: 500
  });

  return response.choices[0]?.message?.content || 
    'I apologize, but I had trouble generating help for your question. Please try again.';
}

// Helper function to generate smart responses based on question type
async function generateSmartResponse(question, user = null) {
  // Check if the question is interview-related first
  const isInterviewRelated = await checkIfInterviewRelated(question);
  
  if (!isInterviewRelated) {
    return "I'm here only to assist with interview preparation. Let's focus on your career!";
  }

  // Determine the appropriate response length based on question complexity
  const questionLength = question.length;
  const isSimpleQuestion = questionLength < 50;
  const isComplexQuestion = questionLength > 150;
  
  let maxTokens;
  let responseStyle;
  
  if (isSimpleQuestion) {
    maxTokens = 200;
    responseStyle = "Give a brief, direct answer. 2-3 sentences maximum.";
  } else if (isComplexQuestion) {
    maxTokens = 500;
    responseStyle = "Provide a structured answer with key points. Use bullet points or numbered lists.";
  } else {
    maxTokens = 350;
    responseStyle = "Give a concise but complete answer. Include only essential information.";
  }

  const systemPrompt = `You are HireMate, an AI interview preparation assistant. You function strictly as an interview preparation coach with a professional, friendly tone — like a career coach or HR mentor.

${responseStyle}

FORMATTING GUIDELINES:
- Use bullet points (*) for lists and key points
- Write in a conversational, approachable tone
- Break up text with line breaks for readability
- Keep responses well-structured and easy to scan
- Use **bold** for emphasis on important terms

You ONLY respond to questions related to:
- Job interview preparation
- Resume building and career documents
- Career guidance and professional development
- HR and behavioral interview questions
- Technical interview questions for job positions
- Soft skills and communication tips for work
- Salary negotiation and workplace benefits

If someone asks about anything unrelated (cooking, entertainment, personal topics), politely decline with: "I'm here only to assist with interview preparation. Let's focus on your career!"

You ACCEPT and respond to meta-instructions like:
- "Give a short answer" / "Explain in detail" 
- "Summarize it" / "Repeat that"
- "Say in simple words" / "Clarify"

Professional Behavior:
- Maintain a friendly, encouraging tone like a career mentor
- Ask conversational follow-up questions when appropriate
- Examples: "Would you like to try another question?" or "Shall I explain that better?"
- Provide actionable, practical interview advice

${user ? `User: ${user.name}` : 'Anonymous user'}`

  const response = await aiService.groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: question
      }
    ],
    temperature: 0.3,
    max_tokens: maxTokens
  });

  return response.choices[0]?.message?.content || 
    'I apologize, but I had trouble processing your question. Please try again.';
}

// Helper function to check if a question is interview-related or a meta-instruction
async function checkIfInterviewRelated(question) {
  const questionLower = question.toLowerCase().trim();
  
  // Meta-instructions that should always be allowed
  const metaInstructions = [
    'give a short answer', 'short answer', 'briefly', 'in brief', 'summarize',
    'explain in detail', 'detailed', 'more details', 'elaborate', 'expand',
    'summarize it', 'summary', 'sum up', 'in summary',
    'repeat that', 'say again', 'repeat', 'once more',
    'say in simple words', 'simple words', 'simplify', 'simple terms', 'explain simply',
    'rephrase', 'differently', 'another way', 'clarify', 'make it clear'
  ];
  
  // Check for meta-instructions first
  const isMetaInstruction = metaInstructions.some(meta => 
    questionLower.includes(meta)
  );
  
  if (isMetaInstruction) {
    return true; // Allow meta-instructions
  }

  // Interview and career-related keywords
  const interviewKeywords = [
    // Direct interview terms
    'interview', 'job', 'career', 'position', 'role', 'hiring', 'employer', 'candidate',
    'resume', 'cv', 'cover letter', 'application', 'apply', 'recruitment', 'recruiter',
    
    // Interview question patterns
    'tell me about yourself', 'why should we hire you', 'strengths', 'weaknesses',
    'why do you want', 'where do you see yourself', 'greatest achievement',
    'challenge', 'conflict', 'teamwork', 'leadership', 'management',
    'salary', 'compensation', 'benefits', 'promotion', 'negotiate',
    
    // Technical interview terms
    'coding interview', 'technical interview', 'system design', 'algorithm',
    'data structure', 'behavioral question', 'situational question',
    'technical skills', 'programming interview', 'coding challenge',
    
    // Professional development & soft skills
    'professional development', 'skill development', 'career growth',
    'workplace', 'colleague', 'supervisor', 'manager', 'employee',
    'performance review', 'feedback', 'improvement', 'communication skills',
    'soft skills', 'presentation skills', 'public speaking', 'networking',
    
    // HR and behavioral topics
    'hr questions', 'behavioral', 'situational', 'work experience',
    'previous job', 'company culture', 'work environment', 'team player',
    'problem solving', 'time management', 'stress management'
  ];
  
  // Check for direct keyword matches
  const hasKeyword = interviewKeywords.some(keyword => 
    questionLower.includes(keyword.toLowerCase())
  );
  
  if (hasKeyword) {
    return true;
  }
  
  // Use AI to determine if it's interview-related (more sophisticated check)
  try {
    const response = await aiService.groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are a classifier for an interview preparation assistant. Determine if a question is related to job interviews, career development, or professional topics.
          
          Respond ONLY with "YES" if the question is about:
          - Job interview preparation and questions
          - Resume/CV writing and career documents
          - Career advice, growth, and development
          - HR and behavioral interview topics
          - Technical interview preparation
          - Workplace situations and professional behavior
          - Soft skills and communication for work
          - Salary negotiation and benefits
          - Professional skills and competencies
          
          Respond ONLY with "NO" if the question is about:
          - Personal hobbies, entertainment, or lifestyle
          - General knowledge (history, science, geography, etc.)
          - Cooking, recipes, or food
          - Sports, games, or entertainment
          - Personal relationships (non-professional)
          - Technical topics unrelated to job interviews
          - Random questions not related to career/professional development
          
          Be strict - only YES for genuine career/interview/professional topics.`
        },
        {
          role: 'user',
          content: `Is this question related to job interviews, career development, or professional topics? Question: "${question}"`
        }
      ],
      temperature: 0,
      max_tokens: 10
    });
    
    const aiResponse = response.choices[0]?.message?.content?.trim().toUpperCase();
    return aiResponse === 'YES';
  } catch (error) {
    logger.error('Error in AI classification:', error);
    // Fallback to keyword-based detection only
    return hasKeyword;
  }
}

// Helper function to generate streaming response using SSE
async function generateStreamingResponse(question, user = null, res) {
  // Check if the question is interview-related first
  const isInterviewRelated = await checkIfInterviewRelated(question);
  
  if (!isInterviewRelated) {
    const rejectionMessage = "I'm here only to assist with interview preparation. Let's focus on your career!";
    
    const data = JSON.stringify({
      type: 'chunk',
      content: rejectionMessage
    });
    res.write(`data: ${data}\n\n`);
    return;
  }

  const questionLength = question.length;
  const isSimpleQuestion = questionLength < 50;
  const isComplexQuestion = questionLength > 150;
  
  let maxTokens;
  let responseStyle;
  
  if (isSimpleQuestion) {
    maxTokens = 200;
    responseStyle = "Give a brief, direct answer. 2-3 sentences maximum.";
  } else if (isComplexQuestion) {
    maxTokens = 500;
    responseStyle = "Provide a structured answer with key points. Use bullet points or numbered lists.";
  } else {
    maxTokens = 350;
    responseStyle = "Give a concise but complete answer. Include only essential information.";
  }

  const systemPrompt = `You are HireMate, an AI interview preparation assistant. You ONLY help with job interview related topics.

${responseStyle}

Interview Focus Areas:
- Common interview questions and best answers
- Resume and career advice
- Interview preparation strategies
- Technical interview practice
- Behavioral interview guidance
- Salary negotiation tips
- Professional development advice

Guidelines:
- Be concise and clear
- Use bullet points for lists
- Provide actionable interview advice
- Focus on practical interview preparation

${user ? `User: ${user.name}` : 'Anonymous user'}`;

  try {
    // Create streaming completion
    const stream = await aiService.groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: question
        }
      ],
      temperature: 0.3,
      max_tokens: maxTokens,
      stream: true
    });

    // Process streaming response
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        // Send chunk to client via SSE
        const data = JSON.stringify({
          type: 'chunk',
          content: content
        });
        res.write(`data: ${data}\n\n`);
      }
    }
  } catch (error) {
    logger.error('Streaming AI error:', error);
    // Fallback: send complete response at once
    const fallbackResponse = await generateSmartResponse(question, user);
    const data = JSON.stringify({
      type: 'chunk',
      content: fallbackResponse
    });
    res.write(`data: ${data}\n\n`);
  }
}

module.exports = router;
