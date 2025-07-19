-- Add business hours to contractor_businesses table
ALTER TABLE public.contractor_businesses 
ADD COLUMN business_hours JSONB DEFAULT '{
  "monday": {"open": "08:00", "close": "18:00", "closed": false},
  "tuesday": {"open": "08:00", "close": "18:00", "closed": false},
  "wednesday": {"open": "08:00", "close": "18:00", "closed": false},
  "thursday": {"open": "08:00", "close": "18:00", "closed": false},
  "friday": {"open": "08:00", "close": "18:00", "closed": false},
  "saturday": {"open": "09:00", "close": "16:00", "closed": false},
  "sunday": {"open": "09:00", "close": "16:00", "closed": true}
}';

-- Add comment to explain the structure
COMMENT ON COLUMN public.contractor_businesses.business_hours IS 'Business hours stored as JSON with days of week, each containing open/close times and closed status';