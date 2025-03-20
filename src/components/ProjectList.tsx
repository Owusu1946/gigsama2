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
  isLoading?: boolean;
}

export function ProjectList({ projects, onNewProject, onSelectProject, isLoading = false }: ProjectListProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const listRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicators, setShowScrollIndicators] = useState({
    top: false,
    bottom: false
  });

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
      
      // Update scroll indicators after scrolling
      updateScrollIndicators();
    }
  }, [selectedIndex]);
  
  // Update scroll indicators when list is scrolled
  useEffect(() => {
    const listElement = listRef.current;
    if (listElement) {
      updateScrollIndicators();
      listElement.addEventListener('scroll', updateScrollIndicators);
      return () => listElement.removeEventListener('scroll', updateScrollIndicators);
    }
  }, [projects]);
  
  // Function to update scroll indicators
  const updateScrollIndicators = () => {
    const listElement = listRef.current;
    if (listElement) {
      const hasTopContent = listElement.scrollTop > 10;
      const hasBottomContent = listElement.scrollHeight - listElement.scrollTop - listElement.clientHeight > 10;
      
      setShowScrollIndicators({
        top: hasTopContent,
        bottom: hasBottomContent
      });
    }
  };

  const handleSelectProject = (project: Project) => {
    if (onSelectProject) {
      onSelectProject(project);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-10 pt-16 flex flex-col items-center menu-overlay">
      <div className="max-w-xl w-full px-6 flex-1 flex flex-col">
        <h1 className="text-xl font-medium text-center mb-4 mt-6">PROJECTS</h1>
        
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <p className="text-center mb-4">No projects found</p>
            <button 
              onClick={onNewProject}
              className="text-blue-500 underline"
            >
              Create your first project
            </button>
          </div>
        ) : (
          <div className="relative flex-1 max-w-xl mx-auto">
            {/* Top scroll indicator */}
            {showScrollIndicators.top && (
              <div className="absolute top-0 left-0 right-0 text-center text-gray-400 py-1 z-10 bg-gradient-to-b from-white to-transparent">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </div>
            )}
            
            {/* Project list with fixed height for 4 items */}
            <div 
              ref={listRef} 
              className="flex flex-col overflow-y-auto scrollbar-hide"
              style={{
                scrollbarWidth: 'none', /* Firefox */
                msOverflowStyle: 'none', /* IE and Edge */
                height: 'calc(4 * 50px)', /* Adjusted fixed height for 4 items */
                paddingTop: '8px',
                paddingBottom: '8px',
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
                  className={`text-center text-lg py-2.5 font-normal menu-item transition-all duration-300 ease-in-out ${
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
            
            {/* Bottom scroll indicator */}
            {showScrollIndicators.bottom && (
              <div className="absolute bottom-0 left-0 right-0 text-center text-gray-400 py-1 z-10 bg-gradient-to-t from-white to-transparent">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-0 mb-4 flex justify-center">
          <button 
            onClick={onNewProject}
            className="bg-black text-white flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium new-project-button"
            disabled={isLoading}
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