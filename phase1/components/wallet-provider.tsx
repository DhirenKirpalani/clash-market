"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { WalletState } from '../types';
import { useNotifications } from './notification-modal';

const WalletContext = createContext<WalletState | null>(null);

// PhantomWallet types
type PhantomEvent = 'connect' | 'disconnect' | 'accountChanged';

interface PhantomProvider {
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, callback: () => void) => void;
  isPhantom: boolean;
}

// Helper to safely access window.solana
const getWindowSolana = () => {
  return (window as any).solana;
};

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
  
  // Track if wallet has been synced in this session
  const syncedAddresses = useRef<Set<string>>(new Set());
  
  // Helper to get the Phantom provider
  const getProvider = useCallback((): PhantomProvider | undefined => {
    const solana = getWindowSolana();
    if (solana && solana.isPhantom) {
      return solana as unknown as PhantomProvider;
    }
    return undefined;
  }, []);
  
  // Use useEffect to check for Phantom wallet and restore from localStorage
  useEffect(() => {
    const checkPhantomConnection = async () => {
      try {
        // Check if we have Phantom installed
        const provider = getProvider();
        
        // Restore from localStorage
        const storedAddress = localStorage.getItem('walletAddress');
        if (storedAddress) {
          console.log('Restored wallet connection from localStorage:', storedAddress);
          setPublicKey(storedAddress);
          setConnected(true);
        }
        
        // Setup wallet event listeners if provider exists
        if (provider) {
          provider.on('disconnect', () => {
            console.log('Phantom wallet disconnected via event');
            setPublicKey(null);
            setConnected(false);
            localStorage.removeItem('walletAddress');
            syncedAddresses.current.clear();
          });
          
          provider.on('accountChanged', () => {
            console.log('Phantom wallet account changed');
            window.location.reload();
          });
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    };

    checkPhantomConnection();
  }, [getProvider]);
  const { addNotification } = useNotifications();

  const connect = useCallback(async () => {
    setConnecting(true);
    
    try {
      const provider = getProvider();
      
      if (!provider) {
        console.log('Phantom wallet not detected');
        // Open Phantom installation page
        window.open('https://phantom.app/', '_blank');
        
        // For development/testing purposes - FALLBACK to a known address
        // REMOVE THIS IN PRODUCTION
        const devFallbackAddress = localStorage.getItem('dev_wallet_address') || 
          prompt('Phantom not detected. Enter wallet address for development:');
        
        if (devFallbackAddress) {
          console.log('Using development fallback address:', devFallbackAddress);
          localStorage.setItem('dev_wallet_address', devFallbackAddress);
          localStorage.setItem('walletAddress', devFallbackAddress);
          setPublicKey(devFallbackAddress);
          setConnected(true);
          
          addNotification({
            title: 'Development Mode',
            description: `Using wallet address ${devFallbackAddress.slice(0, 6)}...${devFallbackAddress.slice(-4)}`,
            type: 'info',
          });
          
          return;
        }
        
        addNotification({
          title: 'Wallet Error',
          description: 'Phantom wallet not found. Please install it first.',
          type: 'error',
        });
        
        throw new Error('Phantom wallet not found.');
      }
      
      console.log('Connecting to Phantom wallet...');
      const response = await provider.connect();
      const walletAddress = response.publicKey.toString();
      
      console.log('Connected to wallet with address:', walletAddress);
      
      // Store in localStorage
      localStorage.setItem('walletAddress', walletAddress);
      
      setPublicKey(walletAddress);
      setConnected(true);
      
      // Add to synced addresses
      syncedAddresses.current.add(walletAddress);
      
      // Show success notification
      addNotification({
        title: 'Wallet Connected',
        description: `Successfully connected to wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        type: 'success',
      });
    } catch (error) {
      console.error('Error connecting to Phantom wallet:', error);
      
      addNotification({
        title: 'Connection Error',
        description: 'Failed to connect to wallet. Please try again.',
        type: 'error',
      });
      
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [addNotification, getProvider]);  

  const disconnect = useCallback(async () => {
    try {
      const provider = getProvider();
      
      if (provider) {
        console.log('Disconnecting from Phantom wallet...');
        await provider.disconnect();
      }
      
      // Clear stored wallet info
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('dev_wallet_address');
      
      // Reset state
      setPublicKey(null);
      setConnected(false);
      
      // Clear synced addresses
      syncedAddresses.current.clear();
      
      // Show info notification
      addNotification({
        title: 'Wallet Disconnected',
        description: 'Your wallet has been disconnected',
        type: 'info',
      });
    } catch (error) {
      console.error('Error disconnecting from Phantom wallet:', error);
      
      addNotification({
        title: 'Disconnect Error',
        description: 'Failed to disconnect wallet properly.',
        type: 'error',
      });
    }
  }, [addNotification, getProvider]);

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
