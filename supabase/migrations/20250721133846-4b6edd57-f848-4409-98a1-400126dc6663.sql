-- Insert missing profile for the orphaned user_id
INSERT INTO public.profiles (id, username) 
VALUES ('c60f7848-fd28-4f53-94aa-dad49db44bc1', '919009088899')
ON CONFLICT (id) DO NOTHING;

-- Now add the foreign key relationship between scooter_orders and profiles
ALTER TABLE public.scooter_orders 
ADD CONSTRAINT fk_scooter_orders_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;