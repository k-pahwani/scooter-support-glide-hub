
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface DomainQuestion {
  id: string;
  question: string;
  answer: string;
  category: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  keywords: string[] | null;
  created_by: string;
}

interface DomainQuestionManagerProps {
  onBack: () => void;
  onClose: () => void;
}

const DomainQuestionManager = ({ onBack, onClose }: DomainQuestionManagerProps) => {
  const [questions, setQuestions] = useState<DomainQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const QUESTIONS_PER_PAGE = 20;

  // Form state for domain questions
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General'
  });

  useEffect(() => {
    fetchPredefinedQuestions();
  }, [currentPage]);

  const fetchPredefinedQuestions = async () => {
    try {
      // Get total count
      const { count } = await supabase
        .from('domain_questions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      setTotalCount(count || 0);

      // Get paginated data
      const from = (currentPage - 1) * QUESTIONS_PER_PAGE;
      const to = from + QUESTIONS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('domain_questions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching domain questions:', error);
      toast({
        title: "Error",
        description: "Failed to load domain questions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !formData.question.trim() || !formData.answer.trim()) {
      toast({
        title: "Validation Error",
        description: "Question and answer are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const questionData = {
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        category: formData.category,
        created_by: user.id
      };

      let error;
      if (editingId) {
        const { error: updateError } = await supabase
          .from('domain_questions')
          .update({ 
            question: questionData.question,
            answer: questionData.answer,
            category: questionData.category,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('domain_questions')
          .insert([questionData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: editingId ? "Question updated successfully" : "Question added successfully"
      });

      setFormData({ question: '', answer: '', category: 'General' });
      setEditingId(null);
      setShowAddForm(false);
      setCurrentPage(1); // Reset to first page when adding new question
      fetchPredefinedQuestions();
    } catch (error) {
      console.error('Error saving question:', error);
      toast({
        title: "Error",
        description: "Failed to save question",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (question: DomainQuestion) => {
    setFormData({
      question: question.question,
      answer: question.answer,
      category: question.category
    });
    setEditingId(question.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const { error } = await supabase
        .from('domain_questions')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question deleted successfully"
      });

      fetchPredefinedQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setFormData({ question: '', answer: '', category: 'General' });
    setEditingId(null);
    setShowAddForm(false);
  };

  const totalPages = Math.ceil(totalCount / QUESTIONS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setLoading(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading questions...</p>
        </div>
      </div>
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
              onClick={onBack}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Predefined Questions</h1>
              <p className="text-xs opacity-90">Manage Quick Questions</p>
            </div>
          </div>
          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* Modal for Add/Edit Form */}
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Question' : 'Add New Question'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Question</label>
                <Input
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter the question..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Answer</label>
                <Input
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Enter the answer..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Category (e.g., General, Technical)..."
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSave} size="sm" className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm" className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Questions List */}
        <div className="space-y-3">
          {questions.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  {totalCount === 0 ? "No predefined questions added yet" : "No questions on this page"}
                </p>
                {totalCount === 0 && (
                  <Button onClick={() => setShowAddForm(true)} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Question
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            questions.map((question) => (
              <Card key={question.id}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{question.question}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{question.answer}</p>
                        <span className="inline-block bg-muted px-2 py-1 rounded-md text-xs mt-2">{question.category}</span>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(question)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(question.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Added {new Date(question.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            
            <p className="text-center text-xs text-muted-foreground mt-2">
              Showing {((currentPage - 1) * QUESTIONS_PER_PAGE) + 1} to {Math.min(currentPage * QUESTIONS_PER_PAGE, totalCount)} of {totalCount} questions
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default DomainQuestionManager;
