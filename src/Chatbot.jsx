// src/Chatbot.jsx
// Dark Chatbot component with Orb background + real-time typing effect
import { useState, useRef, useEffect } from 'react';
import MarkdownView from './components/MarkdownView';
import Orb from './components/Orb';
import { getChatResponseStreaming, getChatResponse } from './api/chatAPI';
import { useChat } from './contexts/ChatContext';
import './chatbot.css';

// Safely get the chat context with a fallback
const useSafeChat = () => {
  try {
    return useChat();
  } catch (error) {
    console.error('Error accessing chat context:', error);
    return {
      messages: [{ text: "Hi! I'm HireMate, your interview assistant. What would you like to prepare today?", sender: "bot" }],
      sendMessage: (msg) => console.log('Message not sent - context error:', msg)
    };
  }
};

export default function Chatbot() {
  // Get chat context with safe fallback
  const { messages: contextMessages, sendMessage } = useSafeChat();
  
  // Local state for UI
  const [localMessages, setLocalMessages] = useState([
    { text: "Hi! I'm HireMate, your interview assistant. What would you like to prepare today?", sender: "bot" },
  ]);
  // Safe local setMessages fallback (context does not expose setMessages)
  const setMessages = (updater) => {
    setLocalMessages(prev => (typeof updater === 'function' ? updater(prev) : updater));
  };
  
  // Use context messages if available, otherwise fall back to local state
  const messages = Array.isArray(contextMessages) && contextMessages.length > 0 
    ? contextMessages 
    : localMessages;
  // State for input field
  const [input, setInput] = useState("");
  // State for user credits (e.g., 5 free questions)
  const [credits, setCredits] = useState(100);
  // Example options for user to select
  const [options] = useState([
    "Tell me about yourself",
    "What are your strengths?",
    "Why should we hire you?",
    "Describe a challenge you faced"
  ]);
  // Removed resume upload UI and context from Chatbot
  // Typing indicator / lock while sending
  const [isTyping, setIsTyping] = useState(false);
  // State for speech recognition
  // const [listening] = useState(false); // removed unused state
  // const recognitionRef = useRef(null); // disabled

  // Ref for chat messages container
  const messagesEndRef = useRef(null);

  // Render markdown using reusable component
  const renderBotMarkdown = (text) => {
    if (!text || typeof text !== 'string') return null;
    return <MarkdownView>{text}</MarkdownView>;
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Real-time typing helper: progressively updates the last bot message
  // Removed legacy typeOut animation (streaming covers typing effect)

  // Handles sending a message with real-time streaming
  const handleSend = async (customInput) => {
    const value = typeof customInput === 'string' ? customInput : input;
    if (!value.trim() || credits <= 0 || isTyping) return;

    const userMsg = { role: 'user', content: value };
    
    // Use context's sendMessage if available, otherwise use local state
    if (typeof sendMessage === 'function') {
      sendMessage(userMsg);
    } else {
      setLocalMessages(prev => [...prev, { text: value, sender: 'user' }]);
    }
    
    setInput("");
    setCredits(c => c - 1);
    setIsTyping(true);

    // Add placeholder bot message
    if (typeof sendMessage === 'function') {
      sendMessage({ role: 'assistant', content: '' });
    } else {
      setLocalMessages(prev => [...prev, { text: '', sender: 'bot' }]);
    }

    try {
      // Use streaming response for real-time effect
      getChatResponseStreaming(
        value,
        // onChunk: update the last bot message with new content
        (chunk, fullResponse) => {
          const updateLastMessage = (prev) => {
            const lastIdx = prev.length - 1;
            if (lastIdx < 0) return prev;
            
            const updated = [...prev];
            updated[lastIdx] = { 
              ...updated[lastIdx], 
              text: fullResponse || chunk,
              sender: 'bot' 
            };
            return updated;
          };
          
          if (typeof sendMessage === 'function') {
            setMessages(prev => updateLastMessage(prev));
          } else {
            setLocalMessages(prev => updateLastMessage(prev));
          }
        },
        // onComplete: streaming finished
        () => setIsTyping(false),
        // onError: handle streaming errors -> fallback to non-streaming
        async (error) => {
          console.error('Streaming error:', error);
          try {
            const fallback = await getChatResponse(value, undefined);
            const updateMessage = (prev) => {
              const lastIdx = prev.length - 1;
              if (lastIdx < 0) return prev;
              
              const updated = [...prev];
              updated[lastIdx] = { 
                ...updated[lastIdx],
                text: fallback,
                sender: 'bot' 
              };
              return updated;
            };
            
            if (typeof sendMessage === 'function') {
              setMessages(prev => updateMessage(prev));
            } else {
              setLocalMessages(prev => updateMessage(prev));
            }
          } catch (err) {
            console.error('Fallback error:', err);
            const errorMessage = { 
              role: 'assistant', 
              content: "Error connecting to AI service. Please try again." 
            };
            
            if (typeof sendMessage === 'function') {
              sendMessage(errorMessage);
            } else {
              setLocalMessages(prev => [...prev, { 
                text: errorMessage.content, 
                sender: 'bot' 
              }]);
            }
          } finally {
            setIsTyping(false);
          }
        },
        undefined
      );
    } catch (error) {
      console.error('Chat error:', error);
      try {
        const fallback = await getChatResponse(value, undefined);
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { text: fallback, sender: 'bot' };
          return copy;
        });
      } catch {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { 
            text: "Error connecting to AI service. Please try again.", 
            sender: 'bot' 
          };
          return copy;
        });
      } finally {
        setIsTyping(false);
      }
    }
  };

  // Removed resume upload handlers (moved to Resume Analyzer page)

  // Handle SpeechRecognition
  // Speech recognition temporarily disabled to reduce unused code warnings

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

        {/* Resume upload removed from Chatbot. Use Resume Analyzer page instead. */}

        {/* Messages area */}
        <div className="chat-messages-dark">
          {messages.map((msg, idx) => {
            // Ensure we have a valid sender class (default to 'user' if undefined)
            const sender = msg.role === 'assistant' ? 'bot' : msg.sender || 'user';
            return (
              <div key={idx} className={`msg-dark ${sender}`}>
                {sender === 'bot' ? renderBotMarkdown(msg.text || msg.content || '') : (msg.text || msg.content || '')}
                {/* Speaker icon for bot messages */}
                {sender === 'bot' && (
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
            );
          })}

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

        {/* Upload status removed */}

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
