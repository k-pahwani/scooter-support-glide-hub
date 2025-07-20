
-- Add new policy to allow all authenticated users to view predefined messages
CREATE POLICY "All users can view predefined messages" 
  ON public.chat_messages 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL AND type = 'predefined');
