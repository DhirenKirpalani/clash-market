import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id;

    if (!gameId) {
      return NextResponse.json({ message: 'Game ID is required' }, { status: 400 });
    }

    // Set the start time to now
    const now = new Date().toISOString();
    
    // Update the game's start_time and status using game_code
    const { data, error } = await supabase
      .from('games')
      .update({
        start_time: now,
        status: 'active' // Update status to active when countdown starts
      })
      .eq('game_code', gameId) // Using game_code instead of id
      .select();

    if (error) {
      console.error('Error starting game countdown:', error);
      return NextResponse.json({ 
        message: `Failed to start game: ${error.message || 'Database error'}`, 
        details: error 
      }, { status: 500 });
    }
    
    // Check if any data was returned/updated
    if (!data || data.length === 0) {
      console.error('No game found with ID:', gameId);
      return NextResponse.json({ 
        message: `Failed to start game: No game found with ID ${gameId}` 
      }, { status: 404 });
    }

    return NextResponse.json({ success: true, game: data[0] });
    
  } catch (error) {
    console.error('Unexpected error in startGame:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
