import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertChatSchema, insertEscalationSchema, ChatMessage } from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const chatMessageSchema = z.object({
  message: z.string().min(1),
  chatId: z.string().optional(),
});

const escalationSchema = z.object({
  chatId: z.string(),
  lastMessage: z.string(),
  confidence: z.number(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          role: user.role 
        } 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      res.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          role: user.role 
        } 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Chat routes
  app.post("/api/chat/message", async (req, res) => {
    try {
      const { message, chatId } = chatMessageSchema.parse(req.body);
      const userId = req.headers['user-id'] as string;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Get or create chat
      let chat;
      if (chatId) {
        chat = await storage.getChat(chatId);
        if (!chat) {
          return res.status(404).json({ message: "Chat not found" });
        }
      } else {
        chat = await storage.createChat({
          userId,
          messages: [],
          isEscalated: false,
          avgConfidence: null,
        });
      }

      // Add user message
      const messages = [...(chat.messages as ChatMessage[])];
      messages.push({
        type: 'user',
        content: message,
        timestamp: new Date().toISOString()
      });

      // Generate GPT response
      const gptResponse = await generateGPTResponse(message, userId);
      messages.push({
        type: 'bot',
        content: gptResponse.content,
        confidence: gptResponse.confidence,
        timestamp: new Date().toISOString()
      });

      // Update average confidence
      const confidenceValues = messages.filter(m => m.confidence !== undefined).map(m => m.confidence!);
      const avgConfidence = confidenceValues.length > 0 
        ? confidenceValues.reduce((sum, conf) => sum + conf, 0) / confidenceValues.length 
        : null;

      const updatedChat = await storage.updateChat(chat.id, {
        messages,
        avgConfidence
      });

      res.json({
        chatId: updatedChat.id,
        message: gptResponse.content,
        confidence: gptResponse.confidence,
      });
    } catch (error) {
      console.error("Chat message error:", error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  app.get("/api/chat/:chatId", async (req, res) => {
    try {
      const { chatId } = req.params;
      const chat = await storage.getChat(chatId);
      
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      res.json(chat);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat" });
    }
  });

  // Escalation routes
  app.post("/api/escalations", async (req, res) => {
    try {
      const { chatId, lastMessage, confidence } = escalationSchema.parse(req.body);
      const userId = req.headers['user-id'] as string;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update chat as escalated
      await storage.updateChat(chatId, {
        isEscalated: true,
        escalatedAt: new Date()
      });

      const escalation = await storage.createEscalation({
        chatId,
        userId,
        userEmail: user.email,
        lastMessage,
        confidence,
        status: "pending"
      });

      res.json(escalation);
    } catch (error) {
      console.error("Escalation error:", error);
      res.status(500).json({ message: "Failed to create escalation" });
    }
  });

  app.get("/api/escalations", async (req, res) => {
    try {
      const escalations = await storage.getEscalations();
      res.json(escalations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch escalations" });
    }
  });

  app.get("/api/escalations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const escalation = await storage.getEscalation(id);
      
      if (!escalation) {
        return res.status(404).json({ message: "Escalation not found" });
      }

      const chat = await storage.getChat(escalation.chatId);
      res.json({ ...escalation, chat });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch escalation" });
    }
  });

  // Metrics route
  app.get("/api/metrics", async (req, res) => {
    try {
      const metrics = await storage.getChatMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Mock tool functions
function getOrderStatus(userId: string, orderId?: string): { status: string; eta: string; orderId: string } {
  const orderData: Record<string, any> = {
    '12345': { status: 'In Transit', eta: '2-3 business days' },
    '12346': { status: 'Delivered', eta: 'Completed' },
    '12347': { status: 'Processing', eta: '1-2 business days' }
  };
  
  const defaultOrderId = '12345';
  const orderInfo = orderData[orderId || defaultOrderId] || { status: 'Not Found', eta: 'N/A' };
  
  return { ...orderInfo, orderId: orderId || defaultOrderId };
}

function getRefundStatus(userId: string, orderId?: string): { status: string; orderId: string } {
  const refundData: Record<string, any> = {
    '12345': { status: 'Processing' },
    '12346': { status: 'Completed' },
    '12347': { status: 'Pending' }
  };
  
  const defaultOrderId = '12345';
  const refundInfo = refundData[orderId || defaultOrderId] || { status: 'Not Found' };
  
  return { ...refundInfo, orderId: orderId || defaultOrderId };
}

// GPT response generation using GitHub Models API
async function generateGPTResponse(message: string, userId: string): Promise<{ content: string; confidence: number }> {
  try {
    // Check for tool function calls
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('order') && lowerMessage.includes('status') || lowerMessage.includes('track') || lowerMessage.includes('where is my order')) {
      const orderInfo = getOrderStatus(userId);
      return {
        content: `I found your order #${orderInfo.orderId}. Status: ${orderInfo.status}. Expected delivery: ${orderInfo.eta}.`,
        confidence: 0.85
      };
    }
    
    if (lowerMessage.includes('refund')) {
      const refundInfo = getRefundStatus(userId);
      return {
        content: `Your refund for order #${refundInfo.orderId} is currently ${refundInfo.status}.`,
        confidence: 0.72
      };
    }

    // FAQ responses
    if (lowerMessage.includes('return policy')) {
      return {
        content: 'Our return policy allows returns within 30 days of purchase. Items must be in original condition with tags attached. Free return shipping is provided for defective items.',
        confidence: 0.92
      };
    }

    if (lowerMessage.includes('delivery address') || lowerMessage.includes('change address')) {
      return {
        content: 'You can change your delivery address before your order ships. Please contact us with your order number and new address details.',
        confidence: 0.88
      };
    }

    // Use GitHub Models API for general queries
    const apiKey = process.env.GITHUB_TOKEN || process.env.GITHUB_API_KEY || "";
    
    if (!apiKey) {
      console.warn("No GitHub API key found, using fallback response");
      return {
        content: "I understand your question. Unfortunately, I'm having trouble accessing my knowledge base right now. Would you like me to escalate this to a human agent?",
        confidence: 0.3
      };
    }

    const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are a helpful customer support AI for an e-commerce platform. Provide concise, helpful responses. If you're not confident about order-specific information, suggest the user contact a human agent."
          },
          {
            role: "user",
            content: message
          }
        ],
        model: "gpt-4o",
        temperature: 0.7,
        max_tokens: 150
      })
    });

    if (!response.ok) {
      throw new Error(`GitHub Models API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";
    
    // Calculate confidence based on response characteristics
    let confidence = 0.75;
    if (content.toLowerCase().includes("sorry") || content.toLowerCase().includes("don't know")) {
      confidence = 0.4;
    } else if (content.toLowerCase().includes("contact") || content.toLowerCase().includes("agent")) {
      confidence = 0.5;
    }

    return { content, confidence };
    
  } catch (error) {
    console.error("GPT API error:", error);
    return {
      content: "I'm experiencing some technical difficulties. Would you like me to escalate this to a human agent?",
      confidence: 0.25
    };
  }
}
