import React, { useEffect, useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WebSocketProvider } from "@/hooks/useWebSocket";
import { WalletProvider } from "@/hooks/useWallet";
import { MatchProvider } from "@/hooks/useMatch";
import SplashScreen from "@/components/SplashScreen";

import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Games from "@/pages/Games";
import Match from "@/pages/Match";
import Leaderboard from "@/pages/Leaderboard";
import Reels from "@/pages/Reels";
import Profile from "@/pages/Profile";
import Wallet from "@/pages/Wallet";
import Admin from "@/pages/Admin";
import CandlestickChartPage from "@/pages/CandlestickChart";
import NotFound from "@/pages/not-found";
import About from "@/pages/About";
import Legal from "@/pages/Legal";
import TradePage from "@/pages/Trade";

function Router(): JSX.Element {
  console.log('ROUTER: Router component initialized');
  
  useEffect(() => {
    console.log('ROUTER: Current location:', window.location.pathname);
    console.log('ROUTER: All routes registered:', [
      '/', '/games', '/match', '/leaderboard', '/reels', '/profile', 
      '/wallet', '/admin', '/about', '/legal', '/charts/:symbol'
    ]);
    
    const handleNavigation = () => {
      console.log('ROUTER: Navigation occurred to:', window.location.pathname);
    };
    
    window.addEventListener('popstate', handleNavigation);
    
    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  useEffect(() => {
    // Create styles for background and particles
    const style = document.createElement('style');
    style.textContent = `
      #background-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        z-index: 0;
        pointer-events: none;
        background-color: #012619;
      }
      
      /* Removed hexagon styles */
      
      .no-animation {
        animation: none !important;
      }
      
      .hex-dark {
        background-color: rgba(30, 30, 40, 0.3);
      }
      
      .hex-cyan {
        background-color: rgba(0, 240, 255, 0.15);
        box-shadow: 0 0 15px rgba(0, 240, 255, 0.4);
        opacity: 0.6;
      }
      
      .hex-purple {
        background-color: rgba(204, 51, 255, 0.15);
        box-shadow: 0 0 15px rgba(204, 51, 255, 0.4);
        opacity: 0.6;
      }
      
      .hex-yellow {
        background-color: rgba(255, 204, 0, 0.15);
        box-shadow: 0 0 15px rgba(255, 204, 0, 0.4);
        opacity: 0.6;
      }
      
      @keyframes pulse {
        0% { transform: scale(1); opacity: 0.15; }
        50% { transform: scale(1.05); opacity: 0.2; }
        100% { transform: scale(1); opacity: 0.15; }
      }
      
      /* Removed circuit line styles */
      
      /* Cursor particle effects */
      .cursor-particle {
        position: absolute;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        pointer-events: none;
        z-index: 2;
        background-color: currentColor;
        box-shadow: 0 0 10px currentColor;
        transform-origin: center center;
        will-change: transform, opacity;
      }
    `;
    document.head.appendChild(style);

    // Create a simple background container without hexagons or circuit lines
    function initGameBackground() {
      const backgroundContainer = document.createElement('div');
      backgroundContainer.id = 'background-container';
      backgroundContainer.style.position = 'fixed';
      backgroundContainer.style.top = '0';
      backgroundContainer.style.left = '0';
      backgroundContainer.style.width = '100%';
      backgroundContainer.style.height = '100%';
      backgroundContainer.style.zIndex = '1';
      backgroundContainer.style.pointerEvents = 'none';
      backgroundContainer.style.backgroundColor = '#012619'; // Set the background color to Hyperliquid green
      document.body.appendChild(backgroundContainer);
    }
    
    // Simple resize handler - since we just have a background container now
    const resizeHandler = () => {
      // Clear and rebuild on resize
      const backgroundContainer = document.getElementById('background-container');
      if (backgroundContainer) {
        backgroundContainer.remove();
      }
      // Rebuild the background
      initGameBackground();
    };
    
    window.addEventListener('load', initGameBackground);
    window.addEventListener('resize', resizeHandler);
    
    // Initialize immediately if DOM is already loaded
    if (document.readyState === 'complete') {
      initGameBackground();
    } else {
      document.addEventListener('DOMContentLoaded', initGameBackground);
    }
      
    // Add cursor particle effect (optimized for performance)
    // Using TypeScript-friendly approach
    interface Particle {
      element: HTMLDivElement;
      vx: number;
      vy: number;
      life: number;
      opacity: number;
      posX: number;
      posY: number;
      scale: number;
    }
      
    const particles: Particle[] = [];
    const particleCount = 5; // Reduced for better performance
    const colors = ['#00F0FF', '#CC33FF', '#FFCC00', '#90D8E4', '#FF6600'];
    let lastMouseMoveTime = 0;
    const mouseMoveThrottle = 100; // increased throttle for better performance
      
    function createParticle(x: number, y: number): void {
      const particle = document.createElement('div');
      particle.className = 'cursor-particle';
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';
      particle.style.color = colors[Math.floor(Math.random() * colors.length)];
      const scale = Math.random() * 0.5 + 0.2;
      particle.style.transform = 'scale(' + scale + ')';
        
      const hexGrid = document.getElementById('hex-grid');
      if (hexGrid) {
        hexGrid.appendChild(particle);
      }
        
      // Store particle data with TypeScript-friendly property names
      const vx = Math.random() * 3 - 1.5; // Reduced velocity
      const vy = Math.random() * 3 - 1.5;
      const life = Math.random() * 800 + 400; // Shorter lifespan
      const opacity = Math.random() * 0.5 + 0.5;
      particle.style.opacity = opacity.toString();
        
      particles.push({
        element: particle,
        vx: vx,
        vy: vy,
        life: life,
        opacity: opacity,
        posX: x,
        posY: y,
        scale: scale
      });
        
      // Remove old particles if too many
      if (particles.length > 30) { // Reduced max particles
        const old = particles.shift();
        if (old && old.element.parentNode) {
          old.element.parentNode.removeChild(old.element);
        }
      }
    }
      
    // Use requestAnimationFrame timing for smoother performance
    let lastFrameTime = 0;
    function updateParticles(timestamp: number): void {
      // Calculate actual time elapsed (for smoother animation regardless of frame rate)
      const deltaTime = lastFrameTime ? Math.min(timestamp - lastFrameTime, 30) : 16;
      lastFrameTime = timestamp;
        
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= deltaTime; // Use actual frame time
          
        if (p.life <= 0) {
          if (p.element.parentNode) {
            p.element.parentNode.removeChild(p.element);
          }
          particles.splice(i, 1);
          continue;
        }
          
        // Update position (simplified animation for performance)
        p.posX += p.vx * (deltaTime / 16);
        p.posY += p.vy * (deltaTime / 16);
          
        // Set position directly instead of using transform for performance
        p.element.style.left = p.posX + 'px';
        p.element.style.top = p.posY + 'px';
          
        // Fade out
        const newOpacity = (p.life / 800 * p.opacity);
        p.element.style.opacity = newOpacity.toString();
      }
        
      requestAnimationFrame(updateParticles);
    }
      
    // Start the animation loop
    requestAnimationFrame(updateParticles);
      
    // Throttled mouse move handler to reduce CPU usage
    const mouseMoveHandler = function(e: MouseEvent) {
      const now = Date.now();
      if (now - lastMouseMoveTime > mouseMoveThrottle) {
        lastMouseMoveTime = now;
        // Create particles on mouse move (reduced frequency)
        if (Math.random() > 0.85) { // Lower chance to create particles
          createParticle(e.clientX, e.clientY);
        }
      }
    };
      
    const clickHandler = function(e: MouseEvent) {
      // Create more particles on click (but fewer for better performance)
      for (let i = 0; i < particleCount; i++) {
        createParticle(e.clientX, e.clientY);
      }
    };
      
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('click', clickHandler);
      
    // Return cleanup function
    return () => {
      // Remove event listeners
      window.removeEventListener('load', initGameBackground);
      window.removeEventListener('resize', resizeHandler);
      document.removeEventListener('DOMContentLoaded', initGameBackground);
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('click', clickHandler);
      
      // Remove style element
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
      
      // Remove background container
      const backgroundContainer = document.getElementById('background-container');
      if (backgroundContainer && backgroundContainer.parentNode) {
        backgroundContainer.parentNode.removeChild(backgroundContainer);
      }
    };
  }, []);

  return (
    <div style={{ 
      backgroundColor: "#012619", 
      color: "#F2F2F2",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden", /* Change back to hidden to prevent horizontal scroll */
      overflowY: "auto", /* But allow vertical scrolling */
      width: "100%",
      maxWidth: "100vw" /* Enforce maximum width */
    }}>
      {/* Simple background wrapper with lower z-index */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}>
        {/* Background container */}
        <div id="background-container"></div>
        
        {/* Radial gradient overlay */}
        <div style={{ 
          position: "absolute", 
          top: 0, 
          left: 0, 
          width: "100%", 
          height: "100%", 
          background: "radial-gradient(circle at 15% 15%, rgba(204, 51, 255, 0.08) 0%, transparent 60%), radial-gradient(circle at 85% 85%, rgba(0, 240, 255, 0.08) 0%, transparent 60%)"
        }}></div>
      </div>
      
      {/* Liquid gradient in corner */}
      <div style={{
        position: "absolute",
        bottom: "-150px",
        right: "-150px",
        width: "300px",
        height: "300px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, rgba(255, 102, 0, 0.2), rgba(255, 204, 0, 0.1))",
        filter: "blur(60px)"
      }}></div>
      
      {/* Game grid accent lighting */}
      <div style={{
        position: "absolute",
        top: "30%",
        left: "-100px",
        width: "200px",
        height: "500px",
        background: "linear-gradient(90deg, rgba(168, 230, 225, 0.15), transparent)",
        filter: "blur(30px)",
        transform: "rotate(15deg)"
      }}></div>
      
      {/* Top corner accents with neon glow */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "120px", height: "120px" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: "3px", height: "120px", background: "linear-gradient(to bottom, #00F0FF, transparent)", boxShadow: "0 0 10px rgba(0, 240, 255, 0.8), 0 0 20px rgba(0, 240, 255, 0.4)" }}></div>
        <div style={{ position: "absolute", top: 0, left: 0, width: "120px", height: "3px", background: "linear-gradient(to right, #00F0FF, transparent)", boxShadow: "0 0 10px rgba(0, 240, 255, 0.8), 0 0 20px rgba(0, 240, 255, 0.4)" }}></div>
      </div>
      
      <div style={{ position: "absolute", top: 0, right: 0, width: "120px", height: "120px" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: "3px", height: "120px", background: "linear-gradient(to bottom, #CC33FF, transparent)", boxShadow: "0 0 10px rgba(204, 51, 255, 0.8), 0 0 20px rgba(204, 51, 255, 0.4)" }}></div>
        <div style={{ position: "absolute", top: 0, right: 0, width: "120px", height: "3px", background: "linear-gradient(to left, #CC33FF, transparent)", boxShadow: "0 0 10px rgba(204, 51, 255, 0.8), 0 0 20px rgba(204, 51, 255, 0.4)" }}></div>
      </div>
      
      {/* Bottom corner accents */}
      <div style={{ position: "absolute", bottom: 0, left: 0, width: "120px", height: "120px" }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, width: "3px", height: "120px", background: "linear-gradient(to top, #90D8E4, transparent)", boxShadow: "0 0 10px rgba(144, 216, 228, 0.7), 0 0 15px rgba(144, 216, 228, 0.3)" }}></div>
        <div style={{ position: "absolute", bottom: 0, left: 0, width: "120px", height: "3px", background: "linear-gradient(to right, #90D8E4, transparent)", boxShadow: "0 0 10px rgba(144, 216, 228, 0.7), 0 0 15px rgba(144, 216, 228, 0.3)" }}></div>
      </div>
      
      {/* Diagonal accents for motion effect */}
      <div style={{ position: "absolute", top: "40%", right: "-50px", width: "200px", height: "4px", background: "linear-gradient(to left, #FFCC00, transparent)", transform: "rotate(35deg)", boxShadow: "0 0 15px rgba(255, 204, 0, 0.8), 0 0 30px rgba(255, 204, 0, 0.4)" }}></div>
      <div style={{ position: "absolute", bottom: "30%", left: "-50px", width: "200px", height: "4px", background: "linear-gradient(to right, #FF6600, transparent)", transform: "rotate(-35deg)", boxShadow: "0 0 15px rgba(255, 102, 0, 0.8), 0 0 30px rgba(255, 102, 0, 0.4)" }}></div>
      
      {/* Fixed navbar */}
      <NavBar />
      
      {/* Spacer to account for navbar height */}
      <div style={{ height: "64px", flexShrink: 0 }}></div>
      
      {/* Main content area */}
      <main style={{ 
        paddingTop: "0", 
        paddingBottom: "0", 
        marginTop: "0",
        flex: "1 0 auto", /* Changed from 1 1 auto to 1 0 auto to prevent main from shrinking */
        position: "relative",
        zIndex: "5",
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden", /* Prevent horizontal scrolling */
        overflowY: "visible", /* Allow vertical scrolling */
        display: "flex",
        flexDirection: "column"
      }}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/games" component={Games} />
          <Route path="/match/:matchId" component={Match} />
          <Route path="/match" component={Match} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/reels" component={Reels} />
          <Route path="/profile" component={Profile} />
          <Route path="/wallet" component={Wallet} />
          <Route path="/admin" component={Admin} />
          <Route path="/about" component={About} />
          <Route path="/legal" component={Legal} />
          <Route path="/charts/:symbol" component={CandlestickChartPage} />
          <Route path="/trade/:token" component={TradePage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Set theme to dark mode by default
    document.documentElement.classList.add('dark');
    
    // Prevent horizontal scrolling on mobile
    const style = document.createElement('style');
    style.textContent = `
      html, body {
        max-width: 100%;
        overflow-x: hidden;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider>
        <WalletProvider>
          <MatchProvider>
            <TooltipProvider>
              <Toaster />
              {showSplash ? (
                <SplashScreen onLoadingComplete={() => setShowSplash(false)} />
              ) : null}
              <Router />
            </TooltipProvider>
          </MatchProvider>
        </WalletProvider>
      </WebSocketProvider>
    </QueryClientProvider>
  );
}

export default App;
