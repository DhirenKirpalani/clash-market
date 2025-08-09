"use client";

import React, { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, DollarSign, ArrowUpRight, ArrowDownRight, Copy, Check } from 'lucide-react';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from '@/components/countdown-timer';
import { getGameById } from '@/lib/games';
// Using local Supabase client instead of auth-helpers-nextjs
import { createClient } from '@supabase/supabase-js';
// Toast components removed
import DriftPositionCard from "@/components/DriftPositionCard";
import { PublicKey, Keypair } from "@solana/web3.js";
import { formatCurrency, formatPercentage, getPnLSign, getPnLColor } from "@/lib/display";

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

// Import components with SSR disabled to prevent hydration errors
const Navigation = dynamic(
  () => import('@/components/navigation').then((mod) => mod.Navigation),
  { ssr: false }
);

const MobileNavigation = dynamic(
  () => import('@/components/mobile-navigation').then((mod) => mod.MobileNavigation),
  { ssr: false }
);

// Types for our data
interface Position {
  market: string;
  side: string;
  size: number;
  pnl: number;
  pnlPercent: number;
}

interface UserStats {
  openPositions: number;
  currentBalance: number;
  totalPnL: number;
}

interface Player {
  id: string;
  username: string;
  wallet_address: string;
  avatar_url: string;
  openPositions: number;
  currentBalance: number;
  totalPnL: number;
  positions: Position[];
  isCreator: boolean; // Flag to identify if this player is the creator
}

interface Game {
  id: string;
  game_code: string;
  creator_id: string;
  opponent_id: string;
  principal_amount: number;
  pot_amount: number;
  status: string;
  winner_id: string | null;
  creator: {
    id: string;
    wallet_address: string;
    username: string;
    avatar_url: string;
  };
  opponent: {
    id: string;
    wallet_address: string;
    username: string;
    avatar_url: string;
  };
  start_time: string;
  end_time: string | null;
  created_at: string;
  token: string; // Required field based on schema
  duration: number; // Required field based on schema (in seconds)
}

interface PvpSession {
  id: string;
  timeLeft: Date; // This is the end time calculated from start_time + duration
  prizePool: number;
  currency: string;
  players: Player[];
  status: string;
  currentUserId?: string; // Optional ID of the current logged-in user
  duration: number; // Game duration in seconds
  start_time?: string; // Start time from database for sync
}

// Calculate end time from duration in minutes and start time (if available)
const calculateEndTimeFromDuration = (durationInMinutes?: number, startTime?: string) => {
  if (!durationInMinutes) return new Date(); // Default to now if no duration
  
  // If start_time is available (game is active), calculate end time from that
  if (startTime) {
    const gameStartTime = new Date(startTime);
    // Convert minutes to milliseconds (minutes * 60 seconds * 1000 milliseconds)
    const endTime = new Date(gameStartTime.getTime() + (durationInMinutes * 60 * 1000));
    return endTime;
  }
  
  // If no start_time (game not started yet), use current time as base
  const now = new Date();
  const endTime = new Date(now.getTime() + (durationInMinutes * 60 * 1000));
  return endTime;
};

// Temporary mock function for player positions until we have a real table
const fetchPlayerPositions = async (userId: string): Promise<Position[]> => {
  console.log('Fetching mock positions for user:', userId);
  // Generate semi-random positions based on user ID to make it look realistic
  const userSeed = userId.charCodeAt(0) || 0;
  const numPositions = (userSeed % 3) + 2; // 2-4 positions
  
  const markets = ["BTC-PERP", "ETH-PERP", "SOL-PERP", "AVAX-PERP", "DOGE-PERP"];
  const positions: Position[] = [];
  
  for (let i = 0; i < numPositions; i++) {
    const marketIndex = (userSeed + i) % markets.length;
    const side = (userSeed + i) % 2 === 0 ? 'long' : 'short';
    const size = Math.floor((userSeed + 20 + i * 10) % 100) + 10;
    const pnlMultiplier = side === 'long' ? 1 : -1;
    const pnl = parseFloat(((userSeed % 10) * pnlMultiplier * 0.5).toFixed(2));
    const pnlPercent = parseFloat((pnl / size * 100).toFixed(2));
    
    positions.push({
      market: markets[marketIndex],
      side,
      size,
      pnl,
      pnlPercent
    });
  }
  
  return positions;
};

// Temporary mock function for user stats until we have a real table
const fetchUserStats = async (userId: string): Promise<UserStats> => {
  console.log('Fetching mock stats for user:', userId);
  // Generate semi-random stats based on user ID
  const userSeed = userId.charCodeAt(0) || 0;
  
  return {
    openPositions: (userSeed % 5) + 2, // 2-6 open positions
    currentBalance: parseFloat((100 + (userSeed % 20)).toFixed(2)),
    totalPnL: parseFloat(((userSeed % 20) - 10).toFixed(2))
  };
};

// Fetch full PVP session data with all required information
const fetchSessionData = async (gameId: string): Promise<PvpSession> => {
  try {
    const gameData = await getGameById(gameId);
    
    if (!gameData) {
      throw new Error("Game not found");
    }
    
    // Calculate end time based on start time and duration
    let endTime = new Date();
    if (gameData.start_time) {
      const startTime = new Date(gameData.start_time).getTime();
      // Get duration from gameData (in seconds) and convert to milliseconds
      const durationMs = gameData.duration * 1000;
      endTime = new Date(startTime + durationMs);
    }
    
    // Validate required game data
    if (!gameData.creator) {
      throw new Error('Creator data is missing');
    }
    
    // Don't throw error if opponent is missing, handle gracefully instead
    
    // Validate required game data for active games
    if (gameData.status === 'active' && !gameData.start_time) {
      throw new Error('Game start time is missing for active game');
    }
    
    // Reference the creator object from gameData with proper type checking
    const creator = gameData.creator && typeof gameData.creator === 'object' ? gameData.creator : null;
    
    // Get creator stats and positions
    let creatorPositions: Position[] = [];
    let creatorStats: UserStats = { openPositions: 0, currentBalance: 0, totalPnL: 0 };
    
    // Initialize opponent data (may be null if not joined yet)
    let opponentPositions: Position[] = [];
    let opponentStats: UserStats = { openPositions: 0, currentBalance: 0, totalPnL: 0 };
    
    try {
      // Always fetch creator data
      [creatorPositions, creatorStats] = await Promise.all([
        fetchPlayerPositions(gameData.creator_id),
        fetchUserStats(gameData.creator_id)
      ]);
      
      // Only fetch opponent data if opponent exists
      if (gameData.opponent && gameData.opponent_id) {
        [opponentPositions, opponentStats] = await Promise.all([
          fetchPlayerPositions(gameData.opponent_id),
          fetchUserStats(gameData.opponent_id)
        ]);
      }
    } catch (err) {
      console.error('Error fetching player data:', err);
      // Default values are already set above
    }
    
    // Build the creator player object with safe property access
    const creatorPlayer: Player = {
      id: gameData.creator_id || '',
      username: creator && 'username' in creator ? String(creator.username) : "Player 1",
      wallet_address: creator && 'wallet_address' in creator ? String(creator.wallet_address) : "",
      avatar_url: creator && 'avatar_url' in creator ? String(creator.avatar_url) : "",
      openPositions: creatorStats.openPositions,
      currentBalance: creatorStats.currentBalance,
      totalPnL: creatorStats.totalPnL,
      positions: creatorPositions,
      isCreator: true // Identify as creator
    };
    
    // Build opponent player object if available, or create a placeholder
    const opponentPlayer: Player = gameData.opponent && typeof gameData.opponent === 'object' ? {
      id: gameData.opponent_id || '',
      username: gameData.opponent && 'username' in gameData.opponent ? String(gameData.opponent.username) : "Player 2",
      wallet_address: gameData.opponent && 'wallet_address' in gameData.opponent ? String(gameData.opponent.wallet_address) : "",
      avatar_url: gameData.opponent && 'avatar_url' in gameData.opponent ? String(gameData.opponent.avatar_url) : "",
      openPositions: opponentStats.openPositions,
      currentBalance: opponentStats.currentBalance,
      totalPnL: opponentStats.totalPnL,
      positions: opponentPositions,
      isCreator: false // Identify as opponent
    } : {
      id: 'pending',
      username: "Waiting for opponent",
      wallet_address: "",
      avatar_url: "",
      openPositions: 0,
      currentBalance: 0,
      totalPnL: 0,
      positions: [],
      isCreator: false
    };
    
    // Get the currency/token from gameData
    const currency = gameData.token;
    
    // Parse the game data into our session format
    const sessionData: PvpSession = {
      id: gameData.id,
      timeLeft: calculateEndTimeFromDuration(gameData.duration, gameData.start_time), 
      prizePool: gameData.pot_amount,
      currency: gameData.token,
      players: [creatorPlayer, opponentPlayer],
      status: gameData.status,
      duration: gameData.duration || 30, // Add duration from game data with fallback (in minutes)
      start_time: gameData.start_time // Add start time for synchronization
    };
    
    return sessionData;
  } catch (error: any) {
    console.error('Error in fetchSessionData:', error);
    throw new Error(error.message || 'Failed to fetch session data');
  }
};

export default function PvpSessionPage() {
  const { id: sessionId } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessionData, setSessionData] = useState<PvpSession | null>(null);
  const [currentWalletAddress, setCurrentWalletAddress] = useState<string | null>(null);
  const [countdownActive, setCountdownActive] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false); // Used to force re-renders
  const [copied, setCopied] = useState(false); // For copy button state
  const [keypair, setKeypair] = useState<{publicKey: string, secretKey: string} | null>(null);
  
  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user's details on component mount
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        // Try to get wallet address from localStorage first (how the app actually stores it)
        const localWalletAddress = localStorage.getItem('walletAddress') || localStorage.getItem('dev_wallet_address');
        if (localWalletAddress) {
          console.log('Found wallet address in localStorage:', localWalletAddress);
          setCurrentWalletAddress(localWalletAddress);
          return; // We found the address, no need to check Supabase
        }
        
        // If not in localStorage, try getting from Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
          
          // Get the wallet address from the users table
          const { data: userData, error } = await supabase
            .from('users')
            .select('wallet_address')
            .eq('id', user.id)
            .single();
            
          if (userData && userData.wallet_address) {
            setCurrentWalletAddress(userData.wallet_address);
            console.log('Current user wallet address from Supabase:', userData.wallet_address);
          } else {
            console.error('Could not retrieve wallet address for current user');
            console.log('User data received:', userData);
          }
        }
      } catch (err) {
        console.error("Error getting current user details:", err);
      }
    };
    
    getCurrentUser();
  }, []);

  useEffect(() => {
    const loadSessionData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchSessionData(sessionId);
        setSessionData(data);
        
        // Determine if the countdown should be active based on game status
        if (data.status === 'active') {
          setCountdownActive(true);
        }
        
      } catch (err: any) {
        console.error('Failed to load session data:', err);
        setError(err.message || 'Failed to load session data');
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      loadSessionData();
    }
  }, [sessionId, forceUpdate]);

  // Set up real-time subscription to game changes
  useEffect(() => {
    if (!sessionId) return;
    
    console.log('Setting up Supabase real-time subscription for game:', sessionId);
    
    // Create a stable channel name with the session ID
    const channelName = `game_changes_${sessionId}`;
    
    // Create a function to verify the subscription is working
    const checkSubscription = () => {
      console.log('Testing Supabase subscription for:', sessionId);
      // Just return true as the channel subscription status is checked in the subscribe callback
      return true;
    };
    
    // Initialize subscription and handle reconnects
    const initSubscription = () => {
      console.log('Initializing Supabase subscription for game:', sessionId);
      
      try {
        // First remove any existing subscriptions to avoid duplicates
        supabase.removeChannel(supabase.channel(channelName));
        
        // Create and configure the new channel
        const subscription = supabase
          .channel(channelName, {
            config: {
              broadcast: { self: true }, // Ensure we receive our own events too
              presence: { key: 'user_' + currentWalletAddress },
            }
          })
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'games', filter: `game_code=eq.${sessionId}` },
            (payload) => {
              console.log('🔔 REAL-TIME UPDATE RECEIVED:', payload);
              // Add null check for payload.new and ensure it has the right type
              const updatedGame = payload?.new || { status: '', start_time: null, duration: 0 };
              
              // If the game has been activated, update immediately without re-fetching
              if (updatedGame.status === 'active' && sessionData?.status !== 'active') {
                console.log('⚡ Game activated via real-time, updating UI immediately');
                
                // Calculate end time based on start_time from the update
                const timeLeft = calculateEndTimeFromDuration(
                  updatedGame.duration || sessionData?.duration || 30, 
                  updatedGame.start_time
                );
                
                // Game started - countdown begins
                console.log('Game started - countdown begins');
                
                // Update all relevant state immediately
                setCountdownActive(true);
                setSessionData(prev => prev ? {
                  ...prev,
                  status: 'active',
                  start_time: updatedGame.start_time,
                  timeLeft: timeLeft
                } : null);
                
                // Force re-render
                setForceUpdate(prev => !prev);
                
                // Also fetch fresh data asynchronously to ensure we're in sync
                fetchSessionData(sessionId).then(freshData => {
                  console.log('Updated with fresh data from server');
                  setSessionData(freshData);
                }).catch(err => {
                  console.error('Error fetching updated game data:', err);
                });
              }
            }
          )
          .subscribe((status) => {
            console.log(`Subscription status for ${channelName}:`, status);
            
            // If subscription failed, retry after a delay
            if (status !== 'SUBSCRIBED') {
              console.error('Failed to subscribe to real-time updates, retrying...');
              setTimeout(initSubscription, 3000);
            } else {
              console.log('Subscription verified and working!');
            }
          });
          
        // Return the subscription for cleanup
        return subscription;
      } catch (error) {
        console.error('Error setting up Supabase subscription:', error);
        // Retry after a delay
        setTimeout(initSubscription, 5000);
        return null;
      }
    };
    
    // Start the subscription
    const subscription = initSubscription();
    
    // Also poll periodically to ensure we're in sync and haven't missed any updates
    const pollInterval = setInterval(() => {
      if (sessionData?.status !== 'active') {
        fetchSessionData(sessionId).then(freshData => {
          if (freshData.status === 'active' && sessionData?.status !== 'active') {
            console.log('Game activated via polling, updating UI');
            setCountdownActive(true);
            setSessionData(freshData);
            setForceUpdate(prev => !prev);
            
            // Show toast notification
            console.log('Game status changed to active - countdown active');
          }
        }).catch(err => {
          console.error('Error in polling update:', err);
        });
      }
    }, 10000); // Poll every 10 seconds as backup
    
    // Clean up subscription and interval
    return () => {
      console.log('Cleaning up Supabase subscription');
      clearInterval(pollInterval);
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [sessionId, currentWalletAddress, sessionData?.status]); // Include sessionData.status to re-evaluate when status changes

  // Generate Solana keypair when component mounts
  useEffect(() => {
    const generateKeypair = async () => {
      try {
        // Only generate if we don't already have one
        if (!keypair) {
          // Generate keypair using Solana web3.js exactly as provided by user
          const generatedKeypair = Keypair.generate();
          
          // Extract public and private key in the format requested
          const publicKey = generatedKeypair.publicKey.toBase58();
          const secretKey = Buffer.from(generatedKeypair.secretKey).toString('hex');
          
          console.log('Public Key:', publicKey);
          console.log('Secret Key:', secretKey);
          
          setKeypair({
            publicKey,
            secretKey
          });
        }
      } catch (error) {
        console.error('Error generating Solana keypair:', error);
      }
    };
    
    if (sessionData) {
      generateKeypair();
    }
  }, [sessionData, keypair, sessionId]);

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'text-neon-cyan';
    if (pnl < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getSideIcon = (side: string) => {
    if (side === 'long') return <ArrowUpRight className="h-4 w-4 text-neon-cyan" />;
    return <ArrowDownRight className="h-4 w-4 text-red-400" />;
  };

  const getSideText = (side: string) => {
    if (side === 'long') return 'text-neon-cyan';
    return 'text-red-400';
  };

  const renderPositionCard = (position: Position) => {
    return (
      <Card key={`${position.market}-${position.side}`} className="border border-dark-border bg-dark-card/50 hover:bg-dark-card mb-3 transition-all">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {getSideIcon(position.side)}
              <span className={`font-bold ${getSideText(position.side)}`}>
                {position.side.charAt(0).toUpperCase() + position.side.slice(1)}
              </span>
              <span className="text-sm font-medium">{position.market}</span>
            </div>
            <div className={`font-bold ${getPnLColor(position.pnl)}`}>
              {position.pnl > 0 ? '+' : ''}{position.pnl} USDC ({position.pnlPercent > 0 ? '+' : ''}{position.pnlPercent}%)
            </div>
          </div>
          <div className="mt-2 flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Size</span>
            <span className="font-medium">${position.size}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Helper function to determine if current user is creator or opponent using wallet address
  const isUserCreator = () => {
    if (!sessionData || !currentWalletAddress || !sessionData.players[0].wallet_address) return false;
    return sessionData.players[0].wallet_address === currentWalletAddress;
  };
  
  // Use the global calculateEndTimeFromDuration function moved outside the component
  
  // Function to handle starting the game countdown
  const handleStartCountdown = async () => {
    try {
      setIsLoading(true);
      console.log('Starting countdown for game:', sessionId);
      
      // Simple API call to set game status to active
      const response = await fetch(`/api/games/start/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const responseData = await response.json();
      console.log('API response:', responseData);
      
      if (response.ok) {
        // Update game status locally without a full page refresh
        if (sessionData) {
          // Set countdown to active to start the timer
          setCountdownActive(true);
          
          // Update session data with response from API
          const now = new Date().toISOString();
          setSessionData({
            ...sessionData,
            status: 'active',
            start_time: responseData.data?.[0]?.start_time || now
          });
          
          console.log('Countdown activated and session status updated to active');
          console.log('Game start time set to:', responseData.data?.[0]?.start_time || now);
          
          // Force a re-render by updating state
          setForceUpdate(prev => !prev);
        }
      } else {
        console.error('API returned error:', responseData);
        setError(`Failed to start game: ${responseData.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Error in handleStartCountdown:', err);
      setError('Failed to start game: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const isUserOpponent = () => {
    if (!sessionData || !currentWalletAddress || sessionData.players[1].id === 'pending' || !sessionData.players[1].wallet_address) return false;
    return sessionData.players[1].wallet_address === currentWalletAddress;
  };

  const renderPlayerCard = (player: Player, index: number) => {
    return (
      <Card key={player.username} className="border border-dark-border bg-dark-card">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl text-electric-purple font-orbitron">
              {currentWalletAddress && player.wallet_address === currentWalletAddress ? 'You' : player.username}
            </CardTitle>
            <span className={`text-xs px-2 py-1 rounded ${player.isCreator ? 'bg-blue-600/30 text-blue-300' : 'bg-pink-600/30 text-pink-300'}`}>
              {player.isCreator ? 'Creator' : 'Opponent'}
            </span>
            {/* Add 'Me' label if wallet address matches */}
            {currentWalletAddress && player.wallet_address === currentWalletAddress && (
              <span className="text-xs px-2 py-1 rounded bg-green-600/30 text-green-300 font-bold">
                Me
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <CardDescription>Trading statistics</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-dark-bg p-3 rounded-lg text-center">
              <div className="text-sm text-muted-foreground">Open Positions</div>
              <div className="text-xl font-bold">{player.openPositions}</div>
            </div>
            <div className="bg-dark-bg p-3 rounded-lg text-center">
              <div className="text-sm text-muted-foreground">Balance</div>
              <div className="text-xl font-bold">${player.currentBalance.toFixed(2)}</div>
            </div>
            <div className="bg-dark-bg p-3 rounded-lg text-center">
              <div className="text-sm text-muted-foreground">Total P&L</div>
              <div className={`text-xl font-bold ${getPnLColor(player.totalPnL)}`}>
                {player.totalPnL > 0 ? '+' : ''}{player.totalPnL.toFixed(2)}
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold font-orbitron mb-3">Positions</h3>
          <div className="space-y-3">
            {player.positions.map((position: Position) => renderPositionCard(position))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg text-white">
        <Navigation />
        <div className="pt-24 pb-20 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-t-2 border-electric-purple rounded-full animate-spin"></div>
            <p className="mt-4 text-lg">Loading PVP session...</p>
          </div>
        </div>
        <Footer />
        <MobileNavigation />
      </div>
    );
  }

  // Render error state
  if (error || !sessionData) {
    return (
      <div className="min-h-screen bg-dark-bg text-white">
        <Navigation />
        <div className="pt-24 pb-20 flex items-center justify-center">
          <Card className="border border-red-500 bg-dark-card w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-400">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error || "Failed to load session data"}</p>
            </CardContent>
            <CardFooter>
              <Button variant="default" onClick={() => window.history.back()}>Go Back</Button>
            </CardFooter>
          </Card>
        </div>
        <Footer />
        <MobileNavigation />
      </div>
    );
  }
  
  // Render main UI
  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-20">


        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-orbitron font-bold">PVP Session</h1>
          
          {/* Start Button - visible only to creator */}
          {isUserCreator() && (
            <Button
              onClick={handleStartCountdown}
              disabled={isLoading || sessionData.status !== 'joined'}
              className="bg-electric-purple hover:bg-electric-purple/80"
            >
              Start Countdown
            </Button>
          )}
        </div>
        
        {/* Main PVP Session Card */}
        <Card className="border border-dark-border bg-dark-card mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h2 className="text-2xl font-orbitron font-bold text-electric-purple">PVP Session #{sessionId}</h2>
                <p className="text-muted-foreground">Real-time trading competition</p>
              </div>
            
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">Time Left</div>
                  <div className="flex items-center justify-center gap-2">
                    <CountdownTimer 
                      targetDate={sessionData.timeLeft}
                      active={countdownActive || sessionData.status === 'active'} 
                      durationMinutes={sessionData?.duration || 30} 
                    />
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">Prize Pool</div>
                  <div className="flex items-center justify-center bg-gradient-to-r from-electric-purple to-neon-cyan bg-clip-text text-transparent">
                    <DollarSign className="h-6 w-6 mr-1 text-warning-orange" />
                    <span className="text-4xl font-orbitron font-bold">
                      {sessionData?.prizePool || 0} {sessionData?.currency || ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Solana Private Key Card */}
        <Card className="mb-6 border border-dark-border bg-dark-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-orbitron text-electric-purple">
              Solana Private Key
            </CardTitle>
            <CardDescription>
              Save this key securely. Do not share it with others.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between bg-dark-bg p-4 rounded-lg border border-dark-border">
              <code className="font-mono text-sm truncate max-w-[80%]">
                {keypair?.secretKey || 'Generating key...'}
              </code>
              <Button 
                variant="outline" 
                size="sm"
                disabled={!keypair?.secretKey}
                className={`ml-2 bg-transparent ${copied ? 'border-green-500 text-green-500 hover:bg-green-500/20' : 'border-cyber-blue text-cyber-blue hover:bg-cyber-blue/20'}`}
                onClick={() => {
                  if (keypair?.secretKey) {
                    navigator.clipboard.writeText(keypair.secretKey);
                    setCopied(true);
                  }
                }}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" /> Copy
                  </>
                )}
              </Button>
            </div> 
            <div className="mt-4 text-sm text-muted-foreground">
              <p className="mb-2">⚠️ <span className="font-semibold text-warning-orange">Important:</span> This is your trading session's private key.</p>
              <p>Keep this key secure and do not share it with others.</p>
            </div>
          </CardContent>
        </Card>

        {/* Player Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {sessionData.players.map((player, index) =>
            <DriftPositionCard key={player.wallet_address} user={new PublicKey(player.wallet_address)} name={player.username} />
          )}
        </div>
      </div>

      <Footer />
      <MobileNavigation />
    </div>
  );
}
