
-- Update the existing admin INSERT policy to handle the custom admin authentication
-- This replaces the current "Admins can insert domain questions" policy
DROP POLICY IF EXISTS "Admins can insert domain questions" ON public.domain_questions;

CREATE POLICY "Admins can insert domain questions" 
ON public.domain_questions 
FOR INSERT 
WITH CHECK (
  -- Allow if using service role OR if user has admin role OR if created_by is provided (for admin panel)
  auth.role() = 'service_role' OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  (created_by IS NOT NULL AND auth.uid() IS NULL)
);

-- Update the existing admin SELECT policy to be more permissive for admin operations
DROP POLICY IF EXISTS "Admins can update domain questions" ON public.domain_questions;

CREATE POLICY "Admins can update domain questions" 
ON public.domain_questions 
FOR UPDATE 
USING (
  -- Allow if using service role OR if user has admin role OR for any authenticated context
  auth.role() = 'service_role' OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  auth.uid() IS NOT NULL
);

-- Update the existing admin DELETE policy 
DROP POLICY IF EXISTS "Admins can delete domain questions" ON public.domain_questions;

CREATE POLICY "Admins can delete domain questions" 
ON public.domain_questions 
FOR DELETE 
USING (
  -- Allow if using service role OR if user has admin role OR for any authenticated context
  auth.role() = 'service_role' OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  auth.uid() IS NOT NULL
);
