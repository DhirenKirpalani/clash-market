"use client";

import React, { useState } from 'react';
import { Home, User, Bell, Gamepad2, Wallet } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useSupabaseWallet } from '@/hooks/useSupabaseWallet';
import { useNotifications } from './notification-modal';
import { useAdminStatus } from '../hooks/useAdminStatus';
import { useSplashScreen } from './splash-screen';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function MobileNavigation() {
  const { connected, connect, user } = useSupabaseWallet();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();
  const [isNotificationActive, setIsNotificationActive] = React.useState(false);
  const { isVisible: splashVisible } = useSplashScreen();
  const { isAdmin } = useAdminStatus();
  // Default to 'lobby' for initial server render to avoid hydration mismatch
  const [activeSection, setActiveSection] = React.useState('lobby');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Set from localStorage after mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('activeClashMarketSection');
      if (saved) setActiveSection(saved);
    }
  }, []);

  const scrollToSection = (sectionId: string) => {
    // Save active section to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeClashMarketSection', sectionId);
    }
    
    // Update active section state
    setActiveSection(sectionId);
    
    // Check if we're on the home page
    if (pathname === '/') {
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
      localStorage.setItem('activeClashMarketSection', 'profile');
    }
    
    // Update active section state
    setActiveSection('profile');
    
    // Navigate to profile page
    router.push('/profile');
  };
  
  // Navigate to games screen with wallet connection check
  const goToGames = () => {
    // Save active section to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeClashMarketSection', 'games');
    }
    
    // Update active section state
    setActiveSection('games');
    
    // Check if wallet is connected before navigating
    if (connected) {
      // Navigate to games page if wallet is connected
      router.push('/games');
    } else {
      // Open wallet connection modal if not connected
      setIsWalletModalOpen(true);
    }
  };

  // Handle wallet connection
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      await connect();
      setIsWalletModalOpen(false);
      // Navigate to games page after successful connection
      router.push('/games');
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Don't render mobile navigation when splash screen is visible
  if (splashVisible) return null;
  
  return (
    <>
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
          onClick={goToGames}
          className={`flex flex-col items-center p-2 transition-colors ${activeSection === 'games' || pathname === '/games' ? 'text-cyber-blue' : 'text-gray-400 hover:text-cyber-blue'}`}
        >
          <Gamepad2 className="h-5 w-5 mb-1" />
          <span className="text-xs">Games</span>
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
      
      {/* Wallet Connection Modal */}
      <Dialog open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen}>
        <DialogContent className="max-w-[90vw] w-full sm:max-w-[375px] bg-dark-card border-electric-purple/20 p-4 sm:p-6">
          <DialogHeader className="space-y-2 pb-2">
            <DialogTitle className="text-lg sm:text-xl text-electric-purple flex items-center">
              <Wallet className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Connect Your Wallet
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-400">
              You need to connect your wallet to access the gaming arena.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-3 sm:py-4 space-y-3 sm:space-y-4">
            <p className="text-xs sm:text-sm">Connect with your Phantom wallet:</p>
            <div className="space-y-2">
              <Button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="w-full py-2 sm:py-3 gaming-button rounded-lg font-semibold transition-all duration-300 flex items-center justify-center text-sm"
              >
                {isConnecting ? 'Connecting...' : 'Connect Phantom'}
              </Button>
            </div>
          </div>
          
          <DialogFooter className="flex-col gap-2 pt-1 sm:pt-2">
            <Button
              variant="ghost"
              onClick={() => setIsWalletModalOpen(false)}
              className="w-full border border-gray-700 hover:bg-dark-bg text-sm"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
