-- Remove the foreign key constraint on created_by since we're using custom admin authentication
-- This allows admin questions to be created without requiring a user in auth.users table
ALTER TABLE public.domain_questions 
DROP CONSTRAINT IF EXISTS domain_questions_created_by_fkey;