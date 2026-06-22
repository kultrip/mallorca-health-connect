CREATE TABLE IF NOT EXISTS public.admin_email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  therapist_id UUID REFERENCES public.therapists(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  resend_email_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_admin_email_logs_created_at
  ON public.admin_email_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_email_logs_therapist_id
  ON public.admin_email_logs (therapist_id);

CREATE INDEX IF NOT EXISTS idx_admin_email_logs_sent_by_user_id
  ON public.admin_email_logs (sent_by_user_id);

ALTER TABLE public.admin_email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_email_logs_admin_read"
  ON public.admin_email_logs
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admin_email_logs_admin_insert"
  ON public.admin_email_logs
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
