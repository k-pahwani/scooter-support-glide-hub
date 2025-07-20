import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'user' | null;

export const useUserRole = () => {
  const { user, isAuthenticated, authType, adminData } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setRole(null);
      setLoading(false);
      return;
    }

    // Handle admin authentication
    if (authType === 'admin' && adminData) {
      setRole('admin');
      setLoading(false);
      return;
    }

    // Handle user authentication - only fetch if we have a user
    if (authType === 'user' && user) {
      const fetchUserRole = async () => {
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
          setRole('user');
        } finally {
          setLoading(false);
        }
      };

      fetchUserRole();
      return;
    }

    // If we don't have user data yet but are in user auth type, keep loading
    if (authType === 'user' && !user) {
      return;
    }

    // Default case
    setRole(null);
    setLoading(false);

  }, [isAuthenticated, user, authType, adminData]);

  const isAdmin = role === 'admin';

  return { role, isAdmin, loading };
};