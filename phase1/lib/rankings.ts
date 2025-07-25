import { supabase } from './supabase';

// Get weekly rankings
export async function getWeeklyRankings(weekNumber: number, year: number) {
  const { data, error } = await supabase
    .from('weekly_rankings')
    .select(`
      id,
      rank,
      points,
      user_id,
      users (
        id,
        wallet_address,
        username,
        avatar_url
      )
    `)
    .eq('week_number', weekNumber)
    .eq('year', year)
    .order('rank', { ascending: true });
    
  if (error) throw error;
  return data || [];
}

// Get current week number and year
export function getCurrentWeekInfo() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  
  const weekNumber = Math.ceil(days / 7);
  const year = now.getFullYear();
  
  return { weekNumber, year };
}

// Get user's ranking for specific week
export async function getUserRanking(userId: string, weekNumber: number, year: number) {
  const { data, error } = await supabase
    .from('weekly_rankings')
    .select('*')
    .eq('user_id', userId)
    .eq('week_number', weekNumber)
    .eq('year', year)
    .single();
    
  if (error && error.code !== 'PGRST116') { // PGRST116 is the "no rows returned" error
    throw error;
  }
  
  return data;
}

// Update or create weekly ranking (admin only)
export async function updateWeeklyRanking(rankingData: {
  user_id: string;
  week_number: number;
  year: number;
  rank: number;
  points: number;
}) {
  // Check if ranking exists
  const { data: existingRanking } = await supabase
    .from('weekly_rankings')
    .select('id')
    .eq('user_id', rankingData.user_id)
    .eq('week_number', rankingData.week_number)
    .eq('year', rankingData.year)
    .single();
  
  if (existingRanking) {
    // Update existing ranking
    const { data, error } = await supabase
      .from('weekly_rankings')
      .update({
        rank: rankingData.rank,
        points: rankingData.points
      })
      .eq('id', existingRanking.id)
      .select();
      
    if (error) throw error;
    return data;
  } else {
    // Create new ranking
    const { data, error } = await supabase
      .from('weekly_rankings')
      .insert(rankingData)
      .select();
      
    if (error) throw error;
    return data;
  }
}

// Get all-time top performers
export async function getAllTimeTopRankings(limit = 10) {
  // This is a more complex query that requires aggregation
  // Using Supabase's SQL execution capabilities
  const { data, error } = await supabase.rpc('get_all_time_top_rankings', { 
    row_limit: limit 
  });
  
  if (error) throw error;
  return data || [];
}
