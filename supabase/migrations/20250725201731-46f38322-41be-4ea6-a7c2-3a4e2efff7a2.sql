-- Add features column to contractor_businesses table
ALTER TABLE public.contractor_businesses 
ADD COLUMN features TEXT[] DEFAULT '{}';

-- Update the column to have a better default and comment
COMMENT ON COLUMN public.contractor_businesses.features IS 'Array of business features/amenities offered by the contractor';