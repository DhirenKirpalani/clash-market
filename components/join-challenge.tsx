import React, { useState } from 'react';
import { useWallet } from './wallet-provider';
import { useNotifications } from './notification-modal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { UserPlus, Coins, Check, X, Shield } from 'lucide-react';

export function JoinChallenge() {
  const { connected, connecting, connect } = useWallet();
  const { addNotification } = useNotifications();
  const [username, setUsername] = useState('');
  const [joiningChallenge, setJoiningChallenge] = useState(false);

  const handleJoinChallenge = async () => {
    if (!connected) {
      addNotification({
        title: "Wallet Required",
        description: "Please connect your wallet first!",
        type: "warning",
      });
      return;
    }

    if (!username.trim()) {
      addNotification({
        title: "Username Required",
        description: "Please enter a username!",
        type: "warning",
      });
      return;
    }

    setJoiningChallenge(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      addNotification({
        title: "Challenge Joined!",
        description: "Entry fee paid successfully. Welcome to the arena!",
        type: "success",
      });
      
      setUsername('');
    } catch (error) {
      addNotification({
        title: "Payment Failed",
        description: "Failed to process entry fee. Please try again.",
        type: "error",
      });
    } finally {
      setJoiningChallenge(false);
    }
  };

  return (
    <section id="join" className="py-20 bg-gradient-to-b from-dark-bg to-dark-card">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-orbitron font-bold text-center mb-12 gradient-text-primary">
          Join the Battle
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="gaming-card glow-border rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-electric-purple flex items-center">
              <UserPlus className="mr-2" />
              Registration
            </h3>
            
            <div className="space-y-6">
              <div>
                <Label className="block text-sm font-semibold mb-2">Connect Wallet</Label>
                <Button
                  onClick={connect}
                  disabled={connected || connecting}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center ${
                    connected ? 'bg-green-600' : 'gaming-button'
                  }`}
                >
                  {connecting ? 'Connecting...' : connected ? 'Wallet Connected ✓' : 'Connect Phantom/Backpack'}
                </Button>
              </div>

              <div>
                <Label className="block text-sm font-semibold mb-2">Username</Label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your arena name..."
                  className="w-full bg-dark-bg border-dark-border focus:border-electric-purple"
                />
                <p className="text-xs text-gray-400 mt-1">Must be unique within the challenge</p>
              </div>

              <div>
                <Label className="block text-sm font-semibold mb-2">Select Challenge</Label>
                <Select defaultValue="weekend-warriors">
                  <SelectTrigger className="w-full bg-dark-bg border-dark-border focus:border-cyber-blue">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekend-warriors">Weekend Warriors - 10 USDC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-dark-bg border border-warning-orange/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Entry Fee:</span>
                  <span className="text-2xl font-bold text-warning-orange">10 USDC</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Paid via SPL transfer to escrow</p>
              </div>

              <Button
                onClick={handleJoinChallenge}
                disabled={!connected || joiningChallenge || !username.trim()}
                className="w-full gaming-button py-4 rounded-lg text-lg font-bold"
              >
                {joiningChallenge ? (
                  <>Processing Payment...</>
                ) : (
                  <>
                    <Coins className="mr-2 h-5 w-5" />
                    Pay & Join Challenge
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By joining, you agree to the challenge rules and escrow terms.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="gaming-card rounded-xl p-6">
              <h4 className="text-lg font-bold mb-4 text-electric-purple flex items-center">
                <Check className="mr-2" />
                Requirements
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Check className="text-neon-cyan mr-2 h-4 w-4" />
                  Active Drift account
                </li>
                <li className="flex items-center">
                  <Check className="text-neon-cyan mr-2 h-4 w-4" />
                  10 USDC for entry fee
                </li>
                <li className="flex items-center">
                  <Check className="text-neon-cyan mr-2 h-4 w-4" />
                  Solana wallet (Phantom/Backpack)
                </li>
                <li className="flex items-center">
                  <Check className="text-neon-cyan mr-2 h-4 w-4" />
                  Unique username
                </li>
              </ul>
            </div>

            <div className="gaming-card rounded-xl p-6">
              <h4 className="text-lg font-bold mb-4 text-warning-orange flex items-center">
                <Shield className="mr-2" />
                Prevention
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <X className="text-red-400 mr-2 h-4 w-4" />
                  No duplicate usernames
                </li>
                <li className="flex items-center">
                  <X className="text-red-400 mr-2 h-4 w-4" />
                  One entry per wallet
                </li>
                <li className="flex items-center">
                  <X className="text-red-400 mr-2 h-4 w-4" />
                  No late registration
                </li>
                <li className="flex items-center">
                  <X className="text-red-400 mr-2 h-4 w-4" />
                  No wallet switching
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
