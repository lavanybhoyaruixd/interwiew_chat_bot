// Smart Chat API with domain-specific interview coaching
// Updated to route all AI calls through the backend so no API keys are exposed in the browser.

class ChatAPI {
  constructor() {
    // Read backend base URL from Vite env if provided, fallback to local dev API
    this.backendURL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
      ? import.meta.env.VITE_API_BASE_URL
      : 'http://localhost:5000/api';

    this.conversationState = {
      phase: 'initial', // 'initial', 'domain-selection', 'level-selection', 'interview'
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

      const token = localStorage.getItem('hiremate_token');
      const url = new URL(`${this.backendURL}/chat/stream`);
      url.searchParams.set('question', message);
      if (token) {
        url.searchParams.set('token', token);
      }

      const eventSource = new EventSource(url.toString());
      let fullResponse = '';

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'connected') {
            // Connection established
            return;
          } else if (data.type === 'chunk') {
            fullResponse += data.content;
            onChunk(data.content, fullResponse);
          } else if (data.type === 'done') {
            // Stream completed
            eventSource.close();
            this.conversationState.conversationHistory.push({
              sender: 'bot',
              text: fullResponse,
              timestamp: new Date()
            });
            onComplete(fullResponse);
          } else if (data.type === 'error') {
            eventSource.close();
            onError(new Error(data.message || 'Streaming failed'));
          }
        } catch (parseError) {
          console.error('Error parsing SSE data:', parseError);
        }
      };

      eventSource.onerror = (error) => {
        eventSource.close();
        onError(error);
      };

      // Timeout after 30 seconds
      setTimeout(() => {
        if (eventSource.readyState !== EventSource.CLOSED) {
          eventSource.close();
          onError(new Error('Request timeout'));
        }
      }, 30000);

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
      const res = await fetch(`${this.backendURL}/chat/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // If you later add auth, include Authorization header from localStorage token here
          ...(localStorage.getItem('hiremate_token')
            ? { Authorization: `Bearer ${localStorage.getItem('hiremate_token')}` }
            : {})
        },
        body: JSON.stringify({ question: message })
      });

      if (!res.ok) {
        throw new Error(`Backend error: ${res.status}`);
      }

      const data = await res.json();
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
