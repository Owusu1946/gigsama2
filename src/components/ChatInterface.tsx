'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, MessageType } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';

interface ChatInterfaceProps {
  initialMessages?: MessageType[];
  onSubmit?: (message: string) => void | Promise<void>;
  projectId?: string;
  isLoading?: boolean; // Add prop for external loading state
  showThinking?: boolean; // Add prop for external thinking indicator state
}

export function ChatInterface({ 
  initialMessages = [], 
  onSubmit,
  projectId,
  isLoading: externalIsLoading,
  showThinking: externalShowThinking 
}: ChatInterfaceProps) {
  const [allMessages, setAllMessages] = useState<MessageType[]>(initialMessages);
  const [visibleMessages, setVisibleMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Scroll to bottom whenever messages change or typing status changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleMessages, isTyping]);
  
  useEffect(() => {
    // Update all messages when initialMessages changes
    setAllMessages(initialMessages);
  }, [initialMessages]);
  
  useEffect(() => {
    // Only show the two most recent messages
    setVisibleMessages(allMessages.slice(-2));
  }, [allMessages]);

  // Add effect to log loading and typing states
  useEffect(() => {
    console.log('ChatInterface internal loading state changed:', isLoading);
  }, [isLoading]);

  useEffect(() => {
    console.log('ChatInterface typing state changed:', isTyping);
  }, [isTyping]);

  // Monitor external loading and thinking states
  useEffect(() => {
    if (externalIsLoading !== undefined) {
      console.log('External loading state changed:', externalIsLoading);
    }
  }, [externalIsLoading]);

  useEffect(() => {
    if (externalShowThinking !== undefined) {
      console.log('External thinking state changed:', externalShowThinking);
    }
  }, [externalShowThinking]);

  // Log when component mounts with configuration state
  useEffect(() => {
    console.log('ChatInterface mounted with:', {
      hasExternalHandler: !!onSubmit,
      initialMessageCount: initialMessages.length,
      projectId: projectId || 'none',
      hasExternalLoadingState: externalIsLoading !== undefined,
      hasExternalThinkingState: externalShowThinking !== undefined
    });
    
    // Test the typing indicator functionality if no external states are provided
    if (externalIsLoading === undefined && externalShowThinking === undefined) {
      setIsTyping(true);
      setTimeout(() => {
        console.log('Initial typing indicator test complete');
        setIsTyping(false);
      }, 1000);
    }
    
    return () => {
      console.log('ChatInterface unmounting');
      // Clear any timers
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);

  // Function to add a message - will be called by the parent component
  const addMessage = (message: string) => {
    console.log('Message submitted:', message);
    
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
      
      // Clear any existing timer
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
      
      // When using external loading state, we only use internal state if external is not provided
      if (externalIsLoading === undefined) {
        // Show loading and typing indicators immediately
        setIsLoading(true);
        setIsTyping(true);
      }
      
      // Call the provided submit handler
      try {
        const result = onSubmit(message);
        console.log('onSubmit result type:', result instanceof Promise ? 'Promise' : typeof result);
        
        // Only handle internal state if external state is not provided
        if (externalIsLoading === undefined) {
          if (result instanceof Promise) {
            // For Promise-based submissions
            result
              .then(() => {
                console.log('Promise resolved, setting minimum display time');
                // Ensure the typing indicator shows for at least 2 seconds
                const minimumDisplayTime = 2000;
                setTimeout(() => {
                  setIsTyping(false);
                  setIsLoading(false);
                }, minimumDisplayTime);
              })
              .catch(error => {
                console.error('Error in submission:', error);
                // Even on error, ensure minimum display time
                setTimeout(() => {
                  setIsTyping(false);
                  setIsLoading(false);
                }, 2000);
              });
          } else {
            // For non-Promise submissions, still ensure minimum display time
            setTimeout(() => {
              setIsTyping(false);
              setIsLoading(false);
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error calling onSubmit:', error);
        // In case of synchronous error, ensure minimum display time
        if (externalIsLoading === undefined) {
          setTimeout(() => {
            setIsTyping(false);
            setIsLoading(false);
          }, 2000);
        }
      }
      
      return;
    }
    
    // Default behavior if no external handler is provided
    const userMessage: MessageType = {
      id: Date.now().toString(),
      content: message,
      isUser: true
    };
    
    const updatedMessages = [...allMessages, userMessage];
    setAllMessages(updatedMessages);
    
    // Show typing indicator
    setIsTyping(true);
    setIsLoading(true);
    
    // Simulate AI response with minimum display time
    setTimeout(() => {
      setIsTyping(false);
      setIsLoading(false);
      
      const aiMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(message),
        isUser: false
      };
      setAllMessages(prevMessages => [...prevMessages, aiMessage]);
    }, 2000); // Minimum display time of 2 seconds
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

  // Determine if we should show the typing indicator
  // Priority: External thinking state > External loading state > Internal typing state
  const shouldShowTypingIndicator = externalShowThinking !== undefined
    ? externalShowThinking 
    : externalIsLoading !== undefined
      ? externalIsLoading && allMessages.length > 0 // Only show if there are messages
      : isTyping;

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="flex-1 px-4 relative overflow-y-auto">
        {visibleMessages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {shouldShowTypingIndicator && (
          <div className="mt-4 flex justify-start">
            <div className="bg-transparent py-2 px-4 text-sm flex items-center">
              <TypingIndicator />
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