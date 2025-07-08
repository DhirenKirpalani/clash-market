import { useState, useEffect, useCallback } from "react";
import Logo from "./Logo";
import { useLocation, useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import WalletConnect from "@/components/WalletConnect";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { useMatch } from "@/hooks/useMatch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Define window with Phantom extension
interface WindowWithSolana extends Window {
  solana?: {
    isPhantom?: boolean;
    connect: () => Promise<any>;
  };
}

// Define notification types
type NotificationType = 'match_invite' | 'match_forfeit' | 'match_end' | 'match_start' | 'leaderboard_update' | 'system';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
}

export default function NavBar() {
  const [location, setLocation] = useLocation();
  // Create a navigate function using setLocation for programmatic navigation
  const router = { push: (path: string) => setLocation(path) };
  const { connected, userProfile, disconnect, address } = useWallet();
  const { toast } = useToast();
  const { activeMatch, matchEnded, matchSummary } = useMatch();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Initialize activeSection from localStorage for persistence
  const [activeSection, setActiveSection] = useState<string | null>(() => {
    try {
      const savedSection = localStorage.getItem('activeNavSection');
      return savedSection || null;
    } catch (e) {
      console.error('Error accessing localStorage:', e);
      return null;
    }
  });
  
  // Save activeSection to localStorage whenever it changes
  useEffect(() => {
    try {
      if (activeSection) {
        localStorage.setItem('activeNavSection', activeSection);
      } else {
        localStorage.removeItem('activeNavSection');
      }
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }, [activeSection]);
  
  // Function to scroll to leaderboard section
  const scrollToLeaderboard = () => {
    // Find the leaderboard section by its ID
    const leaderboardSection = document.getElementById('leaderboard-section');
    
    if (leaderboardSection) {
      // If found, scroll to it with smooth behavior
      leaderboardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Fallback to a reasonable scroll position if element not found
      console.log('Leaderboard section not found, using fallback scroll');
      window.scrollTo({ top: 900, behavior: 'smooth' });
    }
  };
  
  // Maintain persistence - scroll to leaderboard if it was the active section
  useEffect(() => {
    // Only execute on the homepage
    if (location === '/' && activeSection === 'leaderboard') {
      // Short delay to ensure DOM is fully loaded
      setTimeout(scrollToLeaderboard, 500);
    }
  }, [location]);
  
  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  
  // Function to add a new notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    console.log('Adding notification:', notification.title);
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 20)); // Keep only the 20 most recent
    setHasUnread(true);
    
    // Show toast for important notifications
    if (notification.type === 'match_forfeit' || notification.type === 'match_end') {
      toast({
        title: notification.title,
        description: notification.message,
      });
    }
  }, [toast]);
  
  // Mark all notifications as read when dropdown is opened
  useEffect(() => {
    if (notificationsOpen && hasUnread) {
      setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
      setHasUnread(false);
    }
  }, [notificationsOpen, hasUnread]);
  
  // Listen for WebSocket messages for notifications
  useEffect(() => {
    const handleWebSocketMessage = (event: MessageEvent) => {
      try {
        // Safely parse the data
        let data;
        if (typeof event.data === 'string') {
          try {
            data = JSON.parse(event.data);
          } catch (e) {
            return;
          }
        } else if (typeof event.data === 'object') {
          data = event.data;
        } else {
          return;
        }
        
        if (!data || !data.type) return;
        console.log('WebSocket message received:', data.type, data);
        
        // Handle different notification types
        if (data.type === 'match_found') {
          console.log('WebSocket: match_found event received', data);
          // Note: The match_found event is now fully handled by MatchProvider in useMatch.tsx
          // NavBar no longer handles this event to avoid navigation conflicts
        }
        
        if (data.type === 'match_invite' && data.invitee === address) {
          addNotification({
            type: 'match_invite',
            title: 'New Match Invite',
            message: `${data.inviter} has invited you to a match!`,
            actionUrl: `/match?code=${data.inviteCode}`
          });
        }
        
        if (data.type === 'match_forfeited' && data.matchId === activeMatch?.id) {
          addNotification({
            type: 'match_forfeit',
            title: 'Match Forfeited',
            message: 'Your opponent has forfeited the match.',
            actionUrl: '/'
          });
        }
        
        if (data.type === 'match_end') {
          const isWinner = data.winner === address;
          addNotification({
            type: 'match_end',
            title: isWinner ? 'Victory!' : 'Match Ended',
            message: isWinner ? 'Congratulations! You won the match.' : 'Better luck next time!',
            actionUrl: '/games'
          });
        }
        
        // Handle system notifications
        if (data.type === 'system') {
          addNotification({
            type: 'system',
            title: data.title || 'System Notification',
            message: data.message || '',
            actionUrl: data.actionUrl
          });
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };
    
    // Listen for custom events from WebSocket
    window.addEventListener('message', handleWebSocketMessage);
    
    // Also listen directly for WebSocket messages from the WebSocketProvider
    const { socket } = (window as any).__webSocketClient || {};
    if (socket && socket instanceof WebSocket) {
      socket.addEventListener('message', handleWebSocketMessage);
    }
    
    return () => {
      window.removeEventListener('message', handleWebSocketMessage);
      if (socket && socket instanceof WebSocket) {
        socket.removeEventListener('message', handleWebSocketMessage);
      }
    };
  }, [address, activeMatch, addNotification]);
  
  // Define a function to handle scrolling to top with smooth behavior
  const scrollToTop = () => {
    console.log('Scrolling to top');
    try {
      // First, ensure the window position is reset
      window.scrollTo(0, 0);
      
      // Force browser-specific scrolling
      // For Safari
      if (document.body) {
        document.body.scrollTop = 0;
      }
      
      // For Chrome, Firefox, IE and Opera
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      
      // Reset any scrollable elements that might be causing issues
      document.querySelectorAll('.overflow-auto, .overflow-y-auto, .overflow-scroll, .overflow-y-scroll').forEach(element => {
        if (element instanceof HTMLElement) {
          element.scrollTop = 0;
        }
      });
      
      // Also try to scroll the main element if it exists
      const mainElement = document.querySelector('main');
      if (mainElement) {
        mainElement.scrollTop = 0;
      }
      
      // Try smooth scrolling for better user experience
      setTimeout(() => {
        try {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
          });
          
          // Also ensure the document body/html are scrolled to top
          document.body.scrollTop = 0;
          document.documentElement.scrollTop = 0;
        } catch (error) {
          console.log('Smooth scroll not supported');
        }
      }, 50);
    } catch (err) {
      // Fallback to regular scroll if smooth scroll fails
      console.error('Error smooth scrolling:', err);
      window.scrollTo(0, 0);
    }
  };
  
  // Function to handle navigation and scroll to top
  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // If already on home page, just scroll to top
    if (location === '/') {
      scrollToTop();
    } else {
      // Navigate to home page
      setLocation("/");
      
      // Longer delay to ensure navigation and rendering completes before scrolling
      // This is important when switching between different pages/components
      setTimeout(() => {
        scrollToTop();
        
        // Additional safety check - try again after a slightly longer delay
        // This ensures the content has fully loaded before scrolling
        setTimeout(() => {
          scrollToTop();
        }, 300);
      }, 200);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 py-4 px-4 md:px-6 flex justify-center" style={{backgroundColor: "#012619"}}>
      <div className="md:bg-white md:rounded-full max-w-screen-xl w-full flex h-14 items-center px-6 md:px-10 md:shadow-md">
        <div className="flex w-full justify-between items-center">
          {/* Function to scroll to top of the page */}
          {(() => {
            const scrollToTop = () => {
              // First, scroll the main content area if it exists
              const mainElement = document.querySelector('main');
              if (mainElement) {
                mainElement.scrollTop = 0; // Force immediate scroll to top
                mainElement.scrollTo({ top: 0, behavior: 'smooth' });
              }
              
              // Then scroll the window with smooth behavior
              window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
              });
              
              // Additional immediate scrolling for all possible elements
              document.body.scrollTop = 0; // For Safari
              document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
              
              // Force a second scroll after a small delay to ensure it reaches the top
              setTimeout(() => {
                if (window.pageYOffset > 0 || document.documentElement.scrollTop > 0 || document.body.scrollTop > 0) {
                  window.scrollTo(0, 0);
                  document.body.scrollTop = 0;
                  document.documentElement.scrollTop = 0;
                  if (mainElement) mainElement.scrollTop = 0;
                }
              }, 50);
            };
            
            // Make scrollToTop available globally for other components
            (window as any).scrollToTop = scrollToTop;
            
            return null;
          })()}
          
          <div className="flex items-center gap-3">
            {/* LIQIFY Logo and Brand for desktop - clicking navigates to home */}
            <div 
              className="hidden md:flex items-center gap-1 mr-8 cursor-pointer" 
              onClick={handleHomeClick}
            >
              <Logo size={52} />
              <h2 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#05d6a9] to-[#04eac2]">LIQIFY</h2>
            </div>
            
            {/* Mobile Hamburger Menu */}
            <div className="md:hidden mr-2">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-[#05d6a9] hover:bg-[#05d6a9]/10">
                    <i className="ri-menu-line text-xl text-[#05d6a9]"></i>
                  </Button>
                </SheetTrigger>
                <SheetContent side="top" className="pt-12 backdrop-blur-sm border-b border-[#05d6a9]/20">
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-[#05d6a9]/20">
                      <div 
                        className="flex items-center gap-1 cursor-pointer" 
                        onClick={() => {
                          setLocation("/"); // Navigate to home
                          setMobileMenuOpen(false);
                          // Use setTimeout to ensure navigation completes before scrolling
                          setTimeout(() => {
                            scrollToTop();
                            return null; // Return null to satisfy TypeScript
                          }, 300);
                        }}
                      >
                        <Logo size={46} />
                        <h3 className="text-xl font-bold text-[#00F0FF]">LIQIFY</h3>
                      </div>
                    </div>
                    <ScrollArea className="flex-1 p-4">
                      <div className="p-4 flex flex-col gap-4 text-black">
                        <Link href="/" className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-all ${location === '/' ? 'text-[#05d6a9] font-semibold border-b border-[#05d6a9]' : 'text-[#808080] hover:text-[#05d6a9]/80'}`} onClick={() => setMobileMenuOpen(false)}>
                          <i className="ri-home-4-line"></i>
                          <span>Home</span>
                        </Link>
                        <Link href="/match" onClick={() => {
                          setActiveSection(null);
                          setMobileMenuOpen(false);
                        }}>
                          <div className="flex items-center gap-2 py-2 px-4 rounded-lg text-[#808080] hover:text-[#05d6a9]/80 cursor-pointer transition-colors">
                            <i className="ri-sword-line"></i>
                            <span>Play</span>
                          </div>
                        </Link>
                        <div 
                          onClick={(e) => {
                            e.preventDefault();
                            // Set leaderboard as active section
                            setActiveSection('leaderboard');
                            // Close mobile menu
                            setMobileMenuOpen(false);
                            // Navigate to games page and scroll to leaderboard section
                            if (location !== '/games') {
                              setLocation('/games');
                              // Add a delay to ensure the page has loaded before scrolling
                              setTimeout(() => {
                                const leaderboardSection = document.getElementById('leaderboard-section');
                                if (leaderboardSection) {
                                  leaderboardSection.scrollIntoView({ behavior: 'smooth' });
                                }
                              }, 500);
                            } else {
                              // Already on games page, scroll immediately
                              const leaderboardSection = document.getElementById('leaderboard-section');
                              if (leaderboardSection) {
                                leaderboardSection.scrollIntoView({ behavior: 'smooth' });
                              }
                            }
                          }}
                          className="flex items-center gap-2 py-2 px-4 rounded-lg text-[#808080] hover:text-[#05d6a9]/80 cursor-pointer transition-colors"
                        >
                          <i className="ri-bar-chart-line"></i>
                          <span>Leaderboard</span>
                        </div>
                        <div 
                          onClick={(e) => {
                            e.preventDefault();
                            // Set games as active section
                            setActiveSection('games');
                            // Navigate to games and scroll to top
                            setLocation('/games');
                            // Close mobile menu
                            setMobileMenuOpen(false);
                            // Scroll to top after navigation
                            setTimeout(() => {
                              scrollToTop();
                            }, 300);
                          }}
                          className={`flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer transition-all ${location === '/games' ? 'text-[#05d6a9] font-semibold border-b border-[#05d6a9]' : 'text-[#808080] hover:text-[#05d6a9]/80'}`}
                        >
                          <i className="ri-gamepad-line"></i>
                          <span>Games</span>
                        </div>
                        <div 
                          onClick={(e) => {
                            e.preventDefault();
                            // Set leaderboard as active section
                            setActiveSection('leaderboard');
                            // Close mobile menu
                            setMobileMenuOpen(false);
                            // Navigate to games page and scroll to leaderboard section
                            if (location !== '/games') {
                              setLocation('/games');
                              // Add a delay to ensure the page has loaded before scrolling
                              setTimeout(() => {
                                const leaderboardSection = document.getElementById('leaderboard-section');
                                if (leaderboardSection) {
                                  leaderboardSection.scrollIntoView({ behavior: 'smooth' });
                                }
                              }, 500);
                            } else {
                              // Already on games page, scroll immediately
                              const leaderboardSection = document.getElementById('leaderboard-section');
                              if (leaderboardSection) {
                                leaderboardSection.scrollIntoView({ behavior: 'smooth' });
                              }
                            }
                          }}
                          className="flex items-center gap-2 py-2 px-4 rounded-lg text-[#808080] hover:text-[#05d6a9]/80 cursor-pointer transition-colors"
                        >
                          <i className="ri-bar-chart-line"></i>
                          <span>Leaderboard</span>
                        </div>
                        {/* Watch functionality removed */}
                        <div 
                          onClick={(e) => {
                            e.preventDefault();
                            setActiveSection(null);
                            setMobileMenuOpen(false);
                            // Check if wallet is connected before navigating to profile
                            if (connected) {
                              setLocation('/profile');
                            } else {
                              // If not connected, show a toast notification
                              toast({
                                title: "Wallet not connected",
                                description: "Please connect your wallet to view your profile",
                                variant: "destructive"
                              });
                            }
                          }}
                          className="flex items-center gap-2 py-2 px-4 rounded-lg text-[#808080] hover:text-[#05d6a9]/80 cursor-pointer transition-colors"
                        >
                          <i className="ri-user-3-line"></i>
                          <span>Profile</span>
                        </div>
                        <div 
                          onClick={(e) => {
                            e.preventDefault();
                            setActiveSection(null);
                            setMobileMenuOpen(false);
                            // Check if wallet is connected before navigating to wallet
                            if (connected) {
                              setLocation('/wallet');
                            } else {
                              // If not connected, show a toast notification
                              toast({
                                title: "Wallet not connected",
                                description: "Please connect your wallet to view your wallet",
                                variant: "destructive"
                              });
                            }
                          }}
                          className="flex items-center gap-2 py-2 px-4 rounded-lg text-[#808080] hover:text-[#05d6a9]/80 cursor-pointer transition-colors"
                        >
                          <i className="ri-wallet-3-line"></i>
                          <span>Wallet</span>
                        </div>
                        <Link href="/about" onClick={() => {
                          setActiveSection(null);
                          setMobileMenuOpen(false);
                        }}>
                          <div className="flex items-center gap-2 py-2 px-4 rounded-lg text-[#808080] hover:text-[#05d6a9]/80 cursor-pointer transition-colors">
                            <i className="ri-information-line"></i>
                            <span>About</span>
                          </div>
                        </Link>
                      </div>
                    </ScrollArea>
                    <div className="p-4 border-t border-[#00F0FF]/20">
                      {connected ? (
                        <Button 
                          onClick={() => {
                            handleDisconnect();
                            setMobileMenuOpen(false);
                          }} 
                          variant="ghost" 
                          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <i className="ri-logout-box-line mr-2"></i> Disconnect
                        </Button>
                      ) : (
                        <div onClick={() => setMobileMenuOpen(false)} className="w-full">
                          <WalletConnect />
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            {/* Mobile version of logo is handled in the mobile menu */}
          </div>
          
          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 ml-14">
            <Link 
              href="/" 
              onClick={() => {
                setActiveSection(null);
                scrollToTop();
              }}
              className="cursor-pointer"
            >
              <span className={`text-base font-medium transition-all ${location === '/' ? 'text-[#05d6a9] font-semibold' : 'text-[#808080] hover:text-[#05d6a9]/80'}`}>
                Home
              </span>
            </Link>
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                setActiveSection('games');
                setLocation('/games');
                // Scroll to top after navigation
                setTimeout(() => {
                  scrollToTop();
                }, 300);
              }}
              className="cursor-pointer"
            >
              <span className={`text-base font-medium transition-all ${location === '/games' ? 'text-[#05d6a9] font-semibold' : 'text-[#808080] hover:text-[#05d6a9]/80'}`}>
                Games
              </span>
            </a>
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                // Set leaderboard as active section
                setActiveSection('leaderboard');
                
                // Navigate to games page and scroll to leaderboard section
                if (location !== '/games') {
                  setLocation('/games');
                  // Add a delay to ensure the page has loaded before scrolling
                  setTimeout(() => {
                    const leaderboardSection = document.getElementById('leaderboard-section');
                    if (leaderboardSection) {
                      leaderboardSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 500);
                } else {
                  // Already on games page, scroll immediately
                  const leaderboardSection = document.getElementById('leaderboard-section');
                  if (leaderboardSection) {
                    leaderboardSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }}
              className="cursor-pointer"
            >
              <span className={`text-base font-medium transition-all ${activeSection === 'leaderboard' ? 'text-[#05d6a9] font-semibold' : 'text-[#808080] hover:text-[#05d6a9]/80'}`}>
                Leaderboard
              </span>
            </a>
            {/* Watch functionality removed */}
            <Link href="/about" onClick={() => setActiveSection(null)}>
              <span className={`text-base font-medium transition-all ${location === '/about' ? 'text-[#05d6a9] font-semibold' : 'text-[#808080] hover:text-[#05d6a9]/80'}`}>
                About
              </span>
            </Link>
          </nav>
          
          {/* Right Section - Connect Wallet Button or Profile */}
          <div className="flex items-center gap-5">
            {!connected ? (
              <WalletConnect />
            ) : (
              <>
                {/* Notifications */}
                <div className="relative">
                  <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                    <DropdownMenuTrigger asChild>
                      <button className="relative p-1.5 rounded-md hover:bg-[#05d6a9]/20 transition-colors">
                        <i className="ri-notification-2-line text-xl text-text-secondary"></i>
                        {hasUnread && (
                          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-[#05d6a9]"></span>
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 text-white rounded-md shadow-lg bg-[#012619] border border-[#05d6a9]/20">
                      <div className="py-2 px-4 border-b border-neutral/20">
                        <h3 className="font-medium">Notifications</h3>
                      </div>
                      
                      {notifications.length > 0 ? (
                        <ScrollArea className="h-[300px]">
                          {notifications.map(notification => {
                            // Get icon based on notification type
                            let icon = "ri-information-line";
                            if (notification.type === 'match_invite') icon = "ri-user-add-line";
                            if (notification.type === 'match_forfeit') icon = "ri-flag-line";
                            if (notification.type === 'match_end') icon = notification.title.includes('Victory') ? "ri-trophy-line" : "ri-emotion-sad-line";
                            if (notification.type === 'leaderboard_update') icon = "ri-bar-chart-line";
                            
                            return (
                              <div 
                                key={notification.id} 
                                className={`py-3 px-4 border-b border-neutral/10 cursor-pointer hover:bg-[#05d6a9]/40 transition-colors duration-200 ${!notification.read ? 'bg-[#05d6a9]/20' : ''}`}
                                onClick={() => {
                                  if (notification.actionUrl) {
                                    setLocation(notification.actionUrl);
                                    setNotificationsOpen(false);
                                  }
                                }}
                              >
                                <div className="flex items-start">
                                  <div className={`mr-3 p-1.5 rounded-full bg-accent-secondary/20 ${!notification.read ? 'text-accent-primary' : 'text-text-secondary'}`}>
                                    <i className={`${icon} text-lg`}></i>
                                  </div>
                                  <div className="flex-1">
                                    <p className={`font-medium text-sm ${!notification.read ? 'text-text-primary' : 'text-text-secondary'}`}>
                                      {notification.title}
                                    </p>
                                    <p className="text-xs text-text-secondary mt-1">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-text-tertiary mt-2">
                                      {new Date(notification.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </ScrollArea>
                      ) : (
                        <div className="p-4 text-center">
                          <p className="text-white">No notifications</p>
                        </div>
                      )}
                      
                      {notifications.length > 0 && (
                        <div className="py-2 px-4 border-t border-neutral/20">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full text-xs"
                            onClick={() => setNotifications([])}
                          >
                            Clear all
                          </Button>
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* Profile dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-9 w-9 bg-accent-secondary/20 cursor-pointer">
                      <AvatarFallback>{userProfile?.username?.slice(0, 2) || "JD"}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="text-white rounded-md shadow-lg bg-[#012619] border border-[#05d6a9]/20">
                    <Link href="/profile">
                      <DropdownMenuItem className="cursor-pointer text-white hover:bg-[#05d6a9]/40 py-3 transition-colors duration-200">
                        <i className="ri-user-3-line mr-2"></i> Profile
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/wallet">
                      <DropdownMenuItem className="cursor-pointer text-white hover:bg-[#05d6a9]/40 py-3 transition-colors duration-200">
                        <i className="ri-wallet-3-line mr-2"></i> Wallet
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDisconnect} className="cursor-pointer text-white hover:bg-[#05d6a9]/40 py-3 transition-colors duration-200">
                      <i className="ri-logout-box-line mr-2"></i> Disconnect
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
    </>
  );
}
