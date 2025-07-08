import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useDrift } from "@/lib/driftAdapter";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

interface MarketPricePanelProps {
  defaultMarket?: string;
  defaultTimeframe?: string;
}

interface ChartData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  date?: string;
}

export default function MarketPricePanel({ defaultMarket = "HYPE/USDC", defaultTimeframe = "15m" }: MarketPricePanelProps) {
  const [market, setMarket] = useState(defaultMarket);
  const [timeframe, setTimeframe] = useState(defaultTimeframe);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getMarketHistory, getMarketPrice } = useDrift();
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [openPrice, setOpenPrice] = useState<number | null>(null);
  const [highPrice, setHighPrice] = useState<number | null>(null);
  const [lowPrice, setLowPrice] = useState<number | null>(null);

  // Fetch market data when market or timeframe changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch historical data
        const data = await getMarketHistory(market, timeframe);
        
        // Format data for Recharts
        const formattedData = data.map((item: ChartData) => ({
          ...item,
          date: new Date(item.timestamp).toLocaleTimeString(),
        }));
        
        setChartData(formattedData);
        
        // Get the latest price
        const price = await getMarketPrice(market);
        setCurrentPrice(price);
        
        // Set OHLC values from the data
        if (formattedData.length > 0) {
          setOpenPrice(formattedData[0].open);
          
          // Find highest and lowest prices in the dataset
          const highestPoint = Math.max(...formattedData.map(d => d.high));
          const lowestPoint = Math.min(...formattedData.map(d => d.low));
          
          setHighPrice(highestPoint);
          setLowPrice(lowestPoint);
        }
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
        setError("Failed to load chart data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Set up interval to refresh data
    const intervalId = setInterval(fetchData, 15000);
    
    return () => clearInterval(intervalId);
  }, [market, timeframe, getMarketHistory, getMarketPrice]);

  const timeframes = [
    { label: "1m", value: "1m" },
    { label: "5m", value: "5m" },
    { label: "15m", value: "15m" },
    { label: "1h", value: "1h" },
    { label: "4h", value: "4h" },
  ];
  
  // Price formatter for tooltips
  const formatPrice = (value: number) => {
    return `${value.toLocaleString(undefined, { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };
  
  // Get price change data
  const getPriceChange = () => {
    if (chartData.length < 2 || !openPrice || !currentPrice) return { value: 0, percentage: 0 };
    
    const change = currentPrice - openPrice;
    const percentage = (change / openPrice) * 100;
    
    return {
      value: change,
      percentage: percentage
    };
  };
  
  const priceChange = getPriceChange();
  const isPriceUp = priceChange.value >= 0;

  return (
    <div className="p-4 bg-bg-darker rounded-xl border border-neutral/10">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white">{market}</h2>
        
        <div className="grid grid-cols-4 gap-4 my-4">
          <div>
            <div className="text-text-secondary text-sm">Open</div>
            <div className="text-white text-lg">{openPrice ? formatPrice(openPrice) : "-"}</div>
          </div>
          <div>
            <div className="text-text-secondary text-sm">High</div>
            <div className="text-white text-lg">{highPrice ? formatPrice(highPrice) : "-"}</div>
          </div>
          <div>
            <div className="text-text-secondary text-sm">Low</div>
            <div className="text-white text-lg">{lowPrice ? formatPrice(lowPrice) : "-"}</div>
          </div>
          <div>
            <div className="text-text-secondary text-sm">Close</div>
            <div className="text-white text-lg">{currentPrice ? formatPrice(currentPrice) : "-"}</div>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="text-white text-2xl font-medium">{currentPrice ? formatPrice(currentPrice) : "-"}</div>
          <div className={`ml-3 text-lg ${isPriceUp ? 'text-profit' : 'text-loss'}`}>
            {isPriceUp ? '+' : ''}{priceChange.percentage.toFixed(2)}%
          </div>
        </div>
      </div>
      
      <div className="h-60 rounded-lg overflow-hidden bg-bg-primary/20">
        {isLoading && chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-text-secondary text-sm">Loading chart...</p>
            </div>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-text-secondary text-sm">{error}</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset="5%" 
                    stopColor={isPriceUp ? "rgb(74, 222, 128)" : "rgb(248, 113, 113)"} 
                    stopOpacity={0.3} 
                  />
                  <stop 
                    offset="95%" 
                    stopColor={isPriceUp ? "rgb(74, 222, 128)" : "rgb(248, 113, 113)"} 
                    stopOpacity={0} 
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10, fill: '#A0A0B0' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                domain={['auto', 'auto']}
                tick={{ fontSize: 10, fill: '#A0A0B0' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatPrice}
                orientation="right"
              />
              <Tooltip 
                formatter={(value: number) => [formatPrice(value), 'Price']}
                labelFormatter={(label) => `Time: ${label}`}
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  borderColor: '#374151',
                  color: '#f3f4f6'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="close" 
                stroke={isPriceUp ? "rgb(74, 222, 128)" : "rgb(248, 113, 113)"} 
                fillOpacity={1}
                fill="url(#colorPrice)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
