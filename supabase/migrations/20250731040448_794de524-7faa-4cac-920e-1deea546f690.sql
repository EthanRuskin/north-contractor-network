-- Fix remaining tables that need RLS enabled
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_area_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspiration_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspiration_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_certifications ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for public data tables
CREATE POLICY "Everyone can view services" ON public.services
FOR SELECT USING (true);

CREATE POLICY "Everyone can view categories" ON public.categories
FOR SELECT USING (true);

CREATE POLICY "Everyone can view certifications" ON public.certifications
FOR SELECT USING (true);

CREATE POLICY "Everyone can view service area cities" ON public.service_area_cities
FOR SELECT USING (true);

CREATE POLICY "Everyone can view inspiration collections" ON public.inspiration_collections
FOR SELECT USING (true);

CREATE POLICY "Everyone can view inspiration projects" ON public.inspiration_projects
FOR SELECT USING (true);

CREATE POLICY "Everyone can view contractor certifications" ON public.contractor_certifications
FOR SELECT USING (true);

-- Fix the remaining database functions to have secure search_path
CREATE OR REPLACE FUNCTION public.increment(x integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  RETURN x + 1;
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrement(x integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  RETURN GREATEST(0, x - 1);
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;