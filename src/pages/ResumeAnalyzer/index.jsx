import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactMarkdown from 'react-markdown';
import { API_BASE } from '../../api/base';
import Navbar from '../../components/Navbar';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [atsAnalysis, setAtsAnalysis] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [question, setQuestion] = useState('');
  const [qaHistory, setQaHistory] = useState([]);
  const [isAsking, setIsAsking] = useState(false);
  const [resumeId, setResumeId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const fileInputRef = useRef(null);

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('resumeAnalyzerTheme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('resumeAnalyzerTheme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const onFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setAtsAnalysis('');
    setResumeId(null);
    setQaHistory([]);
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Select a PDF resume first.');
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      if (jobDescription.trim()) {
        formData.append('jobDescription', jobDescription.trim());
      }
      
      const response = await fetch(`${API_BASE}/api/ats/analyze`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Analysis failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.data && typeof result.data === 'string' && result.data.trim()) {
        setAtsAnalysis(result.data);
        setResumeId('analyzed');
        toast.success('Resume analyzed successfully');
      } else {
        console.error('Invalid response format:', result);
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      toast.error(`Failed to analyze resume: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    setIsAsking(true);
    const userEntry = { type: 'user', content: question };
    setQaHistory(h => [...h, userEntry]);
    
    try {
      const token = localStorage.getItem('hiremate_token');
      const response = await fetch(`${API_BASE}/api/resume/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ question: question.trim() })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get answer (${response.status})`);
      }
      
      const result = await response.json();
      const assistant = { type: 'assistant', content: result.answer || result.data };
      setQaHistory(h => [...h, assistant]);
      toast.success('Question answered successfully');
    } catch (err) {
      console.error('Ask question error:', err);
      const sys = { type: 'system', content: `Failed to get answer. ${err.message || 'Please try again.'}` };
      setQaHistory(h => [...h, sys]);
      toast.error(err.message || 'Failed to get answer');
    } finally {
      setQuestion('');
      setIsAsking(false);
    }
  };

  // Theme-based classes
  const themeClasses = {
    bg: isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-white/80' : 'text-gray-700',
    textTertiary: isDarkMode ? 'text-white/60' : 'text-gray-600',
    card: isDarkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white/90 border-gray-200',
    cardHover: isDarkMode ? 'hover:border-cyan-400/50' : 'hover:border-blue-400/50',
    input: isDarkMode ? 'bg-slate-700/50 border-slate-600 text-white placeholder:text-white/40' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500',
    inputFocus: isDarkMode ? 'focus:ring-cyan-400 focus:border-cyan-400/50' : 'focus:ring-blue-500 focus:border-blue-500',
    accent: isDarkMode ? '#00ffe1' : '#3b82f6',
    accentText: isDarkMode ? 'text-cyan-400' : 'text-blue-600',
    border: isDarkMode ? 'border-slate-700' : 'border-gray-200',
    borderLight: isDarkMode ? 'border-slate-600' : 'border-gray-300',
  };

  return (
    <div className={`relative min-h-screen font-sans overflow-x-hidden transition-colors duration-300 ${themeClasses.bg} ${themeClasses.text}`}>
      {/* Simple Gradient Background */}
      <div className="absolute inset-0 -z-10 w-full h-full">
        {isDarkMode ? (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
        )}
      </div>
      
      {/* Navbar */}
      <div style={{ height: '80px', position: 'relative', marginBottom: '2rem' }}>
        <Navbar />
      </div>

      {/* Theme Toggle Button */}
      <div className="fixed top-36 left-4 sm:left-6 z-50">
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-full shadow-xl backdrop-blur-lg transition-all duration-300 hover:scale-110 ${
            isDarkMode 
              ? 'bg-slate-800/90 border border-slate-700 text-cyan-400 hover:bg-slate-700/90 hover:border-cyan-400/50' 
              : 'bg-white/90 border border-gray-200 text-blue-600 hover:bg-gray-50 hover:border-blue-400'
          }`}
          aria-label="Toggle theme"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      <div className="relative py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Minimalist Header */}
          <header className="text-center mb-12">
            <h1 className={`text-4xl md:text-5xl font-bold tracking-tight font-[Space_Grotesk] mb-4 ${themeClasses.text}`}>
              Resume <span className={isDarkMode ? "bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent" : "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"}>ATS Checker</span>
            </h1>
            <p className={`text-lg font-[Inter] max-w-2xl mx-auto ${themeClasses.textSecondary}`}>AI-powered resume optimization for Applicant Tracking Systems</p>
          </header>

          {/* Upload Section - Minimalist Design */}
          <section className={`rounded-2xl border shadow-xl p-8 backdrop-blur-lg transition-all duration-300 ${themeClasses.card} ${themeClasses.cardHover}`}>
            <div className="space-y-6">
              {/* File Upload */}
              <div className="space-y-3">
                <label className={`block text-sm font-medium font-[Inter] ${themeClasses.text}`}>Resume (PDF)</label>
                <div className="relative">
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf"
                    ref={fileInputRef}
                    onChange={onFileSelect}
                    className="hidden"
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`group border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${themeClasses.borderLight} ${isDarkMode ? 'hover:border-cyan-400/50 hover:bg-slate-700/30' : 'hover:border-blue-400/50 hover:bg-blue-50/50'}`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <svg className={`w-10 h-10 transition-colors ${themeClasses.textTertiary} ${isDarkMode ? 'group-hover:text-cyan-400' : 'group-hover:text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <div>
                        <p className={`text-sm font-medium font-[Inter] ${themeClasses.text}`}>
                          {file ? file.name : 'Click to upload resume'}
                        </p>
                        <p className={`text-xs mt-1 font-[Inter] ${themeClasses.textTertiary}`}>PDF format only</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Job Description - Collapsible */}
              <details className="group">
                <summary className={`cursor-pointer text-sm font-medium transition-colors flex items-center gap-2 font-[Inter] ${themeClasses.text} ${isDarkMode ? 'hover:text-cyan-400' : 'hover:text-blue-600'}`}>
                  <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Add Job Description (Optional)
                </summary>
                <div className="mt-3">
                  <textarea
                    id="job-description"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste job description for better keyword matching..."
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-xl text-sm resize-none transition-all font-[Inter] ${themeClasses.input} ${themeClasses.inputFocus}`}
                  />
                </div>
              </details>
              
              {/* Analyze Button */}
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!file || isUploading}
                className={`w-full py-4 px-6 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-2 backdrop-blur-lg font-[Inter] ${
                  isDarkMode
                    ? 'text-white border-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 disabled:border-slate-600 disabled:bg-slate-700/30 disabled:text-slate-400'
                    : 'text-white border-blue-600 bg-blue-600 hover:bg-blue-700 disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-400'
                } disabled:cursor-not-allowed`}
              >
              {isUploading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Analyze Resume
                </>
              )}
              </button>
            </div>
          </section>

          {/* ATS Results - Minimalist Card */}
          {atsAnalysis && atsAnalysis.trim() && (
            <section className={`rounded-2xl border shadow-xl p-8 backdrop-blur-lg transition-all duration-300 ${themeClasses.card}`}>
              <div className={`flex items-center justify-between mb-6 pb-4 border-b ${themeClasses.border}`}>
                <div>
                  <h2 className={`text-2xl font-bold font-[Space_Grotesk] ${themeClasses.text}`}>Analysis Report</h2>
                  <p className={`text-xs mt-1 font-[Inter] ${themeClasses.textTertiary}`}>Powered by Groq AI</p>
                </div>
                <button
                  onClick={() => {
                    setAtsAnalysis('');
                    setFile(null);
                    setResumeId(null);
                    setQaHistory([]);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className={`text-xs flex items-center gap-1 transition-colors font-[Inter] px-3 py-1.5 rounded-lg ${
                    isDarkMode 
                      ? 'text-slate-300 hover:text-cyan-400 hover:bg-slate-700/50' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                New Analysis
              </button>
            </div>
            
            {/* Markdown Content */}
            <div className={`max-w-none ${isDarkMode ? 'text-white dark-mode-analysis' : ''}`} style={isDarkMode ? { color: '#ffffff' } : {}}>
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className={`text-2xl font-medium mb-4 mt-6 first:mt-0 tracking-tight font-[Space_Grotesk] ${isDarkMode ? 'text-white' : themeClasses.text}`} style={isDarkMode ? { color: '#ffffff' } : {}}>{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className={`text-xl font-medium mb-3 mt-6 flex items-center gap-2 tracking-tight font-[Space_Grotesk] ${isDarkMode ? 'text-white' : themeClasses.textSecondary}`} style={isDarkMode ? { color: '#ffffff' } : {}}>{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className={`text-lg font-medium mb-2 mt-4 font-[Inter] ${isDarkMode ? 'text-white' : themeClasses.textSecondary}`} style={isDarkMode ? { color: '#ffffff' } : {}}>{children}</h3>
                  ),
                  ul: ({ children }) => (
                    <ul className={`space-y-2 my-4 ${isDarkMode ? 'text-white' : themeClasses.textSecondary}`} style={isDarkMode ? { color: '#ffffff' } : {}}>{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className={`space-y-2 my-4 list-decimal list-inside ${isDarkMode ? 'text-white' : themeClasses.textSecondary}`} style={isDarkMode ? { color: '#ffffff' } : {}}>{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className={`leading-relaxed flex items-start gap-2 font-[Inter] ${isDarkMode ? 'text-white' : themeClasses.textSecondary}`} style={isDarkMode ? { color: '#ffffff' } : {}}>
                      <span className={`mt-1.5 ${themeClasses.accentText}`}>•</span>
                      <span className="flex-1">{children}</span>
                    </li>
                  ),
                  p: ({ children }) => (
                    <p className={`mb-3 leading-relaxed font-[Inter] ${isDarkMode ? 'text-white' : themeClasses.textSecondary}`} style={isDarkMode ? { color: '#ffffff' } : {}}>{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className={`font-semibold ${isDarkMode ? 'text-white' : themeClasses.text}`} style={isDarkMode ? { color: '#ffffff' } : {}}>{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className={`italic ${isDarkMode ? 'text-white' : themeClasses.textTertiary}`} style={isDarkMode ? { color: '#ffffff' } : {}}>{children}</em>
                  ),
                  code: ({ children }) => (
                    <code className={`px-1.5 py-0.5 rounded text-sm font-mono ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-900'}`} style={isDarkMode ? { color: '#ffffff', backgroundColor: '#334155' } : {}}>{children}</code>
                  ),
                  pre: ({ children }) => (
                    <pre className={`p-4 rounded-lg overflow-x-auto ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-900'}`} style={isDarkMode ? { color: '#ffffff', backgroundColor: '#1e293b' } : {}}>{children}</pre>
                  ),
                  span: ({ children }) => (
                    <span className={isDarkMode ? 'text-white' : ''} style={isDarkMode ? { color: '#ffffff' } : {}}>{children}</span>
                  ),
                  div: ({ children }) => (
                    <div className={isDarkMode ? 'text-white' : ''} style={isDarkMode ? { color: '#ffffff' } : {}}>{children}</div>
                  )
                }}
              >
                {atsAnalysis}
              </ReactMarkdown>
            </div>
          </section>
        )}

        {/* ATS Tips - Compact */}
        {!atsAnalysis && (
          <section className={`rounded-2xl border shadow-xl p-6 backdrop-blur-lg transition-all duration-300 ${themeClasses.card}`}>
            <h3 className={`text-base font-medium mb-4 flex items-center gap-2 font-[Space_Grotesk] ${themeClasses.text}`}>
              <svg className={`w-5 h-5 ${themeClasses.accentText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ATS Optimization Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Use standard section headers',
                'Include relevant keywords',
                'Avoid complex formatting',
                'Save as PDF format',
                'Use readable fonts',
                'Add quantifiable achievements'
              ].map((tip, i) => (
                <div key={i} className={`flex items-start gap-2 text-sm font-[Inter] ${themeClasses.textSecondary}`}>
                  <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${themeClasses.accentText}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {tip}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Q&A Section - Minimalist */}
        {resumeId && (
          <section className={`rounded-2xl border shadow-xl p-6 space-y-4 backdrop-blur-lg transition-all duration-300 ${themeClasses.card}`}>
            <h3 className={`text-lg font-medium flex items-center gap-2 font-[Space_Grotesk] ${themeClasses.text}`}>
              <svg className={`w-5 h-5 ${themeClasses.accentText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ask About Your Resume
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !isAsking && handleAskQuestion()}
                placeholder="e.g., What roles fit my experience?"
                disabled={isAsking}
                className={`flex-1 px-4 py-3 border rounded-xl text-sm transition-all font-[Inter] ${themeClasses.input} ${themeClasses.inputFocus} disabled:cursor-not-allowed`}
              />
              <button
                type="button"
                onClick={handleAskQuestion}
                disabled={isAsking || !question.trim()}
                className={`px-5 py-3 border rounded-xl text-sm font-medium transition-all flex items-center gap-2 backdrop-blur-lg font-[Inter] disabled:cursor-not-allowed ${
                  isDarkMode
                    ? 'text-white border-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 disabled:border-slate-600 disabled:bg-slate-700/30 disabled:text-slate-400'
                    : 'text-white border-blue-600 bg-blue-600 hover:bg-blue-700 disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-400'
                }`}
              >
                {isAsking ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Asking...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                    Ask
                  </>
                )}
              </button>
            </div>
            {qaHistory.length > 0 && (
              <div className="space-y-3 mt-4">
                {qaHistory.map((entry, i) => (
                  <div key={i} className={`p-4 rounded-xl text-sm border ${
                    entry.type === 'user' 
                      ? isDarkMode 
                        ? 'bg-slate-700/50 border-cyan-400/30' 
                        : 'bg-blue-50 border-blue-300'
                      : entry.type === 'assistant' 
                        ? isDarkMode
                          ? 'bg-slate-700/30 border-slate-600'
                          : 'bg-gray-50 border-gray-200'
                        : isDarkMode
                          ? 'bg-slate-700/50 border-cyan-400/20'
                          : 'bg-yellow-50 border-yellow-300'
                  }`}>
                    <div className={`font-medium mb-2 text-xs uppercase tracking-wide font-[Space_Grotesk] ${themeClasses.accentText}`}>
                      {entry.type === 'user' ? '👤 You' : entry.type === 'assistant' ? '🤖 AI Assistant' : '⚠️ System'}
                    </div>
                    <div className={`leading-relaxed whitespace-pre-wrap font-[Inter] ${themeClasses.textSecondary}`}>{entry.content}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
      
      {/* Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Orbitron:wght@700&family=Inter:wght@400;700&display=swap');
        
        @import url('https://fonts.googleapis.com/css2?family=Bitcount+Prop+Single:wght@100..900&display=swap');

        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&display=swap');

        .font-[Space_Grotesk] { font-family: 'Space Grotesk', sans-serif; }
        .font-[Orbitron] { font-family: 'Orbitron', sans-serif; }
        .font-[Inter] { font-family: 'Inter', sans-serif; }
        .text-accent { color: #00ffe1; }
        .font-[Bitcount_Prop_Single] { font-family: 'Bitcount Prop Single', sans-serif; }
        .glassmorphism { box-shadow: 0 8px 32px 0 rgba(31,38,135,0.18); backdrop-filter: blur(8px); }
        
        /* Force white text in dark mode for analysis report */
        .dark-mode-analysis * {
          color: #ffffff !important;
        }
      `}</style>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
