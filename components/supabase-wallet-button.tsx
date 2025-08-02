'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useSupabaseWallet } from '@/hooks/useSupabaseWallet';
import { Loader2 } from 'lucide-react';

export default function SupabaseWalletButton() {
  const { connect, disconnect, connected, connecting, loading, publicKey, user } = useSupabaseWallet();
  const router = useRouter();
  
  const handleConnect = async () => {
    if (connected) {
      await disconnect();
    } else {
      await connect();
    }
    router.refresh();
  };
  
  return (
    <Button
      onClick={handleConnect}
      disabled={connecting || loading}
      className="gaming-button px-4 py-2 rounded-lg font-semibold"
      variant={connected ? "secondary" : "default"}
    >
      {connecting || loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : connected ? (
        `${publicKey?.slice(0, 4)}...${publicKey?.slice(-4)}`
      ) : (
        'Connect Wallet'
      )}
    </Button>
  );
}
