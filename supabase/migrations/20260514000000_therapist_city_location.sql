ALTER TABLE public.therapists
ADD COLUMN IF NOT EXISTS city TEXT;

COMMENT ON COLUMN public.therapists.city IS
  'Free-text public city or service area shown on profiles and cards. Municipality remains the structured map/search area.';
