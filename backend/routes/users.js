const express = require('express');
const User = require('../models/User');
const InterviewSession = require('../models/InterviewSession');
const { authenticate } = require('../middleware/auth');
const { validateUpdateProfile } = require('../middleware/validation');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = req.user;

    // Remove sensitive information
    const userProfile = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      credits: user.credits,
      subscription: user.subscription,
      profile: user.profile,
      preferences: user.preferences,
      stats: user.stats,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };

    res.json({
      success: true,
      user: userProfile
    });

  } catch (error) {
    logger.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, validateUpdateProfile, async (req, res) => {
  try {
    const updates = req.body;
    const userId = req.user.id;

    // Remove sensitive fields that shouldn't be updated via this route
    delete updates.password;
    delete updates.email;
    delete updates.credits;
    delete updates.subscription;
    delete updates.isVerified;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info(`Profile updated for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        profile: user.profile,
        preferences: user.preferences
      }
    });

  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// @route   GET /api/users/analytics
// @desc    Get user's comprehensive analytics
// @access  Private
router.get('/analytics', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get basic analytics from InterviewSession model
    const sessionAnalytics = await InterviewSession.getUserAnalytics(userId);

    // Get additional user stats
    const userStats = {
      totalCreditsUsed: req.user.stats.totalInterviews, // Approximate
      currentCredits: req.user.credits,
      subscriptionType: req.user.subscription.type,
      accountAge: Math.floor((Date.now() - req.user.createdAt) / (1000 * 60 * 60 * 24)), // days
      lastActive: req.user.lastLogin
    };

    // Get recent sessions for trend analysis
    const recentSessions = await InterviewSession.find({
      user: userId,
      status: 'completed'
    })
    .sort({ completedAt: -1 })
    .limit(10)
    .select('analytics.averageScore completedAt type difficulty');

    // Calculate performance trends
    const performanceTrend = recentSessions.map(session => ({
      date: session.completedAt,
      score: session.analytics.averageScore,
      type: session.type,
      difficulty: session.difficulty
    }));

    // Category performance analysis
    const categoryPerformance = {};
    recentSessions.forEach(session => {
      if (!categoryPerformance[session.type]) {
        categoryPerformance[session.type] = {
          sessions: 0,
          totalScore: 0,
          averageScore: 0
        };
      }
      categoryPerformance[session.type].sessions++;
      categoryPerformance[session.type].totalScore += session.analytics.averageScore;
      categoryPerformance[session.type].averageScore = 
        categoryPerformance[session.type].totalScore / categoryPerformance[session.type].sessions;
    });

    const analytics = {
      overview: {
        ...sessionAnalytics,
        ...userStats
      },
      performanceTrend,
      categoryPerformance,
      recommendations: generateRecommendations(sessionAnalytics, categoryPerformance)
    };

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

// @route   GET /api/users/history
// @desc    Get user's interview history
// @access  Private
router.get('/history', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const type = req.query.type;

    let query = { user: userId };
    if (status) query.status = status;
    if (type) query.type = type;

    const sessions = await InterviewSession.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-questions.aiAnalysis.suggestedAnswer') // Don't send suggested answers
      .populate('user', 'name email');

    const total = await InterviewSession.countDocuments(query);

    // Add summary statistics for each session
    const sessionsWithSummary = sessions.map(session => {
      const sessionObj = session.toObject();
      sessionObj.summary = {
        questionsAnswered: session.analytics.answeredQuestions,
        totalQuestions: session.analytics.totalQuestions,
        averageScore: session.analytics.averageScore,
        completionPercentage: session.completionPercentage,
        duration: session.duration
      };
      return sessionObj;
    });

    res.json({
      success: true,
      sessions: sessionsWithSummary,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get interview history'
    });
  }
});

// @route   GET /api/users/dashboard
// @desc    Get dashboard data (summary of user activity)
// @access  Private
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get recent activity
    const recentSessions = await InterviewSession.find({
      user: userId
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('sessionId type jobRole status analytics createdAt completedAt');

    // Get quick stats
    const totalSessions = await InterviewSession.countDocuments({ user: userId });
    const completedSessions = await InterviewSession.countDocuments({ 
      user: userId, 
      status: 'completed' 
    });

    // Get current active session
    const activeSession = await InterviewSession.findOne({
      user: userId,
      status: 'active'
    }).select('sessionId type jobRole createdAt questions');

    const dashboard = {
      user: {
        name: req.user.name,
        credits: req.user.credits,
        subscriptionType: req.user.subscription.type
      },
      quickStats: {
        totalSessions,
        completedSessions,
        averageScore: req.user.stats.averageScore,
        totalQuestions: req.user.stats.totalQuestions
      },
      recentActivity: recentSessions,
      activeSession,
      nextSteps: generateNextSteps(req.user, recentSessions)
    };

    res.json({
      success: true,
      dashboard
    });

  } catch (error) {
    logger.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data'
    });
  }
});

// @route   POST /api/users/feedback
// @desc    Submit feedback about the platform
// @access  Private
router.post('/feedback', authenticate, async (req, res) => {
  try {
    const { rating, comments, category } = req.body;
    const userId = req.user.id;

    // In a real implementation, you'd save this to a feedback collection
    logger.info(`User feedback received: ${userId}, rating: ${rating}, category: ${category}`);

    res.json({
      success: true,
      message: 'Thank you for your feedback!'
    });

  } catch (error) {
    logger.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback'
    });
  }
});

// Helper function to generate recommendations
function generateRecommendations(sessionAnalytics, categoryPerformance) {
  const recommendations = [];

  if (sessionAnalytics.totalSessions === 0) {
    recommendations.push({
      type: 'getting-started',
      title: 'Start Your First Interview',
      description: 'Take your first mock interview to get personalized feedback.',
      action: 'Start Interview'
    });
  }

  if (sessionAnalytics.averageScore < 70) {
    recommendations.push({
      type: 'improvement',
      title: 'Focus on Fundamentals',
      description: 'Your average score suggests focusing on basic interview skills.',
      action: 'Practice Easy Questions'
    });
  }

  // Category-specific recommendations
  Object.entries(categoryPerformance).forEach(([category, performance]) => {
    if (performance.averageScore < 60) {
      recommendations.push({
        type: 'category-improvement',
        title: `Improve ${category.charAt(0).toUpperCase() + category.slice(1)} Skills`,
        description: `Your ${category} interview performance could use improvement.`,
        action: `Practice ${category} Questions`
      });
    }
  });

  if (sessionAnalytics.totalSessions > 5 && sessionAnalytics.averageScore > 80) {
    recommendations.push({
      type: 'advanced',
      title: 'Try Advanced Questions',
      description: 'You\'re performing well! Challenge yourself with harder questions.',
      action: 'Start Hard Interview'
    });
  }

  return recommendations.slice(0, 3); // Return top 3 recommendations
}

// Helper function to generate next steps
function generateNextSteps(user, recentSessions) {
  const nextSteps = [];

  if (!user.resumeData || !user.resumeData.skills.length) {
    nextSteps.push({
      title: 'Upload Your Resume',
      description: 'Get personalized questions based on your experience',
      priority: 'high'
    });
  }

  if (recentSessions.length === 0) {
    nextSteps.push({
      title: 'Take Your First Interview',
      description: 'Start with a general interview to assess your skills',
      priority: 'high'
    });
  }

  if (user.credits < 10) {
    nextSteps.push({
      title: 'Consider Upgrading',
      description: 'Get more credits and advanced features',
      priority: 'medium'
    });
  }

  return nextSteps;
}

module.exports = router;
