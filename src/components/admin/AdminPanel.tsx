
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { List, ArrowLeft, MessageCircle, LogOut } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import DomainQuestionManager from './DomainQuestionManager';
import AdminChatHistory from './AdminChatHistory';

interface AdminPanelProps {
  onClose: () => void;
}

type AdminView = 'main' | 'questions' | 'chat-history';

const AdminPanel = ({ onClose }: AdminPanelProps) => {
  const [currentView, setCurrentView] = useState<AdminView>('main');
  const { logoutAdmin } = useAdminAuth();

  const handleLogout = () => {
    logoutAdmin();
    // Don't call onClose here as the admin will automatically be redirected to login
  };


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
            <div>
              <h1 className="text-lg font-bold">Admin Panel</h1>
              <p className="text-xs opacity-90">System Management</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-primary-foreground hover:bg-primary-foreground/10 flex items-center space-x-1"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs">Logout</span>
          </Button>
        </div>
      </header>

      {/* Admin Dashboard */}
      <main className="max-w-md mx-auto p-4 space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-2">Admin Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            System overview and quick actions
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-20 flex-col space-y-2"
            onClick={() => setCurrentView('questions')}
          >
            <List className="w-5 h-5" />
            <span className="text-xs">Questions</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-20 flex-col space-y-2"
            onClick={() => setCurrentView('chat-history')}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs">Chat History</span>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
