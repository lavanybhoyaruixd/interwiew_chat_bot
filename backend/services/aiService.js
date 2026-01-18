const Groq = require('groq-sdk');
const domainService = require('./domainService');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    const apiKey = process.env.GROQ_API_KEY;

    // Provide a minimal mock when API key is missing so the app still works for local smoke tests
    if (!apiKey) {
      logger.warn('GROQ_API_KEY is missing; using mock AI responses for local testing');

      const mockCreate = async (options) => {
        const mockText = options?.messages?.find(m => m.role === 'user')?.content
          ? `Mock: ${options.messages.find(m => m.role === 'user').content}`
          : 'Mock response';

        if (options?.stream) {
          // Minimal async iterator that yields one chunk
          return {
            async *[Symbol.asyncIterator]() {
              yield { choices: [{ delta: { content: mockText } }] };
            }
          };
        }

        return { choices: [{ message: { content: mockText } }] };
      };

      this.groq = {
        chat: {
          completions: {
            create: mockCreate
          }
        }
      };
    } else {
      const client = new Groq({ apiKey });

      // Safety wrapper: if the provider call fails (401, timeout, etc),
      // return a lightweight mock response so routes don't crash.
      // Preserve streaming behavior when options.stream is truthy.
      const originalCreate = client.chat?.completions?.create?.bind(client.chat?.completions);

      const safeCreate = async (options) => {
        try {
          if (!originalCreate) throw new Error('Groq create method unavailable');
          return await originalCreate(options);
        } catch (err) {
          logger.error('Groq API failed, returning mock fallback in aiService:', err && err.message ? err.message : err);

          const mockText = options?.messages?.find(m => m.role === 'user')?.content
            ? `Mock (fallback): ${options.messages.find(m => m.role === 'user').content}`
            : 'Mock response (fallback)';

          // If the caller requested a stream, return an async iterable that yields one chunk
          if (options && options.stream) {
            return {
              async *[Symbol.asyncIterator]() {
                yield { choices: [{ delta: { content: mockText } }] };
              }
            };
          }

          return { choices: [{ message: { content: mockText } }] };
        }
      };

      // Attach safe wrapper to use below in the service
      client.chat = client.chat || {};
      client.chat.completions = client.chat.completions || {};
      client.chat.completions.create = safeCreate;

      this.groq = client;
    }
  }

  // Generate interview questions based on resume and job role
  async generateQuestions(resumeData, jobRole, difficulty = 'medium', count = 5) {
    try {
      const prompt = this.buildQuestionGenerationPrompt(resumeData, jobRole, difficulty, count);
      
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are an expert interview coach and technical recruiter with deep knowledge of various industries and job roles. Generate realistic, relevant interview questions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const questions = this.parseGeneratedQuestions(response.choices[0].message.content);
      logger.info(`Generated ${questions.length} questions for role: ${jobRole}`);
      
      return questions;
    } catch (error) {
      logger.error('Error generating questions:', error);
      throw new Error('Failed to generate interview questions');
    }
  }

  // Analyze user's answer and provide feedback
  async analyzeAnswer(question, userAnswer, jobRole, difficulty = 'medium') {
    try {
      const prompt = this.buildAnalysisPrompt(question, userAnswer, jobRole, difficulty);
      
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are an expert interview coach providing detailed, constructive feedback on interview answers. Be specific, actionable, and encouraging while maintaining professional standards.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      });

      const analysis = this.parseAnalysisResponse(response.choices[0].message.content);
      logger.info(`Analyzed answer for question: ${question.substring(0, 50)}...`);
      
      return analysis;
    } catch (error) {
      logger.error('Error analyzing answer:', error);
      throw new Error('Failed to analyze answer');
    }
  }

  // Generate follow-up questions based on user's answer
  async generateFollowUp(originalQuestion, userAnswer, context = {}) {
    try {
      const prompt = `
        Original Question: "${originalQuestion}"
        User's Answer: "${userAnswer}"
        
        Based on the user's response, generate 2-3 relevant follow-up questions that would:
        1. Dive deeper into their experience
        2. Test their understanding further
        3. Explore potential gaps or strengths mentioned
        
        Return only the questions, one per line, without numbering.
      `;

      const response = await this.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are an experienced interviewer generating thoughtful follow-up questions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 300
      });

      return response.choices[0].message.content
        .split('\n')
        .filter(q => q.trim().length > 0)
        .map(q => q.trim());
    } catch (error) {
      logger.error('Error generating follow-up questions:', error);
      return [];
    }
  }

  // Extract skills and information from resume text
  async extractResumeInfo(resumeText) {
    try {
      const prompt = `
        Analyze the following resume text and extract key information in JSON format:
        
        Resume Text:
        "${resumeText}"
        
        Please extract and return the following information in valid JSON format:
        {
          "skills": ["skill1", "skill2", ...],
          "experience": "brief summary of work experience",
          "education": "education background",
          "currentRole": "current or most recent job title",
          "industries": ["industry1", "industry2", ...],
          "yearsOfExperience": "estimated years",
          "keyAchievements": ["achievement1", "achievement2", ...]
        }
      `;

      const response = await this.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a resume analysis expert. Extract information accurately and return valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1000
      });

      // Be resilient to models returning prose with JSON; try to extract the first JSON object
      const content = response.choices[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const extractedInfo = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
      logger.info('Successfully extracted resume information');
      
      return extractedInfo;
    } catch (error) {
      logger.error('Error extracting resume info:', error);
      // Return default structure if parsing fails
      return {
        skills: [],
        experience: 'Unable to extract experience',
        education: 'Unable to extract education',
        currentRole: 'Not specified',
        industries: [],
        yearsOfExperience: '0',
        keyAchievements: []
      };
    }
  }

  // Build prompt for question generation
  buildQuestionGenerationPrompt(resumeData, jobRole, difficulty, count) {
    return `
      Generate ${count} interview questions for a ${jobRole} position.
      
      Candidate Background:
      - Skills: ${resumeData.skills?.join(', ') || 'Not specified'}
      - Experience: ${resumeData.experience || 'Not specified'}
      - Current Role: ${resumeData.currentRole || 'Not specified'}
      
      Requirements:
      - Difficulty: ${difficulty}
      - Mix of behavioral, technical, and situational questions
      - Questions should be relevant to the job role and candidate's background
      - Include some questions that test specific skills mentioned in the resume
      
      Format each question as:
      CATEGORY: [behavioral/technical/situational]
      DIFFICULTY: [easy/medium/hard]
      QUESTION: [the actual question]
      
      ---
    `;
  }

  // Build prompt for answer analysis
  buildAnalysisPrompt(question, userAnswer, jobRole, difficulty) {
    return `
      Analyze this interview answer and provide detailed feedback:
      
      Position: ${jobRole}
      Question: "${question}"
      Answer: "${userAnswer}"
      Difficulty Level: ${difficulty}
      
      Please provide feedback in the following format:
      
      SCORE: [0-100]
      
      STRENGTHS:
      - [specific strength 1]
      - [specific strength 2]
      
      AREAS FOR IMPROVEMENT:
      - [specific improvement 1]
      - [specific improvement 2]
      
      FEEDBACK:
      [Detailed constructive feedback paragraph]
      
      SUGGESTED_ANSWER:
      [A better version of the answer that incorporates best practices]
    `;
  }

  // Parse generated questions from AI response
  parseGeneratedQuestions(response) {
    const questions = [];
    const questionBlocks = response.split('---').filter(block => block.trim());
    
    questionBlocks.forEach(block => {
      const lines = block.trim().split('\n');
      let category = 'general';
      let difficulty = 'medium';
      let question = '';
      
      lines.forEach(line => {
        if (line.startsWith('CATEGORY:')) {
          category = line.replace('CATEGORY:', '').trim().toLowerCase();
        } else if (line.startsWith('DIFFICULTY:')) {
          difficulty = line.replace('DIFFICULTY:', '').trim().toLowerCase();
        } else if (line.startsWith('QUESTION:')) {
          question = line.replace('QUESTION:', '').trim();
        }
      });
      
      if (question) {
        questions.push({
          question,
          category,
          difficulty,
          subcategory: 'ai-generated',
          createdBy: 'ai-generated'
        });
      }
    });
    
    return questions;
  }

  // Generate domain-specific chat response (for the chatbot)
  async generateDomainChatResponse(userMessage, domain = null, userLevel = 'mid', conversationHistory = []) {
    try {
      // Get domain-specific system prompt
      const systemPrompt = domain 
        ? domainService.generateSystemPrompt(domain, userLevel)
        : domainService.getDefaultSystemPrompt();

      // Build conversation messages
      const messages = [
        {
          role: 'system',
          content: systemPrompt
        }
      ];

      // Add conversation history (last 10 messages for context)
      const recentHistory = conversationHistory.slice(-10);
      recentHistory.forEach(msg => {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      });

      // Add current user message
      messages.push({
        role: 'user',
        content: userMessage
      });

      const response = await this.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1500
      });

      const aiResponse = response.choices[0]?.message?.content || 
        'I apologize, but I had trouble processing your request. Please try again.';
      
      logger.info(`Generated domain chat response for domain: ${domain || 'general'}`);
      return aiResponse;

    } catch (error) {
      logger.error('Error generating domain chat response:', error);
      throw error;
    }
  }

  // Get domain selection response
  async getDomainSelectionResponse() {
    const domains = domainService.getAllDomains();
    const domainList = domains.map((d, index) => 
      `${index + 1}. **${d.name}** - ${d.description}`
    ).join('\n');

    return `Welcome to HireMate! 👋 I'm your AI interview coach, and I'm here to help you prepare for your dream job.

To provide you with the most relevant interview experience, please choose your domain:

${domainList}

Simply tell me the number or name of your domain, and we'll start your personalized interview preparation!

You can also type 'general' if you'd prefer a general interview practice.`;
  }

  // Get experience level selection response
  async getExperienceLevelResponse(domain) {
    const domainInfo = domainService.getDomain(domain);
    const domainName = domainInfo ? domainInfo.name : 'your chosen field';

    return `Great choice! You've selected **${domainName}**. 🎯

Now, to tailor the interview questions to your experience level, please select:

1. **Junior** (0-2 years of experience)
2. **Mid-level** (2-5 years of experience)  
3. **Senior** (5+ years of experience)
4. **Lead/Principal** (Leadership experience)

Which level best describes your experience in ${domainName}?`;
  }

  // Parse analysis response from AI
  parseAnalysisResponse(response) {
    const analysis = {
      score: 70, // default score
      feedback: '',
      strengths: [],
      improvements: [],
      suggestedAnswer: ''
    };
    
    const lines = response.split('\n');
    let currentSection = '';
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('SCORE:')) {
        const scoreMatch = trimmedLine.match(/\d+/);
        if (scoreMatch) {
          analysis.score = parseInt(scoreMatch[0]);
        }
      } else if (trimmedLine.startsWith('STRENGTHS:')) {
        currentSection = 'strengths';
      } else if (trimmedLine.startsWith('AREAS FOR IMPROVEMENT:')) {
        currentSection = 'improvements';
      } else if (trimmedLine.startsWith('FEEDBACK:')) {
        currentSection = 'feedback';
      } else if (trimmedLine.startsWith('SUGGESTED_ANSWER:')) {
        currentSection = 'suggestedAnswer';
      } else if (trimmedLine.startsWith('- ') && (currentSection === 'strengths' || currentSection === 'improvements')) {
        const item = trimmedLine.substring(2);
        analysis[currentSection].push(item);
      } else if (currentSection === 'feedback' || currentSection === 'suggestedAnswer') {
        if (trimmedLine) {
          analysis[currentSection] += (analysis[currentSection] ? ' ' : '') + trimmedLine;
        }
      }
    });
    
    return analysis;
  }
}

module.exports = new AIService();
