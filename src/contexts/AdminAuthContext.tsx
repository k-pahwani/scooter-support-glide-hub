import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  adminUser: { id: string; username: string } | null;
  loginAdmin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: React.ReactNode;
}

export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<{ id: string; username: string } | null>(null);

  useEffect(() => {
    // Check for existing admin session in localStorage
    const storedAdmin = localStorage.getItem('admin_session');
    if (storedAdmin) {
      try {
        const parsed = JSON.parse(storedAdmin);
        setAdminUser(parsed);
        setIsAdminAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('admin_session');
      }
    }
  }, []);

  const loginAdmin = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.rpc('authenticate_admin', {
        username_param: username,
        password_param: password
      });

      if (error) {
        return { success: false, error: 'Authentication failed' };
      }

      const result = data[0];
      if (result && result.is_valid) {
        const adminSession = {
          id: result.admin_id,
          username: username
        };
        
        setAdminUser(adminSession);
        setIsAdminAuthenticated(true);
        localStorage.setItem('admin_session', JSON.stringify(adminSession));
        
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      return { success: false, error: 'Authentication failed' };
    }
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    setIsAdminAuthenticated(false);
    localStorage.removeItem('admin_session');
  };

  return (
    <AdminAuthContext.Provider value={{
      isAdminAuthenticated,
      adminUser,
      loginAdmin,
      logoutAdmin
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};