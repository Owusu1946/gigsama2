'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, MessageType } from './ChatMessage';

interface ChatInterfaceProps {
  initialMessages?: MessageType[];
  onSubmit?: (message: string) => void | Promise<void>;
  projectId?: string;
}

export function ChatInterface({ 
  initialMessages = [], 
  onSubmit,
  projectId 
}: ChatInterfaceProps) {
  const [allMessages, setAllMessages] = useState<MessageType[]>(initialMessages);
  const [visibleMessages, setVisibleMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleMessages]);
  
  useEffect(() => {
    // Update all messages when initialMessages changes
    setAllMessages(initialMessages);
  }, [initialMessages]);
  
  useEffect(() => {
    // Only show the two most recent messages
    setVisibleMessages(allMessages.slice(-2));
  }, [allMessages]);

  // Function to add a message - will be called by the parent component
  const addMessage = (message: string) => {
    // If external handler is provided, use it
    if (onSubmit) {
      // Add user message immediately for better UX
      const userMessage: MessageType = {
        id: Date.now().toString(),
        content: message,
        isUser: true
      };
      
      // Update local state for immediate feedback
      setAllMessages(prev => [...prev, userMessage]);
      
      // Show loading state
      setIsLoading(true);
      
      // Call the provided submit handler
      const result = onSubmit(message);
      if (result instanceof Promise) {
        result.finally(() => {
          // Remove loading state
          setIsLoading(false);
        });
      } else {
        // If it's not a Promise, just set loading to false
        setIsLoading(false);
      }
      
      return;
    }
    
    // Default behavior if no external handler is provided (for backward compatibility)
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
    }, 700); // Faster response time for better UX
  };
  
  // Simple function to simulate AI responses (used only when no external handler is provided)
  const generateAIResponse = (userMessage: string): string => {
    // This is just a placeholder - in a real app, you'd call your AI API here
    
    // Instead of showing the schema in the message, show a simple confirmation
    if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
      return "Hello! How can I help you with your database schema today?";
    }
    
    if (userMessage.toLowerCase().includes('table') || userMessage.toLowerCase().includes('field')) {
      return "I understand! I've updated the schema based on your request. What else would you like to add?";
    }
    
    if (userMessage.toLowerCase().includes('database') || userMessage.toLowerCase().includes('schema')) {
      return "I've updated the schema as shown above. Does it look good to you?";
    }
    
    return "I've updated the database schema. Is there anything else you'd like to modify?";
  };

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="flex-1 px-4 relative overflow-y-auto">
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
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

// Make the addMessage function accessible to parent components
export type ChatInterfaceHandle = {
  addMessage: (message: string) => void;
}; 