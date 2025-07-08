import React from 'react';
import { Clock, TrendingUp, Brain, Skull, Trophy, Lock } from 'lucide-react';

export function RulesRewards() {
  return (
    <section id="rules" className="py-20 bg-dark-bg">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-orbitron font-bold text-center mb-16 gradient-text-primary">
          Rules of Combat
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="gaming-card nft-card rounded-xl p-6 hover:shadow-neon transition-all duration-300 animate-float-slow">
            <div className="text-center mb-4">
              <Clock className="text-4xl text-neon-cyan mb-4 mx-auto h-16 w-16" />
              <h3 className="text-xl font-bold">Challenge Duration</h3>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-neon-cyan">8 Hours</p>
              <p className="text-sm text-gray-400">July 6, 10AM-6PM UTC</p>
            </div>
          </div>

          <div className="gaming-card nft-card rounded-xl p-6 hover:shadow-neon-purple transition-all duration-300 animate-float-medium">
            <div className="text-center mb-4">
              <TrendingUp className="text-4xl text-electric-purple mb-4 mx-auto h-16 w-16" />
              <h3 className="text-xl font-bold">Allowed Markets</h3>
            </div>
            <div className="space-y-2 text-center">
              <div className="bg-dark-bg rounded px-3 py-1 text-sm">SOL-PERP</div>
              <div className="bg-dark-bg rounded px-3 py-1 text-sm">ETH-PERP</div>
              <div className="bg-dark-bg rounded px-3 py-1 text-sm">BTC-PERP</div>
            </div>
          </div>

          <div className="gaming-card nft-card rounded-xl p-6 hover:shadow-electric transition-all duration-300 animate-float-fast">
            <div className="text-center mb-4">
              <Brain className="text-4xl text-cyber-blue mb-4 mx-auto h-16 w-16" />
              <h3 className="text-xl font-bold">Winning Metric</h3>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">%PnL Formula:</p>
              <p className="font-mono text-cyber-blue">((Equity - 100) / 100) * 100</p>
            </div>
          </div>

          <div className="gaming-card nft-card rounded-xl p-6 hover:border-red-500/50 transition-all duration-300 animate-float-slow">
            <div className="text-center mb-4">
              <Skull className="text-4xl text-red-500 mb-4 mx-auto h-16 w-16" />
              <h3 className="text-xl font-bold text-red-500">Disqualifiers</h3>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <span className="mr-2">💀</span>
                Liquidation
              </li>
              <li className="flex items-center">
                <span className="mr-2">⚠️</span>
                Unauthorized pairs
              </li>
              <li className="flex items-center">
                <span className="mr-2">💰</span>
                Margin deposits
              </li>
              <li className="flex items-center">
                <span className="mr-2">🔄</span>
                Wallet mismatch
              </li>
            </ul>
          </div>

          <div className="gaming-card nft-card rounded-xl p-6 hover:border-yellow-500/50 transition-all duration-300 animate-float-medium">
            <div className="text-center mb-4">
              <Trophy className="text-4xl text-yellow-500 mb-4 mx-auto h-16 w-16" />
              <h3 className="text-xl font-bold text-yellow-500">Prize Structure</h3>
            </div>
            <div className="space-y-2 text-center text-sm">
              <div className="flex justify-between">
                <span>🥇 1st:</span>
                <span className="text-yellow-500">70%</span>
              </div>
              <div className="flex justify-between">
                <span>🥈 2nd:</span>
                <span className="text-gray-400">20%</span>
              </div>
              <div className="flex justify-between">
                <span>🥉 3rd:</span>
                <span className="text-orange-400">10%</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">Platform fee: 5-10%</div>
            </div>
          </div>

          <div className="gaming-card nft-card rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300 animate-float-fast">
            <div className="text-center mb-4">
              <Lock className="text-4xl text-blue-500 mb-4 mx-auto h-16 w-16" />
              <h3 className="text-xl font-bold text-blue-500">Fund Security</h3>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">All entry fees held in</p>
              <p className="font-semibold text-blue-500">Smart Contract Escrow</p>
              <p className="text-xs text-gray-500 mt-2">Released automatically to winners</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
