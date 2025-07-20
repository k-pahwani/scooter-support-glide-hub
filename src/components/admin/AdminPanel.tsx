
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, List, ArrowLeft, MessageCircle } from 'lucide-react';
import DomainQuestionManager from './DomainQuestionManager';
import AdminChatHistory from './AdminChatHistory';

interface AdminPanelProps {
  onClose: () => void;
}

type AdminView = 'main' | 'questions' | 'chat-history';

const AdminPanel = ({ onClose }: AdminPanelProps) => {
  const [currentView, setCurrentView] = useState<AdminView>('main');


  if (currentView === 'questions') {
    return (
      <DomainQuestionManager 
        onBack={() => setCurrentView('main')}
        onClose={onClose}
      />
    );
  }

  if (currentView === 'chat-history') {
    return (
      <AdminChatHistory 
        onBack={() => setCurrentView('main')}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Admin Panel</h1>
              <p className="text-xs opacity-90">System Management</p>
            </div>
          </div>
          <Settings className="w-6 h-6" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-2">Admin Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Choose an option to manage the support system
          </p>
        </div>

        <div className="space-y-4">
          {/* Manage Predefined Questions */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow group">
            <CardContent 
              className="p-6 text-center"
              onClick={() => setCurrentView('questions')}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <List className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Manage Predefined Questions</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add, edit, and organize predefined questions for user support
              </p>
              <Button variant="outline" className="w-full">
                Manage Questions
              </Button>
            </CardContent>
          </Card>

          {/* View User Chat History */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow group">
            <CardContent 
              className="p-6 text-center"
              onClick={() => setCurrentView('chat-history')}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">View User Chat History</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Monitor and review all user conversations and support interactions
              </p>
              <Button variant="outline" className="w-full">
                View Chat History
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
