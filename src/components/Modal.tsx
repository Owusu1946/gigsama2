'use client';

import React, { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  isTerminal?: boolean;
}

export function Modal({ isOpen, onClose, title, children, actions, isTerminal = false }: ModalProps) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className={`bg-[color:var(--background)] rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col border ${isTerminal ? 'border-gray-700' : 'border-[color:var(--border-color)]'} animate-slide-in ${isTerminal ? 'overflow-hidden' : ''}`}
        style={isTerminal ? { backgroundColor: '#1a1a1a' } : {}}
      >
        {isTerminal ? (
          <div className="bg-black p-2 border-b border-gray-700 flex items-center">
            <div className="flex space-x-2 mr-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            {title && <div className="text-sm text-gray-300 flex-1 text-center font-semibold">{title}</div>}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors ml-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          title && (
            <div className="p-4 border-b border-[color:var(--border-color)] flex justify-between items-center">
              <h3 className="text-lg font-medium text-[color:var(--foreground)]">{title}</h3>
              <div className="flex items-center">
                {actions}
                <button
                  onClick={onClose}
                  className="text-[color:var(--secondary-text)] hover:text-[color:var(--foreground)] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )
        )}
        
        <div className={`overflow-auto flex-grow ${isTerminal ? 'bg-[#1a1a1a] p-0' : 'p-4'}`}>
          {isTerminal ? (
            <div className="terminal-content p-4 font-mono text-sm relative">
              <style jsx global>{`
                .terminal-content {
                  line-height: 1.5;
                }
                
                .terminal-content .line:last-child::after {
                  content: '|';
                  color: #cccccc;
                  animation: blink 1s step-end infinite;
                  margin-left: 2px;
                }
                
                @keyframes blink {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0; }
                }
                
                .terminal-content .line {
                  min-height: 1.4em;
                }
                
                .terminal-content pre {
                  margin: 0;
                }
                
                .terminal-content .text-pink-400 {
                  color: #f472b6;
                  font-weight: bold;
                }
                
                .terminal-content .text-green-400 {
                  color: #34d399;
                }
                
                .terminal-content .text-yellow-300 {
                  color: #fcd34d;
                }
                
                .terminal-content .text-blue-300 {
                  color: #93c5fd;
                }
                
                .terminal-content .text-orange-300 {
                  color: #fdba74;
                }
              `}</style>
              {React.Children.map(children, child => {
                if (typeof child === 'string') {
                  return child.replace(/\\n/g, '\n');
                }
                return child;
              })}
            </div>
          ) : (
            children
          )}
        </div>
        
        {isTerminal && actions && (
          <div className="bg-black p-2 border-t border-gray-700 flex justify-end">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
} 