// Define window with Phantom extension
interface WindowWithSolana extends Window {
  solana?: PhantomProvider;
}

// Interface for Phantom wallet
interface PhantomProvider {
  isPhantom?: boolean;
  connect: ({ onlyIfTrusted }: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  on: (event: string, callback: (args: any) => void) => void;
  off: (event: string, callback: (args: any) => void) => void;
  isConnected: boolean;
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  signTransaction: (transaction: any) => Promise<any>;
  signAllTransactions: (transactions: any[]) => Promise<any[]>;
}

// Get the Phantom provider from window
const getProvider = (): PhantomProvider | null => {
  try {
    if (typeof window === "undefined") return null;
    
    const solanaWindow = window as WindowWithSolana;
    
    if (solanaWindow.solana?.isPhantom) {
      return solanaWindow.solana;
    }
    return null;
  } catch (error) {
    console.error("Error getting Phantom provider:", error);
    return null;
  }
};

// Wallet Adapter Class
export class WalletAdapter {
  provider: PhantomProvider | null;
  connected: boolean;
  address: string | null;

  constructor() {
    this.provider = getProvider();
    this.connected = this.provider?.isConnected || false;
    this.address = null;
  }

  connect = async (): Promise<string | null> => {
    // Re-check the provider in case it was initialized after page load
    this.provider = getProvider();
    
    if (!this.provider) {
      console.error("Phantom wallet not found");
      throw new Error("Phantom wallet not installed or detected. Please install Phantom wallet extension.");
    }

    try {
      const response = await this.provider.connect({ onlyIfTrusted: false });
      this.address = response.publicKey.toString();
      this.connected = true;
      return this.address;
    } catch (error: any) {
      console.error("Error connecting to wallet:", error);
      // Provide more descriptive error messages
      if (error.message?.includes("User rejected")) {
        throw new Error("Connection rejected by user");
      } else {
        throw new Error(error.message || "Failed to connect to Phantom wallet");
      }
    }
  };

  disconnect = async (): Promise<void> => {
    if (!this.provider) return;

    try {
      await this.provider.disconnect();
      this.address = null;
      this.connected = false;
    } catch (error: any) {
      console.error("Error disconnecting from wallet:", error);
      throw new Error(error.message || "Failed to disconnect wallet");
    }
  };

  signMessage = async (message: string): Promise<Uint8Array> => {
    if (!this.provider || !this.address) {
      throw new Error("Wallet not connected. Please connect your wallet first.");
    }

    try {
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await this.provider.signMessage(encodedMessage);
      return signedMessage.signature;
    } catch (error: any) {
      console.error("Error signing message:", error);
      if (error.message?.includes("User rejected")) {
        throw new Error("Message signing rejected by user");
      } else {
        throw new Error(error.message || "Failed to sign message");
      }
    }
  };

  getBalance = async (): Promise<{ sol: number; arena: number }> => {
    if (!this.address) return { sol: 0, arena: 0 };

    try {
      return {
        sol: 2.45,
        arena: 750,
      };
    } catch (error) {
      console.error("Error fetching balance:", error);
      return { sol: 0, arena: 0 };
    }
  };
}

export const walletAdapter = new WalletAdapter();
