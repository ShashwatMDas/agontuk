import { type User, type InsertUser, type Product, type InsertProduct, type Chat, type InsertChat, type Escalation, type InsertEscalation, type ChatMessage } from "@shared/schema";
import { createClient } from '@supabase/supabase-js';
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

export class SupabaseStorage implements IStorage {
  private supabase;

  private isInitialized = false;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_ANON_KEY!;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Anon Key are required');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  private async ensureInitialized() {
    if (!this.isInitialized) {
      await this.seedDemoData();
      this.isInitialized = true;
    }
  }

  private async seedDemoData() {
    try {
      console.log('🌱 Seeding demo data...');
      
      // Check if demo users exist
      const { data: existingUsers, error: userCheckError } = await this.supabase
        .from('users')
        .select('email')
        .in('email', ['customer@demo.com', 'admin@demo.com']);
      
      if (userCheckError) {
        console.error('❌ Error checking existing users:', userCheckError);
        return;
      }
      
      if (!existingUsers || existingUsers.length === 0) {
        console.log('👤 Creating demo users...');
        const { error: userInsertError } = await this.supabase.from('users').insert([
          {
            email: 'customer@demo.com',
            password: 'password',
            role: 'customer'
          },
          {
            email: 'admin@demo.com', 
            password: 'password',
            role: 'admin'
          }
        ]);
        
        if (userInsertError) {
          console.error('❌ Error creating demo users:', userInsertError);
        } else {
          console.log('✅ Demo users created successfully');
        }
      } else {
        console.log('✅ Demo users already exist');
      }

      
      // Check if demo products exist
      const { data: existingProducts, error: productCheckError } = await this.supabase
        .from('products')
        .select('id')
        .limit(1);
      
      if (productCheckError) {
        console.error('❌ Error checking existing products:', productCheckError);
        return;
      }
      
      if (!existingProducts || existingProducts.length === 0) {
        console.log('🛍️ Creating demo products...');
        const { error: productInsertError } = await this.supabase.from('products').insert([
          {
            name: 'Premium Wireless Headphones',
            description: 'Active noise cancellation, 30hr battery',
            price: 199.99,
            image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
            category: 'Electronics'
          },
          {
            name: 'Ultra-thin Laptop',
            description: 'Intel i7, 16GB RAM, 512GB SSD',
            price: 1299.99,
            image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
            category: 'Computers'
          },
          {
            name: 'Smart Fitness Watch',
            description: 'Heart rate monitor, GPS, waterproof',
            price: 299.99,
            image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
            category: 'Wearables'
          },
          {
            name: 'Professional Camera',
            description: '24MP, 4K video, weather sealed',
            price: 899.99,
            image_url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
            category: 'Photography'
          },
          {
            name: 'Gaming Mouse Pro',
            description: 'RGB lighting, 12000 DPI, wireless',
            price: 89.99,
            image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
            category: 'Gaming'
          },
          {
            name: 'Flagship Smartphone',
            description: '128GB, Triple camera, 5G ready',
            price: 799.99,
            image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
            category: 'Mobile'
          }
        ]);
        
        if (productInsertError) {
          console.error('❌ Error creating demo products:', productInsertError);
        } else {
          console.log('✅ Demo products created successfully');
        }
      } else {
        console.log('✅ Demo products already exist');
      }
      
    } catch (error) {
      console.error('❌ Error in seedDemoData:', error);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    await this.ensureInitialized();
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return undefined;
    return this.mapUserFromDB(data);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    await this.ensureInitialized();
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) return undefined;
    return this.mapUserFromDB(data);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert({
        email: insertUser.email,
        password: insertUser.password,
        role: insertUser.role || 'customer'
      })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return this.mapUserFromDB(data);
  }

  async getProducts(): Promise<Product[]> {
    await this.ensureInitialized();
    const { data, error } = await this.supabase
      .from('products')
      .select('*');
    
    if (error) throw new Error(`Failed to fetch products: ${error.message}`);
    return (data || []).map(this.mapProductFromDB);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return undefined;
    return this.mapProductFromDB(data);
  }

  async createChat(insertChat: InsertChat): Promise<Chat> {
    const { data, error } = await this.supabase
      .from('chats')
      .insert({
        user_id: insertChat.userId,
        messages: insertChat.messages,
        is_escalated: insertChat.isEscalated ?? false,
        escalated_at: insertChat.escalatedAt,
        avg_confidence: insertChat.avgConfidence
      })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create chat: ${error.message}`);
    return this.mapChatFromDB(data);
  }

  async getChat(id: string): Promise<Chat | undefined> {
    const { data, error } = await this.supabase
      .from('chats')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return undefined;
    return this.mapChatFromDB(data);
  }

  async getChatsByUser(userId: string): Promise<Chat[]> {
    const { data, error } = await this.supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw new Error(`Failed to fetch user chats: ${error.message}`);
    return (data || []).map(this.mapChatFromDB);
  }

  async updateChat(id: string, updates: Partial<Chat>): Promise<Chat> {
    const updateData: any = {};
    if (updates.messages !== undefined) updateData.messages = updates.messages;
    if (updates.isEscalated !== undefined) updateData.is_escalated = updates.isEscalated;
    if (updates.escalatedAt !== undefined) updateData.escalated_at = updates.escalatedAt;
    if (updates.avgConfidence !== undefined) updateData.avg_confidence = updates.avgConfidence;
    
    const { data, error } = await this.supabase
      .from('chats')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update chat: ${error.message}`);
    return this.mapChatFromDB(data);
  }

  async createEscalation(insertEscalation: InsertEscalation): Promise<Escalation> {
    const { data, error } = await this.supabase
      .from('escalations')
      .insert({
        chat_id: insertEscalation.chatId,
        user_id: insertEscalation.userId,
        user_email: insertEscalation.userEmail,
        last_message: insertEscalation.lastMessage,
        confidence: insertEscalation.confidence,
        status: insertEscalation.status || 'pending'
      })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create escalation: ${error.message}`);
    return this.mapEscalationFromDB(data);
  }

  async getEscalations(): Promise<Escalation[]> {
    const { data, error } = await this.supabase
      .from('escalations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to fetch escalations: ${error.message}`);
    return (data || []).map(this.mapEscalationFromDB);
  }

  async getEscalation(id: string): Promise<Escalation | undefined> {
    const { data, error } = await this.supabase
      .from('escalations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return undefined;
    return this.mapEscalationFromDB(data);
  }

  async updateEscalation(id: string, updates: Partial<Escalation>): Promise<Escalation> {
    const updateData: any = {};
    if (updates.status !== undefined) updateData.status = updates.status;
    
    const { data, error } = await this.supabase
      .from('escalations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update escalation: ${error.message}`);
    return this.mapEscalationFromDB(data);
  }

  async getChatMetrics(): Promise<{ totalChats: number; totalEscalations: number; avgConfidence: number; }> {
    const [chatsResult, escalationsResult, avgConfidenceResult] = await Promise.all([
      this.supabase.from('chats').select('id', { count: 'exact' }),
      this.supabase.from('escalations').select('id', { count: 'exact' }),
      this.supabase.from('chats').select('avg_confidence').not('avg_confidence', 'is', null)
    ]);
    
    const totalChats = chatsResult.count || 0;
    const totalEscalations = escalationsResult.count || 0;
    
    let avgConfidence = 0;
    if (avgConfidenceResult.data && avgConfidenceResult.data.length > 0) {
      const confidenceSum = avgConfidenceResult.data
        .map((chat: any) => chat.avg_confidence || 0)
        .reduce((sum: number, conf: number) => sum + conf, 0);
      avgConfidence = confidenceSum / avgConfidenceResult.data.length;
    }
    
    return {
      totalChats,
      totalEscalations,
      avgConfidence: Math.round(avgConfidence * 100) / 100
    };
  }

  // Mapping functions to convert between database and application formats
  private mapUserFromDB(dbUser: any): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      password: dbUser.password,
      role: dbUser.role,
      createdAt: dbUser.created_at ? new Date(dbUser.created_at) : null
    };
  }

  private mapProductFromDB(dbProduct: any): Product {
    return {
      id: dbProduct.id,
      name: dbProduct.name,
      description: dbProduct.description,
      price: dbProduct.price,
      imageUrl: dbProduct.image_url,
      category: dbProduct.category
    };
  }

  private mapChatFromDB(dbChat: any): Chat {
    return {
      id: dbChat.id,
      userId: dbChat.user_id,
      messages: dbChat.messages,
      isEscalated: dbChat.is_escalated,
      escalatedAt: dbChat.escalated_at ? new Date(dbChat.escalated_at) : null,
      avgConfidence: dbChat.avg_confidence,
      createdAt: dbChat.created_at ? new Date(dbChat.created_at) : null
    };
  }

  private mapEscalationFromDB(dbEscalation: any): Escalation {
    return {
      id: dbEscalation.id,
      chatId: dbEscalation.chat_id,
      userId: dbEscalation.user_id,
      userEmail: dbEscalation.user_email,
      lastMessage: dbEscalation.last_message,
      confidence: dbEscalation.confidence,
      status: dbEscalation.status,
      createdAt: dbEscalation.created_at ? new Date(dbEscalation.created_at) : null
    };
  }
}

export const storage = new SupabaseStorage();
