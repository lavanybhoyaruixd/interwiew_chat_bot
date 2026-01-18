/**
 * EXAMPLE: Updated Home.jsx with CountUpAnimation
 * This shows how to integrate the CountUpAnimation component into your existing Home page
 */

import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from './components/Navbar';
import HomeJobSection from './components/HomeJobSection';
import ErrorBoundary from './components/ErrorBoundary';
import DarkVeil from './components/DarkVeil';
import StatCard from "./components/StatCard";
import CountUpAnimation from "./components/CountUpAnimation"; // ← NEW IMPORT
import TechBotModal from "./components/TechBotModal";
import SmartQuestionDemo from "./components/SmartQuestionDemo";

const JobSuggestions = lazy(() => import('./components/JobSuggestions'));

// ... other components ...

export default function Home() {
  // ... existing state and logic ...

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <Navbar />
      
      {/* ... other sections ... */}

      {/* IMPACT SECTION WITH COUNT-UP ANIMATIONS */}
      <section className="py-20 bg-gradient-to-b from-transparent to-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Our Impact at Scale
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Trusted by thousands of professionals to enhance their careers through AI-powered insights
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Total Users Card */}
            <div className="group relative bg-gradient-to-br from-blue-600/20 to-blue-900/20 
                            backdrop-blur-sm border border-blue-400/30 rounded-2xl p-8 
                            hover:-translate-y-2 hover:border-blue-400/50 transition-all duration-500 shadow-lg">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl 
                              bg-gradient-to-br from-blue-500 to-blue-600 
                              shadow-lg mb-6 text-white text-2xl">
                👥
              </div>
              <div className="text-5xl font-bold text-blue-400 mb-2 font-[Space_Grotesk] min-h-16">
                <CountUpAnimation
                  target={5200}
                  duration={2000}
                  format="k"
                  decimals={1}
                  suffix="K"
                />
              </div>
              <h3 className="text-lg font-semibold text-white">Total Users</h3>
              <p className="text-sm text-slate-400">Active professionals</p>
            </div>

            {/* Daily Sessions Card */}
            <div className="group relative bg-gradient-to-br from-purple-600/20 to-purple-900/20 
                            backdrop-blur-sm border border-purple-400/30 rounded-2xl p-8 
                            hover:-translate-y-2 hover:border-purple-400/50 transition-all duration-500 shadow-lg">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl 
                              bg-gradient-to-br from-purple-500 to-purple-600 
                              shadow-lg mb-6 text-white text-2xl">
                ⚡
              </div>
              <div className="text-5xl font-bold text-purple-400 mb-2 font-[Space_Grotesk] min-h-16">
                <CountUpAnimation
                  target={12400}
                  duration={2000}
                  format="k"
                  decimals={1}
                  suffix="K"
                />
              </div>
              <h3 className="text-lg font-semibold text-white">Daily Sessions</h3>
              <p className="text-sm text-slate-400">Per day average</p>
            </div>

            {/* Interviews Taken Card */}
            <div className="group relative bg-gradient-to-br from-green-600/20 to-green-900/20 
                            backdrop-blur-sm border border-green-400/30 rounded-2xl p-8 
                            hover:-translate-y-2 hover:border-green-400/50 transition-all duration-500 shadow-lg">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl 
                              bg-gradient-to-br from-green-500 to-green-600 
                              shadow-lg mb-6 text-white text-2xl">
                🎯
              </div>
              <div className="text-5xl font-bold text-green-400 mb-2 font-[Space_Grotesk] min-h-16">
                <CountUpAnimation
                  target={8900}
                  duration={2000}
                  format="k"
                  decimals={1}
                  suffix="K"
                />
              </div>
              <h3 className="text-lg font-semibold text-white">Interviews Taken</h3>
              <p className="text-sm text-slate-400">Total mock interviews</p>
            </div>

            {/* Avg Feedback Score Card */}
            <div className="group relative bg-gradient-to-br from-orange-600/20 to-orange-900/20 
                            backdrop-blur-sm border border-orange-400/30 rounded-2xl p-8 
                            hover:-translate-y-2 hover:border-orange-400/50 transition-all duration-500 shadow-lg">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl 
                              bg-gradient-to-br from-orange-500 to-orange-600 
                              shadow-lg mb-6 text-white text-2xl">
                ⭐
              </div>
              <div className="text-5xl font-bold text-orange-400 mb-2 font-[Space_Grotesk] min-h-16">
                <CountUpAnimation
                  target={4.6}
                  duration={2000}
                  format="decimal"
                  decimals={1}
                  suffix="/5"
                />
              </div>
              <h3 className="text-lg font-semibold text-white">Avg Feedback Score</h3>
              <p className="text-sm text-slate-400">User satisfaction rating</p>
            </div>

          </div>
        </div>
      </section>

      {/* ... rest of your sections ... */}
    </div>
  );
}


/* 
   ALTERNATIVE: Using with actual data from backend API
   
   If you want to fetch real statistics from your backend:
*/

/*
import { useEffect, useState } from 'react';

export default function HomeWithLiveStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Fetch from your backend API
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Failed to load stats:', err));
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <section className="py-20">
      <div className="grid grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="text-5xl font-bold text-blue-400 mb-2">
            <CountUpAnimation
              target={stats.totalUsers || 0}
              duration={2000}
              format="k"
              decimals={1}
              suffix="K"
            />
          </div>
          <h3 className="text-white">Total Users</h3>
        </div>
        
        <div className="stat-card">
          <div className="text-5xl font-bold text-purple-400 mb-2">
            <CountUpAnimation
              target={stats.dailySessions || 0}
              duration={2000}
              format="k"
              decimals={1}
              suffix="K"
            />
          </div>
          <h3 className="text-white">Daily Sessions</h3>
        </div>

        <div className="stat-card">
          <div className="text-5xl font-bold text-green-400 mb-2">
            <CountUpAnimation
              target={stats.interviews || 0}
              duration={2000}
              format="k"
              decimals={1}
              suffix="K"
            />
          </div>
          <h3 className="text-white">Interviews Taken</h3>
        </div>

        <div className="stat-card">
          <div className="text-5xl font-bold text-orange-400 mb-2">
            <CountUpAnimation
              target={stats.avgScore || 0}
              duration={2000}
              format="decimal"
              decimals={1}
              suffix="/5"
            />
          </div>
          <h3 className="text-white">Avg Feedback Score</h3>
        </div>
      </div>
    </section>
  );
}
*/
