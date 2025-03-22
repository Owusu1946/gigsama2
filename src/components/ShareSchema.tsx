'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';

interface ShareSchemaProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export function ShareSchema({ isOpen, onClose, projectId }: ShareSchemaProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/view/${projectId}` 
    : ``;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Reset copied state when modal opens/closes
  useEffect(() => {
    setCopied(false);
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Schema"
    >
      <div className="p-2">
        <p className="text-[color:var(--foreground)] mb-4">
          Share this link to let others view your schema in read-only mode:
        </p>
        
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 p-2 rounded border border-[color:var(--border-color)] bg-[color:var(--background)] text-[color:var(--foreground)]"
          />
          <button
            onClick={copyToClipboard}
            className="bg-[color:var(--foreground)] text-[color:var(--background)] px-4 py-2 rounded-md text-sm font-medium transition-colors hover:opacity-90 min-w-24"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        
        <div className="text-sm text-[color:var(--secondary-text)] mt-4">
          <p>Note: Anyone with this link can view your schema, but they cannot edit it.</p>
        </div>
      </div>
    </Modal>
  );
} 