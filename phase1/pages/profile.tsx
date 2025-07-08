"use client";

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { MobileNavigation } from '@/components/mobile-navigation';
import { useWallet } from '@/components/wallet-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Wallet, Trophy, TrendingUp, Calendar, Shield } from 'lucide-react';
import Image from 'next/image';

export default function Profile() {
  const { connected, publicKey, connect } = useWallet();
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Check if window is defined (browser environment)
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 640);
      };
      
      // Set initial value
      handleResize();
      
      // Add event listener
      window.addEventListener('resize', handleResize);
      
      // Cleanup
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  if (!connected) {
    return (
      <div className="min-h-screen bg-dark-bg text-white overflow-x-hidden pb-16 md:pb-0">
        <Navigation />
        
        <section className="pt-24 md:pt-16 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Image src="/images/Logo.png" alt="Liqify Logo" width={48} height={48} />
              <span className="font-bungee text-3xl text-electric-purple">PROFILE</span>
            </div>
            <h1 className="font-orbitron font-black text-4xl md:text-6xl mb-6 gradient-text-primary">
              Connect Your Wallet
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Connect your Solana wallet to view your trading profile, performance history, and competition statistics.
            </p>
            <Button onClick={connect} className="gaming-button px-8 py-3 text-lg">
              <Wallet className="mr-2 h-5 w-5" />
              Connect Wallet
            </Button>
          </div>
        </section>

        <MobileNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white overflow-x-hidden pb-16 md:pb-0">
      <Navigation />
      
      {/* Profile Header */}
      <section className="pt-24 md:pt-16 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-4 mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-electric-purple to-cyber-blue flex items-center justify-center mb-4 sm:mb-0">
              <User className="h-10 w-10 text-white" />
            </div>
            <div className="max-w-full">
              <h1 className="text-3xl font-bold gradient-text-primary">Trading Profile</h1>
              <p className="text-gray-400 text-sm">
                <span className="inline-block">Wallet:</span>
                <span className="inline-block ml-1 break-all">
                  {typeof publicKey === 'string' ? 
                    (isMobile ? 
                      `${publicKey.substring(0, 10)}...${publicKey.substring(publicKey.length - 6)}` : 
                      publicKey)
                    : 'Not connected'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Stats */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="gaming-card nft-card border-electric-purple/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-400">
                  <Trophy className="h-4 w-4" />
                  Competitions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-electric-purple">12</div>
                <p className="text-xs text-gray-500">Total Joined</p>
              </CardContent>
            </Card>

            <Card className="gaming-card nft-card border-cyber-blue/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-400">
                  <TrendingUp className="h-4 w-4" />
                  Win Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyber-blue">67%</div>
                <p className="text-xs text-gray-500">8 of 12 wins</p>
              </CardContent>
            </Card>

            <Card className="gaming-card nft-card border-neon-cyan/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-400">
                  <Shield className="h-4 w-4" />
                  Total Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-neon-cyan">342 USDC</div>
                <p className="text-xs text-gray-500">Net profit</p>
              </CardContent>
            </Card>

            <Card className="gaming-card nft-card border-warning-orange/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-400">
                  <Calendar className="h-4 w-4" />
                  Member Since
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning-orange">Jun 2024</div>
                <p className="text-xs text-gray-500">7 months ago</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Competitions */}
          <Card className="gaming-card nft-card">
            <CardHeader>
              <CardTitle className="gradient-text-primary">Recent Competitions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-dark-bg/50">
                  <div>
                    <h4 className="font-semibold text-white">Weekly Alpha Challenge #47</h4>
                    <p className="text-sm text-gray-400">Completed Dec 28, 2024</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">1st Place</Badge>
                    <p className="text-sm text-green-400 mt-1">+45 USDC</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-dark-bg/50">
                  <div>
                    <h4 className="font-semibold text-white">Daily Grind Challenge #12</h4>
                    <p className="text-sm text-gray-400">Completed Dec 25, 2024</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">3rd Place</Badge>
                    <p className="text-sm text-blue-400 mt-1">+12 USDC</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-dark-bg/50">
                  <div>
                    <h4 className="font-semibold text-white">SOL Surge Competition</h4>
                    <p className="text-sm text-gray-400">Completed Dec 20, 2024</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Liquidated</Badge>
                    <p className="text-sm text-red-400 mt-1">-10 USDC</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Chart Placeholder */}
          <Card className="gaming-card nft-card mt-6">
            <CardHeader>
              <CardTitle className="gradient-text-primary">Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-dark-border rounded-lg">
                <div className="text-center text-gray-400">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Performance chart coming soon</p>
                  <p className="text-sm">Track your PnL over time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <MobileNavigation />
    </div>
  );
}
