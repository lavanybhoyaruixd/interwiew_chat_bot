import React, { useState } from 'react';

export default function InstantFeedback() {
  const [question, setQuestion] = useState('Tell me about a time you faced a challenging bug and how you resolved it.');
  const [answer, setAnswer] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('behavioral');

  const sampleQuestions = {
    behavioral: [
      'Tell me about a time you faced a challenging bug and how you resolved it.',
      'Describe a situation where you had to work with a difficult team member.',
      'How do you handle tight deadlines and pressure?'
    ],
    technical: [
      'Explain the difference between let, const, and var in JavaScript.',
      'What is the purpose of React hooks?',
      'How would you optimize a slow database query?'
    ],
    situational: [
      'What would you do if you discovered a critical bug right before deployment?',
      'How would you handle a disagreement with your manager about technical approach?',
      'If given a project with unclear requirements, what would be your first steps?'
    ]
  };

  const handleAnalyze = () => {
    if (!answer.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setFeedback({
        overallScore: 78,
        strengths: [
          'Clear and structured approach',
          'Good use of specific examples',
          'Demonstrated problem-solving skills'
        ],
        improvements: [
          'Add more quantifiable results',
          'Mention collaboration with team members',
          'Include the impact of your solution'
        ],
        toneAnalysis: {
          confidence: 82,
          clarity: 75,
          professionalism: 88
        },
        detailedFeedback: 'Your answer demonstrates a solid understanding of the question. You provided a clear problem statement and walked through your solution process. To enhance your response, consider adding specific metrics or outcomes that resulted from your work. Additionally, mentioning how you collaborated with others would show your teamwork skills.'
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Work';
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-white mb-2">Instant Feedback</h1>
          <p className="text-gray-400 text-base">
            Practice interview questions and receive AI-powered analysis on your responses
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Question Selection */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-5">
              <h2 className="text-sm font-medium text-gray-300 mb-3 uppercase tracking-wide">Categories</h2>
              
              <div className="space-y-2">
                {Object.keys(sampleQuestions).map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setQuestion(sampleQuestions[category][0]);
                      setAnswer('');
                      setFeedback(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-white text-black'
                        : 'text-gray-400 hover:text-white hover:bg-[#252525]'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Sample Questions */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-5">
              <h3 className="text-sm font-medium text-gray-300 mb-3 uppercase tracking-wide">Questions</h3>
              <div className="space-y-1">
                {sampleQuestions[selectedCategory].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuestion(q);
                      setAnswer('');
                      setFeedback(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      question === q
                        ? 'bg-[#252525] text-white'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-[#1f1f1f]'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Question Card */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Current Question</span>
                  <span className="ml-3 text-xs px-2 py-1 bg-[#252525] text-gray-400 rounded">
                    {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                  </span>
                </div>
              </div>
              <p className="text-white text-lg leading-relaxed">{question}</p>
            </div>

            {/* Answer Input */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-300 uppercase tracking-wide">Your Response</label>
                <span className="text-xs text-gray-500">
                  {answer.length} characters • {answer.split(' ').filter(w => w).length} words
                </span>
              </div>
              
              <textarea
                className="w-full bg-[#151515] border border-[#2a2a2a] rounded px-4 py-3 text-white placeholder-gray-600 focus:border-gray-500 focus:outline-none transition-colors min-h-[180px] resize-y"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Type your answer here. Be specific and provide examples from your experience."
              />
              
              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setAnswer('');
                    setFeedback(null);
                  }}
                  className="px-5 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Clear
                </button>
                
                <button
                  onClick={handleAnalyze}
                  disabled={!answer.trim() || isAnalyzing}
                  className={`px-6 py-2 text-sm font-medium rounded transition-all ${
                    !answer.trim() || isAnalyzing
                      ? 'bg-[#2a2a2a] text-gray-600 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-gray-200'
                  }`}
                >
                  {isAnalyzing ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Analyzing
                    </span>
                  ) : (
                    'Analyze Response'
                  )}
                </button>
              </div>
            </div>

            {/* Feedback Results */}
            {feedback && (
              <div className="space-y-6">
                {/* Overall Score */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-1">Overall Score</h3>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-4xl font-semibold ${getScoreColor(feedback.overallScore)}`}>
                          {feedback.overallScore}
                        </span>
                        <span className="text-gray-600 text-lg">/100</span>
                        <span className={`ml-3 text-sm font-medium ${getScoreColor(feedback.overallScore)}`}>
                          {getScoreLabel(feedback.overallScore)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-[#252525] rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-white transition-all duration-1000 ease-out"
                      style={{ width: `${feedback.overallScore}%` }}
                    />
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid md:grid-cols-3 gap-4">
                  {Object.entries(feedback.toneAnalysis).map(([key, value]) => (
                    <div key={key} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-400 capitalize">{key}</span>
                        <span className={`text-xl font-semibold ${getScoreColor(value)}`}>{value}%</span>
                      </div>
                      <div className="w-full bg-[#252525] rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-white transition-all duration-1000 ease-out"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Strengths and Improvements */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide mb-4">Strengths</h3>
                    <ul className="space-y-3">
                      {feedback.strengths.map((strength, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-300">
                          <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm leading-relaxed">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvements */}
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide mb-4">Areas to Improve</h3>
                    <ul className="space-y-3">
                      {feedback.improvements.map((improvement, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-300">
                          <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm leading-relaxed">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Detailed Feedback */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide mb-4">Detailed Analysis</h3>
                  <p className="text-gray-400 leading-relaxed">{feedback.detailedFeedback}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setAnswer('');
                      setFeedback(null);
                    }}
                    className="px-5 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                  >
                    Try Another Question
                  </button>
                  <button
                    onClick={handleAnalyze}
                    className="px-5 py-2 text-sm font-medium bg-white text-black rounded hover:bg-gray-200 transition-colors"
                  >
                    Re-analyze Response
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
