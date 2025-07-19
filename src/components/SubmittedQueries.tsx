import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface SubmittedQuery {
  id: string;
  original_query: string;
  bot_response: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
  updated_at: string;
}

interface SubmittedQueriesProps {
  onClose: () => void;
}

const SubmittedQueries = ({ onClose }: SubmittedQueriesProps) => {
  const [queries, setQueries] = useState<SubmittedQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadQueries = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('submitted_queries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setQueries((data || []) as SubmittedQuery[]);
      } catch (error) {
        console.error('Error loading queries:', error);
        toast({
          title: "Error",
          description: "Failed to load submitted queries",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadQueries();
  }, [user?.id, toast]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'reviewed':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading submitted queries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Submitted Queries</h2>
          <p className="text-xs opacity-90">Track your feedback submissions</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {queries.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No submitted queries</h3>
            <p className="text-muted-foreground">
              When you submit queries for review from the chat, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {queries.map((query) => (
              <Card key={query.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-medium">
                      {query.original_query}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(query.status)}
                      <Badge className={getStatusColor(query.status)}>
                        {query.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Submitted {formatDate(query.created_at)}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Bot Response
                      </h4>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                        {query.bot_response}
                      </p>
                    </div>
                    
                    {query.status === 'resolved' && (
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">
                            Resolved
                          </span>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                          Our team has reviewed your feedback and improved our responses. 
                          Thank you for helping us improve!
                        </p>
                      </div>
                    )}

                    {query.status === 'reviewed' && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">
                            Under Review
                          </span>
                        </div>
                        <p className="text-sm text-blue-700 mt-1">
                          Our support team is currently reviewing your feedback.
                        </p>
                      </div>
                    )}

                    {query.status === 'pending' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">
                            Pending Review
                          </span>
                        </div>
                        <p className="text-sm text-yellow-700 mt-1">
                          Your feedback has been submitted and is waiting for review.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmittedQueries;