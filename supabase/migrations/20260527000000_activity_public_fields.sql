ALTER TABLE public.activities
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS facilitator_name TEXT,
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS website TEXT;

COMMENT ON COLUMN public.activities.category IS 'Public activity category such as Yoga, Retiro, Sonido, Reiki or Taller.';
COMMENT ON COLUMN public.activities.facilitator_name IS 'Public facilitator name shown on activity detail pages.';
