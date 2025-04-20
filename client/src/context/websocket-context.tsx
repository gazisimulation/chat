import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { Message } from "@shared/schema";

type WebSocketContextType = {
  isConnected: boolean;
  sendMessage: (message: {
    type: string;
    senderId: string;
    receiverId: string;
    data: any;
  }) => void;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Only attempt connection if user is logged in
    if (!user) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/api/ws`;
    
    console.log(`Connecting to WebSocket at ${wsUrl}`);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    // Connection opened
    ws.addEventListener("open", () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      
      // Send auth message
      if (user) {
        ws.send(JSON.stringify({
          type: "auth",
          senderId: user.userId,
          receiverId: "",
          data: {
            userId: user.userId
          }
        }));
      }
    });

    // Listen for messages
    ws.addEventListener("message", (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("WebSocket message received:", message);
        
        // Handle different message types
        if (message.type === "message") {
          // Add message to cache and invalidate queries
          const newMessage = message.data as Message;
          
          // Only process messages that have content
          if (newMessage && newMessage.encryptedContent && newMessage.encryptedContent.trim() !== '') {
            console.log("Valid WebSocket message received:", newMessage.id);
            
            // Invalidate messages query for this contact
            queryClient.invalidateQueries({ 
              queryKey: ["/api/messages", newMessage.senderId] 
            });
            
            // Also invalidate for the receiver contact ID
            queryClient.invalidateQueries({ 
              queryKey: ["/api/messages", newMessage.receiverId] 
            });
            
            // Play notification sound
            const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'+'N'+'v'.repeat(20));
            audio.volume = 0.2;
            audio.play().catch(e => console.error("Error playing notification sound", e));
          } else {
            console.warn("Received empty or invalid message via WebSocket");
          }
        } else if (message.type === "seen") {
          // Update message seen status
          const { messageId } = message.data;
          // Invalidate all messages queries
          queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
        } else if (message.type === "delete") {
          // Remove message from cache
          const { messageId } = message.data;
          // Invalidate all messages queries
          queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
        }
      } catch (error) {
        console.error("Error parsing WebSocket message", error);
      }
    });

    // Connection closed
    ws.addEventListener("close", () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    });

    // Connection error
    ws.addEventListener("error", (error) => {
      console.error("WebSocket error", error);
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user]);

  // Send message via WebSocket
  const sendMessage = (message: {
    type: string;
    senderId: string;
    receiverId: string;
    data: any;
  }) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error("WebSocket not connected");
    }
  };

  return (
    <WebSocketContext.Provider value={{ isConnected, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}