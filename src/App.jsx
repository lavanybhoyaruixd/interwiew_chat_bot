// src/App.jsx
// Main application component for the Interview Bot UI
import React from "react";
import Chatbot from "./Chatbot";

function App() {
  return (
    <div className="min-h-screen w-full flex flex-col transition-colors duration-500 bg-gradient-to-br from-white via-blue-100 to-purple-100"
      style={{ minHeight: '100vh', minWidth: '100vw' }}>
      {/* Render the dark Chatbot component without navbar */}
      <Chatbot />
    </div>
  );
}

export default App;
