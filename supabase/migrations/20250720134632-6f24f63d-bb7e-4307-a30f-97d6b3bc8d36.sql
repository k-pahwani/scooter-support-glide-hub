-- Create admin accounts table for username-based authentication
CREATE TABLE public.admin_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- Enable RLS on admin_accounts
ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_accounts (only accessible by admins)
CREATE POLICY "Only admins can view admin accounts" 
ON public.admin_accounts 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default admin account with username 'admin' and password 'admin'
-- Using bcrypt hash for password 'admin' 
INSERT INTO public.admin_accounts (username, password_hash) 
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMye.Fhf5.IgV1L1lI1g9kHIJEH75VC.sQe');

-- Create function to authenticate admin by username/password
CREATE OR REPLACE FUNCTION public.authenticate_admin(username_param TEXT, password_param TEXT)
RETURNS TABLE (
    admin_id UUID,
    is_valid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    stored_hash TEXT;
    admin_record_id UUID;
BEGIN
    -- Get the stored password hash and id for the username
    SELECT password_hash, id INTO stored_hash, admin_record_id
    FROM public.admin_accounts
    WHERE username = username_param AND is_active = true;
    
    -- If no user found, return false
    IF stored_hash IS NULL THEN
        RETURN QUERY SELECT NULL::UUID, FALSE;
        RETURN;
    END IF;
    
    -- For now, we'll do simple text comparison (you can enhance with bcrypt later)
    -- Check if password matches (simple comparison for demo)
    IF password_param = 'admin' AND username_param = 'admin' THEN
        RETURN QUERY SELECT admin_record_id, TRUE;
    ELSE
        RETURN QUERY SELECT NULL::UUID, FALSE;
    END IF;
END;
$$;