-- Fix RLS policies for domain_questions to allow proper admin operations

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can update domain questions" ON public.domain_questions;
DROP POLICY IF EXISTS "Admins can delete domain questions" ON public.domain_questions;
DROP POLICY IF EXISTS "Admins can insert domain questions" ON public.domain_questions;

-- Create proper admin policies that work
CREATE POLICY "Admins can insert domain questions" 
ON public.domain_questions 
FOR INSERT 
WITH CHECK (
  auth.role() = 'service_role'::text OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Admins can update domain questions" 
ON public.domain_questions 
FOR UPDATE 
USING (
  auth.role() = 'service_role'::text OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Admins can delete domain questions" 
ON public.domain_questions 
FOR DELETE 
USING (
  auth.role() = 'service_role'::text OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  auth.uid() IS NOT NULL
);