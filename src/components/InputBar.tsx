'use client';
import React, { useState } from 'react';
import { SendIcon } from './icons/SendIcon';

interface InputBarProps {
  placeholder?: string;
  onSubmit?: (value: string) => void;
}

export function InputBar({ placeholder = 'Ask anything', onSubmit }: InputBarProps) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (onSubmit && value.trim()) {
      onSubmit(value);
      setValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center w-full rounded-[20px] border border-gray-200 bg-white shadow-sm">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full py-3 px-4 border-none focus:outline-none rounded-[20px] bg-transparent"
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim()}
          className="p-2 mr-2 rounded-full bg-black text-white"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
} 