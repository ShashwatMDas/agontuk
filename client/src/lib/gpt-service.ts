import { ChatMessage } from "@shared/schema";

export interface ChatResponse {
  chatId: string;
  message: string;
  confidence: number;
}

class GPTService {
  async sendMessage(
    message: string,
    userId: string,
    chatId?: string
  ): Promise<ChatResponse> {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/chat/message`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": userId,
        },
        body: JSON.stringify({ message, chatId }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to send message");
    }

    return response.json();
  }

  async escalateChat(
    chatId: string,
    lastMessage: string,
    confidence: number,
    userId: string
  ): Promise<void> {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/escalations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": userId,
        },
        body: JSON.stringify({ chatId, lastMessage, confidence }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to escalate chat");
    }
  }

  async getChat(chatId: string): Promise<{ messages: ChatMessage[] }> {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/chat/${chatId}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch chat");
    }

    return response.json();
  }
}

export const gptService = new GPTService();
