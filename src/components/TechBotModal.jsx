import React from 'react';
import TechChatbot from './TechChatbot';

const TechBotModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-hidden" style={{ height: '80vh' }}>
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close chatbot"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="h-full">
          <TechChatbot />
        </div>
      </div>
    </div>
  );
};

export default TechBotModal;
