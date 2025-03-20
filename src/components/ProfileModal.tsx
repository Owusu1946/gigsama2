'use client'

import { useState, useEffect, useRef } from 'react'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  userData: {
    name: string
    email: string
    avatar?: string
    role?: string
    joinDate?: string
  }
}

export function ProfileModal({ isOpen, onClose, userData }: ProfileModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

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
            transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close profile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Profile content */}
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            {userData.avatar ? (
              <img 
                src={userData.avatar} 
                alt={`${userData.name}'s avatar`} 
                className="h-16 w-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-xl font-semibold border-2 border-gray-200 dark:border-gray-700">
                {userData.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div>
              <h4 className="text-xl font-semibold">{userData.name}</h4>
              <p className="text-gray-600 dark:text-gray-400">{userData.email}</p>
              {userData.role && (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                  {userData.role}
                </span>
              )}
            </div>
          </div>
          
          {userData.joinDate && (
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              <p>Member since: {userData.joinDate}</p>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex space-x-2 mt-6">
            <button 
              className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
              text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 
              transition-colors duration-200 text-sm font-medium focus:outline-none focus:ring-2 
              focus:ring-blue-500 focus:ring-offset-2"
            >
              Edit Profile
            </button>
            <button 
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg 
              hover:bg-blue-700 transition-colors duration-200 text-sm font-medium
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Account Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 