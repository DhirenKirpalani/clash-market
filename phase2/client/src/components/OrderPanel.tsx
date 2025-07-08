import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDrift, TRADING_PAIRS } from "@/lib/driftAdapter";
import { useMatch } from "@/hooks/useMatch";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/useWallet";

export default function OrderPanel() {
  const { placeOrder, getMarketPrice, tradingPairs } = useDrift();
  const { activeMatch } = useMatch();
  const { toast } = useToast();
  const { connected } = useWallet();
  
  const [amount, setAmount] = useState("100");
  const [leverage, setLeverage] = useState("10");
  const [orderType, setOrderType] = useState<"long" | "short" | null>(null);
  const [estimatedLiquidationPrice, setEstimatedLiquidationPrice] = useState<number | null>(null);
  const [marketPrice, setMarketPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get the current market price when the component loads
  useEffect(() => {
    if (activeMatch) {
      const fetchMarketPrice = async () => {
        try {
          const price = await getMarketPrice(activeMatch.market);
          setMarketPrice(price);
          calculateLiquidationPrice(price);
        } catch (error) {
          console.error("Failed to fetch market price:", error);
        }
      };
      
      fetchMarketPrice();
      
      // Update price every 5 seconds
      const interval = setInterval(fetchMarketPrice, 5000);
      return () => clearInterval(interval);
    }
  }, [activeMatch, getMarketPrice]);
  
  // Calculate liquidation price when order parameters change
  useEffect(() => {
    if (marketPrice) {
      calculateLiquidationPrice(marketPrice);
    }
  }, [orderType, leverage, marketPrice]);
  
  const calculateLiquidationPrice = (price: number) => {
    if (!orderType || !price) {
      setEstimatedLiquidationPrice(null);
      return;
    }
    
    const leverageValue = parseInt(leverage);
    
    // Simple liquidation price calculation
    // In a real app, you'd use a more sophisticated calculation
    if (orderType === 'long') {
      const liqPrice = price * (1 - 1/leverageValue) * 0.95; // 5% buffer
      setEstimatedLiquidationPrice(liqPrice);
    } else {
      const liqPrice = price * (1 + 1/leverageValue) * 1.05; // 5% buffer
      setEstimatedLiquidationPrice(liqPrice);
    }
  };

  if (!activeMatch) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setAmount(value);
  };

  const handlePlaceOrder = async () => {
    if (!orderType) {
      toast({
        title: "Order Type Required",
        description: "Please select Long or Short position",
        variant: "destructive"
      });
      return;
    }
    
    if (!connected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to place orders",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);

    try {
      await placeOrder({
        market: activeMatch.market,
        direction: orderType,
        amount: parseFloat(amount),
        leverage: parseInt(leverage),
      });

      toast({
        title: "Order Placed",
        description: `${orderType.toUpperCase()} order placed successfully`,
      });
    } catch (error) {
      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const availableBalance = 425; // This would come from your wallet/balance state
  // We're now calculating the liquidation price dynamically

  return (
    <Card className="gradient-card rounded-xl p-4 border border-neutral/20">
      <CardContent className="p-0">
        <h3 className="font-medium mb-4">Place Order</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Button 
            className={`py-3 ${
              orderType === 'long' 
                ? 'bg-profit/20 text-profit hover:bg-profit/30' 
                : 'bg-bg-primary text-text-primary hover:bg-bg-primary/70'
            } rounded-lg transition-colors font-medium`}
            onClick={() => setOrderType('long')}
          >
            <i className="ri-arrow-up-line mr-1"></i>
            Long
          </Button>
          <Button 
            className={`py-3 ${
              orderType === 'short' 
                ? 'bg-loss/20 text-loss hover:bg-loss/30' 
                : 'bg-bg-primary text-text-primary hover:bg-bg-primary/70'
            } rounded-lg transition-colors font-medium`}
            onClick={() => setOrderType('short')}
          >
            <i className="ri-arrow-down-line mr-1"></i>
            Short
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-text-secondary text-sm mb-1">Amount (USDT)</label>
            <div className="relative">
              <Input 
                type="text" 
                value={amount} 
                onChange={handleAmountChange}
                className="w-full bg-bg-primary rounded-lg py-2 px-3 text-text-primary"
              />
              <div className="absolute right-0 top-0 h-full flex items-center pr-3">
                <span className="text-text-secondary text-sm">USDT</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-text-secondary text-sm mb-1">Leverage</label>
            <Select value={leverage} onValueChange={setLeverage}>
              <SelectTrigger className="w-full bg-bg-primary">
                <SelectValue placeholder="Select leverage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2x</SelectItem>
                <SelectItem value="5">5x</SelectItem>
                <SelectItem value="10">10x</SelectItem>
                <SelectItem value="20">20x</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-between text-sm text-text-secondary mb-6">
          <span>Est. Liquidation Price: <span className="text-text-primary font-mono">
            {estimatedLiquidationPrice ? `$${estimatedLiquidationPrice.toLocaleString()}` : '-'}
          </span></span>
          <span>Available Balance: <span className="text-text-primary font-mono">{availableBalance} USDT</span></span>
        </div>
        
        <Button 
          className="w-full py-3 bg-accent-primary text-bg-primary rounded-lg font-medium glow-button"
          onClick={handlePlaceOrder}
          disabled={!orderType || isLoading}
        >
          {isLoading ? 'Processing...' : 'Place Order'}
        </Button>
      </CardContent>
    </Card>
  );
}
