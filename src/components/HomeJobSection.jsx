import React, { useState, useCallback, useMemo } from 'react';
import { getJobSuggestions } from '../api/jobAPI';

const HomeJobSection = React.memo(() => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jobs, setJobs] = useState([]);

  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      setError('Please enter a job role to search');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('hiremate_token') || '';
      const result = await getJobSuggestions(token, 4, trimmedQuery);

      if (result.success && result.data?.jobs) {
        // Limit to 3-4 jobs
        const limitedJobs = result.data.jobs.slice(0, 4);
        setJobs(limitedJobs);
      } else {
        // Check if it's an auth error and provide helpful message
        if (result.message && (result.message.includes('auth') || result.message.includes('token'))) {
          setError('Please log in to search for jobs. Some features require authentication.');
        } else {
          setError(result.message || 'Failed to fetch job listings');
        }
        setJobs([]);
      }
    } catch (err) {
      console.error('Error searching jobs:', err);
      setError('An error occurred while searching for jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  return (
    <section className="py-16 px-4 w-full">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white font-[Space_Grotesk]">
            Search <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Jobs</span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto font-[Inter]">
            Find your dream job by searching for specific roles
          </p>
        </div>

        {/* Search Input */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., frontend developer, software engineer, data scientist"
              className="flex-1 px-6 py-4 rounded-xl bg-[#18181b]/90 border border-[#23272f] text-white placeholder-white/50 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all font-[Inter]"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-cyan-500/20 font-[Inter]"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm font-[Inter]">
            {error}
          </div>
        )}

        {/* Job Cards Grid */}
        {jobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {jobs.map((job) => (
              <div
                key={job.id || job.job_id || Math.random()}
                className="group relative rounded-2xl bg-gradient-to-br from-[#18181b]/90 to-[#1a1a1f]/90 border border-[#23272f] shadow-xl p-6 flex flex-col glassmorphism hover:border-cyan-400/50 transition-all duration-500 hover:shadow-cyan-500/20 hover:shadow-2xl hover:-translate-y-1"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-500"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  {/* Job Title */}
                  <h3 className="text-xl font-bold mb-2 text-white font-[Space_Grotesk] group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {job.title || job.job_title || 'Job Title'}
                  </h3>
                  
                  {/* Company */}
                  <p className="text-white/80 text-lg mb-2 font-[Inter] font-medium">
                    {job.company || job.employer_name || 'Company'}
                  </p>
                  
                  {/* Location */}
                  <p className="text-white/60 text-sm mb-4 font-[Inter] flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location || job.job_location || job.job_country || 'Remote'}
                  </p>
                  
                  {/* Match Score (if available) */}
                  {job.matchScore !== undefined && (
                    <div className="mb-4">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold font-[Inter]">
                        Match: {job.matchScore}%
                      </div>
                    </div>
                  )}
                  
                  {/* Apply Now Button */}
                  <div className="mt-auto pt-4">
                    <a
                      href={job.url || job.job_apply_link || job.job_google_link || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-cyan-500/20 font-[Inter]"
                    >
                      Apply Now
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && jobs.length === 0 && !error && (
          <div className="text-center py-12 text-white/50 font-[Inter]">
            Enter a job role above to start searching
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            <span className="ml-4 text-white/70 font-[Inter]">Searching for jobs...</span>
          </div>
        )}
      </div>
    </section>
  );
});

HomeJobSection.displayName = 'HomeJobSection';

export default HomeJobSection;

