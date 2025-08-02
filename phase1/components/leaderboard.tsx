import React from 'react';
import { Player } from '../types';

const mockPlayers: Player[] = [
  {
    id: '1',
    username: 'TraderX',
    walletAddress: '0x12...Ae',
    pnl: 42.5,
    status: 'active',
    rank: 1,
  },
  {
    id: '2',
    username: 'CryptoNinja',
    walletAddress: '0x34...Bf',
    pnl: 28.3,
    status: 'active',
    rank: 2,
  },
  {
    id: '3',
    username: 'DeFiWarrior',
    walletAddress: '0x56...Cd',
    pnl: 15.7,
    status: 'active',
    rank: 3,
  },
  {
    id: '4',
    username: 'SolanaKing',
    walletAddress: '0x78...De',
    pnl: 8.2,
    status: 'trading',
    rank: 4,
  },
  {
    id: '5',
    username: 'PerpMaster',
    walletAddress: '0x9A...Ef',
    pnl: -3.1,
    status: 'struggling',
    rank: 5,
  },
  {
    id: '6',
    username: 'LiquidatedUser',
    walletAddress: '0xBC...Fg',
    pnl: -100,
    status: 'liquidated',
    rank: 6,
  },
];

const getRankIcon = (rank: number, status: string) => {
  if (status === 'liquidated') return '💀';
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return rank.toString();
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'text-neon-cyan';
    case 'trading': return 'text-electric-blue';
    case 'struggling': return 'text-warning-orange';
    case 'liquidated': return 'text-red-500';
    default: return 'text-gray-400';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active': return '🟢';
    case 'trading': return '🟡';
    case 'struggling': return '🔴';
    case 'liquidated': return '💀';
    default: return '⚪';
  }
};

const getPnLColor = (pnl: number) => {
  if (pnl > 0) return 'text-neon-cyan';
  if (pnl < 0) return 'text-red-400';
  return 'text-gray-400';
};

export function Leaderboard() {
  return (
    <section id="leaderboard" className="py-20 bg-gradient-to-b from-dark-bg to-dark-card">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-orbitron font-bold text-center mb-16 gradient-text-primary">
          Arena Leaderboard
        </h2>

        <div className="text-center mb-8">
          <div className="inline-flex items-center bg-dark-card border border-electric-purple/30 rounded-lg px-6 py-3">
            <div className="w-3 h-3 bg-neon-cyan rounded-full animate-pulse mr-2"></div>
            <span className="text-sm font-semibold">Live Rankings</span>
          </div>
        </div>

        <div className="gaming-card rounded-xl overflow-hidden">
          {/* Mobile view */}
          <div className="md:hidden">
            {mockPlayers.map((player) => (
              <div 
                key={player.id} 
                className={`border-b border-dark-border px-4 py-3 ${player.status === 'liquidated' ? 'bg-red-500/10' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl mr-1">
                      {getRankIcon(player.rank, player.status)}
                    </span>
                    <span className={`font-semibold ${player.status === 'liquidated' ? 'text-red-400 line-through' : ''}`}>
                      {player.username}
                    </span>
                  </div>
                  <span className={`font-bold ${getPnLColor(player.pnl)}`}>
                    {player.pnl > 0 ? '+' : ''}{player.pnl}%
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="font-mono text-gray-400">{player.walletAddress}</span>
                  <span className={`capitalize flex items-center ${getStatusColor(player.status)}`}>
                    <span className="mr-1">{getStatusIcon(player.status)}</span>
                    {player.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-electric-purple/20 to-cyber-blue/20 border-b border-dark-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Username</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Wallet</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">%PnL</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {mockPlayers.map((player) => (
                  <tr 
                    key={player.id} 
                    className={`hover:bg-dark-bg/50 transition-colors ${
                      player.status === 'liquidated' ? 'bg-red-500/10' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">
                          {getRankIcon(player.rank, player.status)}
                        </span>
                        {player.status !== 'liquidated' && (
                          <span className={`font-bold ${
                            player.rank === 1 ? 'text-yellow-500' :
                            player.rank === 2 ? 'text-gray-400' :
                            player.rank === 3 ? 'text-orange-400' :
                            'text-gray-500'
                          }`}>
                            {player.rank}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={`px-6 py-4 font-semibold ${
                      player.status === 'liquidated' ? 'text-red-400 line-through' : ''
                    }`}>
                      {player.username}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-400">
                      {player.walletAddress}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-bold text-lg ${getPnLColor(player.pnl)}`}>
                        {player.pnl > 0 ? '+' : ''}{player.pnl}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center">
                        <span className="mr-2">{getStatusIcon(player.status)}</span>
                        <span className={`text-sm capitalize ${getStatusColor(player.status)}`}>
                          {player.status}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-400">
            Rankings update every 30 seconds • Last updated:{' '}
            <span className="text-electric-purple">
              {new Date().toLocaleTimeString('en-US', { timeZone: 'UTC' })} UTC
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
