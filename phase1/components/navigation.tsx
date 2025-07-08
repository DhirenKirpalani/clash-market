"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useWallet } from './wallet-provider';
import { useNotifications } from './notification-modal';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Bell, CheckCircle, AlertTriangle, Info, User } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import Image from 'next/image';
import { useSplashScreen } from './splash-screen';

export function Navigation() {
  const { connected, connecting, publicKey, connect, disconnect } = useWallet();
  const { notifications, clearNotifications, unreadCount } = useNotifications();
  const [notificationOpen, setNotificationOpen] = React.useState(false);
  const { isVisible: splashVisible } = useSplashScreen();
  const router = useRouter();
  
  // Initialize with a default value to avoid hydration mismatch
  const [activeSection, setActiveSection] = React.useState('lobby');
  
  // Load from localStorage after mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('activeLiqifySection');
      if (saved) {
        setActiveSection(saved);
      }
    }
  }, []);
  
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

  return (
    <nav className="fixed top-0 w-full bg-dark-bg/90 backdrop-blur-md border-b border-dark-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button 
            onClick={() => scrollToSection('lobby')} 
            className="flex items-center space-x-3 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <Image src="/images/Logo.png" alt="Liqify Logo" width={32} height={32} />
            <span className="font-bungee text-xl text-electric-purple">LIQIFY</span>
          </button>
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('lobby')}
              className={`transition-colors ${activeSection === 'lobby' ? 'text-electric-purple' : 'hover:text-electric-purple'}`}
            >
              Arena
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
                className="hover:bg-dark-card/50 transition-colors p-2 group"
              >
                <User className="h-7 w-7 text-gray-400 transition-colors group-hover:text-electric-purple" />
              </Button>
            </Link>
            
            <Button
              onClick={connected ? disconnect : connect}
              disabled={connecting}
              className="gaming-button px-4 py-2 rounded-lg font-semibold"
            >
              {connecting ? 'Connecting...' : connected ? `${publicKey?.slice(0, 6)}...${publicKey?.slice(-4)}` : 'Connect Wallet'}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
