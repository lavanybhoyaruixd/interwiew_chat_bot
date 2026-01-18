/* eslint-env node */
/* eslint-disable no-undef */
const asyncHandler = require("../middleware/asyncHandler");
const jobBoardService = require("../services/jobBoardService");
const logger = require("../utils/logger");

// In-memory cache (key -> { timestamp, jobs })
const jobCache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// Simple relevance scoring (LEVEL 2 foundation)
function computeMatchScore(job, query, skills) {
  let score = 0;
  const title = (job.title || '').toLowerCase();
  const q = query.toLowerCase();
  if (title.includes(q)) score += 40; // title match
  const jobTags = Array.isArray(job.tags) ? job.tags.map(t => t.toLowerCase()) : [];
  skills.forEach(skill => {
    if (jobTags.includes(skill)) score += 5; // skill/tag match
  });
  return score;
}

// Placeholder: future AI-based skill extraction from user profile / resume
function extractUserSkillsPlaceholder(req) {
  // In production, parse resume or user profile to derive robust skill list.
  // For now, parse ?skills=react,node,aws or default minimal set.
  const skillsRaw = (req.query.skills || '').trim();
  if (!skillsRaw) return ['javascript', 'react', 'node'];
  return skillsRaw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
}

// Placeholder: future ATS ↔ Job semantic relevance scoring
function computeAtsRelevancePlaceholder(job, userSkills) {
  // Future: embed job description + resume text, cosine similarity.
  // For now, proportional to number of matching tags * 2.
  const tags = Array.isArray(job.tags) ? job.tags.map(t => t.toLowerCase()) : [];
  const matches = userSkills.filter(s => tags.includes(s)).length;
  return matches * 2; // lightweight placeholder
}

function buildCacheMeta(entry, now) {
  if (!entry) return { hit: false, ageMs: 0, stale: false, refreshed: false };
  const age = now - entry.timestamp;
  const stale = age >= CACHE_TTL_MS;
  return { hit: true, ageMs: age, stale, refreshed: false };
}

const getJobSuggestions = asyncHandler(async (req, res) => {
  const overallStart = Date.now();
  const userId = req.user?.id || 'test-user';

  // Params & defaults
  const limit = Number.isInteger(parseInt(req.query.limit, 10)) ? parseInt(req.query.limit, 10) : 10;
  const page = Number.isInteger(parseInt(req.query.page, 10)) ? Math.max(1, parseInt(req.query.page, 10)) : 1;
  const queryInput = (req.query.query || '').trim();
  const query = queryInput.length > 0 ? queryInput : 'software developer';
  const locationFilter = (req.query.location || '').trim().toLowerCase();
  const typeFilter = (req.query.type || '').trim().toLowerCase();
  const userSkills = extractUserSkillsPlaceholder(req);

  // Cache key (exclude pagination)
  const cacheKey = `${query.toLowerCase()}::${locationFilter}::${typeFilter}::${userSkills.join('|')}`;
  const now = Date.now();
  const existingCache = jobCache.get(cacheKey);
  const cacheMeta = buildCacheMeta(existingCache, now);

  if (cacheMeta.hit && !cacheMeta.stale) {
    const ranked = existingCache.ranked;
    const total = ranked.length;
    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;
    const pageJobs = ranked.slice(startIdx, endIdx);
    logger.info(`[JOB_SUGGESTIONS][CACHE_HIT] key='${cacheKey}' user='${userId}' total=${total} page=${page}`);
    return res.json({
      success: true,
      message: 'Job suggestions served from cache',
      data: {
        query,
        jobs: pageJobs,
        performance: {
          averageScore: 85,
          preferredRoles: [query],
          strengths: ['communication', 'problem-solving']
        }
      },
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        cache: { ...cacheMeta, provider: existingCache.provider, latencyMs: 0, fresh: false }
      }
    });
  }

  // Fetch providers with fallback
  let primaryProvider = 'rapid-jsearch';
  let providersUsed = [];
  let jobsCombined = [];
  let fetchError = null;
  let latencyMs = 0;

  try {
    const fetchStart = Date.now();
    let rapidJobs = [];
    let rapidFailed = false;
    try {
      // Try explicit rapid fetch if API key configured; else this will likely return [] quickly.
      rapidJobs = await jobBoardService.fetchRapidJobs(query, 60, { location: locationFilter || undefined, page: 1, pages: 1 });
      if (Array.isArray(rapidJobs) && rapidJobs.length) {
        providersUsed.push('rapid-jsearch');
      } else {
        rapidFailed = true;
      }
    } catch (e) {
      rapidFailed = true;
      logger.warn(`[JOB_SUGGESTIONS][RAPID_FAIL] ${e.message}`);
    }

    let remotiveJobs = [];
    if (rapidFailed) {
      primaryProvider = 'remotive';
      try {
        remotiveJobs = await jobBoardService.fetchRemotiveJobs(query, 60);
        if (Array.isArray(remotiveJobs) && remotiveJobs.length) {
          providersUsed.push('remotive');
        }
      } catch (e2) {
        logger.error(`[JOB_SUGGESTIONS][REMOTIVE_FAIL] ${e2.message}`);
      }
    }

    jobsCombined = [...rapidJobs, ...remotiveJobs];
    latencyMs = Date.now() - fetchStart;
    if (!jobsCombined.length) {
      logger.warn('[JOB_SUGGESTIONS][EMPTY] No jobs returned from providers');
    }
  } catch (err) {
    fetchError = err;
    logger.error(`[JOB_SUGGESTIONS][FETCH_FATAL] ${err.message}`);
  }

  // Defensive: always array
  const baseJobs = Array.isArray(jobsCombined) ? jobsCombined : [];

  // Filter
  const filtered = baseJobs.filter(j => {
    const locOk = locationFilter ? String(j.location || '').toLowerCase().includes(locationFilter) : true;
    const typeOk = typeFilter ? (
      String(j.category || '').toLowerCase().includes(typeFilter) ||
      String(j.employmentType || '').toLowerCase().includes(typeFilter)
    ) : true;
    return locOk && typeOk;
  });

  // Ranking + ATS placeholder
  const ranked = filtered.map(job => {
    const matchScore = computeMatchScore(job, query, userSkills);
    const atsRelevance = computeAtsRelevancePlaceholder(job, userSkills);
    return {
      ...job,
      matchScore,
      atsRelevance,
      combinedScore: matchScore + atsRelevance // simple additive placeholder
    };
    
  }).sort((a, b) => b.combinedScore - a.combinedScore);

  // Update cache (mark refreshed)
  const cacheEntry = {
    timestamp: Date.now(),
    ranked,
    provider: primaryProvider,
    providersUsed
  };
  jobCache.set(cacheKey, cacheEntry);

  // Pagination slice
  const total = ranked.length;
  const startIdx = (page - 1) * limit;
  const endIdx = startIdx + limit;
  const pageJobs = ranked.slice(startIdx, endIdx);

  const totalDuration = Date.now() - overallStart;
  logger.info(`[JOB_SUGGESTIONS][RESP] user='${userId}' query='${query}' providers='${providersUsed.join(',')}' total=${total} returned=${pageJobs.length} latencyMs=${latencyMs} totalMs=${totalDuration} error=${fetchError ? 'yes' : 'no'}`);

  // Response
  return res.json({
    success: !fetchError,
    message: fetchError ? 'Job suggestions fetched with fallback provider' : 'Job suggestions fetched successfully',
    data: {
      query,
      jobs: pageJobs,
      performance: {
        averageScore: 85,
        preferredRoles: [query],
        strengths: ['communication', 'problem-solving'],
        extractedSkillsPlaceholder: userSkills
      }
    },
    meta: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      cache: { ...buildCacheMeta(existingCache, now), fresh: true },
      provider: {
        primary: primaryProvider,
        sources: providersUsed,
        fallbackUsed: providersUsed.includes('remotive') && !providersUsed.includes('rapid-jsearch')
      },
      latencyMs,
      endToEndMs: totalDuration
    }
  });
});

module.exports = { getJobSuggestions };




































// const asyncHandler = require('../middleware/asyncHandler');
// const InterviewSession = require('../models/InterviewSession');
// const UserPerformance = require('../models/UserPerformance');
// const jobBoardService = require('../services/jobBoardService');
// const jobMatchingService = require('../services/jobMatchingService');
// const logger = require('../utils/logger');

// exports.getJobSuggestions = asyncHandler(async (req, res) => {
//   const userId = req.user.id;
//   const limit = parseInt(req.query.limit, 10) || 10;
//   const sessions = await InterviewSession.find({ user: userId })
//     .sort({ createdAt: -1 })
//     .limit(8);
//   const performance = await UserPerformance.updateFromSessions(userId, sessions);
//   const searchQuery = performance.preferredRoles[0] || 'developer';
//   const externalJobs = await jobBoardService.fetchJobs(searchQuery, 50);
//   const ranked = jobMatchingService.rankJobs(externalJobs, {
//     skills: performance.skills,
//     preferredRoles: performance.preferredRoles,
//     strengths: performance.strengths
//   }).slice(0, limit);
//   logger.info(`Job suggestions returned for user ${userId}: ${ranked.length}`);
//   res.json({
//     success: true,
//     message: 'Job suggestions generated',
//     data: {
//       query: searchQuery,
//       performance: {
//         averageScore: performance.averageScore,
//         strengths: performance.strengths.slice(0, 5),
//         preferredRoles: performance.preferredRoles.slice(0, 5)
//       },
//       jobs: ranked
//     }
//   });
// });

// const asyncHandler = require('../middleware/asyncHandler');

// exports.getJobSuggestions = asyncHandler(async (req, res) => {
//   // 🔥 Allow testing without redirect or crash
//   const userId = req.user?.id || "test-user";

//   const limit = parseInt(req.query.limit, 10) || 10;

//   // If you're using MongoDB, this will avoid errors in dev mode
//   const sessions = await InterviewSession.find({ user: userId })
//     .sort({ createdAt: -1 })
//     .limit(8);

//   const performance = await UserPerformance.updateFromSessions(userId, sessions);

//   const searchQuery = performance.preferredRoles[0] || 'developer';

//   const externalJobs = await jobBoardService.fetchJobs(searchQuery, 50);

//   const ranked = jobMatchingService.rankJobs(externalJobs, {
//     skills: performance.skills,
//     preferredRoles: performance.preferredRoles,
//     strengths: performance.strengths
//   }).slice(0, limit);

//   logger.info(`Job suggestions returned for user ${userId}: ${ranked.length}`);

//   res.json({
//     success: true,
//     message: 'Job suggestions generated',
//     data: {
//       query: searchQuery,
//       performance: {
//         averageScore: performance.averageScore,
//         strengths: performance.strengths.slice(0, 5),
//         preferredRoles: performance.preferredRoles.slice(0, 5)
//       },
//       jobs: ranked
//     }
//   });
// });
