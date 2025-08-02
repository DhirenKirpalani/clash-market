"use client";

import React, { useState, useEffect } from 'react';

// Create a context to share the splash screen visibility state
export const SplashScreenContext = React.createContext<{ 
  isVisible: boolean,
  forceShow: () => void,
  forceHide: () => void
}>({ 
  isVisible: true,
  forceShow: () => {},
  forceHide: () => {}
});

export function SplashScreenProvider({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(true);
  
  // Force splash screen visibility functions
  const forceShow = () => setIsVisible(true);
  const forceHide = () => setIsVisible(false);
  
  useEffect(() => {
    // Only run this effect on the client side
    if (typeof window !== 'undefined') {
      // Add a class to body to prevent scrolling when splash screen is active
      if (isVisible) {
        document.body.style.overflow = 'hidden';
        document.body.setAttribute('data-splash', 'true');
      } else {
        document.body.style.overflow = '';
        document.body.removeAttribute('data-splash');
      }
    }
    
    // Hide the splash screen after a delay
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000); // Increased delay for better visibility
    
    return () => {
      clearTimeout(timer);
      if (typeof window !== 'undefined') {
        document.body.style.overflow = '';
        document.body.removeAttribute('data-splash');
      }
    };
  }, [isVisible]);
  
  return (
    <SplashScreenContext.Provider value={{ isVisible, forceShow, forceHide }}>
      {isVisible && (
        <div className="splash-screen fixed inset-0 flex flex-col items-center justify-center z-[9999] bg-dark-bg">
          <div className="relative game-splash-container">
            {/* Logo with game-like effects */}
            <img
              src="/images/Logo.png"
              alt="Clash Market Logo"
              className="w-40 h-40 md:w-64 md:h-64 mix-blend-screen relative z-10 game-splash-logo"
            />
            
            {/* Loading text */}
            <div className="absolute w-full text-center mt-16 top-full text-electric-purple font-orbitron game-splash-text">
              LOADING...
            </div>
            
            <style jsx>{`
              .game-splash-container {
                perspective: 1000px;
              }
              .game-splash-logo {
                animation: logoAnim 2s infinite;
                filter: drop-shadow(0 0 20px rgba(100, 65, 255, 0.8));
              }
              .game-splash-text {
                animation: blinkText 1.2s infinite;
                letter-spacing: 3px;
              }

              @keyframes logoAnim {
                0% { transform: rotateY(0deg) scale(0.95); filter: brightness(0.8) drop-shadow(0 0 10px rgba(100, 65, 255, 0.6)); }
                50% { transform: rotateY(10deg) scale(1.05); filter: brightness(1.2) drop-shadow(0 0 25px rgba(100, 65, 255, 0.9)); }
                100% { transform: rotateY(0deg) scale(0.95); filter: brightness(0.8) drop-shadow(0 0 10px rgba(100, 65, 255, 0.6)); }
              }
              @keyframes blinkText {
                0% { opacity: 0.5; transform: scale(0.98); }
                50% { opacity: 1; transform: scale(1.02); }
                100% { opacity: 0.5; transform: scale(0.98); }
              }

            `}</style>
          </div>
        </div>
      )}
      {children}
    </SplashScreenContext.Provider>
  );
}

export function useSplashScreen() {
  return React.useContext(SplashScreenContext);
}

// Helper component to show splash screen anywhere
export function SplashScreen() {
  const { isVisible } = useSplashScreen();
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-[9999] bg-dark-bg">
      <div className="relative game-splash-container">
        {/* Logo with game-like effects */}
        <img
          src="/images/Logo.png"
          alt="Clash Market Logo"
          className="w-40 h-40 md:w-64 md:h-64 mix-blend-screen relative z-10 game-splash-logo"
        />
        
        {/* Loading text */}
        <div className="absolute w-full text-center mt-16 top-full text-electric-purple font-orbitron game-splash-text">
          LOADING...
        </div>
        
        <style jsx>{`
          .game-splash-container {
            perspective: 1000px;
          }
          .game-splash-logo {
            animation: logoAnim 2s infinite;
            filter: drop-shadow(0 0 20px rgba(100, 65, 255, 0.8));
          }
          .game-splash-text {
            animation: blinkText 1.2s infinite;
            letter-spacing: 3px;
          }
          .game-splash-circle {
            position: absolute;
            width: 150px;
            height: 150px;
            border: 2px solid rgba(100, 65, 255, 0.5);
            border-radius: 50%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation: pulseCircle 3s infinite;
            z-index: 1;
          }
          .circle-2 {
            width: 200px;
            height: 200px;
            border-color: rgba(0, 255, 255, 0.3);
            animation-delay: 0.5s;
          }
          .circle-3 {
            width: 250px;
            height: 250px;
            border-color: rgba(255, 0, 255, 0.2);
            animation-delay: 1s;
          }
          @keyframes logoAnim {
            0% { transform: rotateY(0deg) scale(0.95); filter: brightness(0.8) drop-shadow(0 0 10px rgba(100, 65, 255, 0.6)); }
            50% { transform: rotateY(10deg) scale(1.05); filter: brightness(1.2) drop-shadow(0 0 25px rgba(100, 65, 255, 0.9)); }
            100% { transform: rotateY(0deg) scale(0.95); filter: brightness(0.8) drop-shadow(0 0 10px rgba(100, 65, 255, 0.6)); }
          }
          @keyframes blinkText {
            0% { opacity: 0.5; transform: scale(0.98); }
            50% { opacity: 1; transform: scale(1.02); }
            100% { opacity: 0.5; transform: scale(0.98); }
          }

        `}</style>
      </div>
    </div>
  );
}
