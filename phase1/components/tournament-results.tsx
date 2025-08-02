"use client";

import React from 'react';
import { 
  Trophy, 
  Medal, 
  TrendingUp, 
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Mock data for tournament standings - this would come from an API in a real app
const mockStandings = [
  { 
    rank: 1, 
    username: 'TraderX', 
    pnl: 28.4, 
    change: 'up', 
    trades: 24,
    avatar: '/avatars/avatar-1.png'
  },
  { 
    rank: 2, 
    username: 'CryptoNinja', 
    pnl: 18.7, 
    change: 'up', 
    trades: 17,
    avatar: '/avatars/avatar-2.png'
  },
  { 
    rank: 3, 
    username: 'SolanaKing', 
    pnl: 12.5, 
    change: 'down', 
    trades: 19,
    avatar: '/avatars/avatar-3.png'
  },
  { 
    rank: 4, 
    username: 'DriftQueen', 
    pnl: 8.2, 
    change: 'up', 
    trades: 14,
    avatar: '/avatars/avatar-4.png'
  },
  { 
    rank: 5, 
    username: 'PerpMaster', 
    pnl: 6.7, 
    change: 'down', 
    trades: 26,
    avatar: '/avatars/avatar-5.png'
  },
  { 
    rank: 6, 
    username: 'LeverageLord', 
    pnl: 5.3, 
    change: 'up', 
    trades: 11,
    avatar: '/avatars/avatar-6.png'
  },
  { 
    rank: 7, 
    username: 'FuturesWiz', 
    pnl: 3.1, 
    change: 'down', 
    trades: 9,
    avatar: '/avatars/avatar-7.png'
  },
  { 
    rank: 8, 
    username: 'TradeFiend', 
    pnl: 0.8, 
    change: 'up', 
    trades: 21,
    avatar: '/avatars/avatar-8.png'
  }
];

export function TournamentResults() {
  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'text-neon-cyan';
    if (pnl < 0) return 'text-red-500';
    return 'text-gray-400';
  };

  const getChangeIcon = (change: string) => {
    if (change === 'up') return <ArrowUpRight className="h-3 w-3 text-neon-cyan" />;
    return <ArrowDownRight className="h-3 w-3 text-red-500" />;
  };

  const getTopRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-yellow-500/5 border-yellow-500/30";
      case 2: 
        return "bg-gradient-to-r from-gray-400/20 to-gray-400/5 border-gray-400/30";
      case 3:
        return "bg-gradient-to-r from-orange-500/20 to-orange-500/5 border-orange-500/30";
      default:
        return "bg-dark-bg/40 border-dark-border";
    }
  };

  const getTopRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-orange-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="gaming-card glow-border rounded-xl overflow-hidden hover:shadow-neon transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-neon-cyan flex items-center">
          <Trophy className="mr-2 h-5 w-5" />
          Current Tournament Standings
        </CardTitle>
        <CardDescription>Weekend Championship - Top 8 Players</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockStandings.map((player) => (
            <div 
              key={player.rank}
              className={`border rounded-lg p-3 ${getTopRankStyle(player.rank)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6">
                    {getTopRankIcon(player.rank) || <span className="text-gray-400">{player.rank}</span>}
                  </div>
                  <div className="font-orbitron font-medium">{player.username}</div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-xs flex items-center gap-1">
                    {getChangeIcon(player.change)}
                    <span className="text-gray-400">{player.trades} trades</span>
                  </div>
                  
                  <div className={`font-semibold text-right min-w-[60px] ${getPnLColor(player.pnl)}`}>
                    {player.pnl > 0 ? '+' : ''}{player.pnl}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full bg-transparent border-neon-cyan text-neon-cyan hover:bg-neon-cyan/20">
          <TrendingUp className="h-4 w-4 mr-2" />
          View Full Leaderboard
        </Button>
      </CardFooter>
    </Card>
  );
}
