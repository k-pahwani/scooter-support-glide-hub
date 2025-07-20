
-- Create admin_accounts table for username/password authentication
CREATE TABLE public.admin_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_accounts
ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;

-- Create policy for admin accounts (only allow select for authentication)
CREATE POLICY "Allow authentication queries on admin accounts" 
  ON public.admin_accounts 
  FOR SELECT 
  USING (true);

-- Insert default admin account (password hash for "admin")
-- Using bcrypt hash for password "admin"
INSERT INTO public.admin_accounts (username, password_hash) 
VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Create a user entry in user_roles for the default admin
-- First we need to create a fake user_id for admin since they won't use Supabase Auth
-- We'll use a fixed UUID for the admin account
INSERT INTO public.user_roles (user_id, role) 
VALUES ('00000000-0000-0000-0000-000000000001', 'admin');

-- Create trigger to update updated_at column
CREATE TRIGGER update_admin_accounts_updated_at
  BEFORE UPDATE ON public.admin_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
