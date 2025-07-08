import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { getWebSocketClient, WebSocketClient } from '@/lib/websocket';

// Types
type WebSocketContextType = {
  socket: WebSocket | null;
  connected: boolean;
  sendMessage: (data: any) => boolean;
};

// Create context
const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

// Provider component
export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [client] = useState<WebSocketClient>(() => getWebSocketClient());
  const [connected, setConnected] = useState(false);

  // Attach listeners once
  useEffect(() => {
    const handleOpen = () => {
      console.log('WebSocket connected');
      setConnected(true);
    };

    const handleClose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    };

    const handleError = (error: Event) => {
      console.error('WebSocket error:', error);
    };

    client.addEventListener('open', handleOpen);
    client.addEventListener('close', handleClose);
    client.addEventListener('error', handleError);
    
    // Expose WebSocket client to window for global access and diagnostics
    // This helps ensure notifications work properly
    (window as any).__webSocketClient = client;

    return () => {
      client.removeEventListener('open', handleOpen);
      client.removeEventListener('close', handleClose);
      client.removeEventListener('error', handleError);
    };
  }, [client]);

  const sendMessage = useCallback(
    (data: any) => {
      if (!client || !connected) return false;
      try {
        return client.send(data);
      } catch (error) {
        console.error('Error sending message:', error);
        return false;
      }
    },
    [client, connected]
  );

  const value = {
    socket: client.socket || null,
    connected,
    sendMessage,
  };

  return (
  <WebSocketContext.Provider value={value}>
    {children}
  </WebSocketContext.Provider>
);

};

// Hook to use WebSocket context
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

