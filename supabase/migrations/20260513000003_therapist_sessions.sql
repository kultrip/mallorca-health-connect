CREATE TABLE IF NOT EXISTS public.therapist_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(trim(name)) > 0),
  duration TEXT,
  price_cents INTEGER CHECK (price_cents IS NULL OR price_cents >= 0),
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS therapist_sessions_therapist_id_idx
  ON public.therapist_sessions(therapist_id);

CREATE INDEX IF NOT EXISTS therapist_sessions_order_idx
  ON public.therapist_sessions(therapist_id, position, created_at);

ALTER TABLE public.therapist_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "therapist_sessions_public_read"
  ON public.therapist_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.therapists t
      WHERE t.id = therapist_sessions.therapist_id
        AND (
          t.status = 'published'
          OR t.user_id = auth.uid()
          OR public.has_role(auth.uid(), 'admin'::app_role)
        )
    )
  );

CREATE POLICY "therapist_sessions_owner_admin_insert"
  ON public.therapist_sessions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.therapists t
      WHERE t.id = therapist_sessions.therapist_id
        AND (
          t.user_id = auth.uid()
          OR public.has_role(auth.uid(), 'admin'::app_role)
        )
    )
  );

CREATE POLICY "therapist_sessions_owner_admin_update"
  ON public.therapist_sessions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.therapists t
      WHERE t.id = therapist_sessions.therapist_id
        AND (
          t.user_id = auth.uid()
          OR public.has_role(auth.uid(), 'admin'::app_role)
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.therapists t
      WHERE t.id = therapist_sessions.therapist_id
        AND (
          t.user_id = auth.uid()
          OR public.has_role(auth.uid(), 'admin'::app_role)
        )
    )
  );

CREATE POLICY "therapist_sessions_owner_admin_delete"
  ON public.therapist_sessions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.therapists t
      WHERE t.id = therapist_sessions.therapist_id
        AND (
          t.user_id = auth.uid()
          OR public.has_role(auth.uid(), 'admin'::app_role)
        )
    )
  );
