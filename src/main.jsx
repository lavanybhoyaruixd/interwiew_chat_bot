// // src/main.jsx
// // Entry point for the React application
// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css' // Import global styles
// import App from './App.jsx' // Import main App component
// import Home from './Home.jsx';
// import ResumeAnalyzer from './ResumeAnalyzer.jsx';
// import MinimalResumeAnalyzer from './MinimalResumeAnalyzer.jsx';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// // Mount the App component to the root DOM node
// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <Router>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/interview" element={<App />} />
//         <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
//         <Route path="/resume-analyzer-minimal" element={<MinimalResumeAnalyzer />} />
//       </Routes>
//     </Router>
//   </StrictMode>,
// )
// src/main.jsx
import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Home from './Home.jsx';
import App from './App.jsx';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import Chatbot from './Chatbot.jsx';
import MinimalResumeAnalyzer from './MinimalResumeAnalyzer.jsx';
import SmartQuestionGeneration from './pages/SmartQuestionGeneration';
import InstantFeedback from './pages/InstantFeedback';
import RealTimeAnalysis from './pages/RealTimeAnalysis';
import Company from './pages/Company';
import About from './pages/About';
import Careers from './pages/Careers';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import LegalPage from './pages/LegalPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/interview" element={<App />} /> 
        <Route path="/chat" element={<Chatbot />} />
        <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
        <Route path="/resume-analyzer-minimal" element={<MinimalResumeAnalyzer />} />
        <Route path="/smart-questions" element={<SmartQuestionGeneration />} />
        <Route path="/instant-feedback" element={<InstantFeedback />} />
        <Route path="/real-time-analysis" element={<RealTimeAnalysis />} />
        <Route path="/company" element={<Company />} />
        <Route path="/about" element={<About />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/legal" element={<LegalPage />} />
      </Routes>
    </Router>
  </StrictMode>
);
