import React, { useEffect, useState } from 'react';
import DownloadSvg from './assets/download.svg';

interface SplashScreenProps {
  onLoadingComplete?: () => void;
  minDisplayTime?: number;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onLoadingComplete,
  minDisplayTime = 3000 // Minimum time to display the splash screen (3 seconds)
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Start the timer to hide splash screen
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onLoadingComplete) onLoadingComplete();
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime, onLoadingComplete]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#012619', // Match your app's background color
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999, // Ensure it's on top of everything
        transition: 'opacity 0.5s ease-out',
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div style={{ width: '80%', maxWidth: '400px' }}>
        <img 
          src={DownloadSvg} 
          alt="Liqify Logo" 
          style={{
            width: '100%',
            height: 'auto',
          }}
        />
      </div>
      <div 
        style={{ 
          marginTop: '2rem',
          width: '200px',
          height: '4px',
          backgroundColor: 'rgba(0, 240, 255, 0.1)',
          borderRadius: '2px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '30%',
            backgroundColor: '#00F0FF',
            borderRadius: '2px',
            boxShadow: '0 0 10px rgba(0, 240, 255, 0.7)',
            animation: 'loading 2s infinite ease-in-out'
          }}
        />
      </div>

      <style>{`
        @keyframes loading {
          0% {
            left: -30%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
