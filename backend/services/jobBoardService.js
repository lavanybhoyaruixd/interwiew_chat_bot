const axios = require('axios');
const logger = require('../utils/logger');

class JobBoardService {
  constructor() {
    // Remotive (public) fallback
    this.remotiveUrl = process.env.REMOTIVE_API_URL || 'https://remotive.com/api/remote-jobs';
    // RapidAPI jsearch
    this.rapidKey = process.env.RAPIDAPI_JSEARCH_KEY || null;
    this.rapidHost = process.env.RAPIDAPI_JSEARCH_HOST || 'jsearch.p.rapidapi.com';
  }

  async fetchJobs(query = '', limit = 20, options = {}) {
    // If RapidAPI key present, prefer jsearch provider
    if (this.rapidKey) {
      return this.fetchRapidJobs(query, limit, options);
    }
    return this.fetchRemotiveJobs(query, limit);
  }

  async fetchRemotiveJobs(query = '', limit = 20) {
    try {
      const url = new URL(this.remotiveUrl);
      if (query) url.searchParams.set('search', query);
      const { data } = await axios.get(url.toString(), { timeout: 10000 });
      const jobs = Array.isArray(data.jobs) ? data.jobs.slice(0, limit) : [];
      return jobs.map(j => ({
        provider: 'remotive',
        id: j.id,
        title: j.title,
        company: j.company_name,
        location: j.candidate_required_location,
        url: j.url,
        category: j.category,
        tags: j.tags,
        publicationDate: j.publication_date,
        description: j.description
      }));
    } catch (err) {
      logger.error('fetchRemotiveJobs failed:', err.message);
      return [];
    }
  }

  async fetchRapidJobs(query = '', limit = 20, { location, country = 'in', datePosted = 'all', page = 1, pages = 1 } = {}) {
    try {
      // Build query string; combine query + location if provided
      const combinedQuery = location ? `${query} in ${location}` : query;
const url = new URL(`https://jsearch.p.rapidapi.com/search`);
      if (combinedQuery) url.searchParams.set('query', combinedQuery);
      url.searchParams.set('page', String(page));
      url.searchParams.set('num_pages', String(pages));
      if (country) url.searchParams.set('country', country);
      if (datePosted) url.searchParams.set('date_posted', datePosted);

      const { data } = await axios.get(url.toString(), {
        timeout: 12000,
        headers: {
          'x-rapidapi-key': this.rapidKey,
          'x-rapidapi-host': this.rapidHost
        }
      });

      const results = Array.isArray(data.data) ? data.data.slice(0, limit) : [];
      return results.map(r => ({
        provider: 'rapid-jsearch',
        id: r.job_id || r.job_id || r.job_posted_at_datetime_utc || r.employer_name + '_' + r.job_title,
        title: r.job_title,
        company: r.employer_name,
        location: [r.job_city, r.job_state, r.job_country].filter(Boolean).join(', '),
        url: r.job_apply_link || r.job_google_link || r.job_offer_expiration_datetime_utc || '',
        category: r.job_job_title || '',
        tags: (r.job_required_skills || []).map(s => s.toLowerCase()),
        publicationDate: r.job_posted_at_datetime_utc,
        description: r.job_description
      }));
    } catch (err) {
      logger.error('fetchRapidJobs failed:', err.message);
      return [];
    }
  }
}

module.exports = new JobBoardService();
