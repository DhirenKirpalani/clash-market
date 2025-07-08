import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
// NavBar is rendered at the App level
import WalletConnectModal from "@/components/WalletConnectModal";
import CreateGamePanel from "@/components/CreateGamePanel";
import TradingChart from "@/components/TradingChart";
import MarketTable from "@/components/MarketTable";
import HyperliquidMarketTable from "@/components/HyperliquidMarketTable";
import LeaderboardPreview from "@/components/LeaderboardPreview";
import GameItem from "@/components/GameItem";
import PostMatchSummary from "@/components/PostMatchSummary";
import { useWallet } from "@/hooks/useWallet";
import { useMatch } from "@/hooks/useMatch";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getGameCode, updateGameCodeStatus } from "../utils/gameCodeStorage";

// Join with Code component for joining games with a unique code
function JoinWithCode() {
  const [gameCode, setGameCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const handleJoinGame = () => {
    if (!gameCode.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid game code"
      });
      return;
    }
    
    // Normalize the input code by trimming and converting to uppercase
    const normalizedCode = gameCode.trim().toUpperCase();
    console.log("Attempting to join game with code:", normalizedCode);
    
    setIsJoining(true);
    
    // Simulate API call to join game
    setTimeout(() => {
      // Try to look up the game code in our localStorage - check both the normalized code and the original input
      const gameEntry = getGameCode(normalizedCode) || getGameCode(gameCode.trim()) || null;
      console.log("Game entry found in localStorage:", gameEntry);
      
      // Fallback to hardcoded demo codes if not found in localStorage
      if (!gameEntry) {
        // For demo: hardcoded mappings as fallback - using normalized code to match
        const codeToMatchMap: { [key: string]: string } = {
          'BTCGAME': '1',
          'ETHGAME': '2',
          'SOLGAME': '3',
          'DEFIGAME': '5',
          // Add possible variations or shortcuts
          'BTC': '1',
          'ETH': '2',
          'SOL': '3',
          'DEFI': '5'
        };
        
        // Try both the exact match and check if the code starts with any of the keys
        let matchId = codeToMatchMap[normalizedCode];
        
        // If no exact match, check if the code contains any of the keys (for more flexible matching)
        if (!matchId) {
          // Try to find a partial match
          for (const key in codeToMatchMap) {
            if (normalizedCode.includes(key) || key.includes(normalizedCode)) {
              matchId = codeToMatchMap[key];
              console.log(`Found partial match: ${normalizedCode} matched with ${key}`);
              break;
            }
          }
        }
        
        const success = matchId !== undefined;
        console.log("Match ID from demo codes:", matchId, "Success:", success);
        
        if (success) {
          toast({
            title: "Success!",
            description: "Successfully joined game!",
            className: "bg-[#05d6a9]/20 border-[#05d6a9] text-white"
          });
          
          setLocation(`/match/${matchId}`);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Invalid game code or game no longer available"
          });
        }
      } else {
        console.log("Found game in localStorage with status:", gameEntry.status);
        // We found the game in localStorage!
        if (gameEntry.status === 'pending') {
          // Update the game status to active and add player2 (you)
          const playerName = localStorage.getItem('cryptoclash_username') || 'Player 2';
          const updatedGame = updateGameCodeStatus(normalizedCode, 'active', playerName);
          
          if (updatedGame && updatedGame.matchId) {
            toast({
              title: "Success!",
              description: "Successfully joined game!",
              className: "bg-[#05d6a9]/20 border-[#05d6a9] text-white"
            });
            
            // Navigate to the specific match page
            setLocation(`/match/${updatedGame.matchId}`);
          } else {
            console.error("Failed to update game status:", updatedGame);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to join the game. Please try again."
            });
          }
        } else if (gameEntry.status === 'active') {
          toast({
            variant: "destructive",
            title: "Game Already Started",
            description: "This game is already in progress"
          });
        } else {
          toast({
            variant: "destructive",
            title: "Game Not Available",
            description: `This game is ${gameEntry.status}`
          });
        }
      }
      
      setIsJoining(false);
      setGameCode('');
    }, 1000);
  };
  
  return (
    <div className="space-y-4">
      <p className="text-sm text-[#F2F2F2]/80">
        Have a game code? Enter it below to join an existing game.
      </p>
      
      <div className="flex gap-3 flex-col sm:flex-row">
        <Input
          type="text"
          placeholder="Enter game code"
          value={gameCode}
          onChange={(e) => setGameCode(e.target.value)}
          className="flex-grow bg-[#0E0E10]/70 border-[#05d6a9]/30 focus:border-[#05d6a9] text-[#F2F2F2] placeholder:text-[#F2F2F2]/50"
        />
        <Button 
          onClick={handleJoinGame}
          disabled={isJoining || !gameCode.trim()}
          className="bg-[#05d6a9] hover:bg-[#05d6a9]/80 text-black font-medium transition-all duration-200"
        >
          {isJoining ? (
            <>
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
              Joining...
            </>
          ) : 'Join Game'}
        </Button>
      </div>
    </div>
  );
}

export default function Games() {
  const { connected } = useWallet();
  const { activeMatch, matchEnded } = useMatch();
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [, setLocation] = useLocation();
  
  // Parse URL parameters for market selection
  const [, params] = useRoute('/:path*');
  const urlParams = new URLSearchParams(window.location.search);
  const marketParam = urlParams.get('market') || 'BTC-PERP';
  const timeframeParam = urlParams.get('timeframe') || '1h';
  
  // State for available matches list
  const [availableMatches, setAvailableMatches] = useState<{
    id: string;
    player1: string;
    player2: string;
    player1Rank?: number;
    player2Rank?: number;
    status: 'active' | 'pending' | 'completed' | 'cancelled';
    market: string;
    duration: string;
    stake: string;
    startTime?: string;
  }[]>([]);
  
  // State for loading and filtering
  const [isLoadingMatches, setIsLoadingMatches] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'pending'>('all');
  const [error, setError] = useState<string | null>(null);
  
  // Helper function to get the API base URL
  const getApiBaseUrl = () => {
    return `${window.location.protocol}//${window.location.host}/api`;
  };
  
  // Fetch all available matches
  const fetchAvailableMatches = async () => {
    setIsLoadingMatches(true);
    setError(null);
    
    try {
      // This would be the real API call in production
      // const response = await fetch(`${getApiBaseUrl()}/matches`);
      // if (!response.ok) throw new Error('Failed to fetch matches');
      // const data = await response.json();
      
      // For demo purposes, simulating API response with sample data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      // Cast the sample data to ensure TypeScript recognizes the status values correctly
      const sampleMatches = [
        { 
          id: "1", 
          player1: "CryptoKing", 
          player2: "TradeMaster",
          player1Rank: 3,
          player2Rank: 7, 
          status: "active" as const, 
          market: "BTC-PERP", 
          duration: "10m",
          stake: "100",
          startTime: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5 minutes ago
        },
        { 
          id: "2", 
          player1: "BlockWizard", 
          player2: "TokenTrader",
          player1Rank: 1,
          player2Rank: 12, 
          status: "pending" as const, 
          market: "ETH-PERP", 
          duration: "15m",
          stake: "200" 
        },
        { 
          id: "3", 
          player1: "SatoshiFan", 
          player2: "HodlGuru",
          player1Rank: 5,
          player2Rank: 2, 
          status: "active" as const, 
          market: "SOL-PERP", 
          duration: "5m",
          stake: "50",
          startTime: new Date(Date.now() - 1000 * 60 * 2).toISOString() // 2 minutes ago
        },
        { 
          id: "4", 
          player1: "AlgoTrader", 
          player2: "BitWizard",
          player1Rank: 8,
          player2Rank: 15, 
          status: "completed" as const, 
          market: "BTC-PERP", 
          duration: "10m",
          stake: "150" 
        },
        { 
          id: "5", 
          player1: "DeFiChamp", 
          player2: "ChartMaster",
          player1Rank: 4,
          player2Rank: 9, 
          status: "active" as const, 
          market: "ETH-PERP", 
          duration: "10m",
          stake: "300",
          startTime: new Date(Date.now() - 1000 * 60 * 2).toISOString() // 2 minutes ago
        }
      ];
      
      setAvailableMatches(sampleMatches);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Failed to load available matches. Please try again.');
      setAvailableMatches([]);
    } finally {
      setIsLoadingMatches(false);
    }
  };
  
  // Filter matches based on selected filter
  const filteredMatches = availableMatches.filter(match => {
    if (activeFilter === 'all') return true;
    return match.status === activeFilter;
  });
  
  // Show notification when an active match is found instead of auto-redirecting
  useEffect(() => {
    if (activeMatch && !matchEnded) {
      toast({
        title: "Active Match Found",
        description: "You have an active match. Click to view.",
        action: <Button onClick={() => setLocation('/match')}>View Match</Button>,
        duration: 0, // Keep visible until dismissed
      });
    }
  }, [activeMatch, matchEnded, toast, setLocation]);
  
  // Fetch matches when component mounts
  useEffect(() => {
    fetchAvailableMatches();
    
    // Set up polling to refresh matches every 30 seconds
    const intervalId = setInterval(() => {
      fetchAvailableMatches();
    }, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="text-[#F2F2F2] mt-2 overflow-visible">
      {/* Main Content */}
      <div className="container mx-auto px-2 sm:px-4 pt-2 sm:pt-3 pb-6 max-w-screen-xl relative z-10">
        {/* Wallet Connect Modal */}
        <WalletConnectModal show={showModal} onClose={() => setShowModal(false)} />

        {matchEnded ? (
          // Show post-match summary if the match has ended
          <PostMatchSummary />
        ) : (
          // Main Layout
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Left Column - Create Game */}
            <div className="md:col-span-1">
              <div className="backdrop-blur-md bg-[#0E0E10]/40 rounded-lg sm:rounded-xl border border-[#00F0FF]/20 shadow-[0_0_15px_rgba(0,240,255,0.15)] overflow-hidden relative p-1">
                <CreateGamePanel />
              </div>
              
              {/* Join with Code Section */}
              <div className="mt-3 sm:mt-4 backdrop-blur-md bg-[#0E0E10]/40 rounded-lg sm:rounded-xl border border-[#05d6a9]/30 p-4 sm:p-6 shadow-[0_0_20px_rgba(5,214,169,0.15)] overflow-hidden relative">
                {/* Animated corner effect */}
                <div className="absolute bottom-0 right-0 w-20 h-20">
                  <div className="absolute bottom-0 right-0 w-[2px] h-12 bg-[#05d6a9] animate-pulse shadow-[0_0_8px_rgba(5,214,169,0.8)]">
                    <div className="absolute -left-[1px] top-0 w-[4px] h-[4px] rounded-full bg-[#05d6a9] shadow-[0_0_5px_rgba(5,214,169,1)]"></div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-12 h-[2px] bg-[#05d6a9] animate-pulse shadow-[0_0_8px_rgba(5,214,169,0.8)]">
                    <div className="absolute -top-[1px] left-0 w-[4px] h-[4px] rounded-full bg-[#05d6a9] shadow-[0_0_5px_rgba(5,214,169,1)]"></div>
                  </div>
                </div>
                
                <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 relative inline-block">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#05d6a9] to-[#04eac2]">JOIN WITH CODE</span>
                  <div className="absolute -bottom-2 left-0 w-full h-[1px] bg-gradient-to-r from-[#05d6a9] to-transparent"></div>
                </h2>
                
                <JoinWithCode />
              </div>
              
              {/* Games Section */}
              <div className="mt-3 sm:mt-6 backdrop-blur-md bg-[#0E0E10]/50 rounded-lg sm:rounded-xl border border-[#CC33FF]/30 p-4 sm:p-6 shadow-[0_0_20px_rgba(204,51,255,0.15)] overflow-hidden relative">
                {/* Animated corner effect */}
                <div className="absolute bottom-0 left-0 w-20 h-20">
                  <div className="absolute bottom-0 left-0 w-[2px] h-12 bg-[#CC33FF] animate-pulse shadow-[0_0_8px_rgba(204,51,255,0.8)]">
                    <div className="absolute -right-[1px] top-0 w-[4px] h-[4px] rounded-full bg-[#CC33FF] shadow-[0_0_5px_rgba(204,51,255,1)]"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-12 h-[2px] bg-[#CC33FF] animate-pulse shadow-[0_0_8px_rgba(204,51,255,0.8)]">
                    <div className="absolute -top-[1px] right-0 w-[4px] h-[4px] rounded-full bg-[#CC33FF] shadow-[0_0_5px_rgba(204,51,255,1)]"></div>
                  </div>
                </div>
                
                {/* Top right accent */}
                <div className="absolute top-0 right-0 w-20 h-20">
                  <div className="absolute top-0 right-0 w-[2px] h-12 bg-[#CC33FF] animate-pulse shadow-[0_0_8px_rgba(204,51,255,0.8)]">
                    <div className="absolute -left-[1px] bottom-0 w-[4px] h-[4px] rounded-full bg-[#CC33FF] shadow-[0_0_5px_rgba(204,51,255,1)]"></div>
                  </div>
                  <div className="absolute top-0 right-0 w-12 h-[2px] bg-[#CC33FF] animate-pulse shadow-[0_0_8px_rgba(204,51,255,0.8)]">
                    <div className="absolute -bottom-[1px] left-0 w-[4px] h-[4px] rounded-full bg-[#CC33FF] shadow-[0_0_5px_rgba(204,51,255,1)]"></div>
                  </div>
                </div>
                
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-6 relative inline-block">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#90D8E4]">GAMES</span>
                  <div className="absolute -bottom-2 left-0 w-full h-[1px] bg-gradient-to-r from-[#00F0FF] to-transparent"></div>
                </h2>
                
                <div className="space-y-4">
                  {/* Filter controls */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Button 
                      size="sm"
                      variant="outline"
                      className={`bg-transparent ${activeFilter === 'all' ? 'bg-accent-primary/10 border-accent-primary' : 'border-accent-primary/50'} hover:bg-accent-primary/20 text-accent-primary text-xs`}
                      onClick={() => setActiveFilter('all')}
                    >
                      All Games
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      className={`bg-transparent ${activeFilter === 'active' ? 'bg-profit/10 border-profit' : 'border-profit/50'} hover:bg-profit/20 text-profit text-xs`}
                      onClick={() => setActiveFilter('active')}
                    >
                      <span className="relative flex h-2 w-2 mr-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-profit opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-profit"></span>
                      </span>
                      Live Games
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      className={`bg-transparent ${activeFilter === 'pending' ? 'bg-yellow-400/10 border-yellow-400' : 'border-yellow-400/50'} hover:bg-yellow-400/20 text-yellow-400 text-xs`}
                      onClick={() => setActiveFilter('pending')}
                    >
                      Waiting Games
                    </Button>
                  </div>
                  
                  {/* Games list */}
                  {isLoadingMatches && (
                    <div className="py-8 text-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                      <div className="mt-2 text-text-secondary">Loading matches...</div>
                    </div>
                  )}
                  
                  {!isLoadingMatches && error && (
                    <div className="text-center py-6 text-loss">
                      <div className="flex items-center justify-center mb-2">
                        <i className="ri-error-warning-line text-xl"></i>
                      </div>
                      {error}
                      <div className="mt-3">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-transparent border-accent-primary/50 hover:bg-accent-primary/20 text-accent-primary"
                          onClick={fetchAvailableMatches}
                        >
                          <i className="ri-refresh-line mr-1"></i> Try Again
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {!isLoadingMatches && !error && filteredMatches.length === 0 && (
                    <div className="text-center py-8 text-text-secondary">
                      {activeFilter === 'all' ? (
                        <>No matches available at the moment.</>
                      ) : activeFilter === 'active' ? (
                        <>No live games available right now. Try creating a new game!</>
                      ) : (
                        <>No waiting games available. All current games are in progress.</>
                      )}
                    </div>
                  )}
                  
                  {!isLoadingMatches && !error && filteredMatches.length > 0 && (
                    <div className="space-y-3">
                      {filteredMatches.map((match) => (
                        <GameItem 
                          key={match.id}
                          id={match.id}
                          player1={match.player1}
                          player2={match.player2}
                          player1Rank={match.player1Rank}
                          player2Rank={match.player2Rank}
                          status={match.status}
                          market={match.market}
                          duration={match.duration}
                          stake={match.stake}
                          startTime={match.startTime}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Middle & Right Columns - Chart and Market Data */}
            <div className="md:col-span-2 space-y-4 sm:space-y-6 md:space-y-8">
              {/* Trading Chart with Market Selection */}
              <div className="backdrop-blur-md bg-[#0E0E10]/30 rounded-lg sm:rounded-xl border border-[#90D8E4]/20 shadow-[0_0_15px_rgba(144,216,228,0.15)] overflow-hidden relative p-1">
                <div className="absolute top-0 right-0 w-24 h-24">
                  <div className="absolute top-0 right-0 w-[2px] h-12 bg-[#90D8E4] shadow-[0_0_8px_rgba(144,216,228,0.6)]"></div>
                  <div className="absolute top-0 right-0 w-12 h-[2px] bg-[#90D8E4] shadow-[0_0_8px_rgba(144,216,228,0.6)]"></div>
                </div>
                <TradingChart market={marketParam} />
              </div>
              
              {/* Market Table */}
              <div className="backdrop-blur-md bg-[#0E0E10]/40 rounded-lg sm:rounded-xl border border-[#FFCC00]/20 shadow-[0_0_15px_rgba(255,204,0,0.1)] overflow-hidden relative p-1">
                <div className="absolute bottom-0 left-0 w-24 h-24">
                  <div className="absolute bottom-0 left-0 w-[2px] h-12 bg-[#FFCC00] shadow-[0_0_8px_rgba(255,204,0,0.6)]"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-[2px] bg-[#FFCC00] shadow-[0_0_8px_rgba(255,204,0,0.6)]"></div>
                </div>
                <MarketTable />
              </div>
              
              {/* Hyperliquid Market Table */}
              <div className="backdrop-blur-md bg-[#0E0E10]/40 rounded-lg sm:rounded-xl border border-[#00F0FF]/20 shadow-[0_0_15px_rgba(0,240,255,0.1)] overflow-hidden relative p-1">
                <div className="absolute top-0 right-0 w-24 h-24">
                  <div className="absolute top-0 right-0 w-[2px] h-12 bg-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.6)]"></div>
                  <div className="absolute top-0 right-0 w-12 h-[2px] bg-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.6)]"></div>
                </div>
                <HyperliquidMarketTable />
              </div>
              
              {/* Leaderboard Preview */}
              <div id="leaderboard-section" className="backdrop-blur-md bg-[#0E0E10]/40 rounded-lg sm:rounded-xl border border-[#FF6600]/20 shadow-[0_0_15px_rgba(255,102,0,0.1)] overflow-hidden relative p-1">
                <div className="absolute top-0 left-0 w-24 h-24">
                  <div className="absolute top-0 left-0 w-[2px] h-12 bg-[#FF6600] shadow-[0_0_8px_rgba(255,102,0,0.6)]"></div>
                  <div className="absolute top-0 left-0 w-12 h-[2px] bg-[#FF6600] shadow-[0_0_8px_rgba(255,102,0,0.6)]"></div>
                </div>
                <LeaderboardPreview />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
