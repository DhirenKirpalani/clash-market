import { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMatch } from "@/hooks/useMatch";
import { useToast } from "@/hooks/use-toast";

export default function PostMatchSummary() {
  const { matchSummary, matchEnded, resetMatch, rematch } = useMatch();
  const { toast } = useToast();

  useEffect(() => {
    if (matchEnded && matchSummary) {
      // Could trigger a confetti animation here if the user won
    }
  }, [matchEnded, matchSummary]);

  if (!matchEnded || !matchSummary) return null;

  const handleRematch = async () => {
    try {
      await rematch();
      toast({
        title: "Rematch Requested",
        description: "Waiting for opponent to accept...",
      });
    } catch (error) {
      toast({
        title: "Rematch Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const handleShare = () => {
    // Share functionality would go here
    toast({
      title: "Share Feature",
      description: "This feature will be available soon!",
    });
  };

  const isWinner = matchSummary.playerPnl > matchSummary.opponentPnl;

  return (
    <Dialog open={matchEnded} onOpenChange={() => resetMatch()}>
      <DialogContent className="gradient-card rounded-xl p-6 max-w-2xl w-full mx-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20"></div>
        
        <h2 className={`text-2xl font-bold font-manrope text-center mb-2 mt-4 ${isWinner ? 'text-accent-primary' : 'text-loss'}`}>
          {isWinner ? "Victory!" : "Defeat!"}
        </h2>
        <p className="text-text-secondary text-center mb-6">
          {isWinner ? "You outperformed your opponent" : "Your opponent performed better this time"}
        </p>
        
        <div className="flex justify-between items-center p-4 bg-bg-primary rounded-lg mb-6">
          <div className="flex items-center">
            <div className={`h-12 w-12 rounded-full bg-bg-secondary border-2 ${matchSummary.playerPnl >= 0 ? 'border-profit' : 'border-loss'} flex items-center justify-center overflow-hidden mr-3`}>
              <span className="text-sm font-medium">You</span>
            </div>
            <div>
              <p className="font-medium">Final PnL</p>
              <p className={`${matchSummary.playerPnl >= 0 ? 'text-profit' : 'text-loss'} font-mono font-medium text-xl`}>
                {matchSummary.playerPnl >= 0 ? '+' : ''}{matchSummary.playerPnl.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="relative w-48 h-2 bg-bg-secondary rounded-full mb-1">
              <div 
                className={`absolute top-0 ${isWinner ? 'left-0' : 'right-0'} h-full ${isWinner ? 'bg-profit' : 'bg-loss'} rounded-full`}
                style={{ 
                  width: `${Math.abs(matchSummary.playerPnl) / (Math.abs(matchSummary.playerPnl) + Math.abs(matchSummary.opponentPnl) + 0.01) * 100}%` 
                }}
              ></div>
            </div>
            <div className="flex items-center justify-center text-sm">
              <i className={`${isWinner ? 'ri-trophy-line text-accent-primary' : 'ri-emotion-sad-line text-loss'} mr-1`}></i>
              <span>{isWinner ? 'Winner' : 'Next time!'}</span>
            </div>
          </div>
          <div className="flex items-center">
            <div>
              <p className="font-medium text-right">Final PnL</p>
              <p className={`${matchSummary.opponentPnl >= 0 ? 'text-profit' : 'text-loss'} font-mono font-medium text-xl text-right`}>
                {matchSummary.opponentPnl >= 0 ? '+' : ''}{matchSummary.opponentPnl.toFixed(1)}%
              </p>
            </div>
            <div className={`h-12 w-12 rounded-full bg-bg-secondary border-2 ${matchSummary.opponentPnl >= 0 ? 'border-profit' : 'border-loss'} flex items-center justify-center overflow-hidden ml-3`}>
              <span className="text-sm font-medium">{matchSummary.opponentName.slice(0, 2).toUpperCase()}</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-bg-primary p-4 rounded-lg">
            <h3 className="font-medium mb-3">Match Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-secondary">Orders Placed</span>
                <span>{matchSummary.stats.ordersPlaced}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Win Rate</span>
                <span>{matchSummary.stats.winRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Avg. Position Size</span>
                <span>{matchSummary.stats.avgPositionSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Biggest Win</span>
                <span className="text-profit">+{matchSummary.stats.biggestWin}%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-bg-primary p-4 rounded-lg">
            <h3 className="font-medium mb-3">Rewards</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-secondary">ARENA Tokens</span>
                <span className="text-accent-primary">+{matchSummary.rewards.tokens} ARENA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">XP Gained</span>
                <span>+{matchSummary.rewards.xp} XP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Leaderboard Points</span>
                <span>+{matchSummary.rewards.leaderboardPoints} Points</span>
              </div>
              {matchSummary.rewards.achievement && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">New Achievement</span>
                  <span className="text-accent-secondary">{matchSummary.rewards.achievement} 🎉</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            className="flex-1 py-3 bg-bg-primary hover:bg-bg-primary/70"
            onClick={handleShare}
          >
            <i className="ri-share-line mr-1"></i>
            Share Result
          </Button>
          <Button 
            className="flex-1 py-3 bg-accent-primary text-bg-primary rounded-lg font-medium glow-button"
            onClick={handleRematch}
          >
            <i className="ri-restart-line mr-1"></i>
            Play Again
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
