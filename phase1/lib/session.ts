'use server';

import { supabase } from './supabase';
import CryptoJS from 'crypto-js';

// IMPORTANT: This should be a server-side environment variable
// Never expose this in client-side code
// For development, we're using a placeholder - replace with env variable in production
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-very-secure-key';

/**
 * Securely store encrypted session data (private keys)
 * This function should only be used in server components or server actions
 */
export async function storeSessionData(userId: string, sessionData: any) {
  // Encrypt the session data
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(sessionData),
    ENCRYPTION_KEY
  ).toString();
  
  // Set expiration to 7 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  // Store in database
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      encrypted_session_data: encryptedData,
      expires_at: expiresAt.toISOString()
    })
    .select();
    
  if (error) throw error;
  return data;
}

/**
 * Retrieve and decrypt session data (private keys)
 * This function should only be used in server components or server actions
 */
export async function getSessionData(userId: string) {
  // Get most recent valid session
  const { data: session, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error || !session) return null;
  
  try {
    // Decrypt the data
    const decrypted = CryptoJS.AES.decrypt(
      session.encrypted_session_data,
      ENCRYPTION_KEY
    );
    
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  } catch (e) {
    console.error('Failed to decrypt session data', e);
    return null;
  }
}

/**
 * Delete expired sessions for a user
 */
export async function clearExpiredSessions(userId: string) {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('user_id', userId)
    .lt('expires_at', new Date().toISOString());
  
  if (error) console.error('Error clearing expired sessions:', error);
}

/**
 * Revoke a specific session
 */
export async function revokeSession(sessionId: string) {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', sessionId);
  
  if (error) throw error;
  return true;
}
