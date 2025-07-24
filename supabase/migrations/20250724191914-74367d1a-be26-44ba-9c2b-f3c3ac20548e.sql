-- Critical Security Fix 1: Remove the SECURITY DEFINER view and recreate it properly
DROP VIEW IF EXISTS public.contractor_search_results;

-- Critical Security Fix 2: Add security hardening to all database functions
-- Update calculate_contractor_ranking function with security hardening
CREATE OR REPLACE FUNCTION public.calculate_contractor_ranking(contractor_row contractor_businesses, search_query text DEFAULT NULL::text)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
 SET search_path = ''
AS $function$
DECLARE
  keyword_score numeric := 0;
  review_score numeric := 0;
  profile_score numeric := 0;
  experience_score numeric := 0;
  total_score numeric := 0;
BEGIN
  -- Input validation
  IF contractor_row IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Keyword relevance score (40% weight)
  IF search_query IS NOT NULL AND search_query != '' THEN
    -- Sanitize search query length to prevent abuse
    IF length(search_query) > 100 THEN
      search_query := substring(search_query from 1 for 100);
    END IF;
    
    keyword_score := COALESCE(
      ts_rank_cd(contractor_row.search_vector, plainto_tsquery('english', search_query)) * 40,
      0
    );
  ELSE
    keyword_score := 10; -- Base score when no search query
  END IF;
  
  -- Review and rating score (25% weight)
  review_score := LEAST(
    (COALESCE(contractor_row.rating, 0) * 2) + 
    (COALESCE(contractor_row.review_count, 0) * 0.5),
    25
  );
  
  -- Profile completeness score (20% weight)
  profile_score := (
    CASE WHEN contractor_row.description IS NOT NULL AND length(contractor_row.description) >= 50 THEN 5 ELSE 0 END +
    CASE WHEN contractor_row.gallery_images IS NOT NULL AND array_length(contractor_row.gallery_images, 1) > 0 THEN 5 ELSE 0 END +
    CASE WHEN contractor_row.phone IS NOT NULL THEN 2 ELSE 0 END +
    CASE WHEN contractor_row.email IS NOT NULL THEN 2 ELSE 0 END +
    CASE WHEN contractor_row.website IS NOT NULL THEN 2 ELSE 0 END +
    CASE WHEN contractor_row.license_number IS NOT NULL THEN 2 ELSE 0 END +
    CASE WHEN contractor_row.business_hours IS NOT NULL THEN 2 ELSE 0 END
  );
  
  -- Experience score (5% weight)
  experience_score := LEAST(COALESCE(contractor_row.years_experience, 0) * 0.5, 5);
  
  -- Calculate total score
  total_score := keyword_score + review_score + profile_score + experience_score;
  
  RETURN GREATEST(total_score, 0);
END;
$function$;

-- Update search_contractors_with_ranking function with security hardening
CREATE OR REPLACE FUNCTION public.search_contractors_with_ranking(search_query text DEFAULT NULL::text, service_filter uuid DEFAULT NULL::uuid, city_filter text DEFAULT NULL::text, province_filter text DEFAULT NULL::text, min_rating_filter numeric DEFAULT 0, min_experience_filter integer DEFAULT 0)
 RETURNS TABLE(id uuid, business_name text, description text, phone text, email text, website text, city text, province text, years_experience integer, rating numeric, review_count integer, logo_url text, gallery_images text[], service_ids uuid[], service_names text[], base_ranking_score numeric, search_ranking_score numeric)
 LANGUAGE plpgsql
 STABLE
 SET search_path = ''
AS $function$
BEGIN
  -- Input validation and sanitization
  IF search_query IS NOT NULL AND length(search_query) > 100 THEN
    search_query := substring(search_query from 1 for 100);
  END IF;
  
  IF city_filter IS NOT NULL AND length(city_filter) > 50 THEN
    city_filter := substring(city_filter from 1 for 50);
  END IF;
  
  IF province_filter IS NOT NULL AND length(province_filter) > 50 THEN
    province_filter := substring(province_filter from 1 for 50);
  END IF;
  
  -- Validate numeric inputs
  min_rating_filter := COALESCE(GREATEST(min_rating_filter, 0), 0);
  min_experience_filter := COALESCE(GREATEST(min_experience_filter, 0), 0);
  
  RETURN QUERY
  SELECT 
    cb.id,
    cb.business_name,
    cb.description,
    cb.phone,
    cb.email,
    cb.website,
    cb.city,
    cb.province,
    cb.years_experience,
    cb.rating,
    cb.review_count,
    cb.logo_url,
    cb.gallery_images,
    cs.service_ids,
    cs.service_names,
    public.calculate_contractor_ranking(cb, NULL) as base_ranking_score,
    public.calculate_contractor_ranking(cb, search_query) as search_ranking_score
  FROM public.contractor_businesses cb
  LEFT JOIN (
    SELECT 
      contractor_id,
      array_agg(service_id) as service_ids,
      array_agg(s.name) as service_names
    FROM public.contractor_services cs_inner
    JOIN public.services s ON cs_inner.service_id = s.id
    GROUP BY contractor_id
  ) cs ON cb.id = cs.contractor_id
  WHERE 
    cb.status = 'approved'
    AND (search_query IS NULL OR cb.search_vector @@ plainto_tsquery('english', search_query))
    AND (service_filter IS NULL OR service_filter = ANY(cs.service_ids))
    AND (city_filter IS NULL OR cb.city ILIKE '%' || city_filter || '%')
    AND (province_filter IS NULL OR cb.province ILIKE '%' || province_filter || '%')
    AND cb.rating >= min_rating_filter
    AND cb.years_experience >= min_experience_filter
  ORDER BY 
    CASE 
      WHEN search_query IS NOT NULL THEN public.calculate_contractor_ranking(cb, search_query)
      ELSE public.calculate_contractor_ranking(cb, NULL)
    END DESC
  LIMIT 100; -- Add reasonable limit to prevent resource exhaustion
END;
$function$;

-- Update search_contractors_with_location function with security hardening
CREATE OR REPLACE FUNCTION public.search_contractors_with_location(search_query text DEFAULT NULL::text, service_filter uuid DEFAULT NULL::uuid, city_filter text DEFAULT NULL::text, province_filter text DEFAULT NULL::text, min_rating_filter numeric DEFAULT 0, min_experience_filter integer DEFAULT 0, user_latitude numeric DEFAULT NULL::numeric, user_longitude numeric DEFAULT NULL::numeric, radius_km numeric DEFAULT 50)
 RETURNS TABLE(id uuid, business_name text, description text, phone text, email text, website text, city text, province text, years_experience integer, rating numeric, review_count integer, logo_url text, gallery_images text[], service_ids uuid[], service_names text[], base_ranking_score numeric, search_ranking_score numeric, latitude numeric, longitude numeric, distance_km numeric)
 LANGUAGE plpgsql
 STABLE
 SET search_path = ''
AS $function$
BEGIN
  -- Input validation and sanitization
  IF search_query IS NOT NULL AND length(search_query) > 100 THEN
    search_query := substring(search_query from 1 for 100);
  END IF;
  
  IF city_filter IS NOT NULL AND length(city_filter) > 50 THEN
    city_filter := substring(city_filter from 1 for 50);
  END IF;
  
  IF province_filter IS NOT NULL AND length(province_filter) > 50 THEN
    province_filter := substring(province_filter from 1 for 50);
  END IF;
  
  -- Validate numeric inputs
  min_rating_filter := COALESCE(GREATEST(min_rating_filter, 0), 0);
  min_experience_filter := COALESCE(GREATEST(min_experience_filter, 0), 0);
  
  -- Validate coordinates and radius
  IF user_latitude IS NOT NULL AND (user_latitude < -90 OR user_latitude > 90) THEN
    user_latitude := NULL;
  END IF;
  
  IF user_longitude IS NOT NULL AND (user_longitude < -180 OR user_longitude > 180) THEN
    user_longitude := NULL;
  END IF;
  
  radius_km := COALESCE(LEAST(GREATEST(radius_km, 1), 500), 50); -- Limit radius between 1-500km
  
  RETURN QUERY
  SELECT 
    cb.id,
    cb.business_name,
    cb.description,
    cb.phone,
    cb.email,
    cb.website,
    cb.city,
    cb.province,
    cb.years_experience,
    cb.rating,
    cb.review_count,
    cb.logo_url,
    cb.gallery_images,
    cs.service_ids,
    cs.service_names,
    public.calculate_contractor_ranking(cb, NULL) as base_ranking_score,
    public.calculate_contractor_ranking(cb, search_query) as search_ranking_score,
    cb.latitude,
    cb.longitude,
    CASE 
      WHEN user_latitude IS NOT NULL AND user_longitude IS NOT NULL AND cb.latitude IS NOT NULL AND cb.longitude IS NOT NULL
      THEN public.calculate_distance(user_latitude, user_longitude, cb.latitude, cb.longitude)
      ELSE NULL
    END as distance_km
  FROM public.contractor_businesses cb
  LEFT JOIN (
    SELECT 
      contractor_id,
      array_agg(service_id) as service_ids,
      array_agg(s.name) as service_names
    FROM public.contractor_services cs_inner
    JOIN public.services s ON cs_inner.service_id = s.id
    GROUP BY contractor_id
  ) cs ON cb.id = cs.contractor_id
  WHERE 
    cb.status = 'approved'
    AND (search_query IS NULL OR cb.search_vector @@ plainto_tsquery('english', search_query))
    AND (service_filter IS NULL OR service_filter = ANY(cs.service_ids))
    AND (city_filter IS NULL OR cb.city ILIKE '%' || city_filter || '%')
    AND (province_filter IS NULL OR cb.province ILIKE '%' || province_filter || '%')
    AND cb.rating >= min_rating_filter
    AND cb.years_experience >= min_experience_filter
    AND (
      user_latitude IS NULL OR user_longitude IS NULL OR cb.latitude IS NULL OR cb.longitude IS NULL
      OR public.calculate_distance(user_latitude, user_longitude, cb.latitude, cb.longitude) <= radius_km
    )
  ORDER BY 
    CASE 
      WHEN user_latitude IS NOT NULL AND user_longitude IS NOT NULL AND cb.latitude IS NOT NULL AND cb.longitude IS NOT NULL
      THEN public.calculate_distance(user_latitude, user_longitude, cb.latitude, cb.longitude)
      ELSE 999999
    END ASC,
    CASE 
      WHEN search_query IS NOT NULL THEN public.calculate_contractor_ranking(cb, search_query)
      ELSE public.calculate_contractor_ranking(cb, NULL)
    END DESC
  LIMIT 100; -- Add reasonable limit to prevent resource exhaustion
END;
$function$;

-- Update calculate_distance function with security hardening
CREATE OR REPLACE FUNCTION public.calculate_distance(lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric)
 RETURNS numeric
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path = ''
AS $function$
DECLARE
  radius NUMERIC := 6371; -- Earth's radius in kilometers
  dlat NUMERIC;
  dlon NUMERIC;
  a NUMERIC;
  c NUMERIC;
BEGIN
  -- Handle NULL coordinates
  IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
    RETURN NULL;
  END IF;

  -- Validate coordinate ranges
  IF lat1 < -90 OR lat1 > 90 OR lat2 < -90 OR lat2 > 90 THEN
    RETURN NULL;
  END IF;
  
  IF lon1 < -180 OR lon1 > 180 OR lon2 < -180 OR lon2 > 180 THEN
    RETURN NULL;
  END IF;

  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  
  a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN radius * c;
END;
$function$;

-- Update update_contractor_search_vector function with security hardening
CREATE OR REPLACE FUNCTION public.update_contractor_search_vector()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Input validation
  IF NEW IS NULL THEN
    RETURN NEW;
  END IF;
  
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.business_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.province, '')), 'D');
  RETURN NEW;
END;
$function$;

-- Update handle_new_user function with security hardening
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Input validation
  IF NEW.id IS NULL OR NEW.email IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Validate email format (basic check)
  IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN NEW;
  END IF;
  
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name')
  );
  RETURN NEW;
END;
$function$;

-- Critical Security Fix 3: Add duplicate review prevention
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_unique_contractor_reviewer 
ON public.reviews (contractor_id, reviewer_id);

-- Critical Security Fix 4: Add rate limiting table for reviews
CREATE TABLE IF NOT EXISTS public.review_rate_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  last_review_at timestamp with time zone NOT NULL DEFAULT now(),
  review_count_today integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on rate limits table
ALTER TABLE public.review_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS policy for rate limits
CREATE POLICY "Users can manage their own rate limits" ON public.review_rate_limits
FOR ALL USING (auth.uid() = user_id);

-- Add trigger to update review statistics
CREATE OR REPLACE FUNCTION public.update_contractor_review_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Update contractor rating and review count
  UPDATE public.contractor_businesses 
  SET 
    rating = (
      SELECT ROUND(AVG(rating::numeric), 1)
      FROM public.reviews 
      WHERE contractor_id = COALESCE(NEW.contractor_id, OLD.contractor_id)
    ),
    review_count = (
      SELECT COUNT(*)
      FROM public.reviews 
      WHERE contractor_id = COALESCE(NEW.contractor_id, OLD.contractor_id)
    )
  WHERE id = COALESCE(NEW.contractor_id, OLD.contractor_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create trigger for review stats updates
DROP TRIGGER IF EXISTS update_contractor_review_stats_trigger ON public.reviews;
CREATE TRIGGER update_contractor_review_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_contractor_review_stats();