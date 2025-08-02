"use client";

import React, { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Trophy, TrendingUp, Clock, User, ChevronDown, ChevronUp, Medal } from 'lucide-react';
import { Footer } from '@/components/footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getTournaments } from "@/lib/tournaments";
import { supabase } from "@/lib/supabase";

// Import components with SSR disabled to prevent hydration errors
const Navigation = dynamic(
  () => import('@/components/navigation').then((mod) => mod.Navigation),
  { ssr: false }
);

const MobileNavigation = dynamic(
  () => import('@/components/mobile-navigation').then((mod) => mod.MobileNavigation),
  { ssr: false }
);

// Define types for our data
type Tournament = {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  prize_pool: number;
  entry_fee: number;
  max_participants: number;
  status: 'upcoming' | 'active' | 'completed';
};

type PvpMatch = {
  id: string;
  winner_id: string;
  loser_id: string;
  winner_score: number;
  loser_score: number;
  match_date: string;
  match_data?: any;
  created_at: string;
  winner?: {
    username: string;
    avatar_url?: string;
  };
  loser?: {
    username: string;
    avatar_url?: string;
  };
};

type UserStats = {
  username: string;
  rank: number;
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: string;
  totalPnl: number;
  highestStreak: number;
  currentStreak: number;
  averageMatchTime: string;
  favoriteToken: string;
};

// Default user stats until we fetch real data
const defaultUserStats: UserStats = {
  username: "Loading...",
  rank: 0,
  totalMatches: 0,
  wins: 0,
  losses: 0,
  winRate: "0%",
  totalPnl: 0,
  highestStreak: 0,
  currentStreak: 0,
  averageMatchTime: "0m",
  favoriteToken: "USDC"
};

// Placeholder data for seasonal performance
const seasonalData = [
  { season: "Season 3 (Current)", rank: 1, wins: 28, losses: 3, winRate: "90.3%", pnl: 42.5 },
  { season: "Season 2", rank: 3, wins: 21, losses: 7, winRate: "75.0%", pnl: 18.3 },
  { season: "Season 1", rank: 8, wins: 12, losses: 10, winRate: "54.5%", pnl: -3.2 }
];

export default function DashboardPage() {
  const [timeframe, setTimeframe] = useState("all");
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [matches, setMatches] = useState<PvpMatch[]>([]);
  const [userStats, setUserStats] = useState<UserStats>(defaultUserStats);
  const [loading, setLoading] = useState({
    tournaments: true,
    matches: true,
    userStats: true
  });
  const [error, setError] = useState<string | null>(null);
  
  // Fetch tournaments from database
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const tournamentData = await getTournaments();
        setTournaments(tournamentData);
      } catch (err) {
        console.error('Error fetching tournaments:', err);
        setError('Failed to load tournaments');
      } finally {
        setLoading(prev => ({ ...prev, tournaments: false }));
      }
    };
    
    fetchTournaments();
  }, []);
  
  // Fetch PVP matches for the activity section
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        // Get user wallet from localStorage
        const walletStr = localStorage.getItem('wallet');
        if (!walletStr) {
          setLoading(prev => ({ ...prev, matches: false }));
          return;
        }
        
        const { wallet } = JSON.parse(walletStr);
        
        // First get the user ID from the wallet address
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('wallet_address', wallet)
          .single();
        
        if (userError || !userData) {
          console.error('Error fetching user:', userError);
          setLoading(prev => ({ ...prev, matches: false }));
          return;
        }
        
        // Now fetch matches where user is either winner or loser
        const { data: matchesData, error: matchesError } = await supabase
          .from('pvp_matches')
          .select(`
            *,
            winner:winner_id(username, avatar_url),
            loser:loser_id(username, avatar_url)
          `)
          .or(`winner_id.eq.${userData.id},loser_id.eq.${userData.id}`)
          .order('match_date', { ascending: false })
          .limit(5);
        
        if (matchesError) throw matchesError;
        
        // Calculate some basic user stats from matches
        if (matchesData && matchesData.length > 0) {
          const allMatches = [...matchesData];
          const wins = allMatches.filter(m => m.winner_id === userData.id).length;
          const losses = allMatches.filter(m => m.loser_id === userData.id).length;
          const totalMatches = wins + losses;
          const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) + '%' : '0%';
          
          // Calculate PnL (simplified calculation for now)
          const totalPnl = allMatches.reduce((sum, match) => {
            if (match.winner_id === userData.id) {
              return sum + (match.winner_score || 0);
            } else {
              return sum - (match.loser_score || 0);
            }
          }, 0);
          
          // Update user stats
          setUserStats({
            username: matchesData[0].winner_id === userData.id 
              ? matchesData[0].winner?.username || 'Anonymous'
              : matchesData[0].loser?.username || 'Anonymous',
            rank: 0, // We'd need a ranking system to determine this
            totalMatches,
            wins,
            losses,
            winRate,
            totalPnl,
            highestStreak: 0, // Would need logic to calculate streaks
            currentStreak: 0,
            averageMatchTime: '15m', // Mock value - would need match duration data
            favoriteToken: 'USDC'
          });
        }
        
        setMatches(matchesData || []);
      } catch (err) {
        console.error('Error fetching matches:', err);
        setError('Failed to load match history');
      } finally {
        setLoading(prev => ({ ...prev, matches: false, userStats: false }));
      }
    };
    
    fetchMatches();
  }, []);

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
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-dark-card border border-dark-border">
            <TabsTrigger value="history" className="data-[state=active]:bg-electric-purple/20 data-[state=active]:text-electric-purple">
              Battle History
            </TabsTrigger>
            <TabsTrigger value="tournaments" className="data-[state=active]:bg-warning-orange/20 data-[state=active]:text-warning-orange">
              Tournaments
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
                      {loading.matches ? (
                        <tr>
                          <td colSpan={6} className="py-3 text-center">Loading match history...</td>
                        </tr>
                      ) : matches.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-3 text-center">No match history available</td>
                        </tr>
                      ) : matches.map((match) => {
                        // Get wallet from localStorage to determine if user is winner or loser
                        let wallet;
                        try {
                          const walletStr = localStorage.getItem('wallet');
                          if (walletStr) {
                            const walletObj = JSON.parse(walletStr);
                            wallet = walletObj.wallet;
                          }
                        } catch (e) {
                          console.error('Error parsing wallet:', e);
                        }
                        
                        // Determine if current user is winner or loser
                        const isWinner = match.winner?.username === userStats.username;
                        const result = isWinner ? 'win' : 'loss';
                        const opponent = isWinner ? match.loser?.username || 'Anonymous' : match.winner?.username || 'Anonymous';
                        
                        // Format date
                        const matchDate = new Date(match.match_date);
                        const formattedDate = `${matchDate.getFullYear()}-${String(matchDate.getMonth() + 1).padStart(2, '0')}-${String(matchDate.getDate()).padStart(2, '0')}`;
                        
                        // Calculate PnL
                        const pnl = isWinner ? match.winner_score : -match.loser_score;
                        
                        return (
                          <tr key={match.id} className="border-b border-dark-border/50">
                            <td className="py-3 text-sm">{formattedDate}</td>
                            <td className="py-3">
                              <div className="font-medium">{opponent}</div>
                            </td>
                            <td className="py-3 text-center">
                              <span className={getResultColor(result)}>
                                {isWinner ? 'Win' : 'Loss'}
                              </span>
                            </td>
                            <td className="py-3 text-center">15m</td>
                            <td className="py-3 text-center">USDC</td>
                            <td className="py-3 text-right font-medium">
                              <span className={getPnLColor(pnl)}>
                                {pnl > 0 ? '+' : ''}{pnl} USDC
                              </span>
                            </td>
                          </tr>
                        );
                      })}
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
          
          <TabsContent value="tournaments" className="space-y-4">
            {loading.tournaments ? (
              <div className="flex justify-center p-8">
                <p>Loading tournaments...</p>
              </div>
            ) : error ? (
              <div className="flex justify-center p-8">
                <p className="text-red-400">{error}</p>
              </div>
            ) : tournaments.length === 0 ? (
              <div className="flex justify-center p-8">
                <p>No tournaments available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tournaments.map((tournament) => {
                  // Format dates
                  const startDate = new Date(tournament.start_date);
                  const endDate = new Date(tournament.end_date);
                  const formattedStartDate = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
                  const formattedEndDate = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
                  
                  // Determine status display
                  let statusDisplay;
                  let statusClass;
                  
                  if (tournament.status === 'upcoming') {
                    statusDisplay = 'Registration Open';
                    statusClass = 'bg-cyber-blue/20 text-cyber-blue';
                  } else if (tournament.status === 'active') {
                    statusDisplay = 'In Progress';
                    statusClass = 'bg-warning-orange/20 text-warning-orange';
                  } else {
                    statusDisplay = 'Completed';
                    statusClass = 'bg-neon-cyan/20 text-neon-cyan';
                  }
                  
                  return (
                    <Card key={tournament.id} className="border border-dark-border bg-dark-card">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-electric-purple font-orbitron">{tournament.name}</CardTitle>
                        <CardDescription>{tournament.description || (tournament.status === 'upcoming' ? 'Upcoming Tournament' : tournament.status === 'active' ? 'Active Tournament' : 'Completed Tournament')}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{tournament.status === 'upcoming' ? 'Start Date' : tournament.status === 'active' ? 'End Date' : 'Ended On'}</span>
                            <span>{tournament.status === 'upcoming' ? formattedStartDate : formattedEndDate}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Entry Fee</span>
                            <span>{tournament.entry_fee} USDC</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Prize Pool</span>
                            <span className="font-medium text-warning-orange">{tournament.prize_pool} USDC</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Status</span>
                            <span className={`${statusClass} text-xs px-2 py-0.5 rounded`}>{statusDisplay}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full bg-transparent border-electric-purple text-electric-purple hover:bg-electric-purple/20">
                          {tournament.status === 'upcoming' ? 'Register Now' : tournament.status === 'active' ? 'View Standings' : 'View Results'}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
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
