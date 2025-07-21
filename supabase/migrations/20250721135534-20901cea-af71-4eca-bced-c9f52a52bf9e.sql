-- Remove the restrictive admin RLS policies and create more permissive ones
DROP POLICY IF EXISTS "Admins can view all scooter orders" ON public.scooter_orders;
DROP POLICY IF EXISTS "Admins can update all scooter orders" ON public.scooter_orders;

-- Create new policies that allow service role access (which admin functions use)
CREATE POLICY "Service role can view all scooter orders" 
ON public.scooter_orders 
FOR SELECT 
USING (auth.role() = 'service_role'::text);

CREATE POLICY "Service role can update all scooter orders" 
ON public.scooter_orders 
FOR UPDATE 
USING (auth.role() = 'service_role'::text);

-- Also allow authenticated users with admin role to access orders
CREATE POLICY "Admin role users can view all scooter orders" 
ON public.scooter_orders 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin role users can update all scooter orders" 
ON public.scooter_orders 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));