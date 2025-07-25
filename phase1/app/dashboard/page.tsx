"use client";

import React, { useState } from "react";
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Trophy, TrendingUp, Clock, User, ChevronDown, ChevronUp, Medal } from 'lucide-react';
import { Footer } from '@/components/footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Import components with SSR disabled to prevent hydration errors
const Navigation = dynamic(
  () => import('@/components/navigation').then((mod) => mod.Navigation),
  { ssr: false }
);

const MobileNavigation = dynamic(
  () => import('@/components/mobile-navigation').then((mod) => mod.MobileNavigation),
  { ssr: false }
);

// Mock data for battle statistics
const userStats = {
  username: "TraderX",
  rank: 1,
  totalMatches: 31,
  wins: 28,
  losses: 3,
  winRate: "90.3%",
  totalPnl: 42.5,
  highestStreak: 12,
  currentStreak: 4,
  averageMatchTime: "24m",
  favoriteToken: "USDC"
};

// Mock data for battle history
const battleHistory = [
  { id: 1, opponent: "CryptoNinja", result: "win", date: "2025-07-11", pnl: 8.2, token: "USDC", duration: "18m" },
  { id: 2, opponent: "SolanaKing", result: "win", date: "2025-07-10", pnl: 5.5, token: "USDC", duration: "32m" },
  { id: 3, opponent: "DeFiWarrior", result: "win", date: "2025-07-08", pnl: 12.3, token: "ETH", duration: "26m" },
  { id: 4, opponent: "PerpMaster", result: "loss", date: "2025-07-05", pnl: -6.5, token: "SOL", duration: "41m" },
  { id: 5, opponent: "LiquidatorX", result: "win", date: "2025-07-03", pnl: 7.8, token: "USDC", duration: "15m" }
];

// Mock data for seasonal performance
const seasonalData = [
  { season: "Season 3 (Current)", rank: 1, wins: 28, losses: 3, winRate: "90.3%", pnl: 42.5 },
  { season: "Season 2", rank: 3, wins: 21, losses: 7, winRate: "75.0%", pnl: 18.3 },
  { season: "Season 1", rank: 8, wins: 12, losses: 10, winRate: "54.5%", pnl: -3.2 }
];

export default function DashboardPage() {
  const [timeframe, setTimeframe] = useState("all");

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'text-neon-cyan';
    if (pnl < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getResultColor = (result: string) => {
    if (result === 'win') return 'text-neon-cyan';
    if (result === 'loss') return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <Navigation />
      
      <div className="pt-24 pb-20 max-w-6xl mx-auto px-4">
        <div className="flex items-center mb-8">
          <Link href="/games" className="mr-4 p-2 hover:bg-dark-card rounded-full">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Games</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-orbitron font-bold gradient-text-primary">
            Battle Dashboard
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <Card className="border border-dark-border bg-dark-card md:col-span-3">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="relative">
                    <div className="w-20 h-20 bg-electric-purple/20 rounded-full flex items-center justify-center">
                      <User className="h-10 w-10 text-electric-purple" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-neon-cyan text-dark-bg rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      #{userStats.rank}
                    </div>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-2xl font-orbitron font-bold">{userStats.username}</h2>
                    <p className="text-sm text-muted-foreground">Top ranked player</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="px-4">
                    <div className="text-2xl font-bold">{userStats.totalMatches}</div>
                    <div className="text-xs text-muted-foreground">Matches</div>
                  </div>
                  <div className="px-4">
                    <div className="text-2xl font-bold text-neon-cyan">{userStats.winRate}</div>
                    <div className="text-xs text-muted-foreground">Win Rate</div>
                  </div>
                  <div className="px-4">
                    <div className="text-2xl font-bold">{userStats.highestStreak}</div>
                    <div className="text-xs text-muted-foreground">Best Streak</div>
                  </div>
                  <div className="px-4">
                    <div className={`text-2xl font-bold ${getPnLColor(userStats.totalPnl)}`}>
                      {userStats.totalPnl > 0 ? '+' : ''}{userStats.totalPnl} USDC
                    </div>
                    <div className="text-xs text-muted-foreground">Total P&L</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Performance Chart Card */}
          <Card className="border border-dark-border bg-dark-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl text-electric-purple font-orbitron">Performance</CardTitle>
              <CardDescription>Win/loss breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="w-[120px] bg-dark-bg border-dark-border">
                    <SelectValue placeholder="Timeframe" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-bg border-dark-border">
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="season">This Season</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex h-48 items-end justify-between px-2">
                <div className="flex flex-col items-center">
                  <div className="bg-neon-cyan/80 w-12 h-[90%] rounded-t"></div>
                  <div className="mt-2 text-sm">Wins</div>
                  <div className="font-bold text-neon-cyan">{userStats.wins}</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-red-400/80 w-12 h-[10%] rounded-t"></div>
                  <div className="mt-2 text-sm">Losses</div>
                  <div className="font-bold text-red-400">{userStats.losses}</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-gradient-to-t from-neon-cyan to-electric-purple w-12" style={{height: '85%', borderTopLeftRadius: '0.25rem', borderTopRightRadius: '0.25rem'}}></div>
                  <div className="mt-2 text-sm">Win Rate</div>
                  <div className="font-bold">{userStats.winRate}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Streak Card */}
          <Card className="border border-dark-border bg-dark-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl text-cyber-blue font-orbitron">Current Streak</CardTitle>
              <CardDescription>Win consistency</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex flex-col items-center justify-center h-48">
                <div className="text-7xl font-orbitron font-bold text-cyber-blue mb-2">
                  {userStats.currentStreak}
                </div>
                <div className="text-sm text-muted-foreground">Current Win Streak</div>
                <div className="mt-4 flex items-center">
                  <Trophy className="h-5 w-5 text-warning-orange mr-2" />
                  <div>
                    <span>Best: </span>
                    <span className="font-bold text-warning-orange">{userStats.highestStreak}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Stats Card */}
          <Card className="border border-dark-border bg-dark-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl text-neon-cyan font-orbitron">Battle Stats</CardTitle>
              <CardDescription>Additional metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">Average Match Duration</div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="font-bold">{userStats.averageMatchTime}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">Favorite Token</div>
                  <div className="font-bold">{userStats.favoriteToken}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">Win-Loss Ratio</div>
                  <div className="font-bold text-neon-cyan">{userStats.wins}:{userStats.losses}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">Current Season Rank</div>
                  <div className="flex items-center">
                    <Medal className="h-4 w-4 mr-1 text-warning-orange" />
                    <span className="font-bold">#{userStats.rank}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="history" className="w-full mb-8">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-dark-card border border-dark-border">
            <TabsTrigger value="history" className="data-[state=active]:bg-electric-purple/20 data-[state=active]:text-electric-purple">
              Battle History
            </TabsTrigger>
            <TabsTrigger value="seasons" className="data-[state=active]:bg-cyber-blue/20 data-[state=active]:text-cyber-blue">
              Seasonal Performance
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="history" className="space-y-4">
            <Card className="border border-dark-border bg-dark-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-electric-purple font-orbitron">Recent Battles</CardTitle>
                <CardDescription>Your latest match results</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-muted-foreground border-b border-dark-border">
                        <th className="text-left pb-2">Date</th>
                        <th className="text-left pb-2">Opponent</th>
                        <th className="text-center pb-2">Result</th>
                        <th className="text-center pb-2">Duration</th>
                        <th className="text-center pb-2">Token</th>
                        <th className="text-right pb-2">P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {battleHistory.map((battle) => (
                        <tr key={battle.id} className="border-b border-dark-border/50">
                          <td className="py-3 text-sm">{battle.date}</td>
                          <td className="py-3">
                            <div className="font-medium">{battle.opponent}</div>
                          </td>
                          <td className="py-3 text-center">
                            <span className={getResultColor(battle.result)}>
                              {battle.result === 'win' ? 'Win' : 'Loss'}
                            </span>
                          </td>
                          <td className="py-3 text-center">{battle.duration}</td>
                          <td className="py-3 text-center">{battle.token}</td>
                          <td className="py-3 text-right font-medium">
                            <span className={getPnLColor(battle.pnl)}>
                              {battle.pnl > 0 ? '+' : ''}{battle.pnl} {battle.token}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full bg-transparent border-electric-purple text-electric-purple hover:bg-electric-purple/20">
                  View All Battles
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="seasons" className="space-y-4">
            <Card className="border border-dark-border bg-dark-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-cyber-blue font-orbitron">Seasonal Records</CardTitle>
                <CardDescription>Your performance across seasons</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-muted-foreground border-b border-dark-border">
                        <th className="text-left pb-2">Season</th>
                        <th className="text-center pb-2">Rank</th>
                        <th className="text-center pb-2">W/L</th>
                        <th className="text-center pb-2">Win Rate</th>
                        <th className="text-right pb-2">P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seasonalData.map((season, index) => (
                        <tr key={index} className="border-b border-dark-border/50">
                          <td className="py-3">
                            <div className="font-medium">{season.season}</div>
                          </td>
                          <td className="py-3 text-center">
                            {season.rank <= 3 ? (
                              <div className="inline-flex items-center">
                                <Trophy className={`h-4 w-4 mr-1 ${
                                  season.rank === 1 ? 'text-warning-orange' : 
                                  season.rank === 2 ? 'text-gray-300' : 'text-amber-700'
                                }`} />
                                #{season.rank}
                              </div>
                            ) : (
                              <div>#{season.rank}</div>
                            )}
                          </td>
                          <td className="py-3 text-center">
                            <span className="text-neon-cyan">{season.wins}</span>
                            <span className="text-muted-foreground">/{season.losses}</span>
                          </td>
                          <td className="py-3 text-center">{season.winRate}</td>
                          <td className="py-3 text-right font-medium">
                            <span className={getPnLColor(season.pnl)}>
                              {season.pnl > 0 ? '+' : ''}{season.pnl} USDC
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
      
      <MobileNavigation />
    </div>
  );
}
