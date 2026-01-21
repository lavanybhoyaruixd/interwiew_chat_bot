// Smart Chat API with domain-specific interview coaching
// Updated to route all AI calls through the backend so no API keys are exposed in the browser.

import { API_BASE } from './base.js';
import { fetchJson, tokenStorage, authHeaders } from './http.js';

class ChatAPI {
  constructor() {
    this.backendURL = API_BASE;
    this.conversationState = {
      phase: 'initial',
      selectedDomain: null,
      selectedLevel: 'mid',
      conversationHistory: []
    };
  }

  // Streaming version using SSE
  async sendMessageStreaming(message, onChunk, onComplete, onError) {
    try {
      // Track conversation locally
      this.conversationState.conversationHistory.push({
        sender: 'user',
        text: message,
        timestamp: new Date()
      });

      const token = tokenStorage.get();
      let retried = false;
      let fullResponse = '';

      const openSSE = (baseUrl) => {
        const url = new URL(`${baseUrl}/api/chat/stream`);
        url.searchParams.set('question', message);
        if (token) url.searchParams.set('token', token);
        
        // Send conversation history (last 5 messages to avoid URL length issues)
        const recentHistory = this.conversationState.conversationHistory.slice(-5);
        if (recentHistory.length > 0) {
          url.searchParams.set('history', JSON.stringify(recentHistory));
        }

        const es = new EventSource(url.toString());

        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'connected') return;
            if (data.type === 'chunk') {
              fullResponse += data.content;
              onChunk(data.content, fullResponse);
              return;
            }
            if (data.type === 'done') {
              es.close();
              this.conversationState.conversationHistory.push({
                sender: 'bot',
                text: fullResponse,
                timestamp: new Date()
              });
              onComplete(fullResponse);
              return;
            }
            if (data.type === 'error') {
              es.close();
              onError(new Error(data.message || 'Streaming failed'));
            }
          } catch (parseError) {
            console.error('Error parsing SSE data:', parseError);
          }
        };

        es.onerror = () => {
          es.close();
          // Localhost fallback: swap 5001/5000 once
          const isLocal = /localhost|127\.0\.0\.1/.test(baseUrl);
          if (!retried && isLocal) {
            retried = true;
            const alt = baseUrl
              .replace('http://localhost:5001', 'http://localhost:5000')
              .replace('http://127.0.0.1:5001', 'http://127.0.0.1:5000')
              .replace('http://localhost:5000', 'http://localhost:5001')
              .replace('http://127.0.0.1:5000', 'http://127.0.0.1:5001');
            if (alt !== baseUrl) {
              openSSE(alt);
              return;
            }
          }
          onError(new Error('Streaming connection failed'));
        };

        // Timeout after 30 seconds
        setTimeout(() => {
          if (es.readyState !== EventSource.CLOSED) {
            es.close();
            onError(new Error('Request timeout'));
          }
        }, 30000);
      };

      openSSE(this.backendURL);

    } catch (error) {
      console.error('❌ Streaming API error:', error);
      onError(error);
    }
  }

  // Fallback non-streaming version
  async sendMessage(message) {
    try {
      // Track conversation locally for UX features (e.g., quick replies/voice/tts)
      this.conversationState.conversationHistory.push({
        sender: 'user',
        text: message,
        timestamp: new Date()
      });

      // Use backend smart chat endpoint to generate the response (no client-side keys)
      const endpoint = `${this.backendURL}/api/chat/ask`;
      let data;
      try {
        // Send recent conversation history for context
        const recentHistory = this.conversationState.conversationHistory.slice(-10).map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));
        
        data = await fetchJson(endpoint, {
          method: 'POST',
          headers: {
            ...authHeaders()
          },
          body: { 
            question: message,
            history: recentHistory
          }
        });
      } catch (err) {
        // Localhost fallback for 5001/5000
        const isLocal = /http:\/\/(localhost|127\.0\.0\.1):5\d{3}$/.test(this.backendURL);
        if (!isLocal) throw err;

        const altBase = this.backendURL
          .replace('http://localhost:5001', 'http://localhost:5000')
          .replace('http://127.0.0.1:5001', 'http://127.0.0.1:5000')
          .replace('http://localhost:5000', 'http://localhost:5001')
          .replace('http://127.0.0.1:5000', 'http://127.0.0.1:5001');

        if (altBase === this.backendURL) throw err;

        data = await fetchJson(`${altBase}/api/chat/ask`, {
          method: 'POST',
          headers: {
            ...authHeaders()
          },
          body: { question: message }
        });
      }
      const aiResponse = data.response || data.message || 'I had trouble processing that. Please try again.';

      this.conversationState.conversationState;
      this.conversationState.conversationHistory.push({
        sender: 'bot',
        text: aiResponse,
        timestamp: new Date()
      });

      return aiResponse;
    } catch (error) {
      console.error('❌ Chat API (frontend) error:', error);
      return this.getFallbackResponse(message);
    }
  }

  getFallbackResponse(message) {
    const text = (message || '').toLowerCase();

    if (text.includes('hello') || text.includes('hi')) {
      return "Hello! I'm HireMate, your AI interview coach. Ask me anything to get started.";
    }

    if (text.includes('experience') || text.includes('background')) {
      return "When describing your background, be specific, quantify achievements, and link to the role. Want to practice one?";
    }

    if (text.includes('strength') || text.includes('skill')) {
      return "Pick role-relevant strengths, give concrete examples, and show team impact. Which strength should we refine?";
    }

    if (text.includes('weakness') || text.includes('improve')) {
      return "Choose a real weakness, explain your improvement plan, and show progress. Which area do you want to discuss?";
    }

    if (text.includes('question') || text.includes('ask')) {
      return "Try: 'Tell me about yourself', 'Why this job?', 'Greatest achievement?', 'How do you handle stress?'";
    }

    return "I'm here to help you prepare for interviews. Ask a question or say 'start' to begin a practice session.";
  }
}

// Create and export singleton instance
const chatAPI = new ChatAPI();

// Export both streaming and non-streaming functions
export const getChatResponse = (message) => chatAPI.sendMessage(message);
export const getChatResponseStreaming = (message, onChunk, onComplete, onError) => 
  chatAPI.sendMessageStreaming(message, onChunk, onComplete, onError);
export default chatAPI;
