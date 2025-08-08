"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FloatingCoins } from './floating-coins';
import { Button } from './ui/button';
import { Sword, Wallet } from 'lucide-react';
import { useWallet } from './wallet-provider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from './ui/dialog';

export function HeroSection() {
  const router = useRouter();
  const { connect, connected, connecting } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleArenaButtonClick = () => {
    if (connected) {
      router.push('/games');
    } else {
      setIsModalOpen(true);
    }
  };

  const handleConnectWallet = async () => {
    await connect();
    setIsModalOpen(false);
    // Navigate to games page after successful connection
    router.push('/games');
  };

  return (
    <section id="lobby" className="min-h-screen flex items-center justify-center relative overflow-hidden hero-bg pt-32 md:pt-24">
      {/* <FloatingCoins /> */}
      
      <div className="relative z-10 text-center max-w-6xl mx-auto px-4 animate-slide-in">
        {/* Replace text heading with logo */}
        <div className="flex justify-center mb-6 mt-8 md:mt-12">
          <img 
            src="/images/Logo.png" 
            alt="Clash Market Logo" 
            className="h-48 md:h-64 lg:h-80 mix-blend-screen" 
          />
        </div>
        <p className="text-xl md:text-2xl mb-8 text-gray-300 font-inter">
          Stake your skills. Trade to the top. Win the pot.
        </p>


        <Button 
          onClick={handleArenaButtonClick}
          className="gaming-button px-12 py-4 rounded-lg text-xl font-bold mb-12"
        >
          <Sword className="mr-2 h-5 w-5" />
          Enter the Arena
        </Button>
        
        {/* Wallet Connection Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-[90vw] w-full sm:max-w-[375px] bg-dark-card border-electric-purple/20 p-4 sm:p-6">
            <DialogHeader className="space-y-2 pb-2">
              <DialogTitle className="text-lg sm:text-xl text-electric-purple flex items-center">
                <Wallet className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Connect Your Wallet
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-400">
                You need to connect your wallet to access the gaming arena.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-3 sm:py-4 space-y-3 sm:space-y-4">
              <p className="text-xs sm:text-sm">Connect with your Phantom wallet:</p>
              <div className="space-y-2">
                <Button
                  onClick={handleConnectWallet}
                  disabled={connecting}
                  className="w-full py-2 sm:py-3 gaming-button rounded-lg font-semibold transition-all duration-300 flex items-center justify-center text-sm"
                >
                  {connecting ? 'Connecting...' : 'Connect Phantom'}
                </Button>
              </div>
            </div>
            
            <DialogFooter className="flex-col gap-2 pt-1 sm:pt-2">
              <Button
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                className="w-full border border-gray-700 hover:bg-dark-bg text-sm"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
