import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWallet } from "@/hooks/useWallet";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";

type UserProfile = {
  id: number;
  username: string;
  avatar?: string;
  bio?: string;
  stats: {
    totalMatches: number;
    wins: number;
    losses: number;
    winRate: number;
    totalPnl: number;
    arenaTokens: number;
    followers: number;
    following: number;
  };
  matchHistory: Array<{
    id: number;
    date: string;
    opponent: string;
    pnl: number;
    result: 'win' | 'loss';
  }>;
};

export default function Profile() {
  const { connected, address, userProfile: walletProfile } = useWallet();
  const [, setLocation] = useLocation();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    bio: '',
    avatar: ''
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  
  // Local state to store the updated profile data
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);

  const { data: profileData, isLoading } = useQuery<UserProfile>({
    queryKey: ['/api/profile'],
    enabled: connected,
  });
  
  // Computed profile combining server data with local edits
  const profile = localProfile || profileData;
  
  // Check for saved profile edits in localStorage
  useEffect(() => {
    const savedEdits = localStorage.getItem('userProfileEdits');
    if (savedEdits) {
      try {
        const parsedEdits = JSON.parse(savedEdits);
        if (parsedEdits && typeof parsedEdits === 'object') {
          console.log('Found saved profile edits:', parsedEdits);
          if (parsedEdits.avatar) {
            setAvatarPreview(parsedEdits.avatar);
          }
        }
      } catch (err) {
        console.error('Failed to parse saved profile edits:', err);
      }
    }
  }, []);

  // Initialize form and local profile data when profile data is loaded
  useEffect(() => {
    if (profileData) {
      // Check for saved edits in localStorage
      const savedEdits = localStorage.getItem('userProfileEdits');
      let parsedEdits: any = null;
      
      if (savedEdits) {
        try {
          parsedEdits = JSON.parse(savedEdits);
        } catch (err) {
          console.error('Failed to parse saved profile edits:', err);
        }
      }
      
      // Create updated profile combining server data with saved edits
      const updatedProfile = {
        ...profileData,
        username: parsedEdits?.username || walletProfile?.username || profileData.username,
        bio: parsedEdits?.bio || profileData.bio || '',
        avatar: parsedEdits?.avatar || profileData.avatar || ''
      };
      
      // Update form state
      setEditForm({
        username: updatedProfile.username,
        bio: updatedProfile.bio,
        avatar: updatedProfile.avatar
      });
      
      // Set avatar preview if available
      if (updatedProfile.avatar) {
        setAvatarPreview(updatedProfile.avatar);
      }
      
      // Update local profile state
      setLocalProfile(updatedProfile);
    }
  }, [profileData, walletProfile]);
  
  const handleEditProfile = () => {
    // Reset form data to current profile data before opening modal
    if (profile) {
      setEditForm({
        username: profile.username,
        bio: profile.bio || '',
        avatar: profile.avatar || ''
      });
      
      // Reset avatar preview to current profile avatar
      setAvatarPreview(profile.avatar || null);
    }
    setEditModalOpen(true);
  };
  
  const handleSaveProfile = () => {
    // Here you would typically make an API call to save the profile
    console.log('Saving profile:', editForm);
    
    // Update local profile with edited data
    if (profile) {
      // Create a new profile object with the updated data
      const updatedProfile = {
        ...profile,
        username: editForm.username,
        bio: editForm.bio,
        avatar: editForm.avatar || profile.avatar // Keep existing avatar if none uploaded
      };
      
      // Update local state
      setLocalProfile(updatedProfile);
      
      // In a real app, you would save this to the server
      // For now, we'll save to localStorage to persist between refreshes
      try {
        localStorage.setItem('userProfileEdits', JSON.stringify({
          username: updatedProfile.username,
          bio: updatedProfile.bio,
          avatar: updatedProfile.avatar
        }));
      } catch (err) {
        console.error('Failed to save profile to localStorage:', err);
      }
    }
    
    // Close the modal
    setEditModalOpen(false);
  };

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md">
        <Card className="gradient-card border-0 shadow-lg overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-2xl">Connect Wallet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pb-6">
            <p className="text-text-secondary text-center">
              Please connect your wallet to view your profile.
            </p>
            <Button 
              className="w-full bg-accent-primary text-bg-primary hover:bg-accent-primary/90 transition-all"
              onClick={() => setLocation("/")}
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 max-w-5xl">
      <Card className="gradient-card mb-8 border-0 shadow-lg overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {isLoading ? (
              <Skeleton className="w-28 h-28 rounded-full" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-accent-primary/10 flex items-center justify-center text-3xl font-bold overflow-hidden shadow-md border-2 border-accent-primary/20">
                {profile?.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt={profile.username} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      // If image fails to load, show initials instead
                      (e.target as HTMLImageElement).style.display = 'none';
                      console.error('Failed to load profile avatar');
                    }}
                  />
                ) : profile?.username ? (
                  <span>{profile.username.slice(0, 2).toUpperCase()}</span>
                ) : (
                  <i className="ri-user-line text-4xl text-accent-primary/50"></i>
                )}
              </div>
            )}

            <div className="flex-1 text-center md:text-left">
              {isLoading ? (
                <>
                  <Skeleton className="h-10 w-56 mx-auto md:mx-0 mb-2" />
                  <Skeleton className="h-4 w-full max-w-md mx-auto md:mx-0 mb-4" />
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    {/* Wallet Account Name and Rank Badge */}
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <h1 className="text-3xl font-bold">{profile?.username}</h1>
                      <Badge className="bg-accent-primary/20 text-accent-primary hover:bg-accent-primary/30 self-center md:self-auto">
                        {profile?.stats?.winRate && profile.stats.winRate >= 60 ? 'Elite Trader' : 
                         profile?.stats?.winRate && profile.stats.winRate >= 40 ? 'Rising Star' : 'Novice'}
                      </Badge>
                    </div>
                    
                    {/* Wallet Account Name */}
                    <div className="flex items-center">
                      <i className="ri-user-3-line mr-2 text-accent-primary"></i>
                      <p className="text-text-secondary font-medium">
                        {walletProfile?.username || 'Unknown'}
                      </p>
                    </div>
                    
                    {/* Wallet Address */}
                    <div className="flex items-center">
                      <i className="ri-wallet-3-line mr-2 text-accent-primary"></i>
                      <p className="text-text-secondary text-sm font-mono overflow-hidden text-ellipsis">{address}</p>
                      <button 
                        className={`ml-2 text-sm transition-all duration-300 ${copiedAddress ? 'text-green-500' : 'text-accent-primary hover:text-accent-primary/70'}`}
                        onClick={() => {
                          navigator.clipboard.writeText(address || '');
                          setCopiedAddress(true);
                          setTimeout(() => setCopiedAddress(false), 2000);
                        }}
                        title={copiedAddress ? "Copied!" : "Copy wallet address"}
                      >
                        <i className={copiedAddress ? "ri-check-line" : "ri-file-copy-line"}></i>
                      </button>
                    </div>
                    
                    {/* Bio Field */}
                    <div className="bg-bg-primary/20 p-4 rounded-lg border border-accent-primary/10">
                      <h3 className="text-sm uppercase text-text-secondary mb-2 font-medium flex items-center">
                        <i className="ri-user-line mr-2"></i>Bio
                      </h3>
                      {profile?.bio ? 
                        <p className="text-text-primary">{profile.bio}</p> : 
                        <p className="text-text-secondary/50 italic">No bio yet. Click 'Edit Profile' to add one!</p>
                      }
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                {isLoading ? (
                  Array(4).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))
                ) : profile && (
                  <>
                    <div className="bg-bg-primary/20 px-4 py-3 rounded-xl text-center backdrop-blur-sm shadow-sm border border-accent-primary/10 hover:border-accent-primary/30 transition-colors">
                      <p className="text-sm text-text-secondary font-medium mb-1">Win Rate</p>
                      <p className="font-mono font-bold text-lg">{profile.stats.winRate}%</p>
                    </div>
                    <div className="bg-bg-primary/20 px-4 py-3 rounded-xl text-center backdrop-blur-sm shadow-sm border border-accent-primary/10 hover:border-accent-primary/30 transition-colors">
                      <p className="text-sm text-text-secondary font-medium mb-1">Total PnL</p>
                      <p className={`font-mono font-bold text-lg ${profile.stats.totalPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {profile.stats.totalPnl >= 0 ? '+' : ''}{profile.stats.totalPnl}%
                      </p>
                    </div>
                    <div className="bg-bg-primary/20 px-4 py-3 rounded-xl text-center backdrop-blur-sm shadow-sm border border-accent-primary/10 hover:border-accent-primary/30 transition-colors">
                      <p className="text-sm text-text-secondary font-medium mb-1">ARENA</p>
                      <p className="font-mono font-bold text-lg">{profile.stats.arenaTokens}</p>
                    </div>
                    <div className="bg-bg-primary/20 px-4 py-3 rounded-xl text-center backdrop-blur-sm shadow-sm border border-accent-primary/10 hover:border-accent-primary/30 transition-colors">
                      <p className="text-sm text-text-secondary font-medium mb-1">Matches</p>
                      <p className="font-mono font-bold text-lg">{profile.stats.totalMatches}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-6 md:mt-0">
              <Button 
                variant="outline" 
                className="border-accent-primary text-accent-primary hover:bg-accent-primary/10 transition-colors"
                onClick={handleEditProfile}
              >
                <i className="ri-edit-line mr-2"></i>
                Edit Profile
              </Button>
              <Separator className="my-1 bg-accent-primary/20" />
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1 hover:bg-bg-primary/30">
                  <span className="font-bold mr-1">{profile?.stats.followers || 0}</span> 
                  <span className="text-text-secondary">Followers</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 hover:bg-bg-primary/30">
                  <span className="font-bold mr-1">{profile?.stats.following || 0}</span>
                  <span className="text-text-secondary">Following</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="matches">
        <TabsList className="w-full bg-bg-secondary/80 mb-6 p-1 rounded-xl shadow-inner">
          <TabsTrigger value="matches" className="flex-1 rounded-lg data-[state=active]:bg-accent-primary data-[state=active]:text-bg-primary">Match History</TabsTrigger>
          <TabsTrigger value="reels" className="flex-1 rounded-lg data-[state=active]:bg-accent-primary data-[state=active]:text-bg-primary">Reels</TabsTrigger>
          <TabsTrigger value="stats" className="flex-1 rounded-lg data-[state=active]:bg-accent-primary data-[state=active]:text-bg-primary">Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="matches">
          <Card className="gradient-card border-0 shadow-lg overflow-hidden">
            <CardHeader className="border-b border-accent-primary/10 pb-4">
              <CardTitle className="flex items-center">
                <i className="ri-history-line mr-2 text-accent-primary"></i>
                Recent Matches
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : profile?.matchHistory.length ? (
                <div className="space-y-4">
                  {profile.matchHistory.map((match) => (
                    <div key={match.id} className="flex items-center justify-between p-4 bg-bg-primary/30 backdrop-blur-sm rounded-xl border border-accent-primary/10 hover:border-accent-primary/20 transition-all shadow-sm hover:shadow">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${match.result === 'win' ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'}`}>
                          <i className={match.result === 'win' ? 'ri-award-line text-xl' : 'ri-close-circle-line text-xl'}></i>
                        </div>
                        <div>
                          <p className="font-medium">Match vs {match.opponent}</p>
                          <p className="text-sm text-text-secondary">{new Date(match.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${match.result === 'win' ? 'text-profit' : 'text-loss'}`}>
                          {match.result === 'win' ? 'Win' : 'Loss'}
                        </p>
                        <p className={`text-sm font-mono font-medium ${match.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                          {match.pnl >= 0 ? '+' : ''}{match.pnl}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-text-secondary bg-bg-primary/20 rounded-xl border border-accent-primary/10">
                  <i className="ri-trophy-line text-5xl mb-4 block opacity-50"></i>
                  <p className="mb-2">No matches found.</p>
                  <p className="text-sm">Join a match to start your trading journey!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reels">
          <Card className="gradient-card border-0 shadow-lg overflow-hidden">
            <CardHeader className="border-b border-accent-primary/10 pb-4">
              <CardTitle className="flex items-center">
                <i className="ri-film-line mr-2 text-accent-primary"></i>
                Your Reels
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12 text-text-secondary bg-bg-primary/20 rounded-xl border border-accent-primary/10">
                <i className="ri-film-line text-5xl mb-4 block opacity-50"></i>
                <p className="mb-4">You haven't posted any reels yet</p>
                <Button className="bg-accent-primary text-bg-primary hover:bg-accent-primary/90 transition-all">
                  <i className="ri-add-line mr-2"></i>
                  Create Your First Reel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats">
          <Card className="gradient-card border-0 shadow-lg overflow-hidden">
            <CardHeader className="border-b border-accent-primary/10 pb-4">
              <CardTitle className="flex items-center">
                <i className="ri-line-chart-line mr-2 text-accent-primary"></i>
                Trading Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="text-center py-12 text-text-secondary bg-bg-primary/20 rounded-xl border border-accent-primary/10">
                  <i className="ri-line-chart-line text-5xl mb-4 block opacity-50"></i>
                  <p className="mb-2">Statistics will be available after you complete more matches</p>
                  <p className="text-sm">Win more matches to unlock detailed performance analytics</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Edit Profile Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-bg-secondary border-accent-primary/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center gap-4 pb-2 border-b border-accent-primary/10">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-bg-primary/30 flex items-center justify-center relative group">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile Preview" className="w-full h-full object-cover" />
                ) : profile?.avatar ? (
                  <img src={profile.avatar} alt="Current Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold">{profile?.username?.slice(0, 2).toUpperCase()}</span>
                )}
                <div className="absolute inset-0 bg-bg-primary/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <i className="ri-camera-line text-2xl"></i>
                </div>
              </div>
              <div>
                <input 
                  type="file" 
                  id="avatar" 
                  accept="image/*"
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          setAvatarPreview(event.target.result as string);
                          setEditForm({...editForm, avatar: event.target.result as string});
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  className="text-accent-primary border-accent-primary/50"
                  onClick={() => document.getElementById('avatar')?.click()}
                >
                  <i className="ri-upload-2-line mr-2"></i>
                  Upload Photo
                </Button>
              </div>
            </div>
            
            {/* Username Field */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">Username</Label>
              <Input 
                id="username" 
                value={editForm.username} 
                onChange={(e) => setEditForm({...editForm, username: e.target.value})} 
                className="col-span-3 bg-bg-primary/30"
              />
            </div>
            
            {/* Bio Field */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bio" className="text-right">Bio</Label>
              <Textarea 
                id="bio" 
                value={editForm.bio} 
                onChange={(e) => setEditForm({...editForm, bio: e.target.value})} 
                className="col-span-3 bg-bg-primary/30 min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditModalOpen(false)}
              className="border-accent-primary/50 text-text-primary"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveProfile}
              className="bg-accent-primary text-bg-primary hover:bg-accent-primary/90"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
