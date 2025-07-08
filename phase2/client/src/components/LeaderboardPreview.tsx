import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

type LeaderboardEntry = {
  uid: string;
  username: string;
  wins: number;
  losses: number;
  winPercentage: number;
};

type Season = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  active: boolean;
};

// Sample data to use when no Firestore data is available
const sampleLeaderboardData: LeaderboardEntry[] = [
  { uid: "1", username: "CryptoKing", wins: 42, losses: 12, winPercentage: 77.8 },
  { uid: "2", username: "TradeMaster", wins: 36, losses: 15, winPercentage: 70.6 },
  { uid: "3", username: "DiamondHands", wins: 32, losses: 14, winPercentage: 69.6 },
  { uid: "4", username: "SatoshiJr", wins: 28, losses: 15, winPercentage: 65.1 },
  { uid: "5", username: "CoinCollector", wins: 26, losses: 16, winPercentage: 61.9 },
];

export default function LeaderboardPreview() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch active season
  useEffect(() => {
    const seasonsRef = collection(db, "seasons");
    const q = query(seasonsRef, where("active", "==", true));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const seasonDoc = querySnapshot.docs[0];
        const seasonData = seasonDoc.data() as Omit<Season, "id">;
        
        setActiveSeason({
          ...seasonData,
          id: seasonDoc.id,
        });
      } else {
        // If no active season is found, use the current year to determine which season we're in
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        const isFirstHalf = currentMonth < 6;
        
        setActiveSeason({
          id: "current",
          name: `Season ${isFirstHalf ? 1 : 2} (${isFirstHalf ? 'Jan-Jun' : 'Jul-Dec'} ${currentYear})`,
          startDate: new Date(currentYear, isFirstHalf ? 0 : 6, 1),
          endDate: new Date(currentYear, isFirstHalf ? 5 : 11, isFirstHalf ? 30 : 31),
          active: true
        });
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Fetch leaderboard data for active season
  useEffect(() => {
    if (!activeSeason) return;
    
    setIsLoading(true);
    
    const leaderboardRef = collection(db, "seasonalLeaderboard");
    const q = query(
      leaderboardRef,
      where("seasonId", "==", activeSeason.id),
      orderBy("wins", "desc"),
      limit(5)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (querySnapshot.empty) {
        // If no data in Firestore yet, use sample data
        setLeaderboardData(sampleLeaderboardData);
      } else {
        const entries: LeaderboardEntry[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const totalGames = data.wins + data.losses;
          const winPercentage = totalGames > 0 ? (data.wins / totalGames) * 100 : 0;
          
          entries.push({
            uid: doc.id,
            username: data.username,
            wins: data.wins,
            losses: data.losses,
            winPercentage
          });
        });
        
        setLeaderboardData(entries);
      }
      
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, [activeSeason]);
  
  // Display data is either from Firestore or sample data
  const displayData = leaderboardData;

  return (
    <div className="mt-10" id="leaderboard-section">
      <div className="p-4 rounded-xl border border-[#333333] bg-[#1A1A1A] shadow-lg overflow-hidden relative">
      {/* Animated corner effect - opposite of the TradingChart */}
      <div className="absolute top-0 right-0 w-16 h-16">
        <div className="absolute top-0 right-0 w-[1px] h-8 bg-[#C800FF] animate-pulse"></div>
        <div className="absolute top-0 right-0 w-8 h-[1px] bg-[#C800FF] animate-pulse"></div>
      </div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#F2F2F2] relative inline-block data-highlight">
            {activeSeason ? `LEADERBOARD - ${activeSeason.name}` : 'LEADERBOARD'}
          </h2>
          <Link href="/leaderboard">
            <a className="text-xs text-[#00F0FF] hover:text-[#00F0FF]/80 transition-all duration-300 relative inline-block group">
              <span className="relative z-10">VIEW FULL LEADERBOARD</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#00F0FF] group-hover:w-full transition-all duration-300"></span>
            </a>
          </Link>
        </div>
        
        <div className="overflow-hidden rounded-md">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-neutral/10">
                <TableHead className="w-[50px] py-2 text-xs text-neutral-400">Rank</TableHead>
                <TableHead className="py-2 text-xs text-neutral-400">Trader</TableHead>
                <TableHead className="text-right py-2 text-xs text-neutral-400">Wins</TableHead>
                <TableHead className="text-right py-2 text-xs text-neutral-400">Win Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i} className="border-b border-neutral/10 last:border-none">
                    <TableCell className="py-3"><Skeleton className="h-4 w-6" /></TableCell>
                    <TableCell className="py-3"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-right py-3"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    <TableCell className="text-right py-3"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (
                displayData.map((user, index) => (
                  <TableRow key={user.uid} className="border-b border-[#333333]/30 last:border-none hover:bg-[#C800FF]/5 transition-all duration-300 interactive-element">
                    <TableCell className="py-3 font-medium text-white">{index + 1}</TableCell>
                    <TableCell className="py-3 text-[#F2F2F2] font-medium">{user.username}</TableCell>
                    <TableCell className="text-right py-3 text-[#00FF94] font-mono data-highlight">{user.wins}</TableCell>
                    <TableCell className="text-right py-3 text-white">{user.winPercentage.toFixed(1)}%</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
