import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield } from 'lucide-react';

interface LoginSelectionProps {
  onSelectUserLogin: () => void;
  onSelectAdminLogin: () => void;
}

export const LoginSelection = ({ onSelectUserLogin, onSelectAdminLogin }: LoginSelectionProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome</h1>
          <p className="text-muted-foreground">Choose your login method</p>
        </div>
        
        <div className="grid gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onSelectUserLogin}>
            <CardHeader className="text-center">
              <Users className="w-12 h-12 mx-auto mb-2" />
              <CardTitle>User Login</CardTitle>
              <CardDescription>Login with your mobile number</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={onSelectUserLogin}>
                Continue as User
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onSelectAdminLogin}>
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 mx-auto mb-2" />
              <CardTitle>Admin Login</CardTitle>
              <CardDescription>Login with username and password</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full" onClick={onSelectAdminLogin}>
                Continue as Admin
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};