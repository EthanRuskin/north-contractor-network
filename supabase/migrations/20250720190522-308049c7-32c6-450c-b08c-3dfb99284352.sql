-- Allow authenticated users to create custom services
-- This enables contractors to add their own custom services when needed

-- Add INSERT policy for services table to allow authenticated users to create custom services
CREATE POLICY "Authenticated users can create custom services" 
ON public.services 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);