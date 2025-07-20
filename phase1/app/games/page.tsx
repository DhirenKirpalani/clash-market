"use client";

import React, { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Clock, Lock, Trophy, Plus, Users, RefreshCw } from 'lucide-react';
import { Footer } from '@/components/footer';
import { TournamentResults } from '@/components/tournament-results';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// Import components with SSR disabled to prevent hydration errors
const Navigation = dynamic(
  () => import('@/components/navigation').then((mod) => mod.Navigation),
  { ssr: false }
);

const MobileNavigation = dynamic(
  () => import('@/components/mobile-navigation').then((mod) => mod.MobileNavigation),
  { ssr: false }
);

// Mock data for live matches
const liveMatches = [
  { id: 1, player1: 'TraderX', player2: 'CryptoNinja', timeLeft: '03:24', potAmount: 25, isPrivate: false },
  { id: 2, player1: 'SolanaKing', player2: 'DefiWarrior', timeLeft: '08:56', potAmount: 50, isPrivate: false },
  { id: 3, player1: 'PerpMaster', player2: 'Waiting...', timeLeft: '--:--', potAmount: 15, isPrivate: true },
];

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

  // Generate a random game code when private mode is enabled
  useEffect(() => {
    if (isPrivate) {
      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      setGameCode(randomCode);
    } else {
      setGameCode('');
    }
  }, [isPrivate]);

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
            <Card className="gaming-card glow-border rounded-xl overflow-hidden hover:shadow-neon transition-all duration-300">
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
                <Button className="w-full bg-cyber-blue hover:bg-cyber-blue/80">
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
                <div>
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-muted-foreground border-b border-dark-border">
                        <th className="text-left pb-2">Players</th>
                        <th className="text-center pb-2">Time Left</th>
                        <th className="text-center pb-2">Pot</th>
                        <th className="text-right pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {liveMatches.map((match) => (
                        <tr key={match.id} className="border-b border-dark-border/50">
                          <td className="py-3">
                            <div className="font-medium">{match.player1} vs {match.player2}</div>
                          </td>
                          <td className="py-3 text-center font-mono">
                            <span className="font-medium text-warning-orange">{match.timeLeft}</span>
                          </td>
                          <td className="py-3 text-center">
                            <span className="text-neon-cyan">{match.potAmount} USDC</span>
                          </td>
                          <td className="py-3 text-right">
                            {match.isPrivate ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-electric-purple/20 text-electric-purple">
                                <Lock className="h-3 w-3 mr-1" /> Private
                              </span>
                            ) : (
                              <Button size="sm" variant="outline" className="h-7 bg-transparent border-cyber-blue text-cyber-blue hover:bg-cyber-blue/20">
                                Join
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="game-code">Game Code</Label>
                  <Input
                    id="game-code"
                    placeholder="Enter code (e.g. AB12CD)"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="font-mono uppercase bg-dark-bg border-dark-border text-white"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-electric-purple hover:bg-electric-purple/80"
                  disabled={joinCode.length < 6}
                >
                  Join Game
                </Button>
              </CardFooter>
            </Card>

            {/* Player Records */}
            <Card className="gaming-card glow-border rounded-xl overflow-hidden hover:border-yellow-500/50 transition-all duration-300 lg:col-span-2">
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
      </div>
      
      <Footer />
      
      <MobileNavigation />
    </div>
  );
}
