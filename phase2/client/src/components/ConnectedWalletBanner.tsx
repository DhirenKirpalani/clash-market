import { useWallet } from "@/hooks/useWallet";

export default function ConnectedWalletBanner() {
  const { address, balances } = useWallet();

  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <div className="gradient-card rounded-lg p-3 lg:p-4 mb-6 border border-accent-primary/30 shadow-[0_0_15px_rgba(0,232,252,0.5)]">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
        <div className="flex items-center mb-2 lg:mb-0">
          <div className="w-8 h-8 bg-accent-primary/20 rounded-full flex items-center justify-center mr-3">
            <i className="ri-wallet-3-line text-accent-primary"></i>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Connected: <span className="text-text-primary font-mono">{formatAddress(address)}</span></p>
          </div>
        </div>
        <div className="flex space-x-4">
          <div className="bg-bg-primary/40 px-3 py-1.5 rounded-lg">
            <p className="text-sm text-text-secondary">SOL Balance</p>
            <p className="font-mono font-medium">{balances.sol || "0.00"} SOL</p>
          </div>
          <div className="bg-bg-primary/40 px-3 py-1.5 rounded-lg">
            <p className="text-sm text-text-secondary">ARENA Balance</p>
            <p className="font-mono font-medium">{balances.arena || "0"} ARENA</p>
          </div>
        </div>
      </div>
    </div>
  );
}
