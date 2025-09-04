import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SupportChat, SupportToggle } from "@/components/support-chat";
import { useCurrentUser } from "@/components/auth-guard";
import { authService } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Escalation, ChatMessage } from "@shared/schema";
import { useLocation } from "wouter";

interface EscalationWithChat extends Escalation {
  chat?: { messages: ChatMessage[] };
}

export default function AdminDashboard() {
  const user = useCurrentUser();
  const [, setLocation] = useLocation();
  const [selectedEscalation, setSelectedEscalation] = useState<string | null>(null);
  const [supportChatOpen, setSupportChatOpen] = useState(false);

  const { data: metrics } = useQuery<{ totalChats: number; totalEscalations: number; avgConfidence: number }>({
    queryKey: ['/api/metrics'],
  });

  const { data: escalations = [] } = useQuery<Escalation[]>({
    queryKey: ['/api/escalations'],
  });

  const { data: escalationDetail } = useQuery<EscalationWithChat>({
    queryKey: ['/api/escalations', selectedEscalation],
    enabled: !!selectedEscalation,
  });

  const handleLogout = () => {
    authService.logout();
    setLocation('/login');
  };

  if (!user || user.role !== 'admin') {
    setLocation('/login');
    return null;
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'destructive';
      case 'in_review':
        return 'default';
      case 'resolved':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Navigation */}
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary" data-testid="text-admin-title">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground" data-testid="text-admin-email">
                {user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-admin-logout">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground">Total Chats</h3>
              <p className="text-2xl font-bold text-foreground mt-2" data-testid="text-total-chats">
                {metrics?.totalChats || 0}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground">Escalations</h3>
              <p className="text-2xl font-bold text-foreground mt-2" data-testid="text-total-escalations">
                {metrics?.totalEscalations || 0}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground">Avg Confidence</h3>
              <p className="text-2xl font-bold text-foreground mt-2" data-testid="text-avg-confidence">
                {metrics?.avgConfidence?.toFixed(2) || '0.00'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Escalations List */}
        <Card>
          <CardHeader>
            <CardTitle data-testid="text-escalations-title">Escalated Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {escalations.map((escalation) => (
                <div
                  key={escalation.id}
                  className="p-6 hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSelectedEscalation(escalation.id)}
                  data-testid={`row-escalation-${escalation.id}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-foreground" data-testid={`text-escalation-email-${escalation.id}`}>
                          {escalation.userEmail}
                        </h4>
                        <Badge variant={getStatusBadgeVariant(escalation.status || 'pending')} data-testid={`badge-escalation-status-${escalation.id}`}>
                          {(escalation.status === 'pending' || !escalation.status) ? 'Escalated' : escalation.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2" data-testid={`text-escalation-message-${escalation.id}`}>
                        Last message: "{escalation.lastMessage}"
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid={`text-escalation-details-${escalation.id}`}>
                        Confidence: {escalation.confidence.toFixed(2)} | {formatTimeAgo(escalation.createdAt || new Date())}
                      </p>
                    </div>
                    <Button size="sm" data-testid={`button-view-escalation-${escalation.id}`}>
                      View Chat
                    </Button>
                  </div>
                </div>
              ))}
              
              {escalations.length === 0 && (
                <div className="p-6 text-center text-muted-foreground" data-testid="text-no-escalations">
                  No escalations found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Escalation Detail Modal */}
      <Dialog open={!!selectedEscalation} onOpenChange={() => setSelectedEscalation(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle data-testid="text-escalation-modal-title">Escalated Conversation</DialogTitle>
          </DialogHeader>
          
          {escalationDetail && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium text-foreground" data-testid="text-escalation-customer">
                  Customer: {escalationDetail.userEmail}
                </p>
                <p className="text-xs text-muted-foreground" data-testid="text-escalation-meta">
                  Escalated: {formatTimeAgo(escalationDetail.createdAt || new Date())} | Confidence: {escalationDetail.confidence.toFixed(2)}
                </p>
              </div>
              
              <div className="max-h-96 overflow-y-auto space-y-3">
                {escalationDetail.chat?.messages?.map((message, index) => (
                  <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-lg max-w-xs ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground' 
                        : 'bg-muted text-foreground border border-border'
                    }`}>
                      <p className="text-sm" data-testid={`text-escalation-chat-message-${index}`}>
                        {message.content}
                      </p>
                      {message.type === 'bot' && message.confidence !== undefined && (
                        <p className="text-xs text-muted-foreground mt-2" data-testid={`text-escalation-confidence-${index}`}>
                          Confidence: {message.confidence.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                )) || (
                  <p className="text-center text-muted-foreground" data-testid="text-no-chat-messages">
                    No chat messages available
                  </p>
                )}
              </div>
              
              <div className="flex space-x-3 pt-4 border-t border-border">
                <Button size="sm" data-testid="button-assign-agent">
                  Assign to Agent
                </Button>
                <Button variant="secondary" size="sm" data-testid="button-mark-resolved">
                  Mark Resolved
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedEscalation(null)}
                  data-testid="button-close-escalation"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Support Chat Components (hidden for admin) */}
      <SupportToggle onClick={() => setSupportChatOpen(true)} />
      <SupportChat isOpen={supportChatOpen} onToggle={() => setSupportChatOpen(!supportChatOpen)} />
    </div>
  );
}
