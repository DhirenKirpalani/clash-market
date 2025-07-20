"use client";

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { MobileNavigation } from '@/components/mobile-navigation';
import { useSupabaseWallet } from '@/hooks/useSupabaseWallet';
import { updateUserProfile, updateUserProfileByWallet } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { User, Wallet, Trophy, TrendingUp, Calendar, Shield, Edit2, Copy, Check } from 'lucide-react';
import { generateUsername } from '../../utils/generateUsername';
import Image from 'next/image';

export default function Profile() {
  const { connected, publicKey, connect, user } = useSupabaseWallet();
  const { toast } = useToast();
  const [isMobile, setIsMobile] = useState(false);
  const [username, setUsername] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [profilePicture, setProfilePicture] = useState('');
  const [isEditingProfilePicture, setIsEditingProfilePicture] = useState(false);
  
  useEffect(() => {
    // Check if window is defined (browser environment)
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 640);
      };
      
      // Set initial value
      handleResize();
      
      // Add event listener
      window.addEventListener('resize', handleResize);
      
      // Cleanup
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);
  
  useEffect(() => {
    // Load username from Supabase user or localStorage when wallet is connected
    if (connected && publicKey) {
      let usernameFound = false;
      
      if (user && user.username) {
        // Prioritize username from Supabase
        console.log('Using username from Supabase:', user.username);
        setUsername(user.username);
        usernameFound = true;
      } else {
        // Fallback to localStorage
        const savedUsername = localStorage.getItem(`username-${publicKey}`);
        if (savedUsername) {
          console.log('Using username from localStorage:', savedUsername);
          setUsername(savedUsername);
          usernameFound = true;
        }
      }
      
      // Generate random username if no username was found
      if (!usernameFound) {
        const randomUsername = generateUsername(publicKey);
        console.log('Generated random username:', randomUsername);
        setUsername(randomUsername);
        
        // Save to localStorage
        localStorage.setItem(`username-${publicKey}`, randomUsername);
        
        // Save to Supabase
        if (publicKey) {
          try {
            updateUserProfileByWallet(publicKey, { username: randomUsername });
            console.log('Random username saved to Supabase');
          } catch (error) {
            console.error('Error saving random username to Supabase:', error);
          }
        }
      }
      
      // Load profile picture from localStorage
      const savedProfilePicture = localStorage.getItem(`profilePicture-${publicKey}`);
      if (savedProfilePicture) {
        console.log('Loading profile picture from localStorage');
        setProfilePicture(savedProfilePicture);
      }
    }
  }, [connected, publicKey, user]);
  
  
  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !publicKey) return;
    
    // Check file type and size
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    
    if (file.size > 1024 * 1024 * 2) { // 2MB limit
      alert('Image size should be less than 2MB');
      return;
    }
    
    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64 && publicKey) {
        // Save to localStorage
        localStorage.setItem(`profilePicture-${publicKey}`, base64);
        setProfilePicture(base64);
        
        // Dispatch custom event for real-time updates in navbar
        const profilePictureEvent = new CustomEvent('profilePictureUpdated', {
          detail: {
            publicKey: publicKey,
            profilePicture: base64
          }
        });
        window.dispatchEvent(profilePictureEvent);
      }
    };
    reader.readAsDataURL(file);
    setIsEditingProfilePicture(false);
  };
  
  const handleRemoveProfilePicture = () => {
    if (!publicKey) return;
    
    // Remove from localStorage
    localStorage.removeItem(`profilePicture-${publicKey}`);
    setProfilePicture('');
    
    // Dispatch custom event for real-time updates in navbar
    const profilePictureEvent = new CustomEvent('profilePictureUpdated', {
      detail: {
        publicKey: publicKey,
        profilePicture: ''
      }
    });
    window.dispatchEvent(profilePictureEvent);
    
    setIsEditingProfilePicture(false);
  };

  const saveUsername = async () => {
    if (connected && publicKey) {
      let finalUsername = username.trim();
      
      // Generate random username if field is empty
      if (!finalUsername) {
        finalUsername = generateUsername(publicKey);
        setUsername(finalUsername);
        
        toast({
          title: "Username Reset",
          description: "Empty username detected. A new random username has been generated.",
          variant: "default",
        });
      }
      
      // Save to localStorage for immediate UI update
      localStorage.setItem(`username-${publicKey}`, finalUsername);
      
      // Dispatch custom event for real-time updates in other components
      const usernameUpdateEvent = new CustomEvent('usernameUpdated', {
        detail: {
          publicKey: publicKey,
          username: finalUsername
        }
      });
      window.dispatchEvent(usernameUpdateEvent);
      
      // Save to Supabase
      if (publicKey) {
        try {
          console.log('Updating username in Supabase by wallet address:', finalUsername);
          // Try updating by wallet address instead of user ID
          await updateUserProfileByWallet(publicKey, { username: finalUsername });
          console.log('Username updated successfully by wallet address');
          
          // Show success toast
          toast({
            title: "Username Updated",
            description: "Your username has been saved to the database.",
            variant: "default",
          });
        } catch (error) {
          console.error('Error updating username in Supabase:', error);
          
          // Try the original method as fallback
          if (user && user.id) {
            try {
              console.log('Trying fallback: Update by user ID');
              await updateUserProfile(user.id, { username: finalUsername });
              console.log('Username updated successfully by user ID');
              
              toast({
                title: "Username Updated",
                description: "Your username has been saved to the database.",
                variant: "default",
              });
            } catch (fallbackError) {
              console.error('Fallback update also failed:', fallbackError);
              
              toast({
                title: "Update Failed",
                description: "Could not save your username to the database.",
                variant: "destructive",
              });
            }
          } else {
            // Show error toast if both methods fail
            toast({
              title: "Update Failed",
              description: "Could not save your username to the database.",
              variant: "destructive",
            });
          }
        }
      } else {
        console.error('Cannot update username: User not found in Supabase');
        
        // Show error toast for missing user
        toast({
          title: "Update Failed",
          description: "User record not found in database. Try reconnecting your wallet.",
          variant: "destructive",
        });
      }
      
      setIsEditingUsername(false);
    }
  };
  
  const copyWalletAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-dark-bg text-white bg-[url('/images/bg-grid.png')] bg-fixed">
        <div className="absolute inset-0 bg-gradient-to-b from-electric-purple/10 to-cyber-blue/5 pointer-events-none"></div>
        <Navigation />

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 mt-24 relative z-10">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-electric-purple/10 rounded-full filter blur-3xl -z-10 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyber-blue/10 rounded-full filter blur-3xl -z-10 animate-pulse"></div>
          
          {/* If wallet not connected */}
          {!connected ? (
            <div className="flex flex-col items-center justify-center py-16 backdrop-blur-sm bg-dark-bg/30 rounded-xl border border-dark-border/40 gaming-card shadow-glow transition-all duration-500">
              <div className="rounded-full bg-dark-card/80 p-8 mb-8 ring-4 ring-electric-purple/20 shadow-glow-sm">
                <User className="w-16 h-16 text-electric-purple animate-pulse" />
              </div>
              <h1 className="text-3xl font-orbitron font-bold mb-4 gradient-text-primary">Profile Locked</h1>
              <p className="text-gray-300 mb-8 text-center max-w-md text-lg">
                Connect your wallet to unlock your gaming profile, track your battle history, and claim your rewards.
              </p>
              <Button onClick={connect} className="gaming-button px-8 py-4 text-lg shadow-glow-sm transition-all duration-300 hover:scale-105 hover:shadow-glow">
                <Wallet className="mr-2 h-5 w-5" /> Connect Wallet
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 backdrop-blur-sm bg-dark-bg/30 rounded-xl border border-dark-border/40 gaming-card shadow-glow transition-all duration-500">
              <div className="rounded-full bg-dark-card/80 p-8 mb-8 ring-4 ring-electric-purple/20 shadow-glow-sm">
                <User className="w-16 h-16 text-electric-purple animate-pulse" />
              </div>
              <h1 className="text-3xl font-orbitron font-bold mb-4 gradient-text-primary">Profile Locked</h1>
              <p className="text-gray-300 mb-8 text-center max-w-md text-lg">
                Connect your wallet to unlock your gaming profile, track your battle history, and claim your rewards.
              </p>
              <Button onClick={connect} className="gaming-button px-8 py-4 text-lg shadow-glow-sm transition-all duration-300 hover:scale-105 hover:shadow-glow">
                <Wallet className="mr-2 h-5 w-5" /> Connect Wallet
              </Button>
            </div>
          )}
        </section>

        <MobileNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white bg-[url('/images/bg-grid.png')] bg-fixed">
      <div className="absolute inset-0 bg-gradient-to-b from-electric-purple/10 to-cyber-blue/5 pointer-events-none"></div>
      <Navigation />
      
      {/* Decorative elements */}
      <div className="fixed top-40 right-10 w-80 h-80 bg-electric-purple/5 rounded-full filter blur-3xl -z-10 animate-pulse"></div>
      <div className="fixed bottom-20 left-10 w-80 h-80 bg-cyber-blue/5 rounded-full filter blur-3xl -z-10 animate-pulse"></div>
      
      {/* Profile Header */}
      <section className="pt-24 md:pt-16 pb-8 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-6 mb-8 gaming-card p-6 rounded-xl backdrop-blur-sm bg-dark-bg/40 border border-dark-border/40 shadow-glow-sm transition-all duration-300 hover:shadow-glow">
            <div className="relative group w-24 h-24 mb-4 sm:mb-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-electric-purple to-cyber-blue flex items-center justify-center ring-4 ring-white/10 shadow-glow-sm transform hover:scale-105 transition-all duration-300 overflow-hidden">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-white" />
                )}
              </div>
              
              {/* Edit overlay */}
              <div className="absolute inset-0 rounded-full bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <input 
                  type="file" 
                  id="profile-picture-input" 
                  accept="image/*"
                  className="hidden" 
                  onChange={handleProfilePictureUpload}
                />
                <label 
                  htmlFor="profile-picture-input"
                  className="cursor-pointer text-xs text-white bg-electric-purple/60 hover:bg-electric-purple px-2 py-1 rounded mb-1 w-16 text-center"
                >
                  Upload
                </label>
                {profilePicture && (
                  <button 
                    onClick={handleRemoveProfilePicture}
                    className="cursor-pointer text-xs text-white bg-red-500/60 hover:bg-red-500 px-2 py-1 rounded w-16 text-center"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            <div className="max-w-full">
              {isEditingUsername ? (
                <div className="flex items-center mb-2 gap-2 animate-fadeIn">
                  <Input 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="max-w-xs bg-dark-bg/80 border-cyber-blue/30 focus:border-cyber-blue focus:ring-2 focus:ring-cyber-blue/20 transition-all duration-300"
                  />
                  <Button 
                    onClick={() => {
                      saveUsername();
                      setIsEditingUsername(false);
                    }}
                    className="text-white bg-cyber-blue hover:bg-cyber-blue/80 hover:scale-105 transition-all duration-300 shadow-glow-sm"
                  >
                    <Check className="h-4 w-4 mr-1" /> Save
                  </Button>
                  <Button 
                    onClick={() => setIsEditingUsername(false)}
                    variant="outline"
                    className="border-dark-border text-gray-400 hover:bg-dark-card/50 transition-all duration-300"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center mb-1">
                  <h1 className="text-3xl font-bold gradient-text-primary">
                    {username ? username : 'Trader'}
                  </h1>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsEditingUsername(true)}
                    className="ml-2 text-gray-400 hover:text-white"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="flex items-center">
                <p className="text-gray-400 text-sm">
                  <span className="inline-block">Wallet:</span>
                  <span className="inline-block ml-1 font-mono">
                    {typeof publicKey === 'string' ? 
                      `${publicKey.substring(0, 6)}...${publicKey.substring(publicKey.length - 4)}` : 
                      'Not connected'}
                  </span>
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={copyWalletAddress}
                  className="ml-1 text-gray-400 hover:text-white p-1 h-auto"
                >
                  {copiedToClipboard ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Stats */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="gaming-card nft-card border-electric-purple/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-400">
                  <Trophy className="h-4 w-4" />
                  Competitions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-electric-purple">12</div>
                <p className="text-xs text-gray-500">Total Joined</p>
              </CardContent>
            </Card>

            <Card className="gaming-card nft-card border-cyber-blue/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-400">
                  <TrendingUp className="h-4 w-4" />
                  Win Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyber-blue">67%</div>
                <p className="text-xs text-gray-500">8 of 12 wins</p>
              </CardContent>
            </Card>

            <Card className="gaming-card nft-card border-neon-cyan/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-400">
                  <Shield className="h-4 w-4" />
                  Total Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-neon-cyan">342 USDC</div>
                <p className="text-xs text-gray-500">Net profit</p>
              </CardContent>
            </Card>

            <Card className="gaming-card nft-card border-warning-orange/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-400">
                  <Calendar className="h-4 w-4" />
                  Member Since
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning-orange">Jun 2024</div>
                <p className="text-xs text-gray-500">7 months ago</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Competitions */}
          <Card className="gaming-card nft-card">
            <CardHeader>
              <CardTitle className="gradient-text-primary">Recent Competitions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-dark-bg/50">
                  <div>
                    <h4 className="font-semibold text-white">Weekly Alpha Challenge #47</h4>
                    <p className="text-sm text-gray-400">Completed Dec 28, 2024</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">1st Place</Badge>
                    <p className="text-sm text-green-400 mt-1">+45 USDC</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-dark-bg/50">
                  <div>
                    <h4 className="font-semibold text-white">Daily Grind Challenge #12</h4>
                    <p className="text-sm text-gray-400">Completed Dec 25, 2024</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">3rd Place</Badge>
                    <p className="text-sm text-blue-400 mt-1">+12 USDC</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-dark-bg/50">
                  <div>
                    <h4 className="font-semibold text-white">SOL Surge Competition</h4>
                    <p className="text-sm text-gray-400">Completed Dec 20, 2024</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Liquidated</Badge>
                    <p className="text-sm text-red-400 mt-1">-10 USDC</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Chart Placeholder */}
          <Card className="gaming-card nft-card mt-6">
            <CardHeader>
              <CardTitle className="gradient-text-primary">Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-dark-border rounded-lg">
                <div className="text-center text-gray-400">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Performance chart coming soon</p>
                  <p className="text-sm">Track your PnL over time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <MobileNavigation />
      <Toaster />
    </div>
  );
}
