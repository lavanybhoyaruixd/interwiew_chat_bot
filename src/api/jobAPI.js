// // Job search using JSearch API from RapidAPI
// const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
// const RAPIDAPI_HOST = import.meta.env.VITE_RAPIDAPI_HOST || 'jsearch.p.rapidapi.com';

// if (!RAPIDAPI_KEY) {
//   console.warn('Warning: VITE_RAPIDAPI_KEY is not set. Using mock data only.');
// }

// // Simple in-memory cache
// const cache = new Map();
// const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes cache

// export async function getJobSuggestions(query = 'software engineer', page = 1, num_pages = 1) {
//   const cacheKey = `${query}-${page}-${num_pages}`;
//   const now = Date.now();
  
//   // Return cached result if available and not expired
//   if (cache.has(cacheKey)) {
//     const { data, timestamp } = cache.get(cacheKey);
//     if (now - timestamp < CACHE_DURATION) {
//       return data;
//     }
//   }

//   try {
//     const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=${page}&num_pages=${num_pages}`;
    
//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         'X-RapidAPI-Key': '26324743ccmsh98e46d8e79e27dfp16dc0fjsnfde44f5410d9',
//         'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
//       }
//     });

//     if (response.status === 429) {
//       // Rate limit hit
//       throw new Error('rate_limit_exceeded');
//     }

//     if (!response.ok) {
//       let errorMessage = 'Failed to fetch job listings';
//       try {
//         const errorData = await response.json();
//         errorMessage = errorData.message || errorMessage;
//       } catch (e) {
//         // If we can't parse the error response, use the status text
//         errorMessage = response.statusText || errorMessage;
//       }
//       throw new Error(errorMessage);
//     }

//     const data = await response.json().catch(() => ({}));
    
//     // Validate the response structure
//     if (!data || !Array.isArray(data.data)) {
//       console.error('Invalid API response format:', data);
//       throw new Error('Invalid response format from job search API');
//     }
    
//     // Transform the API response
//     const result = {
//       success: true,
//       data: {
//         jobs: data.data?.map(job => {
//           // Safely handle job_highlights - it might be an object or array
//           let tags = [];
//           if (Array.isArray(job.job_highlights)) {
//             tags = job.job_highlights.map(h => h.title || '').filter(Boolean);
//           } else if (job.job_highlights && typeof job.job_highlights === 'object') {
//             // If it's an object, extract values as tags
//             tags = Object.values(job.job_highlights)
//               .flatMap(highlight => 
//                 Array.isArray(highlight) ? highlight : [highlight]
//               )
//               .filter(Boolean);
//           }
          
//           return {
//             id: job.job_id || Math.random().toString(36).substr(2, 9),
//             title: job.job_title || 'Job Title',
//             company: job.employer_name || 'Company',
//             location: job.job_country || job.job_location || 'Remote',
//             description: job.job_description || '',
//             url: job.job_apply_link || job.job_google_link || '#',
//             matchScore: Math.floor(Math.random() * 100), // Random score for demo
//             tags: tags
//           };
//         }) || [],
//         performance: {
//           averageScore: Math.floor(Math.random() * 30) + 70, // Random score for demo
//           preferredRoles: [query]
//         }
//       }
//     };
//   } catch (error) {
//     console.error('Error fetching jobs:', error);
    
//     // If it's a rate limit error, return mock data
//     if (error.message === 'rate_limit_exceeded') {
//       console.warn('Rate limit exceeded, falling back to mock data');
//       return getMockJobData(query);
//     }
    
//     // For other errors, return mock data with an error message
//     const mockData = getMockJobData(query);
//     return {
//       ...mockData,
//       message: error.message || 'Failed to fetch job listings. Showing sample data instead.'
//     };
//   }
// }


// jobAPI.js
// Frontend API for fetching job suggestions from your backend

import { fetchJson, tokenStorage, authHeaders } from './http.js';
import { API_BASE } from './base.js';

export async function getJobSuggestions(tokenOrQuery, limitOrPage = 10, queryOrNumPages = '') {
  try {
    // Handle both old and new function signatures for backward compatibility
    // Old: getJobSuggestions(jobTitle, page, numPages) - used by JobSuggestions.jsx
    // New: getJobSuggestions(token, limit, query) - used by HomeJobSection.jsx
    
    let token, limit, query;
    
    // Check if first param looks like a job title (contains spaces, is a string with words)
    // vs a token (typically longer, no spaces, or empty string)
    const firstParam = tokenOrQuery || '';
    const firstParamStr = String(firstParam);
    
    // Heuristic: if it contains spaces or looks like a job title, treat as old signature
    // Otherwise, treat as token (new signature)
    const isOldSignature = firstParamStr.includes(' ') || 
                           (firstParamStr.length < 50 && firstParamStr.split(' ').length > 1);
    
    if (isOldSignature) {
      // Old signature: getJobSuggestions(jobTitle, page, numPages)
      query = firstParamStr || 'software engineer';
      limit = Number(limitOrPage) || 10;
      token = tokenStorage.get() || '';
    } else {
      // New signature: getJobSuggestions(token, limit, query)
      token = firstParamStr;
      limit = Number(limitOrPage) || 10;
      // Ensure query is a string before calling trim
      query = queryOrNumPages ? String(queryOrNumPages) : '';
    }
    
    // Build query params - ensure query is a string and safe to trim
    const params = new URLSearchParams({ limit: limit.toString() });
    const queryString = query ? String(query).trim() : '';
    if (queryString) {
      params.append('query', queryString);
    }

    const data = await fetchJson(`${API_BASE}/api/jobs/suggestions?${params.toString()}`, {
      method: 'GET',
      headers: {
        ...authHeaders(token)
      }
    });

    // Always return a valid object to avoid `undefined.success` errors
    const jobs = Array.isArray(data?.data?.jobs) ? data.data.jobs : [];

    return {
      success: data?.success ?? false,
      data: { jobs },
      message: data?.message ?? null
    };

  } catch (err) {
    console.error("Job API error:", err);
    
    return {
      success: false,
      message: err.message || "Error fetching job suggestions"
    };
  }
}
