const express = require('express');
const axios = require('axios');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/suggestions
// Query params:
// - query (string)
// - limit (number, default 5)
router.get('/suggestions', async (req, res) => {
  try {
    const queryInput = (req.query.query || '').trim();
    const query = queryInput || 'software engineer';
    const limit = Number.isInteger(parseInt(req.query.limit, 10))
      ? Math.max(1, parseInt(req.query.limit, 10))
      : 5;

    const rapidKey = process.env.RAPIDAPI_JSEARCH_KEY;
    const rapidHost = process.env.RAPIDAPI_JSEARCH_HOST || 'jsearch.p.rapidapi.com';

    if (!rapidKey) {
      return res.status(500).json({
        success: false,
        message: 'RapidAPI key not configured'
      });
    }

    const url = new URL('https://jsearch.p.rapidapi.com/search');
    url.searchParams.set('query', query);
    url.searchParams.set('page', '1');
    url.searchParams.set('num_pages', '1');

    const { data } = await axios.get(url.toString(), {
      timeout: 12000,
      headers: {
        'x-rapidapi-key': rapidKey,
        'x-rapidapi-host': rapidHost
      }
    });

    const items = Array.isArray(data?.data) ? data.data.slice(0, limit) : [];
    const suggestions = items.map(item => ({
      title: item?.job_title || 'Job Title',
      company: item?.employer_name || 'Company',
      location: [item?.job_city, item?.job_state, item?.job_country].filter(Boolean).join(', ') || 'Remote',
      applyUrl: item?.job_apply_link || item?.job_google_link || ''
    }));

    return res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    logger.error('Failed to fetch job suggestions:', error?.message || error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch suggestions'
    });
  }
});

module.exports = router;
