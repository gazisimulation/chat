import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertContactSchema, insertMessageSchema } from "@shared/schema";
import { WebSocketServer, WebSocket } from "ws";
import { setupWebSocket } from "./utils";

// Import connection mapping from utils
import { connections } from "./utils";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Setup WebSocket server on a different path to avoid conflict with Vite
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/api/ws'
  });
  setupWebSocket(wss);

  // API Routes
  // Contacts API
  app.get("/api/contacts", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const userId = req.user!.userId;
    const contacts = await storage.getContacts(userId);
    
    res.json(contacts);
  });

  app.post("/api/contacts", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const userId = req.user!.userId;
    
    // Validate the contactId from the request
    if (!req.body.contactId || typeof req.body.contactId !== 'string') {
      return res.status(400).json({ message: "Invalid contact ID format" });
    }
    
    const contactId = req.body.contactId;
    
    // Check if the contact ID exists
    const contactUser = await storage.getUserByUserId(contactId);
    if (!contactUser) {
      return res.status(404).json({ message: "User with that ID not found" });
    }
    
    // Check if already a contact
    const existingContacts = await storage.getContacts(userId);
    const alreadyContact = existingContacts.some(c => c.contactId === contactId);
    
    if (alreadyContact) {
      return res.status(400).json({ message: "Already in contacts" });
    }
    
    const contact = await storage.addContact({
      userId,
      contactId
    });
    
    res.status(201).json(contact);
  });

  app.delete("/api/contacts/:contactId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const userId = req.user!.userId;
    const { contactId } = req.params;
    
    const deleted = await storage.deleteContact(userId, contactId);
    
    if (!deleted) {
      return res.status(404).json({ message: "Contact not found" });
    }
    
    res.status(200).json({ message: "Contact deleted" });
  });

  // Messages API
  app.get("/api/messages/:contactId?", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const userId = req.user!.userId;
    const contactId = req.params.contactId;
    
    // If no contactId is provided, return an empty array
    if (!contactId) {
      return res.json([]);
    }
    
    let messages = await storage.getMessages(userId, contactId);
    
    // Filter out messages with empty content
    messages = messages.filter(message => 
      message.encryptedContent && message.encryptedContent.trim() !== ''
    );
    
    // Mark received messages as seen
    for (const message of messages) {
      if (message.receiverId === userId && !message.seen) {
        await storage.markMessageAsSeen(message.id);
        
        // Notify sender through WebSocket that message was seen
        const senderWs = connections.get(message.senderId);
        if (senderWs && senderWs.readyState === WebSocket.OPEN) {
          senderWs.send(JSON.stringify({
            type: "seen",
            data: { messageId: message.id }
          }));
        }
      }
    }
    
    res.json(messages);
  });

  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const result = insertMessageSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ message: "Invalid message data" });
    }
    
    // Check for empty content
    if (!req.body.encryptedContent || req.body.encryptedContent.trim() === '') {
      return res.status(400).json({ message: "Message content cannot be empty" });
    }
    
    const message = await storage.createMessage(req.body);
    
    // Send real-time message via WebSocket if receiver is online
    const receiverWs = connections.get(req.body.receiverId);
    if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
      console.log(`Sending real-time message to ${req.body.receiverId}`);
      receiverWs.send(JSON.stringify({
        type: "message",
        data: message
      }));
    } else {
      console.log(`Receiver ${req.body.receiverId} is not online, message saved to database`);
    }
    
    res.status(201).json(message);
  });

  app.delete("/api/messages/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid message ID" });
    }
    
    const deleted = await storage.deleteMessage(id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    res.status(200).json({ message: "Message deleted" });
  });

  app.delete("/api/messages/:senderId/:receiverId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const userId = req.user!.userId;
    const { senderId, receiverId } = req.params;
    
    // Ensure the user is either the sender or receiver
    if (userId !== senderId && userId !== receiverId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    const deleted = await storage.deleteAllMessages(senderId, receiverId);
    
    res.status(200).json({ message: "All messages deleted" });
  });

  return httpServer;
}
