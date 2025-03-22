'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'

// Extended user type to match both auth user and profile data
interface DisplayUser {
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  joinDate?: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData?: DisplayUser;
}

export function ProfileModal({ isOpen, onClose, userData }: ProfileModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const { user, logout, isLoading, refreshUser } = useAuth()

  // Add debugging for user object
  useEffect(() => {
    if (user) {
      console.log('[ProfileModal] Auth user data:', user);
    }
  }, [user]);

  // Refresh user data when modal is opened
  useEffect(() => {
    if (isOpen && !isLoading) {
      // Only refresh if we're not already in the process of logging out
      if (user) {
        console.log('[ProfileModal] Refreshing user data');
        refreshUser().catch(err => {
          console.error('[ProfileModal] Error refreshing user data:', err);
        });
      }
    }
  }, [isOpen, refreshUser, user, isLoading]);

  // Use authenticated user if provided, otherwise use prop data
  // Convert auth user to DisplayUser format
  const displayUser: DisplayUser | null = user ? {
    id: user.id,
    name: user.name || '',
    email: user.email || ''
  } : userData || null;

  // Handle animation timing
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Handle escape key to close
  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleEscKey)
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscKey)
    }
  }, [isOpen, onClose])

  // Handle logout
  const handleLogout = async () => {
    if (isLoading) {
      console.log('[ProfileModal] Logout already in progress, ignoring click');
      return;
    }
    
    try {
      console.log('[ProfileModal] Initiating logout');
      
      // Close the modal first to give instant feedback
      onClose();
      
      // Show feedback about logout processing - you could add a toast notification here
      // e.g., toast.info('Signing out...');
      
      // Perform the actual logout
      await logout();
      
      // After logout completes, we don't need to do anything else
      // since the AuthContext logout will redirect to login page
      console.log('[ProfileModal] Logout completed');
    } catch (error) {
      console.error('[ProfileModal] Error during logout:', error);
      // You might want to show an error toast here
      // e.g., toast.error('Failed to sign out. Please try again.');
    }
  }

  if (!isVisible) return null

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 
      transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      aria-modal="true"
      role="dialog"
    >
      <div 
        ref={modalRef}
        className={`w-full max-w-md rounded-xl bg-white dark:bg-gray-900 shadow-lg 
        transform transition-all duration-300 overflow-hidden
        ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'}`}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-medium">Profile</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 
            transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black"
            aria-label="Close profile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Profile content */}
        <div className="p-6">
          {displayUser ? (
            <div className="flex items-center space-x-4 mb-6">
              {displayUser.avatar ? (
                <img 
                  src={displayUser.avatar} 
                  alt={`${displayUser.name}'s avatar`} 
                  className="h-16 w-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-black dark:text-white text-xl font-semibold border-2 border-gray-300 dark:border-gray-600">
                  {displayUser.name ? displayUser.name.charAt(0).toUpperCase() : ''}
                </div>
              )}
              
              <div>
                <h4 className="text-xl font-semibold">{displayUser.name}</h4>
                <p className="text-gray-600 dark:text-gray-400">{displayUser.email}</p>
                {displayUser.role && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full">
                    {displayUser.role}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">Please sign in to view profile</p>
            </div>
          )}
          
          {displayUser?.joinDate && (
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              <p>Member since: {displayUser.joinDate}</p>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex space-x-2 mt-6">
            {user ? (
              <>
                <button 
                  className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                  text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 
                  transition-colors duration-200 text-sm font-medium focus:outline-none focus:ring-2 
                  focus:ring-black focus:ring-offset-2"
                  onClick={() => window.location.href = '/login'}
                >
                  Edit Profile
                </button>
                <button 
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg 
                  hover:bg-red-700 transition-colors duration-200 text-sm font-medium
                  focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  onClick={handleLogout}
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing out...' : 'Sign out'}
                </button>
              </>
            ) : (
              <>
                <button 
                  className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                  text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 
                  transition-colors duration-200 text-sm font-medium focus:outline-none focus:ring-2 
                  focus:ring-black focus:ring-offset-2"
                  onClick={() => window.location.href = '/login'}
                >
                  Sign In
                </button>
                <button 
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg 
                  hover:bg-gray-800 transition-colors duration-200 text-sm font-medium
                  focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                  onClick={() => window.location.href = '/signup'}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 