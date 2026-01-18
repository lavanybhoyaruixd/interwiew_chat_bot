/* eslint-env node */
/* eslint-disable no-undef */
const Groq = require('groq-sdk');
// const axios = require('axios'); // (reserved for future external enrichment calls)
// const domainService = require('./domainService'); // used in system prompt builders
const logger = require('../utils/logger');

class EnhancedAIService {
  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      logger.warn('GROQ_API_KEY is missing; using mock AI responses for local testing (enhanced)');

      const mockCreate = async (options) => {
        const mockText = options?.messages?.find(m => m.role === 'user')?.content
          ? `Mock: ${options.messages.find(m => m.role === 'user').content}`
          : 'Mock response';

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

      // Safety wrapper similar to aiService: return mock fallback on errors.
      const originalCreate = client.chat?.completions?.create?.bind(client.chat?.completions);
      const safeCreate = async (options) => {
        try {
          if (!originalCreate) throw new Error('Groq create method unavailable');
          return await originalCreate(options);
        } catch (err) {
          logger.error('Groq API failed, returning mock fallback in enhancedAiService:', err && err.message ? err.message : err);
          const mockText = options?.messages?.find(m => m.role === 'user')?.content
            ? `Mock (fallback): ${options.messages.find(m => m.role === 'user').content}`
            : 'Mock response (fallback)';

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

      client.chat = client.chat || {};
      client.chat.completions = client.chat.completions || {};
      client.chat.completions.create = safeCreate;

      this.groq = client;
    }
  }

  // Get current date and time information
  getCurrentContext() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.toLocaleString('default', { month: 'long' });
    const currentDate = now.toDateString();
    
    return {
      date: currentDate,
      year: currentYear,
      month: currentMonth,
      time: now.toISOString(),
      isWeekend: now.getDay() === 0 || now.getDay() === 6
    };
  }

  // Get trending tech topics (simulated - can be replaced with real APIs)
  async getTrendingTechTopics() {
    // This is a simulated trending topics - in production, you'd call real APIs
    const trendingTopics = [
      'AI/Machine Learning',
      'Cloud Computing (AWS, Azure, GCP)',
      'DevOps and CI/CD',
      'Microservices Architecture',
      'React and Next.js',
      'Python for Data Science',
      'Kubernetes and Docker',
      'TypeScript',
      'Serverless Computing',
      'Cybersecurity'
    ];

    return trendingTopics;
  }

  // Generate enhanced interview questions with current trends
  async generateEnhancedQuestions(resumeData, jobRole, difficulty = 'medium', count = 5) {
    try {
      const currentContext = this.getCurrentContext();
      const trendingTopics = await this.getTrendingTechTopics();
      
      const prompt = this.buildEnhancedQuestionPrompt(
        resumeData, 
        jobRole, 
        difficulty, 
        count, 
        currentContext, 
        trendingTopics
      );
      
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are an expert interview coach and technical recruiter with deep knowledge of current industry trends and technologies as of ${currentContext.year}. 
            
            Generate realistic, relevant interview questions that reflect current industry standards and trending technologies. 
            Consider what's actually being used in companies right now, not outdated practices.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500
      });

      const questions = this.parseGeneratedQuestions(response.choices[0].message.content);
      logger.info(`Generated ${questions.length} enhanced questions for role: ${jobRole}`);
      
      return questions;
    } catch (error) {
      logger.error('Error generating enhanced questions:', error);
      throw new Error('Failed to generate enhanced interview questions');
    }
  }

  // Enhanced answer analysis with current industry standards
  async analyzeAnswerWithCurrentTrends(question, userAnswer, jobRole, difficulty = 'medium') {
    try {
      const currentContext = this.getCurrentContext();
      const trendingTopics = await this.getTrendingTechTopics();
      
      const prompt = this.buildEnhancedAnalysisPrompt(
        question, 
        userAnswer, 
        jobRole, 
        difficulty, 
        currentContext,
        trendingTopics
      );
      
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are an expert interview coach with knowledge of current industry trends and best practices as of ${currentContext.year}. 
            
            Provide feedback that reflects current market expectations, modern technologies, and industry standards. 
            Consider what employers are actually looking for in ${currentContext.year}.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const analysis = this.parseAnalysisResponse(response.choices[0].message.content);
      logger.info(`Analyzed answer with current trends for question: ${question.substring(0, 50)}...`);
      
      return analysis;
    } catch (error) {
      logger.error('Error analyzing answer with trends:', error);
      throw new Error('Failed to analyze answer with current trends');
    }
  }

  // Check if a question is interview/career/tech-related
  async checkIfInterviewRelated(question) {
    const q = (question || '').toLowerCase().trim();

    // Allow only known short tech tokens; otherwise do not auto-allow
    const shortTokens = new Set([
      'python','java','javascript','typescript','js','ts','c','c++','cpp','go','golang','rust','sql','html','css','react','next','next.js','node','node.js','express','docker','kubernetes','k8s','aws','azure','gcp','mongo','mongodb','mysql','postgres','postgresql','leetcode','dsa','big-o','ai','ml','nlp','llm','devops','git','github','gitlab'
    ]);
    if (q.split(/\s+/).length <= 2 && shortTokens.has(q)) return true;

    const allowKeywords = [
      // interview / career
      'interview', 'resume', 'cv', 'cover letter', 'salary', 'offer', 'negotiation', 'behavioural', 'behavioral', 'star method', 'hr', 'recruiter', 'career', 'job', 'hiring', 'onsite', 'phone screen',
      // programming / tech
      'algorithm', 'data structure', 'system design', 'database', 'sql', 'api', 'frontend', 'backend', 'fullstack', 'devops', 'cloud', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'python', 'javascript', 'typescript', 'java', 'c++', 'react', 'next.js', 'node', 'express', 'microservices', 'testing', 'unit test', 'debug', 'performance', 'security', 'oauth', 'jwt', 'encryption'
    ];

    if (allowKeywords.some(k => q.includes(k))) return true;

    // Blocklist: small examples of off-topic
    const blockKeywords = [
      'recipe', 'cooking', 'travel', 'tourism', 'vacation', 'relationship', 'dating', 'movie', 'music', 'celebrity', 'sports score', 'astrology', 'horoscope', 'lottery', 'gambling', 'medical advice', 'diagnosis', 'therapy'
    ];
    if (blockKeywords.some(k => q.includes(k))) return false;

    // Small talk and pleasantries -> decline
    const smallTalkPatterns = [
      /^(hi|hello|hey|greetings|good (morning|afternoon|evening))\b/i,
      /^(thanks|thank you|thx|ty)\b/i,
      /^(how are you|how('s| is) it going|what's up|sup|wassup)\b/i,
      /^(bye|goodbye|see you|cya)\b/i,
      /^what('s| is) the (weather|temperature)\b/i
    ];
    if (smallTalkPatterns.some(re => re.test(q))) return false;

    // Default: allow but keep system prompt to constrain response
    return true;
  }

  // Generate contextual chat responses with real-time awareness
  async generateContextualChatResponse(userMessage, domain = null, userLevel = 'mid', conversationHistory = []) {
    try {
      // Check if the question is interview-related first
      const isInterviewRelated = await this.checkIfInterviewRelated(userMessage);
      
      if (!isInterviewRelated) {
        return "> \"I specialize in interview and tech-related topics 😊. Please ask me something about careers, coding, or job preparation!\"";
      }

      const currentContext = this.getCurrentContext();
      const trendingTopics = await this.getTrendingTechTopics();
      
      // Enhanced system prompt with current context - focused on interviews
      const systemPrompt = this.buildInterviewFocusedSystemPrompt(
        domain, 
        userLevel, 
        currentContext, 
        trendingTopics
      );

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

      // Add current user message with context
      messages.push({
        role: 'user',
        content: `[Current Date: ${currentContext.date}] ${userMessage}`
      });

      const response = await this.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1500
      });

      const aiResponse = response.choices[0]?.message?.content || 
        'I apologize, but I had trouble processing your request. Please try again.';
      
      logger.info(`Generated interview-focused contextual chat response for domain: ${domain || 'general'}`);
      return aiResponse;

    } catch (error) {
      logger.error('Error generating contextual chat response:', error);
      throw error;
    }
  }

  // Build enhanced question generation prompt
  buildEnhancedQuestionPrompt(resumeData, jobRole, difficulty, count, currentContext, trendingTopics) {
    return `
      Current Date: ${currentContext.date}
      Current Year: ${currentContext.year}
      
      Generate ${count} modern, relevant interview questions for a ${jobRole} position based on current industry trends and standards.
      
      Candidate Background:
      - Skills: ${resumeData.skills?.join(', ') || 'Not specified'}
      - Experience: ${resumeData.experience || 'Not specified'}
      - Current Role: ${resumeData.currentRole || 'Not specified'}
      
      Current Industry Trends (${currentContext.year}):
      ${trendingTopics.map(topic => `- ${topic}`).join('\n')}
      
      Requirements:
      - Difficulty: ${difficulty}
      - Mix of behavioral, technical, and situational questions
      - Include questions about current technologies and practices
      - Consider what employers are actually looking for in ${currentContext.year}
      - Reference modern tools, frameworks, and methodologies
      - Ask about adaptability to current market trends
      
      Format each question as:
      CATEGORY: [behavioral/technical/situational/trend-based]
      DIFFICULTY: [easy/medium/hard]
      RELEVANCE: [current/emerging/foundational]
      QUESTION: [the actual question]
      
      ---
    `;
  }

  // Build enhanced analysis prompt
  buildEnhancedAnalysisPrompt(question, userAnswer, jobRole, difficulty, currentContext, trendingTopics) {
    return `
      Current Date: ${currentContext.date}
      Current Industry Context: ${currentContext.year} market expectations
      
      Analyze this interview answer considering current industry standards and trends:
      
      Position: ${jobRole}
      Question: "${question}"
      Answer: "${userAnswer}"
      Difficulty Level: ${difficulty}
      
      Current Industry Trends to Consider:
      ${trendingTopics.slice(0, 5).map(topic => `- ${topic}`).join('\n')}
      
      Please provide feedback that reflects ${currentContext.year} industry expectations:
      
      SCORE: [0-100]
      
      STRENGTHS:
      - [specific strength 1]
      - [specific strength 2]
      
      AREAS FOR IMPROVEMENT:
      - [specific improvement 1 - consider current trends]
      - [specific improvement 2 - align with modern practices]
      
      CURRENT_MARKET_RELEVANCE:
      - [how answer aligns with current market expectations]
      
      FEEDBACK:
      [Detailed constructive feedback considering current industry standards and practices]
      
      SUGGESTED_ANSWER:
      [A better version incorporating current best practices and modern approaches]
      
      TRENDING_SKILLS_RECOMMENDATION:
      [Suggest 2-3 currently trending skills the candidate should consider learning]
    `;
  }

  // Build interview-focused system prompt with current trends
  buildInterviewFocusedSystemPrompt(domain, userLevel, currentContext, trendingTopics) {
    return `You are HireMate, an AI Interview Assistant.
You ONLY help with: job interviews, resume and soft skills, programming & technical concepts, and career guidance.

OFF-TOPIC POLICY:
❌ Never answer questions unrelated to these topics (e.g., cooking, travel, personal relationships, entertainment).
If off-topic, reply with exactly:
> "I specialize in interview and tech-related topics 😊. Please ask me something about careers, coding, or job preparation!"

INTERVIEW FOCUS AREAS:
- Common interview questions and best answers
- Resume and career advice
- Interview preparation strategies
- Technical interview practice
- Behavioral interview guidance
- Salary negotiation tips
- Professional development advice

CURRENT CONTEXT (${currentContext.year}):
- Today's Date: ${currentContext.date}
- Current Trending Technologies: ${trendingTopics.slice(0, 5).join(', ')}
- Market Focus: Modern practices, AI/ML integration, remote work culture

GUIDELINES:
- Be concise and clear
- Use bullet points for lists
- Provide actionable interview advice
- Focus on practical interview preparation
- Reference current industry trends when relevant
- Consider what employers are looking for in ${currentContext.year}
- Include modern workplace expectations

FORMATTING (strict):
- Use ### for headings only
- Use - for bullet points only
- Use **bold** sparingly and only when necessary
- Never repeat words, phrases, or Markdown symbols
- Remove any duplicated tokens or corrupted formatting
- Each section must contain unique information

User Level: ${userLevel}
Domain: ${domain || 'General'}`;
  }

  // Build contextual system prompt with current trends (legacy - kept for compatibility)
  buildContextualSystemPrompt(domain, userLevel, currentContext, trendingTopics) {
    // For backward compatibility, redirect to interview-focused prompt
    return this.buildInterviewFocusedSystemPrompt(domain, userLevel, currentContext, trendingTopics);
  }

  // Parse enhanced questions (includes new fields)
  parseGeneratedQuestions(response) {
    const questions = [];
    const questionBlocks = response.split('---').filter(block => block.trim());
    
    questionBlocks.forEach(block => {
      const lines = block.trim().split('\n');
      let category = 'general';
      let difficulty = 'medium';
      let relevance = 'current';
      let question = '';
      
      lines.forEach(line => {
        if (line.startsWith('CATEGORY:')) {
          category = line.replace('CATEGORY:', '').trim().toLowerCase();
        } else if (line.startsWith('DIFFICULTY:')) {
          difficulty = line.replace('DIFFICULTY:', '').trim().toLowerCase();
        } else if (line.startsWith('RELEVANCE:')) {
          relevance = line.replace('RELEVANCE:', '').trim().toLowerCase();
        } else if (line.startsWith('QUESTION:')) {
          question = line.replace('QUESTION:', '').trim();
        }
      });
      
      if (question) {
        questions.push({
          question,
          category,
          difficulty,
          relevance, // New field
          subcategory: 'ai-enhanced',
          createdBy: 'ai-enhanced',
          generatedAt: new Date().toISOString() // Track when generated
        });
      }
    });
    
    return questions;
  }

  // Enhanced analysis response parser
  parseAnalysisResponse(response) {
    const analysis = {
      score: 70,
      feedback: '',
      strengths: [],
      improvements: [],
      suggestedAnswer: '',
      marketRelevance: '', // New field
      trendingSkillsRecommendation: [] // New field
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
      } else if (trimmedLine.startsWith('CURRENT_MARKET_RELEVANCE:')) {
        currentSection = 'marketRelevance';
      } else if (trimmedLine.startsWith('FEEDBACK:')) {
        currentSection = 'feedback';
      } else if (trimmedLine.startsWith('SUGGESTED_ANSWER:')) {
        currentSection = 'suggestedAnswer';
      } else if (trimmedLine.startsWith('TRENDING_SKILLS_RECOMMENDATION:')) {
        currentSection = 'trendingSkillsRecommendation';
      } else if (trimmedLine.startsWith('- ')) {
        const item = trimmedLine.substring(2);
        if (currentSection === 'strengths' || currentSection === 'improvements') {
          analysis[currentSection].push(item);
        } else if (currentSection === 'trendingSkillsRecommendation') {
          analysis.trendingSkillsRecommendation.push(item);
        }
      } else if (currentSection && trimmedLine) {
        if (currentSection === 'feedback' || currentSection === 'suggestedAnswer' || currentSection === 'marketRelevance') {
          analysis[currentSection] += (analysis[currentSection] ? ' ' : '') + trimmedLine;
        }
      }
    });
    
    return analysis;
  }

  // Get current market insights for a specific role
  async getMarketInsights(jobRole) {
    const currentContext = this.getCurrentContext();
    
    try {
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are a career market analyst with knowledge of current job market trends as of ${currentContext.year}.`
          },
          {
            role: 'user',
            content: `Provide current market insights for ${jobRole} positions in ${currentContext.year}, including salary trends, required skills, and market demand.`
          }
        ],
        temperature: 0.4,
        max_tokens: 800
      });

      return response.choices[0]?.message?.content || 'Market insights unavailable';
    } catch (error) {
      logger.error('Error getting market insights:', error);
      return 'Market insights temporarily unavailable';
    }
  }
}

module.exports = new EnhancedAIService();
