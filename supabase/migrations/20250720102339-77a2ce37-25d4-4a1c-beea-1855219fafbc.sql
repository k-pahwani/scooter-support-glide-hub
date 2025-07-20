
-- Update the user with email and password (if the user exists in auth.users)
-- Note: We cannot directly set passwords in SQL for security reasons
-- The user will need to be created through Supabase Auth or the dashboard

-- First, let's add the admin role to the user
INSERT INTO public.user_roles (user_id, role)
VALUES ('c60f7848-fd28-4f53-94aa-dad49db44bc1', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Update the user's email in the profiles table if it exists
INSERT INTO public.profiles (id, username)
VALUES ('c60f7848-fd28-4f53-94aa-dad49db44bc1', 'kaushal.pahwani@talentica.com')
ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username;
