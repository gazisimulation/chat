import { WebSocketServer } from "ws";
import { storage } from "./storage";

interface WebSocketMessage {
  type: string;
  senderId: string;
  receiverId: string;
  data: any;
}

// Define WebSocket readyState constants
const WS_OPEN = 1;

// Map to store active connections by userId
const connections = new Map<string, any>();

export function setupWebSocket(wss: WebSocketServer) {
  wss.on("connection", (ws: any) => {
    let userId: string | null = null;

    ws.on("message", async (messageBuffer: Buffer) => {
      try {
        const messageStr = messageBuffer.toString();
        const parsed: WebSocketMessage = JSON.parse(messageStr);
        
        // Handle authentication
        if (parsed.type === "auth") {
          userId = parsed.data.userId;
          if (userId) {
            connections.set(userId, ws);
            console.log(`WebSocket: User ${userId} connected`);
          }
          return;
        }
        
        // Handle messages
        if (parsed.type === "message" && userId) {
          // Store message in database
          const newMessage = await storage.createMessage({
            senderId: parsed.senderId,
            receiverId: parsed.receiverId,
            encryptedContent: parsed.data.content,
          });
          
          // Forward message to receiver if online
          const receiverWs = connections.get(parsed.receiverId);
          if (receiverWs && receiverWs.readyState === WS_OPEN) {
            receiverWs.send(JSON.stringify({
              type: "message",
              data: newMessage,
            }));
          }
        }
        
        // Handle seen status
        if (parsed.type === "seen" && userId) {
          const messageId = parsed.data.messageId;
          await storage.markMessageAsSeen(messageId);
          
          // Notify sender that message was seen
          const senderWs = connections.get(parsed.data.senderId);
          if (senderWs && senderWs.readyState === WS_OPEN) {
            senderWs.send(JSON.stringify({
              type: "seen",
              data: { messageId },
            }));
          }
        }
        
        // Handle message deletion
        if (parsed.type === "delete" && userId) {
          const messageId = parsed.data.messageId;
          await storage.deleteMessage(messageId);
          
          // Notify other party about deletion
          const otherPartyId = parsed.senderId === userId ? parsed.receiverId : parsed.senderId;
          const otherPartyWs = connections.get(otherPartyId);
          
          if (otherPartyWs && otherPartyWs.readyState === WS_OPEN) {
            otherPartyWs.send(JSON.stringify({
              type: "delete",
              data: { messageId },
            }));
          }
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      if (userId) {
        console.log(`WebSocket: User ${userId} disconnected`);
        connections.delete(userId);
      }
    });
  });
}
