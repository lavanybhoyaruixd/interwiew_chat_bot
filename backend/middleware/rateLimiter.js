const rateLimit = require('express-rate-limit');
const { RateLimiterMemory } = require('rate-limiter-flexible');

// Rate limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// More aggressive rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for file uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 uploads per hour
  message: 'Too many file uploads from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// In-memory rate limiting for specific endpoints
const createRateLimiter = (points = 10, duration = 60) => {
  return new RateLimiterMemory({
    points: points, // Number of points
    duration: duration, // Per second(s)
  });
};

// Rate limiter for resume analysis
const resumeAnalysisLimiter = createRateLimiter(5, 60); // 5 requests per minute

const resumeAnalysisRateLimiter = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  resumeAnalysisLimiter.consume(clientIP)
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).json({
        success: false,
        message: 'Too many resume analysis requests. Please try again later.'
      });
    });
};

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter,
  resumeAnalysisRateLimiter
};
