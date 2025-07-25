"use client";

import React from 'react';
import { Sword, Trophy, Users, Flame, Coins, Clock, Shield, Target } from 'lucide-react';

export function GameModes() {
  return (
    <section id="game-modes" className="py-20 bg-dark-bg">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-orbitron font-bold text-center mb-6 gradient-text-primary">
          Choose Your Battle
        </h2>
        <p className="text-xl text-center text-gray-300 mb-16 max-w-3xl mx-auto">
          Test your trading skills in head-to-head duels or compete in tournaments with dozens of players
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* PvP Mode Card */}
          <div className="gaming-card glow-border rounded-xl p-8 hover:shadow-neon transition-all duration-300">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-cyber-blue/20 flex items-center justify-center">
                <Sword className="h-10 w-10 text-cyber-blue" />
              </div>
            </div>
            <h3 className="text-2xl font-orbitron font-bold text-center mb-4 text-cyber-blue">
              PvP Trading Duels
            </h3>
            <p className="text-center text-gray-300 mb-6">
              Challenge specific opponents to direct trading competitions. Winner takes the pot!
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-dark-bg p-4 rounded-lg text-center">
                <Users className="h-6 w-6 text-cyber-blue mx-auto mb-2" />
                <p className="text-sm">1v1 Matchups</p>
              </div>
              <div className="bg-dark-bg p-4 rounded-lg text-center">
                <Flame className="h-6 w-6 text-cyber-blue mx-auto mb-2" />
                <p className="text-sm">Custom Stakes</p>
              </div>
              <div className="bg-dark-bg p-4 rounded-lg text-center">
                <Clock className="h-6 w-6 text-cyber-blue mx-auto mb-2" />
                <p className="text-sm">Flexible Duration</p>
              </div>
              <div className="bg-dark-bg p-4 rounded-lg text-center">
                <Target className="h-6 w-6 text-cyber-blue mx-auto mb-2" />
                <p className="text-sm">Direct Challenges</p>
              </div>
            </div>
            

          </div>
          
          {/* Tournament Mode Card */}
          <div className="gaming-card glow-border rounded-xl p-8 hover:shadow-neon-purple transition-all duration-300">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-electric-purple/20 flex items-center justify-center">
                <Trophy className="h-10 w-10 text-electric-purple" />
              </div>
            </div>
            <h3 className="text-2xl font-orbitron font-bold text-center mb-4 text-electric-purple">
              Weekly Championships
            </h3>
            <p className="text-center text-gray-300 mb-6">
              Compete against dozens of traders in scheduled tournaments with massive prize pools.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-dark-bg p-4 rounded-lg text-center">
                <Users className="h-6 w-6 text-electric-purple mx-auto mb-2" />
                <p className="text-sm">32+ Players</p>
              </div>
              <div className="bg-dark-bg p-4 rounded-lg text-center">
                <Coins className="h-6 w-6 text-warning-orange mx-auto mb-2" />
                <p className="text-sm">10 USDC Entry</p>
              </div>
              <div className="bg-dark-bg p-4 rounded-lg text-center">
                <Clock className="h-6 w-6 text-electric-purple mx-auto mb-2" />
                <p className="text-sm">Weekly Events</p>
              </div>
              <div className="bg-dark-bg p-4 rounded-lg text-center">
                <Shield className="h-6 w-6 text-electric-purple mx-auto mb-2" />
                <p className="text-sm">750 USDC Pool</p>
              </div>
            </div>
            

          </div>
        </div>
      </div>
    </section>
  );
}
