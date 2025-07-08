import { useLocation, Link } from "wouter";
import { useMatch } from "@/hooks/useMatch";

export default function MobileNavigation() {
  const [location, setLocation] = useLocation();
  const { activeMatch } = useMatch();
  
  const isActive = (path: string) => location === path;
  
  // Function to handle navigation that works even during active matches
  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Force navigation to home page regardless of match state
    setLocation("/");
  };
  
  return (
    <nav className="lg:hidden flex items-center justify-between px-6 py-3 bg-bg-secondary border-t border-neutral/20 fixed bottom-0 w-full z-40">
      {/* Use onClick handler to ensure navigation works even during matches */}
      <div 
        onClick={handleHomeClick}
        className={`flex flex-col items-center cursor-pointer ${isActive("/") ? "text-accent-primary" : "text-text-secondary"}`}
      >
        <i className="ri-home-5-line text-xl"></i>
        <span className="text-xs mt-1">Home</span>
      </div>
      <Link href="/match">
        <div className={`flex flex-col items-center cursor-pointer ${isActive("/match") ? "text-accent-primary" : "text-text-secondary"}`}>
          <i className="ri-sword-line text-xl"></i>
          <span className="text-xs mt-1">Play</span>
        </div>
      </Link>
      <Link href="/reels">
        <div className={`flex flex-col items-center cursor-pointer ${isActive("/reels") ? "text-accent-primary" : "text-text-secondary"}`}>
          <i className="ri-film-line text-xl"></i>
          <span className="text-xs mt-1">Reels</span>
        </div>
      </Link>
      <Link href="/wallet">
        <div className={`flex flex-col items-center cursor-pointer ${isActive("/wallet") ? "text-accent-primary" : "text-text-secondary"}`}>
          <i className="ri-wallet-3-line text-xl"></i>
          <span className="text-xs mt-1">Wallet</span>
        </div>
      </Link>
      <Link href="/profile">
        <div className={`flex flex-col items-center cursor-pointer ${isActive("/profile") ? "text-accent-primary" : "text-text-secondary"}`}>
          <i className="ri-user-3-line text-xl"></i>
          <span className="text-xs mt-1">Profile</span>
        </div>
      </Link>
    </nav>
  );
}
