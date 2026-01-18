// // src/App.jsx
// // Main application component for the Interview Bot UI
// import React from 'react';
// import { ChatProvider } from './contexts/ChatContext';
// import Chatbot from "./Chatbot";
// import ErrorBoundary from './components/ErrorBoundary';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import Navigation from './components/Navigation';
// import ResumeAnalyzer from './pages/ResumeAnalyzer';
// import TechChatbot from './components/TechChatbot';

// function App() {
//   return (
//     <Router>
//       <div className="min-h-screen bg-gray-50">
//         <Navigation />
//         <ToastContainer 
//           position="top-right"
//           autoClose={5000}
//           hideProgressBar={false}
//           newestOnTop={false}
//           closeOnClick
//           rtl={false}
//           pauseOnFocusLoss
//           draggable
//           pauseOnHover
//         />
        
//         <main className="container mx-auto px-4 py-8">
//           <Routes>
//             <Route path="/" element={<ResumeAnalyzer />} />
//             <Route path="/chat" element={<TechChatbot />} />
//             <Route path="*" element={<Navigate to="/" replace />} />
//           </Routes>
//         </main>
//       </div>
//     </Router>
//   );
// }

// export default App;



// src/App.jsx
import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navigation from './components/Navigation';
import FeatureNavigation from './components/FeatureNavigation';
import TechChatbot from './components/TechChatbot';
import Home from './Home';
import Login from './Login';
import SmartQuestionGeneration from './pages/SmartQuestionGeneration';
import InstantFeedback from './pages/InstantFeedback';
import RealTimeAnalysis from './pages/RealTimeAnalysis';
import Company from './pages/Company';
import About from './pages/About';
import Careers from './pages/Careers';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import LegalPage from './pages/LegalPage';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

function AppContent() {
  const location = useLocation();
  const isSmartQuestions = location.pathname === '/smart-questions';
  
  return (
    <div className={isSmartQuestions ? "min-h-screen" : "min-h-screen bg-gray-50"}>
      <Navigation />
      <FeatureNavigation />
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat" element={<TechChatbot />} />
        <Route path="/smart-questions" element={<SmartQuestionGeneration />} />
        <Route path="/company" element={<Company />} />
        <Route path="/about" element={<About />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/legal" element={<LegalPage />} />
          <Route path="/instant-feedback" element={
            <main className="container mx-auto px-4 py-8">
              <InstantFeedback />
            </main>
          } />
          <Route path="/real-time-analysis" element={
            <main className="container mx-auto px-4 py-8">
              <RealTimeAnalysis />
            </main>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
