-- Add search capabilities and ranking system to contractor_businesses table

-- Add search vector column for full-text search optimization
ALTER TABLE public.contractor_businesses 
ADD COLUMN search_vector tsvector;

-- Create index for full-text search performance
CREATE INDEX idx_contractor_businesses_search_vector ON public.contractor_businesses USING gin(search_vector);

-- Create function to update search vector
CREATE OR REPLACE FUNCTION public.update_contractor_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.business_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.province, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search vector
CREATE TRIGGER update_contractor_search_vector_trigger
BEFORE INSERT OR UPDATE ON public.contractor_businesses
FOR EACH ROW EXECUTE FUNCTION public.update_contractor_search_vector();

-- Update existing records with search vectors
UPDATE public.contractor_businesses 
SET search_vector = 
  setweight(to_tsvector('english', COALESCE(business_name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(city, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(province, '')), 'D');

-- Create ranking function that calculates contractor score
CREATE OR REPLACE FUNCTION public.calculate_contractor_ranking(
  contractor_row public.contractor_businesses,
  search_query text DEFAULT NULL
)
RETURNS numeric AS $$
DECLARE
  keyword_score numeric := 0;
  review_score numeric := 0;
  profile_score numeric := 0;
  experience_score numeric := 0;
  total_score numeric := 0;
BEGIN
  -- Keyword relevance score (40% weight)
  IF search_query IS NOT NULL AND search_query != '' THEN
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
$$ LANGUAGE plpgsql STABLE;

-- Create view for contractor search with ranking
CREATE OR REPLACE VIEW public.contractor_search_results AS
SELECT 
  cb.*,
  cs.service_ids,
  cs.service_names,
  public.calculate_contractor_ranking(cb, NULL) as base_ranking_score
FROM public.contractor_businesses cb
LEFT JOIN (
  SELECT 
    contractor_id,
    array_agg(service_id) as service_ids,
    array_agg(s.name) as service_names
  FROM public.contractor_services cs
  JOIN public.services s ON cs.service_id = s.id
  GROUP BY contractor_id
) cs ON cb.id = cs.contractor_id
WHERE cb.status = 'approved';

-- Add comments for documentation
COMMENT ON FUNCTION public.calculate_contractor_ranking IS 'Calculates ranking score for contractors based on keyword relevance, reviews, profile completeness, and experience';
COMMENT ON FUNCTION public.update_contractor_search_vector IS 'Updates the search vector for full-text search on contractor businesses';
COMMENT ON VIEW public.contractor_search_results IS 'View combining contractor businesses with their services and base ranking scores';

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.calculate_contractor_ranking TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_contractor_search_vector TO authenticated;
GRANT SELECT ON public.contractor_search_results TO authenticated;