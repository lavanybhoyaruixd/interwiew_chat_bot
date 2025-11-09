const Joi = require('joi');
const logger = require('../utils/logger');

// Generic validation middleware
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, '')
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    next();
  };
};

// User registration validation schema
const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'any.required': 'Password is required'
    })
});

// User login validation schema
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// Profile update validation schema
const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  currentRole: Joi.string().max(100).optional(),
  targetRole: Joi.string().max(100).optional(),
  experience: Joi.string().valid('entry', 'mid', 'senior', 'executive').optional(),
  skills: Joi.array().items(Joi.string().max(50)).max(20).optional(),
  industries: Joi.array().items(Joi.string().max(50)).max(10).optional(),
  preferences: Joi.object({
    interviewTypes: Joi.array().items(
      Joi.string().valid('technical', 'behavioral', 'case-study', 'system-design')
    ).optional(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard').optional(),
    notifications: Joi.object({
      email: Joi.boolean().optional(),
      push: Joi.boolean().optional()
    }).optional()
  }).optional()
});

// Interview session creation validation schema
const createSessionSchema = Joi.object({
  type: Joi.string()
    .valid('technical', 'behavioral', 'case-study', 'system-design', 'general')
    .required()
    .messages({
      'any.only': 'Interview type must be one of: technical, behavioral, case-study, system-design, general',
      'any.required': 'Interview type is required'
    }),
  
  difficulty: Joi.string()
    .valid('easy', 'medium', 'hard')
    .default('medium'),
  
  jobRole: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Job role must be at least 2 characters long',
      'string.max': 'Job role cannot exceed 100 characters',
      'any.required': 'Job role is required'
    }),
  
  company: Joi.string().max(100).optional(),
  
  questionCount: Joi.number()
    .integer()
    .min(1)
    .max(20)
    .default(5)
    .messages({
      'number.min': 'Question count must be at least 1',
      'number.max': 'Question count cannot exceed 20'
    })
});

// Answer submission validation schema
const submitAnswerSchema = Joi.object({
  sessionId: Joi.string()
    .required()
    .messages({
      'any.required': 'Session ID is required'
    }),
  
  questionId: Joi.string()
    .required()
    .messages({
      'any.required': 'Question ID is required'
    }),
  
  answer: Joi.string()
    .min(10)
    .max(5000)
    .required()
    .messages({
      'string.min': 'Answer must be at least 10 characters long',
      'string.max': 'Answer cannot exceed 5000 characters',
      'any.required': 'Answer is required'
    }),
  
  timeSpent: Joi.number()
    .integer()
    .min(1)
    .max(3600)
    .optional()
    .messages({
      'number.min': 'Time spent must be at least 1 second',
      'number.max': 'Time spent cannot exceed 1 hour'
    }),
  
  confidence: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .optional()
    .messages({
      'number.min': 'Confidence must be between 1 and 5',
      'number.max': 'Confidence must be between 1 and 5'
    })
});

// Question creation validation schema (for admin)
const createQuestionSchema = Joi.object({
  question: Joi.string()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.min': 'Question must be at least 10 characters long',
      'string.max': 'Question cannot exceed 1000 characters',
      'any.required': 'Question text is required'
    }),
  
  category: Joi.string()
    .valid('technical', 'behavioral', 'case-study', 'system-design', 'general')
    .required(),
  
  subcategory: Joi.string()
    .max(50)
    .required(),
  
  difficulty: Joi.string()
    .valid('easy', 'medium', 'hard')
    .required(),
  
  jobRoles: Joi.array()
    .items(Joi.string().max(100))
    .min(1)
    .required(),
  
  skills: Joi.array()
    .items(Joi.string().max(50))
    .optional(),
  
  industries: Joi.array()
    .items(Joi.string().max(50))
    .optional(),
  
  estimatedTime: Joi.number()
    .integer()
    .min(1)
    .max(60)
    .default(5),
  
  sampleAnswer: Joi.string()
    .max(2000)
    .optional()
});

// Payment validation schemas
const createPaymentSchema = Joi.object({
  packageType: Joi.string()
    .valid('small', 'medium', 'large')
    .required()
    .messages({
      'any.only': 'Package type must be one of: small, medium, large',
      'any.required': 'Package type is required'
    })
});

const createSubscriptionSchema = Joi.object({
  planType: Joi.string()
    .valid('premium', 'enterprise')
    .required()
    .messages({
      'any.only': 'Plan type must be premium or enterprise',
      'any.required': 'Plan type is required'
    })
});

// Password reset validation schemas
const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    })
});

const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Reset token is required'
    }),
  
  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'any.required': 'Password is required'
    })
});

// Change password validation schema
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),
  
  newPassword: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.min': 'New password must be at least 6 characters long',
      'string.max': 'New password cannot exceed 128 characters',
      'any.required': 'New password is required'
    })
});

// Export validation middleware functions
module.exports = {
  validate,
  
  // Auth validations
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
  validateUpdateProfile: validate(updateProfileSchema),
  validateForgotPassword: validate(forgotPasswordSchema),
  validateResetPassword: validate(resetPasswordSchema),
  validateChangePassword: validate(changePasswordSchema),
  
  // Interview validations
  validateCreateSession: validate(createSessionSchema),
  validateSubmitAnswer: validate(submitAnswerSchema),
  validateCreateQuestion: validate(createQuestionSchema),
  
  // Payment validations
  validateCreatePayment: validate(createPaymentSchema),
  validateCreateSubscription: validate(createSubscriptionSchema),
  
  // Raw schemas for custom validation
  schemas: {
    registerSchema,
    loginSchema,
    updateProfileSchema,
    createSessionSchema,
    submitAnswerSchema,
    createQuestionSchema,
    createPaymentSchema,
    createSubscriptionSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema
  }
};
