import React from 'react';

export const TypingIndicator: React.FC = () => {
  // Define keyframes for a more subtle fade and scale animation
  const keyframesStyle = `
    @keyframes pulseAndFade {
      0% { transform: scale(0.8); opacity: 0.3; }
      50% { transform: scale(1.0); opacity: 0.8; }
      100% { transform: scale(0.8); opacity: 0.3; }
    }
  `;
  
  // More modern style for dots
  const dotStyle = {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#555', // Subtle gray instead of black
    display: 'inline-block',
    margin: '0 3px',
  };
  
  return (
    <div className="flex items-center">
      {/* Insert keyframes animation via a style element */}
      <style dangerouslySetInnerHTML={{ __html: keyframesStyle }} />
      
      {/* First dot */}
      <div style={{
        ...dotStyle,
        animation: 'pulseAndFade 1.2s infinite ease-in-out',
      }} />
      
      {/* Second dot */}
      <div style={{
        ...dotStyle,
        animation: 'pulseAndFade 1.2s infinite ease-in-out 0.4s',
      }} />
      
      {/* Third dot */}
      <div style={{
        ...dotStyle,
        animation: 'pulseAndFade 1.2s infinite ease-in-out 0.8s',
      }} />
    </div>
  );
}; 