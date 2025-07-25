-- Fix the ambiguous column reference in the review validation trigger
CREATE OR REPLACE FUNCTION public.validate_review_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  review_count_today integer;
  last_review_time timestamp with time zone;
  rate_limit_record record;
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
  SELECT rrl.review_count_today, rrl.last_review_at 
  INTO rate_limit_record
  FROM public.review_rate_limits rrl 
  WHERE rrl.user_id = NEW.reviewer_id;
  
  -- If user has rate limit record
  IF FOUND THEN
    -- Check if it's a new day
    IF date_trunc('day', rate_limit_record.last_review_at) = date_trunc('day', now()) THEN
      -- Same day, check if limit exceeded
      IF rate_limit_record.review_count_today >= 5 THEN
        RAISE EXCEPTION 'Daily review limit exceeded. Maximum 5 reviews per day.';
      END IF;
      
      -- Update count
      UPDATE public.review_rate_limits 
      SET review_count_today = rate_limit_record.review_count_today + 1,
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