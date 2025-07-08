// import { useState } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import TradingChart from "@/components/TradingChart";
// import OrderPanel from "@/components/OrderPanel";
// import PositionPanel from "@/components/PositionPanel";
// import ActivityFeed from "@/components/ActivityFeed";
// import { useMatch } from "@/hooks/useMatch";
// import { useToast } from "@/hooks/use-toast";

// export default function MatchDashboard() {
//   const { activeMatch, forfeitMatch, timeRemaining, formatTime } = useMatch();
//   const { toast } = useToast();
//   const [showSpectators, setShowSpectators] = useState(false);

//   const handleForfeit = async () => {
//     if (!activeMatch) return;
    
//     try {
//       await forfeitMatch();
//       toast({
//         title: "Match Forfeited",
//         description: "You have forfeited the current match",
//       });
//     } catch (error) {
//       toast({
//         title: "Failed to Forfeit",
//         description: error instanceof Error ? error.message : "Unknown error occurred",
//         variant: "destructive"
//       });
//     }
//   };

//   if (!activeMatch) {
//     return (
//       <div className="text-center py-12">
//         <div className="text-text-secondary">No active match available</div>
//       </div>
//     );
//   }

//   const leadingPlayer = activeMatch.player.pnl >= activeMatch.opponent.pnl ? 'player' : 'opponent';
//   const progressWidth = Math.abs(activeMatch.player.pnl) / (Math.abs(activeMatch.player.pnl) + Math.abs(activeMatch.opponent.pnl) + 0.01) * 100;

//   return (
//     <div>
//       <Card className="gradient-card rounded-xl p-5 border border-neutral/20 mb-6">
//         <CardContent className="p-0">
//           <div className="flex flex-col lg:flex-row justify-between mb-4">
//             <div className="mb-4 lg:mb-0">
//               <h2 className="text-2xl font-manrope font-bold mb-2">Live Match: You vs {activeMatch.opponent.username}</h2>
//               <div className="flex items-center text-sm text-text-secondary">
//                 <span className="flex items-center mr-4">
//                   <i className="ri-time-line mr-1"></i>
//                   {formatTime(timeRemaining)} remaining
//                 </span>
//                 <span className="flex items-center">
//                   <i className="ri-coin-line mr-1"></i>
//                   Trading {activeMatch.market}
//                 </span>
//               </div>
//             </div>
//             <div className="flex space-x-3">
//               <Button 
//                 variant="outline"
//                 className="bg-bg-primary"
//                 onClick={() => setShowSpectators(!showSpectators)}
//               >
//                 <i className="ri-eye-line mr-1"></i>
//                 Spectators ({activeMatch.spectators.length})
//               </Button>
//               <Button 
//                 variant="destructive"
//                 className="hover:bg-loss"
//                 onClick={handleForfeit}
//               >
//                 <i className="ri-close-line mr-1"></i>
//                 Forfeit
//               </Button>
//             </div>
//           </div>
          
//           {showSpectators && activeMatch.spectators.length > 0 && (
//             <div className="mb-4 p-3 bg-bg-primary rounded-lg">
//               <p className="font-medium mb-2">Spectators</p>
//               <div className="flex flex-wrap gap-2">
//                 {activeMatch.spectators.map((spectator, index) => (
//                   <div key={index} className="flex items-center bg-bg-secondary rounded-full px-3 py-1">
//                     <Avatar className="h-5 w-5 mr-2">
//                       <AvatarFallback className="text-xs">{spectator.slice(0, 2)}</AvatarFallback>
//                     </Avatar>
//                     <span className="text-sm">{spectator}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
          
//           <div className="flex justify-between items-center p-3 bg-bg-primary rounded-lg mb-6">
//             <div className="flex items-center">
//               <div className={`h-10 w-10 rounded-full bg-bg-secondary border-2 ${activeMatch.player.pnl >= 0 ? 'border-profit' : 'border-loss'} flex items-center justify-center overflow-hidden mr-3`}>
//                 <span className="text-sm font-medium">You</span>
//               </div>
//               <div>
//                 <p className="font-medium">Your PnL</p>
//                 <p className={`${activeMatch.player.pnl >= 0 ? 'text-profit' : 'text-loss'} font-mono font-medium`}>
//                   {activeMatch.player.pnl >= 0 ? '+' : ''}{activeMatch.player.pnl}%
//                 </p>
//               </div>
//             </div>
//             <div className="text-center">
//               <div className="relative w-48 h-1.5 bg-bg-secondary rounded-full mb-1">
//                 <div 
//                   className={`absolute top-0 ${leadingPlayer === 'player' ? 'left-0' : 'right-0'} h-full ${leadingPlayer === 'player' ? 'bg-profit' : 'bg-loss'} rounded-full`}
//                   style={{ width: `${progressWidth}%` }}
//                 ></div>
//               </div>
//               <p className="text-xs text-text-secondary">
//                 {leadingPlayer === 'player' ? "You're leading!" : "Your opponent is ahead!"}
//               </p>
//             </div>
//             <div className="flex items-center">
//               <div>
//                 <p className="font-medium text-right">Opponent PnL</p>
//                 <p className={`${activeMatch.opponent.pnl >= 0 ? 'text-profit' : 'text-loss'} font-mono font-medium text-right`}>
//                   {activeMatch.opponent.pnl >= 0 ? '+' : ''}{activeMatch.opponent.pnl}%
//                 </p>
//               </div>
//               <div className={`h-10 w-10 rounded-full bg-bg-secondary border-2 ${activeMatch.opponent.pnl >= 0 ? 'border-profit' : 'border-loss'} flex items-center justify-center overflow-hidden ml-3`}>
//                 <span className="text-sm font-medium">{activeMatch.opponent.username.slice(0, 2).toUpperCase()}</span>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Chart and Trading Panel */}
//         <div className="lg:col-span-2">
//           {/* Trading Chart */}
//           <TradingChart market={activeMatch.market} />
          
//           {/* Order Panel */}
//           <OrderPanel />
//         </div>
        
//         {/* Position & Activity Panel */}
//         <div className="lg:col-span-1">
//           {/* Current Position */}
//           <PositionPanel />
          
//           {/* Activity Feed */}
//           <ActivityFeed matchId={activeMatch.id} />
//         </div>
//       </div>
//     </div>
//   );
// }

// import { useState } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import TradingChart from "@/components/TradingChart";
// import OrderPanel from "@/components/OrderPanel";
// import PositionPanel from "@/components/PositionPanel";
// import ActivityFeed from "@/components/ActivityFeed";
// import { useMatch } from "@/hooks/useMatch";
// import { useToast } from "@/hooks/use-toast";

// export default function MatchDashboard() {
//   const { activeMatch, forfeitMatch, timeRemaining, formatTime } = useMatch();
//   const { toast } = useToast();
//   const [showSpectators, setShowSpectators] = useState(false);

//   const handleForfeit = async () => {
//     if (!activeMatch) return;

//     try {
//       await forfeitMatch();
//       toast({
//         title: "Match Forfeited",
//         description: "You have forfeited the current match",
//       });
//     } catch (error) {
//       toast({
//         title: "Failed to Forfeit",
//         description: error instanceof Error ? error.message : "Unknown error occurred",
//         variant: "destructive",
//       });
//     }
//   };

//   if (!activeMatch) {
//     return (
//       <div className="text-center py-12">
//         <div className="text-text-secondary">No active match available</div>
//       </div>
//     );
//   }

//   const playerPnL = activeMatch.player.pnl;
//   const opponentPnL = activeMatch.opponent.pnl;
//   const leadingPlayer = playerPnL >= opponentPnL ? "player" : "opponent";

//   const total = Math.abs(playerPnL) + Math.abs(opponentPnL) + 0.01;
//   const playerProgress = (Math.abs(playerPnL) / total) * 100;

//   return (
//     <div>
//       {/* Match Header Card */}
//       <Card className="gradient-card rounded-xl p-5 border border-neutral/20 mb-6">
//         <CardContent className="p-0">
//           {/* Header */}
//           <div className="flex flex-col lg:flex-row justify-between mb-4">
//             <div className="mb-4 lg:mb-0">
//               <h2 className="text-2xl font-manrope font-bold mb-2">
//                 Live Match: You vs {activeMatch.opponent.username}
//               </h2>
//               <div className="flex items-center text-sm text-text-secondary">
//                 <span className="flex items-center mr-4">
//                   <i className="ri-time-line mr-1" />
//                   {formatTime(timeRemaining)} remaining
//                 </span>
//                 <span className="flex items-center">
//                   <i className="ri-coin-line mr-1" />
//                   Trading {activeMatch.market}
//                 </span>
//               </div>
//             </div>
//             <div className="flex space-x-3">
//               <Button
//                 variant="outline"
//                 className="bg-bg-primary"
//                 onClick={() => setShowSpectators(!showSpectators)}
//               >
//                 <i className="ri-eye-line mr-1" />
//                 Spectators ({activeMatch.spectators.length})
//               </Button>
//               <Button
//                 variant="destructive"
//                 className="hover:bg-loss"
//                 onClick={handleForfeit}
//               >
//                 <i className="ri-close-line mr-1" />
//                 Forfeit
//               </Button>
//             </div>
//           </div>

//           {/* Spectators List */}
//           {showSpectators && activeMatch.spectators.length > 0 && (
//             <div className="mb-4 p-3 bg-bg-primary rounded-lg">
//               <p className="font-medium mb-2">Spectators</p>
//               <div className="flex flex-wrap gap-2">
//                 {activeMatch.spectators.map((spectator, index) => (
//                   <div
//                     key={index}
//                     className="flex items-center bg-bg-secondary rounded-full px-3 py-1"
//                     title={spectator}
//                   >
//                     <Avatar className="h-5 w-5 mr-2">
//                       <AvatarFallback className="text-xs">
//                         {spectator.slice(0, 2)}
//                       </AvatarFallback>
//                     </Avatar>
//                     <span className="text-sm truncate">{spectator}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* PnL Progress Bar */}
//           <div className="flex justify-between items-center p-3 bg-bg-primary rounded-lg mb-6">
//             {/* Player */}
//             <div className="flex items-center">
//               <div
//                 className={`h-10 w-10 rounded-full bg-bg-secondary border-2 ${
//                   playerPnL >= 0 ? "border-profit" : "border-loss"
//                 } flex items-center justify-center overflow-hidden mr-3`}
//               >
//                 <span className="text-sm font-medium">You</span>
//               </div>
//               <div>
//                 <p className="font-medium">Your PnL</p>
//                 <p
//                   className={`${
//                     playerPnL >= 0 ? "text-profit" : "text-loss"
//                   } font-mono font-medium`}
//                 >
//                   {playerPnL >= 0 ? "+" : ""}
//                   {playerPnL}%
//                 </p>
//               </div>
//             </div>

//             {/* Progress Indicator */}
//             <div className="text-center">
//               <div className="relative w-48 h-1.5 bg-bg-secondary rounded-full mb-1">
//                 <div
//                   className={`absolute top-0 h-full ${
//                     leadingPlayer === "player" ? "bg-profit left-0" : "bg-loss right-0"
//                   } rounded-full`}
//                   style={{ width: `${playerProgress}%` }}
//                 />
//               </div>
//               <p className="text-xs text-text-secondary">
//                 {leadingPlayer === "player"
//                   ? "You're leading!"
//                   : "Your opponent is ahead!"}
//               </p>
//             </div>

//             {/* Opponent */}
//             <div className="flex items-center">
//               <div>
//                 <p className="font-medium text-right">Opponent PnL</p>
//                 <p
//                   className={`${
//                     opponentPnL >= 0 ? "text-profit" : "text-loss"
//                   } font-mono font-medium text-right`}
//                 >
//                   {opponentPnL >= 0 ? "+" : ""}
//                   {opponentPnL}%
//                 </p>
//               </div>
//               <div
//                 className={`h-10 w-10 rounded-full bg-bg-secondary border-2 ${
//                   opponentPnL >= 0 ? "border-profit" : "border-loss"
//                 } flex items-center justify-center overflow-hidden ml-3`}
//               >
//                 <span className="text-sm font-medium">
//                   {activeMatch.opponent.username.slice(0, 2).toUpperCase()}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Grid Layout */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Chart and Order Panel */}
//         <div className="lg:col-span-2 space-y-6">
//           <TradingChart market={activeMatch.market} />
//           <OrderPanel />
//         </div>

//         {/* Position & Activity */}
//         <div className="lg:col-span-1 space-y-6">
//           <PositionPanel />
//           <ActivityFeed matchId={activeMatch.id} />
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import MarketsList from "./MarketsList";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import TradingChart from "@/components/TradingChart";
import OrderPanel from "@/components/OrderPanel";
import PositionPanel from "@/components/PositionPanel";
import ActivityFeed from "@/components/ActivityFeed";
import { useMatch } from "@/hooks/useMatch";
import { useToast } from "@/hooks/use-toast";

// Define the Match interface directly in this file
interface Match {
  id: string;
  market: string;
  duration: number;
  startTime: number;
  player: {
    username: string;
    pnl: number;
  };
  opponent: {
    username: string;
    pnl: number;
  };
  spectators: string[];
  status: string;
}

interface MatchDashboardProps {
  activeMatch: Match | null;
}

export default function MatchDashboard({ activeMatch }: MatchDashboardProps) {
  const { forfeitMatch, timeRemaining, formatTime, setActiveMatch, resetMatch } = useMatch();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showSpectators, setShowSpectators] = useState(false);
  
  // Get the same market data used in CreateGamePanel from localStorage
  const [storedMarket] = useState<string>(() => {
    return localStorage.getItem("cryptoclash_market") || "ETH-PERP";
  });
  
  const [storedStake] = useState<string>(() => {
    return localStorage.getItem("cryptoclash_stake") || "100";
  });
  
  const [storedDuration] = useState<string>(() => {
    return localStorage.getItem("cryptoclash_duration") || "10 m";
  });
  
  // Track and display timer locally to ensure it's accurate
  const [localTimeRemaining, setLocalTimeRemaining] = useState<number | null>(null);
  
  // Initialize and maintain a local timer based on match data
  useEffect(() => {
    if (!activeMatch) return;
    
    // Initialize by calculating remaining time from match data
    const calculateRemainingTime = () => {
      try {
        // Verify that we have valid times
        if (!activeMatch.startTime || !activeMatch.duration) {
          console.warn('Invalid match time data:', { 
            startTime: activeMatch.startTime, 
            duration: activeMatch.duration 
          });
          return 0;
        }
        
        // Ensure startTime is in seconds (not milliseconds)
        let startTimeSec = activeMatch.startTime;
        // If startTime is abnormally large (likely in milliseconds), convert to seconds
        if (startTimeSec > 9999999999) { // Larger than year 2286
          startTimeSec = Math.floor(startTimeSec / 1000);
        }
        
        const startTimeMs = startTimeSec * 1000; // Convert to milliseconds
        const durationSeconds = Math.min(3600, activeMatch.duration); // Cap duration at 1 hour
        const currentTimeMs = Date.now();
        const elapsedSeconds = Math.floor((currentTimeMs - startTimeMs) / 1000);
        
        // Validate the result is reasonable (between 0 and match duration)
        const remaining = Math.max(0, Math.min(durationSeconds, durationSeconds - elapsedSeconds));
        console.log('Time calculation:', { startTimeMs, now: currentTimeMs, elapsed: elapsedSeconds, remaining });
        return remaining;
      } catch (error) {
        console.error('Error calculating time:', error);
        return 0; // Default to 0 if calculation fails
      }
    };
    
    // Initial calculation
    const initialRemaining = calculateRemainingTime();
    console.log('Match timer - Initial calculation:', initialRemaining, 'seconds');
    setLocalTimeRemaining(initialRemaining);
    
    // Set up local timer that updates every second
    const timerInterval = setInterval(() => {
      setLocalTimeRemaining(prev => {
        if (prev === null || prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);
    
    // Clean up
    return () => clearInterval(timerInterval);
  }, [activeMatch]);
  
  // Use our local timer instead of the one from useMatch if it's working
  const displayTimeRemaining = localTimeRemaining !== null && localTimeRemaining > 0 
    ? localTimeRemaining 
    : timeRemaining;

  const handleForfeit = async () => {
    if (!activeMatch) return;
    
    try {
      // Call the forfeit API
      await forfeitMatch();
      
      // Properly clean up match state using the resetMatch function
      // This will handle clearing localStorage and other state
      resetMatch();
      
      // Show success message with action button instead of auto-redirection
      toast({
        title: "Match Forfeited",
        description: "You have successfully forfeited the match",
        action: (
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => setLocation("/")}
          >
            Go Home
          </Button>
        ),
        duration: 10000, // Extended duration so user has time to see the action button
      });
    } catch (error) {
      toast({
        title: "Failed to Forfeit",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  // Check for match data
  if (!activeMatch) {
    return (
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <Card className="bg-transparent backdrop-blur-sm rounded-xl shadow-lg border border-neutral/20 mb-6 overflow-hidden">
          <CardContent className="p-8 md:p-12 flex flex-col items-center justify-center text-center">
            <div className="mb-6">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-accent-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            </div>
            <h2 className="text-xl md:text-2xl font-manrope font-bold mb-3">Loading Match Data</h2>
            <div className="text-text-secondary max-w-md">Preparing your trading dashboard...</div>
            <div className="text-xs text-text-secondary mt-4 max-w-md">If this screen persists for more than a few seconds, please return to the home page and try again.</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Add null checks and default values to prevent errors
  const playerPnL = activeMatch?.player?.pnl || 0;
  const opponentPnL = activeMatch?.opponent?.pnl || 0;
  const leadingPlayer = playerPnL >= opponentPnL ? "player" : "opponent";

  const total = Math.abs(playerPnL) + Math.abs(opponentPnL) + 0.01;
  const playerProgress = (Math.abs(playerPnL) / total) * 100;

  return (
    <div className="container mx-auto px-4 md:px-6 max-w-7xl">
      {/* Match Header Card */}
      <Card className="bg-transparent backdrop-blur-sm rounded-xl shadow-lg border border-neutral/20 mb-6 overflow-hidden">
        <CardContent className="p-4 md:p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-manrope font-bold mb-2">
                Live Match: You vs {activeMatch?.opponent?.username || "Opponent"}
              </h2>
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center">
                  <i className="ri-time-line mr-2" />
                  {formatTime(displayTimeRemaining)} remaining
                </span>
                <span className="flex items-center">
                  <i className="ri-coin-line mr-2" />
                  Trading {activeMatch?.market || storedMarket}
                </span>
                <span className="flex items-center">
                  <i className="ri-money-dollar-circle-line mr-2" />
                  {storedStake} USDC
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <Button
                variant="outline"
                className="bg-bg-primary flex-1 md:flex-none"
                onClick={() => setShowSpectators(!showSpectators)}
                size="sm"
              >
                <i className="ri-eye-line mr-1.5" />
                Spectators ({activeMatch?.spectators?.length || 0})
              </Button>
              <Button 
                variant="destructive"
                className="hover:bg-loss flex-1 md:flex-none"
                onClick={handleForfeit}
                size="sm"
              >
                <i className="ri-close-line mr-1.5"></i>
                Forfeit
              </Button>
            </div>
          </div>

          {/* Spectators List */}
          {showSpectators && activeMatch?.spectators && activeMatch.spectators.length > 0 && (
            <div className="mb-6 p-4 bg-transparent/70 rounded-lg backdrop-blur-sm border border-neutral/10">
              <h3 className="font-medium text-base mb-3">Spectators</h3>
              <div className="flex flex-wrap gap-2">
                {activeMatch.spectators.map((spectator: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center bg-bg-secondary hover:bg-bg-secondary/80 transition-colors rounded-full px-3 py-1.5 shadow-sm"
                    title={spectator}
                  >
                    <Avatar className="h-6 w-6 mr-2 border border-neutral/10">
                      <AvatarFallback className="text-xs font-medium">
                        {spectator.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium truncate max-w-[120px]">{spectator}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PnL Progress Bar */}
          <div className="p-4 md:p-6 bg-transparent rounded-lg border border-neutral/10 backdrop-blur-sm mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-base">Match Progress</h3>
              <div className="text-sm text-text-secondary flex items-center">
                <i className="ri-timer-line mr-1.5"></i>
                {storedDuration} Match
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* Player */}
              <div className="flex items-center w-full md:w-auto">
                <div
                  className={`h-12 w-12 rounded-full bg-bg-secondary border-2 ${
                    playerPnL >= 0 ? "border-profit" : "border-loss"
                  } flex items-center justify-center overflow-hidden mr-3 shadow-lg`}
                >
                  <span className="text-sm font-bold">You</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Your PnL</p>
                  <p
                    className={`${
                      playerPnL >= 0 ? "text-profit" : "text-loss"
                    } font-mono font-bold text-lg`}
                  >
                    {playerPnL >= 0 ? "+" : ""}
                    {playerPnL}%
                  </p>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="text-center flex-1 w-full my-4 md:my-0">
                <div className="relative h-2 bg-bg-secondary/50 rounded-full mb-2">
                  <div
                    className={`absolute top-0 h-full ${
                      leadingPlayer === "player" 
                        ? "bg-gradient-to-r from-profit/60 to-profit left-0" 
                        : "bg-gradient-to-l from-loss/60 to-loss right-0"
                    } rounded-full shadow-inner transition-all duration-300 ease-out`}
                    style={{ width: `${playerProgress}%` }}
                  />
                </div>
                <p className={`text-sm font-medium ${leadingPlayer === "player" ? "text-profit" : "text-loss"}`}>
                  {leadingPlayer === "player"
                    ? "You're leading! 🔥"
                    : "Your opponent is ahead! 🔄"}
                </p>
              </div>

              {/* Opponent */}
              <div className="flex items-center w-full md:w-auto md:ml-auto">
                <div>
                  <p className="font-medium text-sm text-right">Opponent PnL</p>
                  <p
                    className={`${
                      opponentPnL >= 0 ? "text-profit" : "text-loss"
                    } font-mono font-bold text-lg text-right`}
                  >
                    {opponentPnL >= 0 ? "+" : ""}
                    {opponentPnL}%
                  </p>
                </div>
                <div
                  className={`h-12 w-12 rounded-full bg-bg-secondary border-2 ${
                    opponentPnL >= 0 ? "border-profit" : "border-loss"
                  } flex items-center justify-center overflow-hidden ml-3 shadow-lg`}
                >
                  <span className="text-sm font-bold">
                    {activeMatch?.opponent?.username ? activeMatch.opponent.username.slice(0, 2).toUpperCase() : "OP"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Chart and Order Panel */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6 order-2 lg:order-1">
          <Card className="bg-transparent backdrop-blur-sm rounded-xl shadow-lg border border-neutral/10 overflow-hidden">
            <CardContent className="p-4 md:p-6">
              <TradingChart market={activeMatch?.market || storedMarket} />
            </CardContent>
          </Card>
          
          <Card className="bg-transparent backdrop-blur-sm rounded-xl shadow-lg border border-neutral/10 overflow-hidden">
            <CardContent className="p-4 md:p-6">
              <h3 className="font-medium text-base mb-3">Trading Controls</h3>
              <OrderPanel />
            </CardContent>
          </Card>
          
          {/* Markets List - Added to the dashboard */}
          <div className="mt-4 md:mt-6">
            <MarketsList />
          </div>
        </div>

        {/* Position & Activity */}
        <div className="lg:col-span-1 space-y-4 md:space-y-6 order-1 lg:order-2">
          <Card className="bg-transparent backdrop-blur-sm rounded-xl shadow-lg border border-neutral/10 overflow-hidden">
            <CardContent className="p-4 md:p-6">
              <h3 className="font-medium text-base mb-3">Your Position</h3>
              <PositionPanel />
            </CardContent>
          </Card>
          
          <Card className="bg-transparent backdrop-blur-sm rounded-xl shadow-lg border border-neutral/10 overflow-hidden">
            <CardContent className="p-4 md:p-6">
              <h3 className="font-medium text-base mb-3">Activity Feed</h3>
              <ActivityFeed matchId={activeMatch?.id || ""} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

