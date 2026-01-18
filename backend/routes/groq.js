const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const enhancedAI = require('../services/enhancedAiService');
const { getResumeText } = require('../services/resumeContext');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const logger = require('../utils/logger');

// Configure multer for PDF upload (for question generation)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Stream chat completion via Groq using shared aiService client
router.post('/groq/stream', async (req, res) => {
  const { messages = [] } = req.body || {};

  // Prepare SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Lightweight keepalive/connected ping for clients
  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

  try {
    // Inject a scoped system prompt if caller didn't include one
    const hasSystem = Array.isArray(messages) && messages.some(m => m.role === 'system');
    const systemPrompt = `You are HireMate, an AI assistant for tech interviews, coding help, and career guidance.\n\nGuidelines:\n- Be concise, use bullets when helpful\n- Focus on practical, interview-ready insights\n- Keep responses on-topic (tech/career)\n- Use simple Markdown formatting`;

    const finalMessages = hasSystem
      ? messages
      : [{ role: 'system', content: systemPrompt }, ...messages];

    // Optional: reject clearly off-topic prompts early (non-fatal)
    try {
      const userText = finalMessages.slice().reverse().find(m => m.role === 'user')?.content || '';
      const ok = await enhancedAI.checkIfInterviewRelated(userText);
      if (!ok) {
        const notice = 'I specialize in interview and tech-related topics. Please ask about jobs, coding, or career prep!';
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: notice } }] })}\n\n`);
        res.write('data: [DONE]\n\n');
        return res.end();
      }
    } catch (_) {
      // If classification fails, continue streaming normally
    }

    // Stream from Groq using the shared safe client
    const stream = await aiService.groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: finalMessages,
      temperature: 0.4,
      max_tokens: 600,
      stream: true
    });

    const deadline = Date.now() + (parseInt(process.env.REQUEST_TIMEOUT_MS) || 30000);
    for await (const chunk of stream) {
      if (Date.now() > deadline) break;
      const content = chunk?.choices?.[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`);
      }
    }
  } catch (error) {
    logger.error('Error in Groq stream:', error && error.message ? error.message : error);
    // Send error as SSE data so the client can surface it
    res.write(`data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`);
  } finally {
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

/**
 * @route   POST /api/groq/questions
 * @desc    Generate interview questions from resume and job role
 * @access  Public
 */
router.post('/groq/questions', upload.single('resume'), async (req, res) => {
  try {
    let resumeText = '';
    let resumeData = {};

    // Option 1: Resume uploaded in this request
    if (req.file) {
      try {
        const pdfData = await pdfParse(req.file.buffer);
        resumeText = pdfData.text.trim();
      } catch (pdfError) {
        logger.error('PDF parsing error:', pdfError);
        return res.status(400).json({
          success: false,
          message: 'Failed to parse PDF file'
        });
      }
    } 
    // Option 2: Resume text sent in body
    else if (req.body.resume && typeof req.body.resume === 'string') {
      resumeText = req.body.resume.trim();
    }
    // Option 3: Try to get from resume context (if user already uploaded via ATS analyzer)
    else {
      resumeText = getResumeText();
    }

    const jobRole = req.body.jobRole || 'Software Engineer';
    let questionList = [];

    // If no resume provided, generate random tech interview questions
    if (!resumeText || resumeText.length < 50) {
      logger.info('No resume provided, generating random tech interview questions');
      
      // Generate random tech interview questions using Groq
      const randomQuestionsPrompt = `Generate 10-15 random technical interview questions for software engineers and tech professionals. 
      Include a diverse mix of:
      - Data structures and algorithms questions
      - System design questions
      - Programming language concepts (JavaScript, Python, Java, etc.)
      - Behavioral interview questions
      - Problem-solving scenarios
      - Technical knowledge questions
      - Database and SQL questions
      - API and web development questions
      
      Return ONLY the questions, one per line. Each question should be a complete sentence ending with a question mark.
      Do not include any explanations, numbering, or additional text - just the questions.
      Make them diverse, relevant, and commonly asked in real tech interviews.`;

      try {
        const response = await aiService.groq.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'You are an expert technical interviewer. Generate realistic, diverse tech interview questions.'
            },
            {
              role: 'user',
              content: randomQuestionsPrompt
            }
          ],
          temperature: 0.8, // Higher temperature for more variety
          max_tokens: 2000
        });

        const generatedText = response.choices[0]?.message?.content || '';
        
        // Parse questions from the response - try multiple strategies
        let lines = generatedText.split('\n').filter(line => line.trim().length > 0);
        
        // Strategy 1: Split by newlines and clean
        questionList = lines
          .map(line => {
            // Remove numbering (1., 2., 1), etc.) and bullet points
            let cleaned = line.replace(/^[\d\w]+[\.\)\-\*]\s*/, '').trim();
            // Remove markdown formatting
            cleaned = cleaned.replace(/^[-*]\s*/, '').trim();
            return cleaned;
          })
          .filter(q => {
            // Keep only lines that look like questions (end with ? or are substantial)
            return q.length > 15 && (q.endsWith('?') || q.length > 30);
          })
          .slice(0, 15);

        // Strategy 2: If we got fewer than 10, try splitting by question marks
        if (questionList.length < 10) {
          const sentences = generatedText.split(/\?+/).filter(s => s.trim().length > 20);
          const additionalQuestions = sentences
            .map(s => {
              let cleaned = s.trim().replace(/^[\d\w]+[\.\)\-\*]\s*/, '').trim();
              cleaned = cleaned.replace(/^[-*]\s*/, '').trim();
              return cleaned + '?'; // Add question mark back
            })
            .filter(q => q.length > 15 && q.length < 250)
            .slice(0, 15 - questionList.length);
          
          questionList = [...questionList, ...additionalQuestions].slice(0, 15);
        }

        // Strategy 3: Ensure we have at least 10 questions with fallback
        if (questionList.length < 10) {
          const fallbackQuestions = [
            'Explain the difference between a stack and a queue.',
            'What is the time complexity of binary search?',
            'How would you design a URL shortener like bit.ly?',
            'Explain what RESTful API means.',
            'What is the difference between SQL and NoSQL databases?',
            'How does a hash table work?',
            'Explain the concept of recursion with an example.',
            'What is the difference between synchronous and asynchronous programming?',
            'How would you optimize a slow database query?',
            'Explain the difference between HTTP and HTTPS.',
            'What is object-oriented programming?',
            'How do you handle errors in your code?',
            'Explain the concept of dependency injection.',
            'What is the difference between a process and a thread?',
            'How would you implement a caching system?'
          ];
          questionList = [...questionList, ...fallbackQuestions].slice(0, 15);
        }
        
        // Final cleanup: ensure all questions end with ?
        questionList = questionList.map(q => {
          q = q.trim();
          if (!q.endsWith('?') && !q.endsWith('.') && !q.endsWith('!')) {
            q += '?';
          }
          return q;
        });
      } catch (randomError) {
        logger.error('Error generating random questions:', randomError);
        // Fallback to default questions
        questionList = [
          'Tell me about yourself and your technical background.',
          'What programming languages are you most comfortable with?',
          'Explain a challenging technical problem you solved recently.',
          'How do you approach debugging a complex issue?',
          'What is your experience with version control systems like Git?',
          'Describe a time when you had to learn a new technology quickly.',
          'How do you ensure code quality in your projects?',
          'Explain the difference between frontend and backend development.',
          'What is your experience with databases?',
          'How do you handle working under tight deadlines?',
          'Describe your experience with testing and quality assurance.',
          'What is your approach to code reviews?',
          'How do you stay updated with the latest technology trends?',
          'Explain a project you are particularly proud of.',
          'What are your thoughts on agile development methodologies?'
        ];
      }
    } else {
      // Resume provided - generate personalized questions
      // Extract resume info using AI service
      try {
        resumeData = await aiService.extractResumeInfo(resumeText);
      } catch (extractError) {
        logger.warn('Failed to extract resume info, using basic structure:', extractError);
        resumeData = {
          skills: [],
          experience: resumeText.substring(0, 500),
          currentRole: 'Not specified'
        };
      }

      // Generate questions using AI service
      try {
        const questions = await aiService.generateQuestions(resumeData, jobRole, 'medium', 12);
        
        // Format questions as simple array of strings for frontend
        if (Array.isArray(questions)) {
          questionList = questions.map(q => {
            if (typeof q === 'string') {
              return q;
            } else if (q && typeof q === 'object' && q.question) {
              return q.question;
            } else {
              return String(q);
            }
          }).filter(q => q && q.trim().length > 0);
        } else {
          throw new Error('Invalid questions format returned from AI service');
        }
        
        // Ensure we have at least some questions
        if (questionList.length === 0) {
          throw new Error('No questions generated');
        }
      } catch (generateError) {
        logger.error('Error generating personalized questions:', generateError);
        // Fallback to basic questions based on resume text
        questionList = [
          `Based on your resume, tell me about your experience with ${resumeData.skills?.[0] || 'your technical skills'}.`,
          `Can you walk me through a project from your resume that you're particularly proud of?`,
          `What motivated you to pursue a career in ${jobRole}?`,
          `How does your previous experience prepare you for this ${jobRole} role?`,
          `Describe a challenging situation you faced in your previous role and how you handled it.`,
          `What are your strongest technical skills based on your experience?`,
          `How do you stay current with industry trends and technologies?`,
          `Tell me about a time when you had to learn a new technology quickly for a project.`,
          `What are your career goals and how does this ${jobRole} position align with them?`,
          `Based on your background, what unique value would you bring to this role?`,
          `Describe your experience working in a team environment.`,
          `What is your approach to problem-solving when faced with a complex technical challenge?`
        ];
      }
    }

    // Ensure we have questions to return
    if (!questionList || questionList.length === 0) {
      logger.warn('No questions generated, using fallback questions');
      questionList = [
        'Tell me about yourself and your background.',
        'Why are you interested in this position?',
        'What are your greatest strengths?',
        'What is your biggest weakness?',
        'Why do you want to leave your current job?',
        'Where do you see yourself in 5 years?',
        'Why should we hire you?',
        'Can you walk me through your resume?',
        'What are your salary expectations?',
        'Do you have any questions for us?'
      ];
    }

    res.json({
      success: true,
      questions: questionList,
      count: questionList.length
    });
  } catch (error) {
    logger.error('Error generating questions:', error);
    logger.error('Error stack:', error.stack);
    
    // Return fallback questions even on error
    const fallbackQuestions = [
      'Tell me about yourself and your background.',
      'Why are you interested in this position?',
      'What are your greatest strengths?',
      'What is your biggest weakness?',
      'Why do you want to leave your current job?',
      'Where do you see yourself in 5 years?',
      'Why should we hire you?',
      'Can you walk me through your resume?',
      'What are your salary expectations?',
      'Do you have any questions for us?'
    ];
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate personalized questions, but here are some general questions to practice with',
      questions: fallbackQuestions,
      count: fallbackQuestions.length,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
