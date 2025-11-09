// HireMate Backend API Integration
// Add this file to your React app src/api/ directory

const API_BASE_URL = 'http://localhost:5000/api';

// API utility class
class HireMateAPI {
  constructor() {
    this.token = localStorage.getItem('hiremate_token');
  }

  // Set authorization token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('hiremate_token', token);
    } else {
      localStorage.removeItem('hiremate_token');
    }
  }

  // Get authorization headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // Interview session methods
  async createInterviewSession(sessionData) {
    return this.request('/interview/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async getInterviewSession(sessionId) {
    return this.request(`/interview/sessions/${sessionId}`);
  }

  async submitAnswer(sessionId, answerData) {
    return this.request(`/interview/sessions/${sessionId}/answer`, {
      method: 'POST',
      body: JSON.stringify(answerData),
    });
  }

  async completeSession(sessionId) {
    return this.request(`/interview/sessions/${sessionId}/complete`, {
      method: 'POST',
    });
  }

  // AI-powered chatbot method
  async getChatbotResponse(message, context = {}) {
    try {
      // If user has an active session, use that for context
      const sessionData = {
        type: context.type || 'general',
        difficulty: context.difficulty || 'medium',
        jobRole: context.jobRole || 'Software Engineer',
        questionCount: 1
      };

      // Create a session if not exists
      if (!context.sessionId) {
        const session = await this.createInterviewSession(sessionData);
        context.sessionId = session.session.sessionId;
      }

      // Get the session to get the question
      const sessionDetails = await this.getInterviewSession(context.sessionId);
      const currentQuestion = sessionDetails.session.questions.find(q => !q.userAnswer);

      if (currentQuestion) {
        // Submit the user's answer and get AI analysis
        const answerData = {
          sessionId: context.sessionId,
          questionId: currentQuestion._id,
          answer: message,
          timeSpent: 60,
          confidence: 3
        };

        const analysis = await this.submitAnswer(context.sessionId, answerData);
        
        return {
          success: true,
          message: analysis.analysis.feedback,
          score: analysis.analysis.score,
          strengths: analysis.analysis.strengths,
          improvements: analysis.analysis.improvements,
          sessionId: context.sessionId
        };
      } else {
        // No questions left, create a new session
        const newSession = await this.createInterviewSession(sessionData);
        return {
          success: true,
          message: "Let's start a new interview session! " + newSession.session.questions[0]?.question,
          sessionId: newSession.session.sessionId
        };
      }

    } catch (error) {
      console.error('Chatbot response error:', error);
      return {
        success: false,
        message: "I'm having trouble processing your request. Please try again.",
        error: error.message
      };
    }
  }

  // Resume upload method
  async uploadResume(file) {
    const formData = new FormData();
    formData.append('resume', file);

    return this.request('/interview/upload-resume', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        // Don't set Content-Type, let browser set it for FormData
      },
    });
  }

  // Analytics methods
  async getUserAnalytics() {
    return this.request('/users/analytics');
  }

  async getInterviewHistory() {
    return this.request('/users/history');
  }

  // Payment methods
  async getPlans() {
    return this.request('/payments/plans');
  }

  async createPayment(packageType) {
    return this.request('/payments/create-payment', {
      method: 'POST',
      body: JSON.stringify({ packageType }),
    });
  }
}

// Create and export singleton instance
const api = new HireMateAPI();
export default api;

// Export individual methods for convenience
export const {
  register,
  login,
  logout,
  getCurrentUser,
  createInterviewSession,
  getInterviewSession,
  submitAnswer,
  completeSession,
  getChatbotResponse,
  uploadResume,
  getUserAnalytics,
  getInterviewHistory,
  getPlans,
  createPayment,
} = api;
