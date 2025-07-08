// import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
// import { useWebSocket } from '@/hooks/useWebSocket';
// import { useWallet } from '@/hooks/useWallet';
// import { useToast } from '@/hooks/use-toast';
// import { apiRequest } from '@/lib/queryClient';
// import { queryClient } from '@/lib/queryClient';

// // Types
// type Player = {
//   username: string;
//   pnl: number;
// };

// type Match = {
//   id: string;
//   player: Player;
//   opponent: Player;
//   market: string;
//   duration: number;
//   startTime: number;
//   spectators: string[];
// };

// type MatchSummary = {
//   playerPnl: number;
//   opponentPnl: number;
//   opponentName: string;
//   stats: {
//     ordersPlaced: number;
//     winRate: number;
//     avgPositionSize: string;
//     biggestWin: number;
//   };
//   rewards: {
//     tokens: number;
//     xp: number;
//     leaderboardPoints: number;
//     achievement?: string;
//   };
// };

// type MatchContextType = {
//   activeMatch: Match | null;
//   matchEnded: boolean;
//   matchSummary: MatchSummary | null;
//   timeRemaining: number;
//   joinQueue: () => Promise<void>;
//   createFriendMatch: (market?: string, duration?: number) => Promise<string>;
//   joinMatch: (matchId: string) => Promise<void>;
//   spectateMatch: (matchId: string) => Promise<void>;
//   forfeitMatch: () => Promise<void>;
//   resetMatch: () => void;
//   rematch: () => Promise<void>;
//   formatTime: (seconds: number) => string;
// };

// // Create context
// const MatchContext = createContext<MatchContextType | undefined>(undefined);

// // Provider component
// export const MatchProvider = ({ children }: { children: ReactNode }) => {
//   const { socket, sendMessage } = useWebSocket();
//   const { connected, address } = useWallet();
//   const { toast } = useToast();
  
//   const [activeMatch, setActiveMatch] = useState<Match | null>(null);
//   const [matchEnded, setMatchEnded] = useState(false);
//   const [matchSummary, setMatchSummary] = useState<MatchSummary | null>(null);
//   const [timeRemaining, setTimeRemaining] = useState(0);
//   const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

//   // Format time as mm:ss
//   const formatTime = useCallback((seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   }, []);

//   // Start countdown timer for match
//   const startTimer = useCallback((duration: number) => {
//     // Clear existing timer if any
//     if (timer) clearInterval(timer);
    
//     setTimeRemaining(duration);
    
//     const interval = setInterval(() => {
//       setTimeRemaining(prev => {
//         if (prev <= 1) {
//           clearInterval(interval);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
    
//     setTimer(interval);
    
//     return () => clearInterval(interval);
//   }, [timer]);

//   // Handle WebSocket messages
//   useEffect(() => {
//     if (!socket) return;

//     const handleMessage = (event: MessageEvent) => {
//       try {
//         const data = JSON.parse(event.data);
        
//         switch (data.type) {
//           case 'match_found':
//             // Match found, update match state
//             const match: Match = data.match;
//             setActiveMatch(match);
//             setMatchEnded(false);
//             startTimer(match.duration);
            
//             toast({
//               title: 'Match Found',
//               description: `You are matched with ${match.opponent.username}`,
//             });
//             break;
            
//           case 'match_update':
//             // Update match state (PnL changes, new spectators, etc.)
//             setActiveMatch(prev => prev ? { ...prev, ...data.update } : null);
//             break;
            
//           case 'match_ended':
//             // Match ended, show summary
//             setMatchEnded(true);
//             setMatchSummary(data.summary);
//             setTimeRemaining(0);
//             if (timer) clearInterval(timer);
            
//             toast({
//               title: data.summary.playerPnl > data.summary.opponentPnl ? 'Victory!' : 'Defeat!',
//               description: 'Match has ended. View your results.',
//             });
//             break;
            
//           case 'spectate_join':
//             // Someone joined as spectator
//             if (activeMatch?.id === data.matchId) {
//               setActiveMatch(prev => prev ? {
//                 ...prev,
//                 spectators: [...(prev.spectators || []), data.spectator]
//               } : null);
//             }
//             break;
//         }
//       } catch (error) {
//         console.error('Failed to parse WebSocket message:', error);
//       }
//     };

//     socket.addEventListener('message', handleMessage);
    
//     return () => {
//       socket.removeEventListener('message', handleMessage);
//     };
//   }, [socket, activeMatch, startTimer, timer, toast]);

//   // Join match queue
//   const joinQueue = useCallback(async () => {
//     if (!connected) {
//       throw new Error('Wallet not connected');
//     }
    
//     try {
//       await apiRequest('/api/matches/queue', { address });
      
//       toast({
//         title: 'Joined Queue',
//         description: 'Searching for an opponent...',
//       });
      
//       // Server will send match_found event via WebSocket when a match is found
//       return;
//     } catch (error) {
//       console.error('Failed to join queue:', error);
//       throw error;
//     }
//   }, [connected, address, toast]);

//   // Create a friend match (with invite code)
//   const createFriendMatch = useCallback(async (market = 'BTC/USDC', duration = 1800) => {
//     if (!connected) {
//       throw new Error('Wallet not connected');
//     }
    
//     try {
//       const response = await apiRequest({
//         url: '/api/matches/create',
//         method: 'POST',
//         body: { 
//           address,
//           market,
//           duration 
//         },
//       });
//       const data = await response.json();
      
//       return data.inviteCode;
//     } catch (error) {
//       console.error('Failed to create friend match:', error);
//       throw error;
//     }
//   }, [connected, address]);

//   // Join an existing match by ID
//   const joinMatch = useCallback(async (matchId: string) => {
//     if (!connected) {
//       throw new Error('Wallet not connected');
//     }
    
//     try {
//       await apiRequest(`/api/matches/${matchId}/join`, { address });
      
//       // Server will send match_found event via WebSocket
//     } catch (error) {
//       console.error('Failed to join match:', error);
//       throw error;
//     }
//   }, [connected, address]);

//   // Spectate a match
//   const spectateMatch = useCallback(async (matchId: string) => {
//     try {
//       await apiRequest(`/api/matches/${matchId}/spectate`, { address: address || 'anonymous' });
      
//       // Server will send match data via WebSocket
//     } catch (error) {
//       console.error('Failed to spectate match:', error);
//       throw error;
//     }
//   }, [address]);

//   // Forfeit current match
//   const forfeitMatch = useCallback(async () => {
//     if (!activeMatch) {
//       throw new Error('No active match');
//     }
    
//     try {
//       await apiRequest(`/api/matches/${activeMatch.id}/forfeit`, { address });
      
//       // Server will send match_ended event via WebSocket
//     } catch (error) {
//       console.error('Failed to forfeit match:', error);
//       throw error;
//     }
//   }, [activeMatch, address]);

//   // Reset match state
//   const resetMatch = useCallback(() => {
//     setActiveMatch(null);
//     setMatchEnded(false);
//     setMatchSummary(null);
//     setTimeRemaining(0);
    
//     if (timer) {
//       clearInterval(timer);
//       setTimer(null);
//     }
    
//     // Invalidate match-related queries
//     queryClient.invalidateQueries({ queryKey: ['/api/matches'] });
//   }, [timer]);

//   // Request a rematch
//   const rematch = useCallback(async () => {
//     if (!matchEnded || !matchSummary) {
//       throw new Error('Match not ended yet');
//     }
    
//     try {
//       await apiRequest('/api/matches/rematch', { 
//         address,
//         opponent: matchSummary.opponentName
//       });
      
//       // Server will send match_found event via WebSocket if opponent accepts
//       toast({
//         title: 'Rematch Requested',
//         description: 'Waiting for your opponent to accept...',
//       });
//     } catch (error) {
//       console.error('Failed to request rematch:', error);
//       throw error;
//     }
//   }, [matchEnded, matchSummary, address, toast]);

//   const value = {
//     activeMatch,
//     matchEnded,
//     matchSummary,
//     timeRemaining,
//     joinQueue,
//     createFriendMatch,
//     joinMatch,
//     spectateMatch,
//     forfeitMatch,
//     resetMatch,
//     rematch,
//     formatTime,
//   };

//   return <MatchContext.Provider value={value}>{children}</MatchContext.Provider>;
// };

// // Hook to use match context
// export const useMatch = () => {
//   const context = useContext(MatchContext);
//   if (context === undefined) {
//     throw new Error('useMatch must be used within a MatchProvider');
//   }
//   return context;
// };

// import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
// import { useWebSocket } from '@/hooks/useWebSocket';
// import { useWallet } from '@/hooks/useWallet';
// import { useToast } from '@/hooks/use-toast';
// import { apiRequest } from '@/lib/queryClient';
// import { queryClient } from '@/lib/queryClient';

// // Types
// type Player = {
//   username: string;
//   pnl: number;
// };

// type Match = {
//   id: string;
//   player: Player;
//   opponent: Player;
//   market: string;
//   duration: number;
//   startTime: number;
//   spectators: string[];
// };

// type MatchSummary = {
//   playerPnl: number;
//   opponentPnl: number;
//   opponentName: string;
//   stats: {
//     ordersPlaced: number;
//     winRate: number;
//     avgPositionSize: string;
//     biggestWin: number;
//   };
//   rewards: {
//     tokens: number;
//     xp: number;
//     leaderboardPoints: number;
//     achievement?: string;
//   };
// };

// type MatchContextType = {
//   activeMatch: Match | null;
//   matchEnded: boolean;
//   matchSummary: MatchSummary | null;
//   timeRemaining: number;
//   joinQueue: () => Promise<void>;
//   createFriendMatch: () => Promise<string>;
//   joinMatch: (matchId: string) => Promise<void>;
//   spectateMatch: (matchId: string) => Promise<void>;
//   forfeitMatch: () => Promise<void>;
//   resetMatch: () => void;
//   rematch: () => Promise<void>;
//   formatTime: (seconds: number) => string;
// };

// // Create context
// const MatchContext = createContext<MatchContextType | undefined>(undefined);

// // Provider component
// export const MatchProvider = ({ children }: { children: ReactNode }) => {
//   const { socket, sendMessage } = useWebSocket();
//   const { connected, address } = useWallet();
//   const { toast } = useToast();
  
//   const [activeMatch, setActiveMatch] = useState<Match | null>(null);
//   const [matchEnded, setMatchEnded] = useState(false);
//   const [matchSummary, setMatchSummary] = useState<MatchSummary | null>(null);
//   const [timeRemaining, setTimeRemaining] = useState(0);
//   const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

//   // Format time as mm:ss
//   const formatTime = useCallback((seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   }, []);

//   // Start countdown timer for match
//   const startTimer = useCallback((duration: number) => {
//     // Clear existing timer if any
//     if (timer) clearInterval(timer);
    
//     setTimeRemaining(duration);
    
//     const interval = setInterval(() => {
//       setTimeRemaining(prev => {
//         if (prev <= 1) {
//           clearInterval(interval);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
    
//     setTimer(interval);
    
//     return () => clearInterval(interval);
//   }, [timer]);

//   // Handle WebSocket messages
//   useEffect(() => {
//     if (!socket) return;

//     const handleMessage = (event: MessageEvent) => {
//       try {
//         const data = JSON.parse(event.data);
        
//         switch (data.type) {
//           case 'match_found':
//             // Match found, update match state
//             const match: Match = data.match;
//             setActiveMatch(match);
//             setMatchEnded(false);
//             startTimer(match.duration);
            
//             toast({
//               title: 'Match Found',
//               description: `You are matched with ${match.opponent.username}`,
//             });
//             break;
            
//           case 'match_update':
//             // Update match state (PnL changes, new spectators, etc.)
//             setActiveMatch(prev => prev ? { ...prev, ...data.update } : null);
//             break;
            
//           case 'match_ended':
//             // Match ended, show summary
//             setMatchEnded(true);
//             setMatchSummary(data.summary);
//             setTimeRemaining(0);
//             if (timer) clearInterval(timer);
            
//             toast({
//               title: data.summary.playerPnl > data.summary.opponentPnl ? 'Victory!' : 'Defeat!',
//               description: 'Match has ended. View your results.',
//             });
//             break;
            
//           case 'spectate_join':
//             // Someone joined as spectator
//             if (activeMatch?.id === data.matchId) {
//               setActiveMatch(prev => prev ? {
//                 ...prev,
//                 spectators: [...(prev.spectators || []), data.spectator]
//               } : null);
//             }
//             break;
//         }
//       } catch (error) {
//         console.error('Failed to parse WebSocket message:', error);
//       }
//     };

//     socket.addEventListener('message', handleMessage);
    
//     return () => {
//       socket.removeEventListener('message', handleMessage);
//     };
//   }, [socket, activeMatch, startTimer, timer, toast]);

//   // Join match queue
//   const joinQueue = useCallback(async () => {
//     if (!connected) {
//       throw new Error('Wallet not connected');
//     }
    
//     try {
//       const response = await apiRequest('POST', '/api/matches/queue', { address });
      
//       toast({
//         title: 'Joined Queue',
//         description: 'Searching for an opponent...',
//       });
      
//       // Server will send match_found event via WebSocket when a match is found
//       return;
//     } catch (error) {
//       console.error('Failed to join queue:', error);
//       throw error;
//     }
//   }, [connected, address, toast]);

//   // Create a friend match (with invite code)
//   const createFriendMatch = useCallback(async () => {
//     if (!connected) {
//       throw new Error('Wallet not connected');
//     }
    
//     try {
//       const response = await apiRequest('POST', '/api/matches/create', { address });
//       const data = await response.json();
      
//       return data.inviteCode;
//     } catch (error) {
//       console.error('Failed to create friend match:', error);
//       throw error;
//     }
//   }, [connected, address]);

//   // Join an existing match by ID
//   const joinMatch = useCallback(async (matchId: string) => {
//     if (!connected) {
//       throw new Error('Wallet not connected');
//     }
    
//     try {
//       await apiRequest('POST', `/api/matches/${matchId}/join`, { address });
      
//       // Server will send match_found event via WebSocket
//     } catch (error) {
//       console.error('Failed to join match:', error);
//       throw error;
//     }
//   }, [connected, address]);

//   // Spectate a match
//   const spectateMatch = useCallback(async (matchId: string) => {
//     try {
//       await apiRequest('POST', `/api/matches/${matchId}/spectate`, { address: address || 'anonymous' });
      
//       // Server will send match data via WebSocket
//     } catch (error) {
//       console.error('Failed to spectate match:', error);
//       throw error;
//     }
//   }, [address]);

//   // Forfeit current match
//   const forfeitMatch = useCallback(async () => {
//     if (!activeMatch) {
//       throw new Error('No active match');
//     }
    
//     try {
//       await apiRequest('POST', `/api/matches/${activeMatch.id}/forfeit`, { address });
      
//       // Server will send match_ended event via WebSocket
//     } catch (error) {
//       console.error('Failed to forfeit match:', error);
//       throw error;
//     }
//   }, [activeMatch, address]);

//   // Reset match state
//   const resetMatch = useCallback(() => {
//     setActiveMatch(null);
//     setMatchEnded(false);
//     setMatchSummary(null);
//     setTimeRemaining(0);
    
//     if (timer) {
//       clearInterval(timer);
//       setTimer(null);
//     }
    
//     // Invalidate match-related queries
//     queryClient.invalidateQueries({ queryKey: ['/api/matches'] });
//   }, [timer]);

//   // Request a rematch
//   const rematch = useCallback(async () => {
//     if (!matchEnded || !matchSummary) {
//       throw new Error('Match not ended yet');
//     }
    
//     try {
//       await apiRequest('POST', '/api/matches/rematch', { 
//         address,
//         opponent: matchSummary.opponentName
//       });
      
//       // Server will send match_found event via WebSocket if opponent accepts
//       toast({
//         title: 'Rematch Requested',
//         description: 'Waiting for your opponent to accept...',
//       });
//     } catch (error) {
//       console.error('Failed to request rematch:', error);
//       throw error;
//     }
//   }, [matchEnded, matchSummary, address, toast]);

//   const value = {
//     activeMatch,
//     matchEnded,
//     matchSummary,
//     timeRemaining,
//     joinQueue,
//     createFriendMatch,
//     joinMatch,
//     spectateMatch,
//     forfeitMatch,
//     resetMatch,
//     rematch,
//     formatTime,
//   };

//   return React.createElement(MatchContext.Provider, { value }, children);
// };

// // Hook to use match context
// export const useMatch = () => {
//   const context = useContext(MatchContext);
//   if (context === undefined) {
//     throw new Error('useMatch must be used within a MatchProvider');
//   }
//   return context;
// };

// import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
// import { useWebSocket } from '@/hooks/useWebSocket';
// import { useWallet } from '@/hooks/useWallet';
// import { useToast } from '@/hooks/use-toast';
// import { apiRequest } from '@/lib/queryClient';
// import { queryClient } from '@/lib/queryClient';

// // Types
// type Player = {
//   username: string;
//   pnl: number;
// };

// type Match = {
//   id: string;
//   player: Player;
//   opponent: Player;
//   market: string;
//   duration: number;
//   startTime: number;
//   spectators: string[];
// };

// type MatchSummary = {
//   playerPnl: number;
//   opponentPnl: number;
//   opponentName: string;
//   stats: {
//     ordersPlaced: number;
//     winRate: number;
//     avgPositionSize: string;
//     biggestWin: number;
//   };
//   rewards: {
//     tokens: number;
//     xp: number;
//     leaderboardPoints: number;
//     achievement?: string;
//   };
// };

// type MatchContextType = {
//   activeMatch: Match | null;
//   matchEnded: boolean;
//   matchSummary: MatchSummary | null;
//   timeRemaining: number;
//   joinQueue: () => Promise<void>;
//   createFriendMatch: (market?: string, duration?: number) => Promise<string>;
//   joinMatch: (matchId: string) => Promise<void>;
//   spectateMatch: (matchId: string) => Promise<void>;
//   forfeitMatch: () => Promise<void>;
//   resetMatch: () => void;
//   rematch: () => Promise<void>;
//   formatTime: (seconds: number) => string;
// };

// // Create context
// const MatchContext = createContext<MatchContextType | undefined>(undefined);

// // Provider component
// export const MatchProvider = ({ children }: { children: ReactNode }) => {
//   const { socket, sendMessage } = useWebSocket();
//   const { connected, address } = useWallet();
//   const { toast } = useToast();
  
//   const [activeMatch, setActiveMatch] = useState<Match | null>(null);
//   const [matchEnded, setMatchEnded] = useState(false);
//   const [matchSummary, setMatchSummary] = useState<MatchSummary | null>(null);
//   const [timeRemaining, setTimeRemaining] = useState(0);
//   const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

//   // Format time as mm:ss
//   const formatTime = useCallback((seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   }, []);

//   // Start countdown timer for match
//   const startTimer = useCallback((duration: number) => {
//     // Clear existing timer if any
//     if (timer) clearInterval(timer);
    
//     setTimeRemaining(duration);
    
//     const interval = setInterval(() => {
//       setTimeRemaining(prev => {
//         if (prev <= 1) {
//           clearInterval(interval);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
    
//     setTimer(interval);
    
//     return () => clearInterval(interval);
//   }, [timer]);

//   // Handle WebSocket messages
//   useEffect(() => {
//     if (!socket) return;

//     const handleMessage = (event: MessageEvent) => {
//       try {
//         const data = JSON.parse(event.data);
        
//         switch (data.type) {
//           case 'match_found':
//             // Match found, update match state
//             const match: Match = data.match;
//             setActiveMatch(match);
//             setMatchEnded(false);
//             startTimer(match.duration);
            
//             toast({
//               title: 'Match Found',
//               description: `You are matched with ${match.opponent.username}`,
//             });
//             break;
            
//           case 'match_update':
//             // Update match state (PnL changes, new spectators, etc.)
//             setActiveMatch(prev => prev ? { ...prev, ...data.update } : null);
//             break;
            
//           case 'match_ended':
//             // Match ended, show summary
//             setMatchEnded(true);
//             setMatchSummary(data.summary);
//             setTimeRemaining(0);
//             if (timer) clearInterval(timer);
            
//             toast({
//               title: data.summary.playerPnl > data.summary.opponentPnl ? 'Victory!' : 'Defeat!',
//               description: 'Match has ended. View your results.',
//             });
//             break;
            
//           case 'spectate_join':
//             // Someone joined as spectator
//             if (activeMatch?.id === data.matchId) {
//               setActiveMatch(prev => prev ? {
//                 ...prev,
//                 spectators: [...(prev.spectators || []), data.spectator]
//               } : null);
//             }
//             break;
//         }
//       } catch (error) {
//         console.error('Failed to parse WebSocket message:', error);
//       }
//     };

//     socket.addEventListener('message', handleMessage);
    
//     return () => {
//       socket.removeEventListener('message', handleMessage);
//     };
//   }, [socket, activeMatch, startTimer, timer, toast]);

//   // Join match queue
//   const joinQueue = useCallback(async () => {
//     if (!connected) {
//       throw new Error('Wallet not connected');
//     }
    
//     try {
//       await apiRequest('/api/matches/queue', { address });
      
//       toast({
//         title: 'Joined Queue',
//         description: 'Searching for an opponent...',
//       });
      
//       // Server will send match_found event via WebSocket when a match is found
//       return;
//     } catch (error) {
//       console.error('Failed to join queue:', error);
//       throw error;
//     }
//   }, [connected, address, toast]);

//   // Create a friend match (with invite code)
//   const createFriendMatch = useCallback(async (market = 'BTC/USDC', duration = 1800) => {
//     if (!connected) {
//       throw new Error('Wallet not connected');
//     }
    
//     try {
//       const response = await apiRequest({
//         url: '/api/matches/create',
//         method: 'POST',
//         body: { 
//           address,
//           market,
//           duration 
//         },
//       });
//       const data = await response.json();
      
//       return data.inviteCode;
//     } catch (error) {
//       console.error('Failed to create friend match:', error);
//       throw error;
//     }
//   }, [connected, address]);

//   // Join an existing match by invite code
//   const joinMatch = useCallback(async (inviteCode: string) => {
//     if (!connected) {
//       throw new Error('Wallet not connected');
//     }
    
//     try {
//       // First, look up the match ID using the invite code
//       console.log('Looking up match with invite code:', inviteCode);
//       const lookupResponse = await apiRequest({
//         url: `/api/matches/code/${inviteCode}`,
//         method: 'GET'
//       });
//       const lookupData = await lookupResponse.json();
      
//       if (!lookupData.matchId) {
//         throw new Error('Invalid invite code');
//       }
      
//       console.log('Found match with ID:', lookupData.matchId);
      
//       // Now join the match using the actual match ID
//       await apiRequest({
//         url: `/api/matches/${lookupData.matchId}/join`,
//         method: 'POST',
//         body: { address }
//       });
      
//       // Server will send match_found event via WebSocket
//     } catch (error) {
//       console.error('Failed to join match:', error);
//       throw error;
//     }
//   }, [connected, address]);

//   // Spectate a match
//   const spectateMatch = useCallback(async (matchId: string) => {
//     try {
//       await apiRequest(`/api/matches/${matchId}/spectate`, { address: address || 'anonymous' });
      
//       // Server will send match data via WebSocket
//     } catch (error) {
//       console.error('Failed to spectate match:', error);
//       throw error;
//     }
//   }, [address]);

//   // Forfeit current match
//   const forfeitMatch = useCallback(async () => {
//     if (!activeMatch) {
//       throw new Error('No active match');
//     }
    
//     try {
//       await apiRequest(`/api/matches/${activeMatch.id}/forfeit`, { address });
      
//       // Server will send match_ended event via WebSocket
//     } catch (error) {
//       console.error('Failed to forfeit match:', error);
//       throw error;
//     }
//   }, [activeMatch, address]);

//   // Reset match state
//   const resetMatch = useCallback(() => {
//     setActiveMatch(null);
//     setMatchEnded(false);
//     setMatchSummary(null);
//     setTimeRemaining(0);
    
//     if (timer) {
//       clearInterval(timer);
//       setTimer(null);
//     }
    
//     // Invalidate match-related queries
//     queryClient.invalidateQueries({ queryKey: ['/api/matches'] });
//   }, [timer]);

//   // Request a rematch
//   const rematch = useCallback(async () => {
//     if (!matchEnded || !matchSummary) {
//       throw new Error('Match not ended yet');
//     }
    
//     try {
//       await apiRequest('/api/matches/rematch', { 
//         address,
//         opponent: matchSummary.opponentName
//       });
      
//       // Server will send match_found event via WebSocket if opponent accepts
//       toast({
//         title: 'Rematch Requested',
//         description: 'Waiting for your opponent to accept...',
//       });
//     } catch (error) {
//       console.error('Failed to request rematch:', error);
//       throw error;
//     }
//   }, [matchEnded, matchSummary, address, toast]);

//   const value = {
//     activeMatch,
//     matchEnded,
//     matchSummary,
//     timeRemaining,
//     joinQueue,
//     createFriendMatch,
//     joinMatch,
//     spectateMatch,
//     forfeitMatch,
//     resetMatch,
//     rematch,
//     formatTime,
//   };

//   return <MatchContext.Provider value={value}>{children}</MatchContext.Provider>;
// };

// // Hook to use match context
// export const useMatch = () => {
//   const context = useContext(MatchContext);
//   if (context === undefined) {
//     throw new Error('useMatch must be used within a MatchProvider');
//   }
//   return context;
// };

// import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
// import { useWebSocket } from '@/hooks/useWebSocket';
// import { useWallet } from '@/hooks/useWallet';
// import { useToast } from '@/hooks/use-toast';
// import { apiRequest } from '@/lib/queryClient';
// import { queryClient } from '@/lib/queryClient';

// // Types
// type Player = {
//   username: string;
//   pnl: number;
// };

// type Match = {
//   id: string;
//   player: Player;
//   opponent: Player;
//   market: string;
//   duration: number;
//   startTime: number;
//   spectators: string[];
// };

// type MatchSummary = {
//   playerPnl: number;
//   opponentPnl: number;
//   opponentName: string;
//   stats: {
//     ordersPlaced: number;
//     winRate: number;
//     avgPositionSize: string;
//     biggestWin: number;
//   };
//   rewards: {
//     tokens: number;
//     xp: number;
//     leaderboardPoints: number;
//     achievement?: string;
//   };
// };

// type MatchContextType = {
//   activeMatch: Match | null;
//   matchEnded: boolean;
//   matchSummary: MatchSummary | null;
//   timeRemaining: number;
//   joinQueue: () => Promise<void>;
//   createFriendMatch: () => Promise<string>;
//   joinMatch: (matchId: string) => Promise<void>;
//   spectateMatch: (matchId: string) => Promise<void>;
//   forfeitMatch: () => Promise<void>;
//   resetMatch: () => void;
//   rematch: () => Promise<void>;
//   formatTime: (seconds: number) => string;
// };

// // Create context
// const MatchContext = createContext<MatchContextType | undefined>(undefined);

// // Provider component
// export const MatchProvider = ({ children }: { children: ReactNode }) => {
//   const { socket, sendMessage } = useWebSocket();
//   const { connected, address } = useWallet();
//   const { toast } = useToast();
  
//   const [activeMatch, setActiveMatch] = useState<Match | null>(null);
//   const [matchEnded, setMatchEnded] = useState(false);
//   const [matchSummary, setMatchSummary] = useState<MatchSummary | null>(null);
//   const [timeRemaining, setTimeRemaining] = useState(0);
//   const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

//   // Format time as mm:ss
//   const formatTime = useCallback((seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   }, []);

//   // Start countdown timer for match
//   const startTimer = useCallback((duration: number) => {
//     // Clear existing timer if any
//     if (timer) clearInterval(timer);
    
//     setTimeRemaining(duration);
    
//     const interval = setInterval(() => {
//       setTimeRemaining(prev => {
//         if (prev <= 1) {
//           clearInterval(interval);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
    
//     setTimer(interval);
    
//     return () => clearInterval(interval);
//   }, [timer]);

//   // Handle WebSocket messages
//   useEffect(() => {
//     if (!socket) return;

//     const handleMessage = (event: MessageEvent) => {
//       try {
//         const data = JSON.parse(event.data);
        
//         switch (data.type) {
//           case 'match_found':
//             // Match found, update match state
//             const match: Match = data.match;
//             setActiveMatch(match);
//             setMatchEnded(false);
//             startTimer(match.duration);
            
//             toast({
//               title: 'Match Found',
//               description: `You are matched with ${match.opponent.username}`,
//             });
//             break;
            
//           case 'match_update':
//             // Update match state (PnL changes, new spectators, etc.)
//             setActiveMatch(prev => prev ? { ...prev, ...data.update } : null);
//             break;
            
//           case 'match_ended':
//             // Match ended, show summary
//             setMatchEnded(true);
//             setMatchSummary(data.summary);
//             setTimeRemaining(0);
//             if (timer) clearInterval(timer);
            
//             toast({
//               title: data.summary.playerPnl > data.summary.opponentPnl ? 'Victory!' : 'Defeat!',
//               description: 'Match has ended. View your results.',
//             });
//             break;
            
//           case 'spectate_join':
//             // Someone joined as spectator
//             if (activeMatch?.id === data.matchId) {
//               setActiveMatch(prev => prev ? {
//                 ...prev,
//                 spectators: [...(prev.spectators || []), data.spectator]
//               } : null);
//             }
//             break;
//         }
//       } catch (error) {
//         console.error('Failed to parse WebSocket message:', error);
//       }
//     };

//     socket.addEventListener('message', handleMessage);
    
//     return () => {
//       socket.removeEventListener('message', handleMessage);
//     };
//   }, [socket, activeMatch, startTimer, timer, toast]);

//   // Join match queue
//   const joinQueue = useCallback(async () => {
//     if (!connected) {
//       throw new Error('Wallet not connected');
//     }
    
//     try {
//       const response = await apiRequest('POST', '/api/matches/queue', { address });
      
//       toast({
//         title: 'Joined Queue',
//         description: 'Searching for an opponent...',
//       });
      
//       // Server will send match_found event via WebSocket when a match is found
//       return;
//     } catch (error) {
//       console.error('Failed to join queue:', error);
//       throw error;
//     }
//   }, [connected, address, toast]);

//   // Create a friend match (with invite code)
//   const createFriendMatch = useCallback(async () => {
//     if (!connected) {
//       throw new Error('Wallet not connected');
//     }
    
//     try {
//       const response = await apiRequest('POST', '/api/matches/create', { address });
//       const data = await response.json();
      
//       return data.inviteCode;
//     } catch (error) {
//       console.error('Failed to create friend match:', error);
//       throw error;
//     }
//   }, [connected, address]);

//   // Join an existing match by ID
//   const joinMatch = useCallback(async (matchId: string) => {
//     if (!connected) {
//       throw new Error('Wallet not connected');
//     }
    
//     try {
//       await apiRequest('POST', `/api/matches/${matchId}/join`, { address });
      
//       // Server will send match_found event via WebSocket
//     } catch (error) {
//       console.error('Failed to join match:', error);
//       throw error;
//     }
//   }, [connected, address]);

//   // Spectate a match
//   const spectateMatch = useCallback(async (matchId: string) => {
//     try {
//       await apiRequest('POST', `/api/matches/${matchId}/spectate`, { address: address || 'anonymous' });
      
//       // Server will send match data via WebSocket
//     } catch (error) {
//       console.error('Failed to spectate match:', error);
//       throw error;
//     }
//   }, [address]);

//   // Forfeit current match
//   const forfeitMatch = useCallback(async () => {
//     if (!activeMatch) {
//       throw new Error('No active match');
//     }
    
//     try {
//       await apiRequest('POST', `/api/matches/${activeMatch.id}/forfeit`, { address });
      
//       // Server will send match_ended event via WebSocket
//     } catch (error) {
//       console.error('Failed to forfeit match:', error);
//       throw error;
//     }
//   }, [activeMatch, address]);

//   // Reset match state
//   const resetMatch = useCallback(() => {
//     setActiveMatch(null);
//     setMatchEnded(false);
//     setMatchSummary(null);
//     setTimeRemaining(0);
    
//     if (timer) {
//       clearInterval(timer);
//       setTimer(null);
//     }
    
//     // Invalidate match-related queries
//     queryClient.invalidateQueries({ queryKey: ['/api/matches'] });
//   }, [timer]);

//   // Request a rematch
//   const rematch = useCallback(async () => {
//     if (!matchEnded || !matchSummary) {
//       throw new Error('Match not ended yet');
//     }
    
//     try {
//       await apiRequest('POST', '/api/matches/rematch', { 
//         address,
//         opponent: matchSummary.opponentName
//       });
      
//       // Server will send match_found event via WebSocket if opponent accepts
//       toast({
//         title: 'Rematch Requested',
//         description: 'Waiting for your opponent to accept...',
//       });
//     } catch (error) {
//       console.error('Failed to request rematch:', error);
//       throw error;
//     }
//   }, [matchEnded, matchSummary, address, toast]);

//   const value = {
//     activeMatch,
//     matchEnded,
//     matchSummary,
//     timeRemaining,
//     joinQueue,
//     createFriendMatch,
//     joinMatch,
//     spectateMatch,
//     forfeitMatch,
//     resetMatch,
//     rematch,
//     formatTime,
//   };

//   return React.createElement(MatchContext.Provider, { value }, children);
// };

// // Hook to use match context
// export const useMatch = () => {
//   const context = useContext(MatchContext);
//   if (context === undefined) {
//     throw new Error('useMatch must be used within a MatchProvider');
//   }
//   return context;
// };

// import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
// import { useWebSocket } from '@/hooks/useWebSocket';
// import { useWallet } from '@/hooks/useWallet';
// import { useToast } from '@/hooks/use-toast';
// import { apiRequest } from '@/lib/queryClient';
// import { queryClient } from '@/lib/queryClient';

// // Types
// type Player = {
//   username: string;
//   pnl: number;
// };

// type Match = {
//   id: string;
//   player: Player;
//   opponent: Player;
//   market: string;
//   duration: number;
//   startTime: number;
//   spectators: string[];
// };

// type MatchSummary = {
//   playerPnl: number;
//   opponentPnl: number;
//   opponentName: string;
//   stats: {
//     ordersPlaced: number;
//     winRate: number;
//     avgPositionSize: string;
//     biggestWin: number;
//   };
//   rewards: {
//     tokens: number;
//     xp: number;
//     leaderboardPoints: number;
//     achievement?: string;
//   };
// };

// type MatchContextType = {
//   activeMatch: Match | null;
//   matchEnded: boolean;
//   matchSummary: MatchSummary | null;
//   timeRemaining: number;
//   joinQueue: () => Promise<void>;
//   createFriendMatch: (market?: string, duration?: number) => Promise<string>;
//   joinMatch: (matchId: string) => Promise<void>;
//   spectateMatch: (matchId: string) => Promise<void>;
//   forfeitMatch: () => Promise<void>;
//   resetMatch: () => void;
//   rematch: () => Promise<void>;
//   formatTime: (seconds: number) => string;
// };

// // Create context
// const MatchContext = createContext<MatchContextType | undefined>(undefined);

// // Provider component
// export const MatchProvider = ({ children }: { children: ReactNode }) => {
//   const { socket, sendMessage } = useWebSocket();
//   const { connected, address } = useWallet();
//   const { toast } = useToast();
  
//   const [activeMatch, setActiveMatch] = useState<Match | null>(null);
//   const [matchEnded, setMatchEnded] = useState(false);
//   const [matchSummary, setMatchSummary] = useState<MatchSummary | null>(null);
//   const [timeRemaining, setTimeRemaining] = useState(0);
//   const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

//   // Format time as mm:ss
//   const formatTime = useCallback((seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   }, []);

//   // Start countdown timer for match
//   const startTimer = useCallback((duration: number) => {
//     // Clear existing timer if any
//     if (timer) clearInterval(timer);
    
//     setTimeRemaining(duration);
    
//     const interval = setInterval(() => {
//       setTimeRemaining(prev => {
//         if (prev <= 1) {
//           clearInterval(interval);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
    
//     setTimer(interval);
    
//     return () => clearInterval(interval);
//   }, [timer]);

//   // Handle WebSocket messages
//   useEffect(() => {
//     if (!socket) return;

//     const handleMessage = (event: MessageEvent) => {
//       try {
//         const data = JSON.parse(event.data);
        
//         switch (data.type) {
//           case 'match_found':
//             // Match found, update match state
//             console.log('WebSocket: match_found event received', data);
//             const match: Match = data.match;
//             setActiveMatch(match);
//             setMatchEnded(false);
//             startTimer(match.duration);
            
//             toast({
//               title: 'Match Found',
//               description: `You are matched with ${match.opponent.username}`,
//             });
            
//             // Force redirect to match page
//             console.log('Redirecting to match page due to match_found event');
//             setTimeout(() => {
//               window.location.href = '/match';
//             }, 500);
//             break;
            
//           case 'match_update':
//             // Update match state (PnL changes, new spectators, etc.)
//             setActiveMatch(prev => prev ? { ...prev, ...data.update } : null);
//             break;
            
//           case 'match_ended':
//             // Match ended, show summary
//             setMatchEnded(true);
//             setMatchSummary(data.summary);
//             setTimeRemaining(0);
//             if (timer) clearInterval(timer);
            
//             toast({
//               title: data.summary.playerPnl > data.summary.opponentPnl ? 'Victory!' : 'Defeat!',
//               description: 'Match has ended. View your results.',
//             });
//             break;
            
//           case 'spectate_join':
//             // Someone joined as spectator
//             if (activeMatch?.id === data.matchId) {
//               setActiveMatch(prev => prev ? {
//                 ...prev,
//                 spectators: [...(prev.spectators || []), data.spectator]
//               } : null);
//             }
//             break;
//         }
//       } catch (error) {
//         console.error('Failed to parse WebSocket message:', error);
//       }
//     };

//     socket.addEventListener('message', handleMessage);
    
//     return () => {
//       socket.removeEventListener('message', handleMessage);
//     };
//   }, [socket, activeMatch, startTimer, timer, toast]);

//   // Join match queue
//   const joinQueue = useCallback(async () => {
//     if (!connected) {
//       throw new Error('Wallet not connected');
//     }
    
//     try {
//       await apiRequest('/api/matches/queue', { address });
      
//       toast({
//         title: 'Joined Queue',
//         description: 'Searching for an opponent...',
//       });
      
//       // Server will send match_found event via WebSocket when a match is found
//       return;
//     } catch (error) {
//       console.error('Failed to join queue:', error);
//       throw error;
//     }
//   }, [connected, address, toast]);

//   // Create a friend match (with invite code)
//   const createFriendMatch = useCallback(async (market = 'BTC/USDC', duration = 1800) => {
//     if (!connected) {
//       throw new Error('Wallet not connected');
//     }
    
//     try {
//       const response = await apiRequest({
//         url: '/api/matches/create',
//         method: 'POST',
//         body: { 
//           address,
//           market,
//           duration 
//         },
//       });
//       const data = await response.json();
      
//       return data.inviteCode;
//     } catch (error) {
//       console.error('Failed to create friend match:', error);
//       throw error;
//     }
//   }, [connected, address]);

//   // Join an existing match by invite code
//   const joinMatch = useCallback(async (inviteCode: string) => {
//     if (!connected) {
//       throw new Error('Wallet not connected');
//     }
    
//     try {
//       // First, look up the match ID using the invite code
//       console.log('Looking up match with invite code:', inviteCode);
//       const lookupResponse = await apiRequest({
//         url: `/api/matches/code/${inviteCode}`,
//         method: 'GET'
//       });
//       const lookupData = await lookupResponse.json();
      
//       if (!lookupData.matchId) {
//         throw new Error('Invalid invite code');
//       }
      
//       console.log('Found match with ID:', lookupData.matchId);
      
//       // Now join the match using the actual match ID
//       await apiRequest({
//         url: `/api/matches/${lookupData.matchId}/join`,
//         method: 'POST',
//         body: { address }
//       });
      
//       // Server will send match_found event via WebSocket
//     } catch (error) {
//       console.error('Failed to join match:', error);
//       throw error;
//     }
//   }, [connected, address]);

//   // Spectate a match
//   const spectateMatch = useCallback(async (matchId: string) => {
//     try {
//       await apiRequest(`/api/matches/${matchId}/spectate`, { address: address || 'anonymous' });
      
//       // Server will send match data via WebSocket
//     } catch (error) {
//       console.error('Failed to spectate match:', error);
//       throw error;
//     }
//   }, [address]);

//   // Forfeit current match
//   const forfeitMatch = useCallback(async () => {
//     if (!activeMatch) {
//       throw new Error('No active match');
//     }
    
//     try {
//       await apiRequest(`/api/matches/${activeMatch.id}/forfeit`, { address });
      
//       // Server will send match_ended event via WebSocket
//     } catch (error) {
//       console.error('Failed to forfeit match:', error);
//       throw error;
//     }
//   }, [activeMatch, address]);

//   // Reset match state
//   const resetMatch = useCallback(() => {
//     setActiveMatch(null);
//     setMatchEnded(false);
//     setMatchSummary(null);
//     setTimeRemaining(0);
    
//     if (timer) {
//       clearInterval(timer);
//       setTimer(null);
//     }
    
//     // Invalidate match-related queries
//     queryClient.invalidateQueries({ queryKey: ['/api/matches'] });
//   }, [timer]);

//   // Request a rematch
//   const rematch = useCallback(async () => {
//     if (!matchEnded || !matchSummary) {
//       throw new Error('Match not ended yet');
//     }
    
//     try {
//       await apiRequest('/api/matches/rematch', { 
//         address,
//         opponent: matchSummary.opponentName
//       });
      
//       // Server will send match_found event via WebSocket if opponent accepts
//       toast({
//         title: 'Rematch Requested',
//         description: 'Waiting for your opponent to accept...',
//       });
//     } catch (error) {
//       console.error('Failed to request rematch:', error);
//       throw error;
//     }
//   }, [matchEnded, matchSummary, address, toast]);

//   const value = {
//     activeMatch,
//     matchEnded,
//     matchSummary,
//     timeRemaining,
//     joinQueue,
//     createFriendMatch,
//     joinMatch,
//     spectateMatch,
//     forfeitMatch,
//     resetMatch,
//     rematch,
//     formatTime,
//   };

//   return <MatchContext.Provider value={value}>{children}</MatchContext.Provider>;
// };

// // Hook to use match context
// export const useMatch = () => {
//   const context = useContext(MatchContext);
//   if (context === undefined) {
//     throw new Error('useMatch must be used within a MatchProvider');
//   }
//   return context;
// };

// import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
// import { useWebSocket } from '@/hooks/useWebSocket';
// import { useWallet } from '@/hooks/useWallet';
// import { useToast } from '@/hooks/use-toast';
// import { apiRequest } from '@/lib/queryClient';
// import { queryClient } from '@/lib/queryClient';

// // Types
// type Player = {
//   username: string;
//   pnl: number;
// };

// type Match = {
//   id: string;
//   player: Player;
//   opponent: Player;
//   market: string;
//   duration: number;
//   startTime: number;
//   spectators: string[];
// };

// type MatchSummary = {
//   playerPnl: number;
//   opponentPnl: number;
//   opponentName: string;
//   stats: {
//     ordersPlaced: number;
//     winRate: number;
//     avgPositionSize: string;
//     biggestWin: number;
//   };
//   rewards: {
//     tokens: number;
//     xp: number;
//     leaderboardPoints: number;
//     achievement?: string;
//   };
// };

// type MatchContextType = {
//   activeMatch: Match | null;
//   matchEnded: boolean;
//   matchSummary: MatchSummary | null;
//   timeRemaining: number;
//   joinQueue: () => Promise<void>;
//   createFriendMatch: () => Promise<string>;
//   joinMatch: (matchId: string) => Promise<void>;
//   spectateMatch: (matchId: string) => Promise<void>;
//   forfeitMatch: () => Promise<void>;
//   resetMatch: () => void;
//   rematch: () => Promise<void>;
//   formatTime: (seconds: number) => string;
// };

// // Create context
// const MatchContext = createContext<MatchContextType | undefined>(undefined);

// // Provider component
// export const MatchProvider = ({ children }: { children: ReactNode }) => {
//   const { socket, sendMessage } = useWebSocket();
//   const { connected, address } = useWallet();
//   const { toast } = useToast();
  
//   const [activeMatch, setActiveMatch] = useState<Match | null>(null);
//   const [matchEnded, setMatchEnded] = useState(false);
//   const [matchSummary, setMatchSummary] = useState<MatchSummary | null>(null);
//   const [timeRemaining, setTimeRemaining] = useState(0);
//   const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

//   // Format time as mm:ss
//   const formatTime = useCallback((seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   }, []);

//   // Start countdown timer for match
//   const startTimer = useCallback((duration: number) => {
//     // Clear existing timer if any
//     if (timer) clearInterval(timer);
    
//     setTimeRemaining(duration);
    
//     const interval = setInterval(() => {
//       setTimeRemaining(prev => {
//         if (prev <= 1) {
//           clearInterval(interval);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
    
//     setTimer(interval);
    
//     return () => clearInterval(interval);
//   }, [timer]);

//   // Handle WebSocket messages with throttling for high-frequency updates
//   useEffect(() => {
//     if (!socket) return;

//     const lastUpdateTimeRef = useRef<number>(0);
//     const latestMatchRef = useRef<Match | null>(null);

//     const handleMessage = (event: MessageEvent) => {
//       try {
//         const data = JSON.parse(event.data);
//         const now = Date.now();
        
//         switch (data.type) {
//           case 'match_found':
//             // Match found - this is an important update, don't throttle
//             const match: Match = data.match;
//             setActiveMatch(match);
//             setMatchEnded(false);
//             startTimer(match.duration);
            
//             toast({
//               title: 'Match Found',
//               description: `You are matched with ${match.opponent.username}`,
//             });
//             break;
            
//           case 'match_update':
//             // For PnL updates, only apply if enough time has passed or it's significant
//             if (data.update && latestMatchRef.current) {
//               // Check if this is a frequent update (like PnL changes)
//               const isPnLUpdate = data.update.player?.pnl !== undefined || 
//                                 data.update.opponent?.pnl !== undefined;
              
//               // For PnL updates, we want to throttle them more aggressively
//               // For other updates (spectators, etc), apply immediately
//               const minUpdateInterval = isPnLUpdate ? 1000 : 200; // 1 second for PnL, 200ms for others
              
//               if (!isPnLUpdate || now - lastUpdateTimeRef.current > minUpdateInterval) {
//                 lastUpdateTimeRef.current = now;
//                 // TypeScript safe version of the update
//                 setActiveMatch((prev: Match | null) => {
//                   if (!prev) return null;
//                   return { ...prev, ...data.update };
//                 });
//               }
//             }
//             break;
            
//           case 'match_ended':
//             // Match ended - important, don't throttle
//             setMatchEnded(true);
//             setMatchSummary(data.summary);
//             setTimeRemaining(0);
//             if (timer) clearInterval(timer);
            
//             toast({
//               title: data.summary.playerPnl > data.summary.opponentPnl ? 'Victory!' : 'Defeat!',
//               description: 'Match has ended. View your results.',
//             });
//             break;
            
//           case 'spectate_join':
//             // Someone joined as spectator
//             if (activeMatch?.id === data.matchId) {
//               setActiveMatch(prev => prev ? {
//                 ...prev,
//                 spectators: [...(prev.spectators || []), data.spectator]
//               } : null);
//             }
//             break;
//         }
//       } catch (error) {
//         console.error('Failed to parse WebSocket message:', error);
//       }
//     };

//     socket.addEventListener('message', handleMessage);
    
//     return () => {
//       socket.removeEventListener('message', handleMessage);
//     };
//   }, [socket, activeMatch, startTimer, timer, toast]);

//   // Join match queue
//   const joinQueue = useCallback(async () => {
//     if (!connected) {
//       throw new Error('Wallet not connected');
//     }
    
//     try {
//       const response = await apiRequest('POST', '/api/matches/queue', { address });
      
//       toast({
//         title: 'Joined Queue',
//         description: 'Searching for an opponent...',
//       });
      
//       // Server will send match_found event via WebSocket when a match is found
//       return;
//     } catch (error) {
//       console.error('Failed to join queue:', error);
//       throw error;
//     }
//   }, [connected, address, toast]);

//   // Create a friend match (with invite code)
//   const createFriendMatch = useCallback(async () => {
//     if (!connected) {
//       throw new Error('Wallet not connected');
//     }
    
//     try {
//       const response = await apiRequest('POST', '/api/matches/create', { address });
//       const data = await response.json();
      
//       return data.inviteCode;
//     } catch (error) {
//       console.error('Failed to create friend match:', error);
//       throw error;
//     }
//   }, [connected, address]);

//   // Join an existing match by ID
//   const joinMatch = useCallback(async (matchId: string) => {
//     if (!connected) {
//       throw new Error('Wallet not connected');
//     }
    
//     try {
//       await apiRequest('POST', `/api/matches/${matchId}/join`, { address });
      
//       // Server will send match_found event via WebSocket
//     } catch (error) {
//       console.error('Failed to join match:', error);
//       throw error;
//     }
//   }, [connected, address]);

//   // Spectate a match
//   const spectateMatch = useCallback(async (matchId: string) => {
//     try {
//       await apiRequest('POST', `/api/matches/${matchId}/spectate`, { address: address || 'anonymous' });
      
//       // Server will send match data via WebSocket
//     } catch (error) {
//       console.error('Failed to spectate match:', error);
//       throw error;
//     }
//   }, [address]);

//   // Forfeit current match
//   const forfeitMatch = useCallback(async () => {
//     if (!activeMatch) {
//       throw new Error('No active match');
//     }
    
//     try {
//       await apiRequest('POST', `/api/matches/${activeMatch.id}/forfeit`, { address });
      
//       // Server will send match_ended event via WebSocket
//     } catch (error) {
//       console.error('Failed to forfeit match:', error);
//       throw error;
//     }
//   }, [activeMatch, address]);

//   // Reset match state
//   const resetMatch = useCallback(() => {
//     setActiveMatch(null);
//     setMatchEnded(false);
//     setMatchSummary(null);
//     setTimeRemaining(0);
    
//     if (timer) {
//       clearInterval(timer);
//       setTimer(null);
//     }
    
//     // Invalidate match-related queries
//     queryClient.invalidateQueries({ queryKey: ['/api/matches'] });
//   }, [timer]);

//   // Request a rematch
//   const rematch = useCallback(async () => {
//     if (!matchEnded || !matchSummary) {
//       throw new Error('Match not ended yet');
//     }
    
//     try {
//       await apiRequest('POST', '/api/matches/rematch', { 
//         address,
//         opponent: matchSummary.opponentName
//       });
      
//       // Server will send match_found event via WebSocket if opponent accepts
//       toast({
//         title: 'Rematch Requested',
//         description: 'Waiting for your opponent to accept...',
//       });
//     } catch (error) {
//       console.error('Failed to request rematch:', error);
//       throw error;
//     }
//   }, [matchEnded, matchSummary, address, toast]);

//   const value = {
//     activeMatch,
//     matchEnded,
//     matchSummary,
//     timeRemaining,
//     joinQueue,
//     createFriendMatch,
//     joinMatch,
//     spectateMatch,
//     forfeitMatch,
//     resetMatch,
//     rematch,
//     formatTime,
//   };

//   return React.createElement(MatchContext.Provider, { value }, children);
// };

// // Hook to use match context
import { useState, useEffect, useCallback, useContext, createContext, ReactNode, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
// Import matchStorage types but load the module dynamically to avoid SSR issues
import type { Match as MatchStorageType, MatchPlayer } from '../utils/matchStorage';

// Convert between Match types
const convertToMatchStorage = (match: Match): MatchStorageType => {
  return {
    id: match.id,
    player1: match.player1 as MatchPlayer,
    player2: match.player2 as MatchPlayer | undefined,
    market: match.market,
    duration: match.duration,
    stake: match.stake || '0',
    status: match.status === 'ended' ? 'completed' : match.status,
    startTime: match.startTime,
    endTime: match.endTime,
    winner: match.winner,
    gameCode: match.gameCode,
    createdAt: match.createdAt || Date.now()
  };
};

const convertFromMatchStorage = (match: MatchStorageType): Match => {
  return {
    id: match.id,
    player1: match.player1 as Player,
    player2: match.player2 as Player | undefined,
    market: match.market,
    duration: match.duration,
    stake: match.stake,
    status: match.status === 'completed' ? 'ended' : match.status,
    startTime: match.startTime,
    endTime: match.endTime,
    winner: match.winner,
    gameCode: match.gameCode,
    createdAt: match.createdAt,
    // Add compatibility fields
    player: match.player1 as Player,
    opponent: match.player2 as Player | undefined,
    spectators: []
  };
};

// Utility function to throttle high-frequency updates
function useThrottledState<T>(initialState: T, interval: number = 1000) {
  const [state, setState] = useState<T>(initialState);
  const pendingUpdatesRef = useRef<T | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  
  // Type-safe throttled setState function
  const throttledSetState = useCallback((newState: T | ((prevState: T) => T)) => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
    
    // Function to process updates
    const processUpdate = () => {
      if (pendingUpdatesRef.current !== null) {
        setState(pendingUpdatesRef.current);
        lastUpdateTimeRef.current = Date.now();
        pendingUpdatesRef.current = null;
      }
    };
    
    // Calculate new state (handling both function and direct value updates)
    const calculatedNewState = typeof newState === 'function'
      ? (newState as (prev: T) => T)(state)
      : newState;
    
    // Store the latest update
    pendingUpdatesRef.current = calculatedNewState;
    
    // If we're within the throttle window, set up a timeout
    if (timeSinceLastUpdate < interval) {
      // Clear existing timeout if any
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set new timeout for the remaining throttle time
      timeoutRef.current = setTimeout(processUpdate, interval - timeSinceLastUpdate);
    } else {
      // Outside throttle window, update immediately
      processUpdate();
    }
  }, [state, interval]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return [state, throttledSetState] as const;
}

// Types
type Player = {
  username: string;
  pnl: number;
};

// Main Match interface for internal use
export interface Match {
  id: string;
  player1: Player;
  player2?: Player;
  market: string;
  duration: number;
  startTime?: number;
  stake: string;
  status: 'pending' | 'active' | 'ended' | 'completed' | 'cancelled';
  gameCode?: string;
  createdAt?: number;
  endTime?: number;
  winner?: string;
  
  // Legacy fields to maintain compatibility with existing code
  player?: Player;
  opponent?: Player;
  spectators?: string[];
};

type MatchSummary = {
  playerPnl: number;
  opponentPnl: number;
  opponentName: string;
  stats: {
    ordersPlaced: number;
    winRate: number;
    avgPositionSize: string;
    biggestWin: number;
  };
  rewards: {
    tokens: number;
    xp: number;
    leaderboardPoints: number;
    achievement?: string;
  };
};

type MatchContextType = {
  activeMatch: Match | null;
  matchEnded: boolean;
  matchSummary: MatchSummary | null;
  timeRemaining: number;
  joinQueue: () => Promise<void>;
  createFriendMatch: (market?: string, duration?: number) => Promise<{ inviteCode: string; matchId: string }>;
  joinMatch: (inviteCode: string) => Promise<void>;
  spectateMatch: (matchId: string) => Promise<void>;
  forfeitMatch: () => Promise<void>;
  resetMatch: () => void;
  rematch: () => Promise<void>;
  formatTime: (seconds: number) => string;
  setActiveMatch: (match: Match | null) => void;
};

// Create context
const MatchContext = createContext<MatchContextType | undefined>(undefined);

// Provider component
export const MatchProvider = ({ children }: { children: ReactNode }) => {
  const { socket, sendMessage } = useWebSocket();
  const { connected, address } = useWallet();
  const { toast } = useToast();
  
  // Use throttled state for match updates to prevent excessive re-renders
  const [activeMatch, setActiveMatchThrottled] = useThrottledState<Match | null>(null, 1000);
  const latestMatchRef = useRef<Match | null>(null);
  
  // Create a wrapper for setActiveMatch that both updates the throttled state
  // and keeps a reference to the latest value
  const setActiveMatch = useCallback((matchOrUpdater: Match | null | ((prev: Match | null) => Match | null)) => {
    if (typeof matchOrUpdater === 'function') {
      // If it's a function updater, call it with the current value
      const updaterFn = matchOrUpdater as ((prev: Match | null) => Match | null);
      const updatedMatch = updaterFn(latestMatchRef.current);
      latestMatchRef.current = updatedMatch;
      setActiveMatchThrottled(updatedMatch);
    } else {
      // If it's a direct value
      latestMatchRef.current = matchOrUpdater;
      setActiveMatchThrottled(matchOrUpdater);
    }
  }, [setActiveMatchThrottled]);
  
  const [matchEnded, setMatchEnded] = useState(false);
  const [matchSummary, setMatchSummary] = useState<MatchSummary | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Track the last update timestamp to prevent too frequent updates
  const lastUpdateTimeRef = useRef<number>(0);

  // Format time as mm:ss
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Start countdown timer for match
  const startTimer = useCallback((duration: number) => {
    // Clear existing timer if any
    if (timer) clearInterval(timer);
    
    setTimeRemaining(duration);
    
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setTimer(interval);
    
    return () => clearInterval(interval);
  }, [timer]);

  // Handle WebSocket messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        // Add debug logging for all WebSocket messages
        console.log('WebSocket message received in MatchProvider:', event.data);
        
        const data = JSON.parse(event.data);
        console.log('Parsed WebSocket data:', data);
        console.log('Message type:', data.type);
        
        switch (data.type) {
          case 'match_found':
            // Match found, update match state
            console.log('WebSocket: match_found event received', data);
            const match: Match = data.match;
            
            // CRITICAL FIX: Ensure we properly save complete match data with all required fields
            // This prevents blank screen when navigating to match page
            console.log('Setting active match with data:', match);
            
            // Update active match in context first to ensure instant availability
            setActiveMatch(match);
            setMatchEnded(false);
            startTimer(match.duration);
            
            // Synchronously save to localStorage with error handling for persistence
            try {
              console.log('Saving match data to localStorage');
              localStorage.setItem('activeMatchData', JSON.stringify(match));
            } catch (storageError) {
              console.error('Error saving match data to localStorage:', storageError);
            }
            
            // Show ONLY ONE notification with manual navigation button
            toast({
              title: "Match Found",
              description: `You are matched with ${match.opponent?.username || 'another player'}. Click below to join the match.`,
              action: (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => {
                    // CRITICAL FIX: Double ensure match data is saved before navigation
                    try {
                      localStorage.setItem('activeMatchData', JSON.stringify(match));
                    } catch (e) {}
                    
                    // Use window.location.href for reliable navigation with fresh state
                    window.location.href = `/match/${match.id}`;
                  }}
                >
                  Join Match
                </Button>
              ),
              duration: 0, // Keep visible until dismissed
            });
            break;
            
          case 'match_update':
            // Update match state (PnL changes, new spectators, etc.)
            console.log('WebSocket: match_update event received', data);
            setActiveMatch(prev => {
              if (!prev) return null;
              const updatedMatch = { ...prev, ...data.update };
              
              // Special handling for match status transition from pending to active
              if (prev.status === 'pending' && updatedMatch.status === 'active') {
                console.log('Match status changed from pending to active');
                
                // Show a toast notification to inform the user
                toast({
                  title: "Opponent Joined!",
                  description: "Your opponent has joined the match! The game is now active.",
                  action: (
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={() => window.location.reload()}
                    >
                      Refresh Game
                    </Button>
                  ),
                  duration: 5000,
                });
              }
              
              // Update localStorage with the most recent match state
              try {
                localStorage.setItem('activeMatchData', JSON.stringify(updatedMatch));
              } catch (storageError) {
                console.error('Error saving updated match data to localStorage:', storageError);
              }
              
              return updatedMatch;
            });
            
            const isPnLUpdate = data.update?.player?.pnl !== undefined || 
                              data.update?.opponent?.pnl !== undefined;
            
            // Get current timestamp to rate-limit frequent updates
            const currentTime = Date.now();
            
            if (!isPnLUpdate || (currentTime - lastUpdateTimeRef.current) > 1000) {
              lastUpdateTimeRef.current = currentTime;
              // Apply updates directly with careful type handling
              if (latestMatchRef.current) {
                const updatedMatch = { ...latestMatchRef.current, ...data.update };
                setActiveMatch(updatedMatch);
              }
            }
            break;
            
          case 'match_ended':
            // Match ended, update state
            console.log('WebSocket: match_ended event received', data);
            setMatchEnded(true);
            setMatchSummary(data.summary);
            setTimeRemaining(0);
            if (timer) clearInterval(timer);
            
            // Ensure we keep match data until user explicitly navigates away
            // This prevents flickering between states
            try {
              // Keep the match data but mark it as ended
              if (latestMatchRef.current) {
                const endedMatch = { ...latestMatchRef.current, status: 'ended' };
                localStorage.setItem('activeMatchData', JSON.stringify(endedMatch));
              }
            } catch (storageError) {
              console.error('Error updating match end state in localStorage:', storageError);
            }
            
            toast({
              title: data.summary.playerPnl > data.summary.opponentPnl ? 'Victory!' : 'Defeat!',
              description: 'Match has ended. View your results.',
            });
            break;
            
          case 'spectate_join':
            // Someone joined as spectator
            if (activeMatch?.id === data.matchId) {
              setActiveMatch(prev => prev ? {
                ...prev,
                spectators: [...(prev.spectators || []), data.spectator]
              } : null);
            }
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    socket.addEventListener('message', handleMessage);
    
    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, activeMatch, startTimer, timer, toast]);

  // Join match queue
  const joinQueue = useCallback(async () => {
    if (!connected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      await apiRequest('/api/matches/queue', { address });
      
      toast({
        title: 'Joined Queue',
        description: 'Searching for an opponent...',
      });
      
      // Server will send match_found event via WebSocket when a match is found
      return;
    } catch (error) {
      console.error('Failed to join queue:', error);
      throw error;
    }
  }, [connected, address, toast]);

  // Create a friend match (with invite code)
  const createFriendMatch = useCallback(async (market = 'BTC/USDC', duration = 1800) => {
    if (!connected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      // Step 1: Create the match via API
      const response = await apiRequest({
        url: '/api/matches/create',
        method: 'POST',
        body: { 
          address,
          market,
          duration 
        },
      });
      const data = await response.json();
      
      // Step 2: Get full match details
      try {
        const matchStorage = await import('../utils/matchStorage');
        const matchResponse = await apiRequest({
          url: `/api/matches/${data.matchId}`,
          method: 'GET'
        });
        const matchData = await matchResponse.json();
        
        // Get user data for enhanced match object
        const username = localStorage.getItem('cryptoclash_username') || 'Player 1';
        const stake = localStorage.getItem('cryptoclash_stake') || '100';
        
        // Step 3: Store match data
        if (matchData.match) {
          // Use API match data if available
          const matchToStore: Match = {
            ...matchData.match,
            gameCode: data.inviteCode,
            status: 'pending',
            createdAt: Date.now()
          };
          
          // Store the match and set as active
          await matchStorage.storeMatch(convertToMatchStorage(matchToStore));
          await matchStorage.setActiveMatch(convertToMatchStorage(matchToStore));
          setActiveMatch(matchToStore);
          console.log('Match stored in localStorage with API data:', matchToStore.id);
        } else {
          // Create minimal match object if API doesn't return full details
          const newMatch: Match = {
            id: data.matchId,
            player1: {
              username,
              pnl: 0
            },
            market,
            duration,
            stake,
            status: 'pending',
            gameCode: data.inviteCode,
            createdAt: Date.now()
          };
          
          // Store the minimal match and set as active
          await matchStorage.storeMatch(convertToMatchStorage(newMatch));
          await matchStorage.setActiveMatch(convertToMatchStorage(newMatch));
          setActiveMatch(newMatch);
          console.log('Match stored in localStorage with minimal data:', newMatch.id);
        }
      } catch (fetchError) {
        console.error('Failed to fetch match details or store match:', fetchError);
        // Continue execution - we can still return the invite code even if storage fails
      }
      
      // Always return the invite code and match ID
      return {
        inviteCode: data.inviteCode,
        matchId: data.matchId
      };
    } catch (error) {
      console.error('Failed to create friend match:', error);
      throw error;
    }
  }, [connected, address, setActiveMatch]);

  // Join an existing match by invite code
  const joinMatch = useCallback(async (inviteCode: string) => {
    if (!connected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      // First, look up the match ID using the invite code
      console.log('Looking up match with invite code:', inviteCode);
      const lookupResponse = await apiRequest({
        url: `/api/matches/code/${inviteCode}`,
        method: 'GET'
      });
      const lookupData = await lookupResponse.json();
      
      if (!lookupData.matchId) {
        throw new Error('Invalid invite code');
      }
      
      console.log('Found match with ID:', lookupData.matchId);
      
      // Now join the match using the actual match ID
      await apiRequest({
        url: `/api/matches/${lookupData.matchId}/join`,
        method: 'POST',
        body: { address }
      });
      
      // Update match in localStorage
      const matchStorage = await import('../utils/matchStorage');
      const existingMatch = matchStorage.getMatch(lookupData.matchId);
      
      if (existingMatch) {
        const username = localStorage.getItem('cryptoclash_username') || 'Player 2';
        
        // Update the match with player 2 information
        matchStorage.updateMatch(lookupData.matchId, {
          player2: {
            username,
            pnl: 0
          },
          status: 'active',
          startTime: Date.now()
        });
        
        // Set this as the active match
        const updatedMatch = matchStorage.getMatch(lookupData.matchId);
        if (updatedMatch) {
          matchStorage.setActiveMatch(updatedMatch);
        }
      }
      
      // Navigate to the match page with the match ID
      window.location.href = `/match/${lookupData.matchId}`;
      
      // Server will also send match_found event via WebSocket
    } catch (error) {
      console.error('Failed to join match:', error);
      throw error;
    }
  }, [connected, address]);

  // Spectate a match
  const spectateMatch = useCallback(async (matchId: string) => {
    try {
      await apiRequest(`/api/matches/${matchId}/spectate`, { address: address || 'anonymous' });
      
      // Server will send match data via WebSocket
    } catch (error) {
      console.error('Failed to spectate match:', error);
      throw error;
    }
  }, [address]);

  // Forfeit current match
  const forfeitMatch = useCallback(async () => {
    if (!activeMatch) {
      throw new Error('No active match');
    }
    
    try {
      await apiRequest(`/api/matches/${activeMatch.id}/forfeit`, { address });
      
      // Server will send match_ended event via WebSocket
    } catch (error) {
      console.error('Failed to forfeit match:', error);
      throw error;
    }
  }, [activeMatch, address]);

  // Reset match state
  const resetMatch = useCallback(() => {
    setActiveMatch(null);
    setMatchEnded(false);
    setMatchSummary(null);
    setTimeRemaining(0);
    
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    
    // Clear match data from localStorage using our storage utility
    console.log('Clearing active match from localStorage');
    const clearActiveMatch = async () => {
      try {
        const matchStorage = await import('../utils/matchStorage');
        matchStorage.setActiveMatch(null);
      } catch (error) {
        console.error('Failed to clear active match from localStorage:', error);
      }
    };
    clearActiveMatch();
    
    // Invalidate match-related queries
    queryClient.invalidateQueries({ queryKey: ['/api/matches'] });
  }, [timer, setActiveMatch, setMatchEnded, setMatchSummary, setTimeRemaining, setTimer]); // Add missing dependencies

  // Request a rematch
  const rematch = useCallback(async () => {
    if (!matchEnded || !matchSummary) {
      throw new Error('Match not ended yet');
    }
    
    try {
      await apiRequest('/api/matches/rematch', { 
        address,
        opponent: matchSummary.opponentName
      });
      
      // Server will send match_found event via WebSocket if opponent accepts
      toast({
        title: 'Rematch Requested',
        description: 'Waiting for your opponent to accept...',
      });
    } catch (error) {
      console.error('Failed to request rematch:', error);
      throw error;
    }
  }, [matchEnded, matchSummary, address, toast]);

  // Initialize from localStorage on component mount
  useEffect(() => {
    const loadMatchFromLocalStorage = async () => {
      try {
        const matchStorage = await import('../utils/matchStorage');
        const storedMatch = matchStorage.getActiveMatch();
        
        if (storedMatch) {
          console.log('Loading active match from localStorage:', storedMatch);
          // Convert from storage format to our internal format
          const internalMatch = convertFromMatchStorage(storedMatch);
          setActiveMatch(internalMatch);
          
          // Set match state based on stored match
          if (storedMatch.status === 'completed') {
            setMatchEnded(true);
          } else if (storedMatch.status === 'active' && storedMatch.startTime && storedMatch.duration) {
            const elapsedSeconds = Math.floor((Date.now() - storedMatch.startTime) / 1000);
            const remainingTime = Math.max(0, storedMatch.duration - elapsedSeconds);
            
            if (remainingTime > 0) {
              startTimer(remainingTime);
            } else {
              setMatchEnded(true);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load match from localStorage:', error);
      }
    };
    
    loadMatchFromLocalStorage();
  }, [/* Dependencies fixed: remove startTimer to prevent circular dependency */]); // Only re-run on mount
  
  // Update localStorage when activeMatch changes
  useEffect(() => {
    const updateStoredMatch = async () => {
      try {
        if (activeMatch) {
          const matchStorage = await import('../utils/matchStorage');
          // Convert to storage format before saving
          const storageMatch = convertToMatchStorage(activeMatch);
          matchStorage.setActiveMatch(storageMatch);

          // Also ensure match is stored in the matches collection
          if (activeMatch.id) {
            matchStorage.storeMatch(storageMatch);
          }
        }
      } catch (error) {
        console.error('Failed to update match in localStorage:', error);
      }
    };
    
    updateStoredMatch();
  }, [activeMatch]);

  const value = {
    activeMatch,
    matchEnded,
    matchSummary,
    timeRemaining,
    joinQueue,
    createFriendMatch,
    joinMatch,
    spectateMatch,
    forfeitMatch,
    resetMatch,
    rematch,
    formatTime,
    // Expose setActiveMatch to allow direct updates
    setActiveMatch,
  };

  return <MatchContext.Provider value={value}>{children}</MatchContext.Provider>;
};

// Hook to use match context
export const useMatch = () => {
  const context = useContext(MatchContext);
  if (context === undefined) {
    throw new Error('useMatch must be used within a MatchProvider');
  }
  return context;
};









