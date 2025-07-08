import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { walletAdapter } from '@/lib/walletAdapter';  // Adjust path
import { useToast } from '@/hooks/use-toast';  // Adjust path

// Types
type UserProfile = {
  username: string;
  avatar?: string;
};

type WalletBalances = {
  sol: number;
  arena: number;
};

type WalletContextType = {
  connected: boolean;
  address: string;
  balances: WalletBalances;
  userProfile: UserProfile | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<Uint8Array>;
};

// Create context
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Provider component
export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [connected, setConnected] = useState(walletAdapter.connected);
  const [address, setAddress] = useState(walletAdapter.address || '');
  const [balances, setBalances] = useState<WalletBalances>({ sol: 0, arena: 0 });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { toast } = useToast();

  // Fetch balances
  const fetchBalances = useCallback(async () => {
    try {
      const balance = await walletAdapter.getBalance();
      setBalances(balance);
    } catch (error) {
      console.error('Failed to fetch balances:', error);
    }
  }, []);

  // Load user profile from localStorage if available
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }

    // Try to reconnect the wallet if the address is stored
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress && !connected) {
      walletAdapter.connect().then(() => {
        setConnected(true);
        setAddress(savedAddress);
        fetchBalances();
      }).catch(() => {
        localStorage.removeItem('walletAddress');
      });
    } else if (walletAdapter.connected) {
      setConnected(true);
      setAddress(walletAdapter.address || '');
      fetchBalances();
    }
  }, [connected, fetchBalances]);

  // Connect wallet
  const connect = useCallback(async () => {
    try {
      const publicKey = await walletAdapter.connect();
      setConnected(true);
      setAddress(publicKey || '');
      localStorage.setItem('walletAddress', publicKey || '');
      
      await fetchBalances();

      // Fetch or create a user profile and store it in localStorage
      const profile = { username: 'User' + Math.floor(Math.random() * 1000) };
      setUserProfile(profile);
      localStorage.setItem('userProfile', JSON.stringify(profile));

      toast({
        title: 'Wallet Connected',
        description: 'Your Phantom wallet has been connected successfully',
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect to wallet',
        variant: 'destructive',
      });
      throw error;
    }
  }, [fetchBalances, toast]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      await walletAdapter.disconnect();
      setConnected(false);
      setAddress('');
      setUserProfile(null);
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('userProfile');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      toast({
        title: 'Disconnection Failed',
        description: error instanceof Error ? error.message : 'Failed to disconnect wallet',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  // Sign message
  const signMessage = useCallback(async (message: string): Promise<Uint8Array> => {
    if (!connected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      return await walletAdapter.signMessage(message);
    } catch (error) {
      console.error('Failed to sign message:', error);
      toast({
        title: 'Signing Failed',
        description: error instanceof Error ? error.message : 'Failed to sign message',
        variant: 'destructive',
      });
      throw error;
    }
  }, [connected, toast]);

  const value = {
    connected,
    address,
    balances,
    userProfile,
    connect,
    disconnect,
    signMessage,
  };

  return React.createElement(WalletContext.Provider, { value }, children);
};

// Hook to use wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
