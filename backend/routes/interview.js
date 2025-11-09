const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const InterviewSession = require('../models/InterviewSession');
const Question = require('../models/Question');
const { authenticate, checkCredits } = require('../middleware/auth');
const {
  validateCreateSession,
  validateSubmitAnswer
} = require('../middleware/validation');

const aiService = require('../services/aiService');
const resumeService = require('../services/resumeService');
const logger = require('../utils/logger');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// @route   POST /api/interview/sessions
// @desc    Create a new interview session
// @access  Private
router.post('/sessions', authenticate, checkCredits(1), validateCreateSession, async (req, res) => {
  try {
    const { type, difficulty, jobRole, company, questionCount } = req.body;
    const userId = req.user.id;

    // Generate unique session ID
    const sessionId = uuidv4();

    // Create new interview session
    const session = new InterviewSession({
      user: userId,
      sessionId,
      type,
      difficulty,
      jobRole,
      company,
      status: 'active'
    });

    // Get questions based on criteria
    const questionCriteria = {
      category: type === 'general' ? undefined : type,
      difficulty,
      jobRole,
      count: questionCount || 5
    };

    let questions;
    
    // Check if user has uploaded resume data for personalized questions
    if (req.user.resumeData && req.user.resumeData.skills.length > 0) {
      questions = await resumeService.generateQuestionsFromResume(
        req.user.resumeData,
        jobRole,
        difficulty,
        questionCount || 5
      );
    } else {
      // Get random questions from database
      questions = await Question.getRandomQuestions(questionCriteria);
    }

    if (questions.length === 0) {
      // Fallback: generate questions using AI
      questions = await aiService.generateQuestions(
        { skills: [], experience: '', currentRole: jobRole },
        jobRole,
        difficulty,
        questionCount || 5
      );
    }

    // Add questions to session
    session.questions = questions.map(q => ({
      questionId: q._id || null,
      question: q.question,
      answeredAt: null,
      timeSpent: 0
    }));

    await session.save();

    // Link resume file to session if user has uploaded one
    if (req.user.resumeData && req.user.resumeData.sessionInfo) {
      const resumeLinked = resumeService.linkResumeToSession(userId, sessionId);
      if (resumeLinked) {
        logger.info(`Resume file linked to session: ${sessionId}`);
      }
    }

    // Deduct credits
    await req.user.deductCredits(1);

    logger.info(`New interview session created: ${sessionId} for user: ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Interview session created successfully',
      session: {
        sessionId: session.sessionId,
        type: session.type,
        difficulty: session.difficulty,
        jobRole: session.jobRole,
        company: session.company,
        status: session.status,
        questionCount: session.questions.length,
        creditsUsed: 1,
        remainingCredits: req.user.credits - 1
      }
    });

  } catch (error) {
    logger.error('Create session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create interview session'
    });
  }
});

// @route   GET /api/interview/sessions
// @desc    Get user's interview sessions
// @access  Private
router.get('/sessions', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    let query = { user: userId };
    if (status) {
      query.status = status;
    }

    const sessions = await InterviewSession.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-questions.aiAnalysis.suggestedAnswer') // Don't send suggested answers
      .populate('user', 'name email');

    const total = await InterviewSession.countDocuments(query);

    res.json({
      success: true,
      sessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get interview sessions'
    });
  }
});

// @route   GET /api/interview/sessions/:sessionId
// @desc    Get specific interview session
// @access  Private
router.get('/sessions/:sessionId', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await InterviewSession.findOne({
      sessionId,
      user: userId
    }).populate('user', 'name email');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found'
      });
    }

    // Don't send suggested answers unless session is completed
    if (session.status !== 'completed') {
      session.questions.forEach(q => {
        if (q.aiAnalysis && q.aiAnalysis.suggestedAnswer) {
          delete q.aiAnalysis.suggestedAnswer;
        }
      });
    }

    res.json({
      success: true,
      session
    });

  } catch (error) {
    logger.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get interview session'
    });
  }
});

// @route   POST /api/interview/sessions/:sessionId/answer
// @desc    Submit answer to a question
// @access  Private
router.post('/sessions/:sessionId/answer', authenticate, checkCredits(1), validateSubmitAnswer, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionId, answer, timeSpent, confidence } = req.body;
    const userId = req.user.id;

    const session = await InterviewSession.findOne({
      sessionId,
      user: userId,
      status: 'active'
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Active interview session not found'
      });
    }

    // Find the question in the session
    const questionIndex = session.questions.findIndex(q => 
      q.questionId?.toString() === questionId || q._id?.toString() === questionId
    );

    if (questionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Question not found in this session'
      });
    }

    const question = session.questions[questionIndex];

    if (question.userAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Question already answered'
      });
    }

    // Update question with user's answer
    question.userAnswer = answer;
    question.answeredAt = new Date();
    question.timeSpent = timeSpent || 0;
    question.confidence = confidence || 3;

    // Get AI analysis of the answer
    try {
      const analysis = await aiService.analyzeAnswer(
        question.question,
        answer,
        session.jobRole,
        session.difficulty
      );

      question.aiAnalysis = {
        score: analysis.score,
        feedback: analysis.feedback,
        strengths: analysis.strengths,
        improvements: analysis.improvements,
        suggestedAnswer: analysis.suggestedAnswer
      };

      // Update question usage statistics if it's from database
      if (question.questionId) {
        const dbQuestion = await Question.findById(question.questionId);
        if (dbQuestion) {
          await dbQuestion.updateUsage(analysis.score, timeSpent);
        }
      }

    } catch (aiError) {
      logger.error('AI analysis error:', aiError);
      // Provide fallback feedback
      question.aiAnalysis = {
        score: 70,
        feedback: 'Thank you for your answer. Keep practicing to improve your interview skills.',
        strengths: ['Clear communication'],
        improvements: ['Consider providing more specific examples'],
        suggestedAnswer: 'AI analysis temporarily unavailable'
      };
    }

    // Update credits used
    session.creditsUsed += 1;

    await session.save();
    await req.user.deductCredits(1);

    logger.info(`Answer submitted for session: ${sessionId}, question: ${questionIndex}`);

    res.json({
      success: true,
      message: 'Answer submitted successfully',
      analysis: {
        score: question.aiAnalysis.score,
        feedback: question.aiAnalysis.feedback,
        strengths: question.aiAnalysis.strengths,
        improvements: question.aiAnalysis.improvements
        // Don't send suggested answer immediately
      },
      creditsUsed: 1,
      remainingCredits: req.user.credits - 1
    });

  } catch (error) {
    logger.error('Submit answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit answer'
    });
  }
});

// @route   POST /api/interview/sessions/:sessionId/complete
// @desc    Complete interview session
// @access  Private
router.post('/sessions/:sessionId/complete', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await InterviewSession.findOne({
      sessionId,
      user: userId,
      status: 'active'
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Active interview session not found'
      });
    }

    // Update session status
    session.status = 'completed';
    session.completedAt = new Date();

    // Calculate overall feedback
    const answeredQuestions = session.questions.filter(q => q.userAnswer && q.aiAnalysis);
    
    if (answeredQuestions.length > 0) {
      const averageScore = answeredQuestions.reduce((sum, q) => sum + q.aiAnalysis.score, 0) / answeredQuestions.length;
      
      // Collect all strengths and improvements
      const allStrengths = [];
      const allImprovements = [];
      
      answeredQuestions.forEach(q => {
        if (q.aiAnalysis.strengths) allStrengths.push(...q.aiAnalysis.strengths);
        if (q.aiAnalysis.improvements) allImprovements.push(...q.aiAnalysis.improvements);
      });

      session.overallFeedback = {
        totalScore: Math.round(averageScore),
        strengths: [...new Set(allStrengths)].slice(0, 5), // Top 5 unique strengths
        weaknesses: [...new Set(allImprovements)].slice(0, 5), // Top 5 unique improvements
        recommendations: [
          'Practice more interview questions',
          'Work on providing specific examples',
          'Focus on areas needing improvement'
        ]
      };
    }

    await session.save();

    // Update user stats
    req.user.stats.totalInterviews += 1;
    req.user.stats.totalQuestions += session.questions.length;
    
    if (answeredQuestions.length > 0) {
      const newAverageScore = answeredQuestions.reduce((sum, q) => sum + q.aiAnalysis.score, 0) / answeredQuestions.length;
      req.user.stats.averageScore = ((req.user.stats.averageScore * (req.user.stats.totalInterviews - 1)) + newAverageScore) / req.user.stats.totalInterviews;
    }
    
    await req.user.save();

    // Schedule file cleanup after session completion
    const immediate = req.query.immediate === 'true';
    const fileCleanedUp = resumeService.endResumeSession(sessionId, immediate);
    if (fileCleanedUp) {
      const cleanupDelay = immediate ? '5 seconds' : '30 minutes';
      logger.info(`Resume file cleanup scheduled for session ${sessionId} in ${cleanupDelay}`);
    }

    logger.info(`Interview session completed: ${sessionId}`);

    res.json({
      success: true,
      message: 'Interview session completed successfully',
      overallFeedback: session.overallFeedback,
      analytics: session.analytics,
      duration: session.duration,
      fileCleanup: {
        scheduled: fileCleanedUp,
        delay: immediate ? '5 seconds' : '30 minutes'
      }
    });

  } catch (error) {
    logger.error('Complete session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete interview session'
    });
  }
});

// @route   POST /api/interview/upload-resume
// @desc    Upload and process resume
// @access  Private
router.post('/upload-resume', authenticate, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file provided'
      });
    }

    const userId = req.user.id;
    const processingMethod = req.query.method || 'session'; // 'session', 'memory', or 'secure'
    
    let resumeData;
    
    // Choose processing method
    switch (processingMethod) {
      case 'memory':
        // Process in memory (fastest, most secure)
        resumeData = await resumeService.processResumeInMemory(req.file, userId);
        break;
      case 'session':
        // Process with session-based file management (recommended)
        resumeData = await resumeService.processResumeForSession(req.file, userId);
        break;
      default:
        // Process with temporary file (fallback)
        resumeData = await resumeService.processResume(req.file, userId);
    }
    
    // Update user's resume data
    req.user.resumeData = resumeData;
    req.user.resumeUploadedAt = new Date();
    await req.user.save();

    logger.info(`Resume processed for user: ${userId} using ${processingMethod} method`);

    // Generate sample questions based on resume
    let sampleQuestions = [];
    try {
      if (resumeData.skills && resumeData.skills.length > 0) {
        sampleQuestions = await resumeService.generateQuestionsFromResume(
          resumeData,
          resumeData.currentRole || 'Software Developer',
          'medium',
          3
        );
      }
    } catch (questionError) {
      logger.warn('Failed to generate sample questions:', questionError.message);
    }

    res.json({
      success: true,
      message: 'Resume uploaded and processed successfully',
      resumeData: {
        filename: resumeData.filename,
        fileSize: resumeData.fileSize,
        skills: resumeData.skills,
        experience: resumeData.experience,
        education: resumeData.education,
        currentRole: resumeData.currentRole,
        industries: resumeData.industries,
        yearsOfExperience: resumeData.yearsOfExperience,
        keyAchievements: resumeData.keyAchievements,
        processedAt: resumeData.processedAt,
        processingSummary: resumeData.processingSummary
      },
      sampleQuestions: sampleQuestions.slice(0, 3), // Send first 3 questions as preview
      analytics: {
        processingMethod: resumeData.processingMethod || processingMethod,
        textLength: resumeData.textLength,
        skillsFound: resumeData.skills?.length || 0,
        processingTime: new Date() - new Date(resumeData.processedAt)
      },
      sessionInfo: resumeData.sessionInfo // Include session info for tracking
    });

  } catch (error) {
    logger.error('Resume upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process resume',
      errorType: error.name || 'ProcessingError'
    });
  }
});

// @route   GET /api/interview/analytics
// @desc    Get user's interview analytics
// @access  Private
router.get('/analytics', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const analytics = await InterviewSession.getUserAnalytics(userId);

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    logger.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics'
    });
  }
});

// @route   GET /api/interview/questions
// @desc    Get available questions (for preview)
// @access  Private
router.get('/questions', authenticate, async (req, res) => {
  try {
    const { category, difficulty, jobRole, limit = 10 } = req.query;

    const criteria = {
      category,
      difficulty,
      jobRole,
      limit: parseInt(limit)
    };

    const questions = await Question.findByCriteria(criteria);

    res.json({
      success: true,
      questions
    });

  } catch (error) {
    logger.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get questions'
    });
  }
});

module.exports = router;
