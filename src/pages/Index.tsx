import { Phone, MessageCircle, Mail, Search, LogOut, HelpCircle, Settings, ShoppingCart, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import OTPLogin from "@/components/auth/OTPLogin";
import { AdminLogin } from "@/components/auth/AdminLogin";
import { LoginSelection } from "@/components/auth/LoginSelection";
import ChatWindow from "@/components/ChatWindow";
import SubmittedQueries from "@/components/SubmittedQueries";
import ChatHistory from "@/components/ChatHistory";
import AdminPanel from "@/components/admin/AdminPanel";
import ScooterCatalog from "@/components/ScooterCatalog";
import OrderForm from "@/components/OrderForm";
import MyOrders from "@/components/MyOrders";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { logoutAdmin, isAdminAuthenticated } = useAdminAuth();
  const { isAdmin } = useUserRole();
  const [showChat, setShowChat] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showScooterCatalog, setShowScooterCatalog] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showMyOrders, setShowMyOrders] = useState(false);
  const [selectedScooter, setSelectedScooter] = useState<any>(null);
  const [recentQuestions, setRecentQuestions] = useState<string[]>([]);
  const [initialQuestion, setInitialQuestion] = useState<string>("");
  const [loginType, setLoginType] = useState<'selection' | 'user' | 'admin'>('user');

  const handleLoginSuccess = () => {
    // Login is handled by the OTP verification in the OTPLogin component
    // Auth state is automatically updated via the AuthProvider
  };

  const handleAdminLoginSuccess = () => {
    setShowAdmin(true); // Show admin panel immediately after admin login
  };

  // Fetch recent questions from database
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchRecentQuestions();
    }
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    if (isAdminAuthenticated) {
      logoutAdmin();
    }
    if (isAuthenticated) {
      logout();
    }
  };

  const fetchRecentQuestions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('content')
        .eq('user_id', user.id)
        .eq('type', 'user')
        .order('created_at', { ascending: false })
        .limit(20); // Get more to filter for uniqueness

      if (error) throw error;
      
      // Get unique questions and limit to 4
      const allQuestions = data?.map(msg => msg.content) || [];
      const uniqueQuestions = [...new Set(allQuestions)].slice(0, 4);
      
      // Fallback to default questions if no recent questions
      if (uniqueQuestions.length === 0) {
        setRecentQuestions([
          "Battery not charging",
          "Speed issues", 
          "Brake problems",
          "Display not working"
        ]);
      } else {
        // Fill with defaults if we have less than 4 unique questions
        const defaults = ["Battery not charging", "Speed issues", "Brake problems", "Display not working"];
        const combined = [...uniqueQuestions];
        for (const defaultQ of defaults) {
          if (combined.length >= 4) break;
          if (!combined.includes(defaultQ)) {
            combined.push(defaultQ);
          }
        }
        setRecentQuestions(combined.slice(0, 4));
      }
    } catch (error) {
      console.error('Error fetching recent questions:', error);
      // Fallback to default questions
      setRecentQuestions([
        "Battery not charging",
        "Speed issues",
        "Brake problems", 
        "Display not working"
      ]);
    }
  };

  const handleQuickActionClick = (question: string) => {
    setInitialQuestion(question);
    setShowChat(true);
  };

  const handleOrderScooter = (scooter: any) => {
    setSelectedScooter(scooter);
    setShowScooterCatalog(false);
    setShowOrderForm(true);
  };

  const handleOrderSuccess = () => {
    setShowOrderForm(false);
    setSelectedScooter(null);
    setShowMyOrders(true);
  };

  // Check if either regular auth or admin auth is active
  const isUserLoggedIn = isAuthenticated || isAdminAuthenticated;

  // If admin is authenticated, redirect directly to admin panel
  if (isAdminAuthenticated) {
    return <AdminPanel onClose={() => setShowAdmin(false)} />;
  }

  if (!isUserLoggedIn) {
    if (loginType === 'selection') {
      return (
        <LoginSelection
          onSelectUserLogin={() => setLoginType('user')}
          onSelectAdminLogin={() => setLoginType('admin')}
        />
      );
    }
    
    if (loginType === 'user') {
      return (
        <div className="min-h-screen flex flex-col">
          <OTPLogin 
            onLoginSuccess={handleLoginSuccess}
            onBack={() => setLoginType('selection')}
          />
          <div className="p-4 text-center">
            <Button 
              variant="link" 
              size="sm"
              onClick={() => setLoginType('selection')}
              className="text-muted-foreground"
            >
              Switch to Admin Login
            </Button>
          </div>
        </div>
      );
    }
    
    if (loginType === 'admin') {
      return (
        <AdminLogin 
          onLoginSuccess={handleAdminLoginSuccess}
          onBack={() => setLoginType('user')}
        />
      );
    }
  }

  if (showChat) {
    return (
      <ChatWindow 
        onClose={() => {
          setShowChat(false);
          setInitialQuestion("");
        }} 
        onViewSubmissions={() => {
          setShowChat(false);
          setShowSubmissions(true);
        }}
        initialQuestion={initialQuestion}
      />
    );
  }

  if (showChatHistory) {
    return <ChatHistory onClose={() => setShowChatHistory(false)} />;
  }

  if (showSubmissions) {
    return <SubmittedQueries onClose={() => setShowSubmissions(false)} />;
  }

  if (showAdmin) {
    return <AdminPanel onClose={() => setShowAdmin(false)} />;
  }

  if (showScooterCatalog) {
    return (
      <ScooterCatalog 
        onClose={() => setShowScooterCatalog(false)}
        onOrderScooter={handleOrderScooter}
      />
    );
  }

  if (showOrderForm && selectedScooter) {
    return (
      <OrderForm 
        scooter={selectedScooter}
        onClose={() => {
          setShowOrderForm(false);
          setSelectedScooter(null);
        }}
        onOrderSuccess={handleOrderSuccess}
      />
    );
  }

  if (showMyOrders) {
    return <MyOrders onClose={() => setShowMyOrders(false)} />;
  }

  const supportOptions = [
    {
      icon: MessageCircle,
      title: "Chat History",
      action: "View History",
      onClick: () => setShowChatHistory(true)
    },
    {
      icon: Phone,
      title: "Contact Support", 
      action: "Call Now",
      onClick: () => window.location.href = '/contact'
    },
    {
      icon: Mail,
      title: "Email Support",
      action: "Send Email",
      onClick: () => window.location.href = '/contact'
    }
  ];


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-foreground rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-sm">⚡</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">VoltRide</h1>
              <p className="text-xs opacity-90">Help & FAQ</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <p className="text-xs opacity-90">Welcome</p>
              <p className="text-sm font-medium">{user?.phone || user?.email}</p>
            </div>
            {isAdmin && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAdmin(true)}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Ask Questions Feature */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-blue-900">Ask Questions</h3>
                <p className="text-xs text-blue-700">Get instant answers about your scooter</p>
              </div>
              <Button 
                size="sm" 
                onClick={() => setShowChat(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Ask Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Scooter Shopping Section */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-green-900">Shop Scooters</h3>
                <p className="text-xs text-green-700">Browse and order electric scooters</p>
              </div>
              <Button 
                size="sm" 
                onClick={() => setShowScooterCatalog(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Shop Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* My Orders Section */}
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-orange-900">My Orders</h3>
                <p className="text-xs text-orange-700">Track your scooter orders</p>
              </div>
              <Button 
                size="sm" 
                onClick={() => setShowMyOrders(true)}
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                View Orders
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Quick Help
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {recentQuestions.map((question, index) => (
              <Button 
                key={index}
                variant="outline" 
                className="h-auto p-3 text-xs text-left justify-start"
                onClick={() => handleQuickActionClick(question)}
              >
                {question.length > 30 ? question.substring(0, 30) + "..." : question}
              </Button>
            ))}
          </div>
        </section>

        {/* Support Options */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Get Support
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {supportOptions.map((option, index) => (
              <Button 
                key={index} 
                variant="outline" 
                className="h-16 flex-col gap-1"
                onClick={option.onClick}
              >
                <option.icon className="w-4 h-4" />
                <span className="text-xs">{option.title}</span>
              </Button>
            ))}
          </div>
        </section>

        {/* Emergency Contact */}
        <Card className="bg-destructive/5 border-destructive/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-destructive">Emergency Support</CardTitle>
            <CardDescription className="text-xs">
              For urgent safety issues or accidents
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button 
              className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() => window.location.href = '/contact'}
            >
              Contact Support
            </Button>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center pt-4 pb-8 space-y-2">
          <p className="text-xs text-muted-foreground">
            Support available 24/7
          </p>
          <p className="text-xs text-muted-foreground">
            VoltRide © 2024
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
