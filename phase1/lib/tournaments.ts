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
  entry_fee?: number;
  max_participants?: number;
  registration_open?: boolean;
  is_private?: boolean;
}) {
  // Get the wallet address from localStorage
  const wallet = typeof window !== 'undefined' ? localStorage.getItem('walletAddress') : null;
  
  // Use the admin API route to bypass RLS
  const response = await fetch('/api/admin/tournaments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tournamentData,
      wallet,
    }),
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Failed to create tournament');
  }
  
  return result.data;
}

// Delete tournament (admin only)
export async function deleteTournament(tournamentId: string) {
  // Get the wallet address from localStorage
  const wallet = typeof window !== 'undefined' ? localStorage.getItem('walletAddress') : null;
  
  // Use the admin API route to bypass RLS
  const response = await fetch('/api/admin/tournaments', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tournamentId,
      wallet,
    }),
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Failed to delete tournament');
  }
  
  return result.data;
}

// Update tournament status or properties (admin only)
export async function updateTournamentStatus(tournamentId: string, updates: {
  status?: 'upcoming' | 'active' | 'completed',
  registration_open?: boolean,
  is_private?: boolean,
  prize_pool?: number,
  max_participants?: number,
  entry_fee?: number
}) {
  // Get the wallet address from localStorage
  const wallet = typeof window !== 'undefined' ? localStorage.getItem('walletAddress') : null;
  
  // Use the admin API route to bypass RLS
  const response = await fetch('/api/admin/tournaments', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tournamentId,
      updates,
      wallet,
    }),
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Failed to update tournament');
  }
  
  return result.data;
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
