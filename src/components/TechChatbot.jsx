/* eslint-env browser */
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import groqAPI from '../api/groqAPI';

const TechChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your Tech Interview Assistant. How can I help you prepare today?",
      sender: 'bot',
      timestamp: new Date().toISOString(),
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;

    const userMessage = {
      id: messages.length + 1,
      text: userText,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const apiMessages = [
        {
          role: 'system',
          content: `
You are a Tech Interview Assistant.

FORMAT RULES:
- Use ### for headings
- Use - for bullet points
- Use **bold** sparingly
- No duplicated symbols
- Clean, human-readable output
- No emojis
          `,
        },
        ...messages.map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        })),
        { role: 'user', content: userText },
      ];

      const result = await groqAPI.chat(apiMessages);

      const rawText =
        result?.response ||
        result?.explanation ||
        result?.help ||
        "Sorry, I couldn't generate a response.";

      const botMessage = {
        id: messages.length + 2,
        text: cleanResponse(rawText),
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to get response from AI');
      setMessages((prev) => [
        ...prev,
        {
          id: messages.length + 2,
          text: "I'm having trouble right now. Please try again.",
          sender: 'bot',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  function cleanResponse(text) {
    let t = String(text || '');
    t = t.replace(/\r|\t/g, ' ')
         .replace(/ +/g, ' ')
         .replace(/\n{3,}/g, '\n\n')
         .replace(/\b(\w+)(\s+\1\b)+/gi, '$1')
         .replace(/^\s*#{1,6}\s+/gm, '### ')
         .replace(/^\s*[•*+]\s+/gm, '- ')
         .replace(/\*{3,}/g, '**')
         .replace(/(\*\*)\s*(\*\*)+/g, '**');
    return t.trim();
  }

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">

      {/* Header */}
      <div className="bg-indigo-600 text-white p-4">
        <h2 className="text-xl font-semibold">Tech Interview Assistant</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
                  message.sender === 'user'
                    ? 'bg-gray-700 rounded-br-none'
                    : 'bg-white border rounded-bl-none'
                }`}
              >
                {/* Message text */}
                {message.sender === 'user' ? (
                  <p className="text-white">{message.text}</p>
                ) : (
                  <div className="prose prose-sm max-w-none text-gray-800">
                    <ReactMarkdown skipHtml>{message.text}</ReactMarkdown>
                  </div>
                )}

                {/* Timestamp */}
                <div className="text-xs mt-1 opacity-60">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="text-sm text-gray-400 italic">AI is typing...</div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t p-4 bg-white">
        <div className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a tech interview question..."
            className="
              flex-1 px-4 py-2
              border border-gray-300
              rounded-full
              bg-white
              text-gray-900
              placeholder-gray-400
              focus:outline-none
              focus:ring-2
              focus:ring-indigo-500
            "
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="
              px-6 py-2
              bg-indigo-600
              text-white
              font-medium
              rounded-full
              hover:bg-indigo-700
              disabled:bg-gray-300
              disabled:text-gray-500
              disabled:cursor-not-allowed
              transition
            "
          >
            Send
          </button>
        </div>
      </form>

    </div>
  );
};

export default TechChatbot;





// 3rd


// /* eslint-env browser */
// import React, { useState, useRef, useEffect } from 'react';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import groqAPI from '../api/groqAPI';

// const TechChatbot = () => {
//   const [messages, setMessages] = useState([
//     {
//       id: 1,
//       text: "Hello! I'm your Tech Interview Assistant. How can I help you prepare today?",
//       sender: 'bot',
//       timestamp: new Date().toISOString()
//     }
//   ]);
//   const [input, setInput] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const messagesEndRef = useRef(null);

//   // Auto-scroll
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // Send message (NON-STREAMING)
//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!input.trim()) return;

//     const userMessage = {
//       id: messages.length + 1,
//       text: input,
//       sender: 'user',
//       timestamp: new Date().toISOString()
//     };

//     setMessages(prev => [...prev, userMessage]);
//     setInput('');
//     setIsTyping(true);

//     try {
//       const apiMessages = [
//         {
//           role: 'system',
//           content: `
// You are a Tech Interview Assistant.

// FORMAT RULES (STRICT):
// - Use ### for headings only
// - Use - for bullet points only
// - Use **bold** sparingly
// - Never repeat words or symbols
// - Do NOT include broken markdown
// - Output must be human-readable and interview-ready

// STYLE:
// - Clear
// - Concise
// - Professional
// - No emojis
//           `
//         },
//         ...messages.map(m => ({
//           role: m.sender === 'user' ? 'user' : 'assistant',
//           content: m.text
//         })),
//         { role: 'user', content: input }
//       ];

//       const result = await groqAPI.chat(apiMessages);

//       const rawText =
//         result?.choices?.[0]?.message?.content ||
//         "Sorry, I couldn't generate a response.";

//       const cleanText = cleanResponse(rawText);

//       const botMessage = {
//         id: messages.length + 2,
//         text: cleanText,
//         sender: 'bot',
//         timestamp: new Date().toISOString()
//       };

//       setMessages(prev => [...prev, botMessage]);
//       setIsTyping(false);
//     } catch (error) {
//       console.error('Groq API error:', error);
//       setIsTyping(false);
//       toast.error('Failed to get response from AI');
//       setMessages(prev => [
//         ...prev,
//         {
//           id: messages.length + 2,
//           text: "I'm having trouble right now. Please try again.",
//           sender: 'bot',
//           timestamp: new Date().toISOString()
//         }
//       ]);
//     }
//   };

//   // Clean & normalize AI output
//   function cleanResponse(text) {
//     let t = String(text || '');

//     // Normalize whitespace
//     t = t.replace(/\r|\t/g, ' ')
//          .replace(/ +/g, ' ')
//          .replace(/\n{3,}/g, '\n\n');

//     // Remove repeated words
//     t = t.replace(/\b(\w+)(\s+\1\b)+/gi, '$1');

//     // Normalize markdown headings
//     t = t.replace(/^\s*#{1,6}\s+/gm, '### ');

//     // Normalize bullet points
//     t = t.replace(/^\s*[•*+]\s+/gm, '- ');

//     // Remove duplicated markdown symbols
//     t = t.replace(/\*{3,}/g, '**')
//          .replace(/(\*\*)\s*(\*\*)+/g, '**');

//     return t.trim();
//   }

//   const formatTime = (timestamp) =>
//     new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

//   return (
//     <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">

//       {/* Header */}
//       <div className="bg-indigo-600 text-white p-4">
//         <h2 className="text-xl font-semibold">Tech Interview Assistant</h2>
//       </div>

//       {/* Messages */}
//       <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
//         <div className="space-y-4">
//           {messages.map((message) => (
//             <div
//               key={message.id}
//               className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
//             >
//               <div
//                 className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
//                   message.sender === 'user'
//                     ? 'bg-indigo-600 text-white rounded-br-none'
//                     : 'bg-white border text-gray-800 rounded-bl-none'
//                 }`}
//               >
//                 <div className="whitespace-pre-line">{message.text}</div>
//                 <div className="text-xs mt-1 text-gray-500">
//                   {formatTime(message.timestamp)}
//                 </div>
//               </div>
//             </div>
//           ))}

//           {isTyping && (
//             <div className="text-sm text-gray-400 italic">AI is typing...</div>
//           )}

//           <div ref={messagesEndRef} />
//         </div>
//       </div>

//       {/* Input */}
//       <form onSubmit={handleSendMessage} className="border-t p-4 bg-white">
//         <div className="flex space-x-3">
//           <input
//             type="text"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             placeholder="Ask a tech interview question..."
//             className="flex-1 px-4 py-2 border rounded-full focus:ring-2 focus:ring-indigo-500"
//           />
//           <button
//             type="submit"
//             disabled={!input.trim()}
//             className="px-6 py-2 bg-indigo-600 text-white rounded-full disabled:opacity-50"
//           >
//             Send
//           </button>
//         </div>
//       </form>

//     </div>
//   );
// };

// export default TechChatbot;






// console.log("GROQ KEY:", import.meta.env.VITE_GROQ_API_KEY);
// console.log("ENV TEST:", import.meta.env);

// import React, { useState, useRef, useEffect } from 'react';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import groqAPI from '../api/groqAPI';

// const TechChatbot = () => {
//   const [messages, setMessages] = useState([
//     {
//       id: 1,
//       text: 'Hello! I\'m your Tech Interview Assistant . How can I help you with your tech interview preparation today?',
//       sender: 'bot',
//       timestamp: new Date().toISOString()
//     }
//   ]);
//   const [input, setInput] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const messagesEndRef = useRef(null);

//   // Auto-scroll to bottom of chat
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // Handle sending a message
//   const handleSendMessage = async (e) => {
//     e.preventDefault();
    
//     if (!input.trim()) return;
    
//     // Add user message
//     const userMessage = {
//       id: messages.length + 1,
//       text: input,
//       sender: 'user',
//       timestamp: new Date().toISOString()
//     };
    
//     setMessages(prev => [...prev, userMessage]);
//     setInput('');
//     setIsTyping(true);
    
//     try {
//       // Add a temporary bot message for the loading state
//       const botMessageId = messages.length + 2;
//       setMessages(prev => [
//         ...prev,
//         {
//           id: botMessageId,
//           text: '',
//           sender: 'bot',
//           timestamp: new Date().toISOString()
//         }
//       ]);

//       // Prepare messages for the API
//       const apiMessages = [
//         ...messages.map(msg => ({
//           role: msg.sender === 'user' ? 'user' : 'assistant',
//           content: msg.text
//         })),
//         { role: 'user', content: input }
//       ];

//       // Call Groq API
//       await groqAPI.streamChat(
//         apiMessages,
//         // onChunk
//         (data) => {
//           setMessages(prev => {
//             const newMessages = [...prev];
//             const botMessage = newMessages.find(msg => msg.id === botMessageId);
//             if (botMessage) {
//               botMessage.text = (botMessage.text || '') + (data.choices?.[0]?.delta?.content || '');
//             }
//             return [...newMessages];
//           });
//         },
//         // onComplete
//         () => {
//           // Cleanup: collapse repeated words/punctuation and tidy markdown
//           setMessages(prev => {
//             const newMessages = [...prev];
//             const botMessage = newMessages.find(msg => msg.id === botMessageId);
//             if (botMessage && botMessage.text) {
//               botMessage.text = cleanResponse(botMessage.text);
//             }
//             return newMessages;
//           });
//           setIsTyping(false);
//         },
//         // onError
//         (error) => {
//           console.error('Error in Groq API:', error);
//           setMessages(prev => [
//             ...prev.filter(msg => msg.id !== botMessageId),
//             {
//               id: botMessageId,
//               text: "I'm sorry, I encountered an error. Please try again later.",
//               sender: 'bot',
//               timestamp: new Date().toISOString()
//             }
//           ]);
//           setIsTyping(false);
//           toast.error('Failed to get response from Groq API');
//         }
//       );

//     } catch (error) {
//       console.error('Error sending message:', error);
//       setMessages(prev => [
//         ...prev,
//         {
//           id: messages.length + 2,
//           text: "I'm having trouble connecting to the server. Please check your connection and try again.",
//           sender: 'bot',
//           timestamp: new Date().toISOString()
//         }
//       ]);
//       setIsTyping(false);
//       toast.error('Connection error. Please check your network and try again.');
//     }
//   };

//   // Collapse consecutive duplicated words, punctuation, and tidy markdown
//   function cleanResponse(text) {
//     let t = String(text);
//     // Normalize whitespace
//     t = t.replace(/[\t\r]+/g, ' ').replace(/ +/g, ' ').replace(/\s*\n\s*/g, '\n');
//     // Deduplicate immediate repeated words (case-insensitive)
//     t = t.replace(/\b([A-Za-z0-9]+)(\s+\1\b)+/gi, '$1');
//     // Deduplicate punctuation sequences
//     t = t.replace(/([.!?,;:])(\s*\1)+/g, '$1');
//     // Fix repeated headings words (e.g., "Java Java")
//     t = t.replace(/(^|\n)\s*(#+\s+)([A-Za-z0-9]+)(\s+\3\b)/g, (m, pre, hashes, w) => `${pre}${hashes}${w}`);
//     // Trim excessive blank lines
//     t = t.replace(/\n{3,}/g, '\n\n');
//     // Normalize list bullets
//     t = t.replace(/\n\s*[-*•]\s*[-*•]\s*/g, '\n- ');
//     return t.trim();
//   }

//   // Format timestamp
//   const formatTime = (timestamp) => {
//     return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   return (
//     <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
//       {/* Chat header */}
//       <div className="bg-indigo-600 text-white p-4">
//         <h2 className="text-xl font-semibold">Tech Interview Assistant</h2>
//       </div>
      
//       {/* Messages container */}
//       <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
//         <div className="space-y-4">
//           {messages.map((message) => (
//             <div 
//               key={message.id} 
//               className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
//             >
//               <div 
//                 className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-2xl rounded-lg px-4 py-2 ${
//                   message.sender === 'user' 
//                     ? 'bg-indigo-600 text-white rounded-br-none' 
//                     : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
//                 }`}
//               >
//                 <div className="whitespace-pre-line">{message.text}</div>
//                 <div className={`text-xs mt-1 ${
//                   message.sender === 'user' ? 'text-indigo-200' : 'text-gray-500'
//                 }`}>
//                   {formatTime(message.timestamp)}
//                 </div>
//               </div>
//             </div>
//           ))}
          
//           {isTyping && (
//             <div className="flex items-center space-x-2">
//               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
//               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
//               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
//             </div>
//           )}
          
//           <div ref={messagesEndRef} />
//         </div>
//       </div>
      
//       {/* Input area */}
// <form
//   onSubmit={handleSendMessage}
//   className="border-t border-gray-200 p-4 bg-white"
// >
//   <div className="flex space-x-3">
//     {/* Input */}
//     <input
//       type="text"
//       value={input}
//       onChange={(e) => setInput(e.target.value)}
//       placeholder="Ask me anything about tech interviews..."
//       className="
//         flex-1 px-4 py-2
//         border border-gray-300 rounded-full
//         bg-white text-black placeholder-gray-500
//         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
//       "
//     />

//     {/* Send Button */}
//     <button
//       type="submit"
//       disabled={!input.trim()}
//       className="
//         px-6 py-2 rounded-full
//         bg-indigo-600 text-white font-medium
//         hover:bg-indigo-700
//         disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed
//         focus:outline-none focus:ring-2 focus:ring-indigo-500
//         transition">
//       Send
//     </button>
//   </div>

//   {/* Helper text */}
//   <p className="text-xs text-gray-500 mt-2 text-center">
//     Try asking: “What are some common data structures?” or
//     “How should I prepare for a technical interview?”
//   </p>
// </form>
//     </div>
//   );
// };

// export default TechChatbot;

