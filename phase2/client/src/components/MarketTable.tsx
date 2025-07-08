import { useBinanceAllMarketData, MarketData } from '@/hooks/useBinanceMarketData';
import { useLocation } from 'wouter';

export default function MarketTable() {
  const { marketData, error, loading } = useBinanceAllMarketData();
  const [, setLocation] = useLocation();

  // Format price with appropriate decimal places based on the symbol
  const formatPrice = (market: MarketData) => {
    let decimals = 2;
    if (market.symbol === 'BTC-PERP') decimals = 1;
    else if (market.symbol === 'DOGE-PERP' || market.symbol === 'XRP-PERP') decimals = 4;
    
    return market.price.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  return (
    <div className="p-4 rounded-xl border border-[#333333] bg-[#1A1A1A] shadow-lg overflow-hidden relative">
        {/* Animated top border effect */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#00F0FF]/0 via-[#00F0FF]/50 to-[#00F0FF]/0 animate-pulse"></div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[#F2F2F2] relative inline-block data-highlight">MARKETS</h2>
      </div>
      
      <div className="mb-4">
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
              <tr 
                key={market.symbol} 
                className="border-b border-[#333333]/30 last:border-none hover:bg-[#00F0FF]/5 cursor-pointer transition-all duration-300 interactive-element"
                onClick={() => {
                  // Navigate to home with the selected market
                  setLocation(`/?market=${market.symbol}&timeframe=1h`);
                }}
                title={`View ${market.symbol} chart`}
              >
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{market.symbol}</span>
                  </div>
                </td>
                <td className="py-3 text-right">
                  <span className="font-medium text-[#00F0FF] font-mono">${formatPrice(market)}</span>
                </td>
                <td className="py-3 text-right">
                  <span className={`font-medium ${market.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {market.percentChange >= 0 ? '+' : ''}{market.percentChange.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {loading && marketData.length === 0 && (
        <div className="text-center py-4">
          <p className="text-white/60">Loading market data...</p>
        </div>
      )}
      
      {error && (
        <div className="text-center py-4">
          <p className="text-red-500">{error}</p>
        </div>
      )}
    </div>
  );
}
