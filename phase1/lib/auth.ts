import { supabase } from './supabase';

// Keep for backward compatibility, but we'll bypass this for Phantom wallets
export function normalizeWalletAddress(address: string): string {
  // For Phantom wallet addresses (which start with a specific format), keep original format
  // Phantom addresses typically start with a base58 encoded string
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    console.log('Detected Phantom wallet, preserving original format');
    return address;
  }
  
  // For other addresses (like Ethereum), normalize to lowercase and trim
  return address.toLowerCase().trim();
}

// Connect wallet and store user in database
export async function connectWallet(walletAddress: string) {
  try {
    // We're now using the original wallet address format directly
    console.log('connectWallet called with address:', walletAddress);
    
    // Check if user exists - use the same approach as getUserByWalletAddress
    console.log('Checking if user exists...');
    const { data, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress);
    
    if (checkError) {
      console.error('Error checking user:', checkError);
      throw checkError;
    }
    
    console.log('User lookup result:', { count: data?.length || 0, data });
    
    // Check if user exists
    const existingUser = data && data.length > 0 ? data[0] : null;
    console.log('Existing user check result:', existingUser ? `Found user with ID: ${existingUser.id}` : 'No user found');
    
    if (!existingUser) {
      // Create new user if doesn't exist
      console.log('Creating new user with wallet address:', walletAddress);
      const { error: insertError } = await supabase
        .from('users')
        .insert({ wallet_address: walletAddress });
      
      if (insertError) {
        console.error('Error creating user:', insertError);
        throw insertError;
      }
      console.log('User created successfully');
    } else {
      // Update last login time
      console.log('Updating existing user...');
      const { error: updateError } = await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('wallet_address', walletAddress);
      
      if (updateError) {
        console.error('Error updating user:', updateError);
        throw updateError;
      }
      console.log('User updated successfully');
    }
    
    // Get fresh user data
    console.log('Fetching user data...');
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();
    
    if (fetchError) {
      console.error('Error fetching user:', fetchError);
      throw fetchError;
    }
    
    console.log('User data fetched:', user);
    return user;
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
}

// Get user by wallet address
export async function getUserByWalletAddress(walletAddress: string) {
  try {
    // We're now using the original wallet address format directly
    console.log('getUserByWalletAddress called with address:', walletAddress);
    
    // Don't use single() for the initial check as it causes PGRST116 errors
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress);
    
    if (error) {
      console.error('Database error getting user:', error);
      throw error;
    }
    
    // If no user found, return null (not an error)
    if (!data || data.length === 0) {
      console.log('No user found with wallet address:', walletAddress);
      return null;
    }
    
    // Return the first matching user
    return data[0];
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// Update user profile
export async function updateUserProfile(userId: string, updates: { username?: string, avatar_url?: string }) {
  try {
    console.log('Updating user profile:', { userId, updates });
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select();
    
    if (error) {
      console.error('Error updating profile by ID:', error);
      throw error;
    }
    
    console.log('Profile updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

// Update user profile by wallet address
export async function updateUserProfileByWallet(walletAddress: string, updates: { username?: string, avatar_url?: string }) {
  try {
    // We use the original wallet address format
    console.log('Updating user profile by wallet:', { walletAddress, updates });
    
    // First, check if the user exists
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress);
      
    if (!userData || userData.length === 0) {
      console.error('User not found with wallet address:', walletAddress);
      throw new Error('User not found');
    }
    
    // Update the user record
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('wallet_address', walletAddress)
      .select();
    
    if (error) {
      console.error('Error updating profile by wallet address:', error);
      throw error;
    }
    
    console.log('Profile updated successfully by wallet address:', data);
    return data;
  } catch (error) {
    console.error('Error updating profile by wallet address:', error);
    throw error;
  }
}
