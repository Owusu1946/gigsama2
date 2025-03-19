'use client';

import { Layout } from '@/components/Layout';
import { useState, useEffect } from 'react';
import { WelcomeMessage } from '@/components/WelcomeMessage';
import { InputBar } from '@/components/InputBar';
import { ChatInterface } from '@/components/ChatInterface';
import { MessageType } from '@/components/ChatMessage';
import { useRouter } from 'next/navigation';

// Define project type if not already defined elsewhere
interface Project {
  id: string;
  title: string;
  isHighlighted?: boolean;
}

export default function Home() {
  const [isConversationStarted, setIsConversationStarted] = useState(false);
  const [conversationSummary, setConversationSummary] = useState('NEW PROJECT');
  const [initialMessages, setInitialMessages] = useState<MessageType[]>([]);
  const [showTransition, setShowTransition] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const router = useRouter();

  // Handle the first input differently to transition from welcome to chat
  const handleInitialSubmit = (value: string) => {
    console.log('Initial user input:', value);
    
    // Start transition animation
    setShowTransition(true);
    
    // Create the first message pair
    const firstUserMessage: MessageType = {
      id: Date.now().toString(),
      content: value,
      isUser: true
    };
    
    const firstAIResponse: MessageType = {
      id: (Date.now() + 1).toString(),
      content: generateInitialResponse(value),
      isUser: false
    };
    
    // Set the messages that will be passed to ChatInterface
    setInitialMessages([firstUserMessage, firstAIResponse]);
    
    // Transition to chat interface with slight delay for animation
    setTimeout(() => {
      setIsConversationStarted(true);
    }, 300);
  };

  // Handle project selection
  const handleSelectProject = (project: Project) => {
    console.log('Selected project in Home:', project.id);
    
    // Check if this is a new project (ID starts with "new-")
    const isNewProject = project.id.startsWith('new-');
    
    // Update the title
    setConversationSummary(project.title);
    
    // For new projects, reset the conversation
    if (isNewProject) {
      // Reset messages
      setInitialMessages([]);
      
      // If we're already in the chat interface, reset it
      if (isConversationStarted) {
        // Optional: You could add an animation effect here
        setShowTransition(true);
        setTimeout(() => {
          setShowTransition(false);
        }, 300);
      } else {
        // If we're on the welcome screen, transition to chat
        setShowTransition(true);
        setTimeout(() => {
          setIsConversationStarted(true);
          setTimeout(() => {
            setShowTransition(false);
          }, 300);
        }, 300);
      }
    } else {
      // For existing projects, you could load project data here
      // For now, just transition to chat if needed
      if (!isConversationStarted) {
        setShowTransition(true);
        setTimeout(() => {
          setIsConversationStarted(true);
          setTimeout(() => {
            setShowTransition(false);
          }, 300);
        }, 300);
      }
    }
  };

  // Add handler for title changes
  const handleProjectTitleChange = (newTitle: string) => {
    setConversationSummary(newTitle);
    // Optionally, you could save the title change to your backend here
  };
  
  // Reset animation state after transition
  useEffect(() => {
    if (isConversationStarted) {
      setTimeout(() => {
        setShowTransition(false);
      }, 300);
    }
  }, [isConversationStarted]);
  
  // Simple function to generate an initial AI response
  const generateInitialResponse = (userMessage: string): string => {
    if (userMessage.toLowerCase().includes('database') || 
        userMessage.toLowerCase().includes('schema') ||
        userMessage.toLowerCase().includes('sql')) {
      return "Let's design a database schema that fits your needs. What tables would you like to include?";
    }
    
    if (userMessage.toLowerCase().includes('employee') || 
        userMessage.toLowerCase().includes('company') ||
        userMessage.toLowerCase().includes('manage')) {
      return "Got it! Let's start with a Users table to store employee details.";
    }
    
    return "I understand what you're looking for. Let's create a database schema for that. Should we start with a main entity table?";
  };
  
  // Generate a conversation summary from the first message
  const generateSummary = (message: string): string => {
    if (message.length > 30) {
      return message.substring(0, 30) + "...";
    }
    
    // Special cases for common topics
    if (message.toLowerCase().includes('employee')) {
      return "Employee Management System";
    }
    
    if (message.toLowerCase().includes('inventory')) {
      return "Inventory Tracking System";
    }
    
    if (message.toLowerCase().includes('school') || message.toLowerCase().includes('student')) {
      return "School Management System";
    }
    
    return message;
  };

  return (
    <Layout 
      conversationSummary={isConversationStarted ? conversationSummary : null}
      onProjectTitleChange={handleProjectTitleChange}
      onSelectProject={handleSelectProject}
    >
      {!isConversationStarted ? (
        <div className={`h-[calc(100vh-57px)] flex flex-col ${showTransition ? 'opacity-0 transition-opacity duration-300' : ''}`}>
          <div className="flex-1 flex flex-col items-center justify-center">
            <WelcomeMessage />
          </div>
          <div className="w-full px-4 pb-8 max-w-3xl mx-auto">
            <InputBar onSubmit={handleInitialSubmit} />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-between animate-fade-in">
          {/* Empty space for schema display in the future */}
          <div className="w-full max-w-3xl mx-auto flex-grow-0 py-38">
            {/* Empty div reserves space at the top */}
          </div>
          
          {/* Chat Interface - pushed down */}
          <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col pt-0 pb-6">
            <ChatInterface initialMessages={initialMessages} />
          </div>
        </div>
      )}
    </Layout>
  );
}