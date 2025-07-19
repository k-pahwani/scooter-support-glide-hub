import { Phone, MessageCircle, Mail, Search, LogOut, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import OTPLogin from "@/components/auth/OTPLogin";
import ChatWindow from "@/components/ChatWindow";
import SubmittedQueries from "@/components/SubmittedQueries";
import { useState } from "react";

const Index = () => {
  const { isAuthenticated, user, login, logout } = useAuth();
  const [showChat, setShowChat] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(false);

  const handleLoginSuccess = () => {
    // Login is handled by the OTP verification in the OTPLogin component
    // Auth state is automatically updated via the AuthProvider
  };

  if (!isAuthenticated) {
    return <OTPLogin onLoginSuccess={handleLoginSuccess} />;
  }

  if (showChat) {
    return (
      <ChatWindow 
        onClose={() => setShowChat(false)} 
        onViewSubmissions={() => {
          setShowChat(false);
          setShowSubmissions(true);
        }}
      />
    );
  }

  if (showSubmissions) {
    return <SubmittedQueries onClose={() => setShowSubmissions(false)} />;
  }

  const supportOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      action: "Start Chat"
    },
    {
      icon: Phone,
      title: "Call Support", 
      action: "Call Now"
    },
    {
      icon: Mail,
      title: "Email Support",
      action: "Send Email"
    }
  ];

  const quickActions = [
    "Battery not charging",
    "Speed issues",
    "Brake problems", 
    "Display not working"
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
              <p className="text-xs opacity-90">Support Center</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <p className="text-xs opacity-90">Welcome</p>
              <p className="text-sm font-medium">{user?.phone || user?.email}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
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

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Search for help..." 
            className="pl-10 h-12 text-base"
          />
        </div>

        {/* Quick Actions */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Quick Help
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <Button 
                key={index}
                variant="outline" 
                className="h-auto p-3 text-xs text-left justify-start"
              >
                {action}
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
              <Button key={index} variant="outline" className="h-16 flex-col gap-1">
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
            <Button className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Call Emergency Line
            </Button>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center pt-4 pb-8 space-y-2">
          <p className="text-xs text-muted-foreground">
            Support available 24/7
          </p>
          <p className="text-xs text-muted-foreground">
            VoltRide Electric Scooters © 2024
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
