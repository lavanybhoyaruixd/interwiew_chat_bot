import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ResumeQA = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [conversation, setConversation] = useState([
    { role: 'system', content: 'Welcome! I can help you with general questions. Upload a resume to get resume-specific assistance.' }
  ]);
  const [chatMode, setChatMode] = useState('general'); // 'general' or 'resume'
  const fileInputRef = useRef(null);
  const [resumeUploaded, setResumeUploaded] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a PDF file first');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setIsUploading(true);
    try {
      const response = await fetch('http://localhost:5001/api/resume/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Resume uploaded successfully!');
        setResumeUploaded(true);
        setChatMode('resume'); // Switch to resume mode after upload
        setConversation([{ 
          role: 'system', 
          content: 'Resume has been uploaded. You are now in Resume Mode. I can answer questions about your resume.' 
        }]);
      } else {
        throw new Error(data.message || 'Failed to upload resume');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    // Add user question to conversation
    const userMessage = { role: 'user', content: question };
    setConversation(prev => [...prev, userMessage]);
    setIsAsking(true);
    
    try {
      let response;
      let data;
      
      if (chatMode === 'resume' && resumeUploaded) {
        // Ask resume-specific question
        response = await fetch('http://localhost:5001/api/resume/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question }),
        });
        data = await response.json();
      } else {
        // General question - use the chat endpoint
        response = await fetch('http://localhost:5001/api/chat/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: question,
            history: conversation
              .filter(msg => msg.role !== 'system')
              .map(msg => ({
                role: msg.role,
                content: msg.content
              }))
          }),
        });
        data = await response.json();
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Handle the response based on the endpoint
      if (chatMode === 'resume') {
        // Resume mode response
        if (data.success) {
          setConversation(prev => [...prev, { 
            role: 'assistant', 
            content: data.answer,
            isResume: true
          }]);
        } else {
          throw new Error(data.message || 'Failed to get answer');
        }
      } else {
        // General chat response
        if (data.success) {
          setConversation(prev => [...prev, { 
            role: 'assistant', 
            content: data.response || data.message,
            isResume: false
          }]);
        } else {
          throw new Error(data.error || 'Failed to get response');
        }
      }
    } catch (error) {
      console.error('Error asking question:', error);
      toast.error(`Error: ${error.message}`);
      setConversation(prev => [...prev, { 
        role: 'system', 
        content: `Error: ${error.message}`,
        isError: true
      }]);
    } finally {
      setIsAsking(false);
      setQuestion('');
    }
  };

  // Toggle between chat modes
  const toggleChatMode = () => {
    if (chatMode === 'general') {
      if (!resumeUploaded) {
        toast.info('Please upload a resume first to enable Resume Mode');
        // Trigger file input click
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
        return;
      }
      setChatMode('resume');
      setConversation(prev => [...prev, {
        role: 'system',
        content: 'Switched to Resume Mode. I can now answer questions about your uploaded resume.'
      }]);
    } else {
      setChatMode('general');
      setConversation(prev => [...prev, {
        role: 'system',
        content: 'Switched to General Mode. I can now answer general questions.'
      }]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Chat Assistant</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-600">
            {chatMode === 'general' ? 'General Mode' : 'Resume Mode'}
          </span>
          <button
            onClick={toggleChatMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              chatMode === 'resume' ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                chatMode === 'resume' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* File Upload Section */}
      <div className={`mb-6 p-4 border rounded-lg transition-all duration-200 ${
        chatMode === 'resume' ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">
            {resumeUploaded ? 'Resume Uploaded' : 'Upload Your Resume (PDF)'}
          </h3>
          {resumeUploaded && (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              Ready
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            disabled={isUploading}
          />
          <button
            onClick={handleUpload}
            disabled={!file || isUploading || resumeUploaded}
            className={`px-4 py-2 rounded-md text-white font-medium whitespace-nowrap ${
              (!file || isUploading || resumeUploaded) 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isUploading ? 'Uploading...' : resumeUploaded ? 'Uploaded' : 'Upload'}
          </button>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="mb-6">
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={chatMode === 'resume' 
              ? 'Ask me anything about your resume...' 
              : 'Ask me anything...'}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
            disabled={isAsking || (chatMode === 'resume' && !resumeUploaded)}
          />
          <button
            onClick={handleAskQuestion}
            disabled={isAsking || (chatMode === 'resume' && !resumeUploaded)}
            className={`px-6 py-2 rounded-md text-white font-medium whitespace-nowrap ${
              isAsking || (chatMode === 'resume' && !resumeUploaded)
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isAsking ? 'Thinking...' : 'Send'}
          </button>
        </div>

        {/* Conversation History */}
        <div className="space-y-4 mt-6 max-h-96 overflow-y-auto p-2">
          {conversation.map((msg, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-blue-50 ml-8' 
                  : msg.role === 'assistant' 
                    ? 'bg-gray-50 mr-8' 
                    : 'bg-yellow-50 border-l-4 border-yellow-400'
              } ${msg.isError ? 'border-l-4 border-red-500' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium text-sm text-gray-500">
                  {msg.role === 'user' 
                    ? 'You' 
                    : msg.role === 'assistant' 
                      ? msg.isResume ? 'Resume Assistant' : 'Assistant'
                      : 'System'}
                </div>
                {msg.role === 'assistant' && msg.isResume && (
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                    Resume Mode
                  </span>
                )}
              </div>
              <div className="text-gray-800 whitespace-pre-wrap">
                {msg.content}
                {msg.isError && (
                  <div className="mt-2 text-sm text-red-600">
                    Please try again or switch to General Mode.
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Empty state */}
          {conversation.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Start a conversation by sending a message.</p>
              <p className="text-sm mt-2">
                {chatMode === 'resume' 
                  ? 'In Resume Mode, I can answer questions about your uploaded resume.'
                  : 'In General Mode, I can answer general questions.'}
              </p>
            </div>
          )}
        </div>
        
        {/* Chat mode indicator */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            chatMode === 'resume' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-800'
          }">
            <span className="h-2 w-2 rounded-full mr-2 ${
              chatMode === 'resume' ? 'bg-blue-500' : 'bg-gray-500'
            }"></span>
            {chatMode === 'resume' 
              ? 'Resume Mode: Ask about your uploaded resume' 
              : 'General Mode: Ask me anything'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeQA;
