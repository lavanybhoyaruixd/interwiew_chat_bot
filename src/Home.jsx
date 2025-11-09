import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from './components/Navbar';
import DarkVeil from './DarkVeil';

// Example icons (replace with better ones or SVGs as needed)
const FeatureIcon = ({ children }) => (
  <div className="mb-4 flex items-center justify-center w-12 h-12 rounded-xl bg-[#18181b]/80 shadow-lg border border-[#23272f] text-accent text-2xl">
    {children}
  </div>
);
const StatIcon = ({ children }) => (
  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#23272f] text-accent text-lg mr-2">
    {children}
  </div>
);

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen text-white font-sans overflow-x-hidden">
      {/* Fallback Background */}
      <div className="absolute inset-0 -z-10 w-full h-full bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <DarkVeil
          hueShift={30}
          noiseIntensity={0.02}
          scanlineIntensity={0.08}
          scanlineFrequency={4.0}
          warpAmount={0.08}
          resolutionScale={1}
          speed={0.5}
        />
      </div>
      {/* Navbar */}
      <div style={{ height: '80px', position: 'relative', marginBottom: '2rem' }}>
        <Navbar />
      </div>
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-4 from-[#0f0c29] via-[#302b63] to-[#24243e]">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight font-bold font-[Oswald] text-white uppercase leading-tight">
          Don't Just Prepare 
        </h1>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight font-bold font-[Oswald] bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent font-extrabold">
          Dominate!
        </h1>   
        <p className="text-lg md:text-2xl text-white/80 max-w-2xl mb-8 font-[Inter] leading-relaxed">
          Prep Smarter, Get Feedback Faster, Land Your Dream Job  
          Start Your Mock Interview!
        </p>
        <button
          className="text-lg px-8 py-3 mt-2 rounded-xl font-bold text-accent border border-accent bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-lg"
          style={{WebkitBackdropFilter:'blur(16px)', backdropFilter:'blur(16px)', borderColor:'#00ffe1'}}
          onClick={() => navigate('/interview')}
        >
          Try Now
        </button>
      </section>
      
      {/* Features Section */}
      <section className="flex flex-col items-center py-12 px-4" id="features">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-accent font-[Space_Grotesk]">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          <div className="rounded-2xl bg-[#18181b]/80 border border-[#23272f] shadow-xl p-8 flex flex-col items-center glassmorphism">
            <FeatureIcon>🤖</FeatureIcon>
            <h3 className="font-bold text-xl mb-2">Smart Question Generation</h3>
            <p className="text-white/70">AI crafts tailored questions from your resume and job role for realistic practice.</p>
          </div>
          <div className="rounded-2xl bg-[#18181b]/80 border border-[#23272f] shadow-xl p-8 flex flex-col items-center glassmorphism">
            <FeatureIcon>⚡</FeatureIcon>
            <h3 className="font-bold text-xl mb-2">Instant Feedback</h3>
            <p className="text-white/70">Get actionable feedback on your answers, tone, and confidence instantly.</p>
          </div>
          <div className="rounded-2xl bg-[#18181b]/80 border border-[#23272f] shadow-xl p-8 flex flex-col items-center glassmorphism">
            <FeatureIcon>📊</FeatureIcon>
            <h3 className="font-bold text-xl mb-2">Real-Time Analysis</h3>
            <p className="text-white/70">Live analysis of your performance with improvement tips and analytics.</p>
          </div>
        </div>
      </section>
      
      {/* Statistics Section */}
      <section className="flex flex-col items-center py-12 px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-accent font-[Space_Grotesk]">Our Impact</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl">
          <div className="rounded-xl bg-[#18181b]/80 border border-[#23272f] shadow-lg p-6 flex flex-col items-center">
            <div className="flex items-center mb-2"><StatIcon>👥</StatIcon><span className="text-2xl font-bold">12,400</span></div>
            <div className="text-white/60 text-sm">Total Users</div>
          </div>
          <div className="rounded-xl bg-[#18181b]/80 border border-[#23272f] shadow-lg p-6 flex flex-col items-center">
            <div className="flex items-center mb-2"><StatIcon>⏰</StatIcon><span className="text-2xl font-bold">1,200</span></div>
            <div className="text-white/60 text-sm">Daily Sessions</div>
          </div>
          <div className="rounded-xl bg-[#18181b]/80 border border-[#23272f] shadow-lg p-6 flex flex-col items-center">
            <div className="flex items-center mb-2"><StatIcon>📝</StatIcon><span className="text-2xl font-bold">8,900</span></div>
            <div className="text-white/60 text-sm">Interviews Taken</div>
          </div>
          <div className="rounded-xl bg-[#18181b]/80 border border-[#23272f] shadow-lg p-6 flex flex-col items-center">
            <div className="flex items-center mb-2"><StatIcon>⭐</StatIcon><span className="text-2xl font-bold">4.8/5</span></div>
            <div className="text-white/60 text-sm">Avg Feedback Score</div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="flex flex-col md:flex-row justify-between items-center px-8 py-6 bg-[#18181b]/80 border-t border-[#23272f] mt-8">
        <div className="text-white/60 text-sm">&copy; {new Date().getFullYear()} HireMate. All rights reserved.</div>
        <div className="flex gap-4 mt-2 md:mt-0">
          <a href="#" className="hover:text-accent transition"><svg width="20" height="20" fill="currentColor"><circle cx="10" cy="10" r="8" /></svg></a>
          <a href="#" className="hover:text-accent transition"><svg width="20" height="20" fill="currentColor"><rect x="4" y="4" width="12" height="12" rx="3"/></svg></a>
          <a href="#" className="hover:text-accent transition"><svg width="20" height="20" fill="currentColor"><polygon points="10,3 17,17 3,17"/></svg></a>
        </div>
      </footer>
      
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
      `}</style>
    </div>
  );
} 