-- Seed the public therapy guide from "Visuales Canva MH (2).pdf" pages 7-8.
-- Page 7 provides the A-Z therapy list; page 8 provides Acupuntura detail content.

ALTER TABLE public.therapies
  ADD COLUMN IF NOT EXISTS detail_sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS benefits TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS session_description TEXT,
  ADD COLUMN IF NOT EXISTS medical_disclaimer TEXT,
  ADD COLUMN IF NOT EXISTS empty_professionals_message TEXT;

ALTER TABLE public.therapies
  DROP CONSTRAINT IF EXISTS therapies_detail_sections_is_array;

ALTER TABLE public.therapies
  ADD CONSTRAINT therapies_detail_sections_is_array
  CHECK (jsonb_typeof(detail_sections) = 'array');

INSERT INTO public.therapies (slug, name, short_description)
VALUES
  ('acupuntura', 'Acupuntura', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('acupresion', 'Acupresión', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('aromaterapia', 'Aromaterapia', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('arteterapia', 'Arteterapia', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('ayurveda', 'Ayurveda', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('biodescodificacion', 'Biodescodificación', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('biomagnetismo', 'Biomagnetismo', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('coaching-emocional', 'Coaching emocional', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('coaching-de-vida', 'Coaching de vida', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('comunicacion-animal', 'Comunicación animal', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('constelaciones-familiares', 'Constelaciones familiares', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('cromoterapia', 'Cromoterapia', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('danza-terapia', 'Danza terapia', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('drenaje-linfatico-manual', 'Drenaje linfático manual', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('eft-liberacion-emocional', 'EFT (liberación emocional)', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('emdr', 'EMDR', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('eneagrama', 'Eneagrama', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('equilibrio-energetico', 'Equilibrio energético', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('equinoterapia', 'Equinoterapia', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('fasciaterapia', 'Fasciaterapia', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('feng-shui', 'Feng Shui', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('fitoterapia', 'Fitoterapia', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('flores-de-bach', 'Flores de Bach', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('gestalt', 'Gestalt', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('ginecologia-holistica', 'Ginecología holística', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('hipnosis', 'Hipnosis', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('homeopatia', 'Homeopatía', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('iridologia', 'Iridología', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('kinesiologia', 'Kinesiología', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('masaje-relajante', 'Masaje relajante', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('masaje-terapeutico', 'Masaje terapéutico', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('meditacion', 'Meditación', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('medicina-tradicional-china', 'Medicina tradicional china', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('mindfulness', 'Mindfulness', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('naturopatia', 'Naturopatía', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('nutricion-consciente', 'Nutrición consciente', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('osteopatia', 'Osteopatía', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('pnl-programacion-neurolinguistica', 'PNL (Programación Neurolingüística)', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('psicologia-integrativa', 'Psicología integrativa', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('quiromasaje', 'Quiromasaje', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('reflexologia', 'Reflexología', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('reiki', 'Reiki', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('relajacion-guiada', 'Relajación guiada', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('respiracion-consciente', 'Respiración consciente', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('salud-bucodental', 'Salud bucodental', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('sanacion-energetica', 'Sanación energética', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('shiatsu', 'Shiatsu', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('sonoterapia', 'Sonoterapia', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('terapia-craneosacral', 'Terapia craneosacral', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('terapia-de-pareja', 'Terapia de pareja', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('terapia-emocional', 'Terapia emocional', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('terapia-familiar', 'Terapia familiar', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('terapia-transpersonal', 'Terapia transpersonal', 'Pronto incorporaremos más información sobre esta terapia.'),
  ('yoga', 'Yoga', 'Pronto incorporaremos más información sobre esta terapia.')
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  short_description = COALESCE(public.therapies.short_description, EXCLUDED.short_description);

UPDATE public.therapies
SET
  category = 'Medicina tradicional china',
  short_description = 'Práctica terapéutica de origen milenario que estimula puntos específicos del cuerpo para favorecer el equilibrio y acompañar los procesos naturales del organismo.',
  description = $therapy$
Qué es
La acupuntura es una práctica terapéutica de origen milenario que forma parte de la medicina tradicional china. Se basa en la estimulación de puntos específicos del cuerpo mediante agujas muy finas, con el objetivo de favorecer el equilibrio y acompañar los procesos naturales del organismo.

Cómo funciona
Durante una sesión, el profesional selecciona distintos puntos del cuerpo según las necesidades de la persona. Las agujas se colocan de forma suave y permanecen durante unos minutos mientras el cuerpo entra en un estado de relajación. Las sesiones suelen desarrollarse en un ambiente tranquilo, cuidando el ritmo y el bienestar de la persona.

En qué puede ayudar
Muchas personas recurren a la acupuntura para acompañar procesos como tensiones musculares o articulares, dolores de espalda o cervicales, migrañas o dolores de cabeza, estrés y ansiedad, fatiga o falta de energía.

Cómo es una sesión
Una sesión suele comenzar con una conversación para comprender la situación y las necesidades de la persona. A partir de ahí, el profesional define el enfoque más adecuado y realiza la sesión adaptándola a cada caso. La experiencia suele ser suave y, en la mayoría de los casos, poco o nada dolorosa.
$therapy$,
  detail_sections = '[
    {
      "title": "Qué es",
      "body": "La acupuntura es una práctica terapéutica de origen milenario que forma parte de la medicina tradicional china. Se basa en la estimulación de puntos específicos del cuerpo mediante agujas muy finas, con el objetivo de favorecer el equilibrio y acompañar los procesos naturales del organismo."
    },
    {
      "title": "Cómo funciona",
      "body": "Durante una sesión, el profesional selecciona distintos puntos del cuerpo según las necesidades de la persona. Las agujas se colocan de forma suave y permanecen durante unos minutos mientras el cuerpo entra en un estado de relajación. Las sesiones suelen desarrollarse en un ambiente tranquilo, cuidando el ritmo y el bienestar de la persona."
    }
  ]'::jsonb,
  benefits = ARRAY[
    'Tensiones musculares o articulares',
    'Dolores de espalda o cervicales',
    'Migrañas o dolores de cabeza',
    'Estrés y ansiedad',
    'Fatiga o falta de energía'
  ],
  session_description = 'Una sesión suele comenzar con una conversación para comprender la situación y las necesidades de la persona. A partir de ahí, el profesional define el enfoque más adecuado y realiza la sesión adaptándola a cada caso. La experiencia suele ser suave y, en la mayoría de los casos, poco o nada dolorosa.',
  medical_disclaimer = 'Las terapias complementarias acompañan procesos de salud, pero no sustituyen la atención médica cuando es necesaria.',
  empty_professionals_message = 'Estamos ampliando nuestra red de profesionales con mucho cuidado. Muy pronto encontrarás aquí a la persona adecuada para ti.'
WHERE slug = 'acupuntura';
