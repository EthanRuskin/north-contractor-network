-- Add latitude and longitude columns to contractor_businesses table
ALTER TABLE public.contractor_businesses 
ADD COLUMN latitude NUMERIC,
ADD COLUMN longitude NUMERIC;

-- Create index for efficient geospatial queries
CREATE INDEX idx_contractor_businesses_location 
ON public.contractor_businesses USING btree (latitude, longitude);

-- Create function to calculate distance between two points using Haversine formula
CREATE OR REPLACE FUNCTION public.calculate_distance(
  lat1 NUMERIC, 
  lon1 NUMERIC, 
  lat2 NUMERIC, 
  lon2 NUMERIC
) RETURNS NUMERIC AS $$
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

  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  
  a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN radius * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update the search function to include radius-based filtering
CREATE OR REPLACE FUNCTION public.search_contractors_with_location(
  search_query text DEFAULT NULL,
  service_filter uuid DEFAULT NULL,
  city_filter text DEFAULT NULL,
  province_filter text DEFAULT NULL,
  min_rating_filter numeric DEFAULT 0,
  min_experience_filter integer DEFAULT 0,
  user_latitude NUMERIC DEFAULT NULL,
  user_longitude NUMERIC DEFAULT NULL,
  radius_km NUMERIC DEFAULT 50
) RETURNS TABLE(
  id uuid,
  business_name text,
  description text,
  phone text,
  email text,
  website text,
  city text,
  province text,
  years_experience integer,
  rating numeric,
  review_count integer,
  logo_url text,
  gallery_images text[],
  service_ids uuid[],
  service_names text[],
  base_ranking_score numeric,
  search_ranking_score numeric,
  latitude NUMERIC,
  longitude NUMERIC,
  distance_km NUMERIC
) LANGUAGE plpgsql STABLE AS $$
BEGIN
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
    END DESC;
END;
$$;