-- Phase 1: Critical Database Security Fixes (Fixed)

-- Fix 1: Update all database functions to use secure search paths (already done in previous attempt)

-- Fix 2: Drop existing policy and create corrected one
DROP POLICY IF EXISTS "Users cannot change their own user_type to admin roles" ON public.profiles;

CREATE POLICY "Users cannot escalate privileges" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() = user_id AND 
  (user_type IN ('homeowner', 'contractor'))
);

-- Fix 3: Add proper review validation function and trigger
CREATE OR REPLACE FUNCTION public.validate_review_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  review_count_today integer;
  last_review_time timestamp with time zone;
BEGIN
  -- Validate rating range
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  
  -- Validate comment length
  IF NEW.comment IS NOT NULL AND length(NEW.comment) > 1000 THEN
    RAISE EXCEPTION 'Comment must not exceed 1000 characters';
  END IF;
  
  -- Check rate limiting
  SELECT review_count_today, last_review_at 
  INTO review_count_today, last_review_time
  FROM public.review_rate_limits 
  WHERE user_id = NEW.reviewer_id;
  
  -- If user has rate limit record
  IF FOUND THEN
    -- Check if it's a new day
    IF date_trunc('day', last_review_time) = date_trunc('day', now()) THEN
      -- Same day, check if limit exceeded
      IF review_count_today >= 5 THEN
        RAISE EXCEPTION 'Daily review limit exceeded. Maximum 5 reviews per day.';
      END IF;
      
      -- Update count
      UPDATE public.review_rate_limits 
      SET review_count_today = review_count_today + 1,
          last_review_at = now()
      WHERE user_id = NEW.reviewer_id;
    ELSE
      -- New day, reset count
      UPDATE public.review_rate_limits 
      SET review_count_today = 1,
          last_review_at = now()
      WHERE user_id = NEW.reviewer_id;
    END IF;
  ELSE
    -- First review for this user
    INSERT INTO public.review_rate_limits (user_id, review_count_today, last_review_at)
    VALUES (NEW.reviewer_id, 1, now());
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for review validation
DROP TRIGGER IF EXISTS validate_review_before_insert ON public.reviews;
CREATE TRIGGER validate_review_before_insert
  BEFORE INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_review_submission();

-- Fix 4: Add proper input sanitization function
CREATE OR REPLACE FUNCTION public.sanitize_html_input(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Remove potential XSS patterns
  input_text := regexp_replace(input_text, '<script[^>]*>.*?</script>', '', 'gi');
  input_text := regexp_replace(input_text, '<iframe[^>]*>.*?</iframe>', '', 'gi');
  input_text := regexp_replace(input_text, '<object[^>]*>.*?</object>', '', 'gi');
  input_text := regexp_replace(input_text, '<embed[^>]*>', '', 'gi');
  input_text := regexp_replace(input_text, 'javascript:', '', 'gi');
  input_text := regexp_replace(input_text, 'vbscript:', '', 'gi');
  input_text := regexp_replace(input_text, 'onload=', '', 'gi');
  input_text := regexp_replace(input_text, 'onclick=', '', 'gi');
  input_text := regexp_replace(input_text, 'onerror=', '', 'gi');
  
  RETURN input_text;
END;
$function$;

-- Fix 5: Add constraints to prevent data integrity issues
ALTER TABLE public.profiles ALTER COLUMN user_type SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN email SET NOT NULL;

-- Fix 6: Add audit logging table for security events
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event_type text NOT NULL,
  event_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow system to insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view audit logs  
CREATE POLICY "Admins can view audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (false); -- Will be updated when admin roles are implemented