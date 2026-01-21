import { API_BASE } from './base';
import { fetchJson, authHeaders } from './http.js';

class GroqAPI {
  constructor() {
    this.baseURL = API_BASE;
  }

  /* =========================================================
     NON-STREAMING CHAT (RECOMMENDED FOR INTERVIEW ANSWERS)
     ========================================================= */
  async chat(messages) {
    try {
      // Expected backend response:
      // { success: true, response: "AI text" }
      return await fetchJson(`${this.baseURL}/api/chat/message`, {
        method: 'POST',
        headers: {
          ...authHeaders()
        },
        body: {
          // last user message
          message: messages[messages.length - 1].content,
          // previous conversation as history
          history: messages.slice(0, -1)
        }
      });
    } catch (error) {
      console.error('Error in GroqAPI.chat:', error);
      throw error;
    }
  }

  /* =========================================================
     STREAMING CHAT (OPTIONAL – DO NOT USE FOR MARKDOWN)
     ========================================================= */
  async streamChat(messages, onChunk, onComplete, onError) {
    try {
      const response = await fetch(`${this.baseURL}/api/groq/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify({ messages })
      });

      if (!response.ok) {
        throw new Error(`Stream API failed with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (onComplete) onComplete();
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        let boundary;
        while ((boundary = buffer.indexOf('\n\n')) !== -1) {
          const packet = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);

          if (!packet.startsWith('data: ')) continue;
          const payload = packet.slice(6).trim();

          if (payload === '[DONE]' || payload === 'DONE') {
            if (onComplete) onComplete();
            return;
          }

          try {
            const data = JSON.parse(payload);
            if (data?.type === 'done') {
              if (onComplete) onComplete();
              return;
            }
            if (onChunk) onChunk(data);
          } catch {
            // ignore partial / malformed SSE chunks
          }
        }
      }
    } catch (error) {
      console.error('Error in GroqAPI.streamChat:', error);
      if (onError) onError(error);
    }
  }

  /* =========================================================
     RESUME + JOB ROLE → INTERVIEW QUESTIONS
     ========================================================= */
  async generateQuestions({ resume, jobRole }) {
    const formData = new FormData();

    if (resume) {
      if (resume instanceof File) {
        formData.append('resume', resume);
      } else if (typeof resume === 'string') {
        formData.append('resume', resume);
      }
    }

    if (jobRole) {
      formData.append('jobRole', jobRole);
    }

    const headers = {
      ...authHeaders()
    };

    const response = await fetch(`${this.baseURL}/api/groq/questions`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to generate questions' }));
      throw new Error(errorData.message);
    }

    return await response.json();
  }
}

export default new GroqAPI();


// import { API_BASE } from './base';

// class GroqAPI {
//   constructor() {
//     this.baseURL = API_BASE;
//   }

//   async streamChat(messages, onChunk, onComplete, onError) {
//     try {
//       const token = localStorage.getItem('hiremate_token');
//       const response = await fetch(`${this.baseURL}/groq/stream`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({ messages })
//       });

//       if (!response.ok) {
//         throw new Error(`API request failed with status ${response.status}`);
//       }

//       const reader = response.body.getReader();
//       const decoder = new TextDecoder();
//       let buffer = '';

//       let lastDelta = '';
//       while (true) {
//         const { done, value } = await reader.read();
//         if (done) {
//           if (onComplete) onComplete();
//           break;
//         }

//         const chunk = decoder.decode(value, { stream: true });
//         buffer += chunk;

//         let boundary;
//         while ((boundary = buffer.indexOf('\n\n')) !== -1) {
//           const completeMessage = buffer.slice(0, boundary);
//           buffer = buffer.slice(boundary + 2);

//           if (!completeMessage.startsWith('data: ')) continue;
//           const payload = completeMessage.slice(6).trim();

//             // Handle non-JSON sentinel gracefully
//           if (payload === '[DONE]' || payload === 'DONE') {
//             if (onComplete) onComplete();
//             return; // finish stream
//           }
//           try {
//             const data = JSON.parse(payload);
//             if (data?.type === 'done') {
//               if (onComplete) onComplete();
//               return;
//             }
//             // Skip duplicate delta content
//             const currentDelta = data?.choices?.[0]?.delta?.content;
//             if (currentDelta && currentDelta === lastDelta) {
//               continue;
//             }
//             lastDelta = currentDelta || lastDelta;
//             if (onChunk) onChunk(data);
//           } catch (e) {
//             // Non-JSON / partial payload: ignore silently unless debugging
//             // console.debug('Non-JSON SSE fragment ignored:', payload);
//           }
//         }
//       }
//     } catch (error) {
//       console.error('Error in Groq API stream:', error);
//       if (onError) onError(error);
//     }
//   }
//   // Resume + jobRole → AI questions
//   async generateQuestions({ resume, jobRole }) {
//     const formData = new FormData();
//     if (resume) {
//       // If resume is a File object, append it directly
//       if (resume instanceof File) {
//         formData.append('resume', resume);
//       } else if (typeof resume === 'string') {
//         // If resume is text, we'll let the backend handle it via body
//         formData.append('resume', resume);
//       }
//     }
//     if (jobRole) {
//       formData.append('jobRole', jobRole);
//     }

//     const token = localStorage.getItem('hiremate_token');
//     const headers = {};
//     if (token) {
//       headers['Authorization'] = `Bearer ${token}`;
//     }
//     // Don't set Content-Type for FormData, browser will set it with boundary

//     const response = await fetch(`${this.baseURL}/groq/questions`, {
//       method: 'POST',
//       headers,
//       body: formData
//     });
    
//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({ message: 'Failed to generate questions' }));
//       throw new Error(errorData.message || 'Failed to generate questions');
//     }
    
//     return await response.json();
//   }
// }

// export default new GroqAPI();
