import React from 'react';

export const WelcomeMessage: React.FC = () => {
  return (
    <div className="text-center px-4 mb-10">
      <h1 className="text-4xl font-normal mb-3">
        Welcome, User.
      </h1>
      <p className="text-gray-500 text-xl font-light">
        What are we building today?
      </p>
    </div>
  );
}; 