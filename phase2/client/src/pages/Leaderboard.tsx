import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs, onSnapshot, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useLocation } from "wouter";

interface LeaderboardEntry {
  username: string;
  wins: number;
  losses: number;
  winPercentage: number;
  uid: string;
}

interface Season {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  active: boolean;
}

export default function Leaderboard() {
  const [, setLocation] = useLocation();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFutureSeason, setIsFutureSeason] = useState<boolean>(false);

  useEffect(() => {
    const initializeSeasons = async () => {
      try {
        // Check if seasons exist
        const seasonsRef = collection(db, "seasons");
        const seasonSnapshot = await getDocs(seasonsRef);
        
        if (seasonSnapshot.empty) {
          // Current year
          const currentYear = new Date().getFullYear();
          const currentMonth = new Date().getMonth();
          
          // Create seasons for current year
          const seasons = [
            {
              name: `Season 1 (Jan-Jun ${currentYear})`,
              startDate: new Date(currentYear, 0, 1),
              endDate: new Date(currentYear, 5, 30, 23, 59, 59),
              active: currentMonth < 6
            },
            {
              name: `Season 2 (Jul-Dec ${currentYear})`,
              startDate: new Date(currentYear, 6, 1),
              endDate: new Date(currentYear, 11, 31, 23, 59, 59),
              active: currentMonth >= 6
            }
          ];
          
          // Add to Firestore
          for (const season of seasons) {
            await addDoc(seasonsRef, season);
          }
          
          console.log("Created default seasons");
        }
      } catch (error) {
        console.error("Error initializing seasons:", error);
      }
    };
    
    initializeSeasons();
  }, []);

  // Fetch seasons
  useEffect(() => {
    const fetchSeasons = async () => {
      setLoading(true);
      try {
        const seasonsRef = collection(db, "seasons");
        const q = query(seasonsRef, orderBy("startDate", "desc"));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const seasonsData: Season[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data() as Omit<Season, "id">;
            seasonsData.push({
              ...data,
              id: doc.id,
              startDate: data.startDate,
              endDate: data.endDate
            });
          });
          
          setSeasons(seasonsData);
          
          // Set default selected season to the active one or most recent
          if (seasonsData.length > 0 && !selectedSeason) {
            const activeSeason = seasonsData.find(season => season.active);
            if (activeSeason) {
              setSelectedSeason(activeSeason.id);
            } else {
              setSelectedSeason(seasonsData[0].id);
            }
          }
          
          setLoading(false);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching seasons:", error);
        setLoading(false);
      }
    };
    
    fetchSeasons();
  }, [selectedSeason]);

  // Fetch leaderboard data for selected season
  useEffect(() => {
    if (!selectedSeason) return;
    
    setLoading(true);
    
    try {
      const selectedSeasonObj = seasons.find(s => s.id === selectedSeason);
      
      if (!selectedSeasonObj) {
        setLoading(false);
        return;
      }
      
      // Check if season is in the future
      const now = new Date();
      const seasonStart = selectedSeasonObj.startDate;
      
      if (now < seasonStart) {
        setIsFutureSeason(true);
        setLeaderboardData([]);
        setLoading(false);
        return;
      }
      
      setIsFutureSeason(false);
      
      // Query leaderboard for selected season
      const leaderboardRef = collection(db, "seasonalLeaderboard");
      const q = query(
        leaderboardRef,
        where("seasonId", "==", selectedSeason),
        orderBy("wins", "desc"),
        limit(10)
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const leaderboardEntries: LeaderboardEntry[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const totalGames = data.wins + data.losses;
          const winPercentage = totalGames > 0 ? (data.wins / totalGames) * 100 : 0;
          
          leaderboardEntries.push({
            username: data.username,
            wins: data.wins,
            losses: data.losses,
            winPercentage,
            uid: doc.id
          });
        });
        
        setLeaderboardData(leaderboardEntries);
        setLoading(false);
      });
      
      return () => unsubscribe();
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setLoading(false);
    }
  }, [selectedSeason, seasons]);

  const handleSeasonChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSeason(event.target.value);
  };

  // Use Tailwind CSS classes for styling instead of Material UI
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center text-white mb-8">Seasonal Leaderboard</h1>
      
      <div className="mb-6">
        <label htmlFor="season-select" className="block text-white mb-2">Select Season</label>
        <select
          id="season-select"
          value={selectedSeason}
          onChange={handleSeasonChange}
          className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>Select a season</option>
          {seasons.map((season) => (
            <option key={season.id} value={season.id}>{season.name}</option>
          ))}
        </select>
      </div>
      
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : isFutureSeason ? (
        <div className="bg-blue-900/30 text-white p-4 rounded-md mb-4">
          This season hasn't started yet. The leaderboard will be available once the season begins.
        </div>
      ) : leaderboardData.length === 0 ? (
        <div className="bg-blue-900/30 text-white p-4 rounded-md mb-4">
          No data available for this season yet. Be the first to compete!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-gray-900/50 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-800">
                <th className="py-3 px-4 text-left text-yellow-400 font-bold">Rank</th>
                <th className="py-3 px-4 text-left text-yellow-400 font-bold">Player</th>
                <th className="py-3 px-4 text-right text-yellow-400 font-bold">Wins</th>
                <th className="py-3 px-4 text-right text-yellow-400 font-bold">Losses</th>
                <th className="py-3 px-4 text-right text-yellow-400 font-bold">Win %</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((entry, index) => (
                <tr 
                  key={entry.uid}
                  className={`${index % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-700/30'} hover:bg-gray-600/50 transition-colors`}
                >
                  <td className={`py-3 px-4 ${index < 3 ? 'text-yellow-400 font-bold' : 'text-white'}`}>
                    {index + 1}
                  </td>
                  <td className="py-3 px-4 text-white">{entry.username}</td>
                  <td className="py-3 px-4 text-right text-green-500">{entry.wins}</td>
                  <td className="py-3 px-4 text-right text-red-500">{entry.losses}</td>
                  <td className="py-3 px-4 text-right text-white">{entry.winPercentage.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
