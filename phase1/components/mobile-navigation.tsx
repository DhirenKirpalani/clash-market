"use client";

import React from 'react';
import { Home, Trophy, BookOpen, Users, User, Bell } from 'lucide-react';
import { useRouter } from 'next/router';
import { useWallet } from './wallet-provider';
import { useNotifications } from './notification-modal';
import { useSplashScreen } from './splash-screen';

export function MobileNavigation() {
  const { connected, connect } = useWallet();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const [isNotificationActive, setIsNotificationActive] = React.useState(false);
  const { isVisible: splashVisible } = useSplashScreen();
  // Default to 'lobby' for initial server render to avoid hydration mismatch
  const [activeSection, setActiveSection] = React.useState('lobby');
  
  // Set from localStorage after mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('activeLiqifySection');
      if (saved) setActiveSection(saved);
    }
  }, []);

  const scrollToSection = (sectionId: string) => {
    // Save active section to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeLiqifySection', sectionId);
    }
    
    // Update active section state
    setActiveSection(sectionId);
    
    // Check if we're on the home page
    if (router.pathname === '/') {
      // If on home page, just scroll to the section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If not on home page, navigate to home with section hash
      router.push(`/#${sectionId}`);
    }
  };
  
  // Trigger notification modal from mobile navigation
  const handleNotificationClick = () => {
    // Toggle notification active state for styling
    setIsNotificationActive(prev => !prev);
    
    // Find the notification component and trigger it directly
    const notificationButton = document.querySelector('[data-notification-trigger="true"]');
    if (notificationButton && notificationButton instanceof HTMLButtonElement) {
      notificationButton.click();
    }
    
    // Define properly typed event handler for custom event
    function handleDialogClose(this: Document, ev: Event) {
      const customEvent = ev as CustomEvent<{ open: boolean }>;
      if (customEvent.detail?.open === false) {
        setIsNotificationActive(false);
        document.removeEventListener('dialog-state-changed', handleDialogClose);
      }
    }
    
    // Listen for custom event when dialog closes
    document.addEventListener('dialog-state-changed', handleDialogClose);
  };
  
  // Navigate to profile and update active section
  const goToProfile = () => {
    // Save active section to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeLiqifySection', 'profile');
    }
    
    // Update active section state
    setActiveSection('profile');
    
    // Navigate to profile page
    router.push('/profile');
  };

  // Don't render mobile navigation when splash screen is visible
  if (splashVisible) return null;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-dark-card border-t border-electric-purple/20 z-[100] md:hidden safe-area-bottom">
      <div className="flex items-center justify-around py-2">
        <button 
          onClick={() => scrollToSection('lobby')}
          className={`flex flex-col items-center p-2 transition-colors ${activeSection === 'lobby' ? 'text-electric-purple' : 'text-gray-400 hover:text-electric-purple'}`}
        >
          <Home className="h-5 w-5 mb-1" />
          <span className="text-xs">Arena</span>
        </button>
        
        <button 
          onClick={() => scrollToSection('join')}
          className={`flex flex-col items-center p-2 transition-colors ${activeSection === 'join' ? 'text-cyber-blue' : 'text-gray-400 hover:text-cyber-blue'}`}
        >
          <Users className="h-5 w-5 mb-1" />
          <span className="text-xs">Join</span>
        </button>
        
        <button 
          onClick={() => scrollToSection('rules')}
          className={`flex flex-col items-center p-2 transition-colors ${activeSection === 'rules' ? 'text-neon-cyan' : 'text-gray-400 hover:text-neon-cyan'}`}
        >
          <BookOpen className="h-5 w-5 mb-1" />
          <span className="text-xs">Rules</span>
        </button>
        
        <button 
          onClick={() => scrollToSection('leaderboard')}
          className={`flex flex-col items-center p-2 transition-colors ${activeSection === 'leaderboard' ? 'text-warning-orange' : 'text-gray-400 hover:text-warning-orange'}`}
        >
          <Trophy className="h-5 w-5 mb-1" />
          <span className="text-xs">Board</span>
        </button>
        
        <button 
          onClick={handleNotificationClick}
          className={`flex flex-col items-center p-2 transition-colors relative ${isNotificationActive ? 'text-neon-cyan' : 'text-gray-400 hover:text-neon-cyan'}`}
        >
          <Bell className="h-5 w-5 mb-1" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-warning-orange text-dark-bg text-xs font-semibold rounded-full h-4 w-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
          <span className="text-xs">Alerts</span>
        </button>
        
        <button
          onClick={goToProfile}
          className={`flex flex-col items-center p-2 transition-colors ${activeSection === 'profile' ? 'text-electric-purple' : 'text-gray-400 hover:text-electric-purple'}`}
        >
          <User className="h-5 w-5 mb-1" />
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </nav>
  );
}
