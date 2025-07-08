import React from 'react';
import { Navigation } from '@/components/navigation';
import { MobileNavigation } from '@/components/mobile-navigation';
import { Shield, Target, Users, Zap } from 'lucide-react';
import Image from 'next/image';

export default function About() {
  return (
    <div className="min-h-screen bg-dark-bg text-white overflow-x-hidden pb-16 md:pb-0">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 md:pt-16 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Image src="/images/Logo.png" alt="Liqify Logo" width={48} height={48} />
            <span className="font-bungee text-3xl text-electric-purple">LIQIFY</span>
          </div>
          <h1 className="font-orbitron font-black text-4xl md:text-6xl mb-6 gradient-text-primary">
            About LIQIFY
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            The premier gaming platform for competitive crypto trading on Solana. 
            Where skill meets strategy in the ultimate financial arena.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold gradient-text-primary mb-4">Our Mission</h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              To democratize competitive trading by creating a fair, transparent, and gamified platform 
              where traders of all levels can compete, learn, and excel in the world of decentralized finance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="gaming-card nft-card p-6 text-center hover:border-electric-purple/50 transition-all duration-300">
              <Target className="h-12 w-12 text-electric-purple mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3 text-white">Precision Trading</h3>
              <p className="text-gray-400">
                Advanced tools and real-time data to make informed trading decisions in competitive environments.
              </p>
            </div>

            <div className="gaming-card nft-card p-6 text-center hover:border-cyber-blue/50 transition-all duration-300">
              <Users className="h-12 w-12 text-cyber-blue mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3 text-white">Community First</h3>
              <p className="text-gray-400">
                Building a vibrant community of traders who learn from each other and grow together.
              </p>
            </div>

            <div className="gaming-card nft-card p-6 text-center hover:border-neon-cyan/50 transition-all duration-300">
              <Shield className="h-12 w-12 text-neon-cyan mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3 text-white">Security First</h3>
              <p className="text-gray-400">
                Built on Solana with the highest security standards to protect your assets and trading data.
              </p>
            </div>

            <div className="gaming-card nft-card p-6 text-center hover:border-warning-orange/50 transition-all duration-300">
              <Zap className="h-12 w-12 text-warning-orange mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3 text-white">Lightning Fast</h3>
              <p className="text-gray-400">
                Leveraging Solana's speed and low fees for seamless trading experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4 bg-dark-card/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold gradient-text-primary mb-8 text-center">Our Story</h2>
          <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
            <p>
              LIQIFY was born from the vision of creating a fairer, more accessible way for traders 
              to compete and improve their skills. Traditional trading competitions often favor 
              those with the largest capital, but we believe skill should be the deciding factor.
            </p>
            <p>
              By implementing equal starting capital and risk management rules, we've created 
              an environment where strategy, timing, and market knowledge determine success. 
              Our platform gamifies the trading experience while maintaining the serious 
              financial education component that helps traders grow.
            </p>
            <p>
              Built on Solana blockchain, LIQIFY offers transparency, security, and speed 
              that traditional platforms cannot match. Every transaction, every trade, 
              and every competition result is verifiable on-chain.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold gradient-text-primary mb-12">Built by Traders, for Traders</h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Our team combines decades of trading experience with cutting-edge blockchain technology. 
            We understand the challenges traders face because we've been there ourselves.
          </p>
        </div>
      </section>

      <MobileNavigation />
    </div>
  );
}
