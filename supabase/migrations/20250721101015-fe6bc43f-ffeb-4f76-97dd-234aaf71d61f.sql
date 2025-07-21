-- Create scooters table to store available scooter models
CREATE TABLE public.scooters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- Price in cents
  max_speed INTEGER, -- in km/h
  range_km INTEGER, -- range in kilometers
  battery_capacity TEXT, -- battery info like "48V 15Ah"
  weight_kg DECIMAL(5,2), -- weight in kg
  max_load_kg INTEGER, -- max load capacity
  image_url TEXT,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create orders table to track scooter orders
CREATE TABLE public.scooter_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scooter_id UUID NOT NULL REFERENCES public.scooters(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL, -- Price per unit at time of order (in cents)
  total_amount INTEGER NOT NULL, -- Total amount (in cents)
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, processing, shipped, delivered, cancelled
  shipping_address TEXT,
  phone_number TEXT,
  notes TEXT,
  order_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  estimated_delivery DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scooters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scooter_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scooters - everyone can view available scooters
CREATE POLICY "Everyone can view available scooters" 
ON public.scooters 
FOR SELECT 
USING (is_available = true);

-- RLS Policies for scooter_orders - users can only see their own orders
CREATE POLICY "Users can view their own orders" 
ON public.scooter_orders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" 
ON public.scooter_orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" 
ON public.scooter_orders 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_scooters_updated_at
BEFORE UPDATE ON public.scooters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scooter_orders_updated_at
BEFORE UPDATE ON public.scooter_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample scooters
INSERT INTO public.scooters (name, model, description, price, max_speed, range_km, battery_capacity, weight_kg, max_load_kg, stock_quantity) VALUES
('Lightning X1', 'X1-2024', 'High-performance electric scooter with advanced suspension', 129900, 45, 80, '48V 20Ah', 28.5, 120, 10),
('Urban Cruiser', 'UC-Pro', 'Perfect for city commuting with foldable design', 79900, 35, 60, '36V 15Ah', 22.0, 100, 15),
('Trail Master', 'TM-500', 'Off-road capable scooter with rugged build', 159900, 50, 100, '52V 25Ah', 35.2, 150, 5),
('Eco Rider', 'ER-Lite', 'Affordable and eco-friendly option for daily use', 49900, 25, 40, '36V 10Ah', 18.5, 90, 20);