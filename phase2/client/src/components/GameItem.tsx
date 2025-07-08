import React from 'react';
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

type GameItemProps = {
  id: string;
  player1: string;
  player2: string;
  player1Rank?: number | string;
  player2Rank?: number | string;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  market: string;
  duration: string;
  stake?: string;
  startTime?: string;
  onClick?: (id: string) => void;
};

export default function GameItem({ 
  id, 
  player1, 
  player2,
  player1Rank = "-", 
  player2Rank = "-",
  status, 
  market, 
  duration, 
  stake = "100",
  startTime,
  onClick 
}: GameItemProps) {
  const [, setLocation] = useLocation();

  // Spectate functionality removed as per requirements

  const handleGameClick = () => {
    if (onClick) {
      onClick(id);
    } else {
      setLocation(`/match/${id}`);
    }
  };

  // Format time since start
  const getTimeSinceStart = () => {
    if (!startTime) return "";
    
    const start = new Date(startTime).getTime();
    const now = Date.now();
    const diffMinutes = Math.floor((now - start) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours}h ${diffMinutes % 60}m ago`;
    }
  };

  // Get status styling
  const getStatusStyles = () => {
    switch (status) {
      case 'active':
        return 'text-profit bg-profit/10 border-profit/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'completed':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'cancelled':
        return 'text-loss bg-loss/10 border-loss/20';
      default:
        return 'text-text-secondary bg-bg-secondary/30 border-neutral/20';
    }
  };

  // Get status label
  const getStatusLabel = () => {
    switch (status) {
      case 'active':
        return 'Live';
      case 'pending':
        return 'Waiting';
      case 'completed':
        return 'Ended';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  // Format rank for display
  const formatRank = (rank: number | string) => {
    if (typeof rank === 'number') {
      if (rank === 1) return "1st";
      if (rank === 2) return "2nd";
      if (rank === 3) return "3rd";
      return `${rank}th`;
    }
    return rank;
  };

  // Get rank badge color
  const getRankBadgeColor = (rank: number | string) => {
    if (typeof rank === 'number') {
      if (rank === 1) return "bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30";
      if (rank === 2) return "bg-[#C0C0C0]/20 text-[#C0C0C0] border-[#C0C0C0]/30";
      if (rank === 3) return "bg-[#CD7F32]/20 text-[#CD7F32] border-[#CD7F32]/30";
      if (rank <= 10) return "bg-accent-primary/10 text-accent-primary border-accent-primary/20";
    }
    return "bg-neutral/10 text-text-secondary border-neutral/20";
  };

  return (
    <div 
      className="flex flex-col lg:flex-row lg:items-center justify-between py-3 sm:py-4 px-3 sm:px-5 border border-neutral/10 rounded-lg bg-bg-primary/30 backdrop-blur-sm hover:bg-bg-secondary/20 transition-all duration-300 cursor-pointer gap-2 sm:gap-3 mb-2 sm:mb-3"
      onClick={handleGameClick}
    >
      <div className="flex items-start sm:items-center flex-col sm:flex-row w-full">
        {/* Status indicator */}
        <div className="flex-shrink-0 mr-2 sm:mr-3 mb-2 sm:mb-0">
          <div className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md border ${getStatusStyles()}`}>
            {status === 'active' && (
              <span className="inline-flex items-center">
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-profit opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-profit"></span>
                </span>
                {getStatusLabel()}
              </span>
            )}
            {status !== 'active' && getStatusLabel()}
          </div>
          {startTime && status === 'active' && (
            <div className="text-xs text-text-secondary mt-1 text-center">
              {getTimeSinceStart()}
            </div>
          )}
        </div>

        {/* Match details */}
        <div className="flex-grow">
          <div className="flex flex-wrap items-center gap-1 mb-1">
            {/* Player 1 with rank */}
            <div className="flex items-center">
              <span className="font-bold text-white">{player1}</span>
              <span className={`ml-1 sm:ml-1.5 text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded-md border ${getRankBadgeColor(player1Rank)}`}>
                {formatRank(player1Rank)}
              </span>
            </div>
            
            <span className="text-text-secondary mx-1.5">vs</span>
             
            {/* Player 2 with rank */}
            <div className="flex items-center">
              <span className="font-bold text-white">{player2}</span>
              <span className={`ml-1 sm:ml-1.5 text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded-md border ${getRankBadgeColor(player2Rank)}`}>
                {formatRank(player2Rank)}
              </span>
            </div>
          </div>
          <div className="text-[10px] sm:text-xs text-text-secondary flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1">
            <div className="flex items-center">
              <i className="ri-coin-line mr-1"></i>
              {market}
            </div>
            <div className="flex items-center">
              <i className="ri-time-line mr-1"></i>
              {duration}
            </div>
            <div className="flex items-center">
              <i className="ri-money-dollar-circle-line mr-1"></i>
              {stake} USDC
            </div>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-center sm:justify-start lg:justify-end lg:ml-auto mt-1.5 lg:mt-0 w-full lg:w-auto">
        
        {status === 'pending' && (
          <Button 
            onClick={handleGameClick}
            size="sm"
            variant="outline"
            className="bg-transparent border-yellow-400/50 hover:bg-yellow-400/20 text-yellow-400 w-full lg:w-auto"
          >
            <i className="ri-user-add-line mr-1.5"></i>
            Join
          </Button>
        )}
        
        {status === 'completed' && (
          <Button 
            onClick={handleGameClick}
            size="sm"
            variant="outline"
            className="bg-transparent border-blue-400/50 hover:bg-blue-400/20 text-blue-400 w-full lg:w-auto"
          >
            <i className="ri-file-list-line mr-1.5"></i>
            Results
          </Button>
        )}
      </div>
    </div>
  );
}
