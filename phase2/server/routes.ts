// import express, { type Express, Request, Response, NextFunction } from "express";
// import { createServer, type Server } from "http";
// import { WebSocketServer, WebSocket } from 'ws';
// import { storage } from "./storage";
// import { 
//   insertUserSchema, 
//   insertMatchSchema, 
//   insertPositionSchema,
//   insertActivitySchema,
//   insertReelSchema,
//   insertFollowSchema,
//   insertFeatureFlagSchema,
//   insertSystemMetricSchema
// } from "@shared/schema";
// import { z } from "zod";
// import { nanoid } from "nanoid";

// // Validator for wallet address
// const walletAddressSchema = z.object({
//   address: z.string().min(1, "Wallet address is required")
// });

// // Connected WebSocket clients
// const clients = new Map<string, { ws: WebSocket, userId?: number }>();

// export async function registerRoutes(app: Express): Promise<Server> {
//   const httpServer = createServer(app);
  
//   // Setup WebSocket server
//   const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
//   wss.on('connection', (ws) => {
//     const clientId = nanoid();
//     clients.set(clientId, { ws });
    
//     ws.on('message', async (message) => {
//       try {
//         const data = JSON.parse(message.toString());
        
//         // Handle different message types
//         if (data.type === 'auth' && data.address) {
//           const user = await storage.getUserByWalletAddress(data.address);
//           if (user) {
//             clients.set(clientId, { ws, userId: user.id });
//           }
//         }
//       } catch (e) {
//         console.error('Error processing WebSocket message:', e);
//       }
//     });
    
//     ws.on('close', () => {
//       clients.delete(clientId);
//     });
//   });
  
//   // Broadcast to all or specific clients
//   const broadcast = (data: any, filter?: (client: { ws: WebSocket, userId?: number }) => boolean) => {
//     const message = JSON.stringify(data);
//     clients.forEach((client, id) => {
//       if (client.ws.readyState === WebSocket.OPEN && (!filter || filter(client))) {
//         client.ws.send(message);
//       }
//     });
//   };
  
//   // Broadcast to a specific user
//   const broadcastToUser = (userId: number, data: any) => {
//     broadcast(data, client => client.userId === userId);
//   };
  
//   // Broadcast to match participants and spectators
//   const broadcastToMatch = async (matchId: number, data: any) => {
//     const match = await storage.getMatch(matchId);
//     if (!match) return;
    
//     broadcast(data, client => 
//       client.userId === match.player1Id || 
//       client.userId === match.player2Id ||
//       (match.spectators || []).some(spectator => {
//         // Match username or ID based on what's stored in spectators array
//         if (typeof spectator === 'string' && client.userId) {
//           const user = Array.from(storage.users.values()).find(u => u.id === client.userId);
//           return user && user.username === spectator;
//         }
//         return false;
//       })
//     );
//   };
  
//   // Authentication API
//   app.post('/api/auth/register', async (req: Request, res: Response) => {
//     try {
//       const data = insertUserSchema.parse(req.body);
      
//       // Check if username already exists
//       const existingUser = await storage.getUserByUsername(data.username);
//       if (existingUser) {
//         return res.status(400).json({ message: "Username already taken" });
//       }
      
//       // Check if wallet already exists
//       if (data.walletAddress) {
//         const existingWallet = await storage.getUserByWalletAddress(data.walletAddress);
//         if (existingWallet) {
//           return res.status(400).json({ message: "Wallet address already registered" });
//         }
//       }
      
//       const user = await storage.createUser(data);
//       res.status(201).json({ 
//         id: user.id, 
//         username: user.username,
//         walletAddress: user.walletAddress 
//       });
//     } catch (error) {
//       if (error instanceof z.ZodError) {
//         return res.status(400).json({ message: "Invalid data", errors: error.errors });
//       }
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   app.post('/api/auth/login', async (req: Request, res: Response) => {
//     try {
//       const { username, password } = req.body;
      
//       const user = await storage.getUserByUsername(username);
//       if (!user || user.password !== password) {
//         return res.status(401).json({ message: "Invalid credentials" });
//       }
      
//       res.json({
//         id: user.id,
//         username: user.username,
//         walletAddress: user.walletAddress
//       });
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   app.post('/api/auth/wallet', async (req: Request, res: Response) => {
//     try {
//       const { address } = walletAddressSchema.parse(req.body);
      
//       let user = await storage.getUserByWalletAddress(address);
      
//       // If user doesn't exist, create one
//       if (!user) {
//         const username = `User${Math.floor(Math.random() * 10000)}`;
//         user = await storage.createUser({
//           username,
//           password: nanoid(),
//           walletAddress: address
//         });
//       }
      
//       res.json({
//         id: user.id,
//         username: user.username,
//         walletAddress: user.walletAddress
//       });
//     } catch (error) {
//       if (error instanceof z.ZodError) {
//         return res.status(400).json({ message: "Invalid data", errors: error.errors });
//       }
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   // User profile API
//   app.get('/api/profile', async (req: Request, res: Response) => {
//     try {
//       const { address } = req.query;
      
//       if (!address || typeof address !== 'string') {
//         return res.status(400).json({ message: "Wallet address is required" });
//       }
      
//       const user = await storage.getUserByWalletAddress(address);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
      
//       // Get user matches
//       const matches = await storage.getUserMatches(user.id);
      
//       // Get follow counts
//       const followers = await storage.getFollowers(user.id);
//       const following = await storage.getFollowing(user.id);
      
//       // Get leaderboard entry
//       const leaderboardEntries = await storage.getLeaderboard();
//       const leaderboardEntry = leaderboardEntries.find(entry => entry.userId === user.id);
      
//       // Format match history
//       const matchHistory = matches
//         .filter(match => match.status === 'completed')
//         .slice(0, 10)
//         .map(match => {
//           const isPlayer1 = match.player1Id === user.id;
//           const playerPnl = isPlayer1 ? match.player1Pnl : match.player2Pnl;
//           const opponentPnl = isPlayer1 ? match.player2Pnl : match.player1Pnl;
//           const opponentId = isPlayer1 ? match.player2Id : match.player1Id;
//           let opponentName = 'Unknown';
          
//           // Find opponent
//           const opponent = Array.from(storage.users.values()).find(u => u.id === opponentId);
//           if (opponent) {
//             opponentName = opponent.username;
//           }
          
//           return {
//             id: match.id,
//             date: match.endTime || match.createdAt,
//             opponent: opponentName,
//             pnl: playerPnl,
//             result: playerPnl > opponentPnl ? 'win' : 'loss'
//           };
//         });
      
//       // Calculate stats
//       const wins = matchHistory.filter(m => m.result === 'win').length;
//       const winRate = matches.length > 0 ? (wins / matches.length) * 100 : 0;
      
//       res.json({
//         id: user.id,
//         username: user.username,
//         avatar: user.avatar,
//         bio: user.bio,
//         stats: {
//           totalMatches: matches.length,
//           wins,
//           losses: matches.length - wins,
//           winRate: Math.round(winRate),
//           totalPnl: leaderboardEntry?.totalPnl || 0,
//           arenaTokens: user.arenaTokens,
//           followers: followers.length,
//           following: following.length
//         },
//         matchHistory
//       });
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   // Matches API
//   app.post('/api/matches/queue', async (req: Request, res: Response) => {
//     try {
//       const { address } = walletAddressSchema.parse(req.body);
      
//       const user = await storage.getUserByWalletAddress(address);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
      
//       // Check for any active matches
//       const userMatches = await storage.getUserMatches(user.id);
//       const activeMatch = userMatches.find(m => m.status === 'active');
      
//       if (activeMatch) {
//         return res.status(400).json({ message: "You are already in an active match" });
//       }
      
//       // Create a pending match or join an existing one
//       const pendingMatches = Array.from((await storage.getActiveMatches()))
//         .filter(m => m.status === 'pending' && m.player1Id !== user.id);
      
//       if (pendingMatches.length > 0) {
//         // Join first pending match
//         const match = pendingMatches[0];
        
//         const updatedMatch = await storage.updateMatch(match.id, {
//           player2Id: user.id,
//           status: 'active',
//           startTime: new Date()
//         });
        
//         if (updatedMatch) {
//           // Create activity for match start
//           await storage.createActivity({
//             matchId: match.id,
//             userId: null,
//             type: 'match_started',
//             details: { 
//               player1: { id: match.player1Id }, 
//               player2: { id: user.id },
//               market: match.market
//             }
//           });
          
//           // Find opponent
//           const opponent = await storage.getUser(match.player1Id);
          
//           // Notify both players
//           const matchData = {
//             id: match.id,
//             player: {
//               username: user.username,
//               pnl: 0
//             },
//             opponent: {
//               username: opponent?.username || 'Unknown',
//               pnl: 0
//             },
//             market: match.market,
//             duration: match.duration,
//             startTime: updatedMatch.startTime?.getTime() || Date.now(),
//             spectators: []
//           };
          
//           // Notify player 2
//           broadcastToUser(user.id, {
//             type: 'match_found',
//             match: matchData
//           });
          
//           // Notify player 1 (swap player/opponent)
//           broadcastToUser(match.player1Id, {
//             type: 'match_found',
//             match: {
//               ...matchData,
//               player: matchData.opponent,
//               opponent: matchData.player
//             }
//           });
//         }
        
//         res.json({ status: 'matched', matchId: match.id });
//       } else {
//         // Create a new pending match
//         const market = chooseRandomMarket();
//         const match = await storage.createMatch({
//           matchCode: nanoid(8),
//           status: 'pending',
//           player1Id: user.id,
//           market,
//           duration: 1800, // 30 minutes
//           isGroupMatch: false
//         });
        
//         res.json({ status: 'waiting', matchId: match.id });
//       }
//     } catch (error) {
//       if (error instanceof z.ZodError) {
//         return res.status(400).json({ message: "Invalid data", errors: error.errors });
//       }
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   app.post('/api/matches/create', async (req: Request, res: Response) => {
//     try {
//       // Extract market and duration from request if available
//       const { address, market, duration } = req.body;
//       const validAddress = walletAddressSchema.parse({ address }).address;
//       console.log("Received address:", validAddress);  // <-- log input address
//       console.log("Received market:", market); 
//       console.log("Received duration:", duration);
      
//       const user = await storage.getUserByWalletAddress(validAddress);
//       console.log("Found user:", user);  // <-- log lookup result
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
      
//       // Generate invite code
//       const inviteCode = nanoid(8);
      
//       // Create match
//       const match = await storage.createMatch({
//         matchCode: inviteCode,
//         status: 'pending',
//         player1Id: user.id,
//         market: market || chooseRandomMarket(), // Use provided market or choose random
//         duration: duration ? parseInt(duration) : 1800, // Use provided duration or default to 30 minutes
//         isGroupMatch: false
//       });
      
//       res.json({ matchId: match.id, inviteCode });
//     } catch (error) {
//       if (error instanceof z.ZodError) {
//         return res.status(400).json({ message: "Invalid data", errors: error.errors });
//       }
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   app.get('/api/matches/live', async (req: Request, res: Response) => {
//     try {
//       const activeMatches = await storage.getActiveMatches();
      
//       const liveMatches = await Promise.all(
//         activeMatches.map(async match => {
//           const player1 = await storage.getUser(match.player1Id);
//           const player2 = await storage.getUser(match.player2Id || 0);
          
//           if (!player1 || !player2) return null;
          
//           const timeElapsed = match.startTime 
//             ? Math.floor((Date.now() - match.startTime.getTime()) / 1000)
//             : 0;
          
//           const timeRemaining = Math.max(0, match.duration - timeElapsed);
          
//           return {
//             id: match.id,
//             player1: {
//               username: player1.username,
//               pnl: match.player1Pnl,
//               isOnline: true // In a real app, you would check if user is online
//             },
//             player2: {
//               username: player2.username,
//               pnl: match.player2Pnl,
//               isOnline: true
//             },
//             timeRemaining,
//             market: match.market,
//             isGroupMatch: match.isGroupMatch
//           };
//         })
//       );
      
//       // Filter out null values and sort by most recent
//       const validMatches = liveMatches
//         .filter(Boolean)
//         .sort((a, b) => a!.timeRemaining - b!.timeRemaining);
      
//       res.json(validMatches);
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   app.post('/api/matches/:matchId/join', async (req: Request, res: Response) => {
//     try {
//       const { matchId } = req.params;
//       const { address } = walletAddressSchema.parse(req.body);
      
//       const user = await storage.getUserByWalletAddress(address);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
      
//       const match = await storage.getMatch(parseInt(matchId));
//       if (!match) {
//         return res.status(404).json({ message: "Match not found" });
//       }
      
//       if (match.status !== 'pending') {
//         return res.status(400).json({ message: "This match is no longer available" });
//       }
      
//       if (match.player1Id === user.id) {
//         return res.status(400).json({ message: "You cannot join your own match" });
//       }
      
//       // Update match status
//       const updatedMatch = await storage.updateMatch(match.id, {
//         player2Id: user.id,
//         status: 'active',
//         startTime: new Date()
//       });
      
//       if (updatedMatch) {
//         // Create activity for match start
//         await storage.createActivity({
//           matchId: match.id,
//           userId: null,
//           type: 'match_started',
//           details: { 
//             player1: { id: match.player1Id }, 
//             player2: { id: user.id },
//             market: match.market
//           }
//         });
        
//         // Find opponent
//         const opponent = await storage.getUser(match.player1Id);
        
//         // Notify both players
//         const matchData = {
//           id: match.id,
//           player: {
//             username: user.username,
//             pnl: 0
//           },
//           opponent: {
//             username: opponent?.username || 'Unknown',
//             pnl: 0
//           },
//           market: match.market,
//           duration: match.duration,
//           startTime: updatedMatch.startTime?.getTime() || Date.now(),
//           spectators: []
//         };
        
//         // Notify player 2
//         broadcastToUser(user.id, {
//           type: 'match_found',
//           match: matchData
//         });
        
//         // Notify player 1 (swap player/opponent)
//         broadcastToUser(match.player1Id, {
//           type: 'match_found',
//           match: {
//             ...matchData,
//             player: matchData.opponent,
//             opponent: matchData.player
//           }
//         });
//       }
      
//       res.json({ status: 'joined', matchId: match.id });
//     } catch (error) {
//       if (error instanceof z.ZodError) {
//         return res.status(400).json({ message: "Invalid data", errors: error.errors });
//       }
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   app.post('/api/matches/:matchId/spectate', async (req: Request, res: Response) => {
//     try {
//       const { matchId } = req.params;
//       const { address } = req.body;
      
//       const match = await storage.getMatch(parseInt(matchId));
//       if (!match) {
//         return res.status(404).json({ message: "Match not found" });
//       }
      
//       if (match.status !== 'active') {
//         return res.status(400).json({ message: "This match is not active" });
//       }
      
//       // Get user or use anonymous name
//       let username = 'Anonymous';
//       if (address && typeof address === 'string') {
//         const user = await storage.getUserByWalletAddress(address);
//         if (user) {
//           username = user.username;
//         }
//       }
      
//       // Add spectator
//       await storage.addSpectator(match.id, username);
      
//       // Notify match participants
//       broadcastToMatch(match.id, {
//         type: 'spectate_join',
//         matchId: match.id,
//         spectator: username
//       });
      
//       res.json({ status: 'spectating', matchId: match.id });
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   app.post('/api/matches/:matchId/forfeit', async (req: Request, res: Response) => {
//     try {
//       const { matchId } = req.params;
//       const { address } = walletAddressSchema.parse(req.body);
      
//       const user = await storage.getUserByWalletAddress(address);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
      
//       const match = await storage.getMatch(parseInt(matchId));
//       if (!match) {
//         return res.status(404).json({ message: "Match not found" });
//       }
      
//       if (match.status !== 'active') {
//         return res.status(400).json({ message: "This match is not active" });
//       }
      
//       if (match.player1Id !== user.id && match.player2Id !== user.id) {
//         return res.status(403).json({ message: "You are not a participant in this match" });
//       }
      
//       // Determine winner and loser
//       const isPlayer1 = match.player1Id === user.id;
//       const winnerId = isPlayer1 ? match.player2Id : match.player1Id;
//       const loserId = user.id;
      
//       // Update match status
//       const updatedMatch = await storage.updateMatch(match.id, {
//         status: 'completed',
//         endTime: new Date(),
//         winnerId
//       });
      
//       if (updatedMatch) {
//         // Update leaderboard entries
//         await storage.updateLeaderboardEntry(winnerId, {
//           wins: 1,
//           totalMatches: 1,
//           points: 25
//         });
        
//         await storage.updateLeaderboardEntry(loserId, {
//           losses: 1,
//           totalMatches: 1
//         });
        
//         // Create activity for match end
//         await storage.createActivity({
//           matchId: match.id,
//           userId: null,
//           type: 'match_ended',
//           details: { 
//             winner: { id: winnerId },
//             loser: { id: loserId },
//             forfeit: true
//           }
//         });
        
//         // Get players
//         const winner = await storage.getUser(winnerId);
//         const loser = await storage.getUser(loserId);
        
//         // Calculate rewards
//         const tokenReward = 250;
//         const xpReward = 75;
//         const pointsReward = 25;
        
//         // Update winner's tokens
//         if (winner) {
//           await storage.updateUser(winner.id, {
//             arenaTokens: (winner.arenaTokens || 0) + tokenReward,
//             xp: (winner.xp || 0) + xpReward
//           });
//         }
        
//         // Prepare match summary for both players
//         const baseMatchSummary = {
//           stats: {
//             ordersPlaced: 4, // Mock data
//             winRate: 75,
//             avgPositionSize: "0.018 BTC",
//             biggestWin: 8.2
//           },
//           rewards: {
//             tokens: tokenReward,
//             xp: xpReward,
//             leaderboardPoints: pointsReward,
//             achievement: "First Win" // Only for first win
//           }
//         };
        
//         // Notify winner
//         broadcastToUser(winnerId, {
//           type: 'match_ended',
//           summary: {
//             ...baseMatchSummary,
//             playerPnl: match.player1Id === winnerId ? match.player1Pnl : match.player2Pnl,
//             opponentPnl: match.player1Id === winnerId ? match.player2Pnl : match.player1Pnl,
//             opponentName: loser?.username || 'Unknown'
//           }
//         });
        
//         // Notify loser (forfeiter)
//         broadcastToUser(loserId, {
//           type: 'match_ended',
//           summary: {
//             ...baseMatchSummary,
//             playerPnl: match.player1Id === loserId ? match.player1Pnl : match.player2Pnl,
//             opponentPnl: match.player1Id === loserId ? match.player2Pnl : match.player1Pnl,
//             opponentName: winner?.username || 'Unknown',
//             rewards: {
//               tokens: 0,
//               xp: 10, // Smaller reward for participation
//               leaderboardPoints: 0
//             }
//           }
//         });
//       }
      
//       res.json({ status: 'forfeited', matchId: match.id });
//     } catch (error) {
//       if (error instanceof z.ZodError) {
//         return res.status(400).json({ message: "Invalid data", errors: error.errors });
//       }
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   app.post('/api/matches/rematch', async (req: Request, res: Response) => {
//     try {
//       const { address, opponent } = req.body;
      
//       if (!address || typeof address !== 'string') {
//         return res.status(400).json({ message: "Wallet address is required" });
//       }
      
//       if (!opponent || typeof opponent !== 'string') {
//         return res.status(400).json({ message: "Opponent username is required" });
//       }
      
//       const user = await storage.getUserByWalletAddress(address);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
      
//       const opponentUser = await storage.getUserByUsername(opponent);
//       if (!opponentUser) {
//         return res.status(404).json({ message: "Opponent not found" });
//       }
      
//       // Create a new match
//       const market = chooseRandomMarket();
//       const match = await storage.createMatch({
//         matchCode: nanoid(8),
//         status: 'pending',
//         player1Id: user.id,
//         market,
//         duration: 1800, // 30 minutes
//         isGroupMatch: false
//       });
      
//       // In a real app, you would send a notification to the opponent
//       // Here we'll simulate acceptance immediately
      
//       // Add opponent as player 2
//       const updatedMatch = await storage.updateMatch(match.id, {
//         player2Id: opponentUser.id,
//         status: 'active',
//         startTime: new Date()
//       });
      
//       if (updatedMatch) {
//         // Create activity for match start
//         await storage.createActivity({
//           matchId: match.id,
//           userId: null,
//           type: 'match_started',
//           details: { 
//             player1: { id: user.id }, 
//             player2: { id: opponentUser.id },
//             market: match.market,
//             isRematch: true
//           }
//         });
        
//         // Notify both players
//         const matchData = {
//           id: match.id,
//           player: {
//             username: user.username,
//             pnl: 0
//           },
//           opponent: {
//             username: opponentUser.username,
//             pnl: 0
//           },
//           market: match.market,
//           duration: match.duration,
//           startTime: updatedMatch.startTime?.getTime() || Date.now(),
//           spectators: []
//         };
        
//         // Notify player 1
//         broadcastToUser(user.id, {
//           type: 'match_found',
//           match: matchData
//         });
        
//         // Notify player 2 (swap player/opponent)
//         broadcastToUser(opponentUser.id, {
//           type: 'match_found',
//           match: {
//             ...matchData,
//             player: matchData.opponent,
//             opponent: matchData.player
//           }
//         });
//       }
      
//       res.json({ status: 'rematch_created', matchId: match.id });
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   app.get('/api/matches/:matchId/activity', async (req: Request, res: Response) => {
//     try {
//       const { matchId } = req.params;
      
//       const match = await storage.getMatch(parseInt(matchId));
//       if (!match) {
//         return res.status(404).json({ message: "Match not found" });
//       }
      
//       const activities = await storage.getMatchActivities(match.id);
      
//       // Format activities for the client
//       const formattedActivities = activities.map(activity => {
//         const user = activity.userId 
//           ? Array.from(storage.users.values()).find(u => u.id === activity.userId)?.username 
//           : '';
        
//         return {
//           id: activity.id,
//           type: activity.type,
//           user: user || '',
//           isCurrentUser: false, // This would be determined based on the client
//           details: typeof activity.details === 'string' 
//             ? activity.details 
//             : (activity.details && 'details' in activity.details)
//               ? activity.details.details
//               : '',
//           timestamp: activity.createdAt.getTime()
//         };
//       });
      
//       res.json(formattedActivities);
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   // Drift Protocol API Endpoints
//   app.post('/api/drift/order', async (req: Request, res: Response) => {
//     try {
//       const { address, market, direction, amount, leverage } = req.body;
      
//       if (!market || !direction || !amount || !leverage) {
//         return res.status(400).json({ message: "Missing required parameters" });
//       }
      
//       if (direction !== 'long' && direction !== 'short') {
//         return res.status(400).json({ message: "Direction must be 'long' or 'short'" });
//       }
      
//       // Find user if address is provided
//       let user = null;
//       if (address) {
//         user = await storage.getUserByWalletAddress(address);
//       }
      
//       // Mock entry price (in a real app, would get from Drift)
//       const entryPrice = getMockPrice(market);
      
//       // Calculate position size
//       const size = amount / entryPrice;
      
//       // Calculate liquidation price
//       const liquidationPrice = direction === 'long'
//         ? entryPrice * (1 - 1 / leverage) * 0.95 // 5% buffer
//         : entryPrice * (1 + 1 / leverage) * 1.05; // 5% buffer
      
//       const position = {
//         id: nanoid(),
//         market,
//         direction,
//         size,
//         leverage,
//         entryPrice,
//         liquidationPrice,
//         pnl: 0,
//         pnlUsd: 0
//       };
      
//       // Record trading activity if this is part of an active match
//       if (user) {
//         // Get active match if one exists
//         const userMatches = await storage.getUserMatches(user.id);
//         const activeMatch = userMatches.find(m => m.status === 'active');
        
//         if (activeMatch) {
//           // Create activity for opening a position
//           await storage.createActivity({
//             matchId: activeMatch.id,
//             userId: user.id,
//             type: 'open_position',
//             details: { 
//               market,
//               direction,
//               size,
//               leverage,
//               entryPrice
//             }
//           });
//         }
//       }
      
//       res.json(position);
//     } catch (error) {
//       console.error("Error placing order:", error);
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   app.post('/api/drift/close', async (req: Request, res: Response) => {
//     try {
//       const { address, positionId, market } = req.body;
      
//       if (!positionId) {
//         return res.status(400).json({ message: "Position ID is required" });
//       }
      
//       // Find user if address is provided
//       let user = null;
//       if (address) {
//         user = await storage.getUserByWalletAddress(address);
//       }
      
//       // Generate a random PnL value between -5% and +15% for demonstration
//       // In a real app, this would be calculated based on entry and exit prices
//       const pnlPercentage = (Math.random() * 20) - 5;
      
//       // Get market price for exit
//       const exitPrice = getMockPrice(market || 'SOL/USDT');
      
//       // Record trading activity if this is part of an active match
//       if (user) {
//         // Get active match if one exists
//         const userMatches = await storage.getUserMatches(user.id);
//         const activeMatch = userMatches.find(m => m.status === 'active');
        
//         if (activeMatch) {
//           // Create activity for closing a position
//           await storage.createActivity({
//             matchId: activeMatch.id,
//             userId: user.id,
//             type: 'close_position',
//             details: { 
//               positionId,
//               exitPrice,
//               pnl: pnlPercentage
//             }
//           });
          
//           // Update match PnL for the user
//           const isPlayer1 = activeMatch.player1Id === user.id;
          
//           if (isPlayer1) {
//             await storage.updateMatch(activeMatch.id, {
//               player1Pnl: (activeMatch.player1Pnl || 0) + pnlPercentage
//             });
//           } else {
//             await storage.updateMatch(activeMatch.id, {
//               player2Pnl: (activeMatch.player2Pnl || 0) + pnlPercentage
//             });
//           }
//         }
//       }
      
//       res.json({ 
//         success: true, 
//         positionId,
//         pnl: pnlPercentage,
//         exitPrice
//       });
//     } catch (error) {
//       console.error("Error closing position:", error);
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   app.get('/api/drift/price', async (req: Request, res: Response) => {
//     try {
//       const { market } = req.query;
      
//       if (!market || typeof market !== 'string') {
//         return res.status(400).json({ message: "Market parameter is required" });
//       }
      
//       const price = getMockPrice(market);
      
//       res.json({ market, price });
//     } catch (error) {
//       console.error("Error getting price:", error);
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   // Get user positions
//   app.get('/api/drift/positions', async (req: Request, res: Response) => {
//     try {
//       const { address } = req.query;
      
//       if (!address || typeof address !== 'string') {
//         return res.status(400).json({ message: "Address parameter is required" });
//       }
      
//       const user = await storage.getUserByWalletAddress(address);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
      
//       // For the demo, we'll return 0-2 mock positions
//       const positions = [];
//       const positionCount = Math.floor(Math.random() * 3); // 0, 1, or 2 positions
      
//       for (let i = 0; i < positionCount; i++) {
//         // Generate random position data
//         const market = ['SOL/USDT', 'SOL/USDC', 'BTC/USDC', 'ETH/USDC'][Math.floor(Math.random() * 4)];
//         const direction = Math.random() > 0.5 ? 'long' : 'short';
//         const leverage = Math.floor(Math.random() * 10) + 1; // 1-10x leverage
//         const entryPrice = getMockPrice(market);
//         const size = (1000 * (Math.random() + 0.1)) / entryPrice; // Random size based on ~$1000 value
//         const pnl = (Math.random() * 40) - 20; // -20% to +20% PnL
//         const pnlUsd = (entryPrice * size) * (pnl / 100);
        
//         // Generate liquidation price based on direction and leverage
//         const liquidationPrice = direction === 'long'
//           ? entryPrice * (1 - 1 / leverage) * 0.95 // 5% buffer
//           : entryPrice * (1 + 1 / leverage) * 1.05; // 5% buffer
          
//         positions.push({
//           id: nanoid(),
//           market,
//           direction,
//           size,
//           leverage,
//           entryPrice,
//           liquidationPrice,
//           pnl,
//           pnlUsd
//         });
//       }
      
//       res.json(positions);
//     } catch (error) {
//       console.error("Error getting positions:", error);
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   // Market history endpoint for chart data
//   app.get('/api/drift/history', async (req: Request, res: Response) => {
//     try {
//       const { market, interval } = req.query;
      
//       if (!market || typeof market !== 'string') {
//         return res.status(400).json({ message: "Market parameter is required" });
//       }
      
//       // Generate mock historical price data
//       // In a real app, this would come from a data provider or exchange API
//       const basePrice = getMockPrice(market);
//       const history = [];
      
//       // Generate 100 data points
//       const now = Date.now();
//       let timeStep;
      
//       switch (interval) {
//         case '1m': timeStep = 60 * 1000; break;
//         case '5m': timeStep = 5 * 60 * 1000; break;
//         case '15m': timeStep = 15 * 60 * 1000; break;
//         case '1h': timeStep = 60 * 60 * 1000; break;
//         case '4h': timeStep = 4 * 60 * 60 * 1000; break;
//         case '1d': timeStep = 24 * 60 * 60 * 1000; break;
//         default: timeStep = 60 * 60 * 1000; // Default to 1h
//       }
      
//       for (let i = 99; i >= 0; i--) {
//         const timestamp = now - (i * timeStep);
//         const volatility = 0.005; // 0.5% volatility
        
//         // Random walk price generation
//         const changePercent = (Math.random() * 2 - 1) * volatility;
//         const priceOffset = basePrice * changePercent * (100 - i) / 25;
//         const price = basePrice + priceOffset;
        
//         // Generate OHLC data
//         const open = price * (1 + (Math.random() * 0.004 - 0.002));
//         const high = Math.max(open, price) * (1 + Math.random() * 0.003);
//         const low = Math.min(open, price) * (1 - Math.random() * 0.003);
//         const close = price;
//         const volume = Math.random() * 10000 + 5000;
        
//         history.push({
//           timestamp,
//           open,
//           high,
//           low,
//           close,
//           volume
//         });
//       }
      
//       res.json({ market, interval, history });
//     } catch (error) {
//       console.error("Error getting market history:", error);
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   // Leaderboard API
//   app.get('/api/leaderboard', async (req: Request, res: Response) => {
//     try {
//       const leaderboardEntries = await storage.getLeaderboard();
      
//       // Format leaderboard entries
//       const formattedEntries = await Promise.all(
//         leaderboardEntries.map(async entry => {
//           const user = await storage.getUser(entry.userId);
          
//           return {
//             id: entry.userId,
//             username: user?.username || 'Unknown',
//             rank: entry.rank,
//             winRate: user && entry.totalMatches > 0 
//               ? Math.round((entry.wins / entry.totalMatches) * 100) 
//               : 0,
//             totalPnl: entry.totalPnl,
//             arenaTokens: user?.arenaTokens || 0
//           };
//         })
//       );
      
//       // Sort by rank
//       formattedEntries.sort((a, b) => a.rank - b.rank);
      
//       res.json(formattedEntries);
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   // Reels API
//   app.get('/api/reels', async (req: Request, res: Response) => {
//     try {
//       const reels = await storage.getReels();
      
//       // Format reels data
//       const formattedReels = await Promise.all(
//         reels.map(async reel => {
//           const user = await storage.getUser(reel.userId);
          
//           // Get match data if attached to a match
//           let matchData = undefined;
//           if (reel.matchId) {
//             const match = await storage.getMatch(reel.matchId);
//             if (match) {
//               const isPlayer1 = match.player1Id === reel.userId;
//               const playerPnl = isPlayer1 ? match.player1Pnl : match.player2Pnl;
//               const opponentPnl = isPlayer1 ? match.player2Pnl : match.player1Pnl;
//               const result = playerPnl > opponentPnl ? 'win' : 'loss';
              
//               matchData = {
//                 finalPnl: playerPnl,
//                 opponent: isPlayer1 
//                   ? (await storage.getUser(match.player2Id || 0))?.username || 'Unknown'
//                   : (await storage.getUser(match.player1Id))?.username || 'Unknown',
//                 result
//               };
//             }
//           }
          
//           return {
//             id: reel.id,
//             author: {
//               id: reel.userId,
//               username: user?.username || 'Unknown',
//               avatar: user?.avatar
//             },
//             caption: reel.caption || '',
//             likes: reel.likes,
//             comments: 0, // Would need a comments table in a real app
//             videoUrl: reel.videoUrl,
//             createdAt: reel.createdAt.toISOString(),
//             matchData
//           };
//         })
//       );
      
//       res.json(formattedReels);
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   app.post('/api/reels', async (req: Request, res: Response) => {
//     try {
//       const { address, videoUrl, caption, matchId } = req.body;
      
//       if (!address || typeof address !== 'string') {
//         return res.status(400).json({ message: "Wallet address is required" });
//       }
      
//       if (!videoUrl || typeof videoUrl !== 'string') {
//         return res.status(400).json({ message: "Video URL is required" });
//       }
      
//       const user = await storage.getUserByWalletAddress(address);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
      
//       // Validate match if provided
//       if (matchId) {
//         const match = await storage.getMatch(parseInt(matchId));
//         if (!match) {
//           return res.status(404).json({ message: "Match not found" });
//         }
        
//         if (match.player1Id !== user.id && match.player2Id !== user.id) {
//           return res.status(403).json({ message: "You were not a participant in this match" });
//         }
//       }
      
//       // Create reel
//       const reel = await storage.createReel({
//         userId: user.id,
//         matchId: matchId ? parseInt(matchId) : undefined,
//         videoUrl,
//         caption: caption || ''
//       });
      
//       res.json({
//         id: reel.id,
//         videoUrl: reel.videoUrl,
//         caption: reel.caption,
//         createdAt: reel.createdAt.toISOString()
//       });
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   // Get reel by ID
//   app.get('/api/reels/:reelId', async (req: Request, res: Response) => {
//     try {
//       const { reelId } = req.params;
      
//       if (!reelId || isNaN(parseInt(reelId))) {
//         return res.status(400).json({ message: "Invalid reel ID" });
//       }
      
//       const reels = await storage.getReels();
//       const reel = reels.find(r => r.id === parseInt(reelId));
      
//       if (!reel) {
//         return res.status(404).json({ message: "Reel not found" });
//       }
      
//       const user = await storage.getUser(reel.userId);
      
//       // Get match data if attached to a match
//       let matchData = undefined;
//       if (reel.matchId) {
//         const match = await storage.getMatch(reel.matchId);
//         if (match) {
//           const isPlayer1 = match.player1Id === reel.userId;
//           const playerPnl = isPlayer1 ? match.player1Pnl : match.player2Pnl;
//           const opponentPnl = isPlayer1 ? match.player2Pnl : match.player1Pnl;
//           const result = playerPnl > opponentPnl ? 'win' : 'loss';
          
//           matchData = {
//             finalPnl: playerPnl,
//             opponent: isPlayer1 
//               ? (await storage.getUser(match.player2Id || 0))?.username || 'Unknown'
//               : (await storage.getUser(match.player1Id))?.username || 'Unknown',
//             result
//           };
//         }
//       }
      
//       const formattedReel = {
//         id: reel.id,
//         author: {
//           id: reel.userId,
//           username: user?.username || 'Unknown',
//           avatar: user?.avatar
//         },
//         caption: reel.caption || '',
//         likes: reel.likes,
//         comments: 0,
//         videoUrl: reel.videoUrl,
//         createdAt: reel.createdAt?.toISOString() || new Date().toISOString(),
//         matchData
//       };
      
//       res.json(formattedReel);
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   // Update a reel
//   app.put('/api/reels/:reelId', async (req: Request, res: Response) => {
//     try {
//       const { reelId } = req.params;
//       const { address, caption } = req.body;
      
//       if (!address || typeof address !== 'string') {
//         return res.status(400).json({ message: "Wallet address is required" });
//       }
      
//       if (!reelId || isNaN(parseInt(reelId))) {
//         return res.status(400).json({ message: "Invalid reel ID" });
//       }
      
//       const user = await storage.getUserByWalletAddress(address);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
      
//       const reels = await storage.getReels();
//       const reelIndex = reels.findIndex(r => r.id === parseInt(reelId));
      
//       if (reelIndex === -1) {
//         return res.status(404).json({ message: "Reel not found" });
//       }
      
//       const reel = reels[reelIndex];
      
//       // Check if user owns the reel
//       if (reel.userId !== user.id) {
//         return res.status(403).json({ message: "You can only update your own reels" });
//       }
      
//       // Update reel
//       reels[reelIndex] = {
//         ...reel,
//         caption: caption || reel.caption
//       };
      
//       res.json({
//         id: reels[reelIndex].id,
//         caption: reels[reelIndex].caption
//       });
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   // Delete a reel
//   app.delete('/api/reels/:reelId', async (req: Request, res: Response) => {
//     try {
//       const { reelId } = req.params;
//       const { address } = req.body;
      
//       if (!address || typeof address !== 'string') {
//         return res.status(400).json({ message: "Wallet address is required" });
//       }
      
//       if (!reelId || isNaN(parseInt(reelId))) {
//         return res.status(400).json({ message: "Invalid reel ID" });
//       }
      
//       const user = await storage.getUserByWalletAddress(address);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
      
//       const reels = await storage.getReels();
//       const reelIndex = reels.findIndex(r => r.id === parseInt(reelId));
      
//       if (reelIndex === -1) {
//         return res.status(404).json({ message: "Reel not found" });
//       }
      
//       const reel = reels[reelIndex];
      
//       // Check if user owns the reel
//       if (reel.userId !== user.id) {
//         return res.status(403).json({ message: "You can only delete your own reels" });
//       }
      
//       // Delete reel
//       reels.splice(reelIndex, 1);
      
//       res.json({ message: "Reel deleted successfully" });
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   // Like a reel
//   app.post('/api/reels/:reelId/like', async (req: Request, res: Response) => {
//     try {
//       const { reelId } = req.params;
//       const { address } = req.body;
      
//       if (!address || typeof address !== 'string') {
//         return res.status(400).json({ message: "Wallet address is required" });
//       }
      
//       if (!reelId || isNaN(parseInt(reelId))) {
//         return res.status(400).json({ message: "Invalid reel ID" });
//       }
      
//       const user = await storage.getUserByWalletAddress(address);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
      
//       // Find and like the reel
//       await storage.likeReel(parseInt(reelId));
      
//       res.json({ message: "Reel liked successfully" });
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   // Admin API endpoints
//   // Middleware to check if user is admin
//   const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       if (!req.session?.userId) {
//         return res.status(401).json({ error: 'Unauthorized' });
//       }
      
//       const user = await storage.getUser(req.session.userId);
//       if (!user || user.role !== 'admin') {
//         return res.status(403).json({ error: 'Forbidden - Admin access required' });
//       }
      
//       next();
//     } catch (error) {
//       console.error('Error in admin authorization:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   };
  
//   // Feature flag management endpoints
//   app.get('/api/admin/feature-flags', isAdmin, async (req: Request, res: Response) => {
//     try {
//       const featureFlags = await storage.getFeatureFlags();
//       res.json(featureFlags);
//     } catch (error) {
//       console.error('Error fetching feature flags:', error);
//       res.status(500).json({ error: 'Failed to fetch feature flags' });
//     }
//   });
  
//   app.post('/api/admin/feature-flags', isAdmin, async (req: Request, res: Response) => {
//     try {
//       const validation = insertFeatureFlagSchema.safeParse(req.body);
//       if (!validation.success) {
//         return res.status(400).json({ error: validation.error.errors });
//       }
      
//       const featureFlag = await storage.createFeatureFlag(validation.data);
//       res.status(201).json(featureFlag);
//     } catch (error) {
//       console.error('Error creating feature flag:', error);
//       res.status(500).json({ error: 'Failed to create feature flag' });
//     }
//   });
  
//   app.put('/api/admin/feature-flags/:id', isAdmin, async (req: Request, res: Response) => {
//     try {
//       const id = parseInt(req.params.id);
//       const featureFlag = await storage.getFeatureFlag(id);
      
//       if (!featureFlag) {
//         return res.status(404).json({ error: 'Feature flag not found' });
//       }
      
//       const updatedFeatureFlag = await storage.updateFeatureFlag(id, req.body);
//       res.json(updatedFeatureFlag);
//     } catch (error) {
//       console.error('Error updating feature flag:', error);
//       res.status(500).json({ error: 'Failed to update feature flag' });
//     }
//   });
  
//   app.delete('/api/admin/feature-flags/:id', isAdmin, async (req: Request, res: Response) => {
//     try {
//       const id = parseInt(req.params.id);
//       const featureFlag = await storage.getFeatureFlag(id);
      
//       if (!featureFlag) {
//         return res.status(404).json({ error: 'Feature flag not found' });
//       }
      
//       await storage.deleteFeatureFlag(id);
//       res.status(204).send();
//     } catch (error) {
//       console.error('Error deleting feature flag:', error);
//       res.status(500).json({ error: 'Failed to delete feature flag' });
//     }
//   });
  
//   // User management endpoints
//   app.get('/api/admin/users', isAdmin, async (req: Request, res: Response) => {
//     try {
//       const users = await storage.getAllUsers();
//       res.json(users);
//     } catch (error) {
//       console.error('Error fetching users:', error);
//       res.status(500).json({ error: 'Failed to fetch users' });
//     }
//   });
  
//   app.put('/api/admin/users/:id', isAdmin, async (req: Request, res: Response) => {
//     try {
//       const id = parseInt(req.params.id);
//       const user = await storage.getUser(id);
      
//       if (!user) {
//         return res.status(404).json({ error: 'User not found' });
//       }
      
//       // Validate that the role is valid if it's being updated
//       if (req.body.role && !['admin', 'moderator', 'user'].includes(req.body.role)) {
//         return res.status(400).json({ error: 'Invalid role. Must be admin, moderator, or user' });
//       }
      
//       const updatedUser = await storage.updateUser(id, req.body);
//       res.json(updatedUser);
//     } catch (error) {
//       console.error('Error updating user:', error);
//       res.status(500).json({ error: 'Failed to update user' });
//     }
//   });
  
//   // Match management endpoints
//   app.get('/api/admin/matches', isAdmin, async (req: Request, res: Response) => {
//     try {
//       const matches = await storage.getActiveMatches();
//       res.json(matches);
//     } catch (error) {
//       console.error('Error fetching matches:', error);
//       res.status(500).json({ error: 'Failed to fetch matches' });
//     }
//   });
  
//   app.put('/api/admin/matches/:id/end', isAdmin, async (req: Request, res: Response) => {
//     try {
//       const id = parseInt(req.params.id);
//       const match = await storage.getMatch(id);
      
//       if (!match) {
//         return res.status(404).json({ error: 'Match not found' });
//       }
      
//       if (match.status !== 'active') {
//         return res.status(400).json({ error: 'Match is not active' });
//       }
      
//       const playerPnl = match.player1Pnl || 0;
//       const opponentPnl = match.player2Pnl || 0;
      
//       // Determine winner
//       let winnerId = null;
//       if (playerPnl > opponentPnl) {
//         winnerId = match.player1Id;
//       } else if (opponentPnl > playerPnl) {
//         winnerId = match.player2Id;
//       }
      
//       const updatedMatch = await storage.updateMatch(id, {
//         status: 'completed',
//         endTime: new Date(),
//         winnerId
//       });
      
//       res.json(updatedMatch);
//     } catch (error) {
//       console.error('Error ending match:', error);
//       res.status(500).json({ error: 'Failed to end match' });
//     }
//   });
  
//   // System metrics endpoints
//   app.get('/api/admin/system/metrics', isAdmin, async (req: Request, res: Response) => {
//     try {
//       const summary = await storage.getSystemMetricsSummary();
//       res.json(summary);
//     } catch (error) {
//       console.error('Error fetching system metrics:', error);
//       res.status(500).json({ error: 'Failed to fetch system metrics' });
//     }
//   });
  
//   app.get('/api/admin/system/metrics/history', isAdmin, async (req: Request, res: Response) => {
//     try {
//       const metrics = await storage.getSystemMetrics();
//       res.json(metrics);
//     } catch (error) {
//       console.error('Error fetching system metrics history:', error);
//       res.status(500).json({ error: 'Failed to fetch system metrics history' });
//     }
//   });
  
//   app.post('/api/admin/system/metrics', isAdmin, async (req: Request, res: Response) => {
//     try {
//       const validation = insertSystemMetricSchema.safeParse(req.body);
//       if (!validation.success) {
//         return res.status(400).json({ error: validation.error.errors });
//       }
      
//       const metric = await storage.createSystemMetric(validation.data);
//       res.status(201).json(metric);
//     } catch (error) {
//       console.error('Error creating system metric:', error);
//       res.status(500).json({ error: 'Failed to create system metric' });
//     }
//   });
  
//   return httpServer;
// }

// // Helper functions
// function chooseRandomMarket(): string {
//   const markets = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'ADA/USDT'];
//   return markets[Math.floor(Math.random() * markets.length)];
// }

// function getMockPrice(market: string): number {
//   const basePrices: Record<string, number> = {
//     'BTC/USDT': 26850,
//     'ETH/USDT': 1650,
//     'SOL/USDT': 75,
//     'BNB/USDT': 220,
//     'ADA/USDT': 0.38
//   };
  
//   // Random variation
//   const basePrice = basePrices[market] || 100;
//   const variation = (Math.random() - 0.5) * 0.02; // +/- 1% variation
  
//   return basePrice * (1 + variation);
// }

// import express, { type Express, Request, Response, NextFunction } from "express";
// import { createServer, type Server } from "http";
// import { WebSocketServer, WebSocket } from 'ws';
// import { storage } from "./storage";
// import { 
//   insertUserSchema, 
//   insertMatchSchema, 
//   insertPositionSchema,
//   insertActivitySchema,
//   insertReelSchema,
//   insertFollowSchema,
//   insertFeatureFlagSchema,
//   insertSystemMetricSchema
// } from "@shared/schema";
// import { z } from "zod";
// import { nanoid } from "nanoid";

// // Validator for wallet address
// const walletAddressSchema = z.object({
//   address: z.string().min(1, "Wallet address is required")
// });

// // Connected WebSocket clients
// const clients = new Map<string, { ws: WebSocket, userId?: number }>();

// export async function registerRoutes(app: Express): Promise<Server> {
//   const httpServer = createServer(app);
  
//   // Setup WebSocket server
//   const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
//   wss.on('connection', (ws) => {
//     const clientId = nanoid();
//     clients.set(clientId, { ws });
    
//     ws.on('message', async (message) => {
//       try {
//         const data = JSON.parse(message.toString());
        
//         // Handle different message types
//         if (data.type === 'auth' && data.address) {
//           const user = await storage.getUserByWalletAddress(data.address);
//           if (user) {
//             clients.set(clientId, { ws, userId: user.id });
//           }
//         }
//       } catch (e) {
//         console.error('Error processing WebSocket message:', e);
//       }
//     });
    
//     ws.on('close', () => {
//       clients.delete(clientId);
//     });
//   });
  
//   // Broadcast to all or specific clients
//   const broadcast = (data: any, filter?: (client: { ws: WebSocket, userId?: number }) => boolean) => {
//     const message = JSON.stringify(data);
//     clients.forEach((client, id) => {
//       if (client.ws.readyState === WebSocket.OPEN && (!filter || filter(client))) {
//         client.ws.send(message);
//       }
//     });
//   };
  
//   // Broadcast to a specific user
//   const broadcastToUser = (userId: number, data: any) => {
//     broadcast(data, client => client.userId === userId);
//   };
  
//   // Broadcast to match participants and spectators
//   const broadcastToMatch = async (matchId: number, data: any) => {
//     const match = await storage.getMatch(matchId);
//     if (!match) return;
    
//     broadcast(data, client => 
//       client.userId === match.player1Id || 
//       client.userId === match.player2Id ||
//       (match.spectators || []).some(spectator => {
//         // Match username or ID based on what's stored in spectators array
//         if (typeof spectator === 'string' && client.userId) {
//           const user = Array.from(storage.users.values()).find(u => u.id === client.userId);
//           return user && user.username === spectator;
//         }
//         return false;
//       })
//     );
//   };
  
//   // Authentication API
//   app.post('/api/auth/register', async (req: Request, res: Response) => {
//     try {
//       const data = insertUserSchema.parse(req.body);
      
//       // Check if username already exists
//       const existingUser = await storage.getUserByUsername(data.username);
//       if (existingUser) {
//         return res.status(400).json({ message: "Username already taken" });
//       }
      
//       // Check if wallet already exists
//       if (data.walletAddress) {
//         const existingWallet = await storage.getUserByWalletAddress(data.walletAddress);
//         if (existingWallet) {
//           return res.status(400).json({ message: "Wallet address already registered" });
//         }
//       }
      
//       const user = await storage.createUser(data);
//       res.status(201).json({ 
//         id: user.id, 
//         username: user.username,
//         walletAddress: user.walletAddress 
//       });
//     } catch (error) {
//       if (error instanceof z.ZodError) {
//         return res.status(400).json({ message: "Invalid data", errors: error.errors });
//       }
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   app.post('/api/auth/login', async (req: Request, res: Response) => {
//     try {
//       const { username, password } = req.body;
      
//       const user = await storage.getUserByUsername(username);
//       if (!user || user.password !== password) {
//         return res.status(401).json({ message: "Invalid credentials" });
//       }
      
//       res.json({
//         id: user.id,
//         username: user.username,
//         walletAddress: user.walletAddress
//       });
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   app.post('/api/auth/wallet', async (req: Request, res: Response) => {
//     try {
//       const { address } = walletAddressSchema.parse(req.body);
      
//       let user = await storage.getUserByWalletAddress(address);
      
//       // If user doesn't exist, create one
//       if (!user) {
//         const username = `User${Math.floor(Math.random() * 10000)}`;
//         user = await storage.createUser({
//           username,
//           password: nanoid(),
//           walletAddress: address
//         });
//       }
      
//       res.json({
//         id: user.id,
//         username: user.username,
//         walletAddress: user.walletAddress
//       });
//     } catch (error) {
//       if (error instanceof z.ZodError) {
//         return res.status(400).json({ message: "Invalid data", errors: error.errors });
//       }
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   // User profile API
//   app.get('/api/profile', async (req: Request, res: Response) => {
//     try {
//       const { address } = req.query;
      
//       if (!address || typeof address !== 'string') {
//         return res.status(400).json({ message: "Wallet address is required" });
//       }
      
//       const user = await storage.getUserByWalletAddress(address);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
      
//       // Get user matches
//       const matches = await storage.getUserMatches(user.id);
      
//       // Get follow counts
//       const followers = await storage.getFollowers(user.id);
//       const following = await storage.getFollowing(user.id);
      
//       // Get leaderboard entry
//       const leaderboardEntries = await storage.getLeaderboard();
//       const leaderboardEntry = leaderboardEntries.find(entry => entry.userId === user.id);
      
//       // Format match history
//       const matchHistory = matches
//         .filter(match => match.status === 'completed')
//         .slice(0, 10)
//         .map(match => {
//           const isPlayer1 = match.player1Id === user.id;
//           const playerPnl = isPlayer1 ? match.player1Pnl : match.player2Pnl;
//           const opponentPnl = isPlayer1 ? match.player2Pnl : match.player1Pnl;
//           const opponentId = isPlayer1 ? match.player2Id : match.player1Id;
//           let opponentName = 'Unknown';
          
//           // Find opponent
//           const opponent = Array.from(storage.users.values()).find(u => u.id === opponentId);
//           if (opponent) {
//             opponentName = opponent.username;
//           }
          
//           return {
//             id: match.id,
//             date: match.endTime || match.createdAt,
//             opponent: opponentName,
//             pnl: playerPnl,
//             result: playerPnl > opponentPnl ? 'win' : 'loss'
//           };
//         });
      
//       // Calculate stats
//       const wins = matchHistory.filter(m => m.result === 'win').length;
//       const winRate = matches.length > 0 ? (wins / matches.length) * 100 : 0;
      
//       res.json({
//         id: user.id,
//         username: user.username,
//         avatar: user.avatar,
//         bio: user.bio,
//         stats: {
//           totalMatches: matches.length,
//           wins,
//           losses: matches.length - wins,
//           winRate: Math.round(winRate),
//           totalPnl: leaderboardEntry?.totalPnl || 0,
//           arenaTokens: user.arenaTokens,
//           followers: followers.length,
//           following: following.length
//         },
//         matchHistory
//       });
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   // Matches API
//   app.post('/api/matches/queue', async (req: Request, res: Response) => {
//     try {
//       const { address } = walletAddressSchema.parse(req.body);
      
//       const user = await storage.getUserByWalletAddress(address);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
      
//       // Check for any active matches
//       const userMatches = await storage.getUserMatches(user.id);
//       const activeMatch = userMatches.find(m => m.status === 'active');
      
//       if (activeMatch) {
//         return res.status(400).json({ message: "You are already in an active match" });
//       }
      
//       // Create a pending match or join an existing one
//       const pendingMatches = Array.from((await storage.getActiveMatches()))
//         .filter(m => m.status === 'pending' && m.player1Id !== user.id);
      
//       if (pendingMatches.length > 0) {
//         // Join first pending match
//         const match = pendingMatches[0];
        
//         const updatedMatch = await storage.updateMatch(match.id, {
//           player2Id: user.id,
//           status: 'active',
//           startTime: new Date()
//         });
        
//         if (updatedMatch) {
//           // Create activity for match start
//           await storage.createActivity({
//             matchId: match.id,
//             userId: null,
//             type: 'match_started',
//             details: { 
//               player1: { id: match.player1Id }, 
//               player2: { id: user.id },
//               market: match.market
//             }
//           });
          
//           // Find opponent
//           const opponent = await storage.getUser(match.player1Id);
          
//           // Notify both players
//           const matchData = {
//             id: match.id,
//             player: {
//               username: user.username,
//               pnl: 0
//             },
//             opponent: {
//               username: opponent?.username || 'Unknown',
//               pnl: 0
//             },
//             market: match.market,
//             duration: match.duration,
//             startTime: updatedMatch.startTime?.getTime() || Date.now(),
//             spectators: []
//           };
          
//           // Notify player 2
//           broadcastToUser(user.id, {
//             type: 'match_found',
//             match: matchData
//           });
          
//           // Notify player 1 (swap player/opponent)
//           broadcastToUser(match.player1Id, {
//             type: 'match_found',
//             match: {
//               ...matchData,
//               player: matchData.opponent,
//               opponent: matchData.player
//             }
//           });
//         }
        
//         res.json({ status: 'matched', matchId: match.id });
//       } else {
//         // Create a new pending match
//         const market = chooseRandomMarket();
//         const match = await storage.createMatch({
//           matchCode: nanoid(8),
//           status: 'pending',
//           player1Id: user.id,
//           market,
//           duration: 1800, // 30 minutes
//           isGroupMatch: false
//         });
        
//         res.json({ status: 'waiting', matchId: match.id });
//       }
//     } catch (error) {
//       if (error instanceof z.ZodError) {
//         return res.status(400).json({ message: "Invalid data", errors: error.errors });
//       }
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   app.post('/api/matches/create', async (req: Request, res: Response) => {
//     try {
//       // Extract market and duration from request if available
//       const { address, market, duration } = req.body;
//       const validAddress = walletAddressSchema.parse({ address }).address;
//       console.log("Received address:", validAddress);  // <-- log input address
//       console.log("Received market:", market); 
//       console.log("Received duration:", duration);
      
//       const user = await storage.getUserByWalletAddress(validAddress);
//       console.log("Found user:", user);  // <-- log lookup result
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
      
//       // Generate invite code
//       const inviteCode = nanoid(8);
      
//       // Create match
//       const match = await storage.createMatch({
//         matchCode: inviteCode,
//         status: 'pending',
//         player1Id: user.id,
//         market: market || chooseRandomMarket(), // Use provided market or choose random
//         duration: duration ? parseInt(duration) : 1800, // Use provided duration or default to 30 minutes
//         isGroupMatch: false
//       });
      
//       res.json({ matchId: match.id, inviteCode });
//     } catch (error) {
//       if (error instanceof z.ZodError) {
//         return res.status(400).json({ message: "Invalid data", errors: error.errors });
//       }
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   // Lookup match by invite code
//   app.get('/api/matches/code/:inviteCode', async (req: Request, res: Response) => {
//     try {
//       const { inviteCode } = req.params;
      
//       if (!inviteCode) {
//         return res.status(400).json({ message: "Invite code is required" });
//       }
      
//       // Find match with this invite code
//       const match = await storage.getMatchByCode(inviteCode);
      
//       if (!match) {
//         return res.status(404).json({ message: "Match not found with this invite code" });
//       }
      
//       return res.json({ matchId: match.id, status: match.status });
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   app.get('/api/matches/live', async (req: Request, res: Response) => {
//     try {
//       const activeMatches = await storage.getActiveMatches();
      
//       const liveMatches = await Promise.all(
//         activeMatches.map(async match => {
//           const player1 = await storage.getUser(match.player1Id);
//           const player2 = await storage.getUser(match.player2Id || 0);
          
//           if (!player1 || !player2) return null;
          
//           const timeElapsed = match.startTime 
//             ? Math.floor((Date.now() - match.startTime.getTime()) / 1000)
//             : 0;
          
//           const timeRemaining = Math.max(0, match.duration - timeElapsed);
          
//           return {
//             id: match.id,
//             player1: {
//               username: player1.username,
//               pnl: match.player1Pnl,
//               isOnline: true // In a real app, you would check if user is online
//             },
//             player2: {
//               username: player2.username,
//               pnl: match.player2Pnl,
//               isOnline: true
//             },
//             timeRemaining,
//             market: match.market,
//             isGroupMatch: match.isGroupMatch
//           };
//         })
//       );
      
//       // Filter out null values and sort by most recent
//       const validMatches = liveMatches
//         .filter(Boolean)
//         .sort((a, b) => a!.timeRemaining - b!.timeRemaining);
      
//       res.json(validMatches);
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   app.post('/api/matches/:matchId/join', async (req: Request, res: Response) => {
//     try {
//       const { matchId } = req.params;
//       const { address } = walletAddressSchema.parse(req.body);
      
//       const user = await storage.getUserByWalletAddress(address);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
      
//       const match = await storage.getMatch(parseInt(matchId));
//       if (!match) {
//         return res.status(404).json({ message: "Match not found" });
//       }
      
//       if (match.status !== 'pending') {
//         return res.status(400).json({ message: "This match is no longer available" });
//       }
      
//       if (match.player1Id === user.id) {
//         return res.status(400).json({ message: "You cannot join your own match" });
//       }
      
//       // Update match status
//       const updatedMatch = await storage.updateMatch(match.id, {
//         player2Id: user.id,
//         status: 'active',
//         startTime: new Date()
//       });
      
//       if (updatedMatch) {
//         // Create activity for match start
//         await storage.createActivity({
//           matchId: match.id,
//           userId: null,
//           type: 'match_started',
//           details: { 
//             player1: { id: match.player1Id }, 
//             player2: { id: user.id },
//             market: match.market
//           }
//         });
        
//         // Find opponent
//         const opponent = await storage.getUser(match.player1Id);
        
//         // Notify both players
//         const matchData = {
//           id: match.id,
//           player: {
//             username: user.username,
//             pnl: 0
//           },
//           opponent: {
//             username: opponent?.username || 'Unknown',
//             pnl: 0
//           },
//           market: match.market,
//           duration: match.duration,
//           startTime: updatedMatch.startTime?.getTime() || Date.now(),
//           spectators: []
//         };
        
//         // Notify player 2
//         broadcastToUser(user.id, {
//           type: 'match_found',
//           match: matchData
//         });
        
//         // Notify player 1 (swap player/opponent)
//         broadcastToUser(match.player1Id, {
//           type: 'match_found',
//           match: {
//             ...matchData,
//             player: matchData.opponent,
//             opponent: matchData.player
//           }
//         });
//       }
      
//       res.json({ status: 'joined', matchId: match.id });
//     } catch (error) {
//       if (error instanceof z.ZodError) {
//         return res.status(400).json({ message: "Invalid data", errors: error.errors });
//       }
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   app.post('/api/matches/:matchId/spectate', async (req: Request, res: Response) => {
//     try {
//       const { matchId } = req.params;
//       const { address } = req.body;
      
//       const match = await storage.getMatch(parseInt(matchId));
//       if (!match) {
//         return res.status(404).json({ message: "Match not found" });
//       }
      
//       if (match.status !== 'active') {
//         return res.status(400).json({ message: "This match is not active" });
//       }
      
//       // Get user or use anonymous name
//       let username = 'Anonymous';
//       if (address && typeof address === 'string') {
//         const user = await storage.getUserByWalletAddress(address);
//         if (user) {
//           username = user.username;
//         }
//       }
      
//       // Add spectator
//       await storage.addSpectator(match.id, username);
      
//       // Notify match participants
//       broadcastToMatch(match.id, {
//         type: 'spectate_join',
//         matchId: match.id,
//         spectator: username
//       });
      
//       res.json({ status: 'spectating', matchId: match.id });
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   app.post('/api/matches/:matchId/forfeit', async (req: Request, res: Response) => {
//     try {
//       const { matchId } = req.params;
//       const { address } = walletAddressSchema.parse(req.body);
      
//       const user = await storage.getUserByWalletAddress(address);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
      
//       const match = await storage.getMatch(parseInt(matchId));
//       if (!match) {
//         return res.status(404).json({ message: "Match not found" });
//       }
      
//       if (match.status !== 'active') {
//         return res.status(400).json({ message: "This match is not active" });
//       }
      
//       if (match.player1Id !== user.id && match.player2Id !== user.id) {
//         return res.status(403).json({ message: "You are not a participant in this match" });
//       }
      
//       // Determine winner and loser
//       const isPlayer1 = match.player1Id === user.id;
//       const winnerId = isPlayer1 ? match.player2Id : match.player1Id;
//       const loserId = user.id;
      
//       // Update match status
//       const updatedMatch = await storage.updateMatch(match.id, {
//         status: 'completed',
//         endTime: new Date(),
//         winnerId
//       });
      
//       if (updatedMatch) {
//         // Update leaderboard entries
//         await storage.updateLeaderboardEntry(winnerId, {
//           wins: 1,
//           totalMatches: 1,
//           points: 25
//         });
        
//         await storage.updateLeaderboardEntry(loserId, {
//           losses: 1,
//           totalMatches: 1
//         });
        
//         // Create activity for match end
//         await storage.createActivity({
//           matchId: match.id,
//           userId: null,
//           type: 'match_ended',
//           details: { 
//             winner: { id: winnerId },
//             loser: { id: loserId },
//             forfeit: true
//           }
//         });
        
//         // Get players
//         const winner = await storage.getUser(winnerId);
//         const loser = await storage.getUser(loserId);
        
//         // Calculate rewards
//         const tokenReward = 250;
//         const xpReward = 75;
//         const pointsReward = 25;
        
//         // Update winner's tokens
//         if (winner) {
//           await storage.updateUser(winner.id, {
//             arenaTokens: (winner.arenaTokens || 0) + tokenReward,
//             xp: (winner.xp || 0) + xpReward
//           });
//         }
        
//         // Prepare match summary for both players
//         const baseMatchSummary = {
//           stats: {
//             ordersPlaced: 4, // Mock data
//             winRate: 75,
//             avgPositionSize: "0.018 BTC",
//             biggestWin: 8.2
//           },
//           rewards: {
//             tokens: tokenReward,
//             xp: xpReward,
//             leaderboardPoints: pointsReward,
//             achievement: "First Win" // Only for first win
//           }
//         };
        
//         // Notify winner
//         broadcastToUser(winnerId, {
//           type: 'match_ended',
//           summary: {
//             ...baseMatchSummary,
//             playerPnl: match.player1Id === winnerId ? match.player1Pnl : match.player2Pnl,
//             opponentPnl: match.player1Id === winnerId ? match.player2Pnl : match.player1Pnl,
//             opponentName: loser?.username || 'Unknown'
//           }
//         });
        
//         // Notify loser (forfeiter)
//         broadcastToUser(loserId, {
//           type: 'match_ended',
//           summary: {
//             ...baseMatchSummary,
//             playerPnl: match.player1Id === loserId ? match.player1Pnl : match.player2Pnl,
//             opponentPnl: match.player1Id === loserId ? match.player2Pnl : match.player1Pnl,
//             opponentName: winner?.username || 'Unknown',
//             rewards: {
//               tokens: 0,
//               xp: 10, // Smaller reward for participation
//               leaderboardPoints: 0
//             }
//           }
//         });
//       }
      
//       res.json({ status: 'forfeited', matchId: match.id });
//     } catch (error) {
//       if (error instanceof z.ZodError) {
//         return res.status(400).json({ message: "Invalid data", errors: error.errors });
//       }
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   app.post('/api/matches/rematch', async (req: Request, res: Response) => {
//     try {
//       const { address, opponent } = req.body;
      
//       if (!address || typeof address !== 'string') {
//         return res.status(400).json({ message: "Wallet address is required" });
//       }
      
//       if (!opponent || typeof opponent !== 'string') {
//         return res.status(400).json({ message: "Opponent username is required" });
//       }
      
//       const user = await storage.getUserByWalletAddress(address);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
      
//       const opponentUser = await storage.getUserByUsername(opponent);
//       if (!opponentUser) {
//         return res.status(404).json({ message: "Opponent not found" });
//       }
      
//       // Create a new match
//       const market = chooseRandomMarket();
//       const match = await storage.createMatch({
//         matchCode: nanoid(8),
//         status: 'pending',
//         player1Id: user.id,
//         market,
//         duration: 1800, // 30 minutes
//         isGroupMatch: false
//       });
      
//       // In a real app, you would send a notification to the opponent
//       // Here we'll simulate acceptance immediately
      
//       // Add opponent as player 2
//       const updatedMatch = await storage.updateMatch(match.id, {
//         player2Id: opponentUser.id,
//         status: 'active',
//         startTime: new Date()
//       });
      
//       if (updatedMatch) {
//         // Create activity for match start
//         await storage.createActivity({
//           matchId: match.id,
//           userId: null,
//           type: 'match_started',
//           details: { 
//             player1: { id: user.id }, 
//             player2: { id: opponentUser.id },
//             market: match.market,
//             isRematch: true
//           }
//         });
        
//         // Notify both players
//         const matchData = {
//           id: match.id,
//           player: {
//             username: user.username,
//             pnl: 0
//           },
//           opponent: {
//             username: opponentUser.username,
//             pnl: 0
//           },
//           market: match.market,
//           duration: match.duration,
//           startTime: updatedMatch.startTime?.getTime() || Date.now(),
//           spectators: []
//         };
        
//         // Notify player 1
//         broadcastToUser(user.id, {
//           type: 'match_found',
//           match: matchData
//         });
        
//         // Notify player 2 (swap player/opponent)
//         broadcastToUser(opponentUser.id, {
//           type: 'match_found',
//           match: {
//             ...matchData,
//             player: matchData.opponent,
//             opponent: matchData.player
//           }
//         });
//       }
      
//       res.json({ status: 'rematch_created', matchId: match.id });
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   app.get('/api/matches/:matchId/activity', async (req: Request, res: Response) => {
//     try {
//       const { matchId } = req.params;
      
//       const match = await storage.getMatch(parseInt(matchId));
//       if (!match) {
//         return res.status(404).json({ message: "Match not found" });
//       }
      
//       const activities = await storage.getMatchActivities(match.id);
      
//       // Format activities for the client
//       const formattedActivities = activities.map(activity => {
//         const user = activity.userId 
//           ? Array.from(storage.users.values()).find(u => u.id === activity.userId)?.username 
//           : '';
        
//         return {
//           id: activity.id,
//           type: activity.type,
//           user: user || '',
//           isCurrentUser: false, // This would be determined based on the client
//           details: typeof activity.details === 'string' 
//             ? activity.details 
//             : (activity.details && 'details' in activity.details)
//               ? activity.details.details
//               : '',
//           timestamp: activity.createdAt.getTime()
//         };
//       });
      
//       res.json(formattedActivities);
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   // Drift Protocol API Endpoints
//   app.post('/api/drift/order', async (req: Request, res: Response) => {
//     try {
//       const { address, market, direction, amount, leverage } = req.body;
      
//       if (!market || !direction || !amount || !leverage) {
//         return res.status(400).json({ message: "Missing required parameters" });
//       }
      
//       if (direction !== 'long' && direction !== 'short') {
//         return res.status(400).json({ message: "Direction must be 'long' or 'short'" });
//       }
      
//       // Find user if address is provided
//       let user = null;
//       if (address) {
//         user = await storage.getUserByWalletAddress(address);
//       }
      
//       // Mock entry price (in a real app, would get from Drift)
//       const entryPrice = getMockPrice(market);
      
//       // Calculate position size
//       const size = amount / entryPrice;
      
//       // Calculate liquidation price
//       const liquidationPrice = direction === 'long'
//         ? entryPrice * (1 - 1 / leverage) * 0.95 // 5% buffer
//         : entryPrice * (1 + 1 / leverage) * 1.05; // 5% buffer
      
//       const position = {
//         id: nanoid(),
//         market,
//         direction,
//         size,
//         leverage,
//         entryPrice,
//         liquidationPrice,
//         pnl: 0,
//         pnlUsd: 0
//       };
      
//       // Record trading activity if this is part of an active match
//       if (user) {
//         // Get active match if one exists
//         const userMatches = await storage.getUserMatches(user.id);
//         const activeMatch = userMatches.find(m => m.status === 'active');
        
//         if (activeMatch) {
//           // Create activity for opening a position
//           await storage.createActivity({
//             matchId: activeMatch.id,
//             userId: user.id,
//             type: 'open_position',
//             details: { 
//               market,
//               direction,
//               size,
//               leverage,
//               entryPrice
//             }
//           });
//         }
//       }
      
//       res.json(position);
//     } catch (error) {
//       console.error("Error placing order:", error);
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   app.post('/api/drift/close', async (req: Request, res: Response) => {
//     try {
//       const { address, positionId, market } = req.body;
      
//       if (!positionId) {
//         return res.status(400).json({ message: "Position ID is required" });
//       }
      
//       // Find user if address is provided
//       let user = null;
//       if (address) {
//         user = await storage.getUserByWalletAddress(address);
//       }
      
//       // Generate a random PnL value between -5% and +15% for demonstration
//       // In a real app, this would be calculated based on entry and exit prices
//       const pnlPercentage = (Math.random() * 20) - 5;
      
//       // Get market price for exit
//       const exitPrice = getMockPrice(market || 'SOL/USDT');
      
//       // Record trading activity if this is part of an active match
//       if (user) {
//         // Get active match if one exists
//         const userMatches = await storage.getUserMatches(user.id);
//         const activeMatch = userMatches.find(m => m.status === 'active');
        
//         if (activeMatch) {
//           // Create activity for closing a position
//           await storage.createActivity({
//             matchId: activeMatch.id,
//             userId: user.id,
//             type: 'close_position',
//             details: { 
//               positionId,
//               exitPrice,
//               pnl: pnlPercentage
//             }
//           });
          
//           // Update match PnL for the user
//           const isPlayer1 = activeMatch.player1Id === user.id;
          
//           if (isPlayer1) {
//             await storage.updateMatch(activeMatch.id, {
//               player1Pnl: (activeMatch.player1Pnl || 0) + pnlPercentage
//             });
//           } else {
//             await storage.updateMatch(activeMatch.id, {
//               player2Pnl: (activeMatch.player2Pnl || 0) + pnlPercentage
//             });
//           }
//         }
//       }
      
//       res.json({ 
//         success: true, 
//         positionId,
//         pnl: pnlPercentage,
//         exitPrice
//       });
//     } catch (error) {
//       console.error("Error closing position:", error);
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   app.get('/api/drift/price', async (req: Request, res: Response) => {
//     try {
//       const { market } = req.query;
      
//       if (!market || typeof market !== 'string') {
//         return res.status(400).json({ message: "Market parameter is required" });
//       }
      
//       const price = getMockPrice(market);
      
//       res.json({ market, price });
//     } catch (error) {
//       console.error("Error getting price:", error);
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   // Get user positions
//   app.get('/api/drift/positions', async (req: Request, res: Response) => {
//     try {
//       const { address } = req.query;
      
//       if (!address || typeof address !== 'string') {
//         return res.status(400).json({ message: "Address parameter is required" });
//       }
      
//       const user = await storage.getUserByWalletAddress(address);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
      
//       // For the demo, we'll return 0-2 mock positions
//       const positions = [];
//       const positionCount = Math.floor(Math.random() * 3); // 0, 1, or 2 positions
      
//       for (let i = 0; i < positionCount; i++) {
//         // Generate random position data
//         const market = ['SOL/USDT', 'SOL/USDC', 'BTC/USDC', 'ETH/USDC'][Math.floor(Math.random() * 4)];
//         const direction = Math.random() > 0.5 ? 'long' : 'short';
//         const leverage = Math.floor(Math.random() * 10) + 1; // 1-10x leverage
//         const entryPrice = getMockPrice(market);
//         const size = (1000 * (Math.random() + 0.1)) / entryPrice; // Random size based on ~$1000 value
//         const pnl = (Math.random() * 40) - 20; // -20% to +20% PnL
//         const pnlUsd = (entryPrice * size) * (pnl / 100);
        
//         // Generate liquidation price based on direction and leverage
//         const liquidationPrice = direction === 'long'
//           ? entryPrice * (1 - 1 / leverage) * 0.95 // 5% buffer
//           : entryPrice * (1 + 1 / leverage) * 1.05; // 5% buffer
          
//         positions.push({
//           id: nanoid(),
//           market,
//           direction,
//           size,
//           leverage,
//           entryPrice,
//           liquidationPrice,
//           pnl,
//           pnlUsd
//         });
//       }
      
//       res.json(positions);
//     } catch (error) {
//       console.error("Error getting positions:", error);
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   // Market history endpoint for chart data
//   app.get('/api/drift/history', async (req: Request, res: Response) => {
//     try {
//       const { market, interval } = req.query;
      
//       if (!market || typeof market !== 'string') {
//         return res.status(400).json({ message: "Market parameter is required" });
//       }
      
//       // Generate mock historical price data
//       // In a real app, this would come from a data provider or exchange API
//       const basePrice = getMockPrice(market);
//       const history = [];
      
//       // Generate 100 data points
//       const now = Date.now();
//       let timeStep;
      
//       switch (interval) {
//         case '1m': timeStep = 60 * 1000; break;
//         case '5m': timeStep = 5 * 60 * 1000; break;
//         case '15m': timeStep = 15 * 60 * 1000; break;
//         case '1h': timeStep = 60 * 60 * 1000; break;
//         case '4h': timeStep = 4 * 60 * 60 * 1000; break;
//         case '1d': timeStep = 24 * 60 * 60 * 1000; break;
//         default: timeStep = 60 * 60 * 1000; // Default to 1h
//       }
      
//       for (let i = 99; i >= 0; i--) {
//         const timestamp = now - (i * timeStep);
//         const volatility = 0.005; // 0.5% volatility
        
//         // Random walk price generation
//         const changePercent = (Math.random() * 2 - 1) * volatility;
//         const priceOffset = basePrice * changePercent * (100 - i) / 25;
//         const price = basePrice + priceOffset;
        
//         // Generate OHLC data
//         const open = price * (1 + (Math.random() * 0.004 - 0.002));
//         const high = Math.max(open, price) * (1 + Math.random() * 0.003);
//         const low = Math.min(open, price) * (1 - Math.random() * 0.003);
//         const close = price;
//         const volume = Math.random() * 10000 + 5000;
        
//         history.push({
//           timestamp,
//           open,
//           high,
//           low,
//           close,
//           volume
//         });
//       }
      
//       res.json({ market, interval, history });
//     } catch (error) {
//       console.error("Error getting market history:", error);
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   // Leaderboard API
//   app.get('/api/leaderboard', async (req: Request, res: Response) => {
//     try {
//       const leaderboardEntries = await storage.getLeaderboard();
      
//       // Format leaderboard entries
//       const formattedEntries = await Promise.all(
//         leaderboardEntries.map(async entry => {
//           const user = await storage.getUser(entry.userId);
          
//           return {
//             id: entry.userId,
//             username: user?.username || 'Unknown',
//             rank: entry.rank,
//             winRate: user && entry.totalMatches > 0 
//               ? Math.round((entry.wins / entry.totalMatches) * 100) 
//               : 0,
//             totalPnl: entry.totalPnl,
//             arenaTokens: user?.arenaTokens || 0
//           };
//         })
//       );
      
//       // Sort by rank
//       formattedEntries.sort((a, b) => a.rank - b.rank);
      
//       res.json(formattedEntries);
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   // Reels API
//   app.get('/api/reels', async (req: Request, res: Response) => {
//     try {
//       const reels = await storage.getReels();
      
//       // Format reels data
//       const formattedReels = await Promise.all(
//         reels.map(async reel => {
//           const user = await storage.getUser(reel.userId);
          
//           // Get match data if attached to a match
//           let matchData = undefined;
//           if (reel.matchId) {
//             const match = await storage.getMatch(reel.matchId);
//             if (match) {
//               const isPlayer1 = match.player1Id === reel.userId;
//               const playerPnl = isPlayer1 ? match.player1Pnl : match.player2Pnl;
//               const opponentPnl = isPlayer1 ? match.player2Pnl : match.player1Pnl;
//               const result = playerPnl > opponentPnl ? 'win' : 'loss';
              
//               matchData = {
//                 finalPnl: playerPnl,
//                 opponent: isPlayer1 
//                   ? (await storage.getUser(match.player2Id || 0))?.username || 'Unknown'
//                   : (await storage.getUser(match.player1Id))?.username || 'Unknown',
//                 result
//               };
//             }
//           }
          
//           return {
//             id: reel.id,
//             author: {
//               id: reel.userId,
//               username: user?.username || 'Unknown',
//               avatar: user?.avatar
//             },
//             caption: reel.caption || '',
//             likes: reel.likes,
//             comments: 0, // Would need a comments table in a real app
//             videoUrl: reel.videoUrl,
//             createdAt: reel.createdAt.toISOString(),
//             matchData
//           };
//         })
//       );
      
//       res.json(formattedReels);
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   app.post('/api/reels', async (req: Request, res: Response) => {
//     try {
//       const { address, videoUrl, caption, matchId } = req.body;
      
//       if (!address || typeof address !== 'string') {
//         return res.status(400).json({ message: "Wallet address is required" });
//       }
      
//       if (!videoUrl || typeof videoUrl !== 'string') {
//         return res.status(400).json({ message: "Video URL is required" });
//       }
      
//       const user = await storage.getUserByWalletAddress(address);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
      
//       // Validate match if provided
//       if (matchId) {
//         const match = await storage.getMatch(parseInt(matchId));
//         if (!match) {
//           return res.status(404).json({ message: "Match not found" });
//         }
        
//         if (match.player1Id !== user.id && match.player2Id !== user.id) {
//           return res.status(403).json({ message: "You were not a participant in this match" });
//         }
//       }
      
//       // Create reel
//       const reel = await storage.createReel({
//         userId: user.id,
//         matchId: matchId ? parseInt(matchId) : undefined,
//         videoUrl,
//         caption: caption || ''
//       });
      
//       res.json({
//         id: reel.id,
//         videoUrl: reel.videoUrl,
//         caption: reel.caption,
//         createdAt: reel.createdAt.toISOString()
//       });
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   // Get reel by ID
//   app.get('/api/reels/:reelId', async (req: Request, res: Response) => {
//     try {
//       const { reelId } = req.params;
      
//       if (!reelId || isNaN(parseInt(reelId))) {
//         return res.status(400).json({ message: "Invalid reel ID" });
//       }
      
//       const reels = await storage.getReels();
//       const reel = reels.find(r => r.id === parseInt(reelId));
      
//       if (!reel) {
//         return res.status(404).json({ message: "Reel not found" });
//       }
      
//       const user = await storage.getUser(reel.userId);
      
//       // Get match data if attached to a match
//       let matchData = undefined;
//       if (reel.matchId) {
//         const match = await storage.getMatch(reel.matchId);
//         if (match) {
//           const isPlayer1 = match.player1Id === reel.userId;
//           const playerPnl = isPlayer1 ? match.player1Pnl : match.player2Pnl;
//           const opponentPnl = isPlayer1 ? match.player2Pnl : match.player1Pnl;
//           const result = playerPnl > opponentPnl ? 'win' : 'loss';
          
//           matchData = {
//             finalPnl: playerPnl,
//             opponent: isPlayer1 
//               ? (await storage.getUser(match.player2Id || 0))?.username || 'Unknown'
//               : (await storage.getUser(match.player1Id))?.username || 'Unknown',
//             result
//           };
//         }
//       }
      
//       const formattedReel = {
//         id: reel.id,
//         author: {
//           id: reel.userId,
//           username: user?.username || 'Unknown',
//           avatar: user?.avatar
//         },
//         caption: reel.caption || '',
//         likes: reel.likes,
//         comments: 0,
//         videoUrl: reel.videoUrl,
//         createdAt: reel.createdAt?.toISOString() || new Date().toISOString(),
//         matchData
//       };
      
//       res.json(formattedReel);
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   // Update a reel
//   app.put('/api/reels/:reelId', async (req: Request, res: Response) => {
//     try {
//       const { reelId } = req.params;
//       const { address, caption } = req.body;
      
//       if (!address || typeof address !== 'string') {
//         return res.status(400).json({ message: "Wallet address is required" });
//       }
      
//       if (!reelId || isNaN(parseInt(reelId))) {
//         return res.status(400).json({ message: "Invalid reel ID" });
//       }
      
//       const user = await storage.getUserByWalletAddress(address);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
      
//       const reels = await storage.getReels();
//       const reelIndex = reels.findIndex(r => r.id === parseInt(reelId));
      
//       if (reelIndex === -1) {
//         return res.status(404).json({ message: "Reel not found" });
//       }
      
//       const reel = reels[reelIndex];
      
//       // Check if user owns the reel
//       if (reel.userId !== user.id) {
//         return res.status(403).json({ message: "You can only update your own reels" });
//       }
      
//       // Update reel
//       reels[reelIndex] = {
//         ...reel,
//         caption: caption || reel.caption
//       };
      
//       res.json({
//         id: reels[reelIndex].id,
//         caption: reels[reelIndex].caption
//       });
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   // Delete a reel
//   app.delete('/api/reels/:reelId', async (req: Request, res: Response) => {
//     try {
//       const { reelId } = req.params;
//       const { address } = req.body;
      
//       if (!address || typeof address !== 'string') {
//         return res.status(400).json({ message: "Wallet address is required" });
//       }
      
//       if (!reelId || isNaN(parseInt(reelId))) {
//         return res.status(400).json({ message: "Invalid reel ID" });
//       }
      
//       const user = await storage.getUserByWalletAddress(address);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
      
//       const reels = await storage.getReels();
//       const reelIndex = reels.findIndex(r => r.id === parseInt(reelId));
      
//       if (reelIndex === -1) {
//         return res.status(404).json({ message: "Reel not found" });
//       }
      
//       const reel = reels[reelIndex];
      
//       // Check if user owns the reel
//       if (reel.userId !== user.id) {
//         return res.status(403).json({ message: "You can only delete your own reels" });
//       }
      
//       // Delete reel
//       reels.splice(reelIndex, 1);
      
//       res.json({ message: "Reel deleted successfully" });
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   // Like a reel
//   app.post('/api/reels/:reelId/like', async (req: Request, res: Response) => {
//     try {
//       const { reelId } = req.params;
//       const { address } = req.body;
      
//       if (!address || typeof address !== 'string') {
//         return res.status(400).json({ message: "Wallet address is required" });
//       }
      
//       if (!reelId || isNaN(parseInt(reelId))) {
//         return res.status(400).json({ message: "Invalid reel ID" });
//       }
      
//       const user = await storage.getUserByWalletAddress(address);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
      
//       // Find and like the reel
//       await storage.likeReel(parseInt(reelId));
      
//       res.json({ message: "Reel liked successfully" });
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   });
  
//   // Admin API endpoints
//   // Middleware to check if user is admin
//   const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       if (!req.session?.userId) {
//         return res.status(401).json({ error: 'Unauthorized' });
//       }
      
//       const user = await storage.getUser(req.session.userId);
//       if (!user || user.role !== 'admin') {
//         return res.status(403).json({ error: 'Forbidden - Admin access required' });
//       }
      
//       next();
//     } catch (error) {
//       console.error('Error in admin authorization:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   };
  
//   // Feature flag management endpoints
//   app.get('/api/admin/feature-flags', isAdmin, async (req: Request, res: Response) => {
//     try {
//       const featureFlags = await storage.getFeatureFlags();
//       res.json(featureFlags);
//     } catch (error) {
//       console.error('Error fetching feature flags:', error);
//       res.status(500).json({ error: 'Failed to fetch feature flags' });
//     }
//   });
  
//   app.post('/api/admin/feature-flags', isAdmin, async (req: Request, res: Response) => {
//     try {
//       const validation = insertFeatureFlagSchema.safeParse(req.body);
//       if (!validation.success) {
//         return res.status(400).json({ error: validation.error.errors });
//       }
      
//       const featureFlag = await storage.createFeatureFlag(validation.data);
//       res.status(201).json(featureFlag);
//     } catch (error) {
//       console.error('Error creating feature flag:', error);
//       res.status(500).json({ error: 'Failed to create feature flag' });
//     }
//   });
  
//   app.put('/api/admin/feature-flags/:id', isAdmin, async (req: Request, res: Response) => {
//     try {
//       const id = parseInt(req.params.id);
//       const featureFlag = await storage.getFeatureFlag(id);
      
//       if (!featureFlag) {
//         return res.status(404).json({ error: 'Feature flag not found' });
//       }
      
//       const updatedFeatureFlag = await storage.updateFeatureFlag(id, req.body);
//       res.json(updatedFeatureFlag);
//     } catch (error) {
//       console.error('Error updating feature flag:', error);
//       res.status(500).json({ error: 'Failed to update feature flag' });
//     }
//   });
  
//   app.delete('/api/admin/feature-flags/:id', isAdmin, async (req: Request, res: Response) => {
//     try {
//       const id = parseInt(req.params.id);
//       const featureFlag = await storage.getFeatureFlag(id);
      
//       if (!featureFlag) {
//         return res.status(404).json({ error: 'Feature flag not found' });
//       }
      
//       await storage.deleteFeatureFlag(id);
//       res.status(204).send();
//     } catch (error) {
//       console.error('Error deleting feature flag:', error);
//       res.status(500).json({ error: 'Failed to delete feature flag' });
//     }
//   });
  
//   // User management endpoints
//   app.get('/api/admin/users', isAdmin, async (req: Request, res: Response) => {
//     try {
//       const users = await storage.getAllUsers();
//       res.json(users);
//     } catch (error) {
//       console.error('Error fetching users:', error);
//       res.status(500).json({ error: 'Failed to fetch users' });
//     }
//   });
  
//   app.put('/api/admin/users/:id', isAdmin, async (req: Request, res: Response) => {
//     try {
//       const id = parseInt(req.params.id);
//       const user = await storage.getUser(id);
      
//       if (!user) {
//         return res.status(404).json({ error: 'User not found' });
//       }
      
//       // Validate that the role is valid if it's being updated
//       if (req.body.role && !['admin', 'moderator', 'user'].includes(req.body.role)) {
//         return res.status(400).json({ error: 'Invalid role. Must be admin, moderator, or user' });
//       }
      
//       const updatedUser = await storage.updateUser(id, req.body);
//       res.json(updatedUser);
//     } catch (error) {
//       console.error('Error updating user:', error);
//       res.status(500).json({ error: 'Failed to update user' });
//     }
//   });
  
//   // Match management endpoints
//   app.get('/api/admin/matches', isAdmin, async (req: Request, res: Response) => {
//     try {
//       const matches = await storage.getActiveMatches();
//       res.json(matches);
//     } catch (error) {
//       console.error('Error fetching matches:', error);
//       res.status(500).json({ error: 'Failed to fetch matches' });
//     }
//   });
  
//   app.put('/api/admin/matches/:id/end', isAdmin, async (req: Request, res: Response) => {
//     try {
//       const id = parseInt(req.params.id);
//       const match = await storage.getMatch(id);
      
//       if (!match) {
//         return res.status(404).json({ error: 'Match not found' });
//       }
      
//       if (match.status !== 'active') {
//         return res.status(400).json({ error: 'Match is not active' });
//       }
      
//       const playerPnl = match.player1Pnl || 0;
//       const opponentPnl = match.player2Pnl || 0;
      
//       // Determine winner
//       let winnerId = null;
//       if (playerPnl > opponentPnl) {
//         winnerId = match.player1Id;
//       } else if (opponentPnl > playerPnl) {
//         winnerId = match.player2Id;
//       }
      
//       const updatedMatch = await storage.updateMatch(id, {
//         status: 'completed',
//         endTime: new Date(),
//         winnerId
//       });
      
//       res.json(updatedMatch);
//     } catch (error) {
//       console.error('Error ending match:', error);
//       res.status(500).json({ error: 'Failed to end match' });
//     }
//   });
  
//   // System metrics endpoints
//   app.get('/api/admin/system/metrics', isAdmin, async (req: Request, res: Response) => {
//     try {
//       const summary = await storage.getSystemMetricsSummary();
//       res.json(summary);
//     } catch (error) {
//       console.error('Error fetching system metrics:', error);
//       res.status(500).json({ error: 'Failed to fetch system metrics' });
//     }
//   });
  
//   app.get('/api/admin/system/metrics/history', isAdmin, async (req: Request, res: Response) => {
//     try {
//       const metrics = await storage.getSystemMetrics();
//       res.json(metrics);
//     } catch (error) {
//       console.error('Error fetching system metrics history:', error);
//       res.status(500).json({ error: 'Failed to fetch system metrics history' });
//     }
//   });
  
//   app.post('/api/admin/system/metrics', isAdmin, async (req: Request, res: Response) => {
//     try {
//       const validation = insertSystemMetricSchema.safeParse(req.body);
//       if (!validation.success) {
//         return res.status(400).json({ error: validation.error.errors });
//       }
      
//       const metric = await storage.createSystemMetric(validation.data);
//       res.status(201).json(metric);
//     } catch (error) {
//       console.error('Error creating system metric:', error);
//       res.status(500).json({ error: 'Failed to create system metric' });
//     }
//   });
  
//   return httpServer;
// }

// // Helper functions
// function chooseRandomMarket(): string {
//   const markets = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'ADA/USDT'];
//   return markets[Math.floor(Math.random() * markets.length)];
// }

// function getMockPrice(market: string): number {
//   const basePrices: Record<string, number> = {
//     'BTC/USDT': 26850,
//     'ETH/USDT': 1650,
//     'SOL/USDT': 75,
//     'BNB/USDT': 220,
//     'ADA/USDT': 0.38
//   };
  
//   // Random variation
//   const basePrice = basePrices[market] || 100;
//   const variation = (Math.random() - 0.5) * 0.02; // +/- 1% variation
  
//   return basePrice * (1 + variation);
// }

import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from 'ws';
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertMatchSchema, 
  insertPositionSchema,
  insertActivitySchema,
  insertReelSchema,
  insertFollowSchema,
  insertFeatureFlagSchema,
  insertSystemMetricSchema
} from "@shared/schema";
import { z } from "zod";
import { nanoid } from "nanoid";

// Validator for wallet address
const walletAddressSchema = z.object({
  address: z.string().min(1, "Wallet address is required")
});

// Connected WebSocket clients
const clients = new Map<string, { ws: WebSocket, userId?: number }>();

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    const clientId = nanoid();
    clients.set(clientId, { ws });
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        if (data.type === 'auth' && data.address) {
          const user = await storage.getUserByWalletAddress(data.address);
          if (user) {
            clients.set(clientId, { ws, userId: user.id });
          }
        }
      } catch (e) {
        console.error('Error processing WebSocket message:', e);
      }
    });
    
    ws.on('close', () => {
      clients.delete(clientId);
    });
  });
  
  // Broadcast to all or specific clients
  const broadcast = (data: any, filter?: (client: { ws: WebSocket, userId?: number }) => boolean) => {
    const message = JSON.stringify(data);
    clients.forEach((client, id) => {
      if (client.ws.readyState === WebSocket.OPEN && (!filter || filter(client))) {
        client.ws.send(message);
      }
    });
  };
  
  // Broadcast to a specific user
  const broadcastToUser = (userId: number, data: any) => {
    broadcast(data, client => client.userId === userId);
  };
  
  // Broadcast to match participants and spectators
  const broadcastToMatch = async (matchId: number, data: any) => {
    const match = await storage.getMatch(matchId);
    if (!match) return;
    
    broadcast(data, client => 
      client.userId === match.player1Id || 
      client.userId === match.player2Id ||
      (match.spectators || []).some(spectator => {
        // Match username or ID based on what's stored in spectators array
        if (typeof spectator === 'string' && client.userId) {
          const user = Array.from(storage.users.values()).find(u => u.id === client.userId);
          return user && user.username === spectator;
        }
        return false;
      })
    );
  };
  
  // Authentication API
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Check if wallet already exists
      if (data.walletAddress) {
        const existingWallet = await storage.getUserByWalletAddress(data.walletAddress);
        if (existingWallet) {
          return res.status(400).json({ message: "Wallet address already registered" });
        }
      }
      
      const user = await storage.createUser(data);
      res.status(201).json({ 
        id: user.id, 
        username: user.username,
        walletAddress: user.walletAddress 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({
        id: user.id,
        username: user.username,
        walletAddress: user.walletAddress
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post('/api/auth/wallet', async (req: Request, res: Response) => {
    try {
      const { address } = walletAddressSchema.parse(req.body);
      
      let user = await storage.getUserByWalletAddress(address);
      
      // If user doesn't exist, create one
      if (!user) {
        const username = `User${Math.floor(Math.random() * 10000)}`;
        user = await storage.createUser({
          username,
          password: nanoid(),
          walletAddress: address
        });
      }
      
      res.json({
        id: user.id,
        username: user.username,
        walletAddress: user.walletAddress
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // User profile API
  app.get('/api/profile', async (req: Request, res: Response) => {
    try {
      const { address } = req.query;
      
      if (!address || typeof address !== 'string') {
        return res.status(400).json({ message: "Wallet address is required" });
      }
      
      const user = await storage.getUserByWalletAddress(address);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user matches
      const matches = await storage.getUserMatches(user.id);
      
      // Get follow counts
      const followers = await storage.getFollowers(user.id);
      const following = await storage.getFollowing(user.id);
      
      // Get leaderboard entry
      const leaderboardEntries = await storage.getLeaderboard();
      const leaderboardEntry = leaderboardEntries.find(entry => entry.userId === user.id);
      
      // Format match history
      const matchHistory = matches
        .filter(match => match.status === 'completed')
        .slice(0, 10)
        .map(match => {
          const isPlayer1 = match.player1Id === user.id;
          const playerPnl = isPlayer1 ? match.player1Pnl : match.player2Pnl;
          const opponentPnl = isPlayer1 ? match.player2Pnl : match.player1Pnl;
          const opponentId = isPlayer1 ? match.player2Id : match.player1Id;
          let opponentName = 'Unknown';
          
          // Find opponent
          const opponent = Array.from(storage.users.values()).find(u => u.id === opponentId);
          if (opponent) {
            opponentName = opponent.username;
          }
          
          return {
            id: match.id,
            date: match.endTime || match.createdAt,
            opponent: opponentName,
            pnl: playerPnl,
            result: playerPnl > opponentPnl ? 'win' : 'loss'
          };
        });
      
      // Calculate stats
      const wins = matchHistory.filter(m => m.result === 'win').length;
      const winRate = matches.length > 0 ? (wins / matches.length) * 100 : 0;
      
      res.json({
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        stats: {
          totalMatches: matches.length,
          wins,
          losses: matches.length - wins,
          winRate: Math.round(winRate),
          totalPnl: leaderboardEntry?.totalPnl || 0,
          arenaTokens: user.arenaTokens,
          followers: followers.length,
          following: following.length
        },
        matchHistory
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Matches API
  app.post('/api/matches/queue', async (req: Request, res: Response) => {
    try {
      const { address } = walletAddressSchema.parse(req.body);
      
      const user = await storage.getUserByWalletAddress(address);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check for any active matches
      const userMatches = await storage.getUserMatches(user.id);
      const activeMatch = userMatches.find(m => m.status === 'active');
      
      if (activeMatch) {
        return res.status(400).json({ message: "You are already in an active match" });
      }
      
      // Create a pending match or join an existing one
      const pendingMatches = Array.from((await storage.getActiveMatches()))
        .filter(m => m.status === 'pending' && m.player1Id !== user.id);
      
      if (pendingMatches.length > 0) {
        // Join first pending match
        const match = pendingMatches[0];
        
        const updatedMatch = await storage.updateMatch(match.id, {
          player2Id: user.id,
          status: 'active',
          startTime: new Date()
        });
        
        if (updatedMatch) {
          // Create activity for match start
          await storage.createActivity({
            matchId: match.id,
            userId: null,
            type: 'match_started',
            details: { 
              player1: { id: match.player1Id }, 
              player2: { id: user.id },
              market: match.market
            }
          });
          
          // Find opponent
          const opponent = await storage.getUser(match.player1Id);
          
          // Notify both players
          const matchData = {
            id: match.id,
            player: {
              username: user.username,
              pnl: 0
            },
            opponent: {
              username: opponent?.username || 'Unknown',
              pnl: 0
            },
            market: match.market,
            duration: match.duration,
            startTime: updatedMatch.startTime?.getTime() || Date.now(),
            spectators: []
          };
          
          // Notify player 2
          broadcastToUser(user.id, {
            type: 'match_found',
            match: matchData
          });
          
          // Notify player 1 (swap player/opponent)
          broadcastToUser(match.player1Id, {
            type: 'match_found',
            match: {
              ...matchData,
              player: matchData.opponent,
              opponent: matchData.player
            }
          });
        }
        
        res.json({ status: 'matched', matchId: match.id });
      } else {
        // Create a new pending match
        const market = chooseRandomMarket();
        const match = await storage.createMatch({
          matchCode: nanoid(8),
          status: 'pending',
          player1Id: user.id,
          market,
          duration: 1800, // 30 minutes
          isGroupMatch: false
        });
        
        res.json({ status: 'waiting', matchId: match.id });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post('/api/matches/create', async (req: Request, res: Response) => {
    try {
      // Extract market and duration from request if available
      const { address, market, duration } = req.body;
      const validAddress = walletAddressSchema.parse({ address }).address;
      console.log("Received address:", validAddress);  // <-- log input address
      console.log("Received market:", market); 
      console.log("Received duration:", duration);
      
      const user = await storage.getUserByWalletAddress(validAddress);
      console.log("Found user:", user);  // <-- log lookup result
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Generate invite code
      const inviteCode = nanoid(8);
      
      // Create match
      const match = await storage.createMatch({
        matchCode: inviteCode,
        status: 'pending',
        player1Id: user.id,
        market: market || chooseRandomMarket(), // Use provided market or choose random
        duration: duration ? parseInt(duration) : 1800, // Use provided duration or default to 30 minutes
        isGroupMatch: false
      });

      // Get full match data with player information
      const fullMatch = await storage.getMatch(match.id);
      if (fullMatch) {
        // Format match data for client
        const player = await storage.getUser(user.id);
        
        if (player) {
          // Create match data object for WebSocket
          const matchData = {
            id: match.id,
            status: match.status,
            market: match.market,
            duration: match.duration,
            createdAt: match.createdAt,
            isGroupMatch: match.isGroupMatch,
            player: {
              id: player.id,
              username: player.username,
              walletAddress: player.walletAddress,
              avatarUrl: player.avatarUrl || null
            },
            opponent: null, // No opponent yet
            spectators: []
          };
          
          // Send match_found event to creator
          broadcastToUser(user.id, {
            type: 'match_found',
            match: matchData
          });
        }
      }
      
      res.json({ matchId: match.id, inviteCode });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Lookup match by invite code
  app.get('/api/matches/code/:inviteCode', async (req: Request, res: Response) => {
    try {
      const { inviteCode } = req.params;
      
      if (!inviteCode) {
        return res.status(400).json({ message: "Invite code is required" });
      }
      
      // Find match with this invite code
      const match = await storage.getMatchByCode(inviteCode);
      
      if (!match) {
        return res.status(404).json({ message: "Match not found with this invite code" });
      }
      
      return res.json({ matchId: match.id, status: match.status });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get active match for a user by address
  app.get('/api/matches/active', async (req: Request, res: Response) => {
    try {
      const { address } = req.query;
      
      if (!address || typeof address !== 'string') {
        return res.status(400).json({ message: "Wallet address is required" });
      }
      
      // Find user
      const user = await storage.getUserByWalletAddress(address);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Find active match where user is player1 or player2
      const activeMatches = await storage.getActiveMatches();
      const userMatch = activeMatches.find(match => 
        (match.player1Id === user.id || match.player2Id === user.id) && 
        match.status === 'active'
      );
      
      if (!userMatch) {
        return res.json({ match: null });
      }
      
      // Get opponent data
      const opponentId = userMatch.player1Id === user.id ? userMatch.player2Id : userMatch.player1Id;
      const opponent = await storage.getUser(opponentId || 0);
      
      // Format match data for frontend
      const formattedMatch = {
        id: userMatch.id,
        player: {
          username: user.username,
          pnl: userMatch.player1Id === user.id ? userMatch.player1Pnl : userMatch.player2Pnl
        },
        opponent: {
          username: opponent?.username || 'Unknown',
          pnl: userMatch.player1Id === user.id ? userMatch.player2Pnl : userMatch.player1Pnl
        },
        market: userMatch.market,
        duration: userMatch.duration,
        startTime: userMatch.startTime?.getTime() || Date.now(),
        spectators: userMatch.spectators || []
      };
      
      return res.json({ match: formattedMatch });
    } catch (error) {
      console.error('Error fetching active match:', error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get('/api/matches/live', async (req: Request, res: Response) => {
    try {
      const activeMatches = await storage.getActiveMatches();
      
      const liveMatches = await Promise.all(
        activeMatches.map(async match => {
          const player1 = await storage.getUser(match.player1Id);
          const player2 = await storage.getUser(match.player2Id || 0);
          
          if (!player1 || !player2) return null;
          
          const timeElapsed = match.startTime 
            ? Math.floor((Date.now() - match.startTime.getTime()) / 1000)
            : 0;
          
          const timeRemaining = Math.max(0, match.duration - timeElapsed);
          
          return {
            id: match.id,
            player1: {
              username: player1.username,
              pnl: match.player1Pnl,
              isOnline: true // In a real app, you would check if user is online
            },
            player2: {
              username: player2.username,
              pnl: match.player2Pnl,
              isOnline: true
            },
            timeRemaining,
            market: match.market,
            isGroupMatch: match.isGroupMatch
          };
        })
      );
      
      // Filter out null values and sort by most recent
      const validMatches = liveMatches
        .filter(Boolean)
        .sort((a, b) => a!.timeRemaining - b!.timeRemaining);
      
      res.json(validMatches);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post('/api/matches/:matchId/join', async (req: Request, res: Response) => {
    try {
      console.log(`[SERVER] Match join request received for matchId: ${req.params.matchId}`);
      const { matchId } = req.params;
      const { address } = walletAddressSchema.parse(req.body);
      console.log(`[SERVER] Player joining with address: ${address}`);
      
      const user = await storage.getUserByWalletAddress(address);
      if (!user) {
        console.log(`[SERVER] ERROR: User not found with address ${address}`);
        return res.status(404).json({ message: "User not found" });
      }
      console.log(`[SERVER] Found user: ${user.username} (ID: ${user.id})`);
      
      const match = await storage.getMatch(parseInt(matchId));
      if (!match) {
        console.log(`[SERVER] ERROR: Match not found with ID ${matchId}`);
        return res.status(404).json({ message: "Match not found" });
      }
      console.log(`[SERVER] Found match: ${match.id}, status: ${match.status}, inviteCode: ${match.matchCode}`);
      
      if (match.status !== 'pending') {
        console.log(`[SERVER] ERROR: Match ${match.id} is not pending, current status: ${match.status}`);
        return res.status(400).json({ message: "This match is no longer available" });
      }
      
      if (match.player1Id === user.id) {
        console.log(`[SERVER] ERROR: User ${user.id} tried to join their own match ${match.id}`);
        return res.status(400).json({ message: "You cannot join your own match" });
      }
      
      // Update match status
      console.log(`[SERVER] Updating match ${match.id} status to 'active' with player2Id: ${user.id}`);
      const updatedMatch = await storage.updateMatch(match.id, {
        player2Id: user.id,
        status: 'active',
        startTime: new Date()
      });
      
      if (updatedMatch) {
        console.log(`[SERVER] Successfully updated match: ${JSON.stringify(updatedMatch)}`);
        
        // Create activity for match start
        console.log(`[SERVER] Creating match_started activity for match ${match.id}`);
        await storage.createActivity({
          matchId: match.id,
          userId: null,
          type: 'match_started',
          details: { 
            player1: { id: match.player1Id }, 
            player2: { id: user.id },
            market: match.market
          }
        });
        
        // Find opponent
        const opponent = await storage.getUser(match.player1Id);
        console.log(`[SERVER] Found opponent: ${opponent?.username || 'Unknown'} (ID: ${match.player1Id})`);
        
        // Notify both players
        const matchData = {
          id: match.id,
          player: {
            username: user.username,
            pnl: 0
          },
          opponent: {
            username: opponent?.username || 'Unknown',
            pnl: 0
          },
          market: match.market,
          duration: match.duration,
          startTime: updatedMatch.startTime?.getTime() || Date.now(),
          spectators: []
        };
        
        console.log(`[SERVER] Prepared match data for WebSocket: ${JSON.stringify(matchData)}`);
        
        // Notify player 2 (the invitee/joiner)
        console.log(`[SERVER] Broadcasting match_found event to player 2 (joiner): ${user.id}`);
        broadcastToUser(user.id, {
          type: 'match_found',
          match: matchData
        });
        
        // Notify player 1 (the inviter/host)
        console.log(`[SERVER] Broadcasting match_found event to player 1 (host): ${match.player1Id}`);
        broadcastToUser(match.player1Id, {
          type: 'match_found',
          match: {
            ...matchData,
            player: matchData.opponent,
            opponent: matchData.player
          }
        });
        
        console.log(`[SERVER] Both players notified about match ${match.id} via WebSocket`);
      } else {
        console.log(`[SERVER] WARNING: Failed to update match ${match.id}`);
      }
      
      console.log(`[SERVER] Match join successful: User ${user.id} joined match ${match.id}`);
      res.json({ status: 'joined', matchId: match.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post('/api/matches/:matchId/spectate', async (req: Request, res: Response) => {
    try {
      const { matchId } = req.params;
      const { address } = req.body;
      
      const match = await storage.getMatch(parseInt(matchId));
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      if (match.status !== 'active') {
        return res.status(400).json({ message: "This match is not active" });
      }
      
      // Get user or use anonymous name
      let username = 'Anonymous';
      if (address && typeof address === 'string') {
        const user = await storage.getUserByWalletAddress(address);
        if (user) {
          username = user.username;
        }
      }
      
      // Add spectator
      await storage.addSpectator(match.id, username);
      
      // Notify match participants
      broadcastToMatch(match.id, {
        type: 'spectate_join',
        matchId: match.id,
        spectator: username
      });
      
      res.json({ status: 'spectating', matchId: match.id });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post('/api/matches/:matchId/forfeit', async (req: Request, res: Response) => {
    try {
      const { matchId } = req.params;
      const { address } = walletAddressSchema.parse(req.body);
      
      const user = await storage.getUserByWalletAddress(address);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const match = await storage.getMatch(parseInt(matchId));
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      if (match.status !== 'active') {
        return res.status(400).json({ message: "This match is not active" });
      }
      
      if (match.player1Id !== user.id && match.player2Id !== user.id) {
        return res.status(403).json({ message: "You are not a participant in this match" });
      }
      
      // Determine winner and loser
      const isPlayer1 = match.player1Id === user.id;
      const winnerId = isPlayer1 ? match.player2Id : match.player1Id;
      const loserId = user.id;
      
      // Update match status
      const updatedMatch = await storage.updateMatch(match.id, {
        status: 'completed',
        endTime: new Date(),
        winnerId
      });
      
      if (updatedMatch) {
        // Update leaderboard entries
        await storage.updateLeaderboardEntry(winnerId, {
          wins: 1,
          totalMatches: 1,
          points: 25
        });
        
        await storage.updateLeaderboardEntry(loserId, {
          losses: 1,
          totalMatches: 1
        });
        
        // Create activity for match end
        await storage.createActivity({
          matchId: match.id,
          userId: null,
          type: 'match_ended',
          details: { 
            winner: { id: winnerId },
            loser: { id: loserId },
            forfeit: true
          }
        });
        
        // Get players
        const winner = await storage.getUser(winnerId);
        const loser = await storage.getUser(loserId);
        
        // Calculate rewards
        const tokenReward = 250;
        const xpReward = 75;
        const pointsReward = 25;
        
        // Update winner's tokens
        if (winner) {
          await storage.updateUser(winner.id, {
            arenaTokens: (winner.arenaTokens || 0) + tokenReward,
            xp: (winner.xp || 0) + xpReward
          });
        }
        
        // Prepare match summary for both players
        const baseMatchSummary = {
          stats: {
            ordersPlaced: 4, // Mock data
            winRate: 75,
            avgPositionSize: "0.018 BTC",
            biggestWin: 8.2
          },
          rewards: {
            tokens: tokenReward,
            xp: xpReward,
            leaderboardPoints: pointsReward,
            achievement: "First Win" // Only for first win
          }
        };
        
        // Notify winner
        broadcastToUser(winnerId, {
          type: 'match_ended',
          summary: {
            ...baseMatchSummary,
            playerPnl: match.player1Id === winnerId ? match.player1Pnl : match.player2Pnl,
            opponentPnl: match.player1Id === winnerId ? match.player2Pnl : match.player1Pnl,
            opponentName: loser?.username || 'Unknown'
          }
        });
        
        // Notify loser (forfeiter)
        broadcastToUser(loserId, {
          type: 'match_ended',
          summary: {
            ...baseMatchSummary,
            playerPnl: match.player1Id === loserId ? match.player1Pnl : match.player2Pnl,
            opponentPnl: match.player1Id === loserId ? match.player2Pnl : match.player1Pnl,
            opponentName: winner?.username || 'Unknown',
            rewards: {
              tokens: 0,
              xp: 10, // Smaller reward for participation
              leaderboardPoints: 0
            }
          }
        });
      }
      
      res.json({ status: 'forfeited', matchId: match.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post('/api/matches/rematch', async (req: Request, res: Response) => {
    try {
      const { address, opponent } = req.body;
      
      if (!address || typeof address !== 'string') {
        return res.status(400).json({ message: "Wallet address is required" });
      }
      
      if (!opponent || typeof opponent !== 'string') {
        return res.status(400).json({ message: "Opponent username is required" });
      }
      
      const user = await storage.getUserByWalletAddress(address);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const opponentUser = await storage.getUserByUsername(opponent);
      if (!opponentUser) {
        return res.status(404).json({ message: "Opponent not found" });
      }
      
      // Create a new match
      const market = chooseRandomMarket();
      const match = await storage.createMatch({
        matchCode: nanoid(8),
        status: 'pending',
        player1Id: user.id,
        market,
        duration: 1800, // 30 minutes
        isGroupMatch: false
      });
      
      // In a real app, you would send a notification to the opponent
      // Here we'll simulate acceptance immediately
      
      // Add opponent as player 2
      const updatedMatch = await storage.updateMatch(match.id, {
        player2Id: opponentUser.id,
        status: 'active',
        startTime: new Date()
      });
      
      if (updatedMatch) {
        // Create activity for match start
        await storage.createActivity({
          matchId: match.id,
          userId: null,
          type: 'match_started',
          details: { 
            player1: { id: user.id }, 
            player2: { id: opponentUser.id },
            market: match.market,
            isRematch: true
          }
        });
        
        // Notify both players
        const matchData = {
          id: match.id,
          player: {
            username: user.username,
            pnl: 0
          },
          opponent: {
            username: opponentUser.username,
            pnl: 0
          },
          market: match.market,
          duration: match.duration,
          startTime: updatedMatch.startTime?.getTime() || Date.now(),
          spectators: []
        };
        
        // Notify player 1
        broadcastToUser(user.id, {
          type: 'match_found',
          match: matchData
        });
        
        // Notify player 2 (swap player/opponent)
        broadcastToUser(opponentUser.id, {
          type: 'match_found',
          match: {
            ...matchData,
            player: matchData.opponent,
            opponent: matchData.player
          }
        });
      }
      
      res.json({ status: 'rematch_created', matchId: match.id });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get('/api/matches/:matchId/activity', async (req: Request, res: Response) => {
    try {
      const { matchId } = req.params;
      
      const match = await storage.getMatch(parseInt(matchId));
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      const activities = await storage.getMatchActivities(match.id);
      
      // Format activities for the client
      const formattedActivities = activities.map(activity => {
        const user = activity.userId 
          ? Array.from(storage.users.values()).find(u => u.id === activity.userId)?.username 
          : '';
        
        return {
          id: activity.id,
          type: activity.type,
          user: user || '',
          isCurrentUser: false, // This would be determined based on the client
          details: typeof activity.details === 'string' 
            ? activity.details 
            : (activity.details && 'details' in activity.details)
              ? activity.details.details
              : '',
          timestamp: activity.createdAt.getTime()
        };
      });
      
      res.json(formattedActivities);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Drift Protocol API Endpoints
  app.post('/api/drift/order', async (req: Request, res: Response) => {
    try {
      const { address, market, direction, amount, leverage } = req.body;
      
      if (!market || !direction || !amount || !leverage) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      
      if (direction !== 'long' && direction !== 'short') {
        return res.status(400).json({ message: "Direction must be 'long' or 'short'" });
      }
      
      // Find user if address is provided
      let user = null;
      if (address) {
        user = await storage.getUserByWalletAddress(address);
      }
      
      // Mock entry price (in a real app, would get from Drift)
      const entryPrice = getMockPrice(market);
      
      // Calculate position size
      const size = amount / entryPrice;
      
      // Calculate liquidation price
      const liquidationPrice = direction === 'long'
        ? entryPrice * (1 - 1 / leverage) * 0.95 // 5% buffer
        : entryPrice * (1 + 1 / leverage) * 1.05; // 5% buffer
      
      const position = {
        id: nanoid(),
        market,
        direction,
        size,
        leverage,
        entryPrice,
        liquidationPrice,
        pnl: 0,
        pnlUsd: 0
      };
      
      // Record trading activity if this is part of an active match
      if (user) {
        // Get active match if one exists
        const userMatches = await storage.getUserMatches(user.id);
        const activeMatch = userMatches.find(m => m.status === 'active');
        
        if (activeMatch) {
          // Create activity for opening a position
          await storage.createActivity({
            matchId: activeMatch.id,
            userId: user.id,
            type: 'open_position',
            details: { 
              market,
              direction,
              size,
              leverage,
              entryPrice
            }
          });
        }
      }
      
      res.json(position);
    } catch (error) {
      console.error("Error placing order:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post('/api/drift/close', async (req: Request, res: Response) => {
    try {
      const { address, positionId, market } = req.body;
      
      if (!positionId) {
        return res.status(400).json({ message: "Position ID is required" });
      }
      
      // Find user if address is provided
      let user = null;
      if (address) {
        user = await storage.getUserByWalletAddress(address);
      }
      
      // Generate a random PnL value between -5% and +15% for demonstration
      // In a real app, this would be calculated based on entry and exit prices
      const pnlPercentage = (Math.random() * 20) - 5;
      
      // Get market price for exit
      const exitPrice = getMockPrice(market || 'SOL/USDT');
      
      // Record trading activity if this is part of an active match
      if (user) {
        // Get active match if one exists
        const userMatches = await storage.getUserMatches(user.id);
        const activeMatch = userMatches.find(m => m.status === 'active');
        
        if (activeMatch) {
          // Create activity for closing a position
          await storage.createActivity({
            matchId: activeMatch.id,
            userId: user.id,
            type: 'close_position',
            details: { 
              positionId,
              exitPrice,
              pnl: pnlPercentage
            }
          });
          
          // Update match PnL for the user
          const isPlayer1 = activeMatch.player1Id === user.id;
          
          if (isPlayer1) {
            await storage.updateMatch(activeMatch.id, {
              player1Pnl: (activeMatch.player1Pnl || 0) + pnlPercentage
            });
          } else {
            await storage.updateMatch(activeMatch.id, {
              player2Pnl: (activeMatch.player2Pnl || 0) + pnlPercentage
            });
          }
        }
      }
      
      res.json({ 
        success: true, 
        positionId,
        pnl: pnlPercentage,
        exitPrice
      });
    } catch (error) {
      console.error("Error closing position:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get('/api/drift/price', async (req: Request, res: Response) => {
    try {
      const { market } = req.query;
      
      if (!market || typeof market !== 'string') {
        return res.status(400).json({ message: "Market parameter is required" });
      }
      
      const price = getMockPrice(market);
      
      res.json({ market, price });
    } catch (error) {
      console.error("Error getting price:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get user positions
  app.get('/api/drift/positions', async (req: Request, res: Response) => {
    try {
      const { address } = req.query;
      
      if (!address || typeof address !== 'string') {
        return res.status(400).json({ message: "Address parameter is required" });
      }
      
      const user = await storage.getUserByWalletAddress(address);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // For the demo, we'll return 0-2 mock positions
      const positions = [];
      const positionCount = Math.floor(Math.random() * 3); // 0, 1, or 2 positions
      
      for (let i = 0; i < positionCount; i++) {
        // Generate random position data
        const market = ['SOL/USDT', 'SOL/USDC', 'BTC/USDC', 'ETH/USDC'][Math.floor(Math.random() * 4)];
        const direction = Math.random() > 0.5 ? 'long' : 'short';
        const leverage = Math.floor(Math.random() * 10) + 1; // 1-10x leverage
        const entryPrice = getMockPrice(market);
        const size = (1000 * (Math.random() + 0.1)) / entryPrice; // Random size based on ~$1000 value
        const pnl = (Math.random() * 40) - 20; // -20% to +20% PnL
        const pnlUsd = (entryPrice * size) * (pnl / 100);
        
        // Generate liquidation price based on direction and leverage
        const liquidationPrice = direction === 'long'
          ? entryPrice * (1 - 1 / leverage) * 0.95 // 5% buffer
          : entryPrice * (1 + 1 / leverage) * 1.05; // 5% buffer
          
        positions.push({
          id: nanoid(),
          market,
          direction,
          size,
          leverage,
          entryPrice,
          liquidationPrice,
          pnl,
          pnlUsd
        });
      }
      
      res.json(positions);
    } catch (error) {
      console.error("Error getting positions:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Market history endpoint for chart data
  app.get('/api/drift/history', async (req: Request, res: Response) => {
    try {
      const { market, interval } = req.query;
      
      if (!market || typeof market !== 'string') {
        return res.status(400).json({ message: "Market parameter is required" });
      }
      
      // Generate mock historical price data
      // In a real app, this would come from a data provider or exchange API
      const basePrice = getMockPrice(market);
      const history = [];
      
      // Generate 100 data points
      const now = Date.now();
      let timeStep;
      
      switch (interval) {
        case '1m': timeStep = 60 * 1000; break;
        case '5m': timeStep = 5 * 60 * 1000; break;
        case '15m': timeStep = 15 * 60 * 1000; break;
        case '1h': timeStep = 60 * 60 * 1000; break;
        case '4h': timeStep = 4 * 60 * 60 * 1000; break;
        case '1d': timeStep = 24 * 60 * 60 * 1000; break;
        default: timeStep = 60 * 60 * 1000; // Default to 1h
      }
      
      for (let i = 99; i >= 0; i--) {
        const timestamp = now - (i * timeStep);
        const volatility = 0.005; // 0.5% volatility
        
        // Random walk price generation
        const changePercent = (Math.random() * 2 - 1) * volatility;
        const priceOffset = basePrice * changePercent * (100 - i) / 25;
        const price = basePrice + priceOffset;
        
        // Generate OHLC data
        const open = price * (1 + (Math.random() * 0.004 - 0.002));
        const high = Math.max(open, price) * (1 + Math.random() * 0.003);
        const low = Math.min(open, price) * (1 - Math.random() * 0.003);
        const close = price;
        const volume = Math.random() * 10000 + 5000;
        
        history.push({
          timestamp,
          open,
          high,
          low,
          close,
          volume
        });
      }
      
      res.json({ market, interval, history });
    } catch (error) {
      console.error("Error getting market history:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Leaderboard API
  app.get('/api/leaderboard', async (req: Request, res: Response) => {
    try {
      const leaderboardEntries = await storage.getLeaderboard();
      
      // Format leaderboard entries
      const formattedEntries = await Promise.all(
        leaderboardEntries.map(async entry => {
          const user = await storage.getUser(entry.userId);
          
          return {
            id: entry.userId,
            username: user?.username || 'Unknown',
            rank: entry.rank,
            winRate: user && entry.totalMatches > 0 
              ? Math.round((entry.wins / entry.totalMatches) * 100) 
              : 0,
            totalPnl: entry.totalPnl,
            arenaTokens: user?.arenaTokens || 0
          };
        })
      );
      
      // Sort by rank
      formattedEntries.sort((a, b) => a.rank - b.rank);
      
      res.json(formattedEntries);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Reels API
  app.get('/api/reels', async (req: Request, res: Response) => {
    try {
      const reels = await storage.getReels();
      
      // Format reels data
      const formattedReels = await Promise.all(
        reels.map(async reel => {
          const user = await storage.getUser(reel.userId);
          
          // Get match data if attached to a match
          let matchData = undefined;
          if (reel.matchId) {
            const match = await storage.getMatch(reel.matchId);
            if (match) {
              const isPlayer1 = match.player1Id === reel.userId;
              const playerPnl = isPlayer1 ? match.player1Pnl : match.player2Pnl;
              const opponentPnl = isPlayer1 ? match.player2Pnl : match.player1Pnl;
              const result = playerPnl > opponentPnl ? 'win' : 'loss';
              
              matchData = {
                finalPnl: playerPnl,
                opponent: isPlayer1 
                  ? (await storage.getUser(match.player2Id || 0))?.username || 'Unknown'
                  : (await storage.getUser(match.player1Id))?.username || 'Unknown',
                result
              };
            }
          }
          
          return {
            id: reel.id,
            author: {
              id: reel.userId,
              username: user?.username || 'Unknown',
              avatar: user?.avatar
            },
            caption: reel.caption || '',
            likes: reel.likes,
            comments: 0, // Would need a comments table in a real app
            videoUrl: reel.videoUrl,
            createdAt: reel.createdAt.toISOString(),
            matchData
          };
        })
      );
      
      res.json(formattedReels);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post('/api/reels', async (req: Request, res: Response) => {
    try {
      const { address, videoUrl, caption, matchId } = req.body;
      
      if (!address || typeof address !== 'string') {
        return res.status(400).json({ message: "Wallet address is required" });
      }
      
      if (!videoUrl || typeof videoUrl !== 'string') {
        return res.status(400).json({ message: "Video URL is required" });
      }
      
      const user = await storage.getUserByWalletAddress(address);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Validate match if provided
      if (matchId) {
        const match = await storage.getMatch(parseInt(matchId));
        if (!match) {
          return res.status(404).json({ message: "Match not found" });
        }
        
        if (match.player1Id !== user.id && match.player2Id !== user.id) {
          return res.status(403).json({ message: "You were not a participant in this match" });
        }
      }
      
      // Create reel
      const reel = await storage.createReel({
        userId: user.id,
        matchId: matchId ? parseInt(matchId) : undefined,
        videoUrl,
        caption: caption || ''
      });
      
      res.json({
        id: reel.id,
        videoUrl: reel.videoUrl,
        caption: reel.caption,
        createdAt: reel.createdAt.toISOString()
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get reel by ID
  app.get('/api/reels/:reelId', async (req: Request, res: Response) => {
    try {
      const { reelId } = req.params;
      
      if (!reelId || isNaN(parseInt(reelId))) {
        return res.status(400).json({ message: "Invalid reel ID" });
      }
      
      const reels = await storage.getReels();
      const reel = reels.find(r => r.id === parseInt(reelId));
      
      if (!reel) {
        return res.status(404).json({ message: "Reel not found" });
      }
      
      const user = await storage.getUser(reel.userId);
      
      // Get match data if attached to a match
      let matchData = undefined;
      if (reel.matchId) {
        const match = await storage.getMatch(reel.matchId);
        if (match) {
          const isPlayer1 = match.player1Id === reel.userId;
          const playerPnl = isPlayer1 ? match.player1Pnl : match.player2Pnl;
          const opponentPnl = isPlayer1 ? match.player2Pnl : match.player1Pnl;
          const result = playerPnl > opponentPnl ? 'win' : 'loss';
          
          matchData = {
            finalPnl: playerPnl,
            opponent: isPlayer1 
              ? (await storage.getUser(match.player2Id || 0))?.username || 'Unknown'
              : (await storage.getUser(match.player1Id))?.username || 'Unknown',
            result
          };
        }
      }
      
      const formattedReel = {
        id: reel.id,
        author: {
          id: reel.userId,
          username: user?.username || 'Unknown',
          avatar: user?.avatar
        },
        caption: reel.caption || '',
        likes: reel.likes,
        comments: 0,
        videoUrl: reel.videoUrl,
        createdAt: reel.createdAt?.toISOString() || new Date().toISOString(),
        matchData
      };
      
      res.json(formattedReel);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Update a reel
  app.put('/api/reels/:reelId', async (req: Request, res: Response) => {
    try {
      const { reelId } = req.params;
      const { address, caption } = req.body;
      
      if (!address || typeof address !== 'string') {
        return res.status(400).json({ message: "Wallet address is required" });
      }
      
      if (!reelId || isNaN(parseInt(reelId))) {
        return res.status(400).json({ message: "Invalid reel ID" });
      }
      
      const user = await storage.getUserByWalletAddress(address);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const reels = await storage.getReels();
      const reelIndex = reels.findIndex(r => r.id === parseInt(reelId));
      
      if (reelIndex === -1) {
        return res.status(404).json({ message: "Reel not found" });
      }
      
      const reel = reels[reelIndex];
      
      // Check if user owns the reel
      if (reel.userId !== user.id) {
        return res.status(403).json({ message: "You can only update your own reels" });
      }
      
      // Update reel
      reels[reelIndex] = {
        ...reel,
        caption: caption || reel.caption
      };
      
      res.json({
        id: reels[reelIndex].id,
        caption: reels[reelIndex].caption
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Delete a reel
  app.delete('/api/reels/:reelId', async (req: Request, res: Response) => {
    try {
      const { reelId } = req.params;
      const { address } = req.body;
      
      if (!address || typeof address !== 'string') {
        return res.status(400).json({ message: "Wallet address is required" });
      }
      
      if (!reelId || isNaN(parseInt(reelId))) {
        return res.status(400).json({ message: "Invalid reel ID" });
      }
      
      const user = await storage.getUserByWalletAddress(address);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const reels = await storage.getReels();
      const reelIndex = reels.findIndex(r => r.id === parseInt(reelId));
      
      if (reelIndex === -1) {
        return res.status(404).json({ message: "Reel not found" });
      }
      
      const reel = reels[reelIndex];
      
      // Check if user owns the reel
      if (reel.userId !== user.id) {
        return res.status(403).json({ message: "You can only delete your own reels" });
      }
      
      // Delete reel
      reels.splice(reelIndex, 1);
      
      res.json({ message: "Reel deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Like a reel
  app.post('/api/reels/:reelId/like', async (req: Request, res: Response) => {
    try {
      const { reelId } = req.params;
      const { address } = req.body;
      
      if (!address || typeof address !== 'string') {
        return res.status(400).json({ message: "Wallet address is required" });
      }
      
      if (!reelId || isNaN(parseInt(reelId))) {
        return res.status(400).json({ message: "Invalid reel ID" });
      }
      
      const user = await storage.getUserByWalletAddress(address);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Find and like the reel
      await storage.likeReel(parseInt(reelId));
      
      res.json({ message: "Reel liked successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Admin API endpoints
  // Middleware to check if user is admin
  const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden - Admin access required' });
      }
      
      next();
    } catch (error) {
      console.error('Error in admin authorization:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  // Feature flag management endpoints
  app.get('/api/admin/feature-flags', isAdmin, async (req: Request, res: Response) => {
    try {
      const featureFlags = await storage.getFeatureFlags();
      res.json(featureFlags);
    } catch (error) {
      console.error('Error fetching feature flags:', error);
      res.status(500).json({ error: 'Failed to fetch feature flags' });
    }
  });
  
  app.post('/api/admin/feature-flags', isAdmin, async (req: Request, res: Response) => {
    try {
      const validation = insertFeatureFlagSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }
      
      const featureFlag = await storage.createFeatureFlag(validation.data);
      res.status(201).json(featureFlag);
    } catch (error) {
      console.error('Error creating feature flag:', error);
      res.status(500).json({ error: 'Failed to create feature flag' });
    }
  });
  
  app.put('/api/admin/feature-flags/:id', isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const featureFlag = await storage.getFeatureFlag(id);
      
      if (!featureFlag) {
        return res.status(404).json({ error: 'Feature flag not found' });
      }
      
      const updatedFeatureFlag = await storage.updateFeatureFlag(id, req.body);
      res.json(updatedFeatureFlag);
    } catch (error) {
      console.error('Error updating feature flag:', error);
      res.status(500).json({ error: 'Failed to update feature flag' });
    }
  });
  
  app.delete('/api/admin/feature-flags/:id', isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const featureFlag = await storage.getFeatureFlag(id);
      
      if (!featureFlag) {
        return res.status(404).json({ error: 'Feature flag not found' });
      }
      
      await storage.deleteFeatureFlag(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting feature flag:', error);
      res.status(500).json({ error: 'Failed to delete feature flag' });
    }
  });
  
  // User management endpoints
  app.get('/api/admin/users', isAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });
  
  app.put('/api/admin/users/:id', isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Validate that the role is valid if it's being updated
      if (req.body.role && !['admin', 'moderator', 'user'].includes(req.body.role)) {
        return res.status(400).json({ error: 'Invalid role. Must be admin, moderator, or user' });
      }
      
      const updatedUser = await storage.updateUser(id, req.body);
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  });
  
  // Match management endpoints
  app.get('/api/admin/matches', isAdmin, async (req: Request, res: Response) => {
    try {
      const matches = await storage.getActiveMatches();
      res.json(matches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      res.status(500).json({ error: 'Failed to fetch matches' });
    }
  });
  
  app.put('/api/admin/matches/:id/end', isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const match = await storage.getMatch(id);
      
      if (!match) {
        return res.status(404).json({ error: 'Match not found' });
      }
      
      if (match.status !== 'active') {
        return res.status(400).json({ error: 'Match is not active' });
      }
      
      const playerPnl = match.player1Pnl || 0;
      const opponentPnl = match.player2Pnl || 0;
      
      // Determine winner
      let winnerId = null;
      if (playerPnl > opponentPnl) {
        winnerId = match.player1Id;
      } else if (opponentPnl > playerPnl) {
        winnerId = match.player2Id;
      }
      
      const updatedMatch = await storage.updateMatch(id, {
        status: 'completed',
        endTime: new Date(),
        winnerId
      });
      
      res.json(updatedMatch);
    } catch (error) {
      console.error('Error ending match:', error);
      res.status(500).json({ error: 'Failed to end match' });
    }
  });
  
  // System metrics endpoints
  app.get('/api/admin/system/metrics', isAdmin, async (req: Request, res: Response) => {
    try {
      const summary = await storage.getSystemMetricsSummary();
      res.json(summary);
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      res.status(500).json({ error: 'Failed to fetch system metrics' });
    }
  });
  
  app.get('/api/admin/system/metrics/history', isAdmin, async (req: Request, res: Response) => {
    try {
      const metrics = await storage.getSystemMetrics();
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching system metrics history:', error);
      res.status(500).json({ error: 'Failed to fetch system metrics history' });
    }
  });
  
  app.post('/api/admin/system/metrics', isAdmin, async (req: Request, res: Response) => {
    try {
      const validation = insertSystemMetricSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }
      
      const metric = await storage.createSystemMetric(validation.data);
      res.status(201).json(metric);
    } catch (error) {
      console.error('Error creating system metric:', error);
      res.status(500).json({ error: 'Failed to create system metric' });
    }
  });
  
  return httpServer;
}

// Helper functions
function chooseRandomMarket(): string {
  const markets = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'ADA/USDT'];
  return markets[Math.floor(Math.random() * markets.length)];
}

function getMockPrice(market: string): number {
  const basePrices: Record<string, number> = {
    'BTC/USDT': 26850,
    'ETH/USDT': 1650,
    'SOL/USDT': 75,
    'BNB/USDT': 220,
    'ADA/USDT': 0.38
  };
  
  // Random variation
  const basePrice = basePrices[market] || 100;
  const variation = (Math.random() - 0.5) * 0.02; // +/- 1% variation
  
  return basePrice * (1 + variation);
}



