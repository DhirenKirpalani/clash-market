"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, X, CheckCircle, AlertTriangle, Info } from "lucide-react";

// Import UI components with relative paths
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

// Define JSX.IntrinsicElements if needed
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info' | 'error';
  timestamp: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  clearNotifications: () => void;
  unreadCount: number;
  markAsViewed: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastViewedTimestamp, setLastViewedTimestamp] = useState<Date>(new Date());
  
  // Load notifications from localStorage on initial mount
  useEffect(() => {
    if (typeof window === 'undefined') return; // Guard for SSR
    
    try {
      // Load notifications
      const savedNotifications = localStorage.getItem('clash-market-notifications');
      if (savedNotifications) {
        const parsedNotifications = JSON.parse(savedNotifications).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp) // Convert string back to Date object
        }));
        setNotifications(parsedNotifications);
      }
      
      // Load last viewed timestamp
      const savedTimestamp = localStorage.getItem('clash-market-notifications-last-viewed');
      if (savedTimestamp) {
        setLastViewedTimestamp(new Date(savedTimestamp));
      }
    } catch (error) {
      console.error('Error loading notifications from localStorage:', error);
      // If there's an error, just use the default empty state
    }
  }, []);

  // Save notifications to localStorage whenever they change
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
    };
    
    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('clash-market-notifications', JSON.stringify(updatedNotifications));
      } catch (error) {
        console.error('Error saving notifications to localStorage:', error);
      }
    }
  }, [notifications]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    
    // Clear from localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('clash-market-notifications', JSON.stringify([]));
      } catch (error) {
        console.error('Error clearing notifications from localStorage:', error);
      }
    }
  }, []);

  const unreadCount = notifications.filter((n: Notification) => n.timestamp > lastViewedTimestamp).length;

  const markAsViewed = useCallback(() => {
    const now = new Date();
    setLastViewedTimestamp(now);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('clash-market-notifications-last-viewed', now.toISOString());
      } catch (error) {
        console.error('Error saving last viewed timestamp to localStorage:', error);
      }
    }
  }, []);

  const value: NotificationContextType = {
    notifications,
    addNotification,
    clearNotifications,
    unreadCount,
    markAsViewed,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

interface NotificationModalProps {
  onOpen: () => void;
}

export function NotificationModal({ onOpen }: NotificationModalProps) {
  const { notifications, clearNotifications, unreadCount, markAsViewed } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      onOpen();
      markAsViewed(); // Mark notifications as viewed when opened
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-dark-card/50 transition-colors"
        >
          <Bell className="h-5 w-5 text-gray-400 hover:text-electric-purple" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-electric-purple text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[350px] bg-dark-card border-electric-purple/20 fixed right-4 top-16 translate-x-0 translate-y-0 left-auto bottom-auto">
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
              {notifications.map((notification: Notification) => (
                <div
                  key={notification.id}
                  className="p-4 rounded-lg border border-dark-border bg-dark-bg/50 hover:bg-dark-bg/80 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {getIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-400 mb-2">
                        {notification.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTimestamp(notification.timestamp)}
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
  );
}
