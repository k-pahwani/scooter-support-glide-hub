
-- Add service role policy for domain_questions INSERT
-- This allows the service role to bypass user authentication requirements
CREATE POLICY "Service role can insert domain questions" 
ON public.domain_questions 
FOR INSERT 
WITH CHECK (
  -- Allow if using service role (auth.role() returns 'service_role')
  auth.role() = 'service_role'
);

-- Add service role policy for domain_questions SELECT (for admin operations)
CREATE POLICY "Service role can select all domain questions" 
ON public.domain_questions 
FOR SELECT 
USING (
  -- Allow if using service role
  auth.role() = 'service_role'
);

-- Add service role policy for domain_questions UPDATE (for admin operations)
CREATE POLICY "Service role can update domain questions" 
ON public.domain_questions 
FOR UPDATE 
USING (
  -- Allow if using service role
  auth.role() = 'service_role'
);

-- Add service role policy for domain_questions DELETE (for admin operations)
CREATE POLICY "Service role can delete domain questions" 
ON public.domain_questions 
FOR DELETE 
USING (
  -- Allow if using service role
  auth.role() = 'service_role'
);
