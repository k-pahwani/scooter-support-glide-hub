
-- Remove admin role from the old user
DELETE FROM public.user_roles 
WHERE user_id = 'c60f7848-fd28-4f53-94aa-dad49db44bc1' 
AND role = 'admin';

-- Add admin role to the new user
INSERT INTO public.user_roles (user_id, role)
VALUES ('0f2dbedd-e48a-4d75-a7c3-557602ba2dc3', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Update the profile for the new admin user
INSERT INTO public.profiles (id, username)
VALUES ('0f2dbedd-e48a-4d75-a7c3-557602ba2dc3', 'kaushal.pahwani@talentica.com')
ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username;

-- Remove the profile entry for the old user (optional - clean up)
DELETE FROM public.profiles 
WHERE id = 'c60f7848-fd28-4f53-94aa-dad49db44bc1';
