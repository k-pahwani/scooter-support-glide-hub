
-- Disable Row Level Security on chat_messages table
ALTER TABLE public.chat_messages DISABLE ROW LEVEL SECURITY;

-- Drop all existing RLS policies on chat_messages
DROP POLICY IF EXISTS "Users can view their own chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can create their own chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update their own chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete their own chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Admins can view all chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "All users can view predefined messages" ON public.chat_messages;
