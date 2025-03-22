'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, Suspense } from 'react';
import { Layout } from '@/components/Layout';
import { ChatInterface } from '@/components/ChatInterface';
import { SchemaDisplay } from '@/components/SchemaDisplay';
import { MessageType } from '@/components/ChatMessage';
import { InputBar } from '@/components/InputBar';

// Create a client component that uses useSearchParams
function GuestChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('query') || '';
  
  const [isLoading, setIsLoading] = useState(false);
  const [sessionTitle, setSessionTitle] = useState(initialQuery ? `${initialQuery.substring(0, 30)}... (Guest)` : 'New Chat (Guest)');
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [schema, setSchema] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Generate a session ID for this guest session
  const sessionId = useRef(`guest-${Date.now()}`);
  
  // Initialize with the query from URL if present
  useEffect(() => {
    if (initialQuery && !isInitialized) {
      handleMessageSubmit(initialQuery);
      setIsInitialized(true);
    }
  }, [initialQuery, isInitialized]);
  
  // Handle project selection
  const handleSelectProject = () => {
    // For guest mode, redirect to login when trying to access projects
    router.push('/login');
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
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat/guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message,
          messages: messages // Send current messages for context
        }),
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
      
      // If this is the first message, update the title
      if (messages.length === 0 && !sessionTitle.includes(message)) {
        // Generate a title from the first message
        const newTitle = message.length > 30 
          ? `${message.substring(0, 30)}... (Guest)` 
          : `${message} (Guest)`;
        setSessionTitle(newTitle);
      }
      
      // If schema was updated, update it in the UI
      if (data.schema) {
        setSchema(data.schema);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Dummy function for title change in guest mode
  const handleSessionTitleChange = (newTitle: string) => {
    setSessionTitle(newTitle.endsWith('(Guest)') ? newTitle : `${newTitle} (Guest)`);
  };

  return (
    <Layout 
      conversationSummary={sessionTitle} 
      onProjectTitleChange={handleSessionTitleChange}
      onSelectProject={handleSelectProject}
    >
      <div className="flex-1 flex flex-col items-center relative">
        {/* Schema display at the top - always visible once conversation starts */}
        <div className="w-full max-w-5xl mx-auto overflow-auto pb-24 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style jsx global>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <SchemaDisplay isVisible={true} schema={schema} />
        
          {/* Chat Interface - below schema */}
          <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col pt-0 pb-6">
            {error ? (
              <div className="p-4 bg-red-50 text-red-700 rounded-md mb-4">
                Error: {error}
              </div>
            ) : null}
            
            {messages.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <h2 className="text-xl font-semibold mb-2">Guest Chat Session</h2>
                <p className="mb-4">Your conversation will not be saved. Sign in to save your projects.</p>
              </div>
            ) : (
              <ChatInterface initialMessages={messages} />
            )}
          </div>
        </div>
        
        <div className="w-full px-4 max-w-3xl mx-auto fixed bottom-4 left-0 right-0 z-10">
          <InputBar onSubmit={handleMessageSubmit} disabled={isLoading} />
        </div>
      </div>
    </Layout>
  );
}

// Create a loading fallback component
function LoadingFallback() {
  return (
    <Layout conversationSummary="Loading..." onProjectTitleChange={() => {}} onSelectProject={() => {}}>
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    </Layout>
  );
}

// Main component that wraps the content in a Suspense boundary
export default function GuestChatPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GuestChatContent />
    </Suspense>
  );
} 