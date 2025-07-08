// import { useEffect, useRef } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useQuery } from "@tanstack/react-query";
// import { useWebSocket } from "@/hooks/useWebSocket";

// interface ActivityFeedProps {
//   matchId: string;
// }

// type ActivityItem = {
//   id: string;
//   type: 'open_position' | 'close_position' | 'match_started' | 'player_joined' | 'other';
//   user: string;
//   isCurrentUser: boolean;
//   details: string;
//   timestamp: number;
// };

// export default function ActivityFeed({ matchId }: ActivityFeedProps) {
//   const feedContainerRef = useRef<HTMLDivElement>(null);
//   const { socket } = useWebSocket();
  
//   const { data: activities, isLoading } = useQuery<ActivityItem[]>({
//     queryKey: [`/api/matches/${matchId}/activity`],
//   });

//   // Subscribe to match activity updates
//   useEffect(() => {
//     if (!socket) return;

//     const handleActivityUpdate = (data: any) => {
//       if (data.matchId === matchId) {
//         // Could invalidate the query cache here to trigger a refetch
//       }
//     };
    
//     socket.addEventListener('message', (event) => {
//       try {
//         const data = JSON.parse(event.data);
//         if (data.type === 'activity') {
//           handleActivityUpdate(data);
//         }
//       } catch (error) {
//         console.error('Failed to parse WebSocket message:', error);
//       }
//     });
    
//     return () => {
//       // No need to remove event listener as the socket itself will be cleaned up
//       // in the useWebSocket hook
//     };
//   }, [socket, matchId]);

//   // Auto scroll to bottom when new activities come in
//   useEffect(() => {
//     if (feedContainerRef.current) {
//       feedContainerRef.current.scrollTop = feedContainerRef.current.scrollHeight;
//     }
//   }, [activities]);

//   const getIconForActivityType = (type: string) => {
//     switch (type) {
//       case 'open_position':
//         return "ri-arrow-up-line";
//       case 'close_position':
//         return "ri-close-circle-line";
//       case 'match_started':
//         return "ri-flag-line";
//       case 'player_joined':
//         return "ri-user-add-line";
//       default:
//         return "ri-information-line";
//     }
//   };

//   const getColorForActivityType = (type: string) => {
//     switch (type) {
//       case 'open_position':
//         return "bg-profit/20 text-profit";
//       case 'close_position':
//         return "bg-loss/20 text-loss";
//       case 'match_started':
//         return "bg-neutral/20 text-neutral";
//       case 'player_joined':
//         return "bg-accent-secondary/20 text-accent-secondary";
//       default:
//         return "bg-neutral/20 text-neutral";
//     }
//   };

//   const formatTimestamp = (timestamp: number) => {
//     const now = Date.now();
//     const diff = now - timestamp;
    
//     if (diff < 60000) {
//       return 'Just now';
//     } else if (diff < 3600000) {
//       return `${Math.floor(diff / 60000)} minutes ago`;
//     } else {
//       return `${Math.floor(diff / 3600000)} hours ago`;
//     }
//   };

//   return (
//     <Card className="gradient-card rounded-xl p-4 border border-neutral/20">
//       <CardContent className="p-0">
//         <h3 className="font-medium mb-4">Activity Feed</h3>
//         <div ref={feedContainerRef} className="space-y-4 h-96 overflow-y-auto pr-2">
//           {isLoading ? (
//             Array(3).fill(0).map((_, i) => (
//               <Skeleton key={i} className="h-20 w-full rounded-lg" />
//             ))
//           ) : activities?.length ? (
//             activities.map((activity) => (
//               <div key={activity.id} className="flex items-start p-3 bg-bg-primary rounded-lg">
//                 <div className={`w-8 h-8 rounded-full ${getColorForActivityType(activity.type)} flex items-center justify-center mr-3 flex-shrink-0`}>
//                   <i className={getIconForActivityType(activity.type)}></i>
//                 </div>
//                 <div>
//                   <p className="font-medium">
//                     {activity.isCurrentUser ? 'You' : activity.user} {activity.type.replace('_', ' ')}
//                   </p>
//                   <p className="text-sm text-text-secondary">{activity.details}</p>
//                   <p className="text-xs text-text-secondary mt-1">{formatTimestamp(activity.timestamp)}</p>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className="flex items-center justify-center h-full text-text-secondary">
//               No activity yet
//             </div>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";

interface ActivityFeedProps {
  matchId: string;
}

type ActivityItem = {
  id: string;
  type: 'open_position' | 'close_position' | 'match_started' | 'player_joined' | 'other';
  user: string;
  isCurrentUser: boolean;
  details: string;
  timestamp: number;
};

export default function ActivityFeed({ matchId }: ActivityFeedProps) {
  const feedContainerRef = useRef<HTMLDivElement>(null);
  const { socket, connected, sendMessage } = useWebSocket();
  const queryClient = useQueryClient();
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  
  // Query for initial activity data
  const { data: activities, isLoading, refetch } = useQuery<ActivityItem[]>({
    queryKey: [`match-activity-${matchId}`],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/matches/${matchId}/activity`);
        if (!response.ok) {
          throw new Error(`Error fetching activity: ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Failed to fetch activity data:', error);
        return [];
      }
    },
    staleTime: 0, // Make sure we always get fresh data
    refetchOnWindowFocus: false
  });

  // Subscribe to match activity updates via WebSocket
  useEffect(() => {
    // Safely handle WebSocket connection
    if (!socket) {
      console.log('WebSocket not available for activity feed');
      return;
    }

    // Handler for activity updates
    const handleActivityUpdate = (data: any) => {
      try {
        if (data.matchId === matchId) {
          console.log('Activity update received:', data);
          // Refetch the activity data
          refetch();
          setLastUpdate(Date.now()); // Force component update
        }
      } catch (error) {
        console.error('Error processing activity update:', error);
      }
    };
    
    // Message handler function for WebSocket messages
    const messageHandler = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        // Check different possible message formats
        if (data.type === 'activity' || 
           (data.event === 'activity') || 
           (data.channel === 'activity') || 
           (data.category === 'activity')) {
          handleActivityUpdate(data.data || data);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    // Attempt to subscribe to activity updates for this match
    // Only if we're connected
    if (connected) {
      try {
        console.log('Attempting to subscribe to activity feed for match:', matchId);
        
        // Try multiple subscription message formats to accommodate different server implementations
        const subscriptionMessages = [
          { type: 'subscribe', channel: 'activity', matchId },
          { action: 'subscribe', channel: 'activity', matchId },
          { event: 'subscribe', topic: 'activity', matchId },
          { subscribe: 'activity', data: { matchId } }
        ];
        
        // Try all formats
        let success = false;
        for (const msg of subscriptionMessages) {
          success = sendMessage(msg);
          if (success) {
            console.log('Successfully sent subscription with format:', msg);
            break;
          }
        }
        
        if (!success) {
          console.warn('Failed to send activity subscription message, will retry');
          // Set up a retry mechanism
          const retryTimeout = setTimeout(() => {
            if (connected) {
              sendMessage({
                type: 'subscribe',
                channel: 'activity',
                matchId: matchId
              });
            }
          }, 2000);
          
          // Clean up retry timeout if component unmounts
          return () => {
            clearTimeout(retryTimeout);
          };
        }
      } catch (err) {
        console.error('Error subscribing to activity feed:', err);
      }
    }
    
    // Add event listener for incoming messages
    socket.addEventListener('message', messageHandler);
    
    // Cleanup function
    return () => {
      // Unsubscribe when component unmounts
      if (connected && socket.readyState === WebSocket.OPEN) {
        try {
          sendMessage({
            type: 'unsubscribe',
            channel: 'activity',
            matchId: matchId
          });
        } catch (err) {
          console.error('Error unsubscribing from activity feed:', err);
        }
      }
      
      // Remove event listener
      socket.removeEventListener('message', messageHandler);
    };
  }, [socket, connected, matchId, queryClient, sendMessage]);

  // Auto scroll to bottom when new activities come in
  useEffect(() => {
    if (feedContainerRef.current) {
      feedContainerRef.current.scrollTop = feedContainerRef.current.scrollHeight;
    }
  }, [activities]);

  const getIconForActivityType = (type: string) => {
    switch (type) {
      case 'open_position':
        return "ri-arrow-up-line";
      case 'close_position':
        return "ri-close-circle-line";
      case 'match_started':
        return "ri-flag-line";
      case 'player_joined':
        return "ri-user-add-line";
      default:
        return "ri-information-line";
    }
  };

  const getColorForActivityType = (type: string) => {
    switch (type) {
      case 'open_position':
        return "bg-profit/20 text-profit";
      case 'close_position':
        return "bg-loss/20 text-loss";
      case 'match_started':
        return "bg-neutral/20 text-neutral";
      case 'player_joined':
        return "bg-accent-secondary/20 text-accent-secondary";
      default:
        return "bg-neutral/20 text-neutral";
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) {
      return 'Just now';
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} minutes ago`;
    } else {
      return `${Math.floor(diff / 3600000)} hours ago`;
    }
  };

  return (
    <Card className="gradient-card rounded-xl p-4 border border-neutral/20">
      <CardContent className="p-0">
        <h3 className="font-medium mb-4">Activity Feed</h3>
        <div ref={feedContainerRef} className="space-y-4 h-96 overflow-y-auto pr-2">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))
          ) : activities?.length ? (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start p-3 bg-bg-primary rounded-lg">
                <div className={`w-8 h-8 rounded-full ${getColorForActivityType(activity.type)} flex items-center justify-center mr-3 flex-shrink-0`}>
                  <i className={getIconForActivityType(activity.type)}></i>
                </div>
                <div>
                  <p className="font-medium">
                    {activity.isCurrentUser ? 'You' : activity.user} {activity.type.replace('_', ' ')}
                  </p>
                  <p className="text-sm text-text-secondary">{activity.details}</p>
                  <p className="text-xs text-text-secondary mt-1">{formatTimestamp(activity.timestamp)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-text-secondary">
              No activity yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

