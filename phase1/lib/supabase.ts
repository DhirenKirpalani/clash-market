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

export { supabase };
