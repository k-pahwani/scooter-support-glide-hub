
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AdminData {
  id: string;
  username: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  adminData: AdminData | null;
  authType: 'user' | 'admin' | null;
  login: (phone: string) => void;
  adminLogin: (adminData: AdminData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [authType, setAuthType] = useState<'user' | 'admin' | null>(null);

  // Memoize adminData to prevent unnecessary re-renders
  const memoizedAdminData = useMemo(() => adminData, [adminData?.id, adminData?.username]);

  useEffect(() => {
    // Check for existing admin session
    const savedAdminData = localStorage.getItem('adminData');
    if (savedAdminData) {
      const admin = JSON.parse(savedAdminData);
      setAdminData(admin);
      setAuthType('admin');
      setIsAuthenticated(true);
      return;
    }

    // Set up auth state listener for regular users
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Use current adminData state within the callback to avoid dependency issues
        const currentAdminData = localStorage.getItem('adminData');
        if (session && !currentAdminData) {
          setSession(session);
          setUser(session?.user ?? null);
          setAuthType('user');
          setIsAuthenticated(!!session);
        } else if (!session && !currentAdminData) {
          setSession(null);
          setUser(null);
          setAuthType(null);
          setIsAuthenticated(false);
        }
      }
    );

    // Get initial session for regular users
    const currentAdminData = localStorage.getItem('adminData');
    if (!currentAdminData) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setAuthType(session ? 'user' : null);
        setIsAuthenticated(!!session);
      });
    }

    return () => subscription.unsubscribe();
  }, []); // Remove adminData dependency to prevent infinite loop

  const login = (phone: string) => {
    // Login is handled by the OTP verification in the OTPLogin component
    // This is kept for backwards compatibility
  };

  const adminLogin = (admin: AdminData) => {
    setAdminData(admin);
    setAuthType('admin');
    setIsAuthenticated(true);
    // Clear any existing user session
    setUser(null);
    setSession(null);
    // Persist admin session
    localStorage.setItem('adminData', JSON.stringify(admin));
  };

  const logout = async () => {
    try {
      if (authType === 'admin') {
        // Admin logout
        setAdminData(null);
        setAuthType(null);
        setIsAuthenticated(false);
        localStorage.removeItem('adminData');
      } else {
        // User logout
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      session, 
      adminData: memoizedAdminData, 
      authType, 
      login, 
      adminLogin, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
