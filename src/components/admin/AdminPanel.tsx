
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Settings, Plus, List, ArrowLeft, X, Loader2, MessageCircle, History } from 'lucide-react';
import DomainQuestionManager from './DomainQuestionManager';
import AdminChatHistory from './AdminChatHistory';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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

type AdminView = 'main' | 'questions' | 'chat-history';

const AdminPanel = ({ onClose }: AdminPanelProps) => {
  const [currentView, setCurrentView] = useState<AdminView>('main');
  const [questions, setQuestions] = useState<PredefinedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    keywords: [] as string[]
  });
  const [keywordInput, setKeywordInput] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

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

  const handleCreateQuestion = async () => {
    if (!formData.question.trim() || !formData.answer.trim() || !formData.category.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      // Use a robust fallback for created_by - service role policies handle access control
      const createdBy = user?.id || '00000000-0000-0000-0000-000000000000';
      
      const { error } = await supabase
        .from('domain_questions')
        .insert({
          question: formData.question.trim(),
          answer: formData.answer.trim(),
          category: formData.category.trim(),
          keywords: formData.keywords.length > 0 ? formData.keywords.filter(k => k.trim() !== '') : null,
          created_by: createdBy,
          is_active: true
        });

      if (error) {
        console.error('Error creating question:', error);
        // More specific error handling for RLS violations
        if (error.code === '42501') {
          toast({
            title: "Permission Error",
            description: "Admin access required to create questions",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: error.message || "Failed to create predefined question",
            variant: "destructive"
          });
        }
        return;
      }

      toast({
        title: "Success",
        description: "Predefined question created successfully",
      });

      // Reset form and close modal
      setFormData({
        question: '',
        answer: '',
        category: '',
        keywords: []
      });
      setKeywordInput('');
      setIsModalOpen(false);
      
      // Refresh the questions list
      fetchPredefinedQuestions();
    } catch (error) {
      console.error('Error creating question:', error);
      toast({
        title: "Error",
        description: "Failed to create predefined question",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
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
                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-1" />
                        Add New
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add New Predefined Question</DialogTitle>
                        <DialogDescription>
                          Create a new predefined question with answer and category details.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="question">Question *</Label>
                          <Textarea
                            id="question"
                            placeholder="Enter the question..."
                            value={formData.question}
                            onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="answer">Answer *</Label>
                          <Textarea
                            id="answer"
                            placeholder="Enter the answer..."
                            value={formData.answer}
                            onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                            rows={4}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category">Category *</Label>
                          <Select 
                            value={formData.category} 
                            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="General">General</SelectItem>
                              <SelectItem value="Technical">Technical</SelectItem>
                              <SelectItem value="Billing">Billing</SelectItem>
                              <SelectItem value="Account">Account</SelectItem>
                              <SelectItem value="Support">Support</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="keywords">Keywords (Optional)</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="keywords"
                              placeholder="Add keyword..."
                              value={keywordInput}
                              onChange={(e) => setKeywordInput(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                            />
                            <Button type="button" onClick={addKeyword} size="sm">
                              Add
                            </Button>
                          </div>
                          {formData.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {formData.keywords.map((keyword) => (
                                <Badge key={keyword} variant="secondary" className="text-xs">
                                  {keyword}
                                  <X 
                                    className="w-3 h-3 ml-1 cursor-pointer" 
                                    onClick={() => removeKeyword(keyword)}
                                  />
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsModalOpen(false)}
                            disabled={isCreating}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="button" 
                            onClick={handleCreateQuestion}
                            disabled={isCreating}
                          >
                            {isCreating ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              'Create Question'
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Chat History</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              View and manage all user conversations across the platform.
            </p>
            
            <div className="text-center py-4">
              <Button 
                onClick={() => setCurrentView('chat-history')}
                className="w-full"
              >
                <History className="w-4 h-4 mr-2" />
                View All Chat History
              </Button>
            </div>
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
