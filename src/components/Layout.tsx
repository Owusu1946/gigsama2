'use client';

import React from 'react';
import { Header } from './Header';

interface Project {
  id: string;
  title: string;
  isHighlighted?: boolean;
}

interface LayoutProps {
  children: React.ReactNode;
  conversationSummary?: string | null;
  onProjectTitleChange?: (newTitle: string) => void;
  onSelectProject?: (project: Project) => void;
}

export function Layout({ 
  children, 
  conversationSummary = null,
  onProjectTitleChange,
  onSelectProject
}: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-white text-[#0f172a] overflow-hidden">
      <Header 
        projectTitle={conversationSummary} 
        onProjectTitleChange={onProjectTitleChange}
        onSelectProject={onSelectProject}
      />
      <main className="flex-1 flex flex-col relative">
        {children}
      </main>
    </div>
  );
} 