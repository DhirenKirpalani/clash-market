import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import phantomLogo from "@/components/assets/White Ghost_docs_nu.svg";
import { useState } from "react";
import { motion } from "framer-motion";

interface WalletConnectModalProps {
  show: boolean;
  onClose: () => void;
  onConnect?: () => Promise<void>;
}

export default function WalletConnectModal({ show, onClose, onConnect }: WalletConnectModalProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState("");
  
  const handleConnect = async () => {
    if (!onConnect || isConnecting) return;
    
    setIsConnecting(true);
    setConnectError("");
    
    try {
      await onConnect();
      onClose();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setConnectError(error instanceof Error ? error.message : "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="gradient-card rounded-xl p-6 max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-manrope">Connect Your Wallet</DialogTitle>
          <DialogDescription className="text-text-secondary">
            Connect your Phantom wallet to start trading and competing in matches.
          </DialogDescription>
        </DialogHeader>
        
        <motion.div 
          className={`p-4 border border-neutral/20 rounded-lg mb-6 hover:border-accent-primary/50 transition-colors relative overflow-hidden ${isConnecting ? 'opacity-70' : 'cursor-pointer'}`}
          onClick={!isConnecting ? handleConnect : undefined}
          whileHover={!isConnecting ? { scale: 1.02 } : undefined}
          whileTap={!isConnecting ? { scale: 0.98 } : undefined}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-[#AB9FF2] flex items-center justify-center mr-4">
              {isConnecting ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <img src={phantomLogo} alt="Phantom" className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="font-medium">Phantom</h3>
              <p className="text-sm text-text-secondary">
                {isConnecting ? "Connecting..." : "Connect to your Phantom wallet"}
              </p>
            </div>
          </div>
          {/* Add subtle animated gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#AB9FF2]/10 to-[#AB9FF2]/30 opacity-0 hover:opacity-100 transition-opacity -z-10"></div>
        </motion.div>
        
        <div className="p-4 border border-neutral/20 rounded-lg mb-6 hover:border-accent-primary/50 transition-colors cursor-pointer opacity-50">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-[#3396FF]/20 flex items-center justify-center mr-4">
              <i className="ri-wallet-3-line text-[#3396FF] text-xl"></i>
            </div>
            <div>
              <h3 className="font-medium">WalletConnect</h3>
              <p className="text-sm text-text-secondary">Coming soon</p>
            </div>
          </div>
        </div>
        
        {connectError && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-md text-sm text-red-200">
            {connectError}
          </div>
        )}
        
        <Button 
          className="w-full py-3 px-4 bg-accent-primary text-bg-primary rounded-lg font-medium glow-button relative overflow-hidden group"
          onClick={handleConnect}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <div className="animate-spin inline-block mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              Connecting...
            </>
          ) : (
            "Connect Wallet"
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/0 via-white/30 to-accent-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
        </Button>
        
        <p className="text-xs text-center text-text-secondary mt-4">By connecting, you agree to our Terms of Service</p>
      </DialogContent>
    </Dialog>
  );
}
