import { useState, useEffect } from 'react';
import { useWallet } from '../components/wallet-provider';

export function useAdminStatus() {
  const { connected, publicKey } = useWallet();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!connected || !publicKey) {
        console.log('Admin check: Not connected or no publicKey');
        setIsAdmin(false);
        return;
      }

      try {
        console.log('Admin check: Checking wallet address:', publicKey);
        setLoading(true);
        
        // Make sure the wallet address is exactly as expected
        const walletAddress = publicKey.trim();
        console.log('Admin check: Using normalized wallet address:', walletAddress);
        
        const response = await fetch('/api/check-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ wallet: walletAddress }),
        });

        const data = await response.json();
        console.log('Admin check API response:', data);
        setIsAdmin(data.isAdmin);
        
        // If not admin, log the expected admin wallet for comparison
        if (!data.isAdmin) {
          console.log('Admin check failed. Make sure the wallet address matches the ADMIN_WALLETS array in the API route.');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [connected, publicKey]);

  return { isAdmin, loading };
}
