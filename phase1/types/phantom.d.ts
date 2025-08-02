interface Window {
  solana?: {
    isPhantom?: boolean;
    connect: () => Promise<{ publicKey: { toString: () => string } }>;
    disconnect: () => Promise<void>;
    on: (event: 'connect' | 'disconnect' | 'accountChanged', callback: () => void) => void;
    signMessage?: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  }
}
