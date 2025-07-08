import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDrift, Position } from "@/lib/driftAdapter";
import { useMatch } from "@/hooks/useMatch";
import { useToast } from "@/hooks/use-toast";

export default function PositionPanel() {
  const { positions, closePosition, fetchPositions } = useDrift();
  const { activeMatch } = useMatch();
  const { toast } = useToast();
  
  // Fetch positions when the component mounts
  useEffect(() => {
    fetchPositions();
    
    // Set up interval to refresh positions every 10 seconds
    const interval = setInterval(() => {
      fetchPositions();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [fetchPositions]);

  if (!activeMatch) return null;
  
  // Get the first position for now (in a real app, you'd want to select the correct one)
  const position = positions.length > 0 ? positions[0] : null;

  const handleClosePosition = async () => {
    if (!position) return;
    
    try {
      await closePosition(position.id);
      toast({
        title: "Position Closed",
        description: "Your position has been closed successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to Close Position",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="gradient-card rounded-xl p-4 border border-neutral/20 mb-6">
      <CardContent className="p-0">
        <h3 className="font-medium mb-4">Current Position</h3>
        {position ? (
          <>
            <div className="bg-bg-primary rounded-lg p-3 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-text-secondary">Position</span>
                <span className={position.direction === 'long' ? 'text-profit' : 'text-loss'}>
                  {position.direction === 'long' ? 'Long' : 'Short'} {position.market.split('/')[0]}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-text-secondary">Size</span>
                <span className="font-mono">{position.size} {position.market.split('/')[0]}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-text-secondary">Leverage</span>
                <span className="font-mono">{position.leverage}x</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-text-secondary">Entry Price</span>
                <span className="font-mono">${position.entryPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-text-secondary">Liq. Price</span>
                <span className="font-mono">${position.liquidationPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-text-secondary">PnL</span>
                <span className={`${position.pnl >= 0 ? 'text-profit' : 'text-loss'} font-medium font-mono`}>
                  {position.pnl >= 0 ? '+' : ''}{position.pnlUsd.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} ({position.pnl.toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline"
                className="py-2 bg-bg-primary hover:bg-bg-primary/70 rounded-lg transition-colors text-sm"
              >
                Add to Position
              </Button>
              <Button 
                variant="destructive"
                className="py-2 hover:bg-loss rounded-lg transition-colors text-sm"
                onClick={handleClosePosition}
              >
                Close Position
              </Button>
            </div>
          </>
        ) : (
          <div className="bg-bg-primary rounded-lg p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-neutral/10 rounded-full flex items-center justify-center mb-3">
              <i className="ri-file-list-3-line text-xl text-neutral"></i>
            </div>
            <p className="text-text-secondary mb-1">No Open Positions</p>
            <p className="text-xs text-text-secondary">Place an order to open a position</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
