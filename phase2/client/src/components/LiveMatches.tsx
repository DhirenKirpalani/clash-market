import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useMatch } from "@/hooks/useMatch";
import { useToast } from "@/hooks/use-toast";

type LiveMatch = {
  id: string;
  player1: {
    username: string;
    pnl: number;
    isOnline: boolean;
  };
  player2: {
    username: string;
    pnl: number;
    isOnline: boolean;
  };
  timeRemaining: number;
  market: string;
  isGroupMatch: boolean;
};

export default function LiveMatches() {
  const { spectateMatch } = useMatch();
  const { toast } = useToast();
  const [formattedTimes, setFormattedTimes] = useState<Record<string, string>>({});

  const { data: liveMatches, isLoading } = useQuery<LiveMatch[]>({
    queryKey: ['/api/matches/live'],
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Format and update remaining time every second
  useEffect(() => {
    if (!liveMatches?.length) return;

    const updateTimes = () => {
      const newTimes: Record<string, string> = {};
      liveMatches.forEach(match => {
        const minutes = Math.floor(match.timeRemaining / 60);
        const seconds = match.timeRemaining % 60;
        newTimes[match.id] = `${minutes}:${seconds.toString().padStart(2, '0')} remaining`;
      });
      setFormattedTimes(newTimes);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [liveMatches]);

  const handleSpectate = async (matchId: string) => {
    try {
      await spectateMatch(matchId);
      toast({
        title: "Spectating Match",
        description: "You are now spectating the match.",
      });
    } catch (error) {
      toast({
        title: "Failed to Spectate",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-manrope font-bold">Live Matches</h2>
        <a href="#" className="text-accent-primary text-sm flex items-center">
          View All
          <i className="ri-arrow-right-line ml-1"></i>
        </a>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="flex space-x-4 min-w-max">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="w-80 h-48 rounded-xl" />
            ))
          ) : liveMatches?.length ? (
            liveMatches.map((match) => (
              <Card key={match.id} className={`gradient-card rounded-xl p-4 border border-neutral/20 w-80 ${match.isGroupMatch ? 'relative' : ''}`}>
                {match.isGroupMatch && (
                  <div className="absolute -top-2 -right-2 bg-accent-secondary text-xs px-2 py-1 rounded-full text-white">
                    Group Match
                  </div>
                )}
                <CardContent className="p-0">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <div className="relative">
                        <div className={`h-10 w-10 rounded-full bg-bg-primary border-2 ${match.player1.pnl >= 0 ? 'border-profit' : 'border-loss'} flex items-center justify-center overflow-hidden`}>
                          <span className="text-sm font-medium">{match.player1.username.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <span className={`absolute bottom-0 right-0 w-3 h-3 ${match.player1.isOnline ? 'bg-profit' : 'bg-neutral'} rounded-full border border-bg-primary`}></span>
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">{match.player1.username}</p>
                        <p className={`text-xs ${match.player1.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                          {match.player1.pnl >= 0 ? '+' : ''}{match.player1.pnl}%
                        </p>
                      </div>
                    </div>
                    <div className="text-center px-2">
                      <span className="text-text-secondary text-xs">vs</span>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-3 text-right">
                        <p className="font-medium">{match.player2.username}</p>
                        <p className={`text-xs ${match.player2.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                          {match.player2.pnl >= 0 ? '+' : ''}{match.player2.pnl}%
                        </p>
                      </div>
                      <div className="relative">
                        <div className={`h-10 w-10 rounded-full bg-bg-primary border-2 ${match.player2.pnl >= 0 ? 'border-profit' : 'border-loss'} flex items-center justify-center overflow-hidden`}>
                          <span className="text-sm font-medium">{match.player2.username.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <span className={`absolute bottom-0 right-0 w-3 h-3 ${match.player2.isOnline ? 'bg-profit' : 'bg-neutral'} rounded-full border border-bg-primary`}></span>
                      </div>
                    </div>
                  </div>
                  <div className="relative h-1.5 bg-bg-primary rounded-full mb-3">
                    <div 
                      className={`absolute top-0 left-0 h-full ${match.player1.pnl >= match.player2.pnl ? 'bg-profit' : 'bg-loss'} rounded-full`}
                      style={{ 
                        width: `${Math.abs(match.player1.pnl) / (Math.abs(match.player1.pnl) + Math.abs(match.player2.pnl) + 0.01) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between mb-4 text-xs">
                    <span className="text-text-secondary">{formattedTimes[match.id] || `${Math.floor(match.timeRemaining / 60)}:${(match.timeRemaining % 60).toString().padStart(2, '0')} remaining`}</span>
                    <span className="text-text-secondary">{match.market}</span>
                  </div>
                  <Button 
                    className="w-full py-2 bg-bg-primary/60 hover:bg-bg-primary text-text-primary rounded-lg text-sm transition-colors"
                    onClick={() => handleSpectate(match.id)}
                  >
                    Spectate
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex-1 text-center py-8 text-text-secondary">
              No live matches available right now. Be the first to start one!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
