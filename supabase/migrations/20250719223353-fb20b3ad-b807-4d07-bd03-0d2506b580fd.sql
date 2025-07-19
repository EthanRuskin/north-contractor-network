
-- Add Google Business Profile verification fields to contractor_businesses table
ALTER TABLE public.contractor_businesses 
ADD COLUMN google_business_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN google_place_id TEXT,
ADD COLUMN google_verification_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN google_business_url TEXT;

-- Add comment to explain the new fields
COMMENT ON COLUMN public.contractor_businesses.google_business_verified IS 'Whether the business has been verified through Google Business Profile';
COMMENT ON COLUMN public.contractor_businesses.google_place_id IS 'Google Places API Place ID for the business';
COMMENT ON COLUMN public.contractor_businesses.google_verification_date IS 'When the Google verification was completed';
COMMENT ON COLUMN public.contractor_businesses.google_business_url IS 'URL to the Google Business Profile page';
