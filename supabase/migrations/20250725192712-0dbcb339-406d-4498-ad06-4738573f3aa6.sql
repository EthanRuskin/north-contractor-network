-- Create rate limiting table for the edge function
CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_rate_limit_log_identifier_action_time 
ON public.rate_limit_log (identifier, action, created_at);

-- Enable RLS
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

-- Only allow system access (edge functions)
CREATE POLICY "System can manage rate limit logs" 
ON public.rate_limit_log 
FOR ALL 
USING (true);

-- Create triggers only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_contractor_businesses_search_vector') THEN
    CREATE TRIGGER update_contractor_businesses_search_vector
      BEFORE INSERT OR UPDATE ON public.contractor_businesses
      FOR EACH ROW
      EXECUTE FUNCTION public.update_contractor_search_vector();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_contractor_stats_on_review_change') THEN
    CREATE TRIGGER update_contractor_stats_on_review_change
      AFTER INSERT OR UPDATE OR DELETE ON public.reviews
      FOR EACH ROW
      EXECUTE FUNCTION public.update_contractor_review_stats();
  END IF;
END $$;