"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { formatCurrency, formatPercentage, getPnLSign, getPnLColor } from "@/lib/display";

import { PublicKey } from "@solana/web3.js";
import { getUserPositions } from "@/lib/drift/api";

interface DriftPositionCardProps {
  user: PublicKey,
  name: string
}

interface PerpsData {
  isLong: boolean;
  pnl: number;
  pnlPercent: number;
  fee: number;
  value: number;
  name: string;
}

export default function DriftPositionCard({user, name}: DriftPositionCardProps) {
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [settledPnL, setSettledPnL] = useState<number>(0);
  const [perpsPositions, setPerpsPositions] = useState<PerpsData[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [totalPnL, setTotalPnL] = useState<number>(0);

  // Constantly Fetch Position Data
  useEffect(() => {
    async function fetchUserPositions() {
      const positions = await getUserPositions(user.toString());
      console.log("User Positions:", positions);

      let perpsData: PerpsData[] = [];
      if(positions.perpsPositions) {
        positions.perpsPositions.forEach((position:any) => {
        perpsData.push({
          isLong: position.baseAssetValue > 0,
          pnl: position.positionPnL,
          pnlPercent: position.positionPnLPercent,
          fee: position.positionFee,
          value: position.baseAssetValue,
          name: position.perpsData.symbol,
        })
      });
      let depositAmount = positions.totalDeposits;
      let settledPnL = positions.settledPerpPnl;
      let cumulativeFee = positions.cumulativePerpFunding;


      const perpsTotalPnL = perpsData.reduce((acc, pos) => acc + pos.pnl, 0);
      //const feeTotal = perpsData.reduce((acc, pos) => acc + pos.fee, 0);
      console.log("Deposit Amount:", depositAmount);
      console.log("Settled PnL:", settledPnL);
      console.log("Perps Total PnL:", perpsTotalPnL);
      console.log("Peprs Total PnL:", perpsTotalPnL*1e6);
      console.log("Cumulative Fee:", cumulativeFee);
      //console.log("Fee Total:", feeTotal);

      const perpsTotalBalance = depositAmount - settledPnL + perpsTotalPnL*1e6 + cumulativeFee;
      console.log("Perps Total Balance:", perpsTotalBalance);
      setPerpsPositions(perpsData);
      setDepositAmount(depositAmount);
      setSettledPnL(settledPnL);
      setBalance(perpsTotalBalance);
      setTotalPnL(perpsTotalBalance - depositAmount);
      }
      // wait 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000));
      fetchUserPositions();
    }
    if (user) {
      fetchUserPositions();
    }
  }, [user]);

  const getSideIcon = (side: string) => {
    if (side === 'long') return <ArrowUpRight className="h-4 w-4 text-neon-cyan" />;
    return <ArrowDownRight className="h-4 w-4 text-red-400" />;
  };

  const getSideText = (side: string) => {
    if (side === 'long') return 'text-neon-cyan';
    return 'text-red-400';
  };

  return (
    <Card className="border border-dark-border bg-dark-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-electric-purple font-orbitron">{name}</CardTitle>
        <CardDescription>Trading statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-dark-bg p-3 rounded-lg text-center">
            <div className="text-sm text-muted-foreground">Open Positions</div>
            <div className="text-xl font-bold">{perpsPositions.length}</div>
          </div>
          <div className="bg-dark-bg p-3 rounded-lg text-center">
            <div className="text-sm text-muted-foreground">Balance</div>
            <div className="text-xl font-bold">${(balance/1e6).toFixed(2)}</div>
          </div>
          <div className="bg-dark-bg p-3 rounded-lg text-center">
            <div className="text-sm text-muted-foreground">Total P&L</div>
            <div className={`text-xl font-bold ${getPnLColor(totalPnL)}`}>
              {getPnLSign(totalPnL/1e6)}
              {formatCurrency(Math.abs(totalPnL/1e6))}
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold font-orbitron mb-3">Positions</h3>
        <div className="space-y-3">
          {perpsPositions.length > 0 ? (
            <div className="space-y-3">
              {perpsPositions.map((position, index) => (
                <Card key={index} className="border border-dark-border bg-dark-card/50 hover:bg-dark-card mb-3 transition-all">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{position.name}</span>
                      </div>
                      <div className={`font-bold text-xl flex items-center ${getPnLColor(position.pnl)}`}>
                        {getPnLSign(position.pnl)}
                        {formatCurrency(Math.abs(position.pnl))}
                        {position.pnl > 0 ? (
                          <TrendingUp className="ml-1 h-5 w-5 text-green-400" />
                        ) : position.pnl < 0 ? (
                          <TrendingDown className="ml-1 h-5 w-5 text-red-400" />
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-2 flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        {getSideIcon(position.isLong ? 'long' : 'short')}
                        <span className={`font-bold ${getSideText(position.isLong ? 'long' : 'short')}`}>
                          {position.isLong ? 'Long' : 'Short'}
                        </span>
                      </div>
                      <div className={`font-bold ${getPnLColor(position.pnl)}`}>
                        {getPnLSign(position.pnl)}
                        {formatPercentage(Math.abs(position.pnlPercent))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Active Positions</h3>
              <p className="text-gray-400">You don't have any perpetual positions yet.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
  
  // return (
  //     <Card key={player.username} className="border border-dark-border bg-dark-card">
  //       <CardHeader className="pb-2">
  //         <CardTitle className="text-xl text-electric-purple font-orbitron">{player.username}</CardTitle>
  //         <CardDescription>Trading statistics</CardDescription>
  //       </CardHeader>
  //       <CardContent>
  //         <div className="grid grid-cols-3 gap-4 mb-6">
  //           <div className="bg-dark-bg p-3 rounded-lg text-center">
  //             <div className="text-sm text-muted-foreground">Open Positions</div>
  //             <div className="text-xl font-bold">{player.openPositions}</div>
  //           </div>
  //           <div className="bg-dark-bg p-3 rounded-lg text-center">
  //             <div className="text-sm text-muted-foreground">Balance</div>
  //             <div className="text-xl font-bold">${player.currentBalance.toFixed(2)}</div>
  //           </div>
  //           <div className="bg-dark-bg p-3 rounded-lg text-center">
  //             <div className="text-sm text-muted-foreground">Total P&L</div>
  //             <div className={`text-xl font-bold ${getPnLColor(player.totalPnL)}`}>
  //               {player.totalPnL > 0 ? '+' : ''}{player.totalPnL.toFixed(2)}
  //             </div>
  //           </div>
  //         </div>

  //         <h3 className="text-lg font-semibold font-orbitron mb-3">Positions</h3>
  //         <div className="space-y-3">
  //           {player.positions.map((position: any) => renderPositionCard(position))}
  //         </div>
  //       </CardContent>
  //     </Card>
  //   );
};

// function PerpsPositionCard(position: any){
//     return (
//         <Card key={`${position.market}-${position.side}`} className="border border-dark-border bg-dark-card/50 hover:bg-dark-card mb-3 transition-all">
//         <CardContent className="p-4">
//             <div className="flex justify-between items-center">
//             <div className="flex items-center gap-2">
//                 {getSideIcon(position.side)}
//                 <span className={`font-bold ${getSideText(position.side)}`}>
//                 {position.side.charAt(0).toUpperCase() + position.side.slice(1)}
//                 </span>
//                 <span className="text-sm font-medium">{position.market}</span>
//             </div>
//             <div className={`font-bold ${getPnLColor(position.pnl)}`}>
//                 {position.pnl > 0 ? '+' : ''}{position.pnl} USDC ({position.pnlPercent > 0 ? '+' : ''}{position.pnlPercent}%)
//             </div>
//             </div>
//             <div className="mt-2 flex justify-between items-center text-sm">
//             <span className="text-muted-foreground">Size</span>
//             <span className="font-medium">${position.size}</span>
//             </div>
//         </CardContent>
//         </Card>
//     );
// }
  