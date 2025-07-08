import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface MarketData {
  symbol: string;
  price: string;
  priceChangePercent: string;
}

export default function MarketDataTable() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // List of markets to display
  const markets = [
    { id: 'BTC-PERP', symbol: 'BTCUSDT' },
    { id: 'ETH-PERP', symbol: 'ETHUSDT' },
    { id: 'SOL-PERP', symbol: 'SOLUSDT' },
    { id: 'XRP-PERP', symbol: 'XRPUSDT' },
    { id: 'DOGE-PERP', symbol: 'DOGEUSDT' },
    { id: 'AVAX-PERP', symbol: 'AVAXUSDT' }
  ];
  
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        // Fetch 24hr ticker price change statistics for all symbols
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        const data = await response.json();
        
        // Filter and format the data for our markets
        const filteredData = markets.map(market => {
          const marketData = data.find((item: any) => item.symbol === market.symbol);
          return {
            symbol: market.id,
            price: marketData ? parseFloat(marketData.lastPrice).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: marketData.symbol === 'BTCUSDT' ? 0 : 
                                     marketData.symbol === 'ETHUSDT' ? 2 :
                                     marketData.symbol === 'DOGEUSDT' || marketData.symbol === 'XRPUSDT' ? 4 : 2
            }) : '0.00',
            priceChangePercent: marketData ? parseFloat(marketData.priceChangePercent).toFixed(1) : '0.0'
          };
        });
        
        setMarketData(filteredData);
      } catch (error) {
        console.error('Failed to fetch market data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMarketData();
    
    // Refresh data every 10 seconds
    const intervalId = setInterval(fetchMarketData, 10000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <Card className="rounded-xl border border-neutral/10" style={{ backgroundColor: "#000C28" }}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">MARKETS</h3>
        </div>
        
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-4">
              <p className="text-white">Loading market data...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-sm text-neutral-400 border-b border-neutral/10">
                  <th className="text-left pb-2">Market</th>
                  <th className="text-right pb-2">Price</th>
                  <th className="text-right pb-2">24h Change</th>
                </tr>
              </thead>
              <tbody>
                {marketData.map((market) => (
                  <tr key={market.symbol} className="border-b border-neutral/10 last:border-none">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{market.symbol}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <span className="font-medium text-white">${market.price}</span>
                    </td>
                    <td className="py-3 text-right">
                      <span className={`font-medium ${parseFloat(market.priceChangePercent) >= 0 
                        ? 'text-green-500' 
                        : 'text-red-500'}`}>
                        {parseFloat(market.priceChangePercent) >= 0 ? '+' : ''}{market.priceChangePercent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
