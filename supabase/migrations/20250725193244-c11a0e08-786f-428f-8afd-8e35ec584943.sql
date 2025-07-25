-- Add anonymous option to reviews table
ALTER TABLE public.reviews 
ADD COLUMN is_anonymous boolean DEFAULT false;