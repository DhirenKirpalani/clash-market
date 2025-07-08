// Game code storage utility for CryptoClash
// This simulates a backend by storing game codes and their match details in localStorage

export interface GameCodeEntry {
  matchId: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  player1: string;
  player2?: string;
  market: string;
  duration: string;
  stake: string;
  createdAt: number; // timestamp
}

const STORAGE_KEY = 'cryptoclash_game_codes';

// Initialize storage if it doesn't exist
const initializeStorage = (): void => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({}));
  }
};

// Get all stored game codes
export const getAllGameCodes = (): Record<string, GameCodeEntry> => {
  initializeStorage();
  const storedCodes = localStorage.getItem(STORAGE_KEY);
  return JSON.parse(storedCodes || '{}');
};

// Store a new game code
export const storeGameCode = (
  code: string, 
  matchId: string,
  player1: string, 
  market: string, 
  duration: string,
  stake: string
): void => {
  const gameCodes = getAllGameCodes();
  
  gameCodes[code] = {
    matchId,
    status: 'pending',
    player1,
    market,
    duration,
    stake,
    createdAt: Date.now()
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gameCodes));
  
  // Also store which codes belong to this player for easy reference
  const playerCodes = localStorage.getItem('cryptoclash_player_codes') || '[]';
  const parsedPlayerCodes = JSON.parse(playerCodes);
  parsedPlayerCodes.push(code);
  localStorage.setItem('cryptoclash_player_codes', JSON.stringify(parsedPlayerCodes));
};

// Get a specific game code entry
export const getGameCode = (code: string): GameCodeEntry | undefined => {
  const gameCodes = getAllGameCodes();
  return gameCodes[code];
};

// Update a game code status (e.g., when player 2 joins)
export const updateGameCodeStatus = (
  code: string, 
  status: 'pending' | 'active' | 'completed' | 'cancelled',
  player2?: string
): GameCodeEntry | undefined => {
  const gameCodes = getAllGameCodes();
  
  if (!gameCodes[code]) {
    return undefined;
  }
  
  gameCodes[code] = {
    ...gameCodes[code],
    status,
    ...(player2 ? { player2 } : {})
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gameCodes));
  return gameCodes[code];
};

// Clean up old codes (optional, could be run periodically)
export const cleanupOldCodes = (): void => {
  const gameCodes = getAllGameCodes();
  const now = Date.now();
  const oneHourInMs = 60 * 60 * 1000;
  
  // Remove codes older than 1 hour
  for (const code in gameCodes) {
    if (now - gameCodes[code].createdAt > oneHourInMs) {
      delete gameCodes[code];
    }
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gameCodes));
};

// Generate a random game code
export const generateGameCode = (): string => {
  // List of crypto-related terms for more memorable codes
  const terms = ['BTC', 'ETH', 'SOL', 'DOGE', 'AVAX', 'LINK', 'DOT', 'ADA', 'XRP', 'MATIC'];
  const randomTerm = terms[Math.floor(Math.random() * terms.length)];
  const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${randomTerm}-${randomChars}`;
};
