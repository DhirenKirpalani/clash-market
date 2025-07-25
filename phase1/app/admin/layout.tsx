"use client";

import React, { useState } from 'react';
import { AdminCheck } from '@/components/AdminCheck';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <AdminCheck>
      <div className="relative min-h-screen bg-dark-bg text-white">
        {/* Mobile Menu Toggle Button */}
        <div className="lg:hidden fixed top-4 left-4 z-30">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md bg-electric-purple/20 text-electric-purple hover:bg-electric-purple/30 transition-colors"
            aria-label="Toggle sidebar menu"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        
        {/* Left Sidebar */}
        <div 
          className={`fixed top-0 left-0 bottom-0 w-64 bg-dark-card/60 backdrop-blur-md border-r border-dark-border shadow-lg z-20 transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-5 border-b border-dark-border">
            <Link href="/admin" className="flex items-center gap-2">
              <Image src="/images/Logo.png" alt="Clash Market Logo" width={28} height={28} />
              <h1 className="text-xl font-bungee text-electric-purple">
                CLASH MARKET
              </h1>
            </Link>
            <div className="pl-1 mt-2">
              <h2 className="text-lg font-bungee text-white">
                ADMIN
              </h2>
            </div>
          </div>
          
          <div className="pt-6 px-5">
            <ul className="space-y-6">
              <li>
                <Link 
                  href="/admin" 
                  className="block text-electric-purple font-medium transition-colors hover:text-electric-purple/80"
                  onClick={() => setSidebarOpen(false)}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/tournaments" 
                  className="block text-cyber-blue font-medium transition-colors hover:text-cyber-blue/80"
                  onClick={() => setSidebarOpen(false)}
                >
                  Tournaments
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/users" 
                  className="block text-neon-cyan font-medium transition-colors hover:text-neon-cyan/80"
                  onClick={() => setSidebarOpen(false)}
                >
                  User Management
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/settings" 
                  className="block text-warning-orange font-medium transition-colors hover:text-warning-orange/80"
                  onClick={() => setSidebarOpen(false)}
                >
                  Settings
                </Link>
              </li>
            </ul>
            
            <div className="absolute bottom-8 left-0 w-full px-5 pt-4 border-t border-dark-border mt-4">
              <Link 
                href="/" 
                className="block text-gray-400 text-sm transition-colors hover:text-white"
                onClick={() => setSidebarOpen(false)}
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="lg:ml-64 w-full min-h-screen bg-dark-bg transition-all duration-300">
          <div className="p-4 md:p-6 lg:p-8 max-w-6xl pt-16 lg:pt-8">
            {children}
          </div>
        </div>
      </div>
      <Toaster />
    </AdminCheck>
  );
}
