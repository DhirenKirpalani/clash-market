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
          <div className="relative animate-float">
            <img
              src="/images/download.svg"
              alt="Liqify Logo"
              className="w-64 h-64 md:w-96 md:h-96 animate-pulse"
            />
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
      <div className="relative animate-float">
        <img
          src="/images/download.svg"
          alt="Liqify Logo"
          className="w-64 h-64 md:w-96 md:h-96 animate-pulse"
        />
      </div>
    </div>
  );
}
