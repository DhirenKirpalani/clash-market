"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { WalletState } from '../types';
import { useNotifications } from './notification-modal';

const WalletContext = createContext<WalletState | null>(null);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  
  // Use useEffect to access localStorage after hydration
  useEffect(() => {
    // Now it's safe to access localStorage
    const storedConnected = localStorage.getItem('walletConnected') === 'true';
    const storedPublicKey = localStorage.getItem('walletPublicKey');
    
    if (storedConnected) {
      setConnected(storedConnected);
    }
    
    if (storedPublicKey) {
      setPublicKey(storedPublicKey);
    }
  }, []);
  const { addNotification } = useNotifications();

  const connect = useCallback(async () => {
    setConnecting(true);
    
    // Simulate wallet connection with a Promise
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const mockAddress = '8ZUn9G36BMSRojNW7wtneL5YEQBKzz4hTzWqRwUYJ9Jj';
        setPublicKey(mockAddress);
        setConnected(true);
        setConnecting(false);
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('walletPublicKey', mockAddress);
          localStorage.setItem('walletConnected', 'true');
        }
        
        // Show success notification
        addNotification({
          title: 'Wallet Connected',
          description: `Successfully connected to wallet ${mockAddress.slice(0, 6)}...${mockAddress.slice(-4)}`,
          type: 'success',
        });
        
        resolve();
      }, 1000);
    });
  }, [addNotification]);

  const disconnect = useCallback(() => {
    setPublicKey(null);
    setConnected(false);
    
    // Clear from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('walletPublicKey');
      localStorage.removeItem('walletConnected');
    }
    
    // Show info notification
    addNotification({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected',
      type: 'info',
    });
  }, [addNotification]);

  const value: WalletState = {
    connected,
    connecting,
    publicKey,
    connect,
    disconnect,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}
