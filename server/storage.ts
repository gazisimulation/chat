import { 
  users, type User, type InsertUser, 
  contacts, type Contact, type InsertContact,
  messages, type Message, type InsertMessage
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByUserId(userId: string): Promise<User | undefined>;
  createUser(user: InsertUser & { userId: string }): Promise<User>;
  deleteUser(userId: string): Promise<boolean>;
  
  // Contact methods
  getContacts(userId: string): Promise<Contact[]>;
  addContact(contact: InsertContact): Promise<Contact>;
  deleteContact(userId: string, contactId: string): Promise<boolean>;
  
  // Message methods
  getMessages(userId: string, contactId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsSeen(id: number): Promise<boolean>;
  deleteMessage(id: number): Promise<boolean>;
  deleteAllMessages(userId: string, contactId: string): Promise<boolean>;
  
  // Session store
  sessionStore: any; // Using any type to avoid type errors with the MemoryStore
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contacts: Map<number, Contact>;
  private messages: Map<number, Message>;
  sessionStore: any; // Using any type to avoid type errors with the MemoryStore
  private userIdCounter: number;
  private contactIdCounter: number;
  private messageIdCounter: number;

  constructor() {
    this.users = new Map();
    this.contacts = new Map();
    this.messages = new Map();
    this.userIdCounter = 1;
    this.contactIdCounter = 1;
    this.messageIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24h
    });
    
    // Run cleanup immediately and then every hour
    this.cleanupEmptyMessages();
    setInterval(() => this.cleanupEmptyMessages(), 3600000); // Every hour
  }
  
  // Clean up empty messages
  private cleanupEmptyMessages() {
    console.log("Cleaning up empty messages...");
    const emptyMessages: number[] = [];
    
    this.messages.forEach((message, id) => {
      if (!message.encryptedContent || message.encryptedContent.trim() === '') {
        emptyMessages.push(id);
      }
    });
    
    if (emptyMessages.length > 0) {
      console.log(`Deleting ${emptyMessages.length} empty messages`);
      emptyMessages.forEach(id => this.messages.delete(id));
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByUserId(userId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.userId === userId
    );
  }

  async createUser(insertUser: InsertUser & { userId: string }): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = {
      ...insertUser,
      id,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async deleteUser(userId: string): Promise<boolean> {
    const user = await this.getUserByUserId(userId);
    if (!user) return false;
    
    // Delete all contacts
    const contacts = await this.getContacts(userId);
    for (const contact of contacts) {
      await this.deleteContact(userId, contact.contactId);
    }
    
    // Delete all messages
    const allMessages = Array.from(this.messages.values());
    const userMessages = allMessages.filter(
      msg => msg.senderId === userId || msg.receiverId === userId
    );
    
    for (const msg of userMessages) {
      this.messages.delete(msg.id);
    }
    
    // Delete user
    this.users.delete(user.id);
    return true;
  }

  // Contact methods
  async getContacts(userId: string): Promise<Contact[]> {
    return Array.from(this.contacts.values()).filter(
      contact => contact.userId === userId
    );
  }

  async addContact(contact: InsertContact): Promise<Contact> {
    const id = this.contactIdCounter++;
    const newContact: Contact = { ...contact, id };
    this.contacts.set(id, newContact);
    return newContact;
  }

  async deleteContact(userId: string, contactId: string): Promise<boolean> {
    const contactsToDelete = Array.from(this.contacts.values()).filter(
      contact => contact.userId === userId && contact.contactId === contactId
    );
    
    if (contactsToDelete.length === 0) return false;
    
    contactsToDelete.forEach(contact => {
      this.contacts.delete(contact.id);
    });
    
    // Also delete all messages between these users
    await this.deleteAllMessages(userId, contactId);
    
    return true;
  }

  // Message methods
  async getMessages(userId: string, contactId: string): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      message => 
        (message.senderId === userId && message.receiverId === contactId) ||
        (message.senderId === contactId && message.receiverId === userId)
    ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const now = new Date();
    const newMessage: Message = {
      ...message,
      id,
      seen: false,
      createdAt: now
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async markMessageAsSeen(id: number): Promise<boolean> {
    const message = this.messages.get(id);
    if (!message) return false;
    
    const updatedMessage: Message = { ...message, seen: true };
    this.messages.set(id, updatedMessage);
    return true;
  }

  async deleteMessage(id: number): Promise<boolean> {
    return this.messages.delete(id);
  }

  async deleteAllMessages(userId: string, contactId: string): Promise<boolean> {
    const messagesToDelete = Array.from(this.messages.values()).filter(
      message => 
        (message.senderId === userId && message.receiverId === contactId) ||
        (message.senderId === contactId && message.receiverId === userId)
    );
    
    for (const message of messagesToDelete) {
      this.messages.delete(message.id);
    }
    
    return true;
  }
}

export const storage = new MemStorage();
