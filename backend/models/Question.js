const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['technical', 'behavioral', 'case-study', 'system-design', 'general'],
    required: true
  },
  subcategory: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  jobRoles: [{
    type: String,
    required: true
  }],
  skills: [String],
  industries: [String],
  followUpQuestions: [String],
  sampleAnswer: {
    type: String,
    select: false // Don't include in regular queries
  },
  evaluationCriteria: [{
    criterion: String,
    weight: { type: Number, min: 0, max: 1 },
    description: String
  }],
  tags: [String],
  estimatedTime: {
    type: Number, // in minutes
    default: 5
  },
  usage: {
    timesAsked: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    averageTime: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    enum: ['system', 'ai-generated', 'admin'],
    default: 'system'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
questionSchema.index({ category: 1, difficulty: 1 });
questionSchema.index({ jobRoles: 1 });
questionSchema.index({ skills: 1 });
questionSchema.index({ isActive: 1 });
questionSchema.index({ 'usage.averageScore': -1 });

// Virtual for difficulty score
questionSchema.virtual('difficultyScore').get(function() {
  const scores = { easy: 1, medium: 2, hard: 3 };
  return scores[this.difficulty] || 2;
});

// Static method to find questions by criteria
questionSchema.statics.findByCriteria = function(criteria) {
  const {
    category,
    difficulty,
    jobRole,
    skills = [],
    limit = 10,
    excludeIds = []
  } = criteria;

  let query = this.find({ isActive: true });

  if (category) query = query.where('category').equals(category);
  if (difficulty) query = query.where('difficulty').equals(difficulty);
  if (jobRole) query = query.where('jobRoles').in([jobRole]);
  if (skills.length > 0) query = query.where('skills').in(skills);
  if (excludeIds.length > 0) query = query.where('_id').nin(excludeIds);

  return query.limit(limit).select('-sampleAnswer');
};

// Static method to get random questions
questionSchema.statics.getRandomQuestions = function(criteria) {
  const {
    category,
    difficulty,
    jobRole,
    skills = [],
    count = 5,
    excludeIds = []
  } = criteria;

  let pipeline = [
    { $match: { isActive: true } }
  ];

  // Add filters
  if (category) pipeline[0].$match.category = category;
  if (difficulty) pipeline[0].$match.difficulty = difficulty;
  if (jobRole) pipeline[0].$match.jobRoles = { $in: [jobRole] };
  if (skills.length > 0) pipeline[0].$match.skills = { $in: skills };
  if (excludeIds.length > 0) pipeline[0].$match._id = { $nin: excludeIds };

  pipeline.push(
    { $sample: { size: count } },
    { $project: { sampleAnswer: 0 } } // Exclude sample answer
  );

  return this.aggregate(pipeline);
};

// Instance method to update usage statistics
questionSchema.methods.updateUsage = async function(score, timeSpent) {
  this.usage.timesAsked += 1;
  
  if (score !== undefined) {
    // Calculate new average score
    const totalScore = (this.usage.averageScore * (this.usage.timesAsked - 1)) + score;
    this.usage.averageScore = totalScore / this.usage.timesAsked;
  }
  
  if (timeSpent !== undefined) {
    // Calculate new average time
    const totalTime = (this.usage.averageTime * (this.usage.timesAsked - 1)) + timeSpent;
    this.usage.averageTime = totalTime / this.usage.timesAsked;
  }
  
  await this.save();
};

// Static method to get popular questions
questionSchema.statics.getPopularQuestions = function(category, limit = 10) {
  let query = this.find({ isActive: true });
  
  if (category) {
    query = query.where('category').equals(category);
  }
  
  return query
    .sort({ 'usage.timesAsked': -1, 'usage.averageScore': -1 })
    .limit(limit)
    .select('-sampleAnswer');
};

// Static method to get trending questions (recently asked frequently)
questionSchema.statics.getTrendingQuestions = function(category, limit = 10) {
  // This would require tracking when questions were asked
  // For now, return popular questions
  return this.getPopularQuestions(category, limit);
};

module.exports = mongoose.model('Question', questionSchema);
