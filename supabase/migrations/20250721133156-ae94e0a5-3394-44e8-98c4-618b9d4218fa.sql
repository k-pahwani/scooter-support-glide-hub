-- Add RLS policy for admins to view all scooter orders
CREATE POLICY "Admins can view all scooter orders" 
ON public.scooter_orders 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add RLS policy for admins to update any scooter order status
CREATE POLICY "Admins can update all scooter orders" 
ON public.scooter_orders 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));