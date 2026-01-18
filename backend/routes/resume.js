/* eslint-env node */
/* global module, require, process */
const express = require('express');
const multer = require('multer');

const asyncHandler = require('../middleware/asyncHandler');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { ApiError } = require('../utils/ApiError');
const resumeService = require('../services/resumeService');
const aiService = require('../services/aiService');
const { setResumeText, getResumeText, clearResumeText } = require('../services/resumeContext');
const logger = require('../utils/logger');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

async function processResumeFile(file, userId = 'anonymous') {
  const validationErrors = resumeService.validateFile(file);
  if (validationErrors.length) {
    throw new ApiError(400, 'Invalid resume upload', validationErrors);
  }

  const processed = await resumeService.processResumeInMemory(file, userId);
  if (processed?.extractedText) {
    setResumeText(processed.extractedText);
  }

  let sampleQuestions = [];
  try {
    sampleQuestions = await resumeService.generateQuestionsFromResume(
      processed,
      processed.currentRole || 'Software Engineer',
      'medium',
      3
    );
  } catch (error) {
    logger.warn('Failed to generate sample questions for resume upload:', error.message);
  }

  return {
    processed,
    sampleQuestions
  };
}

router.post(
  '/upload',
  uploadLimiter,
  upload.single('resume'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ApiError(400, 'Please attach a PDF resume');
    }

    const userId = req.user?.id || 'anonymous';
    const { processed, sampleQuestions } = await processResumeFile(req.file, userId);

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        metadata: processed.metadata,
        basicInfo: processed.basicInfo,
        aiAnalysis: processed.aiAnalysis,
        processingSummary: processed.processingSummary,
        sampleQuestions,
        textPreview: processed.extractedText?.slice(0, 600) || '',
        stats: {
          length: processed.textLength,
          skillsFound: processed.skills?.length || 0
        }
      }
    });
  })
);

router.post(
  '/analyze',
  uploadLimiter,
  upload.single('resume'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ApiError(400, 'Please attach a PDF resume');
    }

    const userId = req.user?.id || 'anonymous';
    const { processed, sampleQuestions } = await processResumeFile(req.file, userId);
    const jobId = processed.metadata?.analysisId || processed.sessionInfo?.analysisId;

    res.json({
      success: true,
      message: 'Resume analyzed successfully',
      jobId,
      statusUrl: jobId ? `/api/resume/status/${jobId}` : null,
      data: {
        metadata: processed.metadata,
        basicInfo: processed.basicInfo,
        aiAnalysis: processed.aiAnalysis,
        processingSummary: processed.processingSummary,
        resumeData: {
          filename: processed.filename,
          fileSize: processed.fileSize,
          skills: processed.skills,
          experience: processed.experience,
          education: processed.education,
          currentRole: processed.currentRole,
          industries: processed.industries,
          yearsOfExperience: processed.yearsOfExperience,
          keyAchievements: processed.keyAchievements
        },
        sampleQuestions
      }
    });
  })
);

router.get(
  '/status/:jobId',
  asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    res.json({
      success: true,
      jobId,
      status: 'completed',
      message: 'Resume analysis completed',
      progress: 100
    });
  })
);

router.post(
  '/skills',
  asyncHandler(async (req, res) => {
    const { text } = req.body || {};
    if (!text || !text.trim()) {
      throw new ApiError(400, 'Resume text is required');
    }

    const extracted = await aiService.extractResumeInfo(text);
    res.json({
      success: true,
      data: extracted
    });
  })
);

router.post(
  '/ask',
  asyncHandler(async (req, res) => {
    const { question } = req.body || {};
    if (!question || !question.trim()) {
      throw new ApiError(400, 'Question is required');
    }

    const resumeText = getResumeText();
    if (!resumeText) {
      throw new ApiError(400, 'Please upload a resume before asking questions');
    }

    const prompt = `You are an AI resume assistant. Answer the user's question using the resume below.
Resume:
${resumeText.substring(0, 8000)}

Question: ${question}

Answer:`;

    const response = await aiService.groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are a precise assistant that answers questions strictly using the provided resume.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 350
    });

    const answer = response.choices?.[0]?.message?.content?.trim() || 'I could not find that information in the resume.';

    res.json({
      success: true,
      answer
    });
  })
);

router.post(
  '/ask',
  asyncHandler(async (req, res) => {
    const { question } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Question is required'
      });
    }

    const resumeText = getResumeText();
    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: 'No resume uploaded. Please upload a resume first.'
      });
    }

    logger.info('Answering question about resume');

    const prompt = `Based on the following resume, answer the question. If the information is not in the resume, respond with "This information is not available in the resume."

Resume:
${resumeText.substring(0, 8000)}

Question: ${question.trim()}

Answer:`;

    const response = await aiService.groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that answers questions based on the provided resume. Be concise and accurate.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1024
    });

    const answer = response.choices?.[0]?.message?.content?.trim() || 'I apologize, but I was unable to generate an answer to your question.';

    res.json({
      success: true,
      answer,
      message: 'Question answered successfully'
    });
  })
);

router.delete(
  '/session',
  asyncHandler(async (req, res) => {
    clearResumeText();
    res.json({
      success: true,
      message: 'Resume session cleared'
    });
  })
);

module.exports = router;
