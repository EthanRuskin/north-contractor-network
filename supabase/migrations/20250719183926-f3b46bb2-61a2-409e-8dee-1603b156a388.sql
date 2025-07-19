-- Create storage bucket for contractor galleries
INSERT INTO storage.buckets (id, name, public) VALUES ('contractor-galleries', 'contractor-galleries', true);

-- Create policies for contractor gallery uploads
CREATE POLICY "Anyone can view contractor gallery images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'contractor-galleries');

CREATE POLICY "Contractors can upload gallery images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'contractor-galleries' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Contractors can update their gallery images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'contractor-galleries' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Contractors can delete their gallery images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'contractor-galleries' AND 
  auth.uid() IS NOT NULL
);