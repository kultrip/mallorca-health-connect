-- ============ PROFILE VIEWS (Analytics) ============
CREATE TABLE public.profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a view (anonymous)
CREATE POLICY "profile_views_insert_anyone" ON public.profile_views FOR INSERT WITH CHECK (true);

-- Only admins and the owner can see the views
CREATE POLICY "profile_views_read_owner" ON public.profile_views FOR SELECT USING (
  public.has_role(auth.uid(), 'admin') OR 
  EXISTS (SELECT 1 FROM public.therapists t WHERE t.id = therapist_id AND t.user_id = auth.uid())
);

-- Helper function to track a view safely
CREATE OR REPLACE FUNCTION public.track_profile_view(_therapist_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profile_views (therapist_id) VALUES (_therapist_id);
END;
$$;
