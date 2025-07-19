-- Add social media URL fields to contractor_businesses table
ALTER TABLE public.contractor_businesses 
ADD COLUMN instagram_url TEXT,
ADD COLUMN facebook_url TEXT,
ADD COLUMN linkedin_url TEXT,
ADD COLUMN tiktok_url TEXT,
ADD COLUMN x_url TEXT,
ADD COLUMN youtube_url TEXT;

-- Add comments to explain the new fields
COMMENT ON COLUMN public.contractor_businesses.instagram_url IS 'Instagram profile URL';
COMMENT ON COLUMN public.contractor_businesses.facebook_url IS 'Facebook page URL';
COMMENT ON COLUMN public.contractor_businesses.linkedin_url IS 'LinkedIn profile URL';
COMMENT ON COLUMN public.contractor_businesses.tiktok_url IS 'TikTok profile URL';
COMMENT ON COLUMN public.contractor_businesses.x_url IS 'X (Twitter) profile URL';
COMMENT ON COLUMN public.contractor_businesses.youtube_url IS 'YouTube channel URL';