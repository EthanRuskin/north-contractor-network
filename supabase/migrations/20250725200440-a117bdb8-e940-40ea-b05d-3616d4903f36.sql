-- Enhanced SEO ranking algorithm for contractor businesses
-- Incorporates: profile completeness, review activity, content quality, projects, and consistency

CREATE OR REPLACE FUNCTION public.calculate_contractor_ranking(contractor_row contractor_businesses, search_query text DEFAULT NULL::text)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
 SET search_path TO ''
AS $function$
DECLARE
  keyword_score numeric := 0;
  review_score numeric := 0;
  profile_score numeric := 0;
  experience_score numeric := 0;
  activity_score numeric := 0;
  content_quality_score numeric := 0;
  projects_score numeric := 0;
  consistency_score numeric := 0;
  total_score numeric := 0;
  recent_reviews_count integer := 0;
  projects_count integer := 0;
  projects_with_images_count integer := 0;
  avg_days_between_reviews numeric := 0;
BEGIN
  -- Input validation
  IF contractor_row IS NULL THEN
    RETURN 0;
  END IF;
  
  -- 1. Keyword relevance score (25% weight - reduced to make room for other factors)
  IF search_query IS NOT NULL AND search_query != '' THEN
    IF length(search_query) > 100 THEN
      search_query := substring(search_query from 1 for 100);
    END IF;
    
    keyword_score := COALESCE(
      ts_rank_cd(contractor_row.search_vector, plainto_tsquery('english', search_query)) * 25,
      0
    );
  ELSE
    keyword_score := 8; -- Base score when no search query
  END IF;
  
  -- 2. Review and rating score (20% weight)
  review_score := LEAST(
    (COALESCE(contractor_row.rating, 0) * 3) + 
    (COALESCE(contractor_row.review_count, 0) * 0.3),
    20
  );
  
  -- 3. Enhanced profile completeness score (15% weight)
  profile_score := (
    -- Basic contact info (6 points)
    CASE WHEN contractor_row.phone IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN contractor_row.email IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN contractor_row.website IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN contractor_row.address IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN contractor_row.city IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN contractor_row.province IS NOT NULL THEN 1 ELSE 0 END +
    
    -- Business details (4 points)
    CASE WHEN contractor_row.license_number IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN contractor_row.business_hours IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN contractor_row.years_experience IS NOT NULL AND contractor_row.years_experience > 0 THEN 1 ELSE 0 END +
    CASE WHEN contractor_row.logo_url IS NOT NULL THEN 1 ELSE 0 END +
    
    -- Visual content (3 points)
    CASE WHEN contractor_row.gallery_images IS NOT NULL AND array_length(contractor_row.gallery_images, 1) >= 3 THEN 2 ELSE 0 END +
    CASE WHEN contractor_row.gallery_images IS NOT NULL AND array_length(contractor_row.gallery_images, 1) >= 1 THEN 1 ELSE 0 END +
    
    -- Verification (2 points)
    CASE WHEN contractor_row.google_business_verified = true THEN 1 ELSE 0 END +
    CASE WHEN contractor_row.insurance_verified = true THEN 1 ELSE 0 END
  );
  
  -- 4. Content quality score (15% weight) - detailed description
  content_quality_score := CASE
    WHEN contractor_row.description IS NULL THEN 0
    WHEN length(contractor_row.description) >= 500 THEN 15
    WHEN length(contractor_row.description) >= 300 THEN 12
    WHEN length(contractor_row.description) >= 150 THEN 8
    WHEN length(contractor_row.description) >= 50 THEN 4
    ELSE 1
  END;
  
  -- 5. Projects score (10% weight) - number of projects with images
  SELECT 
    COUNT(*) as total_projects,
    COUNT(CASE WHEN p.images IS NOT NULL AND array_length(p.images, 1) > 0 THEN 1 END) as projects_with_images
  INTO projects_count, projects_with_images_count
  FROM public.contractor_projects p 
  WHERE p.contractor_id = contractor_row.id;
  
  projects_score := LEAST(
    (projects_with_images_count * 2) + (projects_count * 0.5),
    10
  );
  
  -- 6. Recent activity score (10% weight) - consistent recent reviews
  SELECT COUNT(*)
  INTO recent_reviews_count
  FROM public.reviews r 
  WHERE r.contractor_id = contractor_row.id 
    AND r.created_at >= NOW() - INTERVAL '6 months';
  
  activity_score := LEAST(recent_reviews_count * 1.5, 10);
  
  -- 7. Review consistency score (5% weight) - regular review pattern
  SELECT 
    CASE 
      WHEN COUNT(*) < 2 THEN 0
      ELSE EXTRACT(DAYS FROM (MAX(created_at) - MIN(created_at))) / NULLIF(COUNT(*) - 1, 0)
    END
  INTO avg_days_between_reviews
  FROM public.reviews r 
  WHERE r.contractor_id = contractor_row.id 
    AND r.created_at >= NOW() - INTERVAL '1 year';
  
  consistency_score := CASE
    WHEN avg_days_between_reviews = 0 THEN 0
    WHEN avg_days_between_reviews <= 30 THEN 5
    WHEN avg_days_between_reviews <= 60 THEN 4
    WHEN avg_days_between_reviews <= 90 THEN 3
    WHEN avg_days_between_reviews <= 180 THEN 2
    ELSE 1
  END;
  
  -- Calculate total score (sum of all weighted factors = 100%)
  total_score := keyword_score + review_score + profile_score + content_quality_score + 
                 projects_score + activity_score + consistency_score;
  
  RETURN GREATEST(total_score, 0);
END;
$function$;