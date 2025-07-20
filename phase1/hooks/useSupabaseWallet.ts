import { useState, useEffect, useRef } from 'react';
import { useWallet } from '../components/wallet-provider'; // Import from the consolidated wallet provider
import { connectWallet, getUserByWalletAddress, normalizeWalletAddress } from '@/lib/auth';

// Define the user interface
export interface SupabaseUser {
  id: string;
  wallet_address: string;
  username?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export function useSupabaseWallet() {
  const { publicKey, connected, connecting, connect, disconnect } = useWallet();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  
  // Use a ref to track if sync has already been done for this wallet address
  const syncedAddresses = useRef<Set<string>>(new Set());

  useEffect(() => {
    const syncUserWithSupabase = async () => {
      console.log('syncUserWithSupabase called', { connected, publicKey });
      
      if (connected && publicKey) {
        // Store the original wallet address format for Phantom wallets
        // This is critical since Phantom wallet addresses should not be normalized
        const walletAddress = publicKey;
        
        console.log('Using wallet address:', walletAddress);
        
        // Check if we've already synced this wallet address in this session
        if (syncedAddresses.current.has(walletAddress)) {
          console.log('Wallet already synced in this session, skipping duplicate sync:', walletAddress);
          return;
        }
        
        setLoading(true);
        try {
          console.log('Checking if user exists in Supabase with wallet address:', walletAddress);
          // Check if we already have this user in Supabase
          const userData = await getUserByWalletAddress(walletAddress);
          console.log('getUserByWalletAddress result:', userData);
          
          let userToSet;
          if (!userData) {
            console.log('User not found, creating new user with wallet address:', walletAddress);
            // Create/update user in Supabase
            const newUser = await connectWallet(walletAddress);
            console.log('New user created:', newUser);
            userToSet = newUser;
          } else {
            console.log('Existing user found:', userData);
            userToSet = userData;
          }
          
          // Mark this wallet address as synced
          syncedAddresses.current.add(walletAddress);
          
          // Set the user state
          setUser(userToSet);
        } catch (error) {
          console.error('Error syncing user with Supabase:', error);
        } finally {
          setLoading(false);
        }
      } else {
        console.log('Not connected or no publicKey, setting user to null');
        setUser(null);
        
        // Clear the synced addresses set when disconnecting
        syncedAddresses.current.clear();
      }
    };

    syncUserWithSupabase();
  }, [connected, publicKey]);

  const handleConnect = async () => {
    try {
      setLoading(true);
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      await disconnect();
      setUser(null);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,                // Supabase user object
    publicKey,           // Wallet public key
    connected,           // Is wallet connected
    connecting,          // Is wallet connecting
    loading,             // Is Supabase connection loading
    connect: handleConnect,
    disconnect: handleDisconnect,
  } as const; // Use const assertion to preserve literal types
}
