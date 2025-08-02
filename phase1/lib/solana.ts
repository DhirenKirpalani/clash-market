// Solana utilities and helper functions
export const SOLANA_NETWORK = 'devnet';
export const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

export const formatWalletAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const validateSolanaAddress = (address: string): boolean => {
  // Basic Solana address validation
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
};

export const mockTransferUSDC = async (
  fromWallet: string,
  toWallet: string,
  amount: number
): Promise<string> => {
  // Simulate USDC transfer
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return mock transaction signature
  return `${Math.random().toString(36).substring(2)}${Date.now()}`;
};
