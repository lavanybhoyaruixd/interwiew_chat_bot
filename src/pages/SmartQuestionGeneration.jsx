import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';

// Static HR interview questions organized by job role
const staticQuestionsByRole = {
  'Software Engineer': [
    "Tell me about yourself and your technical background.",
    "Why are you interested in this software engineering position?",
    "What programming languages are you most comfortable with?",
    "Can you walk me through a project from your resume?",
    "How do you approach debugging a complex issue?",
    "What is your experience with version control systems like Git?",
    "Describe a time when you had to learn a new technology quickly.",
    "How do you ensure code quality in your projects?",
    "Explain a challenging technical problem you solved recently.",
    "What is your experience with databases?",
    "How do you handle working under tight deadlines?",
    "What are your thoughts on agile development methodologies?",
    "How do you stay updated with the latest technology trends?",
    "Describe your experience with testing and quality assurance.",
    "What is your approach to code reviews?"
  ],
  'Data Scientist': [
    "Tell me about yourself and your background in data science.",
    "Why are you interested in this data scientist position?",
    "What is your experience with machine learning algorithms?",
    "Can you explain a data science project you worked on?",
    "How do you handle missing data in a dataset?",
    "What is your experience with Python and data analysis libraries?",
    "Describe your approach to feature engineering.",
    "How do you validate your machine learning models?",
    "What is your experience with SQL and databases?",
    "Explain the bias-variance tradeoff.",
    "How do you handle imbalanced datasets?",
    "What is your experience with data visualization?",
    "Describe a time when you had to explain complex data insights to non-technical stakeholders.",
    "How do you stay current with the latest developments in data science?",
    "What are your career goals in data science?"
  ],
  'Product Manager': [
    "Tell me about yourself and your product management experience.",
    "Why are you interested in this product manager position?",
    "How do you prioritize features for a product?",
    "Can you walk me through how you would launch a new product?",
    "Describe a time when you had to say no to a feature request.",
    "How do you gather and analyze user feedback?",
    "What is your experience with agile product development?",
    "How do you measure product success?",
    "Describe a challenging product decision you had to make.",
    "What is your experience working with engineering teams?",
    "How do you handle conflicting stakeholder requirements?",
    "What is your approach to product roadmapping?",
    "Describe your experience with A/B testing and experimentation.",
    "How do you stay informed about market trends and competitors?",
    "What are your career goals in product management?"
  ],
  'UI/UX Designer': [
    "Tell me about yourself and your design background.",
    "Why are you interested in this UI/UX designer position?",
    "Can you walk me through your design process?",
    "What is your experience with design tools like Figma or Sketch?",
    "How do you approach user research?",
    "Describe a design project you're particularly proud of.",
    "How do you handle feedback and criticism on your designs?",
    "What is your experience with prototyping?",
    "How do you ensure your designs are accessible?",
    "Describe a time when you had to design under tight constraints.",
    "What is your experience working with developers?",
    "How do you stay updated with design trends?",
    "How do you balance user needs with business requirements?",
    "Describe your approach to usability testing.",
    "What are your career goals in design?"
  ],
  'DevOps Engineer': [
    "Tell me about yourself and your DevOps experience.",
    "Why are you interested in this DevOps engineer position?",
    "What is your experience with cloud platforms like AWS or Azure?",
    "Can you explain your approach to CI/CD pipelines?",
    "How do you ensure system reliability and uptime?",
    "What is your experience with containerization and Docker?",
    "Describe your approach to infrastructure as code.",
    "How do you handle a production incident?",
    "What is your experience with monitoring and logging tools?",
    "How do you approach security in DevOps practices?",
    "Describe your experience with automation and scripting.",
    "What is your experience with Kubernetes?",
    "How do you handle configuration management?",
    "Describe a time when you improved system performance.",
    "What are your career goals in DevOps?"
  ],
  'default': [
    "Tell me about yourself and your background.",
    "Why are you interested in this position?",
    "What are your greatest strengths?",
    "What is your biggest weakness?",
    "Why do you want to leave your current job?",
    "Where do you see yourself in 5 years?",
    "Why should we hire you?",
    "Can you walk me through your resume?",
    "What are your salary expectations?",
    "Do you have any questions for us?",
    "What motivates you in your work?",
    "How do you handle stress and pressure?",
    "Describe a challenging situation you faced and how you handled it.",
    "What are your career goals?",
    "How do you stay updated with industry trends?"
  ]
};

// Default HR interview questions that are commonly asked
const defaultHRQuestions = staticQuestionsByRole['default'];

export default function SmartQuestionGeneration() {
  const [resume, setResume] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [questions, setQuestions] = useState(defaultHRQuestions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDefaultQuestions, setIsDefaultQuestions] = useState(true);
  const questionsRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      // UI-only: Just store the file name for display, no actual processing
      setResume(file);
      toast.success('Resume uploaded (UI only - for demonstration)');
      setError("");
    }
  };

  const handleGenerate = () => {
    setLoading(true);
    setError("");
    setQuestions([]);

    // Simulate a short delay for better UX
    setTimeout(() => {
      try {
        // Get job role from input or use default
        const role = jobRole.trim() || '';
        
        // Find matching questions based on job role
        let selectedQuestions = [];
        let matchedRole = 'General';
        
        if (role) {
          // Check if the role matches any key in staticQuestionsByRole (case-insensitive)
          const roleKey = Object.keys(staticQuestionsByRole).find(key => {
            if (key === 'default') return false;
            const roleLower = role.toLowerCase();
            const keyLower = key.toLowerCase();
            return roleLower.includes(keyLower) || keyLower.includes(roleLower);
          });
          
          if (roleKey) {
            selectedQuestions = staticQuestionsByRole[roleKey];
            matchedRole = roleKey;
          } else {
            // Use default questions if no match found
            selectedQuestions = staticQuestionsByRole['default'];
            matchedRole = 'General';
          }
        } else {
          // No role specified, use default
          selectedQuestions = staticQuestionsByRole['default'];
          matchedRole = 'General';
        }
        
        // Ensure we have at least 10 questions
        if (selectedQuestions.length < 10) {
          // Add more default questions if needed
          const additionalQuestions = staticQuestionsByRole['default'].slice(0, 10 - selectedQuestions.length);
          selectedQuestions = [...selectedQuestions, ...additionalQuestions];
        }
        
        // Take minimum 10 questions
        selectedQuestions = selectedQuestions.slice(0, Math.max(10, selectedQuestions.length));
        
        setQuestions(selectedQuestions);
        setIsDefaultQuestions(false);
        toast.success(`Generated ${selectedQuestions.length} interview questions for ${matchedRole}!`);
        
        // Scroll to questions after a short delay
        setTimeout(() => {
          questionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      } catch (err) {
        console.error('Error generating questions:', err);
        setError('Failed to generate questions. Please try again.');
        toast.error('Failed to generate questions');
      } finally {
        setLoading(false);
      }
    }, 500); // Small delay to show loading state
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom, #0f0c29, #302b63, #24243e)',
      color: 'white',
      position: 'relative',
      zIndex: 1
    }}>
      {/* Navbar */}
      <div style={{ height: '80px', position: 'relative', zIndex: 10, marginBottom: '2rem' }}>
        <Navbar />
      </div>
      
      <div style={{ maxWidth: '896px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '2rem' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '800', 
            marginBottom: '1rem',
            background: 'linear-gradient(to right, #a855f7, #06b6d4, #6366f1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Smart Question Generation
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'rgba(255, 255, 255, 0.7)', maxWidth: '42rem', margin: '0 auto' }}>
            Get AI-generated interview questions! Upload your resume for personalized questions, or generate random tech interview questions instantly.
          </p>
        </div>

        <div style={{
          borderRadius: '1.5rem',
          background: 'rgba(24, 24, 27, 0.9)',
          border: '1px solid rgba(35, 39, 47, 1)',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: 'white' }}>
            Generate Questions
          </h2>

          {/* File Upload */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.75rem', color: 'white' }}>
              Upload your resume (PDF) - <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: '400' }}>Optional</span>
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              style={{
                display: 'block',
                width: '100%',
                fontSize: '0.875rem',
                border: '1px solid rgba(64, 64, 64, 1)',
                borderRadius: '0.75rem',
                padding: '0.75rem',
                background: 'rgba(35, 39, 47, 0.5)',
                color: 'white'
              }}
            />
            {resume && (
              <p style={{ fontSize: '0.875rem', color: '#10b981', marginTop: '0.5rem' }}>
                Selected: {resume.name}
              </p>
            )}
            <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.5rem' }}>
              {!resume && "Leave empty to get random tech interview questions, or upload for personalized questions based on your resume."}
            </p>
          </div>

          {/* Job Role Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.75rem', color: 'white' }}>
              Target Job Role / Description - <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: '400' }}>Optional</span>
            </label>
            <input
              type="text"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g., Software Engineer, Data Scientist, Product Manager..."
              style={{
                display: 'block',
                width: '100%',
                border: '1px solid rgba(64, 64, 64, 1)',
                borderRadius: '0.75rem',
                padding: '0.75rem 1rem',
                background: 'rgba(35, 39, 47, 0.5)',
                color: 'white',
                fontSize: '1rem'
              }}
            />
            <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.5rem' }}>
              Helps generate more relevant questions. Leave empty for general tech questions.
            </p>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? 'rgba(147, 51, 234, 0.6)' : 'linear-gradient(to right, #9333ea, #db2777)',
              color: 'white',
              padding: '1rem 1.5rem',
              borderRadius: '0.75rem',
              fontWeight: '700',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '1rem',
              transition: 'all 0.3s'
            }}
          >
            {loading ? (
              <>
                <svg style={{ animation: 'spin 1s linear infinite', width: '1.25rem', height: '1.25rem' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Questions...
              </>
            ) : (
              'Generate Questions'
            )}
          </button>

          {error && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'rgba(220, 38, 38, 0.2)',
              border: '1px solid rgba(248, 113, 113, 0.3)',
              borderRadius: '0.75rem',
              color: '#fca5a5'
            }}>
              {error}
            </div>
          )}

          {/* Questions Display */}
          {questions.length > 0 && (
            <div ref={questionsRef} style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  margin: 0
                }}>
                  <svg style={{ width: '1.75rem', height: '1.75rem', color: '#a855f7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {isDefaultQuestions ? 'Common HR Interview Questions' : 'Generated Interview Questions'} ({questions.length})
                </h3>
                {isDefaultQuestions && (
                  <span style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    background: 'rgba(147, 51, 234, 0.2)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(147, 51, 234, 0.3)'
                  }}>
                    Sample Questions
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {questions.map((q, i) => (
                  <div key={i} style={{
                    padding: '1.25rem',
                    background: 'linear-gradient(to right, rgba(35, 39, 47, 0.5), rgba(42, 45, 53, 0.5))',
                    border: '1px solid rgba(64, 64, 64, 1)',
                    borderRadius: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <span style={{
                        flexShrink: 0,
                        width: '2rem',
                        height: '2rem',
                        background: 'linear-gradient(to right, #9333ea, #db2777)',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '0.875rem'
                      }}>
                        {i + 1}
                      </span>
                      <p style={{ color: 'rgba(255, 255, 255, 0.9)', flex: 1, fontSize: '1rem', lineHeight: '1.75' }}>
                        {q}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!loading && isDefaultQuestions && questions.length > 0 && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '0.75rem',
              textAlign: 'center'
            }}>
              <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.875rem', margin: 0 }}>
                💡 <strong>Tip:</strong> Upload your resume and click "Generate Questions" to get personalized AI-generated questions based on your experience!
              </p>
            </div>
          )}
        </div>
        
        {/* Job Finding Tips Section */}
        <div style={{
          marginTop: '3rem',
          padding: '2rem',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '1rem',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <svg style={{ width: '2rem', height: '2rem', color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'white',
              margin: 0
            }}>
              💡 Tips for Finding Your Dream Job
            </h3>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginTop: '1.5rem',
            textAlign: 'left'
          }}>
            <div style={{
              padding: '1.25rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎯</div>
              <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', fontSize: '1rem' }}>
                Optimize Your Resume
              </h4>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', lineHeight: '1.6', margin: 0 }}>
                Use keywords from job descriptions, highlight relevant skills, and quantify your achievements with numbers.
              </p>
            </div>
            
            <div style={{
              padding: '1.25rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔍</div>
              <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', fontSize: '1rem' }}>
                Use Multiple Platforms
              </h4>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', lineHeight: '1.6', margin: 0 }}>
                Search on LinkedIn, Indeed, Glassdoor, company websites, and job boards. Don't limit yourself to one platform.
              </p>
            </div>
            
            <div style={{
              padding: '1.25rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🤝</div>
              <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', fontSize: '1rem' }}>
                Network Actively
              </h4>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', lineHeight: '1.6', margin: 0 }}>
                Connect with professionals in your field, attend industry events, and engage on LinkedIn. Many jobs are found through referrals.
              </p>
            </div>
            
            <div style={{
              padding: '1.25rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📝</div>
              <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', fontSize: '1rem' }}>
                Customize Applications
              </h4>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', lineHeight: '1.6', margin: 0 }}>
                Tailor your resume and cover letter for each position. Show how your skills match their specific requirements.
              </p>
            </div>
            
            <div style={{
              padding: '1.25rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💼</div>
              <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', fontSize: '1rem' }}>
                Practice Interviewing
              </h4>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', lineHeight: '1.6', margin: 0 }}>
                Use tools like this one to practice common interview questions. Preparation builds confidence and improves performance.
              </p>
            </div>
            
            <div style={{
              padding: '1.25rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏰</div>
              <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '0.5rem', fontSize: '1rem' }}>
                Apply Early
              </h4>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', lineHeight: '1.6', margin: 0 }}>
                Apply to new job postings within 24-48 hours. Early applicants often have a better chance of getting noticed.
              </p>
            </div>
          </div>
          
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '0.75rem'
          }}>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.875rem', margin: 0, lineHeight: '1.6' }}>
              <strong style={{ color: '#10b981' }}>Pro Tip:</strong> Set up job alerts on your favorite platforms, follow companies you're interested in, and keep your LinkedIn profile updated. Consistency and persistence are key to landing your dream job!
            </p>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
