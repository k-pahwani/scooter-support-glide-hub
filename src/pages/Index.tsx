
import { Phone, MessageCircle, Mail, Search, FileText, Wrench, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import OTPLogin from "@/components/auth/OTPLogin";

const Index = () => {
  const { isAuthenticated, user, login, logout } = useAuth();

  const handleLoginSuccess = () => {
    // This will be called from OTPLogin component with the phone number
    // For demo purposes, we'll use a placeholder number
    login("+91 9876543210");
  };

  if (!isAuthenticated) {
    return <OTPLogin onLoginSuccess={handleLoginSuccess} />;
  }

  const supportOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Get instant help from our support team",
      action: "Start Chat"
    },
    {
      icon: Phone,
      title: "Call Support",
      description: "Speak directly with a technician",
      action: "Call Now"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us your questions and concerns",
      action: "Send Email"
    },
    {
      icon: FileText,
      title: "User Manual",
      description: "Download guides and documentation",
      action: "View Guides"
    },
    {
      icon: Wrench,
      title: "Service Request",
      description: "Schedule a repair or maintenance",
      action: "Book Service"
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
              <p className="text-sm font-medium">{user?.phone}</p>
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
          <div className="space-y-3">
            {supportOptions.map((option, index) => (
              <Card key={index} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                      <option.icon className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm">{option.title}</h3>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-xs">
                      {option.action}
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
