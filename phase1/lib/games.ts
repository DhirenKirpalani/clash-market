import { supabase } from './supabase';

// Get all active PvP games
export async function getActiveGames(limit = 10) {
  const { data, error } = await supabase
    .from('games')
    .select(`
      id,
      game_code,
      creator_id,
      opponent_id,
      principal_amount,
      pot_amount,
      status,
      is_private,
      token,
      duration,
      creator:creator_id (
        id,
        wallet_address, 
        username,
        avatar_url
      ),
      opponent:opponent_id (
        id,
        wallet_address,
        username, 
        avatar_url
      ),
      start_time,
      end_time,
      created_at
    `)
    .in('status', ['created', 'joined', 'active'])
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (error) throw error;
  return data || [];
}

// Get games created by or participated in by a specific user
export async function getUserGames(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('games')
    .select(`
      id,
      game_code,
      creator_id,
      opponent_id,
      principal_amount,
      pot_amount,
      status,
      winner_id,
      creator:creator_id (
        id,
        wallet_address, 
        username,
        avatar_url
      ),
      opponent:opponent_id (
        id,
        wallet_address,
        username, 
        avatar_url
      ),
      start_time,
      end_time,
      created_at
    `)
    .or(`creator_id.eq.${userId},opponent_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (error) throw error;
  return data || [];
}

// Create a new PvP game
export async function createGame(gameData: {
  creator_id: string; // This can be wallet address or user ID
  principal_amount: number;
  pot_amount: number;
  token?: string; // Token type (e.g., SOL, USDC)
  duration?: number; // Game duration in seconds
  is_private?: boolean; // Whether it's a private game or not
  game_code?: string | null; // Game code for private games (generated in UI) or null for public
}) {
  // First, let's check if creator_id is a UUID or wallet address
  // If it looks like a wallet address, get the user ID from it
  let creatorUUID = gameData.creator_id;
  
  // Simple UUID format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(gameData.creator_id)) {
    // Likely a wallet address, let's fetch the user ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', gameData.creator_id)
      .single();
      
    if (userError || !userData) {
      throw new Error(`User not found for wallet address: ${gameData.creator_id}`);
    }
    
    creatorUUID = userData.id;
  }
  
  // Use the game_code from UI for private games, null for public games
  const isPrivate = gameData.is_private || false;
  
  // If frontend sends a game_code and it's private, use it; otherwise for private games with no
  // code provided, generate one; for public games, always use null
  let gameCode = null;
  if (isPrivate) {
    gameCode = gameData.game_code || Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  
  // Prepare game data with the new columns
  const gameInsertData = {
    creator_id: creatorUUID, // Use the UUID instead of wallet address
    principal_amount: gameData.principal_amount,
    pot_amount: gameData.pot_amount,
    token: gameData.token || 'SOL', // Default to SOL if not specified
    duration: gameData.duration || 300, // Default to 5 minutes (300 seconds)
    is_private: isPrivate,
    game_code: gameCode, // Will be null for public games or UI-provided/generated for private
    status: 'created',
    start_time: null,
    end_time: null
  };
  
  const { data, error } = await supabase
    .from('games')
    .insert(gameInsertData)
    .select();
    
  if (error) throw error;
  return data?.[0] || null;
}

// Join an existing PvP game
export async function joinGame(gameId: string, opponentId: string) {
  // Convert wallet address to UUID if needed
  let opponentUUID = opponentId;
  
  // Simple UUID format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(opponentId)) {
    // Likely a wallet address, let's fetch the user ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', opponentId)
      .single();
      
    if (userError || !userData) {
      throw new Error(`User not found for wallet address: ${opponentId}`);
    }
    
    opponentUUID = userData.id;
  }
  
  const { data, error } = await supabase
    .from('games')
    .update({
      opponent_id: opponentUUID,
      status: 'joined'
    })
    .eq('id', gameId)
    .eq('status', 'created') // Can only join a game that's in 'created' status
    .select();
    
  if (error) throw error;
  return data?.[0] || null;
}

// Join a private PvP game by code
export async function joinGameByCode(gameCode: string, opponentId: string) {
  // Convert wallet address to UUID if needed
  let opponentUUID = opponentId;
  
  // Simple UUID format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(opponentId)) {
    // Likely a wallet address, let's fetch the user ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', opponentId)
      .single();
      
    if (userError || !userData) {
      throw new Error(`User not found for wallet address: ${opponentId}`);
    }
    
    opponentUUID = userData.id;
  }
  
  const { data, error } = await supabase
    .from('games')
    .update({
      opponent_id: opponentUUID,
      status: 'joined'
    })
    .eq('game_code', gameCode)
    .eq('status', 'created') // Can only join a game that's in 'created' status
    .select();
    
  if (error) throw error;
  return data?.[0] || null;
}

// Start a PvP game (when both players are ready)
export async function startGame(gameId: string) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('games')
    .update({
      status: 'active',
      start_time: now
    })
    .eq('id', gameId)
    .eq('status', 'joined') // Can only start a game that's in 'joined' status
    .select();
    
  if (error) throw error;
  return data?.[0] || null;
}

// Complete a PvP game with a winner
export async function completeGame(gameId: string, winnerId: string) {
  // Convert wallet address to UUID if needed
  let winnerUUID = winnerId;
  
  // Simple UUID format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(winnerId)) {
    // Likely a wallet address, let's fetch the user ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', winnerId)
      .single();
      
    if (userError || !userData) {
      throw new Error(`User not found for wallet address: ${winnerId}`);
    }
    
    winnerUUID = userData.id;
  }
  
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('games')
    .update({
      status: 'completed',
      end_time: now,
      winner_id: winnerUUID
    })
    .eq('id', gameId)
    .eq('status', 'active') // Can only complete a game that's in 'active' status
    .select();
    
  if (error) throw error;
  return data?.[0] || null;
}

// Cancel a PvP game (only the creator or opponent can cancel)
export async function cancelGame(gameId: string) {
  const { error } = await supabase
    .from('games')
    .update({ status: 'canceled' })
    .eq('id', gameId);

  if (error) throw error;
  return true;
}

// Edit a PvP game's properties (for creator only)
export async function editGame(gameId: string, updates: {
  principal_amount?: number;
  pot_amount?: number;
  token?: string;
  duration?: number;
  is_private?: boolean;
  game_code?: string | null;
}) {
  // Validate the updates
  if (updates.is_private === false) {
    // Make sure game_code is null for public games
    updates.game_code = null;
  }
  
  const { error } = await supabase
    .from('games')
    .update(updates)
    .eq('id', gameId);

  if (error) throw error;
  return true;
}

// Get a specific game by ID
export async function getGameById(gameId: string) {
  const { data, error } = await supabase
    .from('games')
    .select(`
      id,
      game_code,
      creator_id,
      opponent_id,
      principal_amount,
      pot_amount,
      status,
      winner_id,
      creator:creator_id (
        id,
        wallet_address, 
        username,
        avatar_url
      ),
      opponent:opponent_id (
        id,
        wallet_address,
        username, 
        avatar_url
      ),
      start_time,
      end_time,
      game_data,
      created_at
    `)
    .eq('id', gameId)
    .single();
    
  if (error) throw error;
  return data || null;
}
