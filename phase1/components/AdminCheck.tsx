"use client";

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useWallet } from './wallet-provider';

export function AdminCheck({ children }: { children: React.ReactNode }) {
  const { publicKey, connected } = useWallet();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkAdmin = async () => {
      if (!connected || !publicKey) {
        console.log('AdminCheck: Not connected or no publicKey');
        setIsAdmin(false);
        return;
      }
      
      try {
        console.log('AdminCheck: Checking wallet address:', publicKey);
        const response = await fetch('/api/check-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet: publicKey })
        });
        
        if (!response.ok) throw new Error('Failed to verify admin status');
        const { isAdmin } = await response.json();
        console.log('AdminCheck: Admin status response:', isAdmin);
        setIsAdmin(isAdmin);
      } catch (error) {
        console.error('Admin verification error:', error);
        setIsAdmin(false);
      }
    };
    
    checkAdmin();
  }, [publicKey, connected]);
  
  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-neon-cyan" />
      </div>
    );
  }
  
  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4 text-electric-purple">Admin Access Required</h1>
        <p className="text-gray-400 mb-6">Please connect your wallet to continue</p>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4 text-red-500">Access Denied</h1>
        <p className="text-gray-400 mb-2">This wallet does not have admin privileges</p>
        {publicKey && (
          <p className="text-gray-500 text-sm">
            Wallet: {publicKey.slice(0, 6)}...{publicKey.slice(-4)}
          </p>
        )}
      </div>
    );
  }
  
  return <>{children}</>;
}
