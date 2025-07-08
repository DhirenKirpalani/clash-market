import React from 'react';
import { CountdownTimer } from './countdown-timer';
import { FloatingCoins } from './floating-coins';
import { Button } from './ui/button';
import { Sword } from 'lucide-react';

export function HeroSection() {
  const targetDate = new Date('2024-07-06T10:00:00Z');
  
  const scrollToJoin = () => {
    const element = document.getElementById('join');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="lobby" className="min-h-screen flex items-center justify-center relative overflow-hidden hero-bg pt-32 md:pt-24">
      <FloatingCoins />
      
      <div className="relative z-10 text-center max-w-6xl mx-auto px-4 animate-slide-in">
        <h1 className="font-orbitron font-black text-5xl md:text-7xl lg:text-8xl mb-6 gradient-text-primary animate-glow-pulse">
          ENTER THE ARENA OF ALPHA
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-300 font-inter">
          Stake your skills. Trade to the top. Win the pot.
        </p>
        
        <div className="mb-12">
          <h3 className="text-lg font-semibold mb-4 text-electric-purple">Challenge Starts In:</h3>
          <CountdownTimer targetDate={targetDate} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-3xl mx-auto">
          <div className="text-center p-4">
            <div className="text-3xl font-orbitron font-bold text-neon-cyan mb-2 drop-shadow-lg">23</div>
            <div className="text-gray-300 font-medium">Players Joined</div>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-orbitron font-bold text-electric-purple mb-2 drop-shadow-lg">230 USDC</div>
            <div className="text-gray-300 font-medium">Total Pool</div>
          </div>
          <div className="text-center p-4">
            <div className="text-lg font-semibold text-cyber-blue mb-2 drop-shadow-lg">Starts July 6</div>
            <div className="text-gray-300 font-medium">10:00 AM UTC</div>
          </div>
        </div>

        <Button 
          onClick={scrollToJoin}
          className="gaming-button px-12 py-4 rounded-lg text-xl font-bold animate-float mb-12"
        >
          <Sword className="mr-2 h-5 w-5" />
          Join the Challenge
        </Button>
      </div>
    </section>
  );
}
