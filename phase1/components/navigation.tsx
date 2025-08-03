"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useSupabaseWallet } from '@/hooks/useSupabaseWallet';
import { useNotifications } from './notification-modal';
import { useAdminStatus } from '../hooks/useAdminStatus';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Bell, CheckCircle, AlertTriangle, Info, User, ShieldCheck, Wallet } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useSplashScreen } from './splash-screen';
import dynamic from 'next/dynamic';

const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

export function Navigation() {
  const { connected, connecting, loading, publicKey, user, connect, disconnect } = useSupabaseWallet();
  const { notifications, clearNotifications, unreadCount } = useNotifications();
  const [notificationOpen, setNotificationOpen] = React.useState(false);
  const { isVisible: splashVisible } = useSplashScreen();
  const { isAdmin } = useAdminStatus();
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = React.useState('');
  const [profilePicture, setProfilePicture] = React.useState('');
  
  // Initialize with a default value to avoid hydration mismatch
  const [activeSection, setActiveSection] = React.useState('lobby');
  
  // Load from localStorage after mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('activeClashMarketSection');
      if (saved) {
        setActiveSection(saved);
      }
    }
  }, []);
  
  // Load username from Supabase or localStorage when wallet is connected
  React.useEffect(() => {
    if (connected && publicKey) {
      if (user && user.username) {
        // Prioritize username from Supabase
        setUsername(user.username);
      } else {
        // Fallback to localStorage
        const savedUsername = localStorage.getItem(`username-${publicKey}`);
        if (savedUsername) {
          setUsername(savedUsername);
        }
      }
      
      // Load profile picture from localStorage
      const savedProfilePicture = localStorage.getItem(`profilePicture-${publicKey}`);
      if (savedProfilePicture) {
        setProfilePicture(savedProfilePicture);
      }
    } else {
      setUsername('');
      setProfilePicture('');
    }
    
    // Listen for username update events from profile page
    const handleUsernameUpdate = (event: CustomEvent) => {
      const { publicKey: eventPublicKey, username: newUsername } = event.detail;
      if (connected && publicKey && eventPublicKey === publicKey) {
        setUsername(newUsername);
      }
    };
    
    // Listen for profile picture update events from profile page
    const handleProfilePictureUpdate = (event: CustomEvent) => {
      const { publicKey: eventPublicKey, profilePicture: newProfilePicture } = event.detail;
      if (connected && publicKey && eventPublicKey === publicKey) {
        setProfilePicture(newProfilePicture);
      }
    };
    
    // Add event listeners for updates
    window.addEventListener('usernameUpdated', handleUsernameUpdate as EventListener);
    window.addEventListener('profilePictureUpdated', handleProfilePictureUpdate as EventListener);
    
    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('usernameUpdated', handleUsernameUpdate as EventListener);
      window.removeEventListener('profilePictureUpdated', handleProfilePictureUpdate as EventListener);
    };
  }, [connected, publicKey, user]);
  
  // Dispatch custom event when notification dialog state changes
  const handleNotificationOpenChange = (open: boolean) => {
    setNotificationOpen(open);
    // Dispatch event to notify mobile navigation
    document.dispatchEvent(new CustomEvent('dialog-state-changed', { 
      detail: { open } 
    }));
  };
  
  // Don't render navigation when splash screen is visible
  if (splashVisible) return null;

  const scrollToSection = (sectionId: string) => {
    // Save to localStorage
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

  return (
    <nav className="fixed top-0 w-full bg-dark-bg/90 backdrop-blur-md border-b border-dark-border z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-20">
          <button 
            onClick={() => scrollToSection('lobby')} 
            className="flex items-center space-x-3 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <Image src="/images/Logo.png" alt="Clash Market Logo" width={60} height={60} />
            {/* <span className="font-bungee text-xl text-electric-purple">CLASH MARKET</span> */}
          </button>
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('lobby')}
              className={`transition-colors ${activeSection === 'lobby' && pathname === '/' ? 'text-electric-purple' : 'hover:text-electric-purple'}`}
            >
              Arena
            </button>
            <button 
              onClick={() => scrollToSection('game-modes')}
              className={`transition-colors ${activeSection === 'game-modes' ? 'text-warning-orange' : 'hover:text-warning-orange'}`}
            >
              Games
            </button>
            <button 
              onClick={() => scrollToSection('rules')}
              className={`transition-colors ${activeSection === 'rules' ? 'text-cyber-blue' : 'hover:text-cyber-blue'}`}
            >
              Rules
            </button>
            <button 
              onClick={() => scrollToSection('leaderboard')}
              className={`transition-colors ${activeSection === 'leaderboard' ? 'text-neon-cyan' : 'hover:text-neon-cyan'}`}
            >
              Leaderboard
            </button>
            {connected && isAdmin && (
              <Link 
                href="/admin"
                className={`transition-colors hover:text-warning-orange ${pathname.startsWith('/admin') ? 'text-warning-orange' : 'text-white'}`}
              >
                Admin
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {/* Notification Dialog - hidden on mobile */}
            <Dialog open={notificationOpen} onOpenChange={handleNotificationOpenChange}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-notification-trigger="true"
                  className={`hover:bg-dark-card/50 transition-colors p-2 group relative md:block hidden ${notificationOpen ? 'bg-dark-card/50' : ''}`}
                >
                  <Bell className={`h-7 w-7 transition-colors ${notificationOpen ? 'text-neon-cyan' : 'text-gray-400 group-hover:text-neon-cyan'}`} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-warning-orange text-dark-bg text-xs font-semibold rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-dark-card border-electric-purple/20">
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between text-white">
                    <span className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-electric-purple" />
                      Notifications
                    </span>
                    {notifications.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearNotifications}
                        className="text-gray-400 hover:text-white"
                      >
                        Clear All
                      </Button>
                    )}
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[400px] pr-4">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-4 rounded-lg border border-dark-border bg-dark-bg/50 hover:bg-dark-bg/80 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            {notification.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {notification.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                            {notification.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                            {notification.type === 'info' && <Info className="h-4 w-4 text-blue-500" />}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-white mb-1">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-400 mb-2">
                                {notification.description}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(() => {
                                  const now = new Date();
                                  const diff = now.getTime() - notification.timestamp.getTime();
                                  const minutes = Math.floor(diff / 60000);
                                  const hours = Math.floor(diff / 3600000);
                                  const days = Math.floor(diff / 86400000);
                                  if (days > 0) return `${days}d ago`;
                                  if (hours > 0) return `${hours}h ago`;
                                  if (minutes > 0) return `${minutes}m ago`;
                                  return 'Just now';
                                })()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </DialogContent>
            </Dialog>
            
            {/* Profile Icon - hidden on mobile */}
            <Link href="/profile" className="md:block hidden">
              <Button
                variant="ghost"
                size="icon"
                className={`transition-colors p-2 group ${pathname.startsWith('/profile') ? 'bg-dark-card/50' : 'hover:bg-dark-card/50'}`}
              >
                <div className="h-7 w-7 flex items-center justify-center overflow-hidden rounded-full">
                  {profilePicture && connected ? (
                    <img 
                      src={profilePicture} 
                      alt="Profile" 
                      className={`w-full h-full object-cover rounded-full transition-colors ring-1 ${pathname.startsWith('/profile') ? 'ring-electric-purple' : 'ring-electric-purple/30 group-hover:ring-electric-purple'}`} 
                    />
                  ) : (
                    <User className={`h-7 w-7 transition-colors ${pathname.startsWith('/profile') ? 'text-electric-purple' : 'text-gray-400 group-hover:text-electric-purple'}`} />
                  )}
                </div>
              </Button>
            </Link>
            
            {/* Admin button - only shown on mobile when connected and is admin */}
            {connected && isAdmin && (
              <Link href="/admin" className="md:hidden flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`hover:bg-dark-card/50 transition-colors p-2 group mr-2 ${pathname.startsWith('/admin') ? 'bg-dark-card/50' : ''}`}
                >
                  <ShieldCheck className={`h-5 w-5 transition-colors ${pathname.startsWith('/admin') ? 'text-warning-orange' : 'text-gray-400 group-hover:text-warning-orange'}`} />
                </Button>
              </Link>
            )}

            <WalletMultiButtonDynamic />
            {/*<Button
              onClick={connected ? disconnect : connect}
              disabled={connecting || loading}
              className={`gaming-button ${connected ? 'px-4 py-2 bg-gradient-to-r from-electric-purple to-cyber-blue hover:from-cyber-blue hover:to-electric-purple' : 'px-4 py-2'} rounded-lg font-semibold transition-all duration-300 hover:shadow-glow-sm`}
            >
              {(connecting || loading) ? (
                <>
                  <span className="mr-2 inline-block animate-spin">⟳</span>
                  Connecting...
                </>
              ) : connected ? (
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-dark-bg/40 flex items-center justify-center mr-2 ring-1 ring-electric-purple/30 overflow-hidden">
                    <Image 
                      src="/images/Phantom_SVG_Icon.svg" 
                      alt="Phantom Wallet" 
                      width={16} 
                      height={16} 
                    />
                  </div>
                  <span className="mr-1">{username || publicKey?.slice(0, 6) + '...'}</span>
                  <span className="text-xs bg-neon-cyan/20 text-neon-cyan py-0.5 px-1.5 rounded-md">Online</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="mr-2">
                    <Image 
                      src="/images/Phantom_SVG_Icon.svg" 
                      alt="Phantom Wallet" 
                      width={16} 
                      height={16} 
                    />
                  </div>
                  Connect Wallet
                </div>
              )}
            </Button>*/}
          </div>
        </div>
      </div>
    </nav>
  );
}
