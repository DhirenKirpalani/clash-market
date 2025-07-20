'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getTournaments, registerForTournament, isUserRegistered } from '@/lib/tournaments';
import { useSupabaseWallet, SupabaseUser } from '@/hooks/useSupabaseWallet';
import { Loader2, Calendar, Trophy, Users } from 'lucide-react';

// Define tournament type
interface Tournament {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  prize_pool: number;
  status: 'upcoming' | 'active' | 'completed';
  description?: string;
  max_participants?: number;
  created_at?: string;
  updated_at?: string;
}

export default function TournamentsList() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<{[key: string]: boolean}>({});
  const [userRegistrations, setUserRegistrations] = useState<{[key: string]: boolean}>({});
  const { connected, user } = useSupabaseWallet();
  const router = useRouter();
  
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const data = await getTournaments();
        // Explicitly type cast to Tournament[] to fix type errors
        const tournamentData = data as Tournament[];
        setTournaments(tournamentData);
        
        // If user is connected, check which tournaments they're registered for
        if (connected && user?.id) {
          const registrationStatus: {[key: string]: boolean} = {};
          for (const tournament of tournamentData) {
            const isRegistered = await isUserRegistered(tournament.id, user.id);
            registrationStatus[tournament.id] = isRegistered;
          }
          setUserRegistrations(registrationStatus);
        }
      } catch (error) {
        console.error('Failed to fetch tournaments:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTournaments();
  }, [connected, user]);
  
  const handleRegister = async (tournamentId: string) => {
    if (!connected || !user?.id) {
      return;
    }
    
    try {
      setRegistering(prev => ({ ...prev, [tournamentId]: true }));
      await registerForTournament(tournamentId, user.id);
      setUserRegistrations(prev => ({ ...prev, [tournamentId]: true }));
    } catch (error) {
      console.error('Error registering for tournament:', error);
    } finally {
      setRegistering(prev => ({ ...prev, [tournamentId]: false }));
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-electric-purple" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-electric-purple">Tournaments</h2>
      
      {tournaments.length === 0 ? (
        <p className="text-gray-400">No tournaments available right now</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <Card key={tournament.id} className="bg-dark-bg/80 border-dark-border overflow-hidden">
              <CardHeader className={`pb-2 ${tournament.status === 'active' ? 'bg-cyber-blue/20' : tournament.status === 'completed' ? 'bg-gray-700/20' : 'bg-electric-purple/20'}`}>
                <CardTitle className="flex justify-between items-center">
                  {tournament.name}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    tournament.status === 'active' ? 'bg-cyber-blue/30 text-cyber-blue' : 
                    tournament.status === 'completed' ? 'bg-gray-600/30 text-gray-300' : 
                    'bg-electric-purple/30 text-electric-purple'
                  }`}>
                    {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                  </span>
                </CardTitle>
                <CardDescription className="flex items-center text-gray-400">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(tournament.start_date)} - {formatDate(tournament.end_date)}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-4">
                <div className="flex items-center mb-2">
                  <Trophy className="h-4 w-4 mr-2 text-warning-orange" />
                  <span className="text-warning-orange font-medium">
                    Prize: {tournament.prize_pool} USDC
                  </span>
                </div>
                
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-400 text-sm">
                    32 participants max
                  </span>
                </div>
              </CardContent>
              
              <CardFooter>
                {userRegistrations[tournament.id] ? (
                  <Button 
                    className="w-full bg-cyber-blue hover:bg-cyber-blue/90"
                    onClick={() => router.push(`/tournaments/${tournament.id}`)}
                  >
                    View Details
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-electric-purple hover:bg-electric-purple/90"
                    disabled={!connected || registering[tournament.id] || tournament.status === 'completed'}
                    onClick={() => handleRegister(tournament.id)}
                  >
                    {registering[tournament.id] ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      'Register Now'
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
