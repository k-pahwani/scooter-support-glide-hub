import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Shield } from 'lucide-react';
import bcrypt from 'bcryptjs';
import { supabase } from '@/integrations/supabase/client';

interface AdminLoginProps {
  onLoginSuccess: (adminData: { id: string; username: string }) => void;
  onBack: () => void;
}

export const AdminLogin = ({ onLoginSuccess, onBack }: AdminLoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For now, check against hardcoded admin credentials
      // Later this can be replaced with database lookup
      if (username !== 'admin' || password !== 'admin') {
        toast({
          title: "Login Failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
        return;
      }

      const adminAccount = {
        id: '00000000-0000-0000-0000-000000000001',
        username: 'admin'
      };

      toast({
        title: "Login Successful",
        description: "Welcome back, admin!",
      });

      onLoginSuccess({
        id: adminAccount.id,
        username: adminAccount.username
      });

    } catch (error) {
      console.error('Admin login error:', error);
      toast({
        title: "Login Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="self-start mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <Shield className="w-12 h-12 mx-auto mb-4" />
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Enter your admin credentials</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};