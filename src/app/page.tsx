'use client';

import { Layout } from '@/components/Layout';
import { useState, useEffect } from 'react';
import { WelcomeMessage } from '@/components/WelcomeMessage';
import { InputBar } from '@/components/InputBar';
import { ChatInterface } from '@/components/ChatInterface';
import { MessageType } from '@/components/ChatMessage';
import { useRouter } from 'next/navigation';
import { SchemaDisplay } from '@/components/SchemaDisplay';

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
  const [showSchema, setShowSchema] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Fetch projects on mount
  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await fetch('/api/projects');
        if (response.ok) {
          // Just to check if the API is working
          console.log('Projects API is working');
        }
      } catch (error) {
        console.error('Error checking projects API:', error);
      }
    }
    
    loadProjects();
  }, []);

  // Handle the first input differently to transition from welcome to chat
  const handleInitialSubmit = async (value: string) => {
    // Start loading and transition animation
    setIsLoading(true);
    setShowTransition(true);
    
    try {
      // Create a new project
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title: generateSummary(value)
        }),
      });
      
      // Check for 401 Unauthorized status
      if (response.status === 401) {
        // Redirect to guest chat page with the query as a parameter
        console.log('User not authenticated - redirecting to guest chat page');
        router.push(`/guest?query=${encodeURIComponent(value)}`);
        // Loading state will continue until the redirect completes
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to create project');
      }
      
      const project = await response.json();
      
      // Set current project ID
      setCurrentProjectId(project.id);
      
      // Save the title
      setConversationSummary(project.title);
      
      // Send the first message
      const chatResponse = await fetch(`/api/chat/${project.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: value }),
      });
      
      if (!chatResponse.ok) {
        throw new Error('Failed to send message');
      }
      
      // Keep loading state active while redirecting
      console.log('Project initialization complete - redirecting to project page');
      
      // Redirect to the project page (loading state will be maintained during navigation)
      router.push(`/project/${project.id}`);
      
      // Loading state will be cleared by the project page component when it loads
      
    } catch (error) {
      console.error('Error creating project and starting conversation:', error);
      
      // Create the first message pair for fallback behavior
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
      
      // Show schema when conversation starts
      setShowSchema(true);
      
      // Transition to chat interface with slight delay for animation
      setTimeout(() => {
        setIsConversationStarted(true);
        // Only clear loading state after the conversation is fully started
        setIsLoading(false);
        setShowTransition(false);
      }, 500); // Increased delay to ensure smooth transition
    }
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
      // For existing projects, navigate to project page
      router.push(`/project/${project.id}`);
    }
  };

  // Add handler for title changes
  const handleProjectTitleChange = (newTitle: string) => {
    setConversationSummary(newTitle);
    
    // If we have a current project ID, update the title
    if (currentProjectId) {
      fetch(`/api/projects/${currentProjectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      }).catch(err => {
        console.error('Failed to update project title:', err);
      });
    }
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
      return "Let&apos;s design a database schema that fits your needs. What tables would you like to include?";
    }
    
    if (userMessage.toLowerCase().includes('employee') || 
        userMessage.toLowerCase().includes('company') ||
        userMessage.toLowerCase().includes('manage')) {
      return "Got it! Let&apos;s start with a Users table to store employee details.";
    }
    
    return "I understand what you&apos;re looking for. Let&apos;s create a database schema for that. Should we start with a main entity table?";
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

  // Handle message submission after conversation has started
  const handleChatSubmit = async (message: string) => {
    console.log('Message received in home page chat handler:', message);
    
    // Return a Promise explicitly to ensure loading state works properly
    return new Promise<void>(async (resolve) => {
      // Add user message immediately for better UX
      const userMessage: MessageType = {
        id: Date.now().toString(),
        content: message,
        isUser: true
      };
      
      setInitialMessages(prev => [...prev, userMessage]);
      
      // Simulate processing time to ensure typing indicator is visible
      console.log('Simulating processing time for typing indicator');
      
      // Minimum processing time of 2.5 seconds to ensure the typing indicator is visible
      const minimumProcessingTime = 2500;
      const startTime = Date.now();
      
      try {
        // Simulate AI thinking/processing
        await new Promise(r => setTimeout(r, minimumProcessingTime));
        
        console.log('Processing complete, adding AI response');
        
        const aiMessage: MessageType = {
          id: (Date.now() + 1).toString(),
          content: generateInitialResponse(message),
          isUser: false
        };
        
        setInitialMessages(prev => [...prev, aiMessage]);
        console.log('AI response added, resolving promise');
        resolve();
      } catch (error) {
        console.error('Error in chat processing:', error);
        
        // Even on error, ensure minimum processing time
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minimumProcessingTime - elapsed);
        
        if (remainingTime > 0) {
          await new Promise(r => setTimeout(r, remainingTime));
        }
        
        resolve();
      }
    });
  };

  return (
    <Layout 
      conversationSummary={isConversationStarted ? conversationSummary : null}
      onProjectTitleChange={handleProjectTitleChange}
      onSelectProject={handleSelectProject}
    >
      {!isConversationStarted ? (
        <div className={`h-[calc(100vh-57px)] flex flex-col relative ${showTransition ? 'opacity-0 transition-opacity duration-300' : ''}`}>
          <div className="flex-1 flex flex-col items-center justify-center overflow-auto pb-24 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style jsx global>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mb-4"></div>
                <h2 className="text-xl font-medium mb-2">Initializing project...</h2>
                <p className="text-gray-500 text-center max-w-md">
                  We&apos;re setting up your database schema and preparing your environment.
                </p>
              </div>
            ) : (
              <WelcomeMessage />
            )}
          </div>
          <div className="w-full px-4 max-w-3xl mx-auto fixed bottom-4 left-0 right-0 z-10">
            <InputBar onSubmit={handleInitialSubmit} disabled={isLoading} />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center animate-fade-in relative">
          {/* Schema display at the top - always visible once conversation starts */}
          <div className="w-full max-w-5xl mx-auto overflow-auto pb-24 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style jsx global>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <SchemaDisplay isVisible={showSchema} schema={null} />
          
            {/* Chat Interface - below schema */}
            <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col pt-0 pb-6">
              <ChatInterface 
                initialMessages={initialMessages} 
                onSubmit={handleChatSubmit}
              />
            </div>
          </div>
          
          <div className="w-full px-4 max-w-3xl mx-auto fixed bottom-4 left-0 right-0 z-10">
            <InputBar onSubmit={handleChatSubmit} disabled={isLoading} />
          </div>
        </div>
      )}
    </Layout>
  );
}