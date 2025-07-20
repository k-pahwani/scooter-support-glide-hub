
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'user' | null;

export const useUserRole = () => {
  const { user, isAuthenticated, authType, adminData } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const prevAuthStateRef = useRef<{
    isAuthenticated: boolean;
    authType: 'user' | 'admin' | null;
    userId: string | null;
    adminId: string | null;
  }>({
    isAuthenticated: false,
    authType: null,
    userId: null,
    adminId: null
  });

  useEffect(() => {
    const currentAuthState = {
      isAuthenticated,
      authType,
      userId: user?.id || null,
      adminId: adminData?.id || null
    };

    // Check if auth state actually changed to prevent unnecessary processing
    const prevState = prevAuthStateRef.current;
    const hasChanged = 
      prevState.isAuthenticated !== currentAuthState.isAuthenticated ||
      prevState.authType !== currentAuthState.authType ||
      prevState.userId !== currentAuthState.userId ||
      prevState.adminId !== currentAuthState.adminId;

    if (!hasChanged) {
      return;
    }

    prevAuthStateRef.current = currentAuthState;

    console.log('useUserRole: Auth state changed', currentAuthState);

    if (!isAuthenticated) {
      setRole(null);
      setLoading(false);
      return;
    }

    // Handle admin authentication
    if (authType === 'admin' && adminData) {
      console.log('useUserRole: Setting admin role');
      setRole('admin');
      setLoading(false);
      return;
    }

    // Handle user authentication - only fetch if we have a user
    if (authType === 'user' && user) {
      console.log('useUserRole: Fetching user role for user:', user.id);
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
      console.log('useUserRole: User auth type but no user data, keeping loading state');
      return;
    }

    // Default case
    console.log('useUserRole: Default case, setting role to null');
    setRole(null);
    setLoading(false);

  }, [isAuthenticated, authType, user?.id, adminData?.id]);

  const isAdmin = role === 'admin';

  return { role, isAdmin, loading };
};
