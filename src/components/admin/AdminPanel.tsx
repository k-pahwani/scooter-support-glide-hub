
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Plus, List, ArrowLeft } from 'lucide-react';
import DomainQuestionManager from './DomainQuestionManager';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PredefinedQuestion {
  id: string;
  question: string;
  answer: string;
  category: string;
  created_at: string;
  created_by: string;
  is_active: boolean;
}

interface AdminPanelProps {
  onClose: () => void;
}

type AdminView = 'main' | 'questions';

const AdminPanel = ({ onClose }: AdminPanelProps) => {
  const [currentView, setCurrentView] = useState<AdminView>('main');
  const [questions, setQuestions] = useState<PredefinedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (currentView === 'main') {
      fetchPredefinedQuestions();
    }
  }, [currentView]);

  const fetchPredefinedQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('domain_questions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching predefined questions:', error);
      toast({
        title: "Error",
        description: "Failed to load predefined questions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <List className="w-5 h-5" />
                <span>Predefined Questions</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Manage predefined questions that users can select for quick support.
            </p>
            
            {loading ? (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs text-muted-foreground">Loading questions...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">No predefined questions added yet</p>
                <Button 
                  onClick={() => setCurrentView('questions')}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Question
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">Recent Questions ({questions.length})</p>
                </div>
                {questions.map((question) => (
                  <div key={question.id} className="p-3 border rounded-lg bg-muted/30">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{question.question}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Category: {question.category} • Added {new Date(question.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {questions.length >= 10 && (
                  <Button 
                    onClick={() => setCurrentView('questions')}
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                  >
                    View All Questions
                  </Button>
                )}
              </div>
            )}
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
