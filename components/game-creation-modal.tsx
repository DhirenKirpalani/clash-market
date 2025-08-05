import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw, Zap, Trophy } from 'lucide-react';

interface GameCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameCode?: string | null;
}

export function GameCreationModal({ isOpen, onClose, gameCode }: GameCreationModalProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [phase, setPhase] = useState(1);
  const [phaseText, setPhaseText] = useState('Initializing game environment...');
  
  useEffect(() => {
    // Reset state when modal opens
    if (isOpen) {
      setProgress(0);
      setIsComplete(false);
      setPhase(1);
      setPhaseText('Initializing game environment...');
      
      // Set up progress interval (5 seconds total duration)
      const interval = setInterval(() => {
        setProgress(prevProgress => {
          const newProgress = prevProgress + 2; // Increment by 2% each time
          
          // Update phases based on progress
          if (newProgress >= 30 && newProgress < 31 && phase === 1) {
            setPhase(2);
            setPhaseText('Setting up virtual trading arena...');
          } else if (newProgress >= 60 && newProgress < 61 && phase === 2) {
            setPhase(3);
            setPhaseText('Preparing market simulation data...');
          } else if (newProgress >= 85 && newProgress < 86 && phase === 3) {
            setPhase(4);
            setPhaseText('Finalizing game configuration...');
          }
          
          // When we reach 100%, mark as complete and clear interval
          if (newProgress >= 100) {
            setIsComplete(true);
            setPhaseText('Game created successfully!');
            clearInterval(interval);
            
            // Animation is complete - user must click button to proceed
            
            return 100;
          }
          
          return newProgress;
        });
      }, 100); // Update every 100ms to complete in 5 seconds (50 steps * 100ms = 5000ms)
      
      // Clean up interval on unmount
      return () => clearInterval(interval);
    }
  }, [isOpen]);
  
  // Function to get the appropriate icon based on phase
  const getPhaseIcon = () => {
    switch(phase) {
      case 1:
        return <RefreshCw className="h-5 w-5 text-electric-purple animate-spin" />;
      case 2:
        return <Zap className="h-5 w-5 text-neon-cyan animate-pulse" />;
      case 3:
        return <RefreshCw className="h-5 w-5 text-neon-yellow animate-spin" />;
      case 4:
        return <Zap className="h-5 w-5 text-cyber-blue animate-pulse" />;
      default:
        return <Trophy className="h-5 w-5 text-neon-green" />;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-dark-bg border border-dark-border text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-neon-cyan font-orbitron flex items-center gap-2">
            <span className="inline-block">
              {getPhaseIcon()}
            </span>
            Creating Your PvP Game
          </DialogTitle>
          <DialogDescription>
            Powering up the trading arena for your next battle...
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {/* Progress bar with glow effect */}
          <div className="w-full bg-dark-card rounded-full h-4 mb-4 relative overflow-hidden">
            <div 
              className="h-4 bg-gradient-to-r from-electric-purple via-cyber-blue to-neon-cyan rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
            
            {/* Animated glow effect */}
            <div 
              className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-sweep"
              style={{ transform: `translateX(${progress}%)` }}
            ></div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-lg font-semibold text-neon-cyan">{progress}%</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="animate-pulse">{phaseText}</p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          {isComplete && (
            <Button 
              onClick={() => {
                onClose();
                if (gameCode) {
                  // Navigate to the game page
                  window.location.href = `/pvp/${gameCode}`;
                }
              }}
              className="w-full bg-gradient-to-r from-electric-purple to-cyber-blue hover:from-cyber-blue hover:to-electric-purple text-white font-semibold"
            >
              Enter Arena
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
