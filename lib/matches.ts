import { supabase } from './supabase';

// Get recent PVP matches
export async function getRecentMatches(limit = 10) {
  const { data, error } = await supabase
    .from('pvp_matches')
    .select(`
      id,
      match_date,
      winner_id,
      loser_id,
      winner:winner_id (
        id,
        wallet_address, 
        username,
        avatar_url
      ),
      loser:loser_id (
        id,
        wallet_address,
        username, 
        avatar_url
      ),
      winner_score,
      loser_score
    `)
    .order('match_date', { ascending: false })
    .limit(limit);
    
  if (error) throw error;
  return data || [];
}

// Get matches for specific user
export async function getUserMatches(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('pvp_matches')
    .select(`
      id,
      match_date,
      winner_id,
      loser_id,
      winner:winner_id (
        id,
        wallet_address, 
        username,
        avatar_url
      ),
      loser:loser_id (
        id,
        wallet_address,
        username, 
        avatar_url
      ),
      winner_score,
      loser_score
    `)
    .or(`winner_id.eq.${userId},loser_id.eq.${userId}`)
    .order('match_date', { ascending: false })
    .limit(limit);
    
  if (error) throw error;
  return data || [];
}

// Record a new PVP match
export async function recordMatch(matchData: {
  winner_id: string;
  loser_id: string;
  winner_score: number;
  loser_score: number;
  match_data?: any; // Optional additional match data (JSON)
}) {
  const { data, error } = await supabase
    .from('pvp_matches')
    .insert({
      ...matchData,
      match_date: new Date().toISOString()
    })
    .select();
    
  if (error) throw error;
  return data;
}

// Get user stats (wins, losses, win rate)
export async function getUserStats(userId: string) {
  // Get wins
  const { count: wins, error: winsError } = await supabase
    .from('pvp_matches')
    .select('id', { count: 'exact', head: true })
    .eq('winner_id', userId);
    
  if (winsError) throw winsError;
  
  // Get losses
  const { count: losses, error: lossesError } = await supabase
    .from('pvp_matches')
    .select('id', { count: 'exact', head: true })
    .eq('loser_id', userId);
    
  if (lossesError) throw lossesError;
  
  // Calculate win rate with null checks
  const winCount = wins || 0;
  const lossCount = losses || 0;
  const totalMatches = winCount + lossCount;
  const winRate = totalMatches > 0 ? (winCount / totalMatches) * 100 : 0;
  
  return {
    wins: winCount,
    losses: lossCount,
    totalMatches,
    winRate: Math.round(winRate * 100) / 100 // Round to 2 decimal places
  };
}
