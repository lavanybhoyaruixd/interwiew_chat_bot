const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

// Middleware to authenticate JWT tokens
const authenticate = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }

    logger.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed.'
    });
  }
};

// Middleware to check if user has enough credits
const checkCredits = (amount = 1) => {
  return async (req, res, next) => {
    try {
      if (!req.user.hasCredits(amount)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient credits. Please purchase more credits or upgrade your plan.',
          credits: req.user.credits,
          required: amount
        });
      }
      next();
    } catch (error) {
      logger.error('Credit check error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check credits.'
      });
    }
  };
};

// Middleware to check subscription type
const checkSubscription = (requiredPlans = []) => {
  return async (req, res, next) => {
    try {
      const userPlan = req.user.subscription.type;
      
      if (!requiredPlans.includes(userPlan)) {
        return res.status(403).json({
          success: false,
          message: `This feature requires ${requiredPlans.join(' or ')} subscription.`,
          currentPlan: userPlan,
          requiredPlans
        });
      }
      
      next();
    } catch (error) {
      logger.error('Subscription check error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check subscription.'
      });
    }
  };
};

// Middleware for optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

// Helper function to extract token from request
const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check for token in cookies (for web app)
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  
  return null;
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Middleware to validate token format (for development/testing)
const validateTokenFormat = (req, res, next) => {
  const token = getTokenFromRequest(req);
  
  if (token && !token.match(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid token format.'
    });
  }
  
  next();
};

module.exports = {
  authenticate,
  checkCredits,
  checkSubscription,
  optionalAuth,
  generateToken,
  validateTokenFormat
};
