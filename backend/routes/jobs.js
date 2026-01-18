const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const jobController = require('../controllers/jobController');
const router = express.Router();
router.get('/suggestions', optionalAuth, jobController.getJobSuggestions);
module.exports = router;
