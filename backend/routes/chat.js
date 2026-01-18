/* eslint-env node */
/* eslint-disable no-undef */
const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const chatController = require('../controllers/chatController');

// NOTE: Original inline logic moved to chatController for clarity & testability.
// Existing endpoint paths preserved. Each handler wrapped with asyncHandler.
const router = express.Router();

// @route   POST /api/chat/message
// @desc    Send a general chat message to AI
// @access  Public (with optional auth for enhanced features)
router.post('/message', optionalAuth, asyncHandler(chatController.message));

// @route   POST /api/chat/explain
// @desc    Get detailed explanation about a topic
// @access  Public
router.post('/explain', optionalAuth, asyncHandler(chatController.explain));

// @route   POST /api/chat/ask
// @desc    Smart AI response that adapts to question type
// @access  Public
router.post('/ask', optionalAuth, asyncHandler(chatController.ask));

// @route   GET /api/chat/stream
// @desc    Stream AI response using Server-Sent Events
// @access  Public
router.get('/stream', optionalAuth, asyncHandler(chatController.stream));

// @route   POST /api/chat/help
// @desc    Get help with coding or technical questions
// @access  Public
router.post('/help', optionalAuth, asyncHandler(chatController.help));

module.exports = router;
