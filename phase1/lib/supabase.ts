import { createClient } from '@supabase/supabase-js';

// These values should be stored in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Debug log environment variables (only URLs, not keys)
console.log('Supabase URL loaded:', supabaseUrl ? 'Yes' : 'No');

// Check if values are empty
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing!');
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Set auth session for a specific user ID
 * This is used to authenticate requests for RLS policies
 */
export async function setAuthSession(userId: string) {
  try {
    // For client-side authentication with Supabase, we need to create a session
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${userId}@example.com`,
      password: 'password123',
    });
    
    if (error) {
      console.error('Error setting auth session:', error);
      return false;
    }
    
    console.log('Auth session set successfully for user:', userId);
    return true;
  } catch (error) {
    console.error('Error setting auth session:', error);
    return false;
  }
}

/**
 * Clear the current auth session
 */
export async function clearAuthSession() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error clearing auth session:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error clearing auth session:', error);
    return false;
  }
}

/**
 * Alternative approach: Pass service role key for admin operations
 */
export const adminSupabase = supabase;

export { supabase };
