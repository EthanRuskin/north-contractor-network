-- Enable RLS on all unprotected tables
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homeowner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspiration_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspiration_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspiration_comment_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspiration_collection_projects ENABLE ROW LEVEL SECURITY;

-- Messages: Users can only see messages they sent or received
CREATE POLICY "Users can view their own messages" ON public.messages
FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON public.messages
FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their sent messages" ON public.messages
FOR UPDATE USING (auth.uid() = sender_id);

-- Projects: Users can view projects they created or are involved with
CREATE POLICY "Users can view their own projects" ON public.projects
FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Users can create projects" ON public.projects
FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their own projects" ON public.projects
FOR UPDATE USING (auth.uid() = client_id);

CREATE POLICY "Users can delete their own projects" ON public.projects
FOR DELETE USING (auth.uid() = client_id);

-- Reviews: Users can view reviews for their projects or reviews they wrote
CREATE POLICY "Users can view relevant reviews" ON public.reviews
FOR SELECT USING (
  auth.uid() = client_id OR 
  auth.uid() = contractor_id OR
  auth.uid() IN (
    SELECT client_id FROM public.projects WHERE id = project_id
  )
);

CREATE POLICY "Clients can create reviews" ON public.reviews
FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their own reviews" ON public.reviews
FOR UPDATE USING (auth.uid() = client_id);

-- Appointments: Users can see appointments where they are client or contractor
CREATE POLICY "Users can view their appointments" ON public.appointments
FOR SELECT USING (auth.uid() = client_id OR auth.uid() = contractor_id);

CREATE POLICY "Users can create appointments" ON public.appointments
FOR INSERT WITH CHECK (auth.uid() = client_id OR auth.uid() = contractor_id);

CREATE POLICY "Users can update their appointments" ON public.appointments
FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = contractor_id);

-- Project Bids: Users can see bids for their projects or bids they submitted
CREATE POLICY "Users can view relevant bids" ON public.project_bids
FOR SELECT USING (
  auth.uid() = contractor_id OR
  auth.uid() IN (
    SELECT client_id FROM public.projects WHERE id = project_id
  )
);

CREATE POLICY "Contractors can create bids" ON public.project_bids
FOR INSERT WITH CHECK (auth.uid() = contractor_id);

CREATE POLICY "Contractors can update their bids" ON public.project_bids
FOR UPDATE USING (auth.uid() = contractor_id);

-- Contractor Services: Contractors manage their own, others can read
CREATE POLICY "Everyone can view contractor services" ON public.contractor_services
FOR SELECT USING (true);

CREATE POLICY "Contractors can manage their services" ON public.contractor_services
FOR INSERT WITH CHECK (auth.uid() = contractor_id);

CREATE POLICY "Contractors can update their services" ON public.contractor_services
FOR UPDATE USING (auth.uid() = contractor_id);

CREATE POLICY "Contractors can delete their services" ON public.contractor_services
FOR DELETE USING (auth.uid() = contractor_id);

-- Service Areas: Same pattern
CREATE POLICY "Everyone can view service areas" ON public.service_areas
FOR SELECT USING (true);

CREATE POLICY "Contractors can manage their service areas" ON public.service_areas
FOR INSERT WITH CHECK (auth.uid() = contractor_id);

CREATE POLICY "Contractors can update their service areas" ON public.service_areas
FOR UPDATE USING (auth.uid() = contractor_id);

CREATE POLICY "Contractors can delete their service areas" ON public.service_areas
FOR DELETE USING (auth.uid() = contractor_id);

-- Contractor Licenses: Only contractors can see/manage their own
CREATE POLICY "Contractors can view their licenses" ON public.contractor_licenses
FOR SELECT USING (auth.uid() = contractor_id);

CREATE POLICY "Contractors can create licenses" ON public.contractor_licenses
FOR INSERT WITH CHECK (auth.uid() = contractor_id);

CREATE POLICY "Contractors can update their licenses" ON public.contractor_licenses
FOR UPDATE USING (auth.uid() = contractor_id);

CREATE POLICY "Contractors can delete their licenses" ON public.contractor_licenses
FOR DELETE USING (auth.uid() = contractor_id);

-- Portfolio Projects: Contractors manage their own, others can read
CREATE POLICY "Everyone can view portfolio projects" ON public.portfolio_projects
FOR SELECT USING (true);

CREATE POLICY "Contractors can create portfolio projects" ON public.portfolio_projects
FOR INSERT WITH CHECK (auth.uid() = contractor_id);

CREATE POLICY "Contractors can update their portfolio projects" ON public.portfolio_projects
FOR UPDATE USING (auth.uid() = contractor_id);

CREATE POLICY "Contractors can delete their portfolio projects" ON public.portfolio_projects
FOR DELETE USING (auth.uid() = contractor_id);

-- Gallery Images: Similar pattern
CREATE POLICY "Everyone can view gallery images" ON public.gallery_images
FOR SELECT USING (true);

CREATE POLICY "Contractors can create gallery images" ON public.gallery_images
FOR INSERT WITH CHECK (auth.uid() = contractor_id);

CREATE POLICY "Contractors can update their gallery images" ON public.gallery_images
FOR UPDATE USING (auth.uid() = contractor_id);

CREATE POLICY "Contractors can delete their gallery images" ON public.gallery_images
FOR DELETE USING (auth.uid() = contractor_id);

-- Business Hours: Contractors manage their own, others can read
CREATE POLICY "Everyone can view business hours" ON public.business_hours
FOR SELECT USING (true);

CREATE POLICY "Contractors can manage their business hours" ON public.business_hours
FOR INSERT WITH CHECK (auth.uid() = contractor_id);

CREATE POLICY "Contractors can update their business hours" ON public.business_hours
FOR UPDATE USING (auth.uid() = contractor_id);

CREATE POLICY "Contractors can delete their business hours" ON public.business_hours
FOR DELETE USING (auth.uid() = contractor_id);

-- Saved Contractors: Users can only see their own saved contractors
CREATE POLICY "Users can view their saved contractors" ON public.saved_contractors
FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Users can save contractors" ON public.saved_contractors
FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can delete their saved contractors" ON public.saved_contractors
FOR DELETE USING (auth.uid() = client_id);

-- Homeowner Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view their homeowner profile" ON public.homeowner_profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their homeowner profile" ON public.homeowner_profiles
FOR UPDATE USING (auth.uid() = id);

-- Inspiration features: Users can interact with their own content
CREATE POLICY "Users can view all inspiration likes" ON public.inspiration_likes
FOR SELECT USING (true);

CREATE POLICY "Users can like projects" ON public.inspiration_likes
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their likes" ON public.inspiration_likes
FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view all comments" ON public.inspiration_comments
FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON public.inspiration_comments
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their comments" ON public.inspiration_comments
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their comments" ON public.inspiration_comments
FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view all comment replies" ON public.inspiration_comment_replies
FOR SELECT USING (true);

CREATE POLICY "Users can create comment replies" ON public.inspiration_comment_replies
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their comment replies" ON public.inspiration_comment_replies
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their comment replies" ON public.inspiration_comment_replies
FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view collection projects" ON public.inspiration_collection_projects
FOR SELECT USING (true);

CREATE POLICY "Users can add to collections" ON public.inspiration_collection_projects
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can remove from collections" ON public.inspiration_collection_projects
FOR DELETE USING (true);

-- Create security audit log table
CREATE TABLE public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage audit logs" ON public.security_audit_log
FOR ALL USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Create rate limit log table
CREATE TABLE public.rate_limit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage rate limits" ON public.rate_limit_log
FOR ALL USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Add profiles INSERT policy (was missing)
CREATE POLICY "Users can create their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Fix handle_new_user function security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  -- Insert into profiles table with error handling
  BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, user_type)
    VALUES (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'first_name', ''),
      coalesce(new.raw_user_meta_data->>'last_name', ''),
      coalesce(new.raw_user_meta_data->>'user_type', 'homeowner')
    );
  EXCEPTION
    WHEN unique_violation THEN
      -- Profile already exists, do nothing
      RAISE LOG 'Profile already exists for user %', new.id;
    WHEN others THEN
      -- Log other errors but don't fail
      RAISE LOG 'Error creating profile for user %: %', new.id, SQLERRM;
  END;
  
  -- Create the appropriate profile type based on user_type
  DECLARE
    user_type_val TEXT;
  BEGIN
    user_type_val := coalesce(new.raw_user_meta_data->>'user_type', 'homeowner');
    
    IF user_type_val = 'contractor' THEN
      -- Insert contractor profile
      BEGIN
        INSERT INTO public.contractor_profiles (id, business_name, description)
        VALUES (new.id, '', '');
      EXCEPTION
        WHEN unique_violation THEN
          RAISE LOG 'Contractor profile already exists for user %', new.id;
        WHEN others THEN
          RAISE LOG 'Error creating contractor profile for user %: %', new.id, SQLERRM;
      END;
    ELSE
      -- Insert homeowner profile
      BEGIN
        INSERT INTO public.homeowner_profiles (id)
        VALUES (new.id);
      EXCEPTION
        WHEN unique_violation THEN
          RAISE LOG 'Homeowner profile already exists for user %', new.id;
        WHEN others THEN
          RAISE LOG 'Error creating homeowner profile for user %: %', new.id, SQLERRM;
      END;
    END IF;
  END;
  
  RETURN new;
END;
$function$;