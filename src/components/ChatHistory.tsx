import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MessageCircle, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ChatWindow from "./ChatWindow";

interface ChatSession {
  session_id: string;
  first_message: string;
  created_at: string;
  message_count: number;
}

interface ChatHistoryProps {
  onClose: () => void;
}

const ChatHistory = ({ onClose }: ChatHistoryProps) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchChatSessions();
    }
  }, [user]);

  const fetchChatSessions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get all unique sessions with first message and message count
      const { data, error } = await supabase
        .from('chat_messages')
        .select('session_id, content, created_at')
        .eq('user_id', user.id)
        .eq('type', 'user')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by session and get first message of each session
      const sessionMap = new Map<string, ChatSession>();
      
      data?.forEach(message => {
        if (!sessionMap.has(message.session_id)) {
          sessionMap.set(message.session_id, {
            session_id: message.session_id,
            first_message: message.content,
            created_at: message.created_at,
            message_count: 1
          });
        } else {
          const session = sessionMap.get(message.session_id)!;
          session.message_count++;
          // Keep the earliest message as first_message
          if (new Date(message.created_at) < new Date(session.created_at)) {
            session.first_message = message.content;
            session.created_at = message.created_at;
          }
        }
      });

      const sessionList = Array.from(sessionMap.values())
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setSessions(sessionList);
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (selectedSession) {
    return (
      <ChatWindow
        onClose={() => setSelectedSession(null)}
        sessionId={selectedSession}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-sm">
        <div className="max-w-md mx-auto flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-foreground rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Chat History</h1>
              <p className="text-xs opacity-90">Previous conversations</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto p-4">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading chat history...</p>
          </div>
        ) : sessions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-medium mb-2">No chat history</h3>
              <p className="text-sm text-muted-foreground">
                Start a conversation to see your chat sessions here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <Card 
                key={session.session_id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedSession(session.session_id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <MessageCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(session.created_at)}</span>
                        </div>
                      </div>
                      <p className="text-sm font-medium line-clamp-2 mb-1">
                        {session.first_message.length > 60 
                          ? session.first_message.substring(0, 60) + "..." 
                          : session.first_message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.message_count} message{session.message_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-2 flex-shrink-0">
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatHistory;
