import { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState(null);

  const sendMessage = async (message) => {
    if (message.role === 'assistant' && message.isResumeAnalysis) {
      setResumeAnalysis(message.analysisData);
    }
    
    // Add the message to the chat
    setMessages(prev => [...prev, message]);
    
    // If it's a user message, you can process it here
    if (message.role === 'user') {
      setIsLoading(true);
      try {
        // Here you would typically call your chat API
        // For now, we'll just echo the message back
        setTimeout(() => {
          setMessages(prev => [
            ...prev, 
            {
              role: 'assistant',
              content: `I received your message: "${message.content}"`
            }
          ]);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error sending message:', error);
        setIsLoading(false);
      }
    }
  };

  return (
    <ChatContext.Provider value={{ 
      messages, 
      sendMessage, 
      isLoading, 
      resumeAnalysis 
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
