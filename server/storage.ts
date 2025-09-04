import { type User, type InsertUser, type Product, type InsertProduct, type Chat, type InsertChat, type Escalation, type InsertEscalation, type ChatMessage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  
  // Chat operations
  createChat(chat: InsertChat): Promise<Chat>;
  getChat(id: string): Promise<Chat | undefined>;
  getChatsByUser(userId: string): Promise<Chat[]>;
  updateChat(id: string, updates: Partial<Chat>): Promise<Chat>;
  
  // Escalation operations
  createEscalation(escalation: InsertEscalation): Promise<Escalation>;
  getEscalations(): Promise<Escalation[]>;
  getEscalation(id: string): Promise<Escalation | undefined>;
  updateEscalation(id: string, updates: Partial<Escalation>): Promise<Escalation>;
  
  // Metrics
  getChatMetrics(): Promise<{
    totalChats: number;
    totalEscalations: number;
    avgConfidence: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;
  private chats: Map<string, Chat>;
  private escalations: Map<string, Escalation>;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.chats = new Map();
    this.escalations = new Map();
    
    // Seed demo data
    this.seedData();
  }

  private async seedData() {
    // Create demo users
    const demoCustomer: User = {
      id: randomUUID(),
      email: "customer@demo.com",
      password: "password",
      role: "customer",
      createdAt: new Date(),
    };
    
    const demoAdmin: User = {
      id: randomUUID(),
      email: "admin@demo.com",
      password: "password",
      role: "admin",
      createdAt: new Date(),
    };
    
    this.users.set(demoCustomer.id, demoCustomer);
    this.users.set(demoAdmin.id, demoAdmin);

    // Create demo products
    const products: Product[] = [
      {
        id: randomUUID(),
        name: "Premium Wireless Headphones",
        description: "Active noise cancellation, 30hr battery",
        price: 199.99,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "Electronics"
      },
      {
        id: randomUUID(),
        name: "Ultra-thin Laptop",
        description: "Intel i7, 16GB RAM, 512GB SSD",
        price: 1299.99,
        imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "Computers"
      },
      {
        id: randomUUID(),
        name: "Smart Fitness Watch",
        description: "Heart rate monitor, GPS, waterproof",
        price: 299.99,
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "Wearables"
      },
      {
        id: randomUUID(),
        name: "Professional Camera",
        description: "24MP, 4K video, weather sealed",
        price: 899.99,
        imageUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "Photography"
      },
      {
        id: randomUUID(),
        name: "Gaming Mouse Pro",
        description: "RGB lighting, 12000 DPI, wireless",
        price: 89.99,
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "Gaming"
      },
      {
        id: randomUUID(),
        name: "Flagship Smartphone",
        description: "128GB, Triple camera, 5G ready",
        price: 799.99,
        imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "Mobile"
      }
    ];

    products.forEach(product => {
      this.products.set(product.id, product);
    });

    // Create sample escalations
    const sampleEscalation: Escalation = {
      id: randomUUID(),
      chatId: randomUUID(),
      userId: demoCustomer.id,
      userEmail: demoCustomer.email,
      lastMessage: "I need to speak with a human agent about my refund",
      confidence: 0.45,
      status: "pending",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    };
    
    this.escalations.set(sampleEscalation.id, sampleEscalation);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      role: insertUser.role || 'customer',
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createChat(insertChat: InsertChat): Promise<Chat> {
    const id = randomUUID();
    const chat: Chat = {
      ...insertChat,
      isEscalated: insertChat.isEscalated ?? false,
      escalatedAt: insertChat.escalatedAt ?? null,
      avgConfidence: insertChat.avgConfidence ?? null,
      id,
      createdAt: new Date()
    };
    this.chats.set(id, chat);
    return chat;
  }

  async getChat(id: string): Promise<Chat | undefined> {
    return this.chats.get(id);
  }

  async getChatsByUser(userId: string): Promise<Chat[]> {
    return Array.from(this.chats.values()).filter(chat => chat.userId === userId);
  }

  async updateChat(id: string, updates: Partial<Chat>): Promise<Chat> {
    const chat = this.chats.get(id);
    if (!chat) throw new Error("Chat not found");
    
    const updatedChat = { ...chat, ...updates };
    this.chats.set(id, updatedChat);
    return updatedChat;
  }

  async createEscalation(insertEscalation: InsertEscalation): Promise<Escalation> {
    const id = randomUUID();
    const escalation: Escalation = {
      ...insertEscalation,
      status: insertEscalation.status ?? 'pending',
      id,
      createdAt: new Date()
    };
    this.escalations.set(id, escalation);
    return escalation;
  }

  async getEscalations(): Promise<Escalation[]> {
    return Array.from(this.escalations.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getEscalation(id: string): Promise<Escalation | undefined> {
    return this.escalations.get(id);
  }

  async updateEscalation(id: string, updates: Partial<Escalation>): Promise<Escalation> {
    const escalation = this.escalations.get(id);
    if (!escalation) throw new Error("Escalation not found");
    
    const updatedEscalation = { ...escalation, ...updates };
    this.escalations.set(id, updatedEscalation);
    return updatedEscalation;
  }

  async getChatMetrics(): Promise<{ totalChats: number; totalEscalations: number; avgConfidence: number; }> {
    const totalChats = this.chats.size;
    const totalEscalations = this.escalations.size;
    
    const chatsWithConfidence = Array.from(this.chats.values()).filter(chat => chat.avgConfidence !== null);
    const avgConfidence = chatsWithConfidence.length > 0 
      ? chatsWithConfidence.reduce((sum, chat) => sum + (chat.avgConfidence || 0), 0) / chatsWithConfidence.length
      : 0;

    return {
      totalChats,
      totalEscalations,
      avgConfidence: Math.round(avgConfidence * 100) / 100
    };
  }
}

export const storage = new MemStorage();
