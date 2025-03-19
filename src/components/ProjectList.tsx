'use client';

import React, { useState, useEffect, useRef } from 'react';

// Define project type
interface Project {
  id: string;
  title: string;
  isHighlighted?: boolean;
}

interface ProjectListProps {
  projects: Project[];
  onNewProject: () => void;
  onSelectProject?: (project: Project) => void;
}

export function ProjectList({ projects, onNewProject, onSelectProject }: ProjectListProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const listRef = useRef<HTMLDivElement>(null);

  // Set initial selection based on highlighted project
  useEffect(() => {
    const initialIndex = projects.findIndex(project => project.isHighlighted);
    setSelectedIndex(initialIndex >= 0 ? initialIndex : 0);
  }, [projects]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev <= 0 ? projects.length - 1 : prev - 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev >= projects.length - 1 ? 0 : prev + 1));
          break;
        case 'Enter':
          if (selectedIndex >= 0 && selectedIndex < projects.length) {
            handleSelectProject(projects[selectedIndex]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [projects, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleSelectProject = (project: Project) => {
    if (onSelectProject) {
      onSelectProject(project);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-10 pt-16 flex flex-col items-center menu-overlay">
      <div className="max-w-xl w-full px-6 flex-1 flex flex-col">
        <h1 className="text-xl font-medium text-center my-10">PROJECTS</h1>
        
        <div 
          ref={listRef} 
          className="flex flex-col space-y-5 overflow-y-auto scrollbar-hide"
          style={{
            scrollbarWidth: 'none',  /* Firefox */
            msOverflowStyle: 'none',  /* IE and Edge */
          }}
        >
          <style jsx>{`
            div.scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          {projects.map((project, index) => (
            <div 
              key={project.id} 
              className={`text-center text-lg py-2 font-normal menu-item transition-all duration-300 ease-in-out ${
                index === selectedIndex 
                  ? 'text-blue-500 font-medium scale-105'
                  : 'text-[#0f172a] hover:text-gray-600'
              }`}
              onClick={() => {
                setSelectedIndex(index);
                handleSelectProject(project);
              }}
              tabIndex={0}
            >
              {project.title}
            </div>
          ))}
        </div>
        
        <div className="mt-auto mb-16 flex justify-center">
          <button 
            onClick={onNewProject}
            className="bg-black text-white flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium new-project-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            New Project
          </button>
        </div>
      </div>
    </div>
  );
} 