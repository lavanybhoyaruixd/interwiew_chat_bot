// src/main.jsx
// Entry point for the React application
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Import global styles
import App from './App.jsx' // Import main App component
import Home from './Home.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Mount the App component to the root DOM node
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/interview" element={<App />} />
      </Routes>
    </Router>
  </StrictMode>,
)
