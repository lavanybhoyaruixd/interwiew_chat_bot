const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const aiService = require('./aiService');
const sessionFileService = require('./sessionFileService');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class ResumeService {
  constructor() {
    this.allowedTypes = ['application/pdf'];
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 5242880; // 5MB
  }

  // Validate uploaded file
  validateFile(file) {
    const errors = [];

    if (!file) {
      errors.push('No file uploaded');
      return errors;
    }

    // Check file type
    if (!this.allowedTypes.includes(file.mimetype)) {
      errors.push('Only PDF files are allowed');
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      errors.push(`File size must be less than ${this.maxFileSize / 1024 / 1024}MB`);
    }

    // Check if file has content
    if (file.size === 0) {
      errors.push('Uploaded file is empty');
    }

    return errors;
  }

  // Extract text from PDF
  async extractTextFromBuffer(buffer) {
    try {
      const pdfData = await pdf(buffer);
      if (!pdfData.text || pdfData.text.trim().length === 0) {
        throw new Error('No text content found in PDF');
      }
      return pdfData.text;
    } catch (error) {
      logger.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF: ' + error.message);
    }
  }

  // Process resume with AI analysis
  async processResumeInMemory(file, userId = 'anonymous') {
    try {
      // Ensure we have a buffer
      if (!file.buffer && file.path) {
        // If buffer is not available but path is, read the file
        file.buffer = fs.readFileSync(file.path);
      } else if (!file.buffer && file.data) {
        // If data is available (from multer memory storage)
        file.buffer = file.data;
      }

      if (!file.buffer) {
        throw new Error('No file data available for processing');
      }

      // Extract text from PDF
      const resumeText = await this.extractTextFromBuffer(file.buffer);
      
      // Extract basic info
      const basicInfo = this.extractBasicInfo(resumeText);
      
      // Perform AI analysis
      const aiAnalysis = await this.analyzeWithAI(resumeText);
      
      // Extract structured data from AI analysis
      const skills = aiAnalysis.skills?.technical || [];
      const softSkills = aiAnalysis.skills?.soft || [];
      const allSkills = [...skills, ...softSkills];
      
      // Calculate experience level
      let yearsOfExperience = 0;
      let currentRole = aiAnalysis.suggested_roles?.[0] || 'Software Developer';
      
      // Try to extract experience from text
      const experienceMatch = resumeText.match(/(\d+)\+?\s*years?\s*(?:of\s*)?experience/i);
      if (experienceMatch) {
        yearsOfExperience = parseInt(experienceMatch[1]);
      }
      
      // Extract industries (simplified)
      const industries = [];
      if (resumeText.toLowerCase().includes('software') || resumeText.toLowerCase().includes('technology')) {
        industries.push('Technology');
      }
      if (resumeText.toLowerCase().includes('finance') || resumeText.toLowerCase().includes('banking')) {
        industries.push('Finance');
      }
      if (resumeText.toLowerCase().includes('healthcare') || resumeText.toLowerCase().includes('medical')) {
        industries.push('Healthcare');
      }

      // Create key achievements (simplified extraction)
      const keyAchievements = [];
      const achievementPatterns = [
        /achieved?\s+([^.!?]+[.!?])/gi,
        /improved?\s+([^.!?]+[.!?])/gi,
        /developed?\s+([^.!?]+[.!?])/gi,
        /led?\s+([^.!?]+[.!?])/gi
      ];
      
      achievementPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(resumeText)) !== null && keyAchievements.length < 3) {
          const achievement = match[1].trim();
          if (achievement.length > 10 && !keyAchievements.includes(achievement)) {
            keyAchievements.push(achievement);
          }
        }
      });

      const processedAt = new Date();
      
      // Response needs to satisfy legacy controllers (metadata/basicInfo/extractedText/aiAnalysis)
      // AND new resume analyzer expectations (flattened fields).
      const response = {
        // Flattened fields for newer routes
        filename: file.originalname || 'resume.pdf',
        fileSize: file.size || file.buffer.length,
        skills: allSkills,
        experience: aiAnalysis.experience_level || 'Entry Level',
        education: basicInfo.education || 'Not specified',
        currentRole: currentRole,
        industries: industries.length > 0 ? industries : ['Technology'],
        yearsOfExperience: yearsOfExperience,
        keyAchievements: keyAchievements,
        processedAt: processedAt.toISOString(),
        processingSummary: {
          textLength: resumeText.length,
          totalSkills: allSkills.length,
          hasExperience: yearsOfExperience > 0,
          hasEducation: basicInfo.education !== 'Not found',
          aiAnalysis: aiAnalysis
        },
        textLength: resumeText.length,
        processingMethod: 'memory',
        sessionInfo: {
          userId: userId,
          analysisId: uuidv4()
        },
        // Legacy / controller expected structure
        metadata: {
          filename: file.originalname || 'resume.pdf',
          size: file.size || file.buffer.length,
          mimeType: file.mimetype || 'application/pdf',
          extractedAt: processedAt.toISOString(),
          analysisId: uuidv4()
        },
        basicInfo: basicInfo,
        extractedText: resumeText,
        aiAnalysis: aiAnalysis
      };

      return response;

    } catch (error) {
      logger.error('Error processing resume:', error);
      throw new Error(`Failed to process resume: ${error.message}`);
    }
  }
  
  // Extract basic information from resume text
  extractBasicInfo(text) {
    // Simple regex patterns for basic info extraction
    const emailMatch = text.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(\+\d{1,3}[\s-]?)?(\d[\s-]?){10,}/);
    const nameMatch = text.match(/^[A-Z][a-z]+(?: [A-Z][a-z]+)+/m);
    
    // Extract education information
    let education = 'Not found';
    const educationKeywords = ['bachelor', 'master', 'phd', 'degree', 'university', 'college', 'b.tech', 'm.tech', 'b.e', 'm.e', 'b.sc', 'm.sc'];
    const educationPattern = new RegExp(`(${educationKeywords.join('|')})[^.!?]*[.!?]`, 'gi');
    const educationMatch = text.match(educationPattern);
    if (educationMatch) {
      education = educationMatch[0].trim();
    }
    
    return {
      name: nameMatch ? nameMatch[0] : 'Not found',
      email: emailMatch ? emailMatch[0] : 'Not found',
      phone: phoneMatch ? phoneMatch[0] : 'Not found',
      education: education,
      textLength: text.length,
      wordCount: text.split(/\s+/).length
    };
  }
  
  // Enhanced AI analysis using Groq
  async analyzeWithAI(resumeText) {
    try {
      const prompt = `Analyze the following resume and provide detailed insights:
      
${resumeText.substring(0, 8000)}  // Limit text length for the API

Provide analysis in the following JSON format:
{
  "summary": "Brief professional summary",
  "strengths": ["strength1", "strength2", ...],
  "improvement_areas": ["area1", "area2", ...],
  "skills": {
    "technical": ["skill1", "skill2", ...],
    "soft": ["skill1", "skill2", ...]
  },
  "experience_level": "Junior/Mid/Senior/Executive",
  "suggested_roles": ["Role 1", "Role 2", ...],
  "missing_keywords": ["keyword1", "keyword2", ...]
}`;

      const response = await aiService.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume analyzer. Provide detailed, constructive feedback on resumes. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      // Parse the AI response
      const aiResponse = response.choices[0].message.content;
      return JSON.parse(aiResponse);
      
    } catch (error) {
      logger.error('AI analysis failed:', error);
      return {
        error: 'AI analysis failed',
        details: error.message
      };
    }
  }

  // Link resume file to interview session
  linkResumeToSession(userId, sessionId) {
    return sessionFileService.startInterviewSession(sessionId, userId);
  }

  // End session and schedule file cleanup
  endResumeSession(sessionId, immediate = false) {
    return sessionFileService.endInterviewSession(sessionId, immediate);
  }

  // Generate interview questions based on resume data
  async generateQuestionsFromResume(resumeData, jobRole = 'Software Developer', difficulty = 'medium', count = 3) {
    try {
      // Use the aiService to generate questions
      const aiService = require('./aiService');
      
      // Prepare resume data for question generation
      const resumeContext = {
        skills: resumeData.skills || [],
        experience: resumeData.experience || [],
        education: resumeData.education || [],
        currentRole: resumeData.currentRole || jobRole,
        industries: resumeData.industries || [],
        yearsOfExperience: resumeData.yearsOfExperience || 0
      };

      const questions = await aiService.generateQuestions(resumeContext, jobRole, difficulty, count);
      
      // Format questions for response
      return questions.map((q, index) => ({
        id: `q_${index + 1}`,
        question: q,
        difficulty: difficulty,
        category: 'technical',
        type: 'behavioral'
      }));
      
    } catch (error) {
      logger.error('Error generating questions from resume:', error);
      // Return fallback questions
      return [
        {
          id: 'q_1',
          question: `Can you tell me about your experience in ${jobRole} role?`,
          difficulty: 'easy',
          category: 'experience',
          type: 'behavioral'
        },
        {
          id: 'q_2', 
          question: 'What are your key strengths and how do they apply to this role?',
          difficulty: 'medium',
          category: 'strengths',
          type: 'behavioral'
        },
        {
          id: 'q_3',
          question: 'Describe a challenging project you worked on and how you overcame difficulties.',
          difficulty: 'medium',
          category: 'problem-solving',
          type: 'behavioral'
        }
      ];
    }
  }

  // Clean up old temporary files (scheduled cleanup)
  async cleanupOldFiles() {
    try {
      // Clean up session files first
      await sessionFileService.cleanupExpiredFiles();

      // Then clean up any orphaned files
      const uploadDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadDir)) return;

      const files = fs.readdirSync(uploadDir);
      const now = Date.now();
      const maxAge = 60 * 60 * 1000; // 1 hour
      let cleanedCount = 0;

      for (const file of files) {
        // Skip session-managed files
        if (file.startsWith('session_')) continue;

        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.ctime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          cleanedCount++;
          logger.debug(`Cleaned up old file: ${file}`);
        }
      }

      if (cleanedCount > 0) {
        logger.info(`Cleaned up ${cleanedCount} old temporary files`);
      }
    } catch (error) {
      logger.error('Error during scheduled cleanup:', error);
    }
  }
}

module.exports = new ResumeService();
