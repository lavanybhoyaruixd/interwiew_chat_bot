const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const aiService = require('./aiService');
const sessionFileService = require('./sessionFileService');
const logger = require('../utils/logger');

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
  async extractTextFromPDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(dataBuffer);
      
      if (!pdfData.text || pdfData.text.trim().length === 0) {
        throw new Error('No text content found in PDF');
      }

      logger.info(`Successfully extracted text from PDF: ${pdfData.text.length} characters`);
      return pdfData.text;
    } catch (error) {
      logger.error('Error extracting text from PDF:', error);
      throw new Error('Unable to extract text from PDF file');
    }
  }

  // Process uploaded resume with enhanced file handling
  async processResume(file, userId) {
    let filePath = null;
    
    try {
      // Validate file
      const validationErrors = this.validateFile(file);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // Generate unique filename with additional security
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const sanitizedName = file.originalname
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .substring(0, 50); // Limit filename length
      const filename = `${userId}_${timestamp}_${randomSuffix}_${sanitizedName}`;
      filePath = path.join(__dirname, '../uploads', filename);

      // Save file temporarily with enhanced security
      await this.saveFileSecurely(file.buffer, filePath);

      try {
        // Extract text from PDF with better error handling
        const extractedText = await this.extractTextFromPDF(filePath);
        
        // Validate extracted text
        if (!extractedText || extractedText.trim().length < 50) {
          throw new Error('Resume appears to be empty or corrupted');
        }

        // Use AI to extract structured information
        const extractedInfo = await aiService.extractResumeInfo(extractedText);

        // Generate processing summary
        const processingSummary = this.generateProcessingSummary(extractedText, extractedInfo);

        const processedData = {
          filename: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          extractedText: extractedText.substring(0, 5000), // Limit stored text
          skills: extractedInfo.skills || [],
          experience: extractedInfo.experience || '',
          education: extractedInfo.education || '',
          currentRole: extractedInfo.currentRole || '',
          industries: extractedInfo.industries || [],
          yearsOfExperience: extractedInfo.yearsOfExperience || '0',
          keyAchievements: extractedInfo.keyAchievements || [],
          processingSummary,
          processedAt: new Date(),
          textLength: extractedText.length,
          processingVersion: '1.0'
        };

        logger.info(`Successfully processed resume for user ${userId}: ${processingSummary.totalSkills} skills, ${processingSummary.textLength} chars`);
        return processedData;

      } finally {
        // Always clean up temporary file
        if (filePath) {
          await this.cleanupFileAsync(filePath);
        }
      }

    } catch (error) {
      logger.error('Error processing resume:', error);
      
      // Emergency cleanup
      if (filePath) {
        await this.cleanupFileAsync(filePath);
      }
      
      throw error;
    }
  }

  // Save file to disk
  async saveFile(buffer, filePath) {
    return new Promise((resolve, reject) => {
      // Ensure upload directory exists
      const uploadDir = path.dirname(filePath);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      fs.writeFile(filePath, buffer, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(filePath);
        }
      });
    });
  }

  // Clean up temporary file
  cleanupFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.debug(`Cleaned up temporary file: ${filePath}`);
      }
    } catch (error) {
      logger.warn(`Failed to cleanup file ${filePath}:`, error.message);
    }
  }

  // Generate interview questions based on resume
  async generateQuestionsFromResume(resumeData, jobRole, difficulty = 'medium', count = 5) {
    try {
      const questions = await aiService.generateQuestions(resumeData, jobRole, difficulty, count);
      
      // Add additional metadata
      const enhancedQuestions = questions.map(q => ({
        ...q,
        jobRoles: [jobRole],
        skills: resumeData.skills || [],
        estimatedTime: this.estimateQuestionTime(q.category, q.difficulty),
        source: 'resume-based'
      }));

      logger.info(`Generated ${enhancedQuestions.length} questions from resume for role: ${jobRole}`);
      return enhancedQuestions;

    } catch (error) {
      logger.error('Error generating questions from resume:', error);
      throw new Error('Failed to generate questions from resume');
    }
  }

  // Estimate time needed for question based on category and difficulty
  estimateQuestionTime(category, difficulty) {
    const baseTimes = {
      technical: 8,
      behavioral: 5,
      situational: 6,
      'case-study': 15,
      general: 4
    };

    const difficultyMultipliers = {
      easy: 0.8,
      medium: 1.0,
      hard: 1.5
    };

    const baseTime = baseTimes[category] || 5;
    const multiplier = difficultyMultipliers[difficulty] || 1.0;

    return Math.round(baseTime * multiplier);
  }

  // Extract skills from text using simple pattern matching (fallback)
  extractSkillsFromText(text) {
    const commonSkills = [
      // Programming languages
      'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift',
      'typescript', 'kotlin', 'scala', 'r', 'matlab', 'sql',
      
      // Web technologies
      'html', 'css', 'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask',
      'spring', 'laravel', 'wordpress', 'jquery',
      
      // Databases
      'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'sqlite', 'oracle',
      
      // Cloud platforms
      'aws', 'azure', 'gcp', 'google cloud', 'heroku', 'digitalocean',
      
      // Tools and frameworks
      'git', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible',
      
      // Soft skills
      'leadership', 'communication', 'teamwork', 'problem solving', 'project management',
      'agile', 'scrum', 'analytical thinking'
    ];

    const foundSkills = [];
    const lowerText = text.toLowerCase();

    commonSkills.forEach(skill => {
      if (lowerText.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    });

    return [...new Set(foundSkills)]; // Remove duplicates
  }

  // Get file stats
  getFileStats(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return {
        size: stats.size,
        created: stats.ctime,
        modified: stats.mtime
      };
    } catch (error) {
      return null;
    }
  }

  // Enhanced secure file saving
  async saveFileSecurely(buffer, filePath) {
    return new Promise((resolve, reject) => {
      try {
        // Ensure upload directory exists with proper permissions
        const uploadDir = path.dirname(filePath);
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
        }

        // Write file with restricted permissions
        fs.writeFile(filePath, buffer, { mode: 0o644 }, (error) => {
          if (error) {
            logger.error(`Failed to save file ${filePath}:`, error);
            reject(error);
          } else {
            logger.debug(`File saved securely: ${filePath}`);
            resolve(filePath);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Async file cleanup
  async cleanupFileAsync(filePath) {
    return new Promise((resolve) => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (error) => {
            if (error) {
              logger.warn(`Failed to cleanup file ${filePath}:`, error.message);
            } else {
              logger.debug(`Cleaned up temporary file: ${filePath}`);
            }
            resolve();
          });
        } else {
          resolve();
        }
      } catch (error) {
        logger.warn(`Error during file cleanup ${filePath}:`, error.message);
        resolve();
      }
    });
  }

  // Generate processing summary
  generateProcessingSummary(extractedText, extractedInfo) {
    return {
      textLength: extractedText.length,
      totalSkills: extractedInfo.skills?.length || 0,
      hasExperience: !!(extractedInfo.experience && extractedInfo.experience.length > 10),
      hasEducation: !!(extractedInfo.education && extractedInfo.education.length > 5),
      hasCurrentRole: !!(extractedInfo.currentRole && extractedInfo.currentRole !== 'Not specified'),
      estimatedYears: extractedInfo.yearsOfExperience || '0',
      industries: extractedInfo.industries?.length || 0,
      achievements: extractedInfo.keyAchievements?.length || 0,
      processingSuccess: true
    };
  }

  // Process resume from memory (without saving to disk)
  async processResumeInMemory(file, userId) {
    try {
      // Validate file
      const validationErrors = this.validateFile(file);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // Extract text directly from buffer
      const pdfData = await pdf(file.buffer);
      
      if (!pdfData.text || pdfData.text.trim().length < 50) {
        throw new Error('Resume appears to be empty or corrupted');
      }

      const extractedText = pdfData.text;
      logger.info(`Extracted text from PDF in memory: ${extractedText.length} characters`);

      // Use AI to extract structured information
      const extractedInfo = await aiService.extractResumeInfo(extractedText);

      // Generate processing summary
      const processingSummary = this.generateProcessingSummary(extractedText, extractedInfo);

      const processedData = {
        filename: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        extractedText: extractedText.substring(0, 5000),
        skills: extractedInfo.skills || [],
        experience: extractedInfo.experience || '',
        education: extractedInfo.education || '',
        currentRole: extractedInfo.currentRole || '',
        industries: extractedInfo.industries || [],
        yearsOfExperience: extractedInfo.yearsOfExperience || '0',
        keyAchievements: extractedInfo.keyAchievements || [],
        processingSummary,
        processedAt: new Date(),
        textLength: extractedText.length,
        processingVersion: '1.0',
        processingMethod: 'in-memory'
      };

      logger.info(`Successfully processed resume in memory for user ${userId}`);
      return processedData;

    } catch (error) {
      logger.error('Error processing resume in memory:', error);
      throw error;
    }
  }

  // Process resume with session-based file management
  async processResumeForSession(file, userId, sessionId = null) {
    try {
      // Validate file
      const validationErrors = this.validateFile(file);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // Save file with session management
      const fileInfo = await sessionFileService.saveSessionFile(file, userId, sessionId);
      
      try {
        // Extract text from saved file
        const extractedText = await this.extractTextFromPDF(fileInfo.filePath);
        
        // Validate extracted text
        if (!extractedText || extractedText.trim().length < 50) {
          throw new Error('Resume appears to be empty or corrupted');
        }

        // Use AI to extract structured information
        const extractedInfo = await aiService.extractResumeInfo(extractedText);

        // Generate processing summary
        const processingSummary = this.generateProcessingSummary(extractedText, extractedInfo);

        const processedData = {
          filename: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          extractedText: extractedText.substring(0, 5000),
          skills: extractedInfo.skills || [],
          experience: extractedInfo.experience || '',
          education: extractedInfo.education || '',
          currentRole: extractedInfo.currentRole || '',
          industries: extractedInfo.industries || [],
          yearsOfExperience: extractedInfo.yearsOfExperience || '0',
          keyAchievements: extractedInfo.keyAchievements || [],
          processingSummary,
          processedAt: new Date(),
          textLength: extractedText.length,
          processingVersion: '1.0',
          processingMethod: 'session-based',
          sessionInfo: {
            fileKey: sessionId || `user_${userId}_${Date.now()}`,
            userId: userId,
            sessionId: sessionId
          }
        };

        logger.info(`Successfully processed resume for session: ${sessionId || 'pending'}, user: ${userId}`);
        return processedData;

      } catch (processingError) {
        // If processing fails, clean up the file
        await sessionFileService.deleteSessionFile(sessionId || `user_${userId}_${Date.now()}`);
        throw processingError;
      }

    } catch (error) {
      logger.error('Error processing resume for session:', error);
      throw error;
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
