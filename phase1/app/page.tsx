"use client";

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Footer } from '@/components/footer';

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


const GameModes = dynamic(
  () => import('@/components/game-modes').then((mod) => mod.GameModes),
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
      <GameModes />
      <RulesRewards />
      <Leaderboard />
      <Waitlist />
      <MobileNavigation />
      <Footer />
    </div>
  );
}
