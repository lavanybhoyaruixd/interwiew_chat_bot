const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['technical', 'behavioral', 'case-study', 'system-design', 'general'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  jobRole: {
    type: String,
    required: true
  },
  company: String,
  questions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    question: String,
    userAnswer: String,
    aiAnalysis: {
      score: { type: Number, min: 0, max: 100 },
      feedback: String,
      strengths: [String],
      improvements: [String],
      suggestedAnswer: String
    },
    answeredAt: Date,
    timeSpent: Number, // in seconds
    confidence: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  overallFeedback: {
    totalScore: { type: Number, min: 0, max: 100 },
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
    improvementAreas: [String]
  },
  analytics: {
    totalQuestions: { type: Number, default: 0 },
    answeredQuestions: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    totalTimeSpent: { type: Number, default: 0 }, // in seconds
    averageTimePerQuestion: { type: Number, default: 0 },
    confidenceDistribution: {
      veryLow: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      veryHigh: { type: Number, default: 0 }
    }
  },
  resumeData: {
    filename: String,
    extractedText: String,
    skills: [String],
    experience: String,
    education: String
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  creditsUsed: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for session duration
interviewSessionSchema.virtual('duration').get(function() {
  if (this.completedAt && this.startedAt) {
    return Math.floor((this.completedAt - this.startedAt) / 1000); // in seconds
  }
  return null;
});

// Virtual for completion percentage
interviewSessionSchema.virtual('completionPercentage').get(function() {
  if (this.analytics.totalQuestions === 0) return 0;
  return Math.round((this.analytics.answeredQuestions / this.analytics.totalQuestions) * 100);
});

// Index for better query performance
interviewSessionSchema.index({ user: 1, createdAt: -1 });
// sessionId index is already created by unique: true
interviewSessionSchema.index({ status: 1 });

// Pre-save middleware to update analytics
interviewSessionSchema.pre('save', function(next) {
  if (this.isModified('questions')) {
    this.analytics.totalQuestions = this.questions.length;
    this.analytics.answeredQuestions = this.questions.filter(q => q.userAnswer).length;
    
    const answeredQuestions = this.questions.filter(q => q.userAnswer && q.aiAnalysis && q.aiAnalysis.score);
    if (answeredQuestions.length > 0) {
      this.analytics.averageScore = answeredQuestions.reduce((sum, q) => sum + q.aiAnalysis.score, 0) / answeredQuestions.length;
    }
    
    this.analytics.totalTimeSpent = this.questions.reduce((sum, q) => sum + (q.timeSpent || 0), 0);
    if (this.analytics.answeredQuestions > 0) {
      this.analytics.averageTimePerQuestion = this.analytics.totalTimeSpent / this.analytics.answeredQuestions;
    }

    // Update confidence distribution
    const confidenceDistribution = { veryLow: 0, low: 0, medium: 0, high: 0, veryHigh: 0 };
    this.questions.forEach(q => {
      if (q.confidence) {
        switch (q.confidence) {
          case 1: confidenceDistribution.veryLow++; break;
          case 2: confidenceDistribution.low++; break;
          case 3: confidenceDistribution.medium++; break;
          case 4: confidenceDistribution.high++; break;
          case 5: confidenceDistribution.veryHigh++; break;
        }
      }
    });
    this.analytics.confidenceDistribution = confidenceDistribution;

    // Calculate overall feedback if session is completed
    if (this.status === 'completed' && answeredQuestions.length > 0) {
      this.overallFeedback.totalScore = this.analytics.averageScore;
    }
  }
  next();
});

// Static method to get user's interview history
interviewSessionSchema.statics.getUserHistory = function(userId, limit = 10) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'name email')
    .select('-questions.aiAnalysis.suggestedAnswer'); // Don't send suggested answers in history
};

// Static method to get user's analytics
interviewSessionSchema.statics.getUserAnalytics = async function(userId) {
  const sessions = await this.find({ user: userId, status: 'completed' });
  
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      averageScore: 0,
      totalQuestions: 0,
      improvementTrend: [],
      strongAreas: [],
      weakAreas: []
    };
  }

  const totalSessions = sessions.length;
  const totalQuestions = sessions.reduce((sum, session) => sum + session.analytics.totalQuestions, 0);
  const averageScore = sessions.reduce((sum, session) => sum + session.analytics.averageScore, 0) / totalSessions;

  // Calculate improvement trend (last 5 sessions)
  const recentSessions = sessions.slice(0, 5).reverse();
  const improvementTrend = recentSessions.map(session => ({
    date: session.createdAt,
    score: session.analytics.averageScore
  }));

  return {
    totalSessions,
    averageScore: Math.round(averageScore * 100) / 100,
    totalQuestions,
    improvementTrend,
    strongAreas: [], // Can be calculated based on question categories
    weakAreas: []   // Can be calculated based on question categories
  };
};

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
