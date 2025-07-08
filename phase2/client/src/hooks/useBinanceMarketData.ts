import { useEffect, useState } from 'react';

// Define market data interface
export interface MarketData {
  symbol: string;         // Market symbol (e.g., "BTC-PERP")
  price: number;          // Current price
  change: number;         // 24h price change
  percentChange: number;  // 24h percentage change
  volume: number;         // 24h volume
  high: number;           // 24h high
  low: number;            // 24h low
}

// List of markets we want to display
const MARKET_SYMBOLS = [
  { binance: 'BTCUSDT', display: 'BTC-PERP' },
  { binance: 'ETHUSDT', display: 'ETH-PERP' },
  { binance: 'SOLUSDT', display: 'SOL-PERP' },
  { binance: 'XRPUSDT', display: 'XRP-PERP' },
  { binance: 'DOGEUSDT', display: 'DOGE-PERP' },
  { binance: 'AVAXUSDT', display: 'AVAX-PERP' },
];

// Custom hook to get market data from Binance
export const useBinanceAllMarketData = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch of 24hr ticker data for all markets
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        const data = await response.json();
        
        // Process data for our selected markets
        const processedData = MARKET_SYMBOLS.map(marketSymbol => {
          const market = data.find((item: any) => item.symbol === marketSymbol.binance);
          
          if (!market) {
            return {
              symbol: marketSymbol.display,
              price: 0,
              change: 0,
              percentChange: 0,
              volume: 0,
              high: 0,
              low: 0
            };
          }
          
          return {
            symbol: marketSymbol.display,
            price: parseFloat(market.lastPrice),
            change: parseFloat(market.priceChange),
            percentChange: parseFloat(market.priceChangePercent),
            volume: parseFloat(market.volume),
            high: parseFloat(market.highPrice),
            low: parseFloat(market.lowPrice)
          };
        });
        
        setMarketData(processedData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch market data:', err);
        setError('Failed to fetch market data. Please try again later.');
        setLoading(false);
      }
    };

    // Set up WebSocket for real-time updates
    const setupWebSocket = () => {
      // Create stream names for all our markets
      const streams = MARKET_SYMBOLS.map(m => `${m.binance.toLowerCase()}@ticker`).join('/');
      const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;
      
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('WebSocket connection established');
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const streamData = message.data;
        
        // Find which market this update is for
        const marketSymbol = MARKET_SYMBOLS.find(
          m => m.binance.toLowerCase() === streamData.s.toLowerCase()
        );
        
        if (marketSymbol) {
          setMarketData(prevData => {
            const updatedData = [...prevData];
            const index = updatedData.findIndex(item => item.symbol === marketSymbol.display);
            
            if (index !== -1) {
              updatedData[index] = {
                ...updatedData[index],
                price: parseFloat(streamData.c),
                change: parseFloat(streamData.p),
                percentChange: parseFloat(streamData.P),
                volume: parseFloat(streamData.v),
                high: parseFloat(streamData.h),
                low: parseFloat(streamData.l)
              };
            }
            
            return updatedData;
          });
        }
      };

      socket.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('Error connecting to market data stream. Please refresh the page.');
      };

      socket.onclose = () => {
        console.log('WebSocket connection closed');
      };

      return socket;
    };

    // First fetch initial data, then set up WebSocket
    fetchInitialData();
    const socket = setupWebSocket();

    // Clean up WebSocket on unmount
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  // Periodically refresh the data to ensure accuracy
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        const data = await response.json();
        
        setMarketData(prevData => {
          return prevData.map(market => {
            const binanceSymbol = MARKET_SYMBOLS.find(m => m.display === market.symbol)?.binance;
            const updatedMarket = data.find((item: any) => item.symbol === binanceSymbol);
            
            if (!updatedMarket) return market;
            
            return {
              ...market,
              price: parseFloat(updatedMarket.lastPrice),
              change: parseFloat(updatedMarket.priceChange),
              percentChange: parseFloat(updatedMarket.priceChangePercent),
              volume: parseFloat(updatedMarket.volume),
              high: parseFloat(updatedMarket.highPrice),
              low: parseFloat(updatedMarket.lowPrice)
            };
          });
        });
      } catch (err) {
        console.error('Failed to refresh market data:', err);
      }
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, []);

  return { marketData, error, loading };
};
