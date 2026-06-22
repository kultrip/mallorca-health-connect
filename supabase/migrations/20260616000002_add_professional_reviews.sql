CREATE TABLE IF NOT EXISTS public.professional_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  reviewer_email TEXT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.professional_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "professional_reviews_public_insert"
  ON public.professional_reviews
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "professional_reviews_public_select_published"
  ON public.professional_reviews
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "professional_reviews_admin_select"
  ON public.professional_reviews
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "professional_reviews_admin_update"
  ON public.professional_reviews
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "professional_reviews_admin_delete"
  ON public.professional_reviews
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_professional_reviews_therapist_published_created_at
  ON public.professional_reviews (therapist_id, is_published, created_at DESC);
