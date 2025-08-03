// "use client";

// import React, { useState, useEffect } from "react";
// import dynamic from 'next/dynamic';
// import Link from 'next/link';
// import { ArrowLeft, Trophy, TrendingUp, Clock, User, ChevronDown, ChevronUp, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
// import { Footer } from '@/components/footer';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { CountdownTimer } from '@/components/countdown-timer';

// // Import components with SSR disabled to prevent hydration errors
// const Navigation = dynamic(
//   () => import('@/components/navigation').then((mod) => mod.Navigation),
//   { ssr: false }
// );

// const MobileNavigation = dynamic(
//   () => import('@/components/mobile-navigation').then((mod) => mod.MobileNavigation),
//   { ssr: false }
// );

// // Mock data for PVP session
// const pvpSession = {
//   timeLeft: new Date(Date.now() + 3600000 * 4), // 4 hours from now
//   prizePool: 100,
//   currency: "USDC"
// };

// // Mock data for players
// const players = [
//   {
//     username: "TraderAlpha",
//     openPositions: 8,
//     currentBalance: 100.2,
//     totalPnL: 9.99,
//     positions: [
//       { market: "BTC-PERP", side: "long", size: 50, pnl: 1, pnlPercent: 2 },
//       { market: "SOL-PERP", side: "short", size: 20, pnl: -0.5, pnlPercent: -2.5 },
//       { market: "ETH-PERP", side: "long", size: 30, pnl: 3.2, pnlPercent: 10.67 }
//     ]
//   },
//   {
//     username: "CryptoMaster",
//     openPositions: 5,
//     currentBalance: 95.8,
//     totalPnL: -2.45,
//     positions: [
//       { market: "BTC-PERP", side: "short", size: 40, pnl: -3.2, pnlPercent: -8 },
//       { market: "SOL-PERP", side: "long", size: 35, pnl: 1.8, pnlPercent: 5.14 },
//       { market: "ETH-PERP", side: "short", size: 15, pnl: -1.05, pnlPercent: -7 }
//     ]
//   }
// ];

// export default function PvpPage() {
//   const [countdown, setCountdown] = useState(pvpSession.timeLeft);

//   const getPnLColor = (pnl: number) => {
//     if (pnl > 0) return 'text-neon-cyan';
//     if (pnl < 0) return 'text-red-400';
//     return 'text-gray-400';
//   };

//   const getSideIcon = (side: string) => {
//     if (side === 'long') return <ArrowUpRight className="h-4 w-4 text-neon-cyan" />;
//     return <ArrowDownRight className="h-4 w-4 text-red-400" />;
//   };

//   const getSideText = (side: string) => {
//     if (side === 'long') return 'text-neon-cyan';
//     return 'text-red-400';
//   };

//   const renderPositionCard = (position: any) => {
//     return (
//       <Card key={`${position.market}-${position.side}`} className="border border-dark-border bg-dark-card/50 hover:bg-dark-card mb-3 transition-all">
//         <CardContent className="p-4">
//           <div className="flex justify-between items-center">
//             <div className="flex items-center gap-2">
//               {getSideIcon(position.side)}
//               <span className={`font-bold ${getSideText(position.side)}`}>
//                 {position.side.charAt(0).toUpperCase() + position.side.slice(1)}
//               </span>
//               <span className="text-sm font-medium">{position.market}</span>
//             </div>
//             <div className={`font-bold ${getPnLColor(position.pnl)}`}>
//               {position.pnl > 0 ? '+' : ''}{position.pnl} USDC ({position.pnlPercent > 0 ? '+' : ''}{position.pnlPercent}%)
//             </div>
//           </div>
//           <div className="mt-2 flex justify-between items-center text-sm">
//             <span className="text-muted-foreground">Size</span>
//             <span className="font-medium">${position.size}</span>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   };

//   const renderPlayerCard = (player: any, index: number) => {
//     return (
//       <Card key={player.username} className="border border-dark-border bg-dark-card">
//         <CardHeader className="pb-2">
//           <CardTitle className="text-xl text-electric-purple font-orbitron">{player.username}</CardTitle>
//           <CardDescription>Trading statistics</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-3 gap-4 mb-6">
//             <div className="bg-dark-bg p-3 rounded-lg text-center">
//               <div className="text-sm text-muted-foreground">Open Positions</div>
//               <div className="text-xl font-bold">{player.openPositions}</div>
//             </div>
//             <div className="bg-dark-bg p-3 rounded-lg text-center">
//               <div className="text-sm text-muted-foreground">Balance</div>
//               <div className="text-xl font-bold">${player.currentBalance.toFixed(2)}</div>
//             </div>
//             <div className="bg-dark-bg p-3 rounded-lg text-center">
//               <div className="text-sm text-muted-foreground">Total P&L</div>
//               <div className={`text-xl font-bold ${getPnLColor(player.totalPnL)}`}>
//                 {player.totalPnL > 0 ? '+' : ''}{player.totalPnL.toFixed(2)}
//               </div>
//             </div>
//           </div>

//           <h3 className="text-lg font-semibold font-orbitron mb-3">Positions</h3>
//           <div className="space-y-3">
//             {player.positions.map((position: any) => renderPositionCard(position))}
//           </div>
//         </CardContent>
//       </Card>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-dark-bg text-white">
//       <Navigation />
      
//       <div className="pt-24 pb-20 max-w-6xl mx-auto px-4">
//         <div className="flex items-center mb-8">
//           <Link href="/games" className="mr-4 p-2 hover:bg-dark-card rounded-full">
//             <ArrowLeft className="h-5 w-5" />
//             <span className="sr-only">Back to Games</span>
//           </Link>
//           <h1 className="text-4xl md:text-5xl font-orbitron font-bold gradient-text-primary">
//             {players[0].username} vs {players[1].username}
//           </h1>
//         </div>

//         {/* Main PVP Session Card */}
//         <Card className="border border-dark-border bg-dark-card mb-8">
//           <CardContent className="p-6">
//             <div className="flex flex-col md:flex-row justify-between items-center">
//               <div className="mb-4 md:mb-0">
//                 <h2 className="text-2xl font-orbitron font-bold text-electric-purple">PVP Session</h2>
//                 <p className="text-muted-foreground">Real-time trading competition</p>
//               </div>
              
//               <div className="flex flex-col md:flex-row items-center gap-8">
//                 <div className="text-center">
//                   <div className="text-sm text-muted-foreground mb-2">Time Left</div>
//                   <CountdownTimer targetDate={countdown} />
//                 </div>
                
//                 <div className="text-center">
//                   <div className="text-sm text-muted-foreground mb-2">Prize Pool</div>
//                   <div className="flex items-center justify-center bg-gradient-to-r from-electric-purple to-neon-cyan bg-clip-text text-transparent">
//                     <DollarSign className="h-6 w-6 mr-1 text-warning-orange" />
//                     <span className="text-4xl font-orbitron font-bold">
//                       {pvpSession.prizePool} {pvpSession.currency}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Player Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//           {players.map((player, index) => renderPlayerCard(player, index))}
//         </div>
//       </div>

//       <Footer />
      
//       <MobileNavigation />
//     </div>
//   );
// }