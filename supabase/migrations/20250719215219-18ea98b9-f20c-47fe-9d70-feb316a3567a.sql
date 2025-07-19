-- Create projects table for contractors
CREATE TABLE public.contractor_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_contractor_projects_contractor 
    FOREIGN KEY (contractor_id) 
    REFERENCES public.contractor_businesses(id) 
    ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.contractor_projects ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
CREATE POLICY "Anyone can view contractor projects" 
ON public.contractor_projects 
FOR SELECT 
USING (true);

CREATE POLICY "Contractors can manage their own projects" 
ON public.contractor_projects 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.contractor_businesses 
    WHERE id = contractor_projects.contractor_id 
    AND user_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_contractor_projects_updated_at
BEFORE UPDATE ON public.contractor_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();