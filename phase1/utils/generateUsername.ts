// Gaming-themed adjectives and nouns for username generation
const adjectives = [
  'Epic', 'Mystic', 'Fierce', 'Shadow', 'Neon', 'Cyber', 'Quantum', 'Alpha', 
  'Omega', 'Cosmic', 'Hyper', 'Radiant', 'Void', 'Crimson', 'Electric',
  'Stellar', 'Brave', 'Frost', 'Mighty', 'Thunder', 'Stealth', 'Blazing'
];

const nouns = [
  'Warrior', 'Ninja', 'Phoenix', 'Dragon', 'Hunter', 'Phantom', 'Knight',
  'Titan', 'Wizard', 'Sniper', 'Blaze', 'Rogue', 'Ghost', 'Striker',
  'Legend', 'Viper', 'Wolf', 'Eagle', 'Raptor', 'Panther', 'Cobra'
];

/**
 * Generate a random gaming-themed username with an optional number suffix
 * Uses a deterministic approach based on the wallet address to ensure the same user gets the same name
 */
export function generateUsername(seed: string): string {
  // Create a simple hash from the seed (wallet address)
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Use absolute value of hash
  hash = Math.abs(hash);
  
  // Select adjective and noun based on hash
  const adjective = adjectives[hash % adjectives.length];
  const noun = nouns[(hash >> 8) % nouns.length];
  
  // Add a number suffix (0-999) for additional uniqueness
  const numberSuffix = (hash >> 16) % 1000;
  
  return `${adjective}${noun}${numberSuffix}`;
}
