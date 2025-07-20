"use client";

import React from 'react';
import { TrendingUp, Users, Trophy, Calendar, Wallet, Activity } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm md:text-base text-gray-400 mt-1">
            Welcome to the Clash Market admin portal
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-6 md:mb-8">
        <div className="bg-dark-bg/50 border border-electric-purple/20 rounded-lg p-5 shadow-glow-sm overflow-hidden relative group">
          <div className="absolute inset-0 bg-electric-purple/5 group-hover:bg-electric-purple/10 transition-all duration-300"></div>
          <div className="relative z-10">
            <h3 className="text-lg mb-2 text-electric-purple font-medium">Active Tournaments</h3>
            <div className="text-3xl font-bold font-orbitron">3</div>
          </div>
          <div className="absolute -bottom-3 -right-3 text-electric-purple/20 group-hover:text-electric-purple/30 transition-all">
            <Trophy className="w-16 h-16" />
          </div>
        </div>
        
        <div className="bg-dark-bg/50 border border-cyber-blue/20 rounded-lg p-5 shadow-glow-sm overflow-hidden relative group">
          <div className="absolute inset-0 bg-cyber-blue/5 group-hover:bg-cyber-blue/10 transition-all duration-300"></div>
          <div className="relative z-10">
            <h3 className="text-lg mb-2 text-cyber-blue font-medium">Registered Players</h3>
            <div className="text-3xl font-bold font-orbitron">156</div>
          </div>
          <div className="absolute -bottom-3 -right-3 text-cyber-blue/20 group-hover:text-cyber-blue/30 transition-all">
            <Users className="w-16 h-16" />
          </div>
        </div>
        
        <div className="bg-dark-bg/50 border border-neon-cyan/20 rounded-lg p-5 shadow-glow-sm overflow-hidden relative group">
          <div className="absolute inset-0 bg-neon-cyan/5 group-hover:bg-neon-cyan/10 transition-all duration-300"></div>
          <div className="relative z-10">
            <h3 className="text-lg mb-2 text-neon-cyan font-medium">Total Prize Pool</h3>
            <div className="text-3xl font-bold font-orbitron">5,000 USDC</div>
          </div>
          <div className="absolute -bottom-3 -right-3 text-neon-cyan/20 group-hover:text-neon-cyan/30 transition-all">
            <Wallet className="w-16 h-16" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="border border-dark-border bg-dark-bg/50 rounded-lg p-4 md:p-5 shadow-glow-sm">
          <h3 className="text-base md:text-lg mb-3 md:mb-4 text-electric-purple font-medium flex items-center">
            <Calendar className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            Upcoming Tournaments
          </h3>
          <div className="space-y-2 md:space-y-3">
            <div className="p-2 md:p-3 border border-dark-border rounded-md bg-dark-bg/70 hover:bg-dark-bg transition-all">
              <div className="flex flex-wrap md:flex-nowrap justify-between items-center">
                <span className="font-medium text-sm md:text-base">Weekly Championship</span>
                <span className="text-xs md:text-sm text-gray-400 w-full md:w-auto mt-1 md:mt-0">July 15 - 21</span>
              </div>
              <div className="flex justify-between items-center mt-2 text-xs md:text-sm">
                <span className="text-cyber-blue">64 participants</span>
                <span className="text-neon-cyan">1,500 USDC pool</span>
              </div>
            </div>
            <div className="p-2 md:p-3 border border-dark-border rounded-md bg-dark-bg/70 hover:bg-dark-bg transition-all">
              <div className="flex flex-wrap md:flex-nowrap justify-between items-center">
                <span className="font-medium text-sm md:text-base">Pro Trader Invitational</span>
                <span className="text-xs md:text-sm text-gray-400 w-full md:w-auto mt-1 md:mt-0">Aug 1 - 3</span>
              </div>
              <div className="flex justify-between items-center mt-2 text-xs md:text-sm">
                <span className="text-cyber-blue">32 participants</span>
                <span className="text-neon-cyan">1,600 USDC pool</span>
              </div>
            </div>
          </div>
          <div className="mt-3 md:mt-4 text-center">
            <a href="/admin/tournaments" className="text-xs md:text-sm text-electric-purple hover:underline">View all tournaments</a>
          </div>
        </div>
        
        <div className="border border-dark-border bg-dark-bg/50 rounded-lg p-4 md:p-5 shadow-glow-sm">
          <h3 className="text-base md:text-lg mb-3 md:mb-4 text-cyber-blue font-medium flex items-center">
            <Activity className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            Admin Activity
          </h3>
          <div className="space-y-2 md:space-y-3">
            <div className="p-2 md:p-3 border border-dark-border rounded-md bg-dark-bg/70 hover:bg-dark-bg transition-all">
              <div className="flex flex-wrap md:flex-nowrap justify-between items-center">
                <span className="font-medium text-sm md:text-base">Tournament Created</span>
                <span className="text-xs md:text-sm text-gray-400 w-full md:w-auto mt-1 md:mt-0">Today, 9:45 AM</span>
              </div>
              <div className="mt-1 text-xs md:text-sm text-gray-400">Weekly Championship was created by admin</div>
            </div>
            <div className="p-2 md:p-3 border border-dark-border rounded-md bg-dark-bg/70 hover:bg-dark-bg transition-all">
              <div className="flex flex-wrap md:flex-nowrap justify-between items-center">
                <span className="font-medium text-sm md:text-base">Registration Opened</span>
                <span className="text-xs md:text-sm text-gray-400 w-full md:w-auto mt-1 md:mt-0">Yesterday, 3:22 PM</span>
              </div>
              <div className="mt-1 text-xs md:text-sm text-gray-400">Registration opened for Pro Trader Invitational</div>
            </div>
            <div className="p-2 md:p-3 border border-dark-border rounded-md bg-dark-bg/70 hover:bg-dark-bg transition-all">
              <div className="flex flex-wrap md:flex-nowrap justify-between items-center">
                <span className="font-medium text-sm md:text-base">Tournament Concluded</span>
                <span className="text-xs md:text-sm text-gray-400 w-full md:w-auto mt-1 md:mt-0">July 9, 5:00 PM</span>
              </div>
              <div className="mt-1 text-xs md:text-sm text-gray-400">Summer Trading Cup concluded with 128 participants</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
