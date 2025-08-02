'use client';

import { useState, useEffect } from 'react';
import { getWeeklyRankings, getCurrentWeekInfo } from '@/lib/rankings';
import { useSupabaseWallet } from '@/hooks/useSupabaseWallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Medal, ChevronDown, ChevronUp, Minus, Loader2 } from 'lucide-react';

// Define the type for ranking items
interface UserData {
  id: string;
  wallet_address: string;
  username?: string;
  avatar_url?: string | null;
}

interface RankingItem {
  id: any;
  rank: number;
  points: number;
  user_id: string;
  rank_change?: number;
  users: UserData | any; // Use any type to accommodate both single object and array formats
}

export default function WeeklyRankings() {
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { weekNumber, year } = getCurrentWeekInfo();
  const { user } = useSupabaseWallet();
  
  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);
        const data = await getWeeklyRankings(weekNumber, year);
        // Force the type to match our RankingItem[] type
        setRankings(data as unknown as RankingItem[]);
      } catch (error) {
        console.error('Error fetching rankings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRankings();
  }, [weekNumber, year]);
  
  const getUserInitials = (user: any) => {
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    } else if (user?.wallet_address) {
      return user.wallet_address.slice(0, 2).toUpperCase();
    } else {
      return '??';
    }
  };
  
  const formatWalletAddress = (address: string | undefined) => {
    if (!address) return '???';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  const getRankChangeIcon = (change: number | undefined) => {
    if (!change) return <Minus className="h-4 w-4 text-gray-500" />;
    if (change > 0) return <ChevronUp className="h-4 w-4 text-emerald-500" />;
    if (change < 0) return <ChevronDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };
  
  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-amber-700';
    return 'text-gray-500';
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-electric-purple" />
      </div>
    );
  }
  
  return (
    <Card className="bg-dark-bg/80 border-dark-border">
      <CardHeader className="bg-electric-purple/20 pb-4">
        <CardTitle className="text-xl text-electric-purple flex items-center justify-between">
          <span>Weekly Rankings</span>
          <span className="text-sm font-normal text-gray-400">
            Week {weekNumber}, {year}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {rankings.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            No rankings available for this week
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Points</TableHead>
                <TableHead className="text-right w-16">Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankings.map((item) => {
                const isCurrentUser = user?.id === item.user_id;
                
                return (
                  <TableRow 
                    key={item.id} 
                    className={`hover:bg-gray-900/20 ${isCurrentUser ? 'bg-electric-purple/10' : ''}`}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {item.rank <= 3 ? (
                          <Medal className={`h-4 w-4 mr-1 ${getMedalColor(item.rank)}`} />
                        ) : null}
                        {item.rank}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={item.users?.avatar_url || undefined} />
                          <AvatarFallback className="bg-electric-purple/20 text-xs">
                            {getUserInitials(item.users)}
                          </AvatarFallback>
                        </Avatar>
                        <span className={isCurrentUser ? 'font-medium text-electric-purple' : ''}>
                          {item.users?.username || formatWalletAddress(item.users?.wallet_address)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {item.points.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end">
                        {getRankChangeIcon(item.rank_change)}
                        <span className={`ml-1 ${
                          !item.rank_change ? 'text-gray-500' :
                          item.rank_change > 0 ? 'text-emerald-500' :
                          'text-red-500'
                        }`}>
                          {item.rank_change ? Math.abs(item.rank_change) : '-'}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
