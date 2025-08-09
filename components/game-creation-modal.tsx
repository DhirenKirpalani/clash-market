import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw, Zap, Trophy } from 'lucide-react';

interface GameCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameCode?: string | null;
  onJoinComplete?: () => void;
  isJoining?: boolean;
  // Adding joiningId for access in the modal
  joiningId?: string | null;
}

export function GameCreationModal({ isOpen, onClose, gameCode, onJoinComplete, isJoining = false, joiningId }: GameCreationModalProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(0); // Keep for phase tracking
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
            setPhaseText(isJoining ? 'Ready to enter arena!' : 'Game created successfully!');
            clearInterval(interval);
            
            // No longer automatically call onJoinComplete - will be called on button click instead
            return 100;
          }
          
          return newProgress;
        });
      }, 100);
      
      // Clean up interval on unmount
      return () => clearInterval(interval);
    }
  }, [isOpen, isJoining]);
  
  // Function to get the appropriate icon based on phase
  const getPhaseIcon = () => {
    switch(phase) {
      case 1:
        return <RefreshCw className="h-8 w-8 text-electric-purple animate-spin" />;
      case 2:
        return <Zap className="h-8 w-8 text-neon-cyan animate-pulse" />;
      case 3:
        return <RefreshCw className="h-8 w-8 text-neon-yellow animate-spin" />;
      case 4:
        return <Zap className="h-8 w-8 text-cyber-blue animate-pulse" />;
      default:
        return <Trophy className="h-8 w-8 text-neon-green" />;
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
          {/* Spinner with phase indication */}
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="relative">
              {/* Outer spinner ring */}
              <div className="w-24 h-24 rounded-full border-4 border-dark-card animate-spin-slow"></div>
              
              {/* Inner spinner with gradient */}
              <div className="absolute top-0 left-0 w-24 h-24 rounded-full border-t-4 border-electric-purple animate-spin"></div>
              
              {/* Phase icon in center */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-dark-bg rounded-full p-2">
                {getPhaseIcon()}
              </div>
            </div>
          
            <div className="text-center">
              <div className="text-sm text-muted-foreground">
                <p className="animate-pulse">{phaseText}</p>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          {isComplete && (
            <Button 
              onClick={() => {
                // For both join and create flows, redirect to the PVP game page when button is clicked
                // If this is a join flow, call onJoinComplete to perform the actual join operation
                if (isJoining && onJoinComplete) {
                  onJoinComplete();
                }
                
                if (gameCode) {
                  router.push(`/pvp/${gameCode}`);
                }
                onClose();
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
