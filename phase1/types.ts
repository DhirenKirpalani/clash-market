// Define common types used across the application

export interface Player {
  id: string;
  username: string;
  walletAddress: string;
  pnl: number;
  status: string;
  rank: number;
}

export interface WalletState {
  connected: boolean;
  connecting: boolean;
  publicKey: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}
