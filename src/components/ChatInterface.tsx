'use client';

import React, { useState, useEffect } from 'react';
import { InputBar } from './InputBar';
import { ChatMessage, MessageType } from './ChatMessage';

interface ChatInterfaceProps {
  initialMessages?: MessageType[];
}

export function ChatInterface({ initialMessages = [] }: ChatInterfaceProps) {
  const [allMessages, setAllMessages] = useState<MessageType[]>(initialMessages);
  const [visibleMessages, setVisibleMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Only show the two most recent messages
    setVisibleMessages(allMessages.slice(-2));
  }, [allMessages]);

  const handleSubmit = async (message: string) => {
    // Add user message
    const userMessage: MessageType = {
      id: Date.now().toString(),
      content: message,
      isUser: true
    };
    
    const updatedMessages = [...allMessages, userMessage];
    setAllMessages(updatedMessages);
    
    // Show loading state
    setIsLoading(true);
    
    // Simulate AI response after a short delay
    setTimeout(() => {
      setIsLoading(false);
      const aiMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(message),
        isUser: false
      };
      setAllMessages(prevMessages => [...prevMessages, aiMessage]);
    }, 1000);
  };
  
  // Simple function to simulate AI responses
  const generateAIResponse = (userMessage: string): string => {
    // This is just a placeholder - in a real app, you'd call your AI API here
    if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
      return "Hello! How can I help you with your database schema today?";
    }
    
    if (userMessage.toLowerCase().includes('table') || userMessage.toLowerCase().includes('field')) {
      return "Great! What fields would you like to include in this table?";
    }
    
    if (userMessage.toLowerCase().includes('database') || userMessage.toLowerCase().includes('schema')) {
      return "I can help you design a database schema. What kind of data will you be storing?";
    }
    
    if (userMessage.toLowerCase().includes('user') || userMessage.toLowerCase().includes('employee')) {
      return "For a Users table, common fields include: id (primary key), name, email, role, created_at, and last_login. What else would you like to add?";
    }
    
    return "I understand! Let's continue building your database schema. What should we add next?";
  };

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="flex-1 px-4 mb-4 relative">
        {visibleMessages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isLoading && (
          <div className="mt-4 flex justify-start">
            <div className="bg-white rounded-[18px] py-2 px-4 text-sm flex items-center">
              <span className="inline-block h-2 w-2 bg-gray-500 rounded-full animate-pulse mr-1"></span>
              <span className="inline-block h-2 w-2 bg-gray-500 rounded-full animate-pulse delay-150 mr-1"></span>
              <span className="inline-block h-2 w-2 bg-gray-500 rounded-full animate-pulse delay-300"></span>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-auto">
        <InputBar onSubmit={handleSubmit} />
      </div>
    </div>
  );
} 