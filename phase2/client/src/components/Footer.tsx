import React from 'react';
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";
import Logo from "./Logo";
import { Button } from '@/components/ui/button';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#012619]/95 border-t border-[#05d6a9]/20 py-4 w-full relative z-[10] overflow-x-hidden backdrop-blur-md" style={{ height: 'auto', minHeight: '80px', marginTop: 'auto', flexShrink: 0 }}>
      <div className="container max-w-full md:max-w-screen-xl mx-auto px-4 md:px-8 overflow-x-hidden">
        {/* Desktop Footer */}
        <div className="hidden md:grid grid-cols-4 gap-4 w-full overflow-hidden">
          {/* Logo and Description */}
          <div className="col-span-1">
            <Link href="/">
              <div className="flex items-center gap-1 mb-2 cursor-pointer">
                <Logo size={48} />
                <h2 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#05d6a9] to-[#04eac2]">LIQIFY</h2>
              </div>
            </Link>
            <p className="text-text-secondary text-sm">
              The first decentralized peer-to-peer perpetual futures trading platform.
            </p>
            <div className="flex mt-3 space-x-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-[#05d6a9] transition-colors">
                <i className="ri-twitter-x-line text-xl"></i>
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-[#05d6a9] transition-colors">
                <i className="ri-discord-line text-xl"></i>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-[#05d6a9] transition-colors">
                <i className="ri-github-line text-xl"></i>
              </a>
            </div>
          </div>

          {/* Products */}
          <div className="col-span-1">
            <h3 className="text-white font-medium mb-2">Products</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/games">
                  <span className="text-text-secondary hover:text-[#05d6a9] transition-colors text-sm cursor-pointer">
                    Games
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/watch">
                  <span className="text-text-secondary hover:text-[#05d6a9] transition-colors text-sm cursor-pointer">
                    Watch
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/leaderboard">
                  <span className="text-text-secondary hover:text-[#05d6a9] transition-colors text-sm cursor-pointer">
                    Leaderboard
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1">
            <h3 className="text-white font-medium mb-2">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-text-secondary hover:text-[#05d6a9] transition-colors text-sm">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-text-secondary hover:text-[#05d6a9] transition-colors text-sm">
                  API
                </a>
              </li>
              <li>
                <a href="#" className="text-text-secondary hover:text-[#05d6a9] transition-colors text-sm">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1">
            <h3 className="text-white font-medium mb-2">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about">
                  <span className="text-text-secondary hover:text-[#05d6a9] transition-colors text-sm cursor-pointer">
                    About
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/legal">
                  <span className="text-text-secondary hover:text-[#05d6a9] transition-colors text-sm cursor-pointer">
                    Legal
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile Footer - Responsive design with no horizontal scroll */}
        <div className="md:hidden space-y-3 w-full overflow-x-hidden">
          {/* Logo and Description */}
          <div className="w-full">
            <Link href="/">
              <div className="flex items-center gap-1 mb-2 cursor-pointer">
                <Logo size={48} />
                <h2 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#05d6a9] to-[#04eac2]">LIQIFY</h2>
              </div>
            </Link>
            <p className="text-text-secondary text-sm break-words pr-2">
              The first decentralized peer-to-peer perpetual futures trading platform.
            </p>
            <div className="flex mt-4 space-x-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-[#05d6a9] transition-colors">
                <i className="ri-twitter-x-line text-xl"></i>
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-[#05d6a9] transition-colors">
                <i className="ri-discord-line text-xl"></i>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-[#05d6a9] transition-colors">
                <i className="ri-github-line text-xl"></i>
              </a>
            </div>
          </div>

          {/* Simple links in mobile - with flex-wrap to prevent overflow */}
          <div className="grid grid-cols-2 gap-y-2 gap-x-2 mt-3 w-full">
            <Link href="/games" className="truncate">
              <span className="text-text-secondary hover:text-[#05d6a9] transition-colors text-sm cursor-pointer">
                Games
              </span>
            </Link>
            <Link href="/watch" className="truncate">
              <span className="text-text-secondary hover:text-[#05d6a9] transition-colors text-sm cursor-pointer">
                Watch
              </span>
            </Link>
            <Link href="/leaderboard" className="truncate">
              <span className="text-text-secondary hover:text-[#05d6a9] transition-colors text-sm cursor-pointer">
                Leaderboard
              </span>
            </Link>
            <a href="#" className="text-text-secondary hover:text-[#05d6a9] transition-colors text-sm truncate">
              Documentation
            </a>
            <Link href="/about" className="truncate">
              <span className="text-text-secondary hover:text-[#05d6a9] transition-colors text-sm cursor-pointer">
                About
              </span>
            </Link>
            <Link href="/legal" className="truncate">
              <span className="text-text-secondary hover:text-[#05d6a9] transition-colors text-sm cursor-pointer">
                Legal
              </span>
            </Link>
          </div>
        </div>

        {/* Copyright - Both Mobile and Desktop */}
        <div className="border-t border-[#05d6a9]/20 mt-4 pt-3 flex flex-col md:flex-row justify-between items-center w-full overflow-hidden">
          <p className="text-text-secondary text-xs md:text-sm truncate text-center md:text-left">
            © {currentYear} LIQIFY. All rights reserved.
          </p>
          <div className="mt-2 md:mt-0 w-full md:w-auto text-center md:text-right">
            <Button variant="link" size="sm" className="text-[#05d6a9] hover:text-[#05d6a9]/80 text-xs md:text-sm max-w-full p-0">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
