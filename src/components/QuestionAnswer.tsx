
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Upload, MessageCircle, Battery, Zap, Settings, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
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
  },
  {
    id: "display-1",
    category: "Features",
    question: "What information does the display show?",
    answer: "The LCD display shows speed, battery level, riding mode, odometer, trip distance, and fault codes. It's visible in direct sunlight and features LED backlighting.",
    keywords: ["display", "screen", "information", "speed", "battery", "mode", "lcd"]
  },
  {
    id: "maintenance-1",
    category: "Maintenance",
    question: "How often should I service my scooter?",
    answer: "We recommend a basic inspection every 500 miles or 3 months. Professional servicing should be done annually or every 1,000 miles, whichever comes first.",
    keywords: ["maintenance", "service", "inspection", "repair", "check", "servicing"]
  },
  {
    id: "warranty-1",
    category: "Warranty",
    question: "What's covered under warranty?",
    answer: "We offer a 2-year warranty covering manufacturing defects, battery performance, and electrical components. Normal wear items like tires and brake pads are covered for 6 months.",
    keywords: ["warranty", "coverage", "defect", "guarantee", "protection", "covered"]
  }
];

const QuestionAnswer = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [allFAQs, setAllFAQs] = useState<FAQ[]>(predefinedFAQs);
  const [filteredFAQs, setFilteredFAQs] = useState<FAQ[]>(predefinedFAQs);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch domain questions from database
  useEffect(() => {
    fetchDomainQuestions();
  }, []);

  const fetchDomainQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('domain_questions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert domain questions to FAQ format
      const domainFAQs: FAQ[] = (data || []).map(q => ({
        id: q.id,
        category: q.category,
        question: q.question,
        answer: q.answer,
        keywords: q.keywords || []
      }));

      // Combine predefined FAQs with domain questions
      const combinedFAQs = [...predefinedFAQs, ...domainFAQs];
      setAllFAQs(combinedFAQs);
      setFilteredFAQs(combinedFAQs);
    } catch (error) {
      console.error('Error fetching domain questions:', error);
      // Continue with predefined FAQs only
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredFAQs(allFAQs);
      return;
    }

    const filtered = allFAQs.filter(faq => 
      faq.question.toLowerCase().includes(query.toLowerCase()) ||
      faq.answer.toLowerCase().includes(query.toLowerCase()) ||
      faq.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase())) ||
      faq.category.toLowerCase().includes(query.toLowerCase())
    );

    setFilteredFAQs(filtered);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive"
        });
        return;
      }

      // Check file type
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
        description: `${file.name} has been attached to your question`
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'battery': return <Battery className="w-4 h-4" />;
      case 'performance': return <Zap className="w-4 h-4" />;
      case 'safety': return <AlertCircle className="w-4 h-4" />;
      case 'features': return <Settings className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const categories = [...new Set(allFAQs.map(faq => faq.category))];

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Ask a Question</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Ask about battery life, speed, maintenance, or anything else..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* File Upload */}
          <div className="space-y-2">
            <label htmlFor="file-upload" className="text-sm font-medium">
              Attach a file (optional)
            </label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
                className="flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload File</span>
              </Button>
              {selectedFile && (
                <span className="text-sm text-muted-foreground">
                  {selectedFile.name}
                </span>
              )}
            </div>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,application/pdf,text/plain"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={searchQuery === "" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setSearchQuery("");
            setFilteredFAQs(allFAQs);
          }}
        >
          All Categories
        </Button>
        {categories.map(category => (
          <Button
            key={category}
            variant="outline"
            size="sm"
            onClick={() => handleSearch(category)}
            className="flex items-center space-x-1"
          >
            {getCategoryIcon(category)}
            <span>{category}</span>
          </Button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-3">
        {filteredFAQs.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-medium mb-2">No matching questions found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try different keywords or contact our support team directly
              </p>
              <Button variant="outline" size="sm">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredFAQs.map((faq) => (
            <Card key={faq.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div 
                  className="flex items-start justify-between"
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getCategoryIcon(faq.category)}
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">
                        {faq.category}
                      </span>
                    </div>
                    <h3 className="font-medium text-sm mb-2">{faq.question}</h3>
                    {expandedFAQ === faq.id && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    {expandedFAQ === faq.id ? "−" : "+"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Contact */}
      <Card className="bg-accent/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium mb-1">Still need help?</h3>
              <p className="text-xs text-muted-foreground">
                Contact our support team for personalized assistance
              </p>
            </div>
            <Button size="sm">
              Get Help
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionAnswer;
