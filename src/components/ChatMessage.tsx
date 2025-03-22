'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';

export type MessageType = {
  id: string;
  content: string;
  isUser: boolean;
};

interface ChatMessageProps {
  message: MessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  // Create a function to decode HTML entities
  const decodeHTMLEntities = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  return (
    <div className="flex w-full chat-message justify-center mb-6">
      <div 
        className={`max-w-[80%] py-3 px-4 text-sm ${
          message.isUser 
            ? 'bg-[#f1f1f1] text-[#0f172a] rounded-[18px]' 
            : 'bg-white text-[#0f172a] rounded-[18px]'
        }`}
      >
        {message.isUser ? (
          decodeHTMLEntities(message.content)
        ) : (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                strong: ({node, ...props}) => <span className="font-bold" {...props} />,
                em: ({node, ...props}) => <span className="italic" {...props} />,
                p: ({node, ...props}) => <p className="my-2" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2" {...props} />,
                li: ({node, ...props}) => <li className="my-1" {...props} />,
                a: ({node, ...props}) => <a className="text-blue-500 underline" {...props} />
              }}
            >
              {decodeHTMLEntities(message.content)}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
} 