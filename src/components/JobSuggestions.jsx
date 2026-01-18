import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { getJobSuggestions } from '../api/jobAPI';

const JobSuggestions = React.memo(({ jobTitle = 'software engineer', limit = 5, token }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isMockData, setIsMockData] = useState(false);

  useEffect(() => {
    let mounted = true;
    let cancelled = false;
    setLoading(true);
    setError(null);
    
    const fetchJobs = async () => {
      try {
        const authToken = token || localStorage.getItem('hiremate_token') || '';
        const result = await getJobSuggestions(authToken, limit, jobTitle);

        if (cancelled || !mounted) return;
        
        if (result.success && result.data?.jobs) {
          const limitedJobs = result.data.jobs.slice(0, limit);
          setJobs(limitedJobs);
          setMeta(result.data.performance);
          setIsMockData(result.isMockData || false);
        } else {
          setError(result.message || 'Failed to load job listings');
        }
      } catch (e) {
        if (!cancelled && mounted) {
          console.error('Error in JobSuggestions:', e);
          setError(e.message || 'An error occurred while fetching jobs');
        }
      } finally {
        if (mounted && !cancelled) {
          setLoading(false);
        }
      }
    };

    // Debounce to prevent rapid API calls
    const timeoutId = setTimeout(fetchJobs, 100);
    
    return () => { 
      cancelled = true;
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [jobTitle, limit, token]);

  if (loading) return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      <span className="ml-3">Loading job listings...</span>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
      <p className="font-bold">Error</p>
      <p>{error}</p>
      <p className="text-sm mt-2">Make sure you have set up your RapidAPI key in the jobAPI.js file.</p>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          {isMockData ? 'Sample ' : ''}Job Listings
          {isMockData && (
            <span className="ml-2 text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              Using Sample Data
            </span>
          )}
        </h3>
        {meta && (
          <span className="text-sm text-gray-500">
            Showing {jobs.length} {jobs.length === 1 ? 'result' : 'results'} for "{jobTitle}"
          </span>
        )}
      </div>
      
      {jobs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No job listings found. Try a different search term.
        </div>
      ) : (
        <div className="space-y-4" style={{ contain: 'layout style paint' }}>
          {jobs.map((job, index) => (
            <div key={job.id || job.job_id || `job-${index}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200" style={{ willChange: 'transform' }}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-medium text-blue-600 hover:text-blue-800">
                    <a href={job.url} target="_blank" rel="noopener noreferrer">
                      {job.title}
                    </a>
                  </h4>
                  <p className="text-gray-700">{job.company}</p>
                  <p className="text-sm text-gray-500">{job.location}</p>
                </div>
                <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Match: {job.matchScore}%
                </div>
              </div>
              
              {job.tags && job.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {job.tags.slice(0, 5).map((tag, tagIndex) => (
                    <span key={`tag-${tagIndex}-${job.id || index}`} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <a 
                  href={job.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
                >
                  View Job
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

JobSuggestions.displayName = 'JobSuggestions';

export default JobSuggestions;
