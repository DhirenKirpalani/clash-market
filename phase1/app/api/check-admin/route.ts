import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { wallet } = await request.json();
    
    console.log('Admin API: Checking wallet address:', wallet);
    
    if (!wallet) {
      console.log('Admin API: No wallet provided');
      return NextResponse.json({ isAdmin: false }, { status: 400 });
    }
    
    // Query the database to check if the user with this wallet is an admin
    const { data, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('wallet_address', wallet)
      .single();
    
    if (error) {
      console.error('Admin API: Database error:', error);
      return NextResponse.json({ isAdmin: false, error: 'Database error' }, { status: 500 });
    }
    
    const isAdmin = data?.is_admin === true;
    console.log('Admin API: Is admin?', isAdmin, 'DB result:', data);
    
    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('Admin API: Error processing request:', error);
    return NextResponse.json({ isAdmin: false, error: 'Invalid request' }, { status: 400 });
  }
}
