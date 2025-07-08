import React from "react";

export default function About() {
  return (
    <div className="text-[#F2F2F2] mt-2 overflow-visible">
      {/* Main Content */}
      <div className="container mx-auto px-4 pt-3 pb-6 max-w-screen-xl relative z-10">
        {/* About Page Content */}
        <div className="grid grid-cols-1 gap-8">
          {/* Hero Section */}
          <div className="backdrop-blur-md bg-[#0E0E10]/40 rounded-xl border border-[#00F0FF]/20 shadow-[0_0_15px_rgba(0,240,255,0.15)] overflow-hidden relative p-8">
            {/* Animated corner effect - top left */}
            <div className="absolute top-0 left-0 w-32 h-32">
              <div className="absolute top-0 left-0 w-[2px] h-20 bg-[#00F0FF] animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.8)]">
                <div className="absolute -right-[1px] bottom-0 w-[4px] h-[4px] rounded-full bg-[#00F0FF] shadow-[0_0_5px_rgba(0,240,255,1)]"></div>
              </div>
              <div className="absolute top-0 left-0 w-20 h-[2px] bg-[#00F0FF] animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.8)]">
                <div className="absolute -bottom-[1px] right-0 w-[4px] h-[4px] rounded-full bg-[#00F0FF] shadow-[0_0_5px_rgba(0,240,255,1)]"></div>
              </div>
            </div>
            
            {/* Bottom right accent */}
            <div className="absolute bottom-0 right-0 w-32 h-32">
              <div className="absolute bottom-0 right-0 w-[2px] h-20 bg-[#00F0FF] animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.8)]">
                <div className="absolute -left-[1px] top-0 w-[4px] h-[4px] rounded-full bg-[#00F0FF] shadow-[0_0_5px_rgba(0,240,255,1)]"></div>
              </div>
              <div className="absolute bottom-0 right-0 w-20 h-[2px] bg-[#00F0FF] animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.8)]">
                <div className="absolute -top-[1px] left-0 w-[4px] h-[4px] rounded-full bg-[#00F0FF] shadow-[0_0_5px_rgba(0,240,255,1)]"></div>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-6 relative inline-block">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#90D8E4]">ABOUT LIQIFY</span>
              <div className="absolute -bottom-2 left-0 w-full h-[1px] bg-gradient-to-r from-[#00F0FF] to-transparent"></div>
            </h1>
            
            <p className="text-xl font-bold mb-4 text-[#F2F2F2] leading-relaxed max-w-3xl">
              Where Traders Compete. Together.
            </p>
            
            <p className="text-lg mb-4 text-[#F2F2F2]/80 leading-relaxed max-w-3xl">
              Welcome to Liqify — the world's first community-driven PvP crypto perps trading platform.
              We're building more than just a place to trade — we're creating a digital arena where real traders 
              come to test their strategies, share knowledge, and push each other to win.
            </p>
            
            <p className="text-lg mb-8 text-[#F2F2F2]/90 italic leading-relaxed max-w-3xl border-l-2 border-[#00F0FF] pl-4">
              This isn't Wall Street. This is Web3. And here, you're not alone.
            </p>
          </div>
          
          {/* Mission Section */}
          <div className="backdrop-blur-md bg-[#0E0E10]/50 rounded-xl border border-[#CC33FF]/30 p-8 shadow-[0_0_20px_rgba(204,51,255,0.15)] overflow-hidden relative">
            {/* Animated corner effect */}
            <div className="absolute top-0 right-0 w-28 h-28">
              <div className="absolute top-0 right-0 w-[2px] h-16 bg-[#CC33FF] animate-pulse shadow-[0_0_8px_rgba(204,51,255,0.8)]">
                <div className="absolute -left-[1px] bottom-0 w-[4px] h-[4px] rounded-full bg-[#CC33FF] shadow-[0_0_5px_rgba(204,51,255,1)]"></div>
              </div>
              <div className="absolute top-0 right-0 w-16 h-[2px] bg-[#CC33FF] animate-pulse shadow-[0_0_8px_rgba(204,51,255,0.8)]">
                <div className="absolute -bottom-[1px] left-0 w-[4px] h-[4px] rounded-full bg-[#CC33FF] shadow-[0_0_5px_rgba(204,51,255,1)]"></div>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-6 relative inline-block">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#CC33FF] to-[#FF6699]">BUILT FOR THE NEW WAVE OF TRADERS</span>
              <div className="absolute -bottom-2 left-0 w-full h-[1px] bg-gradient-to-r from-[#CC33FF] to-transparent"></div>
            </h2>
            
            <p className="text-[#F2F2F2]/80 leading-relaxed mb-6">
              At Liqify, you're not trading against faceless bots or shadowy algorithms — you're squaring up 
              with real people from a global community of crypto natives, degens, and sharp minds.
            </p>
            
            <p className="text-[#F2F2F2]/80 leading-relaxed mb-6">
              Every match is a challenge. Every trade is a chance to grow. Win or lose — you're learning, 
              adapting, and evolving with the community by your side.
            </p>
            
            <h2 className="text-xl font-bold mb-6 relative inline-block mt-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF6699] to-[#CC33FF]">WHAT WE STAND FOR</span>
              <div className="absolute -bottom-2 left-0 w-full h-[1px] bg-gradient-to-r from-[#FF6699] to-transparent"></div>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
              <div className="backdrop-blur-sm bg-[#FFFFFF]/5 rounded-lg p-5 border border-[#FFFFFF]/10 hover:border-[#CC33FF]/30 transition-all duration-300 hover:shadow-[0_0_12px_rgba(204,51,255,0.2)]">
                <div className="text-[#CC33FF] text-2xl mb-3">
                  <i className="ri-eye-line"></i>
                </div>
                <h3 className="font-bold text-white mb-2">Transparency</h3>
                <p className="text-[#F2F2F2]/70 text-sm">
                  On-chain mechanics and verifiable outcomes. What you see is what you get.
                </p>
              </div>
              
              <div className="backdrop-blur-sm bg-[#FFFFFF]/5 rounded-lg p-5 border border-[#FFFFFF]/10 hover:border-[#CC33FF]/30 transition-all duration-300 hover:shadow-[0_0_12px_rgba(204,51,255,0.2)]">
                <div className="text-[#CC33FF] text-2xl mb-3">
                  <i className="ri-scales-3-line"></i>
                </div>
                <h3 className="font-bold text-white mb-2">Fair Play</h3>
                <p className="text-[#F2F2F2]/70 text-sm">
                  Skill-based matchmaking and game-balanced PvP mechanics. No whales. No front-running.
                </p>
              </div>
              
              <div className="backdrop-blur-sm bg-[#FFFFFF]/5 rounded-lg p-5 border border-[#FFFFFF]/10 hover:border-[#CC33FF]/30 transition-all duration-300 hover:shadow-[0_0_12px_rgba(204,51,255,0.2)]">
                <div className="text-[#CC33FF] text-2xl mb-3">
                  <i className="ri-key-2-line"></i>
                </div>
                <h3 className="font-bold text-white mb-2">Ownership</h3>
                <p className="text-[#F2F2F2]/70 text-sm">
                  You control your wallet, your keys, and your trades. No centralized custody.
                </p>
              </div>

              <div className="backdrop-blur-sm bg-[#FFFFFF]/5 rounded-lg p-5 border border-[#FFFFFF]/10 hover:border-[#CC33FF]/30 transition-all duration-300 hover:shadow-[0_0_12px_rgba(204,51,255,0.2)]">
                <div className="text-[#CC33FF] text-2xl mb-3">
                  <i className="ri-team-line"></i>
                </div>
                <h3 className="font-bold text-white mb-2">Community First</h3>
                <p className="text-[#F2F2F2]/70 text-sm">
                  We're building this with you — and for you. From Discord to dev updates, your feedback shapes the future.
                </p>
              </div>
            </div>
          </div>
          
          {/* Movement Section */}
          <div className="backdrop-blur-md bg-[#0E0E10]/40 rounded-xl border border-[#90D8E4]/20 shadow-[0_0_15px_rgba(144,216,228,0.15)] overflow-hidden relative p-8">
            {/* Bottom left accent */}
            <div className="absolute bottom-0 left-0 w-28 h-28">
              <div className="absolute bottom-0 left-0 w-[2px] h-16 bg-[#90D8E4] shadow-[0_0_8px_rgba(144,216,228,0.6)]"></div>
              <div className="absolute bottom-0 left-0 w-16 h-[2px] bg-[#90D8E4] shadow-[0_0_8px_rgba(144,216,228,0.6)]"></div>
            </div>
            
            <h2 className="text-2xl font-bold mb-6 relative inline-block">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#90D8E4] to-[#00F0FF]">MORE THAN A PLATFORM — IT'S A MOVEMENT</span>
              <div className="absolute -bottom-2 left-0 w-full h-[1px] bg-gradient-to-r from-[#90D8E4] to-transparent"></div>
            </h2>
            
            <p className="text-[#F2F2F2]/80 leading-relaxed mb-4">
              We believe the future of trading is social, competitive, and on-chain. Liqify is where traders 
              challenge each other, celebrate wins, share war stories, and climb the leaderboard — together.
            </p>
            
            <p className="text-[#F2F2F2]/80 leading-relaxed mb-8">
              Whether you're here to crush the charts, learn the ropes, or cheer your squad on — you belong here.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="backdrop-blur-sm bg-[#FFFFFF]/5 rounded-lg p-5 border border-[#FFFFFF]/10 hover:border-[#00F0FF]/30 transition-all duration-300 hover:shadow-[0_0_12px_rgba(0,240,255,0.2)]">
                <div className="text-[#00F0FF] text-2xl mb-3">
                  <i className="ri-sword-line"></i>
                </div>
                <h3 className="font-bold text-white mb-2">Compete</h3>
                <p className="text-[#F2F2F2]/70 text-sm">
                  Test your trading strategies against real people in real markets.
                </p>
              </div>
              
              <div className="backdrop-blur-sm bg-[#FFFFFF]/5 rounded-lg p-5 border border-[#FFFFFF]/10 hover:border-[#00F0FF]/30 transition-all duration-300 hover:shadow-[0_0_12px_rgba(0,240,255,0.2)]">
                <div className="text-[#00F0FF] text-2xl mb-3">
                  <i className="ri-group-line"></i>
                </div>
                <h3 className="font-bold text-white mb-2">Connect</h3>
                <p className="text-[#F2F2F2]/70 text-sm">
                  Join a community of like-minded traders from around the globe.
                </p>
              </div>
              
              <div className="backdrop-blur-sm bg-[#FFFFFF]/5 rounded-lg p-5 border border-[#FFFFFF]/10 hover:border-[#00F0FF]/30 transition-all duration-300 hover:shadow-[0_0_12px_rgba(0,240,255,0.2)]">
                <div className="text-[#00F0FF] text-2xl mb-3">
                  <i className="ri-line-chart-line"></i>
                </div>
                <h3 className="font-bold text-white mb-2">Grow</h3>
                <p className="text-[#F2F2F2]/70 text-sm">
                  Learn from wins and losses as you improve your skills with every match.
                </p>
              </div>
            </div>
          </div>
          
          {/* Join CTA Section */}
          <div className="backdrop-blur-md bg-[#0E0E10]/40 rounded-xl border border-[#FFCC00]/20 shadow-[0_0_15px_rgba(255,204,0,0.1)] overflow-hidden relative p-8">
            {/* Top right accent */}
            <div className="absolute top-0 right-0 w-28 h-28">
              <div className="absolute top-0 right-0 w-[2px] h-16 bg-[#FFCC00] shadow-[0_0_8px_rgba(255,204,0,0.6)]"></div>
              <div className="absolute top-0 right-0 w-16 h-[2px] bg-[#FFCC00] shadow-[0_0_8px_rgba(255,204,0,0.6)]"></div>
            </div>
            
            <h2 className="text-2xl font-bold mb-6 relative inline-block">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FFCC00] to-[#FF6600]">JOIN THE LIQIFY FAM</span>
              <div className="absolute -bottom-2 left-0 w-full h-[1px] bg-gradient-to-r from-[#FFCC00] to-transparent"></div>
            </h2>
            
            <p className="text-[#F2F2F2]/80 leading-relaxed mb-6">
              The market never sleeps, and neither do we.
              Jump into the arena. Connect with other traders.
              Rise, fall, learn, and come back stronger.
            </p>
            
            <div className="mt-8 flex flex-col md:flex-row justify-center items-center gap-6">
              <button className="px-8 py-4 bg-gradient-to-r from-[#FFCC00] to-[#FF6600] rounded-md text-black font-bold text-lg hover:from-[#FFCC00]/90 hover:to-[#FF6600]/90 transition-all duration-300 shadow-[0_0_15px_rgba(255,204,0,0.3)] hover:shadow-[0_0_20px_rgba(255,204,0,0.5)] w-full md:w-auto">
                Ready to Liqify the Ladder?
              </button>
              <div className="flex justify-center space-x-6 mt-8">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[#F2F2F2]/70 hover:text-[#FFCC00] transition-colors text-2xl">
                  <i className="ri-twitter-x-line"></i>
                </a>
                <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-[#F2F2F2]/70 hover:text-[#FFCC00] transition-colors text-2xl">
                  <i className="ri-discord-line"></i>
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[#F2F2F2]/70 hover:text-[#FFCC00] transition-colors text-2xl">
                  <i className="ri-github-line"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
