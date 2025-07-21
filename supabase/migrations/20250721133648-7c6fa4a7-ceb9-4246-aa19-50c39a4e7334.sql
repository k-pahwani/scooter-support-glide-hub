-- Add foreign key relationship between scooter_orders and profiles
ALTER TABLE public.scooter_orders 
ADD CONSTRAINT fk_scooter_orders_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;