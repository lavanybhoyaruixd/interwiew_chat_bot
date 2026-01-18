/* eslint-env node */
/* global require, module, process */
const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { analyzeResume } = require('../controllers/atsController');
const { uploadLimiter } = require('../middleware/rateLimiter');
const asyncHandler = require('../middleware/asyncHandler');
const { setResumeText } = require('../services/resumeContext');
const logger = require('../utils/logger');

const router = express.Router();

// Configure multer for PDF upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

/**
 * @route   POST /api/ats/analyze
 * @desc    Upload PDF resume and get real-time ATS score from Groq AI
 * @access  Public
 */
router.post(
  '/analyze',
  uploadLimiter,
  upload.single('resume'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF resume'
      });
    }

    logger.info(`Processing ATS analysis for: ${req.file.originalname}`);

    // Extract text from PDF
    let resumeText = '';
    try {
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = pdfData.text.trim();
      
      if (!resumeText || resumeText.length < 50) {
        return res.status(400).json({
          success: false,
          message: 'Could not extract text from PDF. Please ensure the PDF is not image-based or corrupted.'
        });
      }
      
      // Store resume text for Q&A functionality
      setResumeText(resumeText);
    } catch (pdfError) {
      logger.error('PDF parsing error:', pdfError);
      return res.status(400).json({
        success: false,
        message: 'Failed to parse PDF file',
        error: process.env.NODE_ENV === 'development' ? pdfError.message : undefined
      });
    }

    // Get optional job description from request body
    const jobDescription = req.body.jobDescription || '';

    // Analyze with Groq AI
    const atsController = require('../controllers/atsController');
    const atsAnalysis = await atsController.analyzeATSScore(resumeText, jobDescription);

    res.json({
      success: true,
      data: atsAnalysis,
      message: 'ATS analysis completed successfully'
    });
  })
);

/**
 * @route   POST /api/ats/analyze-text
 * @desc    Analyze resume text directly (without file upload)
 * @access  Public
 */
router.post(
  '/analyze-text',
  uploadLimiter,
  asyncHandler(analyzeResume)
);

module.exports = router;
