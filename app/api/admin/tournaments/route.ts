import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Helper function to verify admin status - checks wallet address directly in the database
async function isAdmin(wallet: string): Promise<boolean> {
  if (!wallet) return false;
  
  // We need to check admin status directly from the database
  const { data, error } = await supabase
    .from('users')
    .select('is_admin')
    .eq('wallet_address', wallet)
    .single();
  
  if (error) {
    console.error('Admin verification error:', error);
    return false;
  }
  
  return data?.is_admin === true;
}

// POST handler for creating tournaments
export async function POST(request: Request) {
  try {
    const { tournamentData, wallet } = await request.json();
    
    // Verify admin status by checking wallet address in users table
    const adminStatus = await isAdmin(wallet);
    
    if (!adminStatus) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin privileges required' },
        { status: 403 }
      );
    }
    
    // Using SQL query directly to bypass RLS
    const { data, error } = await supabase
      .from('tournaments')
      .insert(tournamentData)
      .select();
    
    if (error) {
      console.error('Error creating tournament:', error);
      return NextResponse.json(
        { error: `Failed to create tournament: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Tournament creation error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}

// PATCH handler for updating tournaments
export async function PATCH(request: Request) {
  try {
    const { tournamentId, updates, wallet } = await request.json();
    
    // Verify admin status by checking wallet address directly in users table
    const adminStatus = await isAdmin(wallet);
    
    if (!adminStatus) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin privileges required' },
        { status: 403 }
      );
    }
    
    // Update tournament directly with updated timestamp
    const { data, error } = await supabase
      .from('tournaments')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', tournamentId)
      .select();
    
    if (error) {
      console.error('Error updating tournament:', error);
      return NextResponse.json(
        { error: `Failed to update tournament: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Tournament update error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}

// DELETE handler for removing tournaments
export async function DELETE(request: Request) {
  try {
    const { tournamentId, wallet } = await request.json();
    
    // Verify admin status by checking wallet address directly in users table
    const adminStatus = await isAdmin(wallet);
    
    if (!adminStatus) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin privileges required' },
        { status: 403 }
      );
    }
    
    // Delete tournament directly
    const { data, error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', tournamentId)
      .select();
    
    if (error) {
      console.error('Error deleting tournament:', error);
      return NextResponse.json(
        { error: `Failed to delete tournament: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Tournament deletion error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
