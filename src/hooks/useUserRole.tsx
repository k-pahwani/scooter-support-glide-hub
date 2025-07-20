
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'user' | null;

export const useUserRole = () => {
  const { user, isAuthenticated } = useAuth();
  const { isAdminAuthenticated } = useAdminAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      setLoading(true);
      
      if (!isAuthenticated || !user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user role:', error);
          setRole('user'); // Default to user role
        } else {
          setRole(data?.role || 'user');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('user'); // Default to user role
      }
      
      setLoading(false);
    };

    fetchUserRole();
  }, [isAuthenticated, user?.id, isAdminAuthenticated]);

  // If admin is authenticated via username/password, they are admin
  const isAdmin = isAdminAuthenticated || role === 'admin';

  return { role: isAdminAuthenticated ? 'admin' : role, isAdmin, loading };
};
