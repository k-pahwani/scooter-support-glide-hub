-- Fix security issues by enabling RLS on any missing tables
-- Based on the error, it seems there are tables without RLS enabled

-- Enable RLS on chat_messages table if not already enabled
DO $$
BEGIN
    -- Check if RLS is already enabled on chat_messages
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'chat_messages'
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;