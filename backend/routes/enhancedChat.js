const express = require('express');
const { authenticate, optionalAuth } = require('../middleware/auth');
const enhancedAiService = require('../services/enhancedAiService');
const logger = require('../utils/logger');

const router = express.Router();

// @route   POST /api/enhanced-chat/message
// @desc    Send a message with enhanced contextual AI response
// @access  Public (with optional auth for enhanced features)
router.post('/message', optionalAuth, async (req, res) => {
  try {
    const { message, domain, userLevel = 'mid', conversationHistory = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Generate enhanced response with current context
    const response = await enhancedAiService.generateContextualChatResponse(
      message, 
      domain, 
      userLevel, 
      conversationHistory
    );

    // Get current context for frontend
    const currentContext = enhancedAiService.getCurrentContext();

    logger.info(`Enhanced chat response generated for message: ${message.substring(0, 50)}...`);

    res.json({
      success: true,
      response,
      context: {
        currentDate: currentContext.date,
        currentYear: currentContext.year,
        isWeekend: currentContext.isWeekend
      },
      timestamp: new Date().toISOString(),
      enhanced: true // Flag to indicate this is an enhanced response
    });

  } catch (error) {
    logger.error('Enhanced chat message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process enhanced chat message'
    });
  }
});

// @route   POST /api/enhanced-chat/market-insights
// @desc    Get current market insights for a job role
// @access  Public
router.post('/market-insights', optionalAuth, async (req, res) => {
  try {
    const { jobRole } = req.body;

    if (!jobRole || jobRole.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Job role is required'
      });
    }

    const insights = await enhancedAiService.getMarketInsights(jobRole);
    const currentContext = enhancedAiService.getCurrentContext();

    logger.info(`Market insights generated for role: ${jobRole}`);

    res.json({
      success: true,
      insights,
      jobRole,
      context: {
        currentDate: currentContext.date,
        currentYear: currentContext.year
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Market insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get market insights'
    });
  }
});

// @route   GET /api/enhanced-chat/trending-topics
// @desc    Get current trending tech topics
// @access  Public
router.get('/trending-topics', async (req, res) => {
  try {
    const trendingTopics = await enhancedAiService.getTrendingTechTopics();
    const currentContext = enhancedAiService.getCurrentContext();

    res.json({
      success: true,
      trendingTopics,
      context: {
        currentDate: currentContext.date,
        currentYear: currentContext.year
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Trending topics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trending topics'
    });
  }
});

// @route   POST /api/enhanced-chat/enhanced-questions
// @desc    Generate enhanced interview questions with current trends
// @access  Private
router.post('/enhanced-questions', authenticate, async (req, res) => {
  try {
    const { resumeData = {}, jobRole, difficulty = 'medium', count = 5 } = req.body;

    if (!jobRole || jobRole.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Job role is required'
      });
    }

    const questions = await enhancedAiService.generateEnhancedQuestions(
      resumeData,
      jobRole,
      difficulty,
      count
    );

    const currentContext = enhancedAiService.getCurrentContext();

    logger.info(`Enhanced questions generated for role: ${jobRole}`);

    res.json({
      success: true,
      questions,
      jobRole,
      difficulty,
      count: questions.length,
      context: {
        currentDate: currentContext.date,
        currentYear: currentContext.year
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Enhanced questions generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate enhanced questions'
    });
  }
});

// @route   POST /api/enhanced-chat/analyze-with-trends
// @desc    Analyze answer with current industry trends
// @access  Private
router.post('/analyze-with-trends', authenticate, async (req, res) => {
  try {
    const { question, userAnswer, jobRole, difficulty = 'medium' } = req.body;

    if (!question || !userAnswer || !jobRole) {
      return res.status(400).json({
        success: false,
        message: 'Question, user answer, and job role are required'
      });
    }

    const analysis = await enhancedAiService.analyzeAnswerWithCurrentTrends(
      question,
      userAnswer,
      jobRole,
      difficulty
    );

    const currentContext = enhancedAiService.getCurrentContext();

    logger.info(`Enhanced analysis completed for question: ${question.substring(0, 50)}...`);

    res.json({
      success: true,
      analysis: {
        score: analysis.score,
        feedback: analysis.feedback,
        strengths: analysis.strengths,
        improvements: analysis.improvements,
        marketRelevance: analysis.marketRelevance,
        trendingSkillsRecommendation: analysis.trendingSkillsRecommendation
        // Don't send suggested answer immediately
      },
      context: {
        currentDate: currentContext.date,
        currentYear: currentContext.year
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Enhanced analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze answer with current trends'
    });
  }
});

// @route   GET /api/enhanced-chat/context
// @desc    Get current context information
// @access  Public
router.get('/context', async (req, res) => {
  try {
    const currentContext = enhancedAiService.getCurrentContext();
    const trendingTopics = await enhancedAiService.getTrendingTechTopics();

    res.json({
      success: true,
      context: {
        date: currentContext.date,
        year: currentContext.year,
        month: currentContext.month,
        isWeekend: currentContext.isWeekend,
        trendingTopics: trendingTopics.slice(0, 5)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Context retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get current context'
    });
  }
});

module.exports = router;
