-- Add admin role to the default admin user that was created
-- First, we need to create an auth user for the admin account
-- Note: In production, you would create this through the auth system

-- Create a user_role entry for our admin account
-- We'll use the same user ID that was previously given admin rights
INSERT INTO public.user_roles (user_id, role) 
VALUES ('0f2dbedd-e48a-4d75-a7c3-557602ba2dc3', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;