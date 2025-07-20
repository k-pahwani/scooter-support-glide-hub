-- Add admin policy to view all chat messages for admin panel
CREATE POLICY "Admins can view all chat messages" 
ON public.chat_messages 
FOR SELECT 
USING (
  -- Allow if user has admin role or service role
  has_role(auth.uid(), 'admin'::app_role) OR 
  auth.role() = 'service_role'
);