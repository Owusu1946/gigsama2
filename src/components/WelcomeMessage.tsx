import React from 'react';
import { useAuth } from './AuthContext';

export const WelcomeMessage: React.FC = () => {
  const { user } = useAuth();
  
  // Extract first name from user's full name, if available
  const firstName = user?.name ? user.name.split(' ')[0] : 'Guest';

  return (
    <div className="text-center px-4 mb-10">
      <h1 className="text-4xl font-normal mb-3">
        Welcome, {firstName}.
      </h1>
      <p className="text-gray-500 text-xl font-light">
        What are we building today?
      </p>
    </div>
  );
}; 