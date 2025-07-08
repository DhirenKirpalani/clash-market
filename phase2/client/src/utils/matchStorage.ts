// Match storage utility for CryptoClash
// Stores match data in localStorage to maintain state across page refreshes

// Types
export interface MatchPlayer {
  username: string;
  pnl: number;
  rank?: number;
}

export interface Match {
  id: string;
  player1: MatchPlayer;
  player2?: MatchPlayer;
  market: string;
  duration: number; // in seconds
  stake: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  startTime?: number; // timestamp when the match started
  endTime?: number; // timestamp when the match ended
  winner?: string; // id of the winning player
  gameCode?: string; // reference to the game code if created through invite
  createdAt: number; // timestamp when match was created
}

const MATCH_STORAGE_KEY = 'cryptoclash_matches';
const ACTIVE_MATCH_KEY = 'cryptoclash_active_match';

// Initialize storage if it doesn't exist
const initializeStorage = (): void => {
  if (!localStorage.getItem(MATCH_STORAGE_KEY)) {
    localStorage.setItem(MATCH_STORAGE_KEY, JSON.stringify({}));
  }
};

// Get all stored matches
export const getAllMatches = (): Record<string, Match> => {
  initializeStorage();
  const storedMatches = localStorage.getItem(MATCH_STORAGE_KEY);
  return JSON.parse(storedMatches || '{}');
};

// Get a specific match by ID
export const getMatch = (matchId: string): Match | undefined => {
  const matches = getAllMatches();
  return matches[matchId];
};

// Store a new match
export const storeMatch = (match: Match): void => {
  const matches = getAllMatches();
  
  matches[match.id] = {
    ...match,
    createdAt: match.createdAt || Date.now()
  };
  
  localStorage.setItem(MATCH_STORAGE_KEY, JSON.stringify(matches));
  
  // If this is a new match, store the user's match IDs for easy reference
  const userMatches = getUserMatches();
  if (!userMatches.includes(match.id)) {
    userMatches.push(match.id);
    localStorage.setItem('cryptoclash_user_matches', JSON.stringify(userMatches));
  }
};

// Get match IDs associated with the current user
export const getUserMatches = (): string[] => {
  const userMatches = localStorage.getItem('cryptoclash_user_matches') || '[]';
  return JSON.parse(userMatches);
};

// Update an existing match
export const updateMatch = (
  matchId: string,
  updates: Partial<Match>
): Match | undefined => {
  const matches = getAllMatches();
  
  if (!matches[matchId]) {
    return undefined;
  }
  
  matches[matchId] = {
    ...matches[matchId],
    ...updates
  };
  
  localStorage.setItem(MATCH_STORAGE_KEY, JSON.stringify(matches));
  return matches[matchId];
};

// Set/update the current active match
export const setActiveMatch = (match: Match | null): void => {
  if (match) {
    localStorage.setItem(ACTIVE_MATCH_KEY, JSON.stringify(match));
  } else {
    localStorage.removeItem(ACTIVE_MATCH_KEY);
  }
};

// Get the current active match
export const getActiveMatch = (): Match | null => {
  const activeMatch = localStorage.getItem(ACTIVE_MATCH_KEY);
  return activeMatch ? JSON.parse(activeMatch) : null;
};

// Delete a match
export const deleteMatch = (matchId: string): void => {
  const matches = getAllMatches();
  
  if (matches[matchId]) {
    delete matches[matchId];
    localStorage.setItem(MATCH_STORAGE_KEY, JSON.stringify(matches));
    
    // Also remove from user matches if present
    const userMatches = getUserMatches();
    const updatedUserMatches = userMatches.filter(id => id !== matchId);
    localStorage.setItem('cryptoclash_user_matches', JSON.stringify(updatedUserMatches));
  }
};

// Clean up old matches (optional, could be run periodically)
export const cleanupOldMatches = (olderThanDays = 7): void => {
  const matches = getAllMatches();
  const now = Date.now();
  const cutoff = now - (olderThanDays * 24 * 60 * 60 * 1000);
  
  let hasDeleted = false;
  
  // Remove matches older than the cutoff
  for (const id in matches) {
    if (matches[id].createdAt < cutoff) {
      delete matches[id];
      hasDeleted = true;
    }
  }
  
  if (hasDeleted) {
    localStorage.setItem(MATCH_STORAGE_KEY, JSON.stringify(matches));
  }
};

// Generate a unique match ID
export const generateMatchId = (): string => {
  return 'match_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};
