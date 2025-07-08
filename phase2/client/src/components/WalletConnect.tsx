import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import WalletConnectModal from "@/components/WalletConnectModal";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

// Define PhantomWindow interface
interface PhantomWindow extends Window {
  solana?: {
    isPhantom?: boolean;
  };
}

export default function WalletConnect() {
  const [showModal, setShowModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasPhantom, setHasPhantom] = useState(false);
  const { connected, address, connect } = useWallet();
  const { toast } = useToast();

  // Check if Phantom wallet is installed
  useEffect(() => {
    const checkForPhantom = () => {
      const phantomWindow = window as PhantomWindow;
      if (typeof window !== "undefined" && phantomWindow.solana?.isPhantom) {
        setHasPhantom(true);
      } else {
        setHasPhantom(false);
      }
    };
    
    // Initial check
    checkForPhantom();
    
    // Add event listener for when Phantom might be installed/detected
    window.addEventListener('DOMContentLoaded', checkForPhantom);
    window.addEventListener('focus', checkForPhantom);
    
    return () => {
      window.removeEventListener('DOMContentLoaded', checkForPhantom);
      window.removeEventListener('focus', checkForPhantom);
    };
  }, []);

  const handleOpenModal = useCallback(() => {
    if (!connected) {
      if (!hasPhantom) {
        toast({
          title: "Phantom Wallet Required",
          description: "Please install the Phantom wallet extension to connect",
          variant: "destructive",
        });
        // Open Phantom install page
        window.open("https://phantom.app/", "_blank");
        return;
      }
      setShowModal(true);
    }
  }, [connected, hasPhantom, toast]);

  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className="group"
      >
        <Button 
          variant={connected ? "outline" : "default"}
          className={`relative transition-all duration-300 ${connected 
            ? "border-[#05d6a9] text-[#026d56] hover:shadow-[0_0_10px_rgba(5,214,169,0.5)]" 
            : "bg-[#05d6a9] hover:bg-[#05d6a9]/90 text-white hover:shadow-[0_0_15px_rgba(5,214,169,0.6)]"}`}
          onClick={handleOpenModal}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <div className="animate-spin inline-block mr-2 w-4 h-4 border-2 border-accent-secondary border-t-transparent rounded-full"></div>
              Connecting...
            </>
          ) : (
            <>
              <i className="ri-wallet-3-line mr-2"></i>
              {connected ? formatAddress(address) : "Connect Wallet"}
            </>
          )}
          {!connected && <div className="absolute -inset-[1px] rounded-md bg-gradient-to-r from-[#05d6a9] to-[#03896a] opacity-30 -z-10 blur-[1px] group-hover:opacity-50 transition-opacity"></div>}
        </Button>
      </motion.div>
      
      <WalletConnectModal 
        show={showModal} 
        onClose={() => setShowModal(false)} 
        onConnect={async () => {
          try {
            setIsConnecting(true);
            await connect();
            setShowModal(false);
          } catch (error) {
            console.error('Connect error:', error);
            toast({
              title: "Connection Failed",
              description: error instanceof Error ? error.message : "Could not connect to wallet",
              variant: "destructive",
            });
          } finally {
            setIsConnecting(false);
          }
        }}
      />
    </>
  );
}
