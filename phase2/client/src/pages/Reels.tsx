import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/hooks/useWallet";

type Reel = {
  id: number;
  author: {
    id: number;
    username: string;
    avatar?: string;
  };
  caption: string;
  likes: number;
  comments: number;
  videoUrl: string;
  createdAt: string;
  matchData?: {
    finalPnl: number;
    opponent: string;
    result: 'win' | 'loss';
  };
};

export default function Reels() {
  const { connected } = useWallet();
  const [activeReel, setActiveReel] = useState<number | null>(null);
  
  const { data, isLoading } = useQuery<Reel[]>({
    queryKey: ['/api/reels'],
  });
  
  // CRUD operations for reels
  const createReel = async (videoUrl: string, caption: string, matchId?: number) => {
    // Implementation will go here
    console.log('Creating reel:', { videoUrl, caption, matchId });
  };
  
  const updateReel = async (reelId: number, caption: string) => {
    // Implementation will go here
    console.log('Updating reel:', { reelId, caption });
  };
  
  const deleteReel = async (reelId: number) => {
    // Implementation will go here
    console.log('Deleting reel:', { reelId });
  };
  
  const likeReel = async (reelId: number) => {
    // Implementation will go here
    console.log('Liking reel:', { reelId });
  };

  return (
    <div className="container mx-auto px-4 lg:px-6 py-6 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold font-manrope">Trading Reels</h1>
          <span className="ml-3 px-2 py-0.5 text-xs font-medium bg-accent-primary/20 text-accent-primary rounded-md">
            Coming Soon
          </span>
        </div>
        {connected && (
          <Button variant="outline" className="border-accent-primary text-accent-primary">
            <i className="ri-add-line mr-2"></i>
            Create Reel
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="gradient-card overflow-hidden">
              <CardContent className="p-0">
                <Skeleton className="h-[400px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="gradient-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <i className="ri-film-line text-4xl text-accent-primary mb-4"></i>
            <h2 className="text-xl font-bold mb-4">Trading Reels Coming Soon</h2>
            <div className="text-center max-w-lg mb-6">
              <p className="text-text-secondary mb-3">
                We're excited to introduce Trading Reels - short form videos showcasing your best trades and market insights.
              </p>
              <p className="text-text-secondary mb-3">
                Share your trading victories, analyze market trends, and learn from the community with our interactive reel system.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-accent-primary/20 rounded-full flex items-center justify-center mb-2">
                    <i className="ri-video-upload-line text-xl text-accent-primary"></i>
                  </div>
                  <span className="text-sm">Create & Upload</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-accent-primary/20 rounded-full flex items-center justify-center mb-2">
                    <i className="ri-share-forward-line text-xl text-accent-primary"></i>
                  </div>
                  <span className="text-sm">Share Insights</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-accent-primary/20 rounded-full flex items-center justify-center mb-2">
                    <i className="ri-medal-line text-xl text-accent-primary"></i>
                  </div>
                  <span className="text-sm">Earn Rewards</span>
                </div>
              </div>
            </div>
            <Button variant="default" className="bg-accent-primary text-bg-primary" disabled>
              <i className="ri-notification-3-line mr-2"></i>
              Notify Me When Available
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
