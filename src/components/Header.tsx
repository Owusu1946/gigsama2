'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ProjectList } from './ProjectList';
import { ProfileModal } from './ProfileModal';
import { useRouter } from 'next/navigation';

// Define Project interface to match the one used in ProjectList
interface Project {
  id: string;
  title: string;
  isHighlighted?: boolean;
}

interface HeaderProps {
  projectTitle?: string | null;
  onProjectTitleChange?: (newTitle: string) => void;
  onSelectProject?: (project: Project) => void;
}

// Sample user data
const sampleUserData = {
  name: 'Alex Johnson',
  email: 'alex@example.com',
  role: 'Developer',
  joinDate: 'Jan 15, 2024',
};

export function Header({ projectTitle = null, onProjectTitleChange, onSelectProject }: HeaderProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(projectTitle || '');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch projects when menu opens
  useEffect(() => {
    if (isMenuOpen) {
      fetchProjects();
    }
  }, [isMenuOpen]);

  // Fetch projects from the API
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/projects');
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      
      const data = await response.json();
      
      // Highlight the current project if it exists
      const highlightedProjects = data.map((project: Project) => ({
        ...project,
        isHighlighted: projectTitle === project.title
      }));
      
      setProjects(highlightedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update local state when prop changes
  useEffect(() => {
    setEditedTitle(projectTitle || '');
  }, [projectTitle]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileModal = () => {
    setIsProfileModalOpen(!isProfileModalOpen);
  };

  const handleNewProject = () => {
    console.log('Navigating to homepage for new project');
    setIsMenuOpen(false);
    
    // Navigate to the homepage where the user can create a new project
    router.push('/');
  };

  const handleSelectProject = (project: Project) => {
    console.log('Project selected:', project.title);
    
    // Make sure to close the menu
    setIsMenuOpen(false);
    
    // Update the project title
    if (onProjectTitleChange) {
      onProjectTitleChange(project.title);
    }
    
    // Forward the selection to the parent component which will handle navigation
    if (onSelectProject) {
      onSelectProject(project);
    }
  };

  const startEditing = () => {
    if (projectTitle && onProjectTitleChange) {
      setIsEditing(true);
    }
  };

  const finishEditing = () => {
    if (onProjectTitleChange && editedTitle.trim()) {
      onProjectTitleChange(editedTitle);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      finishEditing();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedTitle(projectTitle || '');
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTitle(e.target.value);
  };

  return (
    <>
      <header className="flex items-center justify-between px-6 py-2.5 border-b border-[#e5e7eb] relative z-20">
        <div className="flex items-center gap-1.5">
          <Image 
            src="/image.png" 
            alt="KeyMap logo" 
            width={18} 
            height={18}
            className="object-contain"
          />
          <span className="text-base font-medium tracking-tight">KeyMap</span>
        </div>
        
        {projectTitle && !isMenuOpen && (
          <div 
            className="absolute left-1/2 -translate-x-1/2 text-sm font-medium cursor-pointer group"
            onClick={startEditing}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editedTitle}
                onChange={handleTitleChange}
                onBlur={finishEditing}
                onKeyDown={handleKeyDown}
                className="bg-transparent border-b border-gray-300 outline-none text-center w-48"
                autoFocus
              />
            ) : (
              <div className="group-hover:underline">{projectTitle}</div>
            )}
          </div>
        )}
        
        <div className="flex items-center">
          <button 
            className="flex items-center justify-center mr-2 w-8 h-8" 
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <Image 
                src="/menu.svg" 
                alt="Menu icon" 
                width={20} 
                height={20}
              />
            )}
          </button>
          <button 
            className="w-8 h-8 rounded-full overflow-hidden bg-[#4F46E5] flex items-center justify-center text-white text-sm font-medium"
            onClick={toggleProfileModal}
            aria-label="Open profile"
          >
            {sampleUserData.name.charAt(0)}
          </button>
        </div>
      </header>

      {/* Project list overlay */}
      {isMenuOpen && (
        <ProjectList 
          projects={projects} 
          onNewProject={handleNewProject} 
          onSelectProject={handleSelectProject}
          isLoading={isLoading}
        />
      )}

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={toggleProfileModal} 
        userData={sampleUserData} 
      />
    </>
  );
}