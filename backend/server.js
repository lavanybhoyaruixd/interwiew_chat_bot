/* eslint-env node */
/* eslint-disable no-undef */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/database');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const interviewRoutes = require('./routes/interview');
const paymentRoutes = require('./routes/payments');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chat');
const enhancedChatRoutes = require('./routes/enhancedChat');
// const resumeAnalysisRoutes = require('./routes/resumeAnalysis'); // Commented out as it's causing conflicts
const resumeRoutes = require('./routes/resume');
const atsRoutes = require('./routes/ats');
const jobsRoutes = require('./routes/jobs');
const groqRoutes = require('./routes/groq');
const suggestionsRoutes = require('./routes/suggestions');

const app = express();

// Connect to MongoDB
connectDB();


// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const envOrigins = (process.env.CLIENT_URL || '')
      .split(',')
      .map(o => o.trim())
      .filter(Boolean);
    const staticOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174'
    ];
    const allowedOrigins = [...new Set([...envOrigins, ...staticOrigins])];

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    const allowAnyLocalInDev = process.env.NODE_ENV !== 'production' && isLocalhost;

    if (allowedOrigins.includes(origin) || allowAnyLocalInDev) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);

// Request timeout to prevent hanging requests
const requestTimeout = require('./middleware/requestTimeout');
app.use(requestTimeout(parseInt(process.env.REQUEST_TIMEOUT_MS) || 30000));

// Apply stricter rate limiting to auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  skipSuccessfulRequests: true
});

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Handle Stripe webhooks (raw body needed) - BEFORE body parsing
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/enhanced-chat', enhancedChatRoutes);
// app.use('/api/resume', resumeAnalysisRoutes); // Commented out as it's causing conflicts
app.use('/api/resume', resumeRoutes); // Using the main resume routes
app.use('/api/ats', atsRoutes); // Real-time ATS scoring with Groq AI
app.use('/api/jobs', jobsRoutes); // Job suggestions & matching
app.use('/api', groqRoutes); // Groq AI chat completions
app.use('/api', suggestionsRoutes); // Simple job suggestions (RapidAPI JSearch)


// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'HireMate Backend API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      interview: '/api/interview',
      payments: '/api/payments',
      users: '/api/users',
      chat: '/api/chat'
    }
  });
});


// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
// Global error handler (centralized)
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // CORS error
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation'
    });
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : error.message;

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
  logger.info(`API Documentation: http://localhost:${PORT}/api/docs`);
});

module.exports = app;
