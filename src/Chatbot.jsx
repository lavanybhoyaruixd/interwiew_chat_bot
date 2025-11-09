// src/Chatbot.jsx
// Dark Chatbot component with Orb background + real-time typing effect
import { useState, useRef, useEffect } from 'react';
import Orb from './components/Orb';
import { getChatResponse, getChatResponseStreaming } from './api/chatAPI';
import './chatbot.css';

export default function Chatbot() {
  // State for storing chat messages
  const [messages, setMessages] = useState([
    { text: "Hi! I'm HireMate, your interview assistant. What would you like to prepare today?", sender: "bot" },
  ]);
  // State for input field
  const [input, setInput] = useState("");
  // State for user credits (e.g., 5 free questions)
  const [credits, setCredits] = useState(100);
  // Example options for user to select
  const [options, setOptions] = useState([
    "Tell me about yourself",
    "What are your strengths?",
    "Why should we hire you?",
    "Describe a challenge you faced"
  ]);
  // State for upload progress and error
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  // Typing indicator / lock while sending
  const [isTyping, setIsTyping] = useState(false);
  // State for speech recognition
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // Ref for chat messages container
  const messagesEndRef = useRef(null);

  // Simple text formatter function
  const formatBotText = (text) => {
    if (!text || typeof text !== 'string') return text;
    // Convert * bullets to • bullets
    return text.replace(/^\* /gm, '• ');
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Real-time typing helper: progressively updates the last bot message
  const typeOut = async (fullText, appendDelay = 12) => {
    return new Promise((resolve) => {
      let i = 0;
      setMessages((prev) => [...prev, { text: '', sender: 'bot' }]);
      const indexOfBot = messages.length + 1; // after pushing user msg and placeholder

      const tick = () => {
        i = Math.min(i + Math.max(1, Math.floor(fullText.length / 200)), fullText.length);
        const next = fullText.slice(0, i);
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { text: next, sender: 'bot' };
          return copy;
        });
        if (i < fullText.length) {
          setTimeout(tick, appendDelay);
        } else {
          resolve();
        }
      };
      tick();
    });
  };

  // Handles sending a message with real-time streaming
  const handleSend = async (customInput) => {
    const value = typeof customInput === 'string' ? customInput : input;
    if (!value.trim() || credits <= 0 || isTyping) return;

    const userMsg = { text: value, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setCredits((c) => c - 1); // Decrement credits
    setIsTyping(true);

    // Add placeholder bot message that will be updated in real-time
    setMessages((prev) => [...prev, { text: '', sender: 'bot' }]);

    try {
      // Use streaming response for real-time effect
      getChatResponseStreaming(
        value,
        // onChunk: update the last bot message with new content
        (chunk, fullResponse) => {
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { text: fullResponse, sender: 'bot' };
            return copy;
          });
        },
        // onComplete: streaming finished
        (fullResponse) => {
          setIsTyping(false);
        },
        // onError: handle streaming errors
        (error) => {
          console.error('Streaming error:', error);
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { 
              text: "Error connecting to AI service. Please try again.", 
              sender: 'bot' 
            };
            return copy;
          });
          setIsTyping(false);
        }
      );
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { 
          text: "Error connecting to AI service. Please try again.", 
          sender: 'bot' 
        };
        return copy;
      });
      setIsTyping(false);
    }
  };

  // Handle SpeechRecognition
  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setListening(false);
      };
      recognitionRef.current.onerror = () => {
        setListening(false);
      };
      recognitionRef.current.onend = () => {
        setListening(false);
      };
    }
    setListening(true);
    recognitionRef.current.start();
  };

  // Handle Text-to-Speech for bot messages
  const speak = (text) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    // Main chat container with dark theme and Orb background
    <div className="chat-container-dark">
      {/* Orb Background */}
      <div className="orb-background">
        <Orb
          hoverIntensity={1.0}
          rotateOnHover={true}
          hue={0}
          forceHoverState={false}
        />
      </div>
      
      {/* Chat content overlay */}
      <div className="chat-content">
        {/* Header */}
        <div className="chat-header-dark">
          <h1 className="chat-title-dark">HireMate</h1>
          <div className="chat-credits-dark">
            Credits: <span className="credits-count">{credits}</span>
          </div>
        </div>

        {/* Messages area */}
        <div className="chat-messages-dark">
          {messages.map((msg, idx) => (
            <div key={idx} className={`msg-dark ${msg.sender}`}>
              {msg.sender === 'bot' ? formatBotText(msg.text) : msg.text}
              {/* Speaker icon for bot messages */}
              {msg.sender === 'bot' && (
                <button
                  className="speak-button-dark"
                  aria-label="Speak message"
                  onClick={() => speak(msg.text)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75v-13.5m0 0l-3.75 3.75m3.75-3.75l3.75 3.75" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0 3.59-2.91 6.5-6.5 6.5S6.5 15.59 6.5 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        <div className="chat-options-dark">
          {options.map((opt, idx) => (
            <button
              key={idx}
              className="option-button-dark"
              onClick={() => handleSend(opt)}
              disabled={credits <= 0}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Input and send button */}
        <div className="chat-input-area">
          <input 
            id="user-input" 
            placeholder={credits > 0 ? (isTyping ? "AI is responding..." : "Type your interview question...") : "Out of credits!"}
            className="chat-input-dark"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={credits <= 0 || isTyping}
          />
          <button 
            onClick={() => handleSend()} 
            className="chat-button-dark"
            disabled={credits <= 0 || isTyping}
          >
            {isTyping ? 'Thinking…' : 'Send'}
          </button>
        </div>

        {/* Upload progress or error */}
        {(uploading || uploadError) && (
          <div className="chat-status-dark">
            {uploading && <span className="uploading-text">Uploading resume...</span>}
            {uploadError && <span className="error-text">{uploadError}</span>}
          </div>
        )}

        {/* Payment/Upgrade prompt if out of credits */}
        {credits <= 0 && (
          <div className="credits-warning-dark">
            You have used all your free credits.<br />
            <span className="upgrade-text">Please upgrade to continue.</span>
          </div>
        )}
      </div>
    </div>
  );
}
