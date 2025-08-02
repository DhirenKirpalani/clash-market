export interface Player {
  id: string;
  username: string;
  walletAddress: string;
  pnl: number;
  status: 'active' | 'liquidated' | 'disqualified' | 'trading' | 'struggling';
  rank: number;
}

export interface Challenge {
  id: string;
  name: string;
  entryFee: number;
  currency: string;
  startTime: Date;
  endTime: Date;
  totalPool: number;
  playerCount: number;
  allowedMarkets: string[];
  prizeStructure: {
    first: number;
    second: number;
    third: number;
  };
  platformFee: number;
}

export interface WalletState {
  connected: boolean;
  connecting: boolean;
  publicKey: string | null;
  disconnect: () => void;
  connect: () => Promise<void>;
}

export interface RegistrationData {
  username: string;
  walletAddress: string;
  challengeId: string;
  entryFeePaid: boolean;
}
