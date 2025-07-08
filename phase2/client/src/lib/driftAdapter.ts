// import { useState, useEffect, useCallback } from "react";
// import { apiRequest } from "@/lib/queryClient";
// import { useWallet } from "@/hooks/useWallet";
// import { Connection, PublicKey, Keypair } from "@solana/web3.js";
// import { 
//   DriftClient, 
//   initialize, 
//   BulkAccountLoader, 
//   getUserAccountPublicKey,
//   convertToNumber,
//   PositionDirection,
//   QUOTE_PRECISION
// } from "@drift-labs/sdk";
// import { BN } from "@project-serum/anchor";

// // Type definitions for Drift SDK handling
// type DriftClientInstance = {
//   getUserAccount: () => Promise<any>;
//   getPerpMarketAccount: (marketIndex: number) => any;
//   unsubscribe: () => void;
//   subscribe: () => Promise<void>;
// };

// // Position type
// export type Position = {
//   id: string;
//   market: string;
//   direction: 'long' | 'short';
//   size: number;
//   leverage: number;
//   entryPrice: number;
//   liquidationPrice: number;
//   pnl: number;
//   pnlUsd: number;
// };

// // Order type
// export type OrderParams = {
//   market: string;
//   direction: 'long' | 'short';
//   amount: number;
//   leverage: number;
// };

// // Available trading pairs
// export const TRADING_PAIRS = [
//   'SOL/USDT',
//   'SOL/USDC',
//   'BTC/USDC',
//   'ETH/USDC'
// ];

// // Market mapping between our market notation and Drift's
// // Using fixed market indices for Devnet
// const MARKET_MAP: Record<string, number> = {
//   'SOL/USDT': 1, // Mapping to SOL market index on Devnet
//   'SOL/USDC': 1, // Same as SOL/USDT since USDT and USDC are treated the same on Drift
//   'BTC/USDC': 0, // Mapping to BTC market index on Devnet
//   'ETH/USDC': 2  // Mapping to ETH market index on Devnet
// };

// // Devnet RPC endpoint
// const SOLANA_RPC_URL = 'https://api.devnet.solana.com';

// // Drift Protocol adapter
// export const useDrift = () => {
//   const { connected, address } = useWallet();
//   const [driftClient, setDriftClient] = useState<DriftClient | null>(null);
//   const [positions, setPositions] = useState<Position[]>([]);
//   const [isInitialized, setIsInitialized] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   // Initialize Drift client
//   const initializeDrift = useCallback(async () => {
//     if (!connected || !address) return;
    
//     try {
//       setIsLoading(true);
      
//       // For demo purposes, we'll use server API instead of actual Drift client
//       // In a real implementation with working wallet, we would initialize the Drift client
      
//       console.log("Wallet connected:", address);
      
//       // Mock a successful initialization
//       setTimeout(() => {
//         setIsInitialized(true);
//         setIsLoading(false);
//       }, 500);
      
//       // We won't fetch initial positions here since we're using server API
      
//     } catch (error) {
//       console.error("Failed to initialize Drift client:", error);
//       setIsLoading(false);
//     }
//   }, [connected, address]);
  
//   // Clean up Drift client on unmount
//   useEffect(() => {
//     return () => {
//       if (driftClient) {
//         driftClient.unsubscribe();
//       }
//     };
//   }, [driftClient]);
  
//   // Initialize Drift client when wallet is connected
//   useEffect(() => {
//     if (connected && address && !isInitialized && !isLoading) {
//       initializeDrift();
//     }
//   }, [connected, address, isInitialized, isLoading, initializeDrift]);
  
//   // Fetch user positions
//   const fetchPositions = async (_client: any = null) => {
//     if (!connected || !address) return [];
    
//     try {
//       // Since we're relying on server-side data, we'll fetch positions from the API
//       const response = await apiRequest(`/api/drift/positions?address=${address}`);
//       let positions: Position[] = [];
      
//       try {
//         positions = await response.json();
//       } catch (error) {
//         // If the endpoint doesn't exist yet, use an empty array
//         positions = [];
//       }
      
//       setPositions(positions);
//       return positions;
//     } catch (error) {
//       console.error("Failed to fetch positions:", error);
//       return [];
//     }
//   };
  
//   // Place an order on Drift
//   const placeOrder = async (params: OrderParams): Promise<Position | null> => {
//     if (!connected || !address) {
//       throw new Error("Wallet not connected");
//     }
    
//     const { market, direction, amount, leverage } = params;
    
//     try {
//       // Send the order to our server-side API
//       const orderParams = {
//         address,
//         market,
//         direction,
//         amount,
//         leverage
//       };
      
//       const response = await apiRequest({
//         url: '/api/drift/order',
//         method: 'POST',
//         body: orderParams
//       });
//       const newPosition = await response.json();
      
//       // Update positions
//       await fetchPositions();
      
//       return newPosition;
//     } catch (error) {
//       console.error("Failed to place order:", error);
//       throw error;
//     }
//   };
  
//   // Close position
//   const closePosition = async (positionId: string): Promise<void> => {
//     if (!connected || !address) {
//       throw new Error("Wallet not connected");
//     }
    
//     try {
//       // Send the close request to our server-side API
//       const closeParams = {
//         address,
//         positionId
//       };
      
//       await apiRequest({
//         url: '/api/drift/close',
//         method: 'POST',
//         body: closeParams
//       });
      
//       // Update positions
//       await fetchPositions();
//     } catch (error) {
//       console.error("Failed to close position:", error);
//       throw error;
//     }
//   };
  
//   // Get market price
//   const getMarketPrice = async (market: string): Promise<number> => {
//     try {
//       // Get price from API
//       const response = await apiRequest(`/api/drift/price?market=${market}`);
//       const data = await response.json();
//       return data.price;
//     } catch (error) {
//       console.error("Failed to get market price:", error);
//       throw error;
//     }
//   };
  
//   // Get market history
//   const getMarketHistory = async (market: string, interval = '1h'): Promise<any[]> => {
//     try {
//       const response = await apiRequest(`/api/drift/history?market=${market}&interval=${interval}`);
//       const data = await response.json();
//       return data.history;
//     } catch (error) {
//       console.error("Failed to get market history:", error);
//       return [];
//     }
//   };
  
//   return {
//     isInitialized,
//     isLoading,
//     positions,
//     placeOrder,
//     closePosition,
//     getMarketPrice,
//     getMarketHistory,
//     fetchPositions,
//     tradingPairs: TRADING_PAIRS
//   };
// };

import { useState, useEffect, useCallback, useRef } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useWallet } from "@/hooks/useWallet";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { getWebSocketClient } from "@/lib/websocket";
import { 
  DriftClient, 
  initialize, 
  BulkAccountLoader, 
  getUserAccountPublicKey,
  convertToNumber,
  PositionDirection,
  QUOTE_PRECISION
} from "@drift-labs/sdk";
import { BN } from "@project-serum/anchor";

// Type definitions for Drift SDK handling
type DriftClientInstance = {
  getUserAccount: () => Promise<any>;
  getPerpMarketAccount: (marketIndex: number) => any;
  unsubscribe: () => void;
  subscribe: () => Promise<void>;
};

// Position type
export type Position = {
  id: string;
  market: string;
  direction: 'long' | 'short';
  size: number;
  leverage: number;
  entryPrice: number;
  liquidationPrice: number;
  pnl: number;
  pnlUsd: number;
};

// Order type
export type OrderParams = {
  market: string;
  direction: 'long' | 'short';
  amount: number;
  leverage: number;
};

// Available trading pairs
export const TRADING_PAIRS = [
  'SOL/USDT',
  'SOL/USDC',
  'BTC/USDC',
  'ETH/USDC'
];

// Market mapping between our market notation and Drift's
// Using fixed market indices for Devnet
const MARKET_MAP: Record<string, number> = {
  'SOL/USDT': 1, // Mapping to SOL market index on Devnet
  'SOL/USDC': 1, // Same as SOL/USDT since USDT and USDC are treated the same on Drift
  'BTC/USDC': 0, // Mapping to BTC market index on Devnet
  'ETH/USDC': 2  // Mapping to ETH market index on Devnet
};

// Devnet RPC endpoint
const SOLANA_RPC_URL = 'https://api.devnet.solana.com';

// Simple cache to prevent excessive API calls
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number; // expiry in milliseconds
}

const cache: Record<string, CacheItem<any>> = {};

// Get item from cache
function getCachedItem<T>(key: string): T | null {
  const item = cache[key];
  if (!item) return null;
  
  const now = Date.now();
  if (now - item.timestamp > item.expiry) {
    // Cache expired
    delete cache[key];
    return null;
  }
  
  return item.data;
}

// Set item in cache
function setCachedItem<T>(key: string, data: T, expiry: number = 5000): void {
  cache[key] = {
    data,
    timestamp: Date.now(),
    expiry
  };
}

// Throttle function to prevent excessive API calls
function throttle<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;
  
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;
    
    if (timeSinceLastCall >= delay) {
      lastCall = now;
      return func(...args);
    } else {
      return new Promise<ReturnType<T>>((resolve) => {
        if (timeoutId) clearTimeout(timeoutId);
        
        timeoutId = setTimeout(() => {
          lastCall = Date.now();
          resolve(func(...args));
        }, delay - timeSinceLastCall);
      });
    }
  }) as T;
}

// Drift Protocol adapter
export const useDrift = () => {
  const { connected, address } = useWallet();
  const [driftClient, setDriftClient] = useState<DriftClient | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Add reference to track if component is mounted
  const isMountedRef = useRef(true);
  // Reference to store WebSocket event listener for cleanup
  const positionUpdateListenerRef = useRef<{handlePositionUpdate?: (event: MessageEvent) => void}>({});

  // Initialize Drift client
  const initializeDrift = useCallback(async () => {
    if (!connected || !address) return;
    
    try {
      setIsLoading(true);
      
      // For demo purposes, we'll use server API instead of actual Drift client
      // In a real implementation with working wallet, we would initialize the Drift client
      
      console.log("Wallet connected:", address);
      
      // Subscribe to position updates via WebSocket when client initializes
      setupPositionWebSocketSubscription();
      
      // Mock a successful initialization
      setTimeout(() => {
        setIsInitialized(true);
        setIsLoading(false);
      }, 500);
      
    } catch (error) {
      console.error("Failed to initialize Drift client:", error);
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [connected, address]);
  
  // Clean up Drift client on unmount
  useEffect(() => {
    return () => {
      if (driftClient) {
        driftClient.unsubscribe();
      }
    };
  }, [driftClient]);
  
  // Initialize Drift client when wallet is connected
  useEffect(() => {
    if (connected && address && !isInitialized && !isLoading) {
      initializeDrift();
    }
  }, [connected, address, isInitialized, isLoading, initializeDrift]);

  // Initial HTTP fetch for positions (fallback and initial load)
  const fetchPositionsHttp = useCallback(async () => {
    if (!connected || !address || !isMountedRef.current) return [];
    
    try {
      // Since we're relying on server-side data, we'll fetch positions from the API
      const response = await apiRequest(`/api/drift/positions?address=${address}`);
      let positions: Position[] = [];
      
      try {
        positions = await response.json();
      } catch (error) {
        // If the endpoint doesn't exist yet, use an empty array
        positions = [];
      }
      
      if (isMountedRef.current) {
        setPositions(positions);
      }
      return positions;
    } catch (error) {
      console.error("Failed to fetch positions:", error);
      return [];
    }
  }, [connected, address]);
  
  // WebSocket management for position updates
  const setupPositionWebSocketSubscription = useCallback(() => {
    if (!connected || !address) return;
    
    try {
      const wsClient = getWebSocketClient();
      
      // Set up connection status handler
      const handleConnectionOpen = () => {
        // Only send subscription once connected
        const subscriptionMessage = {
          type: 'subscribe',
          channel: 'positions',
          address: address
        };
        
        // Send subscription request once connected
        wsClient.send(subscriptionMessage);
        console.log('Subscribed to position updates via WebSocket');
      };
      
      // Add connection handler
      wsClient.addEventListener('open', handleConnectionOpen);
      
      // Handle connection errors - fall back to HTTP
      const handleConnectionError = (event: Event) => {
        console.error('WebSocket connection error:', event);
        // Ensure we fetch data via HTTP if WebSocket fails
        setTimeout(() => {
          if (isMountedRef.current) {
            fetchPositionsHttp();
          }
        }, 1000);
      };
      
      wsClient.addEventListener('error', handleConnectionError);
      
      // Set up event listener for position updates
      const handlePositionUpdate = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          
          // Only process position update messages
          if (data.type === 'positions_update' && data.address === address) {
            if (isMountedRef.current) {
              setPositions(data.positions);
            }
          }
        } catch (err) {
          console.error('Error processing position update:', err);
        }
      };
      
      // Add message event listener
      wsClient.addEventListener('message', handlePositionUpdate);
      
      // Store the event listener reference for cleanup
      const cleanupRef = { 
        handlePositionUpdate,
        handleConnectionOpen,
        handleConnectionError 
      };
      positionUpdateListenerRef.current = cleanupRef;
      
      // Initially fetch positions using HTTP to populate immediately
      // This ensures we have data even if WebSocket isn't ready yet
      fetchPositionsHttp();
      
      // If WebSocket is already open, send subscription immediately
      if (wsClient.socket && wsClient.socket.readyState === WebSocket.OPEN) {
        handleConnectionOpen();
      }
      
      return () => {
        try {
          // Unsubscribe from position updates - only if socket is open
          if (wsClient.socket && wsClient.socket.readyState === WebSocket.OPEN) {
            wsClient.send({
              type: 'unsubscribe',
              channel: 'positions',
              address: address
            });
          }
          
          // Remove all event listeners
          if (cleanupRef.handlePositionUpdate) {
            wsClient.removeEventListener('message', cleanupRef.handlePositionUpdate);
          }
          if (cleanupRef.handleConnectionOpen) {
            wsClient.removeEventListener('open', cleanupRef.handleConnectionOpen);
          }
          if (cleanupRef.handleConnectionError) {
            wsClient.removeEventListener('error', cleanupRef.handleConnectionError);
          }
        } catch (err) {
          console.error('Error cleaning up WebSocket listeners:', err);
        }
      };
    } catch (error) {
      console.error('Failed to set up WebSocket for positions:', error);
      // Fall back to HTTP fetching
      fetchPositionsHttp();
      // Return a no-op cleanup function
      return () => {};
    }
  }, [connected, address, fetchPositionsHttp]);
  

  
  // Place an order on Drift
  const placeOrder = async (params: OrderParams): Promise<Position | null> => {
    if (!connected || !address) {
      throw new Error("Wallet not connected");
    }
    
    const { market, direction, amount, leverage } = params;
    
    try {
      // Send the order to our server-side API
      const orderParams = {
        address,
        market,
        direction,
        amount,
        leverage
      };
      
      const response = await apiRequest({
        url: '/api/drift/order',
        method: 'POST',
        body: orderParams
      });
      const newPosition = await response.json();
      
      // Update positions
      await fetchPositionsHttp();
      
      return newPosition;
    } catch (error) {
      console.error("Failed to place order:", error);
      throw error;
    }
  };
  
  // Close position
  const closePosition = async (positionId: string): Promise<void> => {
    if (!connected || !address) {
      throw new Error("Wallet not connected");
    }
    
    try {
      // Send the close request to our server-side API
      const closeParams = {
        address,
        positionId
      };
      
      await apiRequest({
        url: '/api/drift/close',
        method: 'POST',
        body: closeParams
      });
      
      // Update positions
      await fetchPositionsHttp();
    } catch (error) {
      console.error("Failed to close position:", error);
      throw error;
    }
  };
  
  // Get market price with caching
  const getMarketPrice = async (market: string): Promise<number> => {
    const cacheKey = `price:${market}`;
    const cachedData = getCachedItem<number>(cacheKey);
    
    // Return cached data if available
    if (cachedData !== null) {
      return cachedData;
    }
    
    try {
      // Get price from API
      const response = await apiRequest(`/api/drift/price?market=${market}`);
      const data = await response.json();
      
      // Cache the result for 3 seconds
      setCachedItem(cacheKey, data.price, 3000);
      
      return data.price;
    } catch (error) {
      console.error("Failed to get market price:", error);
      // Return a reasonable default or last known price if available
      const lastKnownPrice = getCachedItem<number>(`lastKnown:${market}`);
      if (lastKnownPrice !== null) return lastKnownPrice;
      
      throw error;
    }
  };
  
  // Get market history with caching
  const getMarketHistory = async (market: string, interval = '1h'): Promise<any[]> => {
    const cacheKey = `history:${market}:${interval}`;
    const cachedData = getCachedItem<any[]>(cacheKey);
    
    // Return cached data if available
    if (cachedData !== null) {
      return cachedData;
    }
    
    try {
      const response = await apiRequest(`/api/drift/history?market=${market}&interval=${interval}`);
      const data = await response.json();
      
      // Cache for longer periods (10 seconds for historical data)
      setCachedItem(cacheKey, data.history, 10000);
      
      return data.history;
    } catch (error) {
      console.error("Failed to get market history:", error);
      // Return empty array or cached data if available
      return [];
    }
  };
  
  // Set up WebSocket subscription when wallet connects
  useEffect(() => {
    if (connected && address) {
      const cleanupFn = setupPositionWebSocketSubscription();
      
      return () => {
        if (cleanupFn) cleanupFn();
      };
    }
  }, [connected, address, setupPositionWebSocketSubscription]);
  
  // Set up effect to clean up on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      // Clean up WebSocket listeners if any
      if (positionUpdateListenerRef.current) {
        const wsClient = getWebSocketClient();
        const { handlePositionUpdate } = positionUpdateListenerRef.current;
        if (handlePositionUpdate) {
          wsClient.removeEventListener('message', handlePositionUpdate);
        }
      }
    };
  }, []);

  // Apply throttling to the API-intensive functions
  const throttledGetMarketPrice = useCallback(throttle(getMarketPrice, 1000), []);
  const throttledGetMarketHistory = useCallback(throttle(getMarketHistory, 2000), []);
  // No need to throttle fetchPositionsHttp since it's now used as a fallback only
  
  return {
    isInitialized,
    isLoading,
    positions,
    placeOrder,
    closePosition,
    // Use throttled versions
    getMarketPrice: throttledGetMarketPrice,
    getMarketHistory: throttledGetMarketHistory,
    fetchPositions: fetchPositionsHttp, // Expose HTTP version as fallback
    tradingPairs: TRADING_PAIRS
  };
}; // End of useDrift hook





