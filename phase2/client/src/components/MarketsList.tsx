import { useState, useEffect, useCallback, useMemo } from 'react';
import { useHyperliquidMarketData } from '@/hooks/useHyperliquidMarketData';
import { useLocation } from 'wouter';
import { Loader2, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import SparklineChart from './SparklineChart';

interface ProcessedMarketData {
  name: string;
  symbol: string;
  id: string;
  price: number;
  volume: number;
  change: number;
  sparkline: number[];
}

const TokenIcon = ({ symbol }: { symbol: string }) => {
  const styles: Record<string, string> = {
    BTC: 'bg-[#F7931A]',
    ETH: 'bg-[#627EEA]',
    SOL: 'bg-black bg-gradient-to-r from-[#9945FF] to-[#14F195]',
    XRP: 'bg-white text-black',
    DOGE: 'bg-[#C3A634]',
    AVAX: 'bg-[#E84142]',
  };

  const icons: Record<string, string> = {
    BTC: '₿',
    ETH: 'Ξ',
    SOL: '◎',
    XRP: '✕',
    DOGE: 'Ð',
    AVAX: 'A',
  };

  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${styles[symbol] || 'bg-gray-700 text-white'}`}>
      <span className="text-sm font-bold">{icons[symbol] || symbol.charAt(0)}</span>
    </div>
  );
};

export default function MarketsList() {
  const [, setLocation] = useLocation();
  const [marketData, setMarketData] = useState<ProcessedMarketData[]>([]);
  const [priceHistory, setPriceHistory] = useState<Record<string, number[]>>({});
  const [prevMidPrices, setPrevMidPrices] = useState<Record<string, number>>({});
  const { marketData: rawMarkets, loading, error } = useHyperliquidMarketData();

  const MAX_CHART_POINTS = 24;

  const updatePriceHistory = useCallback((symbol: string, price: number) => {
    if (!price) return;
    setPriceHistory(prev => {
      const history = prev[symbol] || [];
      if (history[history.length - 1] !== price) {
        const newHistory = [...history, price].slice(-MAX_CHART_POINTS);
        return { ...prev, [symbol]: newHistory };
      }
      return prev;
    });

    setPrevMidPrices(prev => {
      if (prev[symbol] === undefined) {
        return { ...prev, [symbol]: price };
      }
      return prev;
    });
  }, []);

  const generateSparklineData = useCallback((symbol: string, isPositive: boolean) => {
    const hash = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return Array.from({ length: MAX_CHART_POINTS }, (_, i) => {
      const trend = isPositive ? i * 0.5 : -i * 0.5;
      const noise = Math.sin(i * 0.5 + hash) * 10;
      const base = 100 + (hash % 50);
      return base + trend + noise;
    });
  }, []);

  useEffect(() => {
    if (!loading && rawMarkets?.length > 0) {
      rawMarkets.forEach(market => {
        const price = market.midPrice ?? market.lastPrice ?? 0;
        updatePriceHistory(market.symbol, price);
      });
    }
  }, [loading, rawMarkets, updatePriceHistory]);

  useEffect(() => {
    if (!loading && rawMarkets?.length > 0) {
      const processed = rawMarkets.map(market => {
        const symbol = market.symbol;
        const currentPrice = market.midPrice ?? market.lastPrice ?? 0;
        const prevPrice = prevMidPrices[symbol] ?? currentPrice;
        const volume = market.dayNtlVlm ?? 0;

        const change = prevPrice ? ((currentPrice - prevPrice) / prevPrice) * 100 : 0;
        const sparkline = priceHistory[symbol] || generateSparklineData(symbol, change >= 0);

        return {
          name: symbol,
          symbol,
          id: symbol.toLowerCase(),
          price: currentPrice,
          volume,
          change,
          sparkline,
        };
      });

      setMarketData(processed);
    }
  }, [loading, rawMarkets, priceHistory, prevMidPrices, generateSparklineData]);

  const sortedMarkets = useMemo(() => [...marketData].sort((a, b) => b.volume - a.volume), [marketData]);

  const formatPrice = (price: number) => price >= 1 ? `$${price.toFixed(2)}` : `$${price.toFixed(5)}`;
  const formatChange = (change: number) => `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  const formatVolume = (vol: number) =>
    vol >= 1_000_000 ? `$${(vol / 1_000_000).toFixed(2)}M` :
    vol >= 1_000 ? `$${(vol / 1_000).toFixed(2)}K` :
    `$${vol.toFixed(2)}`;

  const handleNavigateToTrade = (token: string, market: ProcessedMarketData) => {
    localStorage.setItem('tradeMarketData', JSON.stringify({ market, symbol: token, price: market.price, change24h: market.change }));
    setLocation(`/trade/${token}`);
  };

  if (loading) return <div className="text-center py-10"><Loader2 className="animate-spin inline" /> Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500"><AlertCircle className="inline mr-2" />{error}</div>;

  return (
    <div className="p-5 rounded-xl border border-neutral/10 bg-gradient-to-r from-indigo-950/30 to-black/50 backdrop-blur-sm shadow-lg mb-16">
      <h2 className="text-xl font-bold text-white mb-4">Markets</h2>
      <table className="w-full mt-4 border-separate border-spacing-y-2.5">
        <thead>
          <tr className="border-b border-neutral-800">
            <th className="text-left py-2 text-sm font-medium text-neutral-400">Asset</th>
            <th className="text-center hidden md:table-cell py-2 text-sm font-medium text-neutral-400">Chart</th>
            <th className="text-right py-2 text-sm font-medium text-neutral-400">Price</th>
            <th className="text-right py-2 text-sm font-medium text-neutral-400">Change</th>
          </tr>
        </thead>
        <tbody>
          {sortedMarkets.map(market => {
            const token = market.symbol;
            const isPositive = market.change >= 0;
            const changeColor = isPositive ? 'text-green-500' : 'text-red-500';
            const changeIcon = isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;
            const sparklineColor = isPositive ? 'rgba(52, 211, 153, 0.8)' : 'rgba(248, 113, 113, 0.8)';

            return (
              <tr key={market.id} onClick={() => handleNavigateToTrade(token, market)} className="hover:bg-indigo-900/40 cursor-pointer bg-indigo-950/20 backdrop-blur-sm rounded-lg transition-all duration-200 shadow-sm hover:shadow-indigo-500/20">
                <td className="py-3.5 px-4 rounded-l-lg">
                  <div className="flex items-center">
                    <TokenIcon symbol={token} />
                    <div className="ml-3">
                      <div className="text-white font-semibold text-sm">{token} <span className="text-neutral-400 text-xs font-normal">PERP</span></div>
                      <div className="text-xs text-neutral-400">{formatVolume(market.volume)}</div>
                    </div>
                  </div>
                </td>
                <td className="hidden md:table-cell py-3.5 px-2">
                  <div className="w-28 h-8 mx-auto">
                    <SparklineChart data={market.sparkline} color={sparklineColor} height={32} width={112} fillGradient={[sparklineColor.replace('0.8', '0.2'), 'rgba(0,0,0,0)']} />
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right text-sm text-white font-mono">{formatPrice(market.price)}</td>
                <td className="py-3.5 px-4 text-right text-sm rounded-r-lg">
                  <span className={`font-medium inline-flex items-center ${changeColor}`}>
                    {changeIcon}
                    <span className="ml-1">{formatChange(market.change)}</span>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
