import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatNumber, useHyperliquidMarketData } from '@/hooks/useHyperliquidMarketData';
import { useLocation } from 'wouter';

export default function HyperliquidMarketTable() {
  const { marketData, loading, error } = useHyperliquidMarketData();
  const [, setLocation] = useLocation();
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    if (debugMode) {
      console.log('[Debug] HyperliquidMarketTable current data:', marketData);
    }
  }, [marketData, debugMode]);

  const formatPrice = (symbol: string, price: number | undefined) => {
    if (price === undefined) return '-';
    let decimals = 2;
    if (symbol.includes('BTC')) decimals = 0;
    else if (symbol.includes('DOGE') || symbol.includes('XRP')) decimals = 4;

    return price.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <div className="p-4 rounded-xl border border-[#333333] bg-[#1A1A1A] shadow-lg overflow-hidden relative">
      {/* Animated top border effect */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#00F0FF]/0 via-[#00F0FF]/50 to-[#00F0FF]/0 animate-pulse"></div>

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">HYPERLIQUID MARKETS</h3>
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
              <span className="text-xs text-green-500">Live</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDebugMode(!debugMode)}
              className="text-xs h-6 px-2 border-[#00F0FF]/30 hover:border-[#00F0FF] hover:bg-[#00F0FF]/10"
            >
              {debugMode ? 'Hide Debug' : 'Debug'}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-4">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] text-accent-primary motion-reduce:animate-[spin_1.5s_linear_infinite] mb-2"></div>
              <p className="text-white">Connecting to Hyperliquid...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral/20 text-xs text-neutral">
                  <th className="py-2 text-left pl-2">Instrument</th>
                  <th className="py-2 text-right">Last Price</th>
                  <th className="py-2 text-right">Mid Price</th>
                  <th className="py-2 text-right pr-2">Bid / Ask</th>
                </tr>
              </thead>
              <tbody>
                {marketData.map((market) => (
                  <tr
                    key={market.symbol}
                    className="border-b border-neutral/10 last:border-none hover:bg-[#00F0FF]/5 cursor-pointer"
                    onClick={() => {
                      setLocation(`/?market=${market.symbol}&timeframe=1h`);
                    }}
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">
                          {market.symbol}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-right text-white">
                      {formatPrice(market.symbol, market.lastPrice)}
                    </td>
                    <td className="py-3 text-right text-white">
                      {market.midPrice !== undefined
                        ? formatNumber(market.midPrice)
                        : '-'}
                    </td>
                    <td className="py-3 text-right text-white pr-2">
                      {market.bestBid !== undefined &&
                      market.bestAsk !== undefined
                        ? `${formatNumber(
                            market.bestBid
                          )} / ${formatNumber(market.bestAsk)}`
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        </div>
    </div>
  );
}
