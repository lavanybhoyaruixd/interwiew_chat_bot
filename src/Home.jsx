import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from './components/Navbar';
import HomeJobSection from './components/HomeJobSection';
import ErrorBoundary from './components/ErrorBoundary';
import DarkVeil from './components/DarkVeil';
import StatCard from "./components/StatCard";
import TechBotModal from "./components/TechBotModal";
import SmartQuestionDemo from "./components/SmartQuestionDemo";

// Lazy load JobSuggestions to reduce initial bundle size
const JobSuggestions = lazy(() => import('./components/JobSuggestions'));

// Professional SVG Icons
const ResumeIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const AIIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const FeedbackIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const FeatureIcon = ({ children, gradient }) => (
  <div className={`mb-6 flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} shadow-2xl border border-white/10 text-white transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
    {children}
  </div>
);

const StatIcon = ({ children, gradient }) => (
  <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${gradient} shadow-lg text-white text-xl`}>
    {children}
  </div>
);

// Animated Counter Component with smooth animations
const AnimatedCounter = React.memo(({ end, duration = 1500, suffix = '', prefix = '', decimals = 1, start = false }) => {
  const [count, setCount] = useState(0);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!start || hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    let animationFrameRef = null;
    let startTime = null;

    const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);

      const currentCount = easedProgress * end;
      setCount(currentCount);

      if (progress < 1) {
        animationFrameRef = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrameRef = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef) {
        cancelAnimationFrame(animationFrameRef);
      }
    };
  }, [start, end, duration]);

  // Format the count properly
  const displayCount = () => {
    // For numbers that should display as K (thousands)
    if (end >= 1000) {
      // While counting, show whole numbers increasing
      if (count < end) {
        return Math.floor(count).toLocaleString();
      }
      // At the end, show K format
      return (count / 1000).toFixed(1) + 'K';
    }
    
    // For decimal numbers like ratings (4.6/5)
    if (end < 10 && end % 1 !== 0) {
      return count.toFixed(decimals);
    }
    
    // For regular numbers
    return Math.floor(count).toLocaleString();
  };

  return (
    <span className="inline-block" style={{ fontVariantNumeric: 'tabular-nums' }}>
      {prefix}{displayCount()}{suffix}
    </span>
  );
});

export default function Home() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [isTechBotOpen, setIsTechBotOpen] = useState(false);
  const [startCounters, setStartCounters] = useState(false);
  
  // Get token once on mount, not during render
  useEffect(() => {
    setToken(localStorage.getItem('hiremate_token') || '');
  }, []);

  useEffect(() => {
    const section = document.getElementById('impact-section');
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            setStartCounters(true);
            observer.disconnect();
          }
        });
      },
      { threshold: [0.4] }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="relative min-h-screen text-white font-sans overflow-x-hidden">
      {/* Fallback Background - Fixed positioning to prevent disappearing */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -2,
          overflow: 'hidden',
          background: 'linear-gradient(to bottom right, #0f0c29, #302b63, #24243e)'
        }}
      >
        <DarkVeil 
          hueShift={30}
          noiseIntensity={0.02}
          scanlineIntensity={0.08}
          speed={0.5}
          scanlineFrequency={4.0}
          warpAmount={0.08}
          resolutionScale={1}
        />
      </div>
      {/* Navbar */}
      <div style={{ height: '80px', position: 'relative', zIndex: 10, marginBottom: '2rem' }}>
        <Navbar />
      </div>
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-4 from-[#0f0c29] via-[#302b63] to-[#24243e]">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight font-[Oswald] text-white uppercase leading-tight">
          Don't Just Prepare 
        </h1>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight font-[Oswald] bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
          Dominate!
        </h1>   
        <p className="text-lg md:text-2xl text-white/80 max-w-2xl mb-8 font-[Inter] leading-relaxed">
          Prep Smarter, Get Feedback Faster, Land Your Dream Job  
          Start Your Mock Interview!
        </p>
        <button
          className="text-lg px-8 py-3 mt-2 rounded-xl font-bold text-accent border border-accent bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-lg"
          style={{WebkitBackdropFilter:'blur(16px)', backdropFilter:'blur(16px)', borderColor:'#00ffe1'}}
          onClick={() => setIsTechBotOpen(true)}
        >
          Try Now
        </button>
      </section>
      
      {/* Job Search Section */}
      <HomeJobSection />
      
      {/* Features Section */}
      <section className="flex flex-col items-center py-20 px-4" id="features">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white font-[Space_Grotesk]">
            Powerful <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Features</span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto font-[Inter]">
            Everything you need to ace your interviews and land your dream job
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl">
          <div 
            className="group relative rounded-3xl bg-gradient-to-br from-[#18181b]/90 to-[#1a1a1f]/90 border border-[#23272f] shadow-2xl p-8 flex flex-col items-start glassmorphism hover:border-cyan-400/50 transition-all duration-500 cursor-pointer hover:shadow-cyan-500/20 hover:shadow-2xl hover:-translate-y-2 feature-card"
            onClick={() => navigate('/resume-analyzer')}
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-500"></div>
            <div className="relative z-10 w-full">
              <FeatureIcon gradient="from-cyan-500 to-blue-600">
                <ResumeIcon />
              </FeatureIcon>
              <h3 className="font-bold text-2xl mb-3 text-white font-[Space_Grotesk] group-hover:text-cyan-400 transition-colors">Resume Analyzer</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-6 font-[Inter]">Upload your resume for AI-powered analysis and personalized feedback to improve your job application.</p>
              <span className="text-cyan-400 text-sm font-semibold flex items-center group-hover:gap-2 transition-all font-[Inter]">
                Try it now <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </div>
          </div>
          
          <div 
            className="group relative rounded-3xl bg-gradient-to-br from-[#18181b]/90 to-[#1a1a1f]/90 border border-[#23272f] shadow-2xl p-8 flex flex-col items-start glassmorphism hover:border-purple-400/50 transition-all duration-500 cursor-pointer hover:shadow-purple-500/20 hover:shadow-2xl hover:-translate-y-2 feature-card"
            onClick={() => navigate('/smart-questions')}
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500"></div>
            <div className="relative z-10 w-full">
              <FeatureIcon gradient="from-purple-500 to-pink-600">
                <AIIcon />
              </FeatureIcon>
              <h3 className="font-bold text-2xl mb-3 text-white font-[Space_Grotesk] group-hover:text-purple-400 transition-colors">Smart Question Generation</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-6 font-[Inter]">AI crafts tailored questions from your resume and job role for realistic practice.</p>
              <span className="text-purple-400 text-sm font-semibold flex items-center group-hover:gap-2 transition-all font-[Inter]">
                Try it now <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </div>
          </div>
          
          <div 
            className="group relative rounded-3xl bg-gradient-to-br from-[#18181b]/90 to-[#1a1a1f]/90 border border-[#23272f] shadow-2xl p-8 flex flex-col items-start glassmorphism hover:border-yellow-400/50 transition-all duration-500 cursor-pointer hover:shadow-yellow-500/20 hover:shadow-2xl hover:-translate-y-2 feature-card"
            onClick={() => navigate('/instant-feedback')}
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-yellow-500/0 to-orange-500/0 group-hover:from-yellow-500/10 group-hover:to-orange-500/10 transition-all duration-500"></div>
            <div className="relative z-10 w-full">
              <FeatureIcon gradient="from-yellow-500 to-orange-600">
                <FeedbackIcon />
              </FeatureIcon>
              <h3 className="font-bold text-2xl mb-3 text-white font-[Space_Grotesk] group-hover:text-yellow-400 transition-colors">Instant Feedback</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-6 font-[Inter]">Get actionable feedback on your answers, tone, and confidence instantly.</p>
              <span className="text-yellow-400 text-sm font-semibold flex items-center group-hover:gap-2 transition-all font-[Inter]">
                Try it now <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </div>
          </div>
          
          <div 
            className="group relative rounded-3xl bg-gradient-to-br from-[#18181b]/90 to-[#1a1a1f]/90 border border-[#23272f] shadow-2xl p-8 flex flex-col items-start glassmorphism hover:border-indigo-400/50 transition-all duration-500 cursor-pointer hover:shadow-indigo-500/20 hover:shadow-2xl hover:-translate-y-2 feature-card"
            onClick={() => navigate('/real-time-analysis')}
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/0 to-blue-500/0 group-hover:from-indigo-500/10 group-hover:to-blue-500/10 transition-all duration-500"></div>
            <div className="relative z-10 w-full">
              <FeatureIcon gradient="from-indigo-500 to-blue-600">
                <AnalyticsIcon />
              </FeatureIcon>
              <h3 className="font-bold text-2xl mb-3 text-white font-[Space_Grotesk] group-hover:text-indigo-400 transition-colors">Real-Time Analysis</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-6 font-[Inter]">Live analysis of your performance with improvement tips and analytics.</p>
              <span className="text-indigo-400 text-sm font-semibold flex items-center group-hover:gap-2 transition-all font-[Inter]">
                Try it now <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Question Demo Section */}
      <SmartQuestionDemo />

      {/* Job Listings Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-[#0f0c29] to-[#24243e] w-full">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white font-[Space_Grotesk]">
              Find Your <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Dream Job</span>
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto font-[Inter]">
              Browse through the latest job opportunities that match your skills and preferences
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Suspense fallback={<div className="flex justify-center items-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div>}>
              <JobSuggestions jobTitle="software engineer" limit={5} />
            </Suspense>
          </div>
        </div>
      </section>
      
      {/* Personalized Job Listings Section */}
      <section className="flex flex-col items-center py-16 px-4" id="job-listings">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white font-[Space_Grotesk]">
            Job <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">Listings For You</span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto font-[Inter]">
            Curated roles matched to your interview performance & resume strengths.
          </p>
        </div>
        <div className="w-full max-w-5xl">
          <div className="rounded-2xl border border-[#23272f] bg-[#18181b]/80 backdrop-blur-md p-6 shadow-xl" style={{ contain: 'layout style paint', transform: 'translateZ(0)' }}>
            <Suspense fallback={<div className="flex justify-center items-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div>}>
              <JobSuggestions token={token} limit={12} />
            </Suspense>
          </div>
        </div>
      </section>
      





    {/* Impact Statistics Section */}

  <section id="impact-section" className="relative py-24 px-4 overflow-hidden">

  {/* Animated background blobs */}
  <div className="absolute inset-0 overflow-hidden opacity-20">
    <div className="absolute top-1/4 -left-20 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-40 animate-blob"></div>
    <div className="absolute top-1/3 -right-20 w-64 h-64 bg-cyan-500 rounded-full blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-20 left-1/2 w-64 h-64 bg-pink-500 rounded-full blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
  </div>

  <div className="relative max-w-7xl mx-auto">
    {/* Heading */}
    <div className="text-center mb-16">
      <h2 className="text-4xl md:text-5xl font-bold text-white font-[Space_Grotesk]">
        Our <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Impact</span>
      </h2>
      <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto font-[Inter]">
        Empowering job seekers worldwide with AI-powered interview tools.
      </p>
    </div>

    {/* 4 Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

      {/* Total Users */}
      <StatCard
        title="Total Users"
        subtitle="and growing every day"
        iconColor="from-cyan-500 to-blue-600"
        glow="shadow-cyan-500/20"
      >
        <AnimatedCounter end={5200} duration={1500} start={startCounters} />
      </StatCard>

      {/* Daily Sessions */}
      <StatCard
        title="Daily Sessions"
        subtitle="active users this month"
        iconColor="from-purple-500 to-pink-600"
        glow="shadow-purple-500/20"
      >
        <AnimatedCounter end={12400} duration={1500} start={startCounters} />
      </StatCard>

      {/* Interviews Taken */}
      <StatCard
        title="Interviews Taken"
        subtitle="and counting"
        iconColor="from-amber-500 to-orange-600"
        glow="shadow-amber-500/20"
      >
        <AnimatedCounter end={8900} duration={1500} start={startCounters} />
      </StatCard>

      {/* Avg Score */}
      <StatCard
        title="Avg Feedback Score"
        subtitle="from our users"
        iconColor="from-emerald-500 to-cyan-600"
        glow="shadow-emerald-500/20"
      >
        <AnimatedCounter end={4.6} duration={1500} suffix="/5" decimals={1} start={startCounters} />
      </StatCard>

    </div>

    <p className="mt-16 text-center text-slate-400 max-w-3xl mx-auto leading-relaxed">
      Join thousands of professionals improving their interview skills with AI.
    </p>
  </div>
</section>

      
      {/* Footer */}
      <footer className="mt-12 border-t border-white/10 bg-[#0b0f17]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="space-y-4">
              <div className="text-xl font-bold text-white tracking-tight">HireMate</div>
              <p className="text-sm text-white/60 leading-relaxed">
                AI-powered interview prep platform helping professionals practice smarter and get hired faster.
              </p>
              <div className="flex gap-3">
                <a href="#" className="h-9 w-9 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 10-11.5 9.9v-7h-2.7V12h2.7V9.8c0-2.7 1.6-4.2 4-4.2 1.2 0 2.4.2 2.4.2v2.6h-1.4c-1.4 0-1.8.9-1.8 1.7V12h3.1l-.5 2.9h-2.6v7A10 10 0 0022 12z"/></svg>
                </a>
                <a href="#" className="h-9 w-9 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21 8.1c.8-.5 1.4-1.1 1.8-2-.8.4-1.6.6-2.5.8a4.2 4.2 0 00-7.2 3v.6a12 12 0 01-8.6-4.4a4.2 4.2 0 001.3 5.6c-.6 0-1.2-.2-1.7-.4 0 1.9 1.4 3.5 3.3 3.9-.6.2-1.2.2-1.8.1a4.2 4.2 0 003.9 2.9A8.4 8.4 0 013 19.5a12 12 0 006.5 1.9c7.8 0 12-6.5 12-12.1v-.6z"/></svg>
                </a>
                <a href="https://www.linkedin.com/in/lavanybhoyaruixd" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5A2.5 2.5 0 102.5 6a2.5 2.5 0 002.48-2.5zM3 8.5h4v12H3v-12zm7 0h3.8v1.7h.1c.5-1 1.8-2 3.8-2 4.1 0 4.8 2.7 4.8 6.1v6.2h-4v-5.5c0-1.3 0-3-1.9-3s-2.2 1.5-2.2 3v5.5h-4v-12z"/></svg>
                </a>
                <a href="https://github.com/lavanybhoyaruixd" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.9 9.6.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.3-3.4-1.3-.4-1-1-1.2-1-1.2-.8-.5.1-.5.1-.5.9.1 1.4 1 1.4 1 .8 1.4 2.2 1 2.7.8.1-.6.3-1 .5-1.2-2.2-.2-4.5-1.1-4.5-4.9 0-1.1.4-2 1-2.7-.1-.2-.4-1.2.1-2.5 0 0 .9-.3 2.8 1a9.6 9.6 0 015.1 0c1.9-1.3 2.8-1 2.8-1 .5 1.3.2 2.3.1 2.5.7.7 1 1.6 1 2.7 0 3.8-2.3 4.7-4.5 4.9.3.3.6.8.6 1.7v2.5c0 .3.2.6.7.5 4-1.3 6.9-5.1 6.9-9.6C22 6.6 17.5 2 12 2z"/></svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white/90 uppercase tracking-widest">Product</h4>
              <ul className="mt-4 space-y-2 text-sm text-white/60">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#impact-section" className="hover:text-white transition">Impact</a></li>
                <li><a href="#job-listings" className="hover:text-white transition">Jobs</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white/90 uppercase tracking-widest">Company</h4>
              <ul className="mt-4 space-y-2 text-sm text-white/60">
                <li><Link to="/company" className="hover:text-white transition">Company</Link></li>
                <li><Link to="/about" className="hover:text-white transition">About</Link></li>
                <li><Link to="/careers" className="hover:text-white transition">Careers</Link></li>
                <li><Link to="/blog" className="hover:text-white transition">Blog</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white/90 uppercase tracking-widest">Contact</h4>
              <ul className="mt-4 space-y-2 text-sm text-white/60">
                <li>support@hiremate.ai</li>
                <li>contact.lavanyabhoyar@gmail.com</li>
                <li>+91 9923111212</li>
                <li>Mon–Fri · 9:00–18:00</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="text-xs text-white/50">&copy; {new Date().getFullYear()} HireMate. All rights reserved.</div>
              <div className="text-xs text-white/40">
                Designed & Developed with <span className="text-red-400">♥</span> by <span className="text-white/60 font-medium">Lavanya Bhoyar</span>
              </div>
            </div>
            <div className="text-xs text-white/50">
             <Link to="/legal" className="hover:text-white transition">
            Privacy Policy · Terms of Service · Security
            </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* TechBot Floating Button */}
      <button
        onClick={() => setIsTechBotOpen(true)}
        className="fixed bottom-8 right-8 z-40 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center"
        aria-label="Open TechBot"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
        TechBot
      </button>

      {/* TechBot Modal */}
      <TechBotModal
        isOpen={isTechBotOpen}
        onClose={() => setIsTechBotOpen(false)}
      />
      
      {/* Fonts - moved to index.html for better performance */}
      <style>{`
        .font-[Space_Grotesk] { font-family: 'Space Grotesk', sans-serif; }
        .font-[Orbitron] { font-family: 'Orbitron', sans-serif; }
        .font-[Inter] { font-family: 'Inter', sans-serif; }
        .text-accent { color: #00ffe1; }
        .font-[Bitcount_Prop_Single] { font-family: 'Bitcount Prop Single', sans-serif; }
        .glassmorphism { box-shadow: 0 8px 32px 0 rgba(31,38,135,0.18); backdrop-filter: blur(8px); }
        
        /* Blob animations */
        @keyframes blob {
          0% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0, 0) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        /* Counter animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .counter-item {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .counter-item:nth-child(1) { animation-delay: 0.1s; }
        .counter-item:nth-child(2) { animation-delay: 0.2s; }
        .counter-item:nth-child(3) { animation-delay: 0.3s; }
        .counter-item:nth-child(4) { animation-delay: 0.4s; }
        
        /* Feature card animations - use will-change for better performance */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .feature-card {
          animation: float 6s ease-in-out infinite;
          will-change: transform;
        }
        
        .feature-card:nth-child(1) { animation-delay: 0s; }
        .feature-card:nth-child(2) { animation-delay: 1.5s; }
        .feature-card:nth-child(3) { animation-delay: 3s; }
        .feature-card:nth-child(4) { animation-delay: 4.5s; }
      `}</style>
    </div>
  );
} 