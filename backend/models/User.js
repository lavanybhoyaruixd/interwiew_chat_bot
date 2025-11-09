const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: null
  },
  credits: {
    type: Number,
    default: 100
  },
  subscription: {
    type: {
      type: String,
      enum: ['free', 'premium', 'enterprise'],
      default: 'free'
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    currentPeriodEnd: Date,
    status: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'incomplete'],
      default: 'active'
    }
  },
  profile: {
    currentRole: String,
    targetRole: String,
    experience: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'executive']
    },
    skills: [String],
    industries: [String]
  },
  preferences: {
    interviewTypes: [{
      type: String,
      enum: ['technical', 'behavioral', 'case-study', 'system-design']
    }],
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    }
  },
  stats: {
    totalInterviews: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    improvementRate: { type: Number, default: 0 }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Index for better query performance
// Email index is already created by unique: true
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Pre-save middleware to update lastLogin
userSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('lastLogin')) {
    this.lastLogin = Date.now();
  }
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if user has enough credits
userSchema.methods.hasCredits = function(amount = 1) {
  return this.credits >= amount;
};

// Instance method to deduct credits
userSchema.methods.deductCredits = async function(amount = 1) {
  if (this.hasCredits(amount)) {
    this.credits -= amount;
    await this.save();
    return true;
  }
  return false;
};

// Instance method to add credits
userSchema.methods.addCredits = async function(amount) {
  this.credits += amount;
  await this.save();
  return this.credits;
};

module.exports = mongoose.model('User', userSchema);
