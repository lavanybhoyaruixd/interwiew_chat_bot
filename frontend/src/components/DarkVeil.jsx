import React from 'react';

const DarkVeil = () => {
  return (
    <div className="dark-veil">
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white p-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to Interview AI
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-80">
            Prepare for your next interview with AI-powered assistance
          </p>
          <div className="space-x-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
              Get Started
            </button>
            <button className="border border-white text-white hover:bg-white hover:text-gray-900 font-bold py-3 px-6 rounded-lg transition duration-300">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DarkVeil;
