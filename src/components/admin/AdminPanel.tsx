import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Plus, List, ArrowLeft } from 'lucide-react';
import DomainQuestionManager from './DomainQuestionManager';

interface AdminPanelProps {
  onClose: () => void;
}

type AdminView = 'main' | 'questions';

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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <List className="w-5 h-5" />
              <span>Domain Questions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Manage domain-specific questions and answers for the support system.
            </p>
            <Button 
              onClick={() => setCurrentView('questions')}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Manage Questions
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-accent/50">
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-sm font-medium mb-1">Admin Features</h3>
              <p className="text-xs text-muted-foreground">
                You have administrative access to manage the support system
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminPanel;