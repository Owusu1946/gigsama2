'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { ChatInterface } from '@/components/ChatInterface';
import { SchemaDisplay } from '@/components/SchemaDisplay';
import { MessageType } from '@/components/ChatMessage';
import { InputBar } from '@/components/InputBar';

// Define Project interface
interface Project {
  id: string;
  title: string;
  isHighlighted?: boolean;
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [projectTitle, setProjectTitle] = useState('Loading...');
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [schema, setSchema] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch project data
  useEffect(() => {
    async function fetchProject() {
      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/projects/${projectId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            router.push('/');
            return;
          }
          throw new Error('Failed to fetch project');
        }
        
        const project = await response.json();
        
        // Convert project messages to chat interface format
        const formattedMessages = project.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          isUser: msg.isUser
        }));
        
        setProjectTitle(project.title);
        setMessages(formattedMessages);
        setSchema(project.schema);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      }
    }
    
    fetchProject();
  }, [projectId, router]);
  
  // Handle project title change
  const handleProjectTitleChange = async (newTitle: string) => {
    setProjectTitle(newTitle);
    
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      });
    } catch (err) {
      console.error('Failed to update project title:', err);
    }
  };
  
  // Handle project selection from ProjectList
  const handleSelectProject = (project: Project) => {
    console.log('Project selected, navigating to:', project.id);
    
    // Check if we're already on this project
    if (project.id === projectId) {
      return; // No need to navigate if already on the same project
    }
    
    // Navigate to the selected project's page
    router.push(`/project/${project.id}`);
  };
  
  // Handle chat message submission
  const handleMessageSubmit = async (message: string) => {
    // Optimistic update for UI responsiveness
    const userMessage: MessageType = {
      id: Date.now().toString(),
      content: message,
      isUser: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const response = await fetch(`/api/chat/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const data = await response.json();
      
      // Add AI response
      const aiMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // If schema was updated, update it in the UI
      if (data.schema) {
        setSchema(data.schema);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (error) {
    return (
      <Layout 
        conversationSummary={projectTitle} 
        onProjectTitleChange={handleProjectTitleChange}
        onSelectProject={handleSelectProject}
      >
        <div className="flex items-center justify-center h-[calc(100vh-57px)]">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            Error: {error}. <button onClick={() => router.push('/')} className="underline">Go Home</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      conversationSummary={projectTitle} 
      onProjectTitleChange={handleProjectTitleChange}
      onSelectProject={handleSelectProject}
    >
      <div className="flex-1 flex flex-col items-center animate-fade-in relative">
        {/* Scrollable container for schema and chat */}
        <div className="w-full h-[calc(100vh-57px)] overflow-y-auto pb-24 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style jsx global>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {/* Schema display at the top */}
          <div className="w-full max-w-5xl mx-auto">
            <SchemaDisplay isVisible={true} schema={schema} />
          </div>
          
          {/* Chat Interface - below schema */}
          <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col pt-0 pb-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mb-4"></div>
                <h2 className="text-xl font-medium mb-2">Loading project...</h2>
                <p className="text-gray-500 text-center max-w-md">
                  Retrieving your project data and database schema.
                </p>
              </div>
            ) : (
              <ChatInterface 
                initialMessages={messages} 
                onSubmit={handleMessageSubmit}
                projectId={projectId}
              />
            )}
          </div>
        </div>
        
        {/* Fixed input bar at the bottom */}
        {!isLoading && (
          <div className="w-full px-4 max-w-3xl mx-auto fixed bottom-4 left-0 right-0 z-10">
            <InputBar onSubmit={handleMessageSubmit} disabled={isLoading} />
          </div>
        )}
      </div>
    </Layout>
  );
} 