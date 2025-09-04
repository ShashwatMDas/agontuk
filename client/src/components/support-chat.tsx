import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X } from "lucide-react";
import { useCurrentUser } from "./auth-guard";
import { gptService } from "@/lib/gpt-service";
import { ChatMessage } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface SupportChatProps {
  isOpen: boolean;
  onToggle: () => void;
}

const FAQ_CATEGORIES = {
  orders: [
    "Where is my order?",
    "How can I track my package?",
    "Can I change my delivery address?"
  ],
  payments: [
    "What is your return policy?",
    "How do I request a refund?",
    "When will I receive my refund?"
  ]
};

export function SupportChat({ isOpen, onToggle }: SupportChatProps) {
  const user = useCurrentUser();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      type: 'bot',
      content: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFAQCategory, setCurrentFAQCategory] = useState<'orders' | 'payments'>('orders');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user || isLoading) return;

    const userMessage: ChatMessage = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await gptService.sendMessage(messageToSend, user.id, currentChatId || undefined);
      
      setCurrentChatId(response.chatId);
      
      const botMessage: ChatMessage = {
        type: 'bot',
        content: response.message,
        confidence: response.confidence,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFAQClick = (question: string) => {
    setInputMessage(question);
    handleSendMessage();
  };

  const handleEscalateToHuman = async () => {
    if (!currentChatId || !user) return;

    try {
      const lastBotMessage = messages.filter(m => m.type === 'bot').pop();
      const lastUserMessage = messages.filter(m => m.type === 'user').pop();
      
      await gptService.escalateChat(
        currentChatId,
        lastUserMessage?.content || "Chat escalated by user",
        lastBotMessage?.confidence || 0.5,
        user.id
      );

      const escalationMessage: ChatMessage = {
        type: 'bot',
        content: "🚨 Your conversation has been escalated to a human agent. An agent will be with you shortly.",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, escalationMessage]);

      toast({
        title: "Escalated to human agent",
        description: "Your conversation has been escalated. An agent will assist you soon."
      });
    } catch (error) {
      toast({
        title: "Escalation failed",
        description: "Failed to escalate to human agent. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!isOpen) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-[480px] h-[700px] flex flex-col shadow-xl z-50 md:w-[480px] sm:w-full sm:h-full sm:bottom-0 sm:right-0 sm:left-0 sm:rounded-none">
      <CardHeader className="bg-primary text-primary-foreground p-4 flex flex-row items-center justify-between space-y-0">
        <h3 className="font-semibold" data-testid="text-chat-title">Customer Support</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="text-primary-foreground hover:text-primary-foreground/80 h-auto p-1"
          data-testid="button-close-chat"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>

      <div className="p-4 border-b border-border">
        <h4 className="font-medium text-foreground mb-3" data-testid="text-quick-help">Quick Help</h4>
        
        <div className="flex space-x-2 mb-3">
          <Button
            variant={currentFAQCategory === 'orders' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setCurrentFAQCategory('orders')}
            data-testid="button-faq-orders"
          >
            Orders
          </Button>
          <Button
            variant={currentFAQCategory === 'payments' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setCurrentFAQCategory('payments')}
            data-testid="button-faq-payments"
          >
            Payments & Refunds
          </Button>
        </div>
        
        <div className="space-y-2">
          {FAQ_CATEGORIES[currentFAQCategory].map((question, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="w-full text-left justify-start text-xs h-auto p-2"
              onClick={() => handleFAQClick(question)}
              data-testid={`button-faq-${currentFAQCategory}-${index}`}
            >
              {question}
            </Button>
          ))}
        </div>
      </div>

      <CardContent className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: '420px' }}>
        <div className="space-y-3">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg max-w-xs ${
                message.type === 'user' 
                  ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground' 
                  : 'bg-muted text-foreground border border-border'
              }`}>
                <p className="text-sm" data-testid={`text-message-${message.type}-${index}`}>
                  {message.content}
                </p>
                {message.type === 'bot' && message.confidence !== undefined && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground" data-testid={`text-confidence-${index}`}>
                      Confidence: {message.confidence.toFixed(2)}
                    </p>
                    {message.confidence < 0.6 && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="text-xs h-6 px-2"
                        onClick={handleEscalateToHuman}
                        data-testid={`button-escalate-${index}`}
                      >
                        Chat with Human Agent
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground p-3 rounded-lg max-w-xs border border-border">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm" data-testid="text-typing-indicator">AI is typing...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="p-4 border-t border-border">
        <div className="flex flex-col space-y-2">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isLoading}
              data-testid="input-chat-message"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || !inputMessage.trim()}
              data-testid="button-send-message"
            >
              Send
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-sm"
            onClick={handleEscalateToHuman}
            data-testid="button-escalate-cta"
          >
            Need Human Help? Escalate to Agent
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function SupportToggle({ onClick }: { onClick: () => void }) {
  return (
    <Button
      className="fixed bottom-4 left-4 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-primary/90 hover:scale-105 transition-transform shadow-lg"
      onClick={onClick}
      data-testid="button-support-toggle"
    >
      <MessageCircle className="w-6 h-6" />
    </Button>
  );
}
