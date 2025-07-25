"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Clock, Trash2, Edit, Plus, Trophy, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

import { getTournaments, updateTournamentStatus, createTournament, deleteTournament } from '@/lib/tournaments';
import { toast } from '@/hooks/use-toast';

// Format tournament data to match the UI structure
const formatTournamentForUI = (tournament: any) => ({
  id: tournament.id,
  name: tournament.name,
  startDate: new Date(tournament.start_date).toISOString().split('T')[0],
  endDate: new Date(tournament.end_date).toISOString().split('T')[0],
  registrationOpen: tournament.registration_open,
  entryFee: tournament.entry_fee,
  maxParticipants: tournament.max_participants,
  prizePool: tournament.prize_pool,
  isPrivate: tournament.is_private,
  status: tournament.status
});

export default function TournamentManagement() {
  const [activeTab, setActiveTab] = useState('existing');
  const [tournamentName, setTournamentName] = useState('');
  const [entryFee, setEntryFee] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit tournament modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<any>(null);
  const [editTournamentName, setEditTournamentName] = useState('');
  const [editEntryFee, setEditEntryFee] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editMaxParticipants, setEditMaxParticipants] = useState('');
  const [editIsPrivate, setEditIsPrivate] = useState(false);
  
  // Fetch tournaments from Supabase
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setIsLoading(true);
        const tournamentsData = await getTournaments();
        setTournaments(tournamentsData.map(formatTournamentForUI));
        setError('');
      } catch (err) {
        console.error('Error fetching tournaments:', err);
        setError('Failed to load tournaments');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTournaments();
  }, []);
  
  // Filter tournaments by status
  const upcomingTournaments = tournaments.filter(t => t.status === 'upcoming');
  const completedTournaments = tournaments.filter(t => t.status === 'completed');
  
  // Function to open edit modal with tournament data
  const openEditModal = (tournament: any) => {
    setEditingTournament(tournament);
    setEditTournamentName(tournament.name);
    setEditEntryFee(String(tournament.entryFee));
    setEditStartDate(tournament.startDate);
    setEditEndDate(tournament.endDate);
    setEditMaxParticipants(String(tournament.maxParticipants));
    setEditIsPrivate(tournament.isPrivate);
    setIsEditModalOpen(true);
  };
  
  // Function to handle tournament update
  const handleUpdateTournament = async () => {
    try {
      if (!editTournamentName || !editStartDate || !editEndDate) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
      
      const entryFeeNum = Number(editEntryFee) || 0;
      const maxParticipantsNum = Number(editMaxParticipants) || 32;
      const prizePool = entryFeeNum * maxParticipantsNum;
      
      // Use PATCH request to the admin tournaments API
      const response = await fetch('/api/admin/tournaments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingTournament.id,
          name: editTournamentName,
          start_date: editStartDate,
          end_date: editEndDate,
          prize_pool: prizePool,
          entry_fee: entryFeeNum,
          max_participants: maxParticipantsNum,
          is_private: editIsPrivate
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update tournament');
      }
      
      toast({
        title: "Success",
        description: "Tournament updated successfully!",
        variant: "default"
      });
      
      // Close modal and refresh tournaments
      setIsEditModalOpen(false);
      const tournamentsData = await getTournaments();
      setTournaments(tournamentsData.map(formatTournamentForUI));
    } catch (error) {
      console.error('Error updating tournament:', error);
      toast({
        title: "Error",
        description: "Failed to update tournament. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!tournamentName || !startDate || !endDate) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      // Calculate prize pool based on entry fee and max participants
      const entryFeeNum = Number(entryFee) || 0;
      const maxParticipantsNum = Number(maxParticipants) || 32;
      const prizePool = entryFeeNum * maxParticipantsNum;
      
      // Create tournament in Supabase
      await createTournament({
        name: tournamentName,
        start_date: startDate,
        end_date: endDate,
        prize_pool: prizePool,
        status: 'upcoming',
        entry_fee: entryFeeNum,
        max_participants: maxParticipantsNum,
        registration_open: true,
        is_private: isPrivate
      });

      toast({
        title: "Success",
        description: "Tournament created successfully!",
        variant: "default"
      });
      
      // Reset form
      setTournamentName('');
      setEntryFee('');
      setStartDate('');
      setEndDate('');
      setMaxParticipants('');
      setIsPrivate(false);
      
      // Refresh tournaments list
      const tournamentsData = await getTournaments();
      setTournaments(tournamentsData.map(formatTournamentForUI));
      
      // Switch to existing tournaments tab
      setActiveTab('existing');
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast({
        title: "Error",
        description: "Failed to create tournament. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tournament Management</h2>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-dark-card border border-dark-border">
          <TabsTrigger value="existing" className="data-[state=active]:bg-electric-purple/20 data-[state=active]:text-electric-purple">
            Existing Tournaments
          </TabsTrigger>
          <TabsTrigger value="create" className="data-[state=active]:bg-cyber-blue/20 data-[state=active]:text-cyber-blue">
            Create Tournament
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="existing" className="space-y-6">
          <div className="mb-4 flex justify-end">
            <Button 
              variant="outline" 
              className="bg-transparent border-cyber-blue text-cyber-blue hover:bg-cyber-blue/20"
              onClick={() => setActiveTab('create')}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Tournament
            </Button>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-electric-purple mb-4">Upcoming Tournaments</h3>
            
            {isLoading ? (
              <div className="text-center py-8 text-gray-400">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>Loading tournaments...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-400">
                <p>{error}</p>
                <Button 
                  onClick={() => getTournaments().then(data => setTournaments(data.map(formatTournamentForUI))).catch(console.error)}
                  variant="outline" 
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            ) : upcomingTournaments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No upcoming tournaments.</p>
              </div>
            ) : upcomingTournaments.map((tournament) => (
              <Card key={tournament.id} className="border border-dark-border bg-dark-card">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-neon-cyan font-orbitron">{tournament.name}</CardTitle>
                      <CardDescription>
                        {tournament.startDate} to {tournament.endDate}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-transparent border-electric-purple text-electric-purple hover:bg-electric-purple/20 h-8 w-8 p-0"
                        onClick={() => openEditModal(tournament)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-transparent border-red-400 text-red-400 hover:bg-red-400/20 h-8 w-8 p-0"
                        onClick={() => {
                          toast({
                            title: "Delete Tournament",
                            description: (
                              <div className="flex flex-col space-y-2">
                                <p>Are you sure you want to delete {tournament.name}?</p>
                                <div className="flex space-x-2 justify-end">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={async () => {
                                      try {
                                        await deleteTournament(tournament.id);
                                        
                                        // Refresh tournaments list
                                        const tournamentsData = await getTournaments();
                                        setTournaments(tournamentsData.map(formatTournamentForUI));
                                        
                                        toast({
                                          title: "Tournament Deleted",
                                          description: `${tournament.name} has been successfully deleted.`,
                                          variant: "default"
                                        });
                                      } catch (error) {
                                        console.error('Error deleting tournament:', error);
                                        toast({
                                          title: "Delete Failed",
                                          description: "Could not delete tournament. Please try again.",
                                          variant: "destructive"
                                        });
                                      }
                                    }}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            ),
                            variant: "destructive",
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Entry Fee</span>
                      <div className="font-medium">{tournament.entryFee} USDC</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Prize Pool</span>
                      <div className="font-medium">{tournament.prizePool} USDC</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Capacity</span>
                      <div className="font-medium">{tournament.maxParticipants} players</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Registration</span>
                      <div className={`font-medium ${tournament.registrationOpen ? 'text-neon-cyan' : 'text-gray-400'}`}>
                        {tournament.registrationOpen ? 'Open' : 'Closed'}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-3">
                  <Button variant="outline" className="bg-transparent border-warning-orange text-warning-orange hover:bg-warning-orange/20">
                    <Trophy className="h-4 w-4 mr-2" />
                    Manage Brackets
                  </Button>
                  <Button
                    variant="outline"
                    className={`bg-transparent ${
                      tournament.registrationOpen 
                        ? 'border-red-400 text-red-400 hover:bg-red-400/20' 
                        : 'border-neon-cyan text-neon-cyan hover:bg-neon-cyan/20'
                    }`}
                    onClick={async () => {
                      try {
                        const updates: {
                          registration_open: boolean;
                          status?: 'upcoming' | 'active' | 'completed';
                        } = {
                          registration_open: !tournament.registrationOpen
                        };
                        
                        // If closing registration and tournament was scheduled to start soon,
                        // update the status to active if appropriate
                        if (tournament.registrationOpen && tournament.status === 'upcoming') {
                          const now = new Date();
                          const startDate = new Date(tournament.startDate);
                          
                          // If start date has passed or is today, set to active when closing registration
                          if (startDate <= now) {
                            updates.status = 'active';
                          }
                        }
                        
                        await updateTournamentStatus(tournament.id, updates);
                        
                        // Refresh tournaments list
                        const tournamentsData = await getTournaments();
                        setTournaments(tournamentsData.map(formatTournamentForUI));
                        
                        const statusMessage = updates.status === 'active' 
                          ? 'Tournament is now active. '
                          : '';
                          
                        toast({
                          title: "Registration Status Updated",
                          description: tournament.registrationOpen 
                            ? `Registration for ${tournament.name} is now closed. ${statusMessage}` 
                            : `Registration for ${tournament.name} is now open.`,
                          variant: "default"
                        });
                      } catch (error) {
                        console.error('Error updating tournament:', error);
                        toast({
                          title: "Update Failed",
                          description: "Could not update registration status. Please try again.",
                          variant: "destructive"
                        });
                      }
                    }}
                  >
                    {tournament.registrationOpen ? 'Close Registration' : 'Open Registration'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-electric-purple mb-4">Completed Tournaments</h3>
            <div>
            {completedTournaments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No completed tournaments.</p>
              </div>
            ) : completedTournaments.map((tournament) => (
                <Card key={tournament.id} className="border border-dark-border bg-dark-card opacity-70">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-gray-300 font-orbitron">{tournament.name}</CardTitle>
                        <CardDescription>
                          {tournament.startDate} to {tournament.endDate}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-transparent border-gray-500 text-gray-500 hover:bg-gray-500/20 h-8 w-8 p-0"
                          onClick={() => {
                            toast({
                              title: "Delete Tournament",
                              description: (
                                <div className="flex flex-col space-y-2">
                                  <p>Are you sure you want to delete {tournament.name}?</p>
                                  <div className="flex space-x-2 justify-end">
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={async () => {
                                        try {
                                          await deleteTournament(tournament.id);
                                          
                                          // Refresh tournaments list
                                          const tournamentsData = await getTournaments();
                                          setTournaments(tournamentsData.map(formatTournamentForUI));
                                          
                                          toast({
                                            title: "Tournament Deleted",
                                            description: `${tournament.name} has been successfully deleted.`,
                                            variant: "default"
                                          });
                                        } catch (error) {
                                          console.error('Error deleting tournament:', error);
                                          toast({
                                            title: "Delete Failed",
                                            description: "Could not delete tournament. Please try again.",
                                            variant: "destructive"
                                          });
                                        }
                                      }}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              ),
                              variant: "destructive",
                            });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Entry Fee</span>
                        <div className="font-medium">{tournament.entryFee} USDC</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Prize Pool</span>
                        <div className="font-medium">{tournament.prizePool} USDC</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Capacity</span>
                        <div className="font-medium">{tournament.maxParticipants} players</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Status</span>
                        <div className="font-medium text-gray-400">Completed</div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-3">
                    <Button variant="outline" className="bg-transparent border-warning-orange text-warning-orange hover:bg-warning-orange/20">
                      <Trophy className="h-4 w-4 mr-2" />
                      View Results
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="create">
          <Card className="border border-dark-border bg-dark-card">
            <CardHeader>
              <CardTitle className="text-xl text-cyber-blue font-orbitron">Create New Tournament</CardTitle>
              <CardDescription>Configure tournament settings and rules</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTournament} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tournament-name">Tournament Name</Label>
                    <Input 
                      id="tournament-name" 
                      value={tournamentName} 
                      onChange={(e) => setTournamentName(e.target.value)}
                      placeholder="e.g. Summer Championship" 
                      className="bg-dark-bg border-dark-border text-white mt-1"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-date">Start Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input 
                          id="start-date" 
                          type="date" 
                          value={startDate} 
                          onChange={(e) => {
                            // Ensure year is limited to 4 characters
                            const date = e.target.value;
                            if (date && date.split('-')[0].length <= 4) {
                              setStartDate(date);
                            }
                          }}
                          className="bg-dark-bg border-dark-border text-white pl-10 mt-1"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="end-date">End Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input 
                          id="end-date" 
                          type="date" 
                          value={endDate} 
                          onChange={(e) => {
                            // Ensure year is limited to 4 characters
                            const date = e.target.value;
                            if (date && date.split('-')[0].length <= 4) {
                              setEndDate(date);
                            }
                          }}
                          className="bg-dark-bg border-dark-border text-white pl-10 mt-1"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="entry-fee">Entry Fee (USDC)</Label>
                      <Input 
                        id="entry-fee" 
                        type="number" 
                        value={entryFee} 
                        onChange={(e) => setEntryFee(e.target.value)}
                        placeholder="e.g. 25" 
                        className="bg-dark-bg border-dark-border text-white mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-participants">Max Participants</Label>
                      <Select 
                        value={maxParticipants} 
                        onValueChange={setMaxParticipants}
                      >
                        <SelectTrigger className="bg-dark-bg border-dark-border text-white mt-1">
                          <SelectValue placeholder="Select capacity" />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-bg border-dark-border text-white">
                          <SelectItem value="8">8 players</SelectItem>
                          <SelectItem value="16">16 players</SelectItem>
                          <SelectItem value="32">32 players</SelectItem>
                          <SelectItem value="64">64 players</SelectItem>
                          <SelectItem value="128">128 players</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="private-tournament" 
                      checked={isPrivate} 
                      onCheckedChange={setIsPrivate} 
                    />
                    <Label htmlFor="private-tournament">Private Tournament (Invitation Only)</Label>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                className="bg-transparent border-dark-border text-muted-foreground hover:bg-dark-bg"
                onClick={() => setActiveTab('existing')}
              >
                Cancel
              </Button>
              <Button 
                className="bg-cyber-blue hover:bg-cyber-blue/80"
                onClick={handleCreateTournament}
              >
                Create Tournament
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Edit Tournament Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-dark-card border-dark-border text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-electric-purple">Edit Tournament</DialogTitle>
            <DialogDescription>
              Update the tournament details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-tournament-name">Tournament Name</Label>
              <Input
                id="edit-tournament-name"
                className="bg-dark-input border-dark-border text-white"
                value={editTournamentName}
                onChange={(e) => setEditTournamentName(e.target.value)}
                placeholder="Enter tournament name"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-start-date">Start Date</Label>
                <Input
                  id="edit-start-date"
                  className="bg-dark-input border-dark-border text-white"
                  type="date"
                  value={editStartDate}
                  onChange={(e) => {
                    // Ensure year is limited to 4 characters
                    const date = e.target.value;
                    if (date && date.split('-')[0].length <= 4) {
                      setEditStartDate(date);
                    }
                  }}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-end-date">End Date</Label>
                <Input
                  id="edit-end-date"
                  className="bg-dark-input border-dark-border text-white"
                  type="date"
                  value={editEndDate}
                  onChange={(e) => {
                    // Ensure year is limited to 4 characters
                    const date = e.target.value;
                    if (date && date.split('-')[0].length <= 4) {
                      setEditEndDate(date);
                    }
                  }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-entry-fee">Entry Fee (USDC)</Label>
                <Input
                  id="edit-entry-fee"
                  className="bg-dark-input border-dark-border text-white"
                  type="number"
                  value={editEntryFee}
                  onChange={(e) => setEditEntryFee(e.target.value)}
                  placeholder="0"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-max-participants">Max Participants</Label>
                <Input
                  id="edit-max-participants"
                  className="bg-dark-input border-dark-border text-white"
                  type="number"
                  value={editMaxParticipants}
                  onChange={(e) => setEditMaxParticipants(e.target.value)}
                  placeholder="32"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="edit-is-private"
                checked={editIsPrivate}
                onCheckedChange={setEditIsPrivate}
              />
              <Label htmlFor="edit-is-private">Private Tournament</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditModalOpen(false)}
              className="bg-transparent border-gray-400 text-gray-400 hover:bg-gray-400/20"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateTournament}
              className="bg-electric-purple hover:bg-electric-purple/80 text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
