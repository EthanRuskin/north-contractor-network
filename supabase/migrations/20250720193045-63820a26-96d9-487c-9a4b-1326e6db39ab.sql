-- Create saved contractors table for homeowners to save contractors
CREATE TABLE public.saved_contractors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  contractor_id uuid NOT NULL REFERENCES public.contractor_businesses(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, contractor_id)
);

-- Enable RLS
ALTER TABLE public.saved_contractors ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own saved contractors" 
ON public.saved_contractors 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can save contractors" 
ON public.saved_contractors 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave contractors" 
ON public.saved_contractors 
FOR DELETE 
USING (auth.uid() = user_id);