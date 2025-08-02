'use client';

import { useState, useEffect } from 'react';
import { getRecentMatches } from '@/lib/matches';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSupabaseWallet } from '@/hooks/useSupabaseWallet';
import { Loader2, Swords } from 'lucide-react';

interface User {
  id: string;
  wallet_address: string;
  username?: string;
  avatar_url?: string;
}

interface Match {
  id: string;
  match_date: string;
  winner_id: string;
  loser_id: string;
  winner: User[] | User;
  loser: User[] | User;
  winner_score: number;
  loser_score: number;
  match_data?: any;
}

const getUserFromResult = (userResult: User | User[] | null | undefined): User | undefined => {
  if (!userResult) return undefined;
  return Array.isArray(userResult) ? userResult[0] : userResult;
};

export default function RecentMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const { connected, user } = useSupabaseWallet();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        // Convert to unknown first and then to Match[] to avoid type errors
        const data = await getRecentMatches(10);
        setMatches(data as unknown as Match[]);
      } catch (err) {
        console.error('Error fetching recent matches:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatches();
  }, []);

  const truncateAddress = (address?: string): string => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getUsername = (user: User): string => {
    if (!user) return 'Anonymous';
    return user.username || truncateAddress(user.wallet_address) || 'Anonymous';
  };

  const getUserInitials = (user?: User): string => {
    if (!user) return '??';
    
    if (user.username) {
      return user.username.slice(0, 2).toUpperCase();
    } else if (user.wallet_address) {
      return user.wallet_address.slice(0, 2).toUpperCase();
    } else {
      return '??';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric', 
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <CardHeader className="bg-cyber-blue/20 pb-4">
        <CardTitle className="text-xl text-cyber-blue flex items-center">
          <Swords className="h-5 w-5 mr-2" />
          Recent PVP Matches
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-4">
        {matches.length === 0 ? (
          <div className="py-4 text-center text-gray-400">
            No recent matches found
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div 
                key={match.id} 
                className="flex items-center justify-between bg-dark-bg/50 p-3 rounded-md border border-dark-border"
              >
                <div className="flex items-center space-x-6">
                  {/* Winner */}
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2 ring-1 ring-warning-orange">
                      <AvatarImage src={getUserFromResult(match.winner)?.avatar_url} />
                      <AvatarFallback className="bg-warning-orange/20 text-xs">
                        {getUserInitials(getUserFromResult(match.winner))}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {getUserFromResult(match.winner)?.username || truncateAddress(getUserFromResult(match.winner)?.wallet_address)}
                      </p>
                      <p className="text-warning-orange text-xs font-medium">Winner</p>
                    </div>
                  </div>
                  
                  {/* VS */}
                  <div className="flex flex-col items-center">
                    <div className="text-gray-400 text-xs">VS</div>
                    <div className="text-gray-500 text-xs">{formatDate(match.match_date)}</div>
                  </div>
                  
                  {/* Loser */}
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={getUserFromResult(match.loser)?.avatar_url} />
                      <AvatarFallback className="bg-gray-700/50 text-xs">
                        {getUserInitials(getUserFromResult(match.loser))}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <span className="text-xs text-zinc-500">{truncateAddress(getUserFromResult(match.loser)?.wallet_address || '')}</span>
                      </div>
                      <p className="text-gray-400 text-xs">Challenger</p>
                    </div>
                  </div>
                </div>
                
                {/* Score */}
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <span className="text-xs text-zinc-500">{truncateAddress(getUserFromResult(match.winner)?.wallet_address || '')}</span>
                </div>
                <div className="text-lg font-semibold">
                  <span className="text-warning-orange">{match.winner_score}</span>
                  <span className="text-gray-500 mx-1">:</span>
                  <span className="text-gray-400">{match.loser_score}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
