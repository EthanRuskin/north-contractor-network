-- Create RPC function for contractor search with ranking
CREATE OR REPLACE FUNCTION public.search_contractors_with_ranking(
  search_query text DEFAULT NULL,
  service_filter uuid DEFAULT NULL,
  city_filter text DEFAULT NULL,
  province_filter text DEFAULT NULL,
  min_rating_filter numeric DEFAULT 0,
  min_experience_filter integer DEFAULT 0
)
RETURNS TABLE (
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
  search_ranking_score numeric
) AS $$
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
    END DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant permission to use the search function
GRANT EXECUTE ON FUNCTION public.search_contractors_with_ranking TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.search_contractors_with_ranking IS 'Advanced contractor search with keyword ranking, filtering by service, location, rating, and experience';