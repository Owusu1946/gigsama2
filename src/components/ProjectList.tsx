'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import Image from 'next/image';
import Link from 'next/link';

// Define project type
interface Project {
  id: string;
  title: string;
  isHighlighted?: boolean;
  isAuthMessage?: boolean;
}

interface ProjectListProps {
  projects: Project[];
  onNewProject: () => void;
  onSelectProject?: (project: Project) => void;
  onProjectDeleted?: (projectId: string) => void;
  isLoading?: boolean;
}

// Create a separate DeleteButton component
export const DeleteButton = ({ project, onDelete }: { project: Project, onDelete: (project: Project) => void }) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // Prevent project selection
        onDelete(project);
      }}
      aria-label="Delete project"
      className="ml-2 text-gray-400 hover:text-red-500 focus:text-red-500 focus:outline-none transition-colors p-1.5 rounded-full hover:bg-red-50"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18"></path>
        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
      </svg>
    </button>
  );
};

// Create a separate DeleteConfirmationModal component
export const DeleteConfirmationModal = ({ 
  project, 
  onCancel, 
  onConfirm, 
  isLoading, 
  isSuccess 
}: { 
  project: Project, 
  onCancel: () => void, 
  onConfirm: () => void, 
  isLoading: boolean, 
  isSuccess: boolean 
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 delete-modal flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {isSuccess ? (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Project Deleted</h3>
            <p className="text-gray-500">The project has been successfully deleted.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-medium">Delete Project</h3>
                <p className="text-gray-500 text-sm mt-1">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="mb-6">
              Are you sure you want to delete <span className="font-semibold">{project.title}</span>? 
              All data associated with this project will be permanently removed.
            </p>
            
            <div className="flex justify-end gap-3 mt-auto">
              <button 
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                onClick={onConfirm}
                className={`px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center justify-center min-w-[100px] ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                ) : 'Delete'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export function ProjectList({ projects, onNewProject, onSelectProject, onProjectDeleted, isLoading = false }: ProjectListProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [localProjects, setLocalProjects] = useState<Project[]>(projects);
  const listRef = useRef<HTMLDivElement>(null);
  const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const [showScrollIndicators, setShowScrollIndicators] = useState({
    top: false,
    bottom: false
  });

  // Update local projects when props change
  useEffect(() => {
    setLocalProjects(projects);
  }, [projects]);

  // Clean up any timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current);
      }
    };
  }, []);

  // Set initial selection based on highlighted project
  useEffect(() => {
    const initialIndex = localProjects.findIndex(project => project.isHighlighted);
    setSelectedIndex(initialIndex >= 0 ? initialIndex : 0);
  }, [localProjects]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev <= 0 ? localProjects.length - 1 : prev - 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev >= localProjects.length - 1 ? 0 : prev + 1));
          break;
        case 'Enter':
          if (selectedIndex >= 0 && selectedIndex < localProjects.length) {
            handleSelectProject(localProjects[selectedIndex]);
          }
          break;
        case 'Escape':
          if (showDeleteConfirm) {
            setShowDeleteConfirm(false);
            setProjectToDelete(null);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [localProjects, selectedIndex, showDeleteConfirm]);

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
  }, [localProjects]);
  
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
    // Don't treat auth message as selectable project
    if (project.isAuthMessage) return;
    
    if (onSelectProject) {
      onSelectProject(project);
    }
  };
  
  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setShowDeleteConfirm(true);
    setDeleteSuccess(false);
  };
  
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    // Add a small delay before clearing the project to delete
    // This allows the animation to complete
    deleteTimeoutRef.current = setTimeout(() => {
      setProjectToDelete(null);
    }, 300);
  };
  
  const confirmDelete = async () => {
    if (!projectToDelete) return;
    
    try {
      setDeleteLoading(true);
      
      const response = await fetch(`/api/projects/${projectToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
      
      setDeleteSuccess(true);
      
      // Optimistically update UI by removing the project from local state
      setLocalProjects(prevProjects => 
        prevProjects.filter(project => project.id !== projectToDelete.id)
      );
      
      // Notify parent component about deletion if callback is provided
      if (onProjectDeleted) {
        onProjectDeleted(projectToDelete.id);
      }
      
      // Show success state briefly before closing
      deleteTimeoutRef.current = setTimeout(() => {
        setShowDeleteConfirm(false);
        setDeleteLoading(false);
        
        // Still refresh the router for complete state sync, but UI is already updated
        setTimeout(() => {
          router.refresh();
        }, 300);
      }, 1000);
      
    } catch (error) {
      console.error('Error deleting project:', error);
      setDeleteLoading(false);
      // Could show an error message here
    }
  };
  
  const navigateToLogin = () => {
    router.push('/login');
  };
  
  const navigateToSignup = () => {
    router.push('/signup');
  };

  // Check if we have an auth message
  const hasAuthMessage = localProjects.some(project => project.isAuthMessage);

  // Function to update scroll indicators
  const handleScroll = () => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      setShowScrollIndicators({
        top: scrollTop > 0,
        bottom: scrollTop + clientHeight < scrollHeight - 5 && localProjects.length > 4
      });
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
        ) : hasAuthMessage ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-center mb-6 text-gray-600">Please log in or sign up to view your projects</p>
            <div className="flex space-x-4">
              <button 
                onClick={navigateToLogin}
                className="bg-blue-500 text-white px-6 py-2 rounded-full font-medium"
              >
                Log In
              </button>
              <button 
                onClick={navigateToSignup}
                className="bg-black text-white px-6 py-2 rounded-full font-medium"
              >
                Sign Up
              </button>
            </div>
          </div>
        ) : localProjects.length === 0 ? (
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
                
                @keyframes slideIn {
                  from {
                    transform: translateY(20px);
                    opacity: 0;
                  }
                  to {
                    transform: translateY(0);
                    opacity: 1;
                  }
                }
                
                .delete-modal {
                  animation: slideIn 0.3s ease forwards;
                }
              `}</style>
              
              {localProjects.map((project, index) => (
                <div 
                  key={project.id} 
                  className={`text-center text-lg py-2.5 font-normal menu-item transition-all duration-300 ease-in-out 
                    flex items-center justify-between px-4 relative project-item
                    ${index === selectedIndex 
                      ? 'text-blue-500 font-medium scale-105'
                      : 'text-[#0f172a] hover:text-gray-600'
                    } ${project.isAuthMessage ? 'cursor-default' : 'cursor-pointer'}`}
                  onClick={() => {
                    if (!project.isAuthMessage) {
                      setSelectedIndex(index);
                      handleSelectProject(project);
                    }
                  }}
                  tabIndex={project.isAuthMessage ? -1 : 0}
                >
                  <span className="flex-1">{project.title}</span>
                  
                  {/* Delete button - only show for non-auth messages */}
                  {!project.isAuthMessage && (
                    <DeleteButton project={project} onDelete={handleDeleteClick} />
                  )}
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
          {hasAuthMessage ? (
            <button 
              onClick={navigateToLogin}
              className="bg-black text-white flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium"
            >
              Log In to Create Projects
            </button>
          ) : (
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
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && projectToDelete && (
        <DeleteConfirmationModal
          project={projectToDelete}
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
          isLoading={deleteLoading}
          isSuccess={deleteSuccess}
        />
      )}
    </div>
  );
} 