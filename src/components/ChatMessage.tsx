'use client';

import React from 'react';

export type MessageType = {
  id: string;
  content: string;
  isUser: boolean;
};

interface ChatMessageProps {
  message: MessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className="flex w-full chat-message justify-center mb-6">
      <div 
        className={`max-w-[80%] py-3 px-4 text-sm ${
          message.isUser 
            ? 'bg-[#f1f1f1] text-[#0f172a] rounded-[18px]' 
            : 'bg-white text-[#0f172a] rounded-[18px]'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
} 