import React from 'react';
import dynamic from 'next/dynamic';
import { Twitter, MessageCircle, Send } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Import components with SSR disabled to prevent hydration errors
const Navigation = dynamic(
  () => import('@/components/navigation').then((mod) => mod.Navigation),
  { ssr: false }
);

const MobileNavigation = dynamic(
  () => import('@/components/mobile-navigation').then((mod) => mod.MobileNavigation),
  { ssr: false }
);

const FloatingElements = dynamic(
  () => import('@/components/floating-elements').then((mod) => mod.FloatingElements),
  { ssr: false }
);

const FloatingCoins = dynamic(
  () => import('@/components/floating-coins').then((mod) => mod.FloatingCoins),
  { ssr: false }
);

const HeroSection = dynamic(
  () => import('@/components/hero-section').then((mod) => mod.HeroSection),
  { ssr: false }
);

const JoinChallenge = dynamic(
  () => import('@/components/join-challenge').then((mod) => mod.JoinChallenge),
  { ssr: false }
);

const RulesRewards = dynamic(
  () => import('@/components/rules-rewards').then((mod) => mod.RulesRewards),
  { ssr: false }
);

const Leaderboard = dynamic(
  () => import('@/components/leaderboard').then((mod) => mod.Leaderboard),
  { ssr: false }
);

const Waitlist = dynamic(
  () => import('@/components/waitlist').then((mod) => mod.Waitlist),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="min-h-screen bg-dark-bg text-white overflow-x-hidden relative">
      <FloatingElements />
      <Navigation />
      <HeroSection />
      <JoinChallenge />
      <RulesRewards />
      <Leaderboard />
      <Waitlist />
      <MobileNavigation />
      
      {/* Footer */}
      <footer className="bg-dark-card border-t border-dark-border py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Image src="/images/Logo.png" alt="Liqify Logo" width={32} height={32} />
                <span className="font-bungee text-xl text-electric-purple">LIQIFY</span>
              </div>
              <p className="text-sm text-gray-400">
                The ultimate arena for crypto traders. Compete, conquer, collect.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-electric-purple transition-colors">About</Link></li>
                <li><a href="#" className="hover:text-electric-purple transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-electric-purple transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-cyber-blue transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-cyber-blue transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-cyber-blue transition-colors">Telegram</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/legal" className="hover:text-neon-cyan transition-colors">Terms & Legal</Link></li>
                <li><Link href="/legal" className="hover:text-neon-cyan transition-colors">Privacy Policy</Link></li>
                <li><Link href="/legal" className="hover:text-neon-cyan transition-colors">Risk Disclosure</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-dark-border mt-8 pt-8 text-center text-sm text-gray-500">
            <div className="flex items-center justify-center space-x-6 mb-4">
              <a href="#" className="text-gray-400 hover:text-electric-purple transition-colors">
                <MessageCircle className="h-5 w-5" />
                <span className="sr-only">Discord</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-cyber-blue transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter / X</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-neon-cyan transition-colors">
                <Send className="h-5 w-5" />
                <span className="sr-only">Telegram</span>
              </a>
            </div>
            © 2025 Liqify. Built on Solana. Trade responsibly.
          </div>
        </div>
      </footer>
    </div>
  );
}
