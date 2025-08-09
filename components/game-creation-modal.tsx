import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw, Zap, Trophy } from 'lucide-react';

interface GameCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameCode?: string | null;
  onJoinComplete?: () => void;
  isJoining?: boolean;
}

export function GameCreationModal({ isOpen, onClose, gameCode, onJoinComplete, isJoining = false }: GameCreationModalProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [phase, setPhase] = useState(1);
  const [phaseText, setPhaseText] = useState(isJoining ? 'Connecting to game session...' : 'Initializing game environment...');
  
  useEffect(() => {
    // Reset state when modal opens
    if (isOpen) {
      setProgress(0);
      setIsComplete(false);
      setPhase(1);
      setPhaseText(isJoining ? 'Connecting to game session...' : 'Initializing game environment...');
      
      // Set up progress interval (5 seconds total duration)
      const interval = setInterval(() => {
        setProgress(prevProgress => {
          const newProgress = prevProgress + 2; // Increment by 2% each time
          
          // Update phases based on progress
          if (newProgress >= 30 && prevProgress < 30) {
            setPhase(2);
            setPhaseText(isJoining ? 'Validating game environment...' : 'Creating game session...');
          } else if (newProgress >= 60 && prevProgress < 60) {
            setPhase(3);
            setPhaseText(isJoining ? 'Joining trading arena...' : 'Setting up trading environment...');
          } else if (newProgress >= 85 && prevProgress < 85) {
            setPhase(4);
            setPhaseText(isJoining ? 'Preparing game interface...' : 'Finalizing...');
          }
          
          // When we reach 100%, mark as complete
          if (newProgress >= 100) {
            setIsComplete(true);
            setPhaseText(isJoining ? 'Game joined successfully!' : 'Game created successfully!');
            clearInterval(interval);
            
            // If this is a join operation and onJoinComplete callback is provided, call it
            if (isJoining && onJoinComplete) {
              onJoinComplete();
            }
            
            return 100;
          }
          
          return newProgress;
        });
      }, 100);
      
      // Clean up interval on unmount
      return () => clearInterval(interval);
    }
  }, [isOpen, isJoining, onJoinComplete]);
  
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
            {isJoining ? 'Joining PvP Game' : 'Creating Your PvP Game'}
          </DialogTitle>
          <DialogDescription>
            {isJoining ? 'Connecting to the trading arena battle...' : 'Powering up the trading arena for your next battle...'}
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
                // For join flows, onJoinComplete has already been called when progress reached 100%
                // So we just need to close the modal here, the redirect will happen in completeJoinGame
                onClose();
              }}
              className="w-full bg-gradient-to-r from-electric-purple to-cyber-blue hover:from-cyber-blue hover:to-electric-purple text-white font-semibold"
            >
              {isJoining ? 'Continue' : 'Enter Arena'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
