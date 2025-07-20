"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Twitter, MessageCircle, Send } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-dark-card border-t border-dark-border py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Image src="/images/Logo.png" alt="Clash Market Logo" width={70} height={70} />
              {/* <span className="font-bungee text-xl text-electric-purple">CLASH MARKET</span> */}
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
          © 2025 Clash Market. Built on Solana. Trade responsibly.
        </div>
      </div>
    </footer>
  );
}
