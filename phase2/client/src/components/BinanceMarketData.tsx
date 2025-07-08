import React from 'react';
import { useBinanceAllMarketData } from '@/hooks/useBinanceMarketData';
import { Link } from 'wouter';

const BinanceMarketList = () => {
  const { marketData, error } = useBinanceAllMarketData();

  return (
    <div className="p-6 rounded-xl bg-bg-secondary border border-neutral/20">
      <h2 className="text-xl font-bold mb-4 text-text-primary">📊 Market Data: BTC/USDC & SOL/USDC</h2>

      {error && <div className="text-loss mb-4">{error}</div>}

      <div className="overflow-auto max-h-[600px]">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="sticky top-0 bg-bg-primary z-10">
            <tr className="text-text-secondary border-b border-border">
              <th className="px-4 py-2 font-medium">Symbol</th>
              <th className="px-4 py-2 font-medium">Price (USDC)</th>
              <th className="px-4 py-2 font-medium">24h Change</th>
              <th className="px-4 py-2 font-medium">24h % Change</th>
              <th className="px-4 py-2 font-medium">Volume</th>
            </tr>
          </thead>
          <tbody>
            {marketData.map((symbolData: any) => {
              const price = parseFloat(symbolData.c).toFixed(2);
              const change = parseFloat(symbolData.p);
              const percentChange = parseFloat(symbolData.P);
              const volume = parseFloat(symbolData.v).toFixed(2);

              const signedChange = change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2);
              const signedPercent = percentChange >= 0 ? `+${percentChange.toFixed(2)}%` : `${percentChange.toFixed(2)}%`;
              const changeColor = change >= 0 ? 'text-profit' : 'text-loss';

              return (
                <tr key={symbolData.s} className="border-b border-border hover:bg-[#1A1C25] transition-colors">
                  <td className="px-4 py-2 text-text-primary">
                    <Link href={`/charts/${symbolData.s.toLowerCase()}`}>
                      <span className="text-accent-primary hover:underline cursor-pointer">{symbolData.s}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-accent-primary">${price}</td>
                  <td className={`px-4 py-2 ${changeColor}`}>{signedChange}</td>
                  <td className={`px-4 py-2 ${changeColor}`}>{signedPercent}</td>
                  <td className="px-4 py-2 text-text-secondary">{volume}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BinanceMarketList;