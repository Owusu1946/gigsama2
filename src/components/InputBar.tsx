'use client';
import React, { useState } from 'react';
import { SendIcon } from './icons/SendIcon';

interface InputBarProps {
  placeholder?: string;
  onSubmit?: (value: string) => void;
  disabled?: boolean;
}

export function InputBar({ 
  placeholder = 'Ask anything', 
  onSubmit,
  disabled = false 
}: InputBarProps) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (onSubmit && value.trim() && !disabled) {
      onSubmit(value);
      setValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative w-full">
      <div className={`flex items-center w-full rounded-[20px] border border-gray-200 bg-white shadow-sm ${disabled ? 'opacity-70' : ''}`}>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full py-6 px-4 border-none focus:outline-none rounded-[20px] bg-transparent"
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || disabled}
          className={`p-2 mr-2 rounded-full bg-black text-white ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
} 