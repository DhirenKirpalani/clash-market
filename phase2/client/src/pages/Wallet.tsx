import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWallet } from "@/hooks/useWallet";

// Transaction type for displaying transaction history
type Transaction = {
  id: string;
  date: Date;
  type: 'deposit' | 'withdrawal' | 'match_reward' | 'match_fee';
  amount: number;
  token: 'SOL' | 'ARENA';
  status: 'completed' | 'pending' | 'failed';
  description: string;
};

// Mock transaction data - in a real app, this would come from an API
const mockTransactions: Transaction[] = [
  {
    id: 'tx1',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    type: 'match_reward',
    amount: 0.05,
    token: 'SOL',
    status: 'completed',
    description: 'Match reward vs CryptoKing'
  },
  {
    id: 'tx2',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    type: 'deposit',
    amount: 1,
    token: 'SOL',
    status: 'completed',
    description: 'Deposit from Phantom wallet'
  },
  {
    id: 'tx3',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    type: 'match_fee',
    amount: -0.01,
    token: 'SOL',
    status: 'completed',
    description: 'Match entry fee'
  },
  {
    id: 'tx4',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    type: 'deposit',
    amount: 100,
    token: 'ARENA',
    status: 'completed',
    description: 'ARENA token airdrop'
  },
  {
    id: 'tx5',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    type: 'withdrawal',
    amount: -0.5,
    token: 'SOL',
    status: 'completed',
    description: 'Withdrawal to external wallet'
  }
];

export default function Wallet() {
  const { connected, address, balances } = useWallet();
  const [, setLocation] = useLocation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Simulate loading transactions data
  useEffect(() => {
    if (connected) {
      // In a real app, you would fetch this data from an API
      const timer = setTimeout(() => {
        setTransactions(mockTransactions);
        setIsLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [connected]);

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md">
        <Card className="gradient-card border-0 shadow-lg overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-2xl">Connect Wallet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pb-6">
            <p className="text-text-secondary text-center">
              Please connect your wallet to view your balance and transactions.
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return <i className="ri-arrow-down-circle-line text-profit text-xl"></i>;
      case 'withdrawal':
        return <i className="ri-arrow-up-circle-line text-loss text-xl"></i>;
      case 'match_reward':
        return <i className="ri-trophy-line text-profit text-xl"></i>;
      case 'match_fee':
        return <i className="ri-gamepad-line text-text-secondary text-xl"></i>;
      default:
        return <i className="ri-exchange-line text-text-secondary text-xl"></i>;
    }
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 max-w-5xl">
      {/* Wallet Overview */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <Card className="gradient-card border-0 shadow-lg overflow-hidden">
          <CardHeader className="pb-2 border-b border-accent-primary/10">
            <CardTitle className="flex items-center text-xl">
              <i className="ri-wallet-3-line mr-2 text-accent-primary"></i>
              Wallet Overview
            </CardTitle>
            <CardDescription>
              Your connected Phantom wallet
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Wallet Address */}
            <div className="flex items-center bg-bg-primary/20 p-3 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center mr-3">
                <i className="ri-user-3-line text-accent-primary"></i>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm text-text-secondary">Wallet Address</p>
                <p className="text-text-primary font-mono text-sm truncate">{address}</p>
              </div>
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
            
            <div className="grid grid-cols-2 gap-4">
              {/* SOL Balance */}
              <div className="bg-bg-primary/20 p-4 rounded-xl backdrop-blur-sm shadow-sm border border-accent-primary/10 hover:border-accent-primary/30 transition-colors">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#9945FF]/10 flex items-center justify-center mr-2">
                    <i className="ri-currency-line text-[#9945FF]"></i>
                  </div>
                  <p className="text-text-secondary font-medium">SOL</p>
                </div>
                <p className="font-mono font-bold text-2xl">{balances?.sol || 0}</p>
                <p className="text-text-secondary text-xs">≈ ${((balances?.sol || 0) * 150).toFixed(2)} USD</p>
              </div>
              
              {/* ARENA Balance */}
              <div className="bg-bg-primary/20 p-4 rounded-xl backdrop-blur-sm shadow-sm border border-accent-primary/10 hover:border-accent-primary/30 transition-colors">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center mr-2">
                    <i className="ri-coin-line text-accent-primary"></i>
                  </div>
                  <p className="text-text-secondary font-medium">ARENA</p>
                </div>
                <p className="font-mono font-bold text-2xl">{balances?.arena || 0}</p>
                <p className="text-text-secondary text-xs">≈ ${((balances?.arena || 0) * 0.05).toFixed(2)} USD</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-4 p-4 border-t border-accent-primary/10 bg-bg-primary/5">
            <Button className="flex-1 bg-accent-primary text-bg-primary hover:bg-accent-primary/90">
              <i className="ri-add-line mr-2"></i>
              Deposit
            </Button>
            <Button variant="outline" className="flex-1 border-accent-primary/50 text-accent-primary hover:bg-accent-primary/10">
              <i className="ri-arrow-up-line mr-2"></i>
              Withdraw
            </Button>
          </CardFooter>
        </Card>
        
        {/* Activity Summary */}
        <Card className="gradient-card border-0 shadow-lg overflow-hidden">
          <CardHeader className="pb-2 border-b border-accent-primary/10">
            <CardTitle className="flex items-center text-xl">
              <i className="ri-bar-chart-box-line mr-2 text-accent-primary"></i>
              Activity Summary
            </CardTitle>
            <CardDescription>
              Your CryptoClash performance
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-bg-primary/20 p-4 rounded-xl backdrop-blur-sm shadow-sm border border-accent-primary/10">
                <p className="text-text-secondary text-sm mb-1">Total Matches</p>
                <p className="font-bold text-2xl">24</p>
              </div>
              <div className="bg-bg-primary/20 p-4 rounded-xl backdrop-blur-sm shadow-sm border border-accent-primary/10">
                <p className="text-text-secondary text-sm mb-1">Win Rate</p>
                <p className="font-bold text-2xl">62%</p>
              </div>
            </div>
            
            <div className="bg-bg-primary/20 p-4 rounded-xl backdrop-blur-sm shadow-sm border border-accent-primary/10 mb-4">
              <p className="text-text-secondary text-sm mb-1">All-time P&L</p>
              <p className="font-bold text-2xl text-profit">+2.45 SOL</p>
              <div className="w-full bg-bg-primary/30 h-2 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-accent-primary to-profit w-[62%]"></div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-text-secondary text-sm">Rank</p>
              <Badge className="bg-accent-primary/20 text-accent-primary px-3 py-1">
                Elite Trader
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center p-4 border-t border-accent-primary/10 bg-bg-primary/5">
            <Button className="w-full" variant="outline">
              <i className="ri-trophy-line mr-2"></i>
              View Leaderboard
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Transaction History */}
      <Card className="gradient-card border-0 shadow-lg overflow-hidden mb-8">
        <CardHeader className="pb-2 border-b border-accent-primary/10">
          <CardTitle className="flex items-center text-xl">
            <i className="ri-history-line mr-2 text-accent-primary"></i>
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all" className="w-full">
            <div className="px-6 pt-4">
              <TabsList className="w-full bg-bg-secondary/80 mb-4 p-1 rounded-xl shadow-inner">
                <TabsTrigger value="all" className="flex-1 rounded-lg data-[state=active]:bg-accent-primary data-[state=active]:text-bg-primary">
                  All
                </TabsTrigger>
                <TabsTrigger value="deposits" className="flex-1 rounded-lg data-[state=active]:bg-accent-primary data-[state=active]:text-bg-primary">
                  Deposits
                </TabsTrigger>
                <TabsTrigger value="withdrawals" className="flex-1 rounded-lg data-[state=active]:bg-accent-primary data-[state=active]:text-bg-primary">
                  Withdrawals
                </TabsTrigger>
                <TabsTrigger value="matches" className="flex-1 rounded-lg data-[state=active]:bg-accent-primary data-[state=active]:text-bg-primary">
                  Matches
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="px-6 pb-6">
              {isLoading ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center p-4 bg-bg-primary/30 backdrop-blur-sm rounded-xl border border-accent-primary/10 hover:border-accent-primary/20 transition-all shadow-sm hover:shadow">
                      <div className="mr-4">
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">{tx.description}</p>
                          <p className={`font-mono font-medium ${tx.amount > 0 ? 'text-profit' : 'text-loss'}`}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount} {tx.token}
                          </p>
                        </div>
                        <div className="flex justify-between mt-1">
                          <p className="text-sm text-text-secondary">{formatDate(tx.date)}</p>
                          <Badge variant="outline" className="text-xs border-accent-primary/30 text-text-secondary">
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-text-secondary bg-bg-primary/20 rounded-xl border border-accent-primary/10">
                  <i className="ri-history-line text-5xl mb-4 block opacity-50"></i>
                  <p className="mb-2">No transactions found</p>
                  <p className="text-sm">Your transaction history will appear here</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="deposits" className="px-6 pb-6">
              <div className="space-y-4">
                {transactions
                  .filter(tx => tx.type === 'deposit')
                  .map((tx) => (
                    <div key={tx.id} className="flex items-center p-4 bg-bg-primary/30 backdrop-blur-sm rounded-xl border border-accent-primary/10 hover:border-accent-primary/20 transition-all shadow-sm hover:shadow">
                      <div className="mr-4">
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">{tx.description}</p>
                          <p className="font-mono font-medium text-profit">
                            +{tx.amount} {tx.token}
                          </p>
                        </div>
                        <div className="flex justify-between mt-1">
                          <p className="text-sm text-text-secondary">{formatDate(tx.date)}</p>
                          <Badge variant="outline" className="text-xs border-accent-primary/30 text-text-secondary">
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="withdrawals" className="px-6 pb-6">
              <div className="space-y-4">
                {transactions
                  .filter(tx => tx.type === 'withdrawal')
                  .map((tx) => (
                    <div key={tx.id} className="flex items-center p-4 bg-bg-primary/30 backdrop-blur-sm rounded-xl border border-accent-primary/10 hover:border-accent-primary/20 transition-all shadow-sm hover:shadow">
                      <div className="mr-4">
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">{tx.description}</p>
                          <p className="font-mono font-medium text-loss">
                            {tx.amount} {tx.token}
                          </p>
                        </div>
                        <div className="flex justify-between mt-1">
                          <p className="text-sm text-text-secondary">{formatDate(tx.date)}</p>
                          <Badge variant="outline" className="text-xs border-accent-primary/30 text-text-secondary">
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="matches" className="px-6 pb-6">
              <div className="space-y-4">
                {transactions
                  .filter(tx => tx.type === 'match_reward' || tx.type === 'match_fee')
                  .map((tx) => (
                    <div key={tx.id} className="flex items-center p-4 bg-bg-primary/30 backdrop-blur-sm rounded-xl border border-accent-primary/10 hover:border-accent-primary/20 transition-all shadow-sm hover:shadow">
                      <div className="mr-4">
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">{tx.description}</p>
                          <p className={`font-mono font-medium ${tx.amount > 0 ? 'text-profit' : 'text-loss'}`}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount} {tx.token}
                          </p>
                        </div>
                        <div className="flex justify-between mt-1">
                          <p className="text-sm text-text-secondary">{formatDate(tx.date)}</p>
                          <Badge variant="outline" className="text-xs border-accent-primary/30 text-text-secondary">
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
