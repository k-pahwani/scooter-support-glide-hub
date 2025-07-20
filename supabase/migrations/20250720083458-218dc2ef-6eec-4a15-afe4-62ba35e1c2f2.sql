-- Create function to get admin account for authentication
CREATE OR REPLACE FUNCTION public.get_admin_account(username_param TEXT)
RETURNS TABLE (
  id UUID,
  username TEXT,
  password_hash TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    admin_accounts.id,
    admin_accounts.username,
    admin_accounts.password_hash
  FROM public.admin_accounts
  WHERE admin_accounts.username = username_param;
$$;