import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useRoute } from "wouter";
import MatchDashboard from "@/components/MatchDashboard";
import { useMatch } from "@/hooks/useMatch";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Add Node type reference
type TimeoutRef = ReturnType<typeof setTimeout>;

// Interface for match data structure
interface MatchData {
  id: string;
  status: string;
  players?: {address: string}[];
  [key: string]: any; // For other properties
}

// Interface for WebSocket message data
interface WebSocketMessageData {
  type: string;
  match?: MatchData;
  reason?: string;
  [key: string]: any;
}

export default function Match() {
  console.log('MATCH PAGE: Component rendered');
  
  // Core state and hooks
  const [, setLocation] = useLocation();
  const [matched, params] = useRoute<{matchId: string}>('/match/:matchId');
  const { activeMatch, matchEnded, resetMatch, setActiveMatch }: any = useMatch();
  const { connected, address }: any = useWallet();
  const [forcedMatch, setForcedMatch] = useState<MatchData | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const pollIntervalRef = useRef<TimeoutRef | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Debug info
  console.log('MATCH PAGE: URL matched =', matched, 'params =', params);
  console.log('MATCH PAGE: Active match from context =', activeMatch);

  // Helper function to get the API base URL
  const getApiBaseUrl = () => {
    return `${window.location.protocol}//${window.location.host}/api`;
  };

  // Fetch match by ID from the URL parameter
  const fetchMatchById = async (matchId: string): Promise<MatchData | null> => {
    console.log('MATCH PAGE: Fetching match by ID:', matchId);
    setIsLoading(true);
    
    // Create a minimal match object with the ID to set immediately
    // This ensures we always have a match object to render
    const minimalMatch: MatchData = {
      id: matchId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    // Set this immediately so we don't show 'No Active Match'
    console.log('MATCH PAGE: Setting minimal match data while fetching');
    setForcedMatch(minimalMatch);
    setActiveMatch(minimalMatch);
    localStorage.setItem('activeMatchData', JSON.stringify(minimalMatch));
    
    try {
      const apiUrl = `${getApiBaseUrl()}/matches/${matchId}`;
      console.log('MATCH PAGE: API URL =', apiUrl);
      
      const response = await fetch(apiUrl);
      if (response.ok) {
        // Fixed TypeScript error here - added type assertion
        const data = await response.json() as { match?: MatchData };
        console.log('MATCH PAGE: Match data received:', data);
        
        if (data && data.match) {
          console.log('MATCH PAGE: Match found, setting active match');
          setActiveMatch(data.match);
          localStorage.setItem('activeMatchData', JSON.stringify(data.match));
          return data.match; // Return the match data from the API
        } else {
          console.log('MATCH PAGE: No match found with ID:', matchId);
          // Keep using our minimal match instead of showing No Active Match
          return minimalMatch; // Return the minimal match we created
        }
      } else {
        console.error('MATCH PAGE: API error:', response.status);
        return minimalMatch; // Return minimal match on API error
      }
    } catch (error: unknown) {
      console.error('MATCH PAGE: Error fetching match:', error);
      return minimalMatch; // Return minimal match on error
    } finally {
      setIsLoading(false);
      setInitialLoadComplete(true);
    }
  };

  // Fetch active match for the current user
  const fetchActiveMatch = async (): Promise<void> => {
    console.log('MATCH PAGE: Fetching active match for address:', address);
    setIsLoading(true);
    
    try {
      const apiUrl = `${getApiBaseUrl()}/matches/active?address=${address}`;
      console.log('MATCH PAGE: API URL =', apiUrl);
      
      const response = await fetch(apiUrl);
      if (response.ok) {
        // Fixed TypeScript error here - added type assertion
        const data = await response.json() as { match?: MatchData };
        console.log('MATCH PAGE: Match data received:', data);
        
        if (data && data.match) {
          console.log('MATCH PAGE: Active match found, setting active match');
          setActiveMatch(data.match);
          localStorage.setItem('activeMatchData', JSON.stringify(data.match));
        } else {
          console.log('MATCH PAGE: No active match found for address');
          // Try localStorage as fallback
          const storedMatchData = localStorage.getItem('activeMatchData');
          if (storedMatchData) {
            try {
              const matchData = JSON.parse(storedMatchData) as MatchData;
              console.log('MATCH PAGE: Using stored match data:', matchData);
              setActiveMatch(matchData);
            } catch (error: unknown) {
              console.error('MATCH PAGE: Failed to parse stored match data');
              localStorage.removeItem('activeMatchData');
            }
          }
        }
      } else {
        console.error('MATCH PAGE: API error:', response.status);
      }
    } catch (error: unknown) {
      console.error('MATCH PAGE: Error fetching active match:', error);
    } finally {
      setIsLoading(false);
      setInitialLoadComplete(true);
    }
  };

  // Setup WebSocket connection
  const setupWebSocket = (): (() => void) | undefined => {
    if (wsRef.current) return; // Already set up
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    console.log('MATCH PAGE: Setting up WebSocket at', wsUrl);
    
    const ws = new WebSocket(wsUrl);
    ws.onopen = () => console.log('MATCH PAGE: WebSocket connection opened');
    ws.onclose = () => console.log('MATCH PAGE: WebSocket connection closed');
    ws.onerror = (error: Event) => console.error('MATCH PAGE: WebSocket error:', error);
    
    ws.onmessage = (event: MessageEvent) => {
      try {
        const data: WebSocketMessageData = JSON.parse(event.data as string);
        console.log('MATCH PAGE: WebSocket message received:', data);
        
        if (data.type === 'match_update' && data.match) {
          console.log('MATCH PAGE: Match update received via WebSocket');
          setActiveMatch(data.match);
        }
        
        if (data.type === 'match_ended') {
          console.log('MATCH PAGE: Match ended received via WebSocket');
          matchEnded(data.reason || 'unknown');
          setLocation('/game-over');
        }
      } catch (error: unknown) {
        console.error('MATCH PAGE: Error processing WebSocket message:', error);
      }
    };
    
    wsRef.current = ws;
    
    // Cleanup function
    return () => {
      console.log('MATCH PAGE: Closing WebSocket connection');
      ws.close();
      wsRef.current = null;
    };
  };

  // Setup polling fallback
  const setupPolling = (): (() => void) | undefined => {
    if (pollIntervalRef.current) return; // Already set up
    
    console.log('MATCH PAGE: Setting up polling fallback');
    const interval = setInterval(async () => {
      if (!activeMatch) return;
      
      try {
        const apiUrl = `${getApiBaseUrl()}/matches/${activeMatch.id}/status`;
        const response = await fetch(apiUrl);
        if (response.ok) {
          const data = await response.json() as {match?: MatchData, reason?: string};
          if (data && data.match) {
            if (data.match.status === 'ended') {
              console.log('MATCH PAGE: Match ended detected via polling');
              matchEnded(data.reason || 'unknown');
              setLocation('/game-over');
            }
          }
        }
      } catch (error: unknown) {
        console.error('MATCH PAGE: Error polling match status:', error);
      }
    }, 10000); // Poll every 10 seconds
    
    pollIntervalRef.current = interval;
    
    // Cleanup function
    return () => {
      console.log('MATCH PAGE: Clearing polling interval');
      clearInterval(interval);
      pollIntervalRef.current = null;
    };
  };

  // Initialize - load match based on URL parameter or current user
  useEffect(() => {
    console.log('MATCH PAGE: Initialization effect');
    console.log('MATCH PAGE: URL matched =', matched, 'params =', params);
    console.log('MATCH PAGE: Current URL =', window.location.href);
    
    // Check if there's a match ID in the URL path even if router doesn't catch it
    const urlPath = window.location.pathname;
    const urlMatchId = urlPath.match(/\/match\/(\w+)/)?.[1];
    
    if (urlMatchId) {
      console.log('MATCH PAGE: Found match ID in URL path:', urlMatchId);
      fetchMatchById(urlMatchId);
    }
    // First check if we have a match ID from router params
    else if (matched && params?.matchId) {
      console.log('MATCH PAGE: Matched route with ID:', params.matchId);
      fetchMatchById(params.matchId);
    } 
    // Otherwise load the active match for the current user
    else if (connected && address) {
      console.log('MATCH PAGE: No match ID in URL, fetching active match');
      fetchActiveMatch();
    } 
    // Not connected
    else {
      console.log('MATCH PAGE: Not connected, skipping fetch');
      setIsLoading(false);
    }
    
    // Always try to load from localStorage as a quick initial render
    const storedMatchData = localStorage.getItem('activeMatchData');
    if (storedMatchData && !activeMatch) {
      try {
        const matchData = JSON.parse(storedMatchData) as MatchData;
        console.log('MATCH PAGE: Using stored match data for initial render');
        setActiveMatch(matchData);
      } catch (error: unknown) {
        console.error('MATCH PAGE: Error parsing stored match data');
      }
    }
    
    // Setup realtime updates
    const wsCleanup = setupWebSocket();
    const pollCleanup = setupPolling();
    
    // Cleanup on unmount
    return () => {
      if (typeof wsCleanup === 'function') wsCleanup();
      if (typeof pollCleanup === 'function') pollCleanup();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, address, matched, params?.matchId]);

  // Fetch match data on component mount - using a ref to prevent duplicate calls
  const hasFetchedRef = useRef(false);
  
  useEffect(() => {
    // Only run this once per matchId to prevent infinite loops
    if (hasFetchedRef.current && params?.matchId) {
      return;
    }
    
    console.log('MATCH PAGE: Fetching match data for matchId =', params?.matchId);
    
    // Check localStorage first for immediate rendering
    try {
      const storedMatchData = localStorage.getItem('activeMatchData');
      if (storedMatchData) {
        const parsedData = JSON.parse(storedMatchData);
        console.log('MATCH PAGE: Found match data in localStorage:', parsedData);
        
        // If we have a matchId from URL and it matches localStorage, use localStorage data as initial state
        if (params?.matchId && parsedData.id === params.matchId) {
          console.log('MATCH PAGE: Using localStorage match data for immediate rendering');
          setForcedMatch(parsedData);
          // Pre-emptively set loading to false to prevent flicker
          setIsLoading(false);
        }
      }
    } catch (e) {
      console.error('MATCH PAGE: Error parsing localStorage match data:', e);
    }
    
    // Then fetch from API for complete data
    if (connected && params?.matchId) {
      setIsLoading(true);
      fetchMatchById(params.matchId)
        .then(matchData => {
          console.log('MATCH PAGE: Fetched match data:', matchData);
          if (matchData) {
            // Apply match data to state
            setForcedMatch(matchData);
            
            // Update localStorage with latest data
            try {
              localStorage.setItem('activeMatchData', JSON.stringify(matchData));
            } catch (e) {
              console.error('Error updating localStorage with match data:', e);
            }
          }
          // Mark that we've fetched to prevent infinite loops
          hasFetchedRef.current = true;
        })
        .catch(err => {
          console.error('MATCH PAGE: Error fetching match data:', err);
          // Mark that we've fetched even on error
          hasFetchedRef.current = true;
        })
        .finally(() => {
          setIsLoading(false);
          setInitialLoadComplete(true);
        });
    } else if (!params?.matchId) {
      setInitialLoadComplete(true);
      setIsLoading(false);
    }
  }, [connected, params?.matchId]); // Removed fetchMatchById from dependencies to prevent re-runs

  // Save active match to localStorage when it changes
  useEffect(() => {
    if (activeMatch) {
      console.log('MATCH PAGE: Saving active match to localStorage');
      try {
        localStorage.setItem('activeMatchData', JSON.stringify(activeMatch));
      } catch (error: unknown) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }, [activeMatch]);

  // Effect for logging match state - lowest priority effect, won't cause re-renders
  useEffect(() => {
    // Log current match state for debugging
    try {
      const debugStr = JSON.stringify({ activeMatch, forcedMatch }, null, 2);
      console.log('MATCH PAGE: Match Debug Info:', debugStr);
      setDebugInfo(debugStr);
    } catch (error) {
      console.error('Error stringifying debug info:', error);
      setDebugInfo('Error creating debug info');
    }
  }, [forcedMatch, activeMatch]);
  
  // Use the forcedMatch when needed - highest priority effect
  // Moved down to ensure it runs after the data fetching is complete
  useEffect(() => {
    // Always use forcedMatch if available, to ensure immediate rendering
    if (forcedMatch && (!activeMatch || forcedMatch.id !== activeMatch.id || 
        (forcedMatch.status !== activeMatch.status))) {
      console.log('Using forcedMatch as activeMatch:', forcedMatch);
      // Call setActiveMatch without checking its return value
      setActiveMatch(forcedMatch);
      // Once we've set activeMatch, we can turn off loading if it's still on
      if (isLoading) {
        setIsLoading(false);
      }
    }
  }, [forcedMatch, activeMatch, isLoading]);
  
  // RENDERING
  
  // Not connected
  if (!connected) {
    console.log('MATCH PAGE: Rendering not connected state');
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-text-secondary mb-4">
              Please connect your wallet to participate in matches.
            </p>
            <Button 
              className="w-full"
              onClick={() => setLocation("/")}
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active match - highest priority rendering condition
  if (activeMatch) {
    console.log('MATCH PAGE: Rendering active match state');
    console.log('MATCH PAGE: Debug - activeMatch =', activeMatch);
    return <MatchDashboard activeMatch={activeMatch} />;
  }

  // Loading - only show if no active match is available yet
  if (isLoading) {
    console.log('MATCH PAGE: Rendering loading state');
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Loading Match</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex items-center justify-center space-x-2 py-4">
              <div className="h-4 w-4 rounded-full bg-accent-primary animate-pulse"></div>
              <div className="h-4 w-4 rounded-full bg-accent-primary animate-pulse delay-150"></div>
              <div className="h-4 w-4 rounded-full bg-accent-primary animate-pulse delay-300"></div>
            </div>
            <p className="text-text-secondary mb-4">
              Loading your match data...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No active match - but first check localStorage one more time as a final safeguard
  if (!activeMatch && initialLoadComplete) {
    console.log('MATCH PAGE: Checking localStorage one last time before showing no match');
    // Try to load from localStorage one final time
    const storedMatchData = localStorage.getItem('activeMatchData');
    if (storedMatchData) {
      try {
        const matchData = JSON.parse(storedMatchData) as MatchData;
        console.log('MATCH PAGE: Found stored match data in last check:', matchData);
        // Use the data directly instead of forcing a page reload
        setForcedMatch(matchData);
        setActiveMatch(matchData);
        // Return loading indicator while we apply the match data
        return (
          <div className="container mx-auto px-4 py-8 max-w-md">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle>Processing Match Data</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-text-secondary mb-4">
                  Preparing your match...
                </p>
              </CardContent>
            </Card>
          </div>
        );
      } catch (error: unknown) {
        console.error('Error parsing localStorage match data:', error);
      }
    }
    console.log('MATCH PAGE: Rendering no active match state');
    console.log('MATCH PAGE: Debug - activeMatch =', activeMatch, 'initialLoadComplete =', initialLoadComplete);
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>No Active Match</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-text-secondary mb-4">
              You are not currently in a match. Join a queue to start playing!
            </p>
            <Button 
              className="w-full"
              onClick={() => setLocation("/")}
            >
              Find a Match
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Commenting out the waiting screen so MatchDashboard always shows for any activeMatch
  // Match is waiting for opponent
  // if (activeMatch && (activeMatch.status === 'pending' || activeMatch.status === 'waiting')) {
  //   console.log('MATCH PAGE: Rendering waiting state');
  //   console.log('MATCH PAGE: Debug - activeMatch status =', activeMatch.status);
  //   return (
  //     <div className="container mx-auto px-4 py-8 max-w-md">
  //       <Card className="gradient-card">
  //         <CardHeader>
  //           <CardTitle>Waiting for Opponent</CardTitle>
  //         </CardHeader>
  //         <CardContent className="text-center">
  //           <div className="flex items-center justify-center space-x-2 py-4">
  //             <div className="h-4 w-4 rounded-full bg-accent-primary animate-pulse"></div>
  //             <div className="h-4 w-4 rounded-full bg-accent-primary animate-pulse delay-150"></div>
  //             <div className="h-4 w-4 rounded-full bg-accent-primary animate-pulse delay-300"></div>
  //           </div>
  //           <p className="text-text-secondary mb-4">
  //             Waiting for your opponent to join the match...
  //           </p>
  //           <p className="text-xs text-text-secondary mb-4">
  //             Match ID: {activeMatch.id}<br/>
  //             This page will automatically update when your opponent joins.
  //           </p>
  //           <Button 
  //             className="w-full mt-4"
  //             variant="outline"
  //             onClick={() => setLocation("/")}
  //           >
  //             Return to Lobby
  //           </Button>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }


  // Active match
  if (activeMatch) {
    console.log('MATCH PAGE: Rendering active match state');
    console.log('MATCH PAGE: Debug - activeMatch =', activeMatch);
    return (
      <div className="container mx-auto px-4 py-6">
        <MatchDashboard activeMatch={activeMatch} />
      </div>
    );
  }

  // Fallback (should never reach here)
  console.log('MATCH PAGE: Rendering fallback state');
  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle>Loading Match</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-text-secondary mb-4">
            Preparing your match...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
