"use client";

import React, { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Clock, Lock, Trophy, Plus, Users, RefreshCw, Calendar, Trash2, X, Check, Edit, Settings } from 'lucide-react';
import { getTournaments } from '@/lib/tournaments';
import { getActiveGames, createGame, joinGame, joinGameByCode, cancelGame, startGame, editGame } from '@/lib/games';
import { Footer } from '@/components/footer';
import { TournamentResults } from '@/components/tournament-results';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Import components with SSR disabled to prevent hydration errors
const Navigation = dynamic(
  () => import('@/components/navigation').then((mod) => mod.Navigation),
  { ssr: false }
);

const MobileNavigation = dynamic(
  () => import('@/components/mobile-navigation').then((mod) => mod.MobileNavigation),
  { ssr: false }
);

// Types for PvP games
interface Game {
  id: string;
  game_code: string | null;  // Updated to allow null for public games
  creator_id: string;
  opponent_id: string | null;
  principal_amount: number;
  pot_amount: number;
  token: string;           // New field for token type (e.g., SOL, USDC)
  duration: number;        // New field for game duration in seconds
  is_private: boolean;     // New field to indicate if game is private
  status: 'created' | 'joined' | 'active' | 'completed' | 'canceled';
  winner_id?: string;
  creator: {
    id: string;
    username: string;
    wallet_address: string;
    avatar_url: string | null;
  };
  opponent?: {
    id: string;
    username: string;
    wallet_address: string;
    avatar_url: string | null;
  } | null;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
}

// Mock data for leaderboard
const leaderboardData = [
  { rank: 1, username: 'TraderX', wins: 28, losses: 3, winRate: '90.3%', pnl: 42.5 },
  { rank: 2, username: 'CryptoNinja', wins: 24, losses: 5, winRate: '82.8%', pnl: 28.3 },
  { rank: 3, username: 'DeFiWarrior', wins: 21, losses: 7, winRate: '75.0%', pnl: 15.7 },
  { rank: 4, username: 'SolanaKing', wins: 18, losses: 8, winRate: '69.2%', pnl: 8.2 },
  { rank: 5, username: 'PerpMaster', wins: 12, losses: 15, winRate: '44.4%', pnl: -3.1 },
];

export default function GamesPage() {
  const [isPrivate, setIsPrivate] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [selectedToken, setSelectedToken] = useState('USDC');
  const [potAmount, setPotAmount] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [duration, setDuration] = useState('30');
  const [gameCode, setGameCode] = useState('');
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [liveGames, setLiveGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGamesLoading, setIsGamesLoading] = useState(false);
  const [error, setError] = useState('');
  const [gamesError, setGamesError] = useState('');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [editPrivate, setEditPrivate] = useState(false);
  const [editPrincipalAmount, setEditPrincipalAmount] = useState('');
  const [editPotAmount, setEditPotAmount] = useState('');
  const [editToken, setEditToken] = useState('USDC');
  const [editDuration, setEditDuration] = useState('30');
  const [editGameCode, setEditGameCode] = useState('');
  
  // Get toast function for notifications
  const { toast } = useToast();

  // Get wallet address from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedWallet = localStorage.getItem('walletAddress');
      if (storedWallet) {
        setWalletAddress(storedWallet);
      }
    }
  }, []);

  // Generate a random game code when private mode is enabled
  useEffect(() => {
    if (isPrivate) {
      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      setGameCode(randomCode);
    } else {
      setGameCode('');
    }
  }, [isPrivate]);
  
  // Fetch tournaments from Supabase
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setIsLoading(true);
        const tournamentsData = await getTournaments();
        setTournaments(tournamentsData);
        setError('');
      } catch (err) {
        console.error('Error fetching tournaments:', err);
        setError('Failed to load tournaments. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTournaments();
  }, []);

  // Fetch active games on component mount
  useEffect(() => {
    const fetchGames = async () => {
      setIsGamesLoading(true);
      setGamesError('');
      
      try {
        const gamesData = await getActiveGames(10);
        // Transform the data to ensure it matches our Game interface
        console.log('Games data from DB:', gamesData);
        const formattedGames = gamesData.map(game => {
          console.log('Game is_private type:', typeof game.is_private, 'value:', game.is_private);
          return {
            ...game,
            // Ensure creator and opponent are single objects, not arrays
            creator: Array.isArray(game.creator) ? game.creator[0] : game.creator,
            opponent: game.opponent ? 
              (Array.isArray(game.opponent) ? game.opponent[0] : game.opponent) : 
              null,
            // Ensure is_private is a boolean
            is_private: Boolean(game.is_private)
          };
        });
        console.log('Formatted games:', formattedGames);
        setLiveGames(formattedGames as Game[]);
      } catch (err) {
        console.error('Error fetching games:', err);
        setGamesError('Failed to load games. Please try again.');
      } finally {
        setIsGamesLoading(false);
      }
    };
    
    fetchGames();
  }, []);
  
  // Handle creating a new PvP game
  const handleCreateGame = async () => {
    // Use the component's walletAddress state instead of reading directly from localStorage
    if (!walletAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to create a game.",
        variant: "destructive"
      });
      return;
    }
    
    if (!principalAmount || !potAmount) {
      toast({
        title: "Missing Information",
        description: "Please enter principal and pot amounts.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Type as any to avoid TypeScript issues with null vs undefined
      const gameData: any = {
        creator_id: walletAddress,
        principal_amount: parseFloat(principalAmount),
        pot_amount: parseFloat(potAmount),
        token: selectedToken,              // Use dedicated column
        duration: parseInt(duration, 10),  // Use dedicated column
        is_private: isPrivate,            // Use dedicated column
        game_code: isPrivate ? gameCode : null // Pass UI-generated code or null
      };
      
      await createGame(gameData);
      
      // Success notification
      toast({
        title: "Game Created",
        description: "Your PvP game has been created successfully.",
      });
      
      // Reset form and reload games
      setPrincipalAmount('');
      setPotAmount('');
      setSelectedToken('USDC');
      setDuration('30');
      setIsPrivate(false);
      setGameCode('');
      
      // Reload games list
      try {
        const gamesData = await getActiveGames(10);
        // Transform the data to match our Game interface
        const formattedGames = gamesData.map(game => ({
          ...game,
          creator: Array.isArray(game.creator) ? game.creator[0] : game.creator,
          opponent: game.opponent ? 
            (Array.isArray(game.opponent) ? game.opponent[0] : game.opponent) : 
            null
        }));
        setLiveGames(formattedGames as Game[]);
      } catch (refreshErr) {
        console.error('Error refreshing games:', refreshErr);
        // Don't show error to user since the create was successful
      }
    } catch (err: any) {
      console.error('Error creating game:', err);
      toast({
        title: "Error Creating Game",
        description: err.message || 'An error occurred while creating the game.',
        variant: "destructive"
      });
      setError(err.message || 'An error occurred while creating the game.');
    }
  };
  
  // Handle joining a game
  const handleJoinGame = async (gameId: string) => {
    if (!walletAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to join a game.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await joinGame(gameId, walletAddress);
      
      // Reload games list
      try {
        const gamesData = await getActiveGames(10);
        // Transform the data to match our Game interface
        const formattedGames = gamesData.map(game => ({
          ...game,
          creator: Array.isArray(game.creator) ? game.creator[0] : game.creator,
          opponent: game.opponent ? 
            (Array.isArray(game.opponent) ? game.opponent[0] : game.opponent) : 
            null
        }));
        setLiveGames(formattedGames as Game[]);
      } catch (refreshErr) {
        console.error('Error refreshing games:', refreshErr);
      }
      
      toast({
        title: "Success", 
        description: "Game joined successfully!"
      });
    } catch (err: any) {
      console.error('Error joining game:', err);
      toast({
        title: "Error", 
        description: err.message || 'Failed to join game. Please try again.',
        variant: "destructive"
      });
    }
  };
  
  // Handle joining a game by code
  const handleJoinGameByCode = async () => {
    if (!walletAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to join a game.",
        variant: "destructive"
      });
      return;
    }
    
    if (!joinCode) {
      toast({
        title: "Missing Information",
        description: "Please enter a game code.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await joinGameByCode(joinCode, walletAddress);
      setJoinCode('');
      
      // Reload games list
      try {
        const gamesData = await getActiveGames(10);
        // Transform the data to match our Game interface
        const formattedGames = gamesData.map(game => ({
          ...game,
          creator: Array.isArray(game.creator) ? game.creator[0] : game.creator,
          opponent: game.opponent ? 
            (Array.isArray(game.opponent) ? game.opponent[0] : game.opponent) : 
            null
        }));
        setLiveGames(formattedGames as Game[]);
      } catch (refreshErr) {
        console.error('Error refreshing games:', refreshErr);
      }
      
      toast({
        title: "Success",
        description: "Game joined successfully!"
      });
    } catch (err: any) {
      console.error('Error joining game by code:', err);
      toast({
        title: "Error",
        description: err.message || 'Failed to join game. Please try again.',
        variant: "destructive"
      });
    }
  };
  
  // Handle canceling a game
  const handleCancelGame = async (gameId: string) => {
    if (!walletAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to cancel a game.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await cancelGame(gameId);
      
      // Reload games list
      try {
        const gamesData = await getActiveGames(10);
        // Transform the data to match our Game interface
        const formattedGames = gamesData.map(game => ({
          ...game,
          creator: Array.isArray(game.creator) ? game.creator[0] : game.creator,
          opponent: game.opponent ? 
            (Array.isArray(game.opponent) ? game.opponent[0] : game.opponent) : 
            null
        }));
        setLiveGames(formattedGames as Game[]);
      } catch (refreshErr) {
        console.error('Error refreshing games:', refreshErr);
      }
      
      toast({
        title: "Success",
        description: "Game canceled successfully!"
      });
    } catch (err: any) {
      console.error('Error canceling game:', err);
      toast({
        title: "Error",
        description: err.message || 'Failed to cancel game. Please try again.',
        variant: "destructive"
      });
    }
  };
  
  // Open the edit dialog for a game
  const handleOpenEditDialog = (game: Game) => {
    setEditingGame(game);
    setEditPrincipalAmount(game.principal_amount.toString());
    setEditPotAmount(game.pot_amount.toString());
    setEditToken(game.token || 'USDC');
    setEditDuration(game.duration.toString() || '30');
    setEditPrivate(game.is_private);
    setEditGameCode(game.game_code || '');
    
    // Generate a new game code if switching to private and no code exists
    if (game.is_private && !game.game_code) {
      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      setEditGameCode(randomCode);
    }
  };
  
  // Save edited game (creator only)
  const handleSaveEditGame = async () => {
    if (!editingGame || !walletAddress) return;
    
    try {
      // Validate inputs
      const principalAmount = parseFloat(editPrincipalAmount);
      const potAmount = parseFloat(editPotAmount);
      
      if (isNaN(principalAmount) || principalAmount <= 0) {
        toast({
          title: "Invalid Principal Amount",
          description: "Please enter a valid principal amount.",
          variant: "destructive"
        });
        return;
      }
      
      if (isNaN(potAmount) || potAmount <= 0) {
        toast({
          title: "Invalid Pot Amount",
          description: "Please enter a valid pot amount.",
          variant: "destructive"
        });
        return;
      }
      
      if (editPrivate && !editGameCode) {
        toast({
          title: "Game Code Required",
          description: "Private games must have a game code.",
          variant: "destructive"
        });
        return;
      }
      
      // Prepare updates
      const updates = {
        principal_amount: principalAmount,
        pot_amount: potAmount,
        token: editToken,
        duration: parseInt(editDuration),
        is_private: editPrivate,
        game_code: editPrivate ? editGameCode : null
      };
      
      await editGame(editingGame.id, updates);
      
      toast({
        title: "Game Updated",
        description: "Your PvP game has been updated successfully.",
      });
      
      // Reset state and reload games
      setEditingGame(null);
      
      // Reload games list
      try {
        const gamesData = await getActiveGames(10);
        const formattedGames = gamesData.map(game => ({
          ...game,
          creator: Array.isArray(game.creator) ? game.creator[0] : game.creator,
          opponent: game.opponent ? 
            (Array.isArray(game.opponent) ? game.opponent[0] : game.opponent) : 
            null,
          // Ensure is_private is a boolean
          is_private: Boolean(game.is_private)
        }));
        setLiveGames(formattedGames as Game[]);
      } catch (refreshErr) {
        console.error('Error refreshing games:', refreshErr);
      }
    } catch (err: any) {
      console.error('Error updating game:', err);
      toast({
        title: "Error Updating Game",
        description: err.message || 'An error occurred while updating the game.',
        variant: "destructive"
      });
    }
  };

  // Handle starting a game when both players are ready
  const handleStartGame = async (gameId: string) => {
    if (!walletAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to start a game.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await startGame(gameId);
      
      // Success notification
      toast({
        title: "Game Started",
        description: "Your PvP game has been started successfully."
      });
      
      // Reload games list
      try {
        const gamesData = await getActiveGames(10);
        // Transform the data to match our Game interface
        const formattedGames = gamesData.map(game => ({
          ...game,
          creator: Array.isArray(game.creator) ? game.creator[0] : game.creator,
          opponent: game.opponent ? 
            (Array.isArray(game.opponent) ? game.opponent[0] : game.opponent) : 
            null
        }));
        setLiveGames(formattedGames as Game[]);
      } catch (refreshErr) {
        console.error('Error refreshing games:', refreshErr);
      }
    } catch (err: any) {
      console.error('Error starting game:', err);
      toast({
        title: "Error Starting Game",
        description: err.message || 'Failed to start game. Please try again.',
        variant: "destructive"
      });
    }
  };

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'text-neon-cyan';
    if (pnl < 0) return 'text-red-400';
    return 'text-gray-400';
  };
  
  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <Navigation />
      
      <div className="pt-24 pb-20 max-w-6xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-center mb-12 gradient-text-primary">
          Clash Market Arena
        </h1>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-12">
        <Tabs defaultValue="pvp" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-dark-card border border-dark-border">
          <TabsTrigger value="tournament" className="data-[state=active]:bg-electric-purple/20 data-[state=active]:text-electric-purple">
            Tournament
          </TabsTrigger>
          <TabsTrigger value="pvp" className="data-[state=active]:bg-cyber-blue/20 data-[state=active]:text-cyber-blue">
            PvP
          </TabsTrigger>
        </TabsList>
        
        {/* Tournament Tab Content */}
        <TabsContent value="tournament" className="space-y-8">
          {/* Tournaments List */}
          <Card className="gaming-card glow-border rounded-xl overflow-hidden hover:shadow-neon-purple transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl text-electric-purple font-orbitron">Active Tournaments</CardTitle>
              <CardDescription>Join a tournament and compete for prizes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-gray-400">Loading tournaments...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-400">
                  <p>{error}</p>
                  <Button 
                    onClick={() => getTournaments().then(setTournaments).catch(console.error)}
                    variant="outline" 
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              ) : tournaments.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Trophy className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>No active tournaments at the moment.</p>
                  <p className="text-sm mt-1">Check back soon for new competitions!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tournaments
                    .filter(tournament => tournament.status !== 'completed')
                    .map((tournament) => (
                    <div key={tournament.id} className="p-3 border border-dark-border rounded-md bg-dark-bg/70 hover:bg-dark-bg transition-all">
                      <div className="flex flex-wrap md:flex-nowrap justify-between items-center">
                        <span className="font-medium text-base">{tournament.name}</span>
                        <span className="text-sm text-gray-400 w-full md:w-auto mt-1 md:mt-0 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2 text-sm">
                        <span className="text-cyber-blue flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {tournament.is_private && <Lock className="h-3 w-3 mr-1" />}
                          {tournament.max_participants} max participants
                        </span>
                        <span className="text-neon-cyan">{tournament.prize_pool} USDC pool</span>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button size="sm" className="bg-electric-purple hover:bg-electric-purple/80">
                          Register
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tournament Registration */}
            <Card className="gaming-card glow-border rounded-xl overflow-hidden hover:shadow-neon-purple transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-electric-purple font-orbitron">Weekly Championship</CardTitle>
                <CardDescription>Register for our flagship tournament</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Format</span>
                    <span className="text-sm font-medium">32-Player Bracket</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Entry Fee</span>
                    <span className="text-sm font-medium text-warning-orange">10 USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Prize Pool</span>
                    <span className="text-sm font-medium text-neon-cyan">750 USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Start Time</span>
                    <span className="text-sm font-medium">Saturday, 10:00 AM</span>
                  </div>
                  <div className="mt-3 p-2 bg-electric-purple/10 border border-electric-purple/30 rounded-md">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-electric-purple mr-2" />
                      <span className="text-sm">Registration closes in <span className="font-medium text-electric-purple">23:45:12</span></span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-electric-purple hover:bg-electric-purple/80">
                  Register Now
                </Button>
              </CardFooter>
            </Card>
            
            {/* Tournament Schedule */}
            <Card className="gaming-card glow-border rounded-xl overflow-hidden hover:shadow-neon transition-all duration-300 lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-neon-cyan font-orbitron">Upcoming Tournaments</CardTitle>
                <CardDescription>Schedule of upcoming tournaments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border border-dark-border bg-dark-bg/40 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-orbitron text-electric-purple text-lg">Weekend Championship</div>
                        <div className="text-sm text-muted-foreground mt-1">Saturday, 10:00 AM</div>
                        <div className="mt-2 flex items-center space-x-4">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-muted-foreground mr-1" />
                            <span className="text-sm">32 players</span>
                          </div>
                          <div className="text-neon-cyan text-sm">750 USDC prize</div>
                        </div>
                      </div>
                      <Button variant="outline" className="h-8 bg-transparent border-electric-purple text-electric-purple hover:bg-electric-purple/20">
                        Register
                      </Button>
                    </div>
                  </div>
                  
                  <div className="rounded-md border border-dark-border bg-dark-bg/40 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-orbitron text-cyber-blue text-lg">Pro League</div>
                        <div className="text-sm text-muted-foreground mt-1">Sunday, 2:00 PM</div>
                        <div className="mt-2 flex items-center space-x-4">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-muted-foreground mr-1" />
                            <span className="text-sm">16 players</span>
                          </div>
                          <div className="text-neon-cyan text-sm">500 USDC prize</div>
                        </div>
                      </div>
                      <Button variant="outline" className="h-8 bg-transparent border-cyber-blue text-cyber-blue hover:bg-cyber-blue/20">
                        Register
                      </Button>
                    </div>
                  </div>
                  

                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full bg-transparent border-neon-cyan text-neon-cyan hover:bg-neon-cyan/20">
                  <RefreshCw className="h-4 w-4 mr-2" /> Refresh Schedule
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Tournament Results Section */}
          <div className="mt-6">
            <TournamentResults />
          </div>
        </TabsContent>
        
        {/* PvP Tab Content */}
        <TabsContent value="pvp" className="space-y-8">
          <div className="flex justify-end mb-4">
            <Link href="/dashboard" className="inline-flex items-center">
              <Button variant="outline" className="bg-transparent border-neon-cyan text-neon-cyan hover:bg-neon-cyan/20">
                <Trophy className="h-4 w-4 mr-2" />
                My Battle Stats
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Game */}
            <Card className="gaming-card glow-border rounded-xl overflow-hidden hover:shadow-neon-cyan transition-all duration-300 mb-8">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-cyber-blue font-orbitron">Create Game</CardTitle>
                <CardDescription>Set up a new PvP match</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token-select">Select Token</Label>
                  <Select value={selectedToken} onValueChange={setSelectedToken}>
                    <SelectTrigger id="token-select" className="bg-dark-bg border-dark-border">
                      <SelectValue placeholder="Select Token" />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-bg border-dark-border">
                      <SelectItem value="USDC">USDC</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="SOL">SOL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="principal-amount">Principal Amount</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="principal-amount"
                      type="number"
                      value={principalAmount}
                      onChange={(e) => setPrincipalAmount(e.target.value)}
                      className="bg-dark-bg border-dark-border text-white"
                      placeholder="Initial stake amount"
                    />
                    <div className="text-sm text-muted-foreground">{selectedToken}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pot-amount">Pot Amount</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="pot-amount"
                      type="number"
                      value={potAmount}
                      onChange={(e) => setPotAmount(e.target.value)}
                      className="bg-dark-bg border-dark-border text-white"
                      placeholder="Winner takes all amount"
                    />
                    <div className="text-sm text-muted-foreground">{selectedToken}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration-select">Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger id="duration-select" className="bg-dark-bg border-dark-border">
                      <SelectValue placeholder="Select Duration" />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-bg border-dark-border">
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="private-mode"
                    checked={isPrivate}
                    onCheckedChange={setIsPrivate}
                    className="data-[state=checked]:bg-cyber-blue"
                  />
                  <Label htmlFor="private-mode">Private Match</Label>
                </div>
                
                {isPrivate && (
                  <div className="p-3 border border-cyber-blue/30 bg-cyber-blue/10 rounded-md mt-2">
                    <p className="text-sm mb-2">Share this code with your opponent:</p>
                    <div className="font-mono font-bold text-xl text-center text-cyber-blue">
                      {gameCode}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-cyber-blue hover:bg-cyber-blue/80"
                  onClick={handleCreateGame}
                  disabled={!walletAddress || !principalAmount || !potAmount}
                >
                  Create Game
                </Button>
              </CardFooter>
            </Card>

            {/* Live Matches */}
            <Card className="gaming-card glow-border rounded-xl overflow-hidden hover:shadow-electric transition-all duration-300 lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-electric-purple font-orbitron">Live Matches</CardTitle>
                <CardDescription>Currently active PvP games</CardDescription>
              </CardHeader>
              <CardContent>
                {isGamesLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-gray-400">Loading games...</p>
                  </div>
                ) : gamesError ? (
                  <div className="text-center py-8 text-red-400">
                    <p>{gamesError}</p>
                    <Button 
                      onClick={async () => {
                        try {
                          setIsGamesLoading(true);
                          const gamesData = await getActiveGames(10);
                          
                          // Transform the data to match our Game interface
                          const formattedGames = gamesData.map(game => ({
                            ...game,
                            creator: Array.isArray(game.creator) ? game.creator[0] : game.creator,
                            opponent: game.opponent ? 
                              (Array.isArray(game.opponent) ? game.opponent[0] : game.opponent) : 
                              null
                          }));
                          
                          setLiveGames(formattedGames as Game[]);
                          setGamesError('');
                        } catch (err) {
                          console.error('Error fetching games:', err);
                          setGamesError('Failed to load PvP games. Please try again.');
                        } finally {
                          setIsGamesLoading(false);
                        }
                      }}
                      variant="outline" 
                      className="mt-2"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : liveGames.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <RefreshCw className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>No active games at the moment.</p>
                    <p className="text-sm mt-1">Create a new game to get started!</p>
                  </div>
                ) : (
                  <div>
                    <table className="w-full">
                      <thead>
                        <tr className="text-xs text-muted-foreground border-b border-dark-border">
                          <th className="text-left pb-2">Players</th>
                          <th className="text-center pb-2">Status</th>
                          <th className="text-center pb-2">Pot</th>
                          <th className="text-right pb-2">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {liveGames.map((game: Game) => {
                          const isCreator = walletAddress === game.creator?.wallet_address;
                          const isOpponent = walletAddress === game.opponent?.wallet_address;
                          // Safely get player name with fallbacks
                          const playerName = game.creator?.username || 
                            (game.creator?.wallet_address ? game.creator.wallet_address.substring(0, 6) + '...' : 'Unknown');
                          
                          // Safely get opponent name with fallbacks
                          const opponentName = game.opponent ? 
                            (game.opponent.username || 
                             (game.opponent.wallet_address ? game.opponent.wallet_address.substring(0, 6) + '...' : 'Unknown')) : 
                            'Waiting...';
                            
                          return (
                            <tr key={game.id} className="border-b border-dark-border/50">
                              <td className="py-3">
                                <div className="font-medium">{playerName} vs {opponentName}</div>
                                {game.status === 'created' && (
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    Created {new Date(game.created_at).toLocaleString()}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 text-center">
                                <span className={
                                  game.status === 'active' ? 'text-warning-orange' : 
                                  game.status === 'created' ? 'text-neon-cyan' : 
                                  'text-electric-purple'
                                }>
                                  {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
                                </span>
                              </td>
                              <td className="py-3 text-center">
                                <span className="text-neon-cyan">{game.pot_amount} USDC</span>
                              </td>
                              <td className="py-3 text-right">
                                {/* Show Action based on game privacy and status */}
                                {game.status === 'created' && game.is_private && (
                                  <div className="flex items-center justify-end space-x-2">
                                    <span className="text-xs font-medium bg-cyber-blue/20 text-cyber-blue py-1 px-2 rounded-full mr-2">
                                      <Lock className="h-3 w-3 inline mr-1" />
                                      Private
                                    </span>
                                    {/* Private games can only be joined via code */}
                                    {isCreator && (
                                      <div className="flex items-center space-x-1">
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          className="h-7 bg-transparent border-cyber-blue text-cyber-blue hover:bg-cyber-blue/20"
                                          onClick={() => handleOpenEditDialog(game)}
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          className="h-7 bg-transparent border-red-500 text-red-500 hover:bg-red-500/20"
                                          onClick={() => handleCancelGame(game.id)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {/* For public games in created state */}
                                {game.status === 'created' && !game.is_private && (
                                  <div className="flex items-center justify-end space-x-2">
                                    <span className="text-xs font-medium bg-neon-cyan/20 text-neon-cyan py-1 px-2 rounded-full mr-2">
                                      <Users className="h-3 w-3 inline mr-1" />
                                      Public
                                    </span>
                                    {!isCreator && (
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="h-7 bg-transparent border-neon-cyan text-neon-cyan hover:bg-neon-cyan/20"
                                        onClick={() => handleJoinGame(game.id)}
                                        disabled={!walletAddress}
                                      >
                                        Join
                                      </Button>
                                    )}
                                    {isCreator && (
                                      <div className="flex items-center space-x-1">
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          className="h-7 bg-transparent border-cyber-blue text-cyber-blue hover:bg-cyber-blue/20"
                                          onClick={() => handleOpenEditDialog(game)}
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          className="h-7 bg-transparent border-red-500 text-red-500 hover:bg-red-500/20"
                                          onClick={() => handleCancelGame(game.id)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {game.status === 'joined' && (
                                  <div className="flex items-center justify-end space-x-2">
                                    {(isCreator || isOpponent) && (
                                      <>
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          className="h-7 bg-transparent border-green-500 text-green-500 hover:bg-green-500/20"
                                          onClick={() => handleStartGame(game.id)}
                                        >
                                          <Check className="h-3 w-3" />
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          className="h-7 bg-transparent border-red-500 text-red-500 hover:bg-red-500/20"
                                          onClick={() => handleCancelGame(game.id)}
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Join Game */}
            <Card className="gaming-card glow-border rounded-xl overflow-hidden hover:shadow-neon-purple transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-electric-purple font-orbitron">Join Private Game</CardTitle>
                <CardDescription>Enter a code to join a private match</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="game-code">Game Code</Label>
                  <Input
                    id="game-code"
                    placeholder="Enter code (e.g. AB12CD)"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="font-mono uppercase bg-dark-bg border-dark-border text-white mt-2"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-electric-purple hover:bg-electric-purple/80"
                  disabled={!walletAddress || joinCode.length < 6}
                  onClick={handleJoinGameByCode}
                >
                  Join Game
                </Button>
              </CardFooter>
            </Card>

            {/* Player Records */}
            <Card className="gaming-card glow-border rounded-xl overflow-hidden hover:border-yellow-500/50 transition-all duration-300 lg:col-span-2 mb-16">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-neon-cyan font-orbitron">Player Records</CardTitle>
                <CardDescription>Top players this season</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-muted-foreground border-b border-dark-border">
                        <th className="text-left pb-2">Rank</th>
                        <th className="text-left pb-2">Player</th>
                        <th className="text-center pb-2">W/L</th>
                        <th className="text-center pb-2">Win Rate</th>
                        <th className="text-right pb-2">P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboardData.map((player) => (
                        <tr key={player.rank} className="border-b border-dark-border/50">
                          <td className="py-3 w-12">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-dark-bg">
                              {player.rank <= 3 ? (
                                <Trophy className={`h-3 w-3 ${player.rank === 1 ? 'text-yellow-500' : player.rank === 2 ? 'text-gray-400' : 'text-amber-700'}`} />
                              ) : (
                                <span className="text-xs">{player.rank}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="font-medium">{player.username}</div>
                          </td>
                          <td className="py-3 text-center">
                            <span className="text-neon-cyan">{player.wins}</span>
                            <span className="text-muted-foreground">/{player.losses}</span>
                          </td>
                          <td className="py-3 text-center">{player.winRate}</td>
                          <td className="py-3 text-right font-medium">
                            <span className={getPnLColor(player.pnl)}>
                              {player.pnl > 0 ? '+' : ''}{player.pnl} USDC
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Game Dialog */}
      <Dialog open={!!editingGame} onOpenChange={(open) => !open && setEditingGame(null)}>
        <DialogContent className="sm:max-w-[425px] bg-dark-bg text-white border-dark-border">
          <DialogHeader>
            <DialogTitle className="text-xl text-electric-purple font-orbitron">Edit PvP Game</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update the details of your PvP game.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-principal">Principal</Label>
                <Input
                  id="edit-principal"
                  type="number"
                  placeholder="0.00"
                  value={editPrincipalAmount}
                  onChange={(e) => setEditPrincipalAmount(e.target.value)}
                  className="bg-dark-bg border-dark-border"
                  style={{color: 'white'}}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-pot">Pot</Label>
                <Input
                  id="edit-pot"
                  type="number"
                  placeholder="0.00"
                  value={editPotAmount}
                  onChange={(e) => setEditPotAmount(e.target.value)}
                  className="bg-dark-bg border-dark-border"
                  style={{color: 'white'}}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-token-select">Token</Label>
              <Select value={editToken} onValueChange={setEditToken}>
                <SelectTrigger id="edit-token-select" className="bg-dark-bg border-dark-border">
                  <SelectValue placeholder="Select Token" />
                </SelectTrigger>
                <SelectContent className="bg-dark-bg border-dark-border">
                  <SelectItem value="SOL">SOL</SelectItem>
                  <SelectItem value="USDC">USDC</SelectItem>
                  <SelectItem value="BONK">BONK</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-duration-select">Duration</Label>
              <Select value={editDuration} onValueChange={setEditDuration}>
                <SelectTrigger id="edit-duration-select" className="bg-dark-bg border-dark-border">
                  <SelectValue placeholder="Select Duration" />
                </SelectTrigger>
                <SelectContent className="bg-dark-bg border-dark-border">
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="edit-private-mode"
                checked={editPrivate}
                onCheckedChange={setEditPrivate}
                className="data-[state=checked]:bg-cyber-blue"
              />
              <Label htmlFor="edit-private-mode">Private Match</Label>
            </div>
            
            {editPrivate && (
              <div className="p-3 border border-cyber-blue/30 bg-cyber-blue/10 rounded-md mt-2">
                <p className="text-sm mb-2">Game code for private match:</p>
                <Input
                  value={editGameCode}
                  onChange={(e) => setEditGameCode(e.target.value.toUpperCase())}
                  className="font-mono font-bold text-center text-cyber-blue bg-dark-bg border-dark-border"
                  maxLength={6}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setEditingGame(null)} 
              variant="outline"
              className="bg-transparent border-dark-border text-gray-400 hover:bg-dark-border/30"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEditGame}
              className="bg-cyber-blue hover:bg-cyber-blue/80"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast container */}
      <Toaster />
      
      <MobileNavigation />
      </div>
      <Footer />
    </div>
  );
}
