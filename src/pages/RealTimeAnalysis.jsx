import React, { useState } from 'react';

export default function RealTimeAnalysis() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      title: 'Answer Structure',
      description: 'Real-time detection of STAR method and answer organization'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Speaking Pace',
      description: 'Monitor your speaking speed and adjust in real-time'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
      title: 'Filler Words',
      description: 'Instant alerts when using "um", "like", "you know"'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Keyword Coverage',
      description: 'Track mention of key skills and requirements'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Confidence Level',
      description: 'AI analysis of tone, clarity, and assertiveness'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Live Metrics',
      description: 'Word count, time elapsed, and performance scores'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl font-semibold text-white">Real-Time Analysis</h1>
            <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-400 text-xs font-medium uppercase tracking-wide">
              Coming Soon
            </span>
          </div>
          <p className="text-gray-400 text-base">
            Get live AI-powered feedback as you practice answering interview questions
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Interview Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Display */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Practice Question</span>
                  <span className="ml-3 text-xs px-2 py-1 bg-[#252525] text-gray-400 rounded">
                    Behavioral
                  </span>
                </div>
              </div>
              <p className="text-white text-lg leading-relaxed">
                Tell me about a time when you had to handle a difficult situation at work. How did you approach it?
              </p>
            </div>

            {/* Recording Interface */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">Your Response</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                  <span>00:00</span>
                </div>
              </div>

              {/* Transcript Area */}
              <div className="bg-[#151515] border border-[#2a2a2a] rounded-lg p-4 min-h-[200px] mb-6 relative overflow-hidden">
                {transcript ? (
                  <p className="text-white">{transcript}</p>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <svg className="w-16 h-16 text-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <p className="text-gray-500 text-sm">Start recording to see your transcript here</p>
                    <p className="text-gray-600 text-xs mt-1">AI will analyze your speech in real-time</p>
                  </div>
                )}
              </div>

              {/* Recording Controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  disabled
                  className="flex items-center gap-3 px-8 py-3 bg-[#2a2a2a] text-gray-600 rounded-lg font-medium cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  Start Recording
                </button>
                <button
                  disabled
                  className="px-6 py-3 bg-[#2a2a2a] text-gray-600 rounded-lg font-medium cursor-not-allowed"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Live Metrics Dashboard */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide mb-5">Live Performance Metrics</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#151515] border border-[#2a2a2a] rounded-lg p-4">
                  <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Words</div>
                  <div className="text-2xl font-semibold text-gray-600">0</div>
                </div>
                <div className="bg-[#151515] border border-[#2a2a2a] rounded-lg p-4">
                  <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">WPM</div>
                  <div className="text-2xl font-semibold text-gray-600">0</div>
                </div>
                <div className="bg-[#151515] border border-[#2a2a2a] rounded-lg p-4">
                  <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Fillers</div>
                  <div className="text-2xl font-semibold text-gray-600">0</div>
                </div>
                <div className="bg-[#151515] border border-[#2a2a2a] rounded-lg p-4">
                  <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Score</div>
                  <div className="text-2xl font-semibold text-gray-600">--</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Features & Live Feedback */}
          <div className="lg:col-span-1 space-y-6">
            {/* Coming Soon Notice */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Feature in Development</h3>
                  <p className="text-indigo-200 text-sm leading-relaxed">
                    We're building advanced AI capabilities to provide you with real-time feedback during practice sessions.
                  </p>
                </div>
              </div>
            </div>

            {/* Live Feedback Panel */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">Live Feedback</h3>
                <div className="w-2 h-2 rounded-full bg-gray-600"></div>
              </div>
              
              <div className="space-y-3">
                <div className="bg-[#151515] border border-[#2a2a2a] rounded-lg p-3 opacity-50">
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-gray-600 mt-2"></div>
                    <p className="text-gray-600 text-sm">Feedback will appear here as you speak</p>
                  </div>
                </div>
                <div className="bg-[#151515] border border-[#2a2a2a] rounded-lg p-3 opacity-50">
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-gray-600 mt-2"></div>
                    <p className="text-gray-600 text-sm">AI suggestions in real-time</p>
                  </div>
                </div>
                <div className="bg-[#151515] border border-[#2a2a2a] rounded-lg p-3 opacity-50">
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-gray-600 mt-2"></div>
                    <p className="text-gray-600 text-sm">Instant improvement tips</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-5">
              <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide mb-4">Upcoming Features</h3>
              
              <div className="space-y-3">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 pb-3 border-b border-[#2a2a2a] last:border-0 last:pb-0">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#252525] flex items-center justify-center text-gray-500">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-medium mb-1">{feature.title}</h4>
                      <p className="text-gray-500 text-xs leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Info Banner */}
        <div className="mt-8 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">What to Expect</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-3">
                Once launched, Real-Time Analysis will provide instant feedback during your practice sessions. The AI will monitor your speech patterns, 
                vocabulary usage, answer structure, and delivery, offering suggestions as you speak. This feature will help you improve your interview 
                performance in real-time, making your practice sessions more effective and productive.
              </p>
              <div className="flex items-center gap-2 text-xs text-indigo-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Stay tuned for updates</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
