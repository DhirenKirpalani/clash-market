import { supabase } from './supabase';

// Get all tournaments
export async function getTournaments() {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .order('start_date', { ascending: true });
    
  if (error) throw error;
  return data || [];
}

// Get a specific tournament
export async function getTournament(tournamentId: string) {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single();
    
  if (error) throw error;
  return data;
}

// Register user for tournament
export async function registerForTournament(tournamentId: string, userId: string) {
  const { data, error } = await supabase
    .from('participants')
    .insert({
      tournament_id: tournamentId,
      user_id: userId,
      status: 'registered'
    })
    .select();
    
  if (error) throw error;
  return data;
}

// Get tournament participants
export async function getTournamentParticipants(tournamentId: string) {
  const { data, error } = await supabase
    .from('participants')
    .select(`
      id,
      status,
      registration_date,
      users (
        id,
        wallet_address,
        username,
        avatar_url
      )
    `)
    .eq('tournament_id', tournamentId);
    
  if (error) throw error;
  return data || [];
}

// Check if user is registered for tournament
export async function isUserRegistered(tournamentId: string, userId: string) {
  const { data, error } = await supabase
    .from('participants')
    .select('id')
    .eq('tournament_id', tournamentId)
    .eq('user_id', userId)
    .single();
    
  if (error && error.code !== 'PGRST116') { // PGRST116 is the "no rows returned" error
    throw error;
  }
  
  return !!data;
}

// Create a tournament (admin only)
export async function createTournament(tournamentData: {
  name: string;
  start_date: string;
  end_date: string;
  prize_pool: number;
  status: 'upcoming' | 'active' | 'completed';
}) {
  const { data, error } = await supabase
    .from('tournaments')
    .insert(tournamentData)
    .select();
    
  if (error) throw error;
  return data;
}

// Update tournament status (admin only)
export async function updateTournamentStatus(tournamentId: string, status: 'upcoming' | 'active' | 'completed') {
  const { data, error } = await supabase
    .from('tournaments')
    .update({ status })
    .eq('id', tournamentId)
    .select();
    
  if (error) throw error;
  return data;
}

// Update participant status (admin only)
export async function updateParticipantStatus(
  participantId: string, 
  status: 'registered' | 'active' | 'eliminated' | 'winner'
) {
  const { data, error } = await supabase
    .from('participants')
    .update({ status })
    .eq('id', participantId)
    .select();
    
  if (error) throw error;
  return data;
}
