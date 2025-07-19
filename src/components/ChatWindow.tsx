import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Upload, X, ThumbsDown, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
}

interface Message {
  id: string;
  type: 'user' | 'bot' | 'predefined';
  content: string;
  timestamp: Date;
  session_id?: string;
}

const predefinedFAQs: FAQ[] = [
  {
    id: "battery-1",
    category: "Battery",
    question: "How long does the battery last?",
    answer: "The VoltRide battery typically lasts 25-40 miles on a single charge, depending on your weight, terrain, and riding style. In eco mode, you can extend the range up to 45 miles.",
    keywords: ["battery", "range", "miles", "charge", "last", "duration"]
  },
  {
    id: "battery-2", 
    category: "Battery",
    question: "How long does it take to charge the battery?",
    answer: "A full charge takes approximately 4-6 hours using the standard charger. For faster charging, our optional fast charger can reduce this to 2-3 hours.",
    keywords: ["charge", "charging", "time", "hours", "fast", "charger"]
  },
  {
    id: "speed-1",
    category: "Performance",
    question: "What's the maximum speed?",
    answer: "VoltRide scooters can reach speeds up to 25 mph (40 km/h) in sport mode. You can adjust the speed limit through the mobile app for safer riding.",
    keywords: ["speed", "fast", "mph", "maximum", "limit", "sport", "mode"]
  },
  {
    id: "brake-1",
    category: "Safety",
    question: "What type of brakes does it have?",
    answer: "Our scooters feature dual braking systems: electronic regenerative braking and mechanical disc brakes for maximum stopping power and safety.",
    keywords: ["brake", "brakes", "braking", "stop", "safety", "disc", "regenerative"]
  },
  {
    id: "weight-1",
    category: "Specifications",
    question: "What's the weight limit?",
    answer: "VoltRide scooters can safely support riders up to 265 lbs (120 kg). The scooter itself weighs 28 lbs (12.7 kg) for easy portability.",
    keywords: ["weight", "limit", "capacity", "heavy", "support", "portable"]
  }
];

interface ChatWindowProps {
  onClose: () => void;
  onViewSubmissions?: () => void;
}

const ChatWindow = ({ onClose, onViewSubmissions }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [lastBotResponse, setLastBotResponse] = useState<{ query: string; response: string } | null>(null);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load existing messages on mount
  useEffect(() => {
    const loadMessages = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', user.id)
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          const loadedMessages = data.map(msg => ({
            id: msg.id,
            type: msg.type as 'user' | 'bot' | 'predefined',
            content: msg.content,
            timestamp: new Date(msg.created_at),
            session_id: msg.session_id
          }));
          setMessages(loadedMessages);
          return;
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }

      // If no existing messages, initialize with welcome and predefined questions
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'bot',
        content: "Hi! I'm here to help with your VoltRide scooter questions. Here are our most popular topics:",
        timestamp: new Date(),
        session_id: sessionId
      };

      const predefinedMessages: Message[] = predefinedFAQs.slice(0, 5).map((faq, index) => ({
        id: `predefined-${index}`,
        type: 'predefined',
        content: faq.question,
        timestamp: new Date(),
        session_id: sessionId
      }));

      const initialMessages = [welcomeMessage, ...predefinedMessages];
      setMessages(initialMessages);

      // Save initial messages to database
      if (user?.id) {
        await saveMessages(initialMessages);
      }
    };

    loadMessages();
  }, [user?.id, sessionId]);

  const saveMessages = async (messagesToSave: Message[]) => {
    if (!user?.id) return;

    try {
      const messagesData = messagesToSave.map(msg => ({
        user_id: user.id,
        type: msg.type,
        content: msg.content,
        session_id: msg.session_id || sessionId,
        created_at: msg.timestamp.toISOString()
      }));

      const { error } = await supabase
        .from('chat_messages')
        .insert(messagesData);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  const saveMessage = async (message: Message) => {
    await saveMessages([message]);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const findBestAnswer = (query: string): string => {
    const lowercaseQuery = query.toLowerCase();
    
    // First, try exact matches
    let bestMatch = predefinedFAQs.find(faq => 
      faq.question.toLowerCase().includes(lowercaseQuery)
    );

    // Then try keyword matching
    if (!bestMatch) {
      bestMatch = predefinedFAQs.find(faq => 
        faq.keywords.some(keyword => lowercaseQuery.includes(keyword)) ||
        faq.answer.toLowerCase().includes(lowercaseQuery) ||
        faq.category.toLowerCase().includes(lowercaseQuery)
      );
    }

    return bestMatch ? bestMatch.answer : "I couldn't find a specific answer to your question. Please contact our support team for personalized assistance, or try rephrasing your question.";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      session_id: sessionId
    };

    setMessages(prev => [...prev, userMessage]);
    await saveMessage(userMessage);

    const currentQuery = inputValue;

    // Simulate bot response
    setTimeout(async () => {
      const response = findBestAnswer(currentQuery);
      const botResponse: Message = {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content: response,
        timestamp: new Date(),
        session_id: sessionId
      };
      setMessages(prev => [...prev, botResponse]);
      await saveMessage(botResponse);
      
      // Store the last interaction for potential submission
      setLastBotResponse({ query: currentQuery, response });
    }, 1000);

    setInputValue("");
  };

  const handlePredefinedClick = async (question: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: question,
      timestamp: new Date(),
      session_id: sessionId
    };

    setMessages(prev => [...prev, userMessage]);
    await saveMessage(userMessage);

    // Find and respond with the answer
    setTimeout(async () => {
      const faq = predefinedFAQs.find(f => f.question === question);
      const response = faq ? faq.answer : "Sorry, I couldn't find that answer.";
      const botResponse: Message = {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content: response,
        timestamp: new Date(),
        session_id: sessionId
      };
      setMessages(prev => [...prev, botResponse]);
       await saveMessage(botResponse);
      
      // Store the last interaction for potential submission
      setLastBotResponse({ query: question, response });
    }, 500);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive"
        });
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image, PDF, or text file",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
      toast({
        title: "File uploaded",
        description: `${file.name} has been attached`
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleSubmitQuery = async () => {
    if (!lastBotResponse || !user?.id) return;

    try {
      const { error } = await supabase
        .from('submitted_queries')
        .insert({
          user_id: user.id,
          original_query: lastBotResponse.query,
          bot_response: lastBotResponse.response
        });

      if (error) throw error;

      toast({
        title: "Query submitted",
        description: "Your feedback has been sent to our support team. They'll review it and improve our responses."
      });

      setLastBotResponse(null);
    } catch (error) {
      console.error('Error submitting query:', error);
      toast({
        title: "Error",
        description: "Failed to submit your query. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">VoltRide Support Chat</h2>
          <p className="text-xs opacity-90">Ask questions about your scooter</p>
        </div>
        <div className="flex items-center space-x-2">
          {onViewSubmissions && (
            <Button variant="ghost" size="sm" onClick={onViewSubmissions}>
              <List className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'predefined' ? (
              <Button
                variant="outline"
                className="max-w-xs text-left h-auto p-3"
                onClick={() => handlePredefinedClick(message.content)}
              >
                {message.content}
              </Button>
            ) : (
              <div className="flex flex-col space-y-2">
                <Card className={`max-w-xs ${message.type === 'user' ? 'bg-primary text-primary-foreground' : ''}`}>
                  <CardContent className="p-3">
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </CardContent>
                </Card>
                {message.type === 'bot' && lastBotResponse && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSubmitQuery}
                    className="max-w-xs self-start flex items-center space-x-1"
                  >
                    <ThumbsDown className="w-3 h-3" />
                    <span className="text-xs">Not helpful? Submit for review</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        {selectedFile && (
          <div className="mb-2 flex items-center justify-between bg-accent/50 p-2 rounded">
            <span className="text-sm">{selectedFile.name}</span>
            <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('chat-file-upload')?.click()}
          >
            <Upload className="w-4 h-4" />
          </Button>
          <Input
            placeholder="Type your question..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!inputValue.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <input
          id="chat-file-upload"
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,application/pdf,text/plain"
        />
      </div>
    </div>
  );
};

export default ChatWindow;