import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronDown, ArrowLeft, ChevronUp, Star, Edit, RotateCcw, Info, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useHyperliquidMarketData } from '@/hooks/useHyperliquidMarketData';

// Order types and tabs
type OrderType = 'Cross' | 'Buy' | 'Sell';
type OrderTab = 'Limit' | 'Market' | 'Stop L';
type TimeInForceOption = 'Good Til Time' | 'Good Til Cancel' | 'Immediate or Cancel' | 'Fill or Kill';

interface MarketData {
  symbol: string;
  lastPrice?: number;
  change24h?: number;
  volume24h?: number;
  midPrice?: number;
  bestBid?: number;
  bestAsk?: number;
  fundingRate?: number;
}

// Order book entry type
interface OrderBookEntry {
  price: number;
  size: number;
  total?: number;
}

// Define token metadata for dynamic display
const tokenMetadata: Record<string, { name: string, symbol: string, iconClass: string, color: string }> = {
  'BTC': { 
    name: 'Bitcoin', 
    symbol: 'BTC', 
    iconClass: 'from-amber-400 to-amber-600', 
    color: 'amber' 
  },
  'ETH': { 
    name: 'Ethereum', 
    symbol: 'ETH', 
    iconClass: 'from-blue-400 to-indigo-600', 
    color: 'blue' 
  },
  'SOL': { 
    name: 'Solana', 
    symbol: 'SOL', 
    iconClass: 'from-purple-400 to-purple-600', 
    color: 'purple' 
  },
  'DOGE': { 
    name: 'Dogecoin', 
    symbol: 'DOGE', 
    iconClass: 'from-yellow-400 to-yellow-600', 
    color: 'yellow' 
  },
  'ADA': { 
    name: 'Cardano', 
    symbol: 'ADA', 
    iconClass: 'from-blue-400 to-blue-600', 
    color: 'blue' 
  },
  'XRP': { 
    name: 'Ripple', 
    symbol: 'XRP', 
    iconClass: 'from-blue-300 to-blue-500', 
    color: 'blue' 
  },
  'SUI': { 
    name: 'Sui', 
    symbol: 'SUI', 
    iconClass: 'from-cyan-400 to-blue-500', 
    color: 'cyan' 
  },
  'AAVE': { 
    name: 'Aave', 
    symbol: 'AAVE', 
    iconClass: 'from-purple-300 to-indigo-500', 
    color: 'purple' 
  },
  'DOT': { 
    name: 'Polkadot', 
    symbol: 'DOT', 
    iconClass: 'from-pink-400 to-pink-600', 
    color: 'pink' 
  },
  'LINK': { 
    name: 'Chainlink', 
    symbol: 'LINK', 
    iconClass: 'from-blue-400 to-blue-600', 
    color: 'blue' 
  },
  'AVAX': { 
    name: 'Avalanche', 
    symbol: 'AVAX', 
    iconClass: 'from-red-400 to-red-600', 
    color: 'red' 
  },
  'MATIC': { 
    name: 'Polygon', 
    symbol: 'MATIC', 
    iconClass: 'from-violet-400 to-violet-600', 
    color: 'violet' 
  }
};

export default function TradePage() {
  // Remove any background color causing green spaces
  useEffect(() => {
    // Set background to match app background
    document.body.style.background = '#030712';
    
    return () => {
      document.body.style.background = '';
    };
  }, []);
  const { token } = useParams();
  // Default to BTC if no token specified or token not found in metadata
  const tokenSymbol = token?.toUpperCase() || 'BTC';
  const currentToken = tokenMetadata[tokenSymbol] || tokenMetadata['BTC'];
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [token]);
  
  // Get real market data from Hyperliquid API
  const { marketData: marketsData, loading: marketsLoading, error: marketsError } = useHyperliquidMarketData();
  
  // Current market data for selected token
  const currentMarket = useMemo(() => {
    if (!marketsData || marketsLoading) return null;
    return marketsData.find(m => m.symbol === tokenSymbol);
  }, [marketsData, marketsLoading, tokenSymbol]);
  const [activeOrderType, setActiveOrderType] = useState<OrderType>('Buy');
  const [activeTab, setActiveTab] = useState<OrderTab>('Limit');
  const [amount, setAmount] = useState<string>('0.0000');
  const [limitPrice, setLimitPrice] = useState<string>('0');
  const [timeInForce, setTimeInForce] = useState<TimeInForceOption>('Good Til Time');
  const [days, setDays] = useState<number>(28);
  const [showOrderDetails, setShowOrderDetails] = useState<boolean>(false);
  const [priceChanging, setPriceChanging] = useState<boolean>(false);
  const [lastPriceDirection, setLastPriceDirection] = useState<'up' | 'down' | null>(null);
  const [activeCurrency, setActiveCurrency] = useState<'BTC' | 'USD'>('BTC');
  const [orderBook, setOrderBook] = useState<{asks: OrderBookEntry[], bids: OrderBookEntry[]}>({
    asks: [],
    bids: []
  });
  
  // Reference to store previous price for animation direction
  const prevPriceRef = useRef<number | null>(null);
  
  // Update order book when we get new market data
  useEffect(() => {
    if (currentMarket) {
      // Determine price direction for animation based on mid price
      if (prevPriceRef.current !== null && currentMarket.midPrice !== prevPriceRef.current) {
        setLastPriceDirection(currentMarket.midPrice > prevPriceRef.current ? 'up' : 'down');
        setPriceChanging(true);
        setTimeout(() => setPriceChanging(false), 1500);
      }
      
      // Update previous price reference
      if (currentMarket.midPrice) {
        prevPriceRef.current = currentMarket.midPrice;
      }
      
      // Set limit price based on current market data
      if (currentMarket.midPrice) {
        setLimitPrice(currentMarket.midPrice.toFixed(2));
      }
      
      // If we have order book data from the Hyperliquid API, use that
      if (currentMarket.orderBook) {
        const processedBids: OrderBookEntry[] = [];
        const processedAsks: OrderBookEntry[] = [];
        
        // Process bids from the API
        if (currentMarket.orderBook.bids && currentMarket.orderBook.bids.length > 0) {
          currentMarket.orderBook.bids.slice(0, 10).forEach(([price, size]) => {
            processedBids.push({
              price,
              size,
              total: price * size
            });
          });
        }
        
        // Process asks from the API
        if (currentMarket.orderBook.asks && currentMarket.orderBook.asks.length > 0) {
          currentMarket.orderBook.asks.slice(0, 10).forEach(([price, size]) => {
            processedAsks.push({
              price,
              size,
              total: price * size
            });
          });
        }
        
        // Calculate cumulative totals for visualization
        let askTotal = 0;
        processedAsks.forEach(ask => {
          askTotal += ask.size;
          ask.total = askTotal;
        });
        
        let bidTotal = 0;
        processedBids.forEach(bid => {
          bidTotal += bid.size;
          bid.total = bidTotal;
        });
        
        // Sort asks lowest to highest and bids highest to lowest
        processedAsks.sort((a, b) => a.price - b.price);
        processedBids.sort((a, b) => b.price - a.price);
        
        // Update order book with real data
        setOrderBook({
          asks: processedAsks,
          bids: processedBids
        });
      } else {
        // Fallback to generating mock order book if API data not available
        const basePrice = currentMarket.midPrice || currentMarket.lastPrice || 0;
        const mockAsks: OrderBookEntry[] = [];
        const mockBids: OrderBookEntry[] = [];
        
        // Generate 10 asks above the base price
        for (let i = 0; i < 10; i++) {
          const priceIncrement = Math.pow(1.0002, i) * (i + 1);
          const price = basePrice + priceIncrement;
          const size = (Math.random() * 2.5) * (1 / (1 + i * 0.2));
          
          mockAsks.push({
            price,
            size,
            total: 0
          });
        }
        
        // Generate 10 bids below the base price
        for (let i = 0; i < 10; i++) {
          const priceDecrement = Math.pow(1.0002, i) * (i + 1);
          const price = basePrice - priceDecrement;
          const size = (Math.random() * 2.5) * (1 / (1 + i * 0.2));
          
          mockBids.push({
            price,
            size,
            total: 0
          });
        }
        
        // Calculate cumulative totals
        let askTotal = 0;
        mockAsks.forEach(ask => {
          askTotal += ask.size;
          ask.total = askTotal;
        });
        
        let bidTotal = 0;
        mockBids.forEach(bid => {
          bidTotal += bid.size;
          bid.total = bidTotal;
        });
        
        // Update order book with mock data
        setOrderBook({
          asks: mockAsks.sort((a, b) => a.price - b.price),
          bids: mockBids.sort((a, b) => b.price - a.price)
        });
      }
    }
  }, [currentMarket, token]);
  
  // Format price with commas and decimal
  const formatPrice = (price: number): string => {
    if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (price >= 100) return price.toFixed(2);
    if (price >= 10) return price.toFixed(3);
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(5);
  };
  
  // Format change as percentage with sign
  const formatChange = (change?: number): string => {
    if (change === undefined) return '+0.00%';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };
  
  // Format short number with dollar sign for monetary values
  const formatShort = (num: number): string => {
    if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };
  
  // Format size without dollar sign
  const formatSize = (num: number): string => {
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
    return num.toFixed(5);
  };
  
  // Get color class based on positive/negative value
  const getColorClass = (value?: number): string => {
    if (!value) return 'text-neutral-400';
    return value > 0 ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className="flex flex-col bg-gray-950 min-h-screen text-white w-full">
      {/* Header with back button, token info and star - with enhanced styling */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-900/95 to-gray-950 border-b border-gray-800 sticky top-0 z-10 shadow-lg mt-1"
      >
        <div className="flex items-center">
          <motion.button 
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.95 }} 
            className="mr-4 p-2 rounded-full hover:bg-gray-800 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div className="flex items-center">
            <motion.div 
              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
              className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentToken.iconClass} flex items-center justify-center mr-4 shadow-lg shadow-${currentToken.color}-500/20 border border-${currentToken.color}-500/20`}
            >
              <span className="text-white font-bold text-sm">{currentToken.symbol.charAt(0)}</span>
            </motion.div>
            <div>
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-white drop-shadow-sm">{currentToken.name}</h1>
                <span className="text-gray-400 ml-2 text-sm bg-gray-800 py-0.5 px-2 rounded-full">{currentToken.symbol}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="ml-2 text-gray-500 hover:text-gray-300 transition-colors">
                        <Info size={14} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-xs">View detailed information</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center">
                <motion.span 
                  animate={{ scale: priceChanging ? [1, 1.05, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                  className={`font-semibold text-xl ${priceChanging ? (lastPriceDirection === 'up' ? 'text-green-500' : 'text-red-500') : ''}`}
                >
                  ${formatPrice(currentMarket?.midPrice ?? currentMarket?.lastPrice ?? 0)}
                </motion.span>
                <motion.span 
                  className={`ml-2 ${getColorClass(currentMarket?.change24h || 0)} flex items-center`}
                >
                  {lastPriceDirection === 'up' && <ChevronUp size={16} className="mr-1" />}
                  {lastPriceDirection === 'down' && <ChevronDown size={16} className="mr-1" />}
                  {formatChange(currentMarket?.change24h ?? 0)}
                </motion.span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button 
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <TrendingUp size={18} className="text-gray-400" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <Star size={20} className="text-amber-400" />
          </motion.button>
        </div>
      </motion.div>
      
      {/* Order entry area - with balanced margins */}
      <div className="flex flex-col flex-1 px-6 py-6 max-w-4xl mx-auto w-full pb-20">
        {/* Order type selection - enhanced with animations */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant={activeOrderType === 'Cross' ? 'secondary' : 'outline'}
              className={`rounded-lg py-6 w-full ${activeOrderType === 'Cross' ? 
                'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 border-none shadow-lg shadow-blue-500/20' : 
                'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border-gray-700'} text-white font-medium transition-all duration-200`}
              onClick={() => setActiveOrderType('Cross')}
            >
              <div className="flex items-center justify-center">
                <span>Cross</span> 
                <ChevronDown className="ml-1" size={14} />
              </div>
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant={activeOrderType === 'Buy' ? 'default' : 'outline'}
              className={`rounded-lg py-6 w-full ${activeOrderType === 'Buy' ? 
                'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-none shadow-lg shadow-green-500/20' : 
                'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border-gray-700'} text-white font-medium transition-all duration-200`}
              onClick={() => setActiveOrderType('Buy')}
            >
              <div className="flex items-center justify-center">
                <Sparkles className="mr-1" size={16} opacity={activeOrderType === 'Buy' ? 1 : 0} />
                <span>Buy</span>
              </div>
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant={activeOrderType === 'Sell' ? 'destructive' : 'outline'}
              className={`rounded-lg py-6 w-full ${activeOrderType === 'Sell' ? 
                'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 border-none shadow-lg shadow-red-500/20' : 
                'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border-gray-700'} text-white font-medium transition-all duration-200`}
              onClick={() => setActiveOrderType('Sell')}
            >
              <div className="flex items-center justify-center">
                <span>Sell</span>
              </div>
            </Button>
          </motion.div>
        </motion.div>
        
        {/* Amount adjusters */}
        <div className="flex items-center mb-4">
          <Button variant="outline" className="rounded-full p-5 bg-gray-800/40 border-gray-700 text-white">
            <ArrowLeft size={16} />
          </Button>
          <div className="flex-1 mx-2">
            <div className="flex items-center bg-gray-800/40 rounded-full px-4 py-2">
              <span className="text-gray-400">$1</span>
              <Button variant="outline" className="ml-auto p-2 h-auto rounded-full bg-black text-white border-none">
                -
              </Button>
              <Button variant="outline" className="ml-1 p-2 h-auto rounded-full bg-gray-700 text-white border-none">
                +
              </Button>
            </div>
          </div>
        </div>
        
        {/* Order type tabs */}
        <div className="flex mb-4">
          <Tabs 
            defaultValue="Limit" 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as OrderTab)}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 bg-gray-800/40 rounded-full">
              <TabsTrigger value="Limit" className="rounded-full data-[state=active]:bg-gray-700">
                Limit
              </TabsTrigger>
              <TabsTrigger value="Market" className="rounded-full data-[state=active]:bg-gray-700">
                Market
              </TabsTrigger>
              <TabsTrigger value="Stop L" className="rounded-full data-[state=active]:bg-gray-700">
                Stop L
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Order book display - enhanced with depth visualization */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="relative bg-gradient-to-b from-gray-900/80 to-gray-950/80 backdrop-blur-sm rounded-xl p-5 mb-8 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 shadow-lg shadow-gray-900/50"
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Order Book</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-gray-400 hover:text-gray-200 transition-colors">
                    <Info size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p className="text-xs">Order book shows pending buy and sell orders</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="grid grid-cols-12 gap-1 mb-2">
            <div className="col-span-2 text-left text-gray-400 text-xs">Size</div>
            <div className="col-span-5 text-right text-gray-400 text-xs">Price</div>
            <div className="col-span-5 text-center text-gray-400 text-xs">Depth</div>
          </div>
          
          {/* Ask/Sell orders */}
          <div className="space-y-1 mb-2">
            {orderBook.asks.slice(0, 5).map((ask, index) => {
              // Calculate relative size for visualization
              const maxSize = Math.max(...orderBook.asks.map(a => a.size));
              const relativeSize = (ask.size / maxSize) * 100;
              
              return (
                <motion.div 
                  key={`ask-${index}`} 
                  className="grid grid-cols-12 py-1.5 px-1 hover:bg-gray-800/50 rounded cursor-pointer group transition-colors duration-200"
                  whileHover={{ scale: 1.01 }}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="col-span-2 text-left text-red-400 text-sm group-hover:text-red-300">
                    {formatSize(ask.size)}
                  </div>
                  <div className="col-span-5 text-right text-red-400 text-sm font-medium group-hover:text-red-300">
                    ${formatPrice(ask.price)}
                  </div>
                  <div className="col-span-5 relative h-5">
                    <div 
                      className="absolute top-0 right-0 h-full bg-gradient-to-r from-red-900/5 to-red-700/30 rounded-sm backdrop-blur-sm" 
                      style={{ width: `${relativeSize}%` }}
                    ></div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Spread indicator */}
          <motion.div 
            className="flex justify-between items-center py-2 border-y border-gray-800 my-2 px-1"
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            animate={{ 
              backgroundColor: ["rgba(255,255,255,0.0)", "rgba(255,255,255,0.03)", "rgba(255,255,255,0.0)"]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2 
            }}
          >
            <div className="flex items-center">
              <span className="text-gray-400 text-xs mr-1">Spread</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-gray-500">
                      <Info size={12} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">Difference between lowest ask and highest bid</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-gray-300 text-xs font-medium">
              ${(orderBook.asks[orderBook.asks.length - 1]?.price - orderBook.bids[0]?.price).toFixed(2)} <span className="text-gray-400">({((orderBook.asks[orderBook.asks.length - 1]?.price - orderBook.bids[0]?.price) / (currentMarket?.midPrice || orderBook.bids[0]?.price) * 100).toFixed(2)}%)</span>
            </div>
          </motion.div>
          
          {/* Bid/Buy orders */}
          <div className="space-y-1 mt-2">
            {orderBook.bids.slice(0, 5).map((bid, index) => {
              // Calculate relative size for visualization
              const maxSize = Math.max(...orderBook.bids.map(b => b.size));
              const relativeSize = (bid.size / maxSize) * 100;
              
              return (
                <motion.div 
                  key={`bid-${index}`} 
                  className="grid grid-cols-12 py-1.5 px-1 hover:bg-gray-800/50 rounded cursor-pointer group transition-colors duration-200"
                  whileHover={{ scale: 1.01 }}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="col-span-2 text-left text-green-400 text-sm group-hover:text-green-300">
                    {formatSize(bid.size)}
                  </div>
                  <div className="col-span-5 text-right text-green-400 text-sm font-medium group-hover:text-green-300">
                    ${formatPrice(bid.price)}
                  </div>
                  <div className="col-span-5 relative h-5">
                    <div 
                      className="absolute top-0 right-0 h-full bg-gradient-to-r from-green-900/5 to-green-700/30 rounded-sm backdrop-blur-sm" 
                      style={{ width: `${relativeSize}%` }}
                    ></div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
        
        {/* Amount input - enhanced with animations and styling */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="grid grid-cols-2 gap-6 mt-6"
        >
          <motion.div 
            whileHover={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.1)', backgroundColor: 'rgba(31, 41, 55, 0.8)' }}
            className="bg-gradient-to-b from-gray-800/90 to-gray-900/90 rounded-lg p-5 border border-transparent hover:border-gray-600 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10"
          >
            <div className="text-gray-400 text-sm mb-1">Amount</div>
            <div className="flex items-center">
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent text-xl w-full outline-none border-none focus:ring-0"
              />
              <div className="flex space-x-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded transition-colors"
                  onClick={() => {
                    const currentAmount = parseFloat(amount) || 0;
                    setAmount((currentAmount / 2).toFixed(4));
                  }}
                >
                  1/2
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded transition-colors"
                  onClick={() => {
                    const currentAmount = parseFloat(amount) || 0;
                    setAmount((currentAmount * 2).toFixed(4));
                  }}
                >
                  2x
                </motion.button>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.1)', backgroundColor: 'rgba(31, 41, 55, 0.8)' }}
            className="bg-gradient-to-b from-gray-800/90 to-gray-900/90 rounded-lg p-5 flex flex-col justify-between border border-transparent hover:border-gray-600 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10"
          >
            <div className="flex justify-between items-center">
              <div className="text-gray-400 text-sm">Currency</div>
              <div className="text-right text-lg font-medium">
                <motion.button
                  onClick={() => setActiveCurrency(activeCurrency === 'BTC' ? 'USD' : 'BTC')}
                  className="bg-gray-900/50 hover:bg-gray-700 px-3 py-1 rounded-full transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {activeCurrency}
                </motion.button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-gray-400">{activeCurrency === 'BTC' ? 'USD' : 'BTC'}</div>
              <motion.button 
                className="text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 rounded-full p-1.5 transition-colors"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
                onClick={() => setActiveCurrency(activeCurrency === 'BTC' ? 'USD' : 'BTC')}
              >
                <RotateCcw size={14} />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Limit Price input - enhanced with animations and styling */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          whileHover={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.1)', backgroundColor: 'rgba(31, 41, 55, 0.8)' }}
          className="bg-gradient-to-b from-gray-800/90 to-gray-900/90 rounded-lg p-5 mt-5 border border-transparent hover:border-gray-600 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10"
        >
          <div className="flex justify-between">
            <div className="text-gray-400 text-sm mb-1">Limit Price</div>
            <div className="flex space-x-1">
              <motion.button
                whileHover={{ backgroundColor: '#374151' }}
                whileTap={{ scale: 0.95 }}
                className="text-xs bg-gray-700 text-white px-2 py-0.5 rounded-l transition-colors"
                onClick={() => {
                  const currentPrice = parseFloat(limitPrice) || 0;
                  setLimitPrice((currentPrice * 0.99).toFixed(0));
                }}
              >
                -1%
              </motion.button>
              <motion.button
                whileHover={{ backgroundColor: '#374151' }}
                whileTap={{ scale: 0.95 }}
                className="text-xs bg-gray-700 text-white px-2 py-0.5 rounded-r transition-colors"
                onClick={() => {
                  const currentPrice = parseFloat(limitPrice) || 0;
                  setLimitPrice((currentPrice * 1.01).toFixed(0));
                }}
              >
                +1%
              </motion.button>
            </div>
          </div>
          <div className="flex items-center">
            <input
              type="text"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              className="bg-transparent text-xl w-full outline-none border-none focus:ring-0"
            />
            <span className="text-gray-400">USD</span>
          </div>
        </motion.div>
        
        {/* Time in force - enhanced with animations and interactive elements */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          whileHover={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.1)', backgroundColor: 'rgba(31, 41, 55, 0.8)' }}
          className="bg-gradient-to-b from-gray-800/90 to-gray-900/90 rounded-lg p-5 mt-5 border border-transparent hover:border-gray-600 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10"
        >
          <div className="text-gray-400 text-sm mb-1">Time In Force</div>
          <div className="flex items-center justify-between">
            <div className="text-white text-xl">{timeInForce}</div>
            <motion.button 
              whileHover={{ scale: 1.1, backgroundColor: '#374151' }} 
              whileTap={{ scale: 0.95 }}
              className="text-gray-400 hover:text-white p-2 rounded-full transition-colors"
            >
              <Edit size={18} />
            </motion.button>
          </div>
        </motion.div>
        
        {/* Days setting - enhanced with a slider */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          whileHover={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.1)', backgroundColor: 'rgba(31, 41, 55, 0.8)' }}
          className="bg-gradient-to-b from-gray-800/90 to-gray-900/90 rounded-lg p-5 mt-5 border border-transparent hover:border-gray-600 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10"
        >
          <div className="text-gray-400 text-sm mb-2">Time in Force</div>
          <div className="flex items-center justify-between w-full">
            <div className="text-white text-xl">{timeInForce}</div>
          </div>
          <div className="mt-2 w-full">
            <Tabs defaultValue={timeInForce} className="w-full" onValueChange={(val) => setTimeInForce(val as TimeInForceOption)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="Good Til Cancel">GTC</TabsTrigger>
                <TabsTrigger value="Immediate or Cancel">IOC</TabsTrigger>
                <TabsTrigger value="Fill or Kill">FOK</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </motion.div>
        
        {/* Order details accordion - enhanced with animation */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="bg-gray-900/80 rounded-lg mt-4 overflow-hidden border border-transparent hover:border-gray-700 transition-all duration-200"
        >
          <motion.button 
            className="flex items-center justify-between w-full p-4"
            onClick={() => setShowOrderDetails(!showOrderDetails)}
            whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.3)' }}
          >
            <div className="text-gray-300 font-medium">Order details</div>
            <motion.div
              animate={{ rotate: showOrderDetails ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={18} className="text-gray-400" />
            </motion.div>
          </motion.button>
          
          <AnimatePresence>
            {showOrderDetails && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="px-4 pb-4 border-t border-gray-800"
              >
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                  <div className="text-sm text-gray-400">
                    High <span className="font-medium">${formatPrice(currentMarket?.dayHigh ?? (currentMarket?.midPrice ?? 0) * 1.01)}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Low <span className="font-medium">${formatPrice(currentMarket?.dayLow ?? (currentMarket?.midPrice ?? 0) * 0.99)}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    24h Vol <span className="font-medium">${formatShort(currentMarket?.dayNtlVlm ?? 0)}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Margin <span className="font-medium">Cross (10x)</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Place order button - enhanced with animations */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="mt-8 mb-6"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              disabled={marketsLoading || parseFloat(amount) <= 0}
              className={`w-full py-6 text-lg font-medium tracking-wide shadow-lg rounded-lg ${marketsLoading ? 'opacity-60 cursor-not-allowed' : ''} ${
                activeOrderType === 'Buy' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-500/20 text-white' 
                  : activeOrderType === 'Sell' 
                    ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-red-500/20 text-white' 
                    : 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 shadow-blue-500/20 text-white'
              }`}
            >
              <div className="flex items-center justify-center">
                {activeOrderType === 'Buy' && <Sparkles className="mr-2" size={20} />}
                {activeOrderType === 'Sell' && <AlertTriangle className="mr-2" size={20} />}
                {parseFloat(amount) > 0 ? 
                  `${activeOrderType} ${amount} ${tokenSymbol} at $${formatPrice(parseFloat(limitPrice))}` :
                  `Enter amount to ${activeOrderType.toLowerCase()}`
                }
              </div>
            </Button>
          </motion.div>
          <div className="text-center mt-2 text-xs text-gray-500">
            Trading fees: 0.05% | <span className="text-blue-400 cursor-pointer hover:underline">View fee schedule</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
