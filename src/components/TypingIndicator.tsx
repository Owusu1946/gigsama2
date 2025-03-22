import React from 'react';

export const TypingIndicator: React.FC = () => {
  // Define keyframes for wave animation
  const keyframesStyle = `
    @keyframes wave {
      0%, 100% { transform: translateY(0px); }
      25% { transform: translateY(-5px); }
      75% { transform: translateY(5px); }
    }
  `;
  
  // Base style for all dots
  const dotStyle = {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#000000', // Changed to black for maximum visibility
    display: 'inline-block',
    margin: '0 3px',
  };
  
  return (
    <div className="flex items-center p-1">
      {/* Insert keyframes animation via a style element */}
      <style dangerouslySetInnerHTML={{ __html: keyframesStyle }} />
      
      {/* First dot */}
      <div style={{
        ...dotStyle,
        animation: 'wave 0.8s infinite ease-in-out',
      }} />
      
      {/* Second dot */}
      <div style={{
        ...dotStyle,
        animation: 'wave 0.8s infinite ease-in-out 0.2s',
      }} />
      
      {/* Third dot */}
      <div style={{
        ...dotStyle,
        animation: 'wave 0.8s infinite ease-in-out 0.4s',
      }} />
    </div>
  );
}; 