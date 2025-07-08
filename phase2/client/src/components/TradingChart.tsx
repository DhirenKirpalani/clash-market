import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { initTradingView, setChartSymbol, setChartInterval, removeTradingViewBranding } from "@/lib/tradingViewAdapter";

interface TradingChartProps {
  market: string;
}

// Available markets for selection
const AVAILABLE_MARKETS = [
  { label: "BTC-PERP", value: "BTC-PERP" },
  { label: "ETH-PERP", value: "ETH-PERP" },
  { label: "SOL-PERP", value: "SOL-PERP" },
  { label: "AVAX-PERP", value: "AVAX-PERP" },
  { label: "ARB-PERP", value: "ARB-PERP" },
  { label: "BNB-PERP", value: "BNB-PERP" },
  { label: "DOGE-PERP", value: "DOGE-PERP" }
];

// Mapping of market tickers to TradingView symbols
// Using the most basic symbols that should work with the free widget
const TRADINGVIEW_SYMBOLS: Record<string, string> = {
  "BTC-PERP": "BTCUSD",
  "ETH-PERP": "ETHUSD",
  "SOL-PERP": "SOLUSD",
  "AVAX-PERP": "AVAXUSD",
  "ARB-PERP": "ARBUSD",
  "BNB-PERP": "BNBUSD",
  "DOGE-PERP": "DOGEUSD"
};

export default function TradingChart({ market: initialMarket }: TradingChartProps) {
  // Load saved preferences from localStorage or use defaults
  const getSavedMarket = () => {
    try {
      const saved = localStorage.getItem('cryptoClash_selectedMarket');
      return saved || initialMarket;
    } catch (e) {
      return initialMarket;
    }
  };
  
  const getSavedTimeframe = () => {
    try {
      const saved = localStorage.getItem('cryptoClash_selectedTimeframe');
      return saved || "15m";
    } catch (e) {
      return "15m";
    }
  };
  
  // Allow changing the market within the component with persistence
  const [selectedMarket, setSelectedMarket] = useState(getSavedMarket());
  const [timeframe, setTimeframe] = useState(getSavedTimeframe());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Reference for chart container and widget
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  
  // Save preferences when they change
  const handleMarketChange = (value: string) => {
    setSelectedMarket(value);
    try {
      localStorage.setItem('cryptoClash_selectedMarket', value);
      
      // Update existing chart if available
      if (widgetRef.current) {
        const symbol = TRADINGVIEW_SYMBOLS[value] || TRADINGVIEW_SYMBOLS['BTC-PERP'];
        setChartSymbol(widgetRef.current, symbol);
      }
    } catch (e) {
      console.error("Failed to save market preference", e);
    }
  };
  
  const handleTimeframeChange = (value: string) => {
    setTimeframe(value);
    try {
      localStorage.setItem('cryptoClash_selectedTimeframe', value);
      
      // Update existing chart if available
      if (widgetRef.current) {
        setChartInterval(widgetRef.current, value);
      }
    } catch (e) {
      console.error("Failed to save timeframe preference", e);
    }
  };

  // Initialize and manage TradingView chart when selected market or timeframe changes
  useEffect(() => {
    // Clean up any previous instances
    if (chartContainerRef.current) {
      chartContainerRef.current.innerHTML = '';
    }
    
    // Remove any lingering TradingView styles
    const existingStyle = document.getElementById('tv-branding-blocker');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    const initChart = async () => {
      if (!chartContainerRef.current) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Create a unique ID for the container if it doesn't have one
        if (!chartContainerRef.current.id) {
          chartContainerRef.current.id = 'tv_chart_container';
        }
        
        // Get the appropriate symbol for the selected market
        const symbol = TRADINGVIEW_SYMBOLS[selectedMarket] || TRADINGVIEW_SYMBOLS['BTC-PERP'];
        
        // Initialize TradingView chart
        widgetRef.current = await initTradingView(chartContainerRef.current, symbol, timeframe);
        
        setIsLoading(false);
      } catch (err: any) {
        console.error("Failed to initialize TradingView chart:", err);
        setError("Failed to load chart. Please refresh the page.");
        setIsLoading(false);
      }
    };
    
    // Short delay to ensure DOM is ready
    setTimeout(initChart, 100);
    
    // Cleanup function
    return () => {
      // Clean up the widget if needed
      if (widgetRef.current && widgetRef.current.remove) {
        try {
          widgetRef.current.remove();
        } catch (e) {
          console.error("Failed to remove TradingView widget", e);
        }
      }
    };
  }, [selectedMarket, timeframe]); // Re-run when market or timeframe changes

  // Common timeframes to always show
  const commonTimeframes = [
    { label: "1m", value: "1m" },
    { label: "5m", value: "5m" },
    { label: "15m", value: "15m" },
    { label: "30m", value: "30m" },
  ];
  
  // All available timeframes
  const allTimeframes = [
    { label: "1m", value: "1m" },
    { label: "5m", value: "5m" },
    { label: "15m", value: "15m" },
    { label: "30m", value: "30m" },
    { label: "1h", value: "1h" },
    { label: "4h", value: "4h" },
    { label: "1D", value: "1D" },
  ];
  
  // Determine which timeframes to show in dropdown (all except common ones)
  const dropdownTimeframes = allTimeframes.filter(tf => 
    !commonTimeframes.some(common => common.value === tf.value)
  );
  
  // Check if the current timeframe is one from the dropdown list
  const isDropdownTimeframe = !commonTimeframes.some(tf => tf.value === timeframe) && 
    dropdownTimeframes.some(tf => tf.value === timeframe);
  
  // Get the label for the selected dropdown timeframe
  const selectedDropdownTimeframe = dropdownTimeframes.find(tf => tf.value === timeframe);

  return (
    <Card className="gradient-card rounded-xl p-4 border border-[#333333] mb-6 relative overflow-hidden">  
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[#F2F2F2] relative inline-block data-highlight">TRADING CHART</h2>
      </div>
      {/* Animated corner effect */}
      <div className="absolute top-0 left-0 w-16 h-16">
        <div className="absolute top-0 left-0 w-[1px] h-8 bg-[#00F0FF] animate-pulse"></div>
        <div className="absolute top-0 left-0 w-8 h-[1px] bg-[#00F0FF] animate-pulse"></div>
      </div>
      <CardContent className="p-0">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <Select value={selectedMarket} onValueChange={handleMarketChange}>
              <SelectTrigger className="w-[120px] bg-bg-primary">
                <SelectValue placeholder="Select market" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_MARKETS.map((market) => (
                  <SelectItem key={market.value} value={market.value}>
                    {market.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex space-x-2">
            {/* Show common timeframes as buttons */}
            {commonTimeframes.map((tf) => (
              <Button
                key={tf.value}
                size="sm"
                variant="ghost"
                className={`text-xs ${timeframe === tf.value ? "bg-accent-primary/20 text-accent-primary" : "bg-bg-primary"}`}
                onClick={() => handleTimeframeChange(tf.value)}
              >
                {tf.label}
              </Button>
            ))}
            
            {/* More dropdown for additional timeframes */}
            <Select value={timeframe} onValueChange={handleTimeframeChange}>
              <SelectTrigger className={`w-[80px] h-8 text-xs ${isDropdownTimeframe ? "bg-accent-primary/20 text-accent-primary" : "bg-bg-primary"}`}>
                <span>{isDropdownTimeframe && selectedDropdownTimeframe ? selectedDropdownTimeframe.label : "More"}</span>
              </SelectTrigger>
              <SelectContent>
                {dropdownTimeframes.map((tf) => (
                  <SelectItem key={tf.value} value={tf.value}>
                    {tf.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* TradingView Chart Container */}
        <div className="h-[400px] rounded-lg overflow-hidden bg-bg-primary/50 relative">
          {isLoading && !error ? (
            <div className="chart-placeholder absolute inset-0 flex items-center justify-center z-10 bg-bg-darker/80">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2 mx-auto"></div>
                <p className="text-text-secondary text-sm">Loading chart...</p>
              </div>
            </div>
          ) : error ? (
            <div className="chart-placeholder absolute inset-0 flex items-center justify-center z-10 bg-bg-darker/80">
              <div className="text-center">
                <i className="ri-error-warning-line text-4xl text-loss mb-2"></i>
                <p className="text-text-secondary text-sm">{error}</p>
              </div>
            </div>
          ) : null}
          
          {/* This div will contain the TradingView widget */}
          <div
            ref={chartContainerRef}
            id="tv_chart_container"
            className="w-full h-full"
            style={{
              visibility: isLoading ? 'hidden' : 'visible',
              height: '100%',
              width: '100%'
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

