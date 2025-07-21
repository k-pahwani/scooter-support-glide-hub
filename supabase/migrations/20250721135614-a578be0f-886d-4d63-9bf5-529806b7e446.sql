-- Temporarily create a more permissive policy for testing
CREATE POLICY "Authenticated users can view all orders for admin testing" 
ON public.scooter_orders 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Add some sample orders for testing
INSERT INTO public.scooter_orders (
  user_id, 
  scooter_id, 
  quantity, 
  unit_price, 
  total_amount, 
  status, 
  shipping_address, 
  phone_number, 
  notes
) VALUES 
(
  'c60f7848-fd28-4f53-94aa-dad49db44bc1',
  (SELECT id FROM public.scooters WHERE name = 'Lightning X1' LIMIT 1),
  1,
  129900,
  129900,
  'pending',
  '123 Main Street, Mumbai, Maharashtra 400001',
  '+91 9876543210',
  'Please deliver during business hours'
),
(
  'c60f7848-fd28-4f53-94aa-dad49db44bc1',
  (SELECT id FROM public.scooters WHERE name = 'Urban Cruiser' LIMIT 1),
  2,
  79900,
  159800,
  'confirmed',
  '456 Park Avenue, Delhi, Delhi 110001',
  '+91 9876543211',
  'Urgent delivery needed'
);