ALTER TABLE public.therapists
  ADD COLUMN IF NOT EXISTS verification_document_path TEXT,
  ADD COLUMN IF NOT EXISTS verification_document_name TEXT,
  ADD COLUMN IF NOT EXISTS verification_extra_document_path TEXT,
  ADD COLUMN IF NOT EXISTS verification_extra_document_name TEXT,
  ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_review_note TEXT,
  ADD COLUMN IF NOT EXISTS verification_reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_therapists_pending_verification
  ON public.therapists (verification_submitted_at DESC)
  WHERE status = 'pending';
