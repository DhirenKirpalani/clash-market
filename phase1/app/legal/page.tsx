"use client";

import React from 'react';
import { Navigation } from '@/components/navigation';
import { MobileNavigation } from '@/components/mobile-navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';

export default function Legal() {
  return (
    <div className="min-h-screen bg-dark-bg text-white overflow-x-hidden pb-16 md:pb-0">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 md:pt-16 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="font-orbitron font-black text-4xl md:text-6xl mb-6 gradient-text-primary">
            Legal & Compliance
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Important legal information, terms of service, and privacy policies for CLASH MARKET users.
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Terms of Service */}
          <div className="gaming-card nft-card p-8">
            <h2 className="text-2xl font-bold gradient-text-primary mb-6">Terms of Service</h2>
            <ScrollArea className="h-64 pr-4">
              <div className="space-y-4 text-gray-300">
                <h3 className="text-lg font-semibold text-white">1. Acceptance of Terms</h3>
                <p>
                  By accessing and using CLASH MARKET, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
                
                <h3 className="text-lg font-semibold text-white">2. Trading Competitions</h3>
                <p>
                  All trading competitions are conducted with virtual funds in a simulated environment. 
                  Entry fees are collected in USDC and distributed as prizes according to the competition structure.
                </p>
                
                <h3 className="text-lg font-semibold text-white">3. User Responsibilities</h3>
                <p>
                  Users are responsible for maintaining the security of their wallet connections and 
                  ensuring they comply with local regulations regarding trading activities.
                </p>
                
                <h3 className="text-lg font-semibold text-white">4. Risk Disclosure</h3>
                <p>
                  Trading involves substantial risk and may not be suitable for all users. 
                  Past performance does not guarantee future results.
                </p>
                
                <h3 className="text-lg font-semibold text-white">5. Platform Availability</h3>
                <p>
                  We strive to maintain platform availability but cannot guarantee uninterrupted service. 
                  Scheduled maintenance will be announced in advance.
                </p>
              </div>
            </ScrollArea>
          </div>

          {/* Privacy Policy */}
          <div className="gaming-card nft-card p-8">
            <h2 className="text-2xl font-bold gradient-text-primary mb-6">Privacy Policy</h2>
            <ScrollArea className="h-64 pr-4">
              <div className="space-y-4 text-gray-300">
                <h3 className="text-lg font-semibold text-white">Information We Collect</h3>
                <p>
                  We collect wallet addresses, usernames, and trading performance data necessary 
                  for competition participation and leaderboard functionality.
                </p>
                
                <h3 className="text-lg font-semibold text-white">How We Use Information</h3>
                <p>
                  Collected information is used solely for platform functionality, competition management, 
                  and improving user experience. We do not sell personal data to third parties.
                </p>
                
                <h3 className="text-lg font-semibold text-white">Data Security</h3>
                <p>
                  We implement industry-standard security measures to protect user data. 
                  All sensitive operations are conducted on-chain for transparency.
                </p>
                
                <h3 className="text-lg font-semibold text-white">Cookies and Tracking</h3>
                <p>
                  We use minimal cookies for essential platform functionality. 
                  No unnecessary tracking or analytics cookies are employed.
                </p>
              </div>
            </ScrollArea>
          </div>

          {/* Risk Disclosure */}
          <div className="gaming-card nft-card p-8">
            <h2 className="text-2xl font-bold gradient-text-primary mb-6">Risk Disclosure</h2>
            <div className="space-y-4 text-gray-300">
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Important Risk Warning</h3>
                <p>
                  Trading involves substantial risk of loss and may not be suitable for all users. 
                  Only participate with funds you can afford to lose.
                </p>
              </div>
              
              <h3 className="text-lg font-semibold text-white">Competition Risks</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Entry fees are non-refundable once competitions begin</li>
                <li>Trading performance may result in total loss of virtual capital</li>
                <li>Technical issues may affect competition outcomes</li>
                <li>Market volatility can lead to rapid portfolio changes</li>
              </ul>
              
              <h3 className="text-lg font-semibold text-white">Platform Risks</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Blockchain network congestion may affect transactions</li>
                <li>Smart contract risks inherent to DeFi protocols</li>
                <li>Potential for temporary platform downtime</li>
              </ul>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="gaming-card nft-card p-8">
            <h2 className="text-2xl font-bold gradient-text-primary mb-6">Disclaimer</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                CLASH MARKET is a gaming platform that simulates trading competitions. It is not a licensed 
                financial advisor, broker, or investment service. The platform is provided "as is" 
                without warranties of any kind.
              </p>
              
              <p>
                Educational content and competition results should not be considered as financial advice. 
                Users should conduct their own research and consult with qualified financial advisors 
                before making investment decisions.
              </p>
              
              <p>
                CLASH MARKET operates on the Solana blockchain and is subject to the inherent risks and 
                limitations of blockchain technology. Users participate at their own risk.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="gaming-card nft-card p-8 text-center">
            <h2 className="text-2xl font-bold gradient-text-primary mb-6">Contact & Support</h2>
            <p className="text-gray-300 mb-4">
              For legal inquiries, compliance questions, or support issues:
            </p>
            <div className="space-y-2 text-electric-purple">
              <p>Email: legal@clashmarket.io</p>
              <p>Support: support@clashmarket.io</p>
              <p>Discord: discord.gg/clashmarket</p>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Last updated: July 2025
            </p>
          </div>
        </div>
      </section>

      <MobileNavigation />
    </div>
  );
}
