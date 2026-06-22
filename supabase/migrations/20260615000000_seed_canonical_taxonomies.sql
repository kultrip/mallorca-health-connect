BEGIN;

CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION public.slugify_taxonomy(value TEXT)
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT NULLIF(
    trim(
      both '-'
      from regexp_replace(
        regexp_replace(lower(unaccent(coalesce(value, ''))), '[^a-z0-9]+', '-', 'g'),
        '-{2,}',
        '-',
        'g'
      )
    ),
    ''
  );
$$;

ALTER TABLE public.therapies
  ADD COLUMN IF NOT EXISTS category TEXT;

ALTER TABLE public.help_areas
  ADD COLUMN IF NOT EXISTS category TEXT;

WITH legacy_therapy_slugs(old_slug, new_slug, new_name, new_category) AS (
  VALUES
    ('danza-terapia', 'danzaterapia', 'Danzaterapia', 'Arte, Expresión y Movimiento')
)
UPDATE public.therapies therapy
SET
  slug = legacy_therapy_slugs.new_slug,
  name = legacy_therapy_slugs.new_name,
  category = legacy_therapy_slugs.new_category
FROM legacy_therapy_slugs
WHERE therapy.slug = legacy_therapy_slugs.old_slug
  AND NOT EXISTS (
    SELECT 1
    FROM public.therapies existing
    WHERE existing.slug = legacy_therapy_slugs.new_slug
  );

INSERT INTO public.therapies (slug, name, category, short_description)
SELECT
  public.slugify_taxonomy(seed.name) AS slug,
  seed.name,
  seed.category,
  'Pronto incorporaremos más información sobre esta terapia.'
FROM (
  VALUES
    ('Alimentación Consciente', 'Salud Integrativa y Bienestar'),
    ('Dentista Holístico', 'Salud Integrativa y Bienestar'),
    ('Ginecología Holística', 'Salud Integrativa y Bienestar'),
    ('Ginecología Integrativa', 'Salud Integrativa y Bienestar'),
    ('Medicina Funcional', 'Salud Integrativa y Bienestar'),
    ('Medicina Integrativa', 'Salud Integrativa y Bienestar'),
    ('Medicina Ortomolecular', 'Salud Integrativa y Bienestar'),
    ('Medicina Tradicional China', 'Salud Integrativa y Bienestar'),
    ('Naturopatía', 'Salud Integrativa y Bienestar'),
    ('Nutrición Consciente', 'Salud Integrativa y Bienestar'),
    ('Nutrición Integrativa', 'Salud Integrativa y Bienestar'),
    ('Oftalmología Integrativa', 'Salud Integrativa y Bienestar'),
    ('Optometría Holística', 'Salud Integrativa y Bienestar'),
    ('Psicología Integrativa', 'Salud Integrativa y Bienestar'),
    ('Salud Bucodental', 'Salud Integrativa y Bienestar'),
    ('Acupresión', 'Terapias Corporales y Manuales'),
    ('Acupuntura', 'Terapias Corporales y Manuales'),
    ('Drenaje Linfático Manual', 'Terapias Corporales y Manuales'),
    ('Fasciaterapia', 'Terapias Corporales y Manuales'),
    ('Feldenkrais', 'Terapias Corporales y Manuales'),
    ('Kinesiología', 'Terapias Corporales y Manuales'),
    ('Masaje Relajante', 'Terapias Corporales y Manuales'),
    ('Masaje Terapéutico', 'Terapias Corporales y Manuales'),
    ('Osteopatía', 'Terapias Corporales y Manuales'),
    ('Pilates Terapéutico', 'Terapias Corporales y Manuales'),
    ('Quiromasaje', 'Terapias Corporales y Manuales'),
    ('Reflexología', 'Terapias Corporales y Manuales'),
    ('Rolfing', 'Terapias Corporales y Manuales'),
    ('Shiatsu', 'Terapias Corporales y Manuales'),
    ('Técnica Alexander', 'Terapias Corporales y Manuales'),
    ('Terapia Craneosacral', 'Terapias Corporales y Manuales'),
    ('Cromoterapia', 'Terapias Energéticas'),
    ('Equilibrio Energético', 'Terapias Energéticas'),
    ('Reiki', 'Terapias Energéticas'),
    ('Sanación Energética', 'Terapias Energéticas'),
    ('Sonoterapia', 'Terapias Energéticas'),
    ('Aromaterapia', 'Terapias Naturales'),
    ('Ayurveda', 'Terapias Naturales'),
    ('Biomagnetismo', 'Terapias Naturales'),
    ('Fitoterapia', 'Terapias Naturales'),
    ('Flores de Bach', 'Terapias Naturales'),
    ('Homeopatía', 'Terapias Naturales'),
    ('Iridología', 'Terapias Naturales'),
    ('Biodescodificación', 'Psicología, Emociones y Desarrollo Personal'),
    ('Coaching Emocional', 'Psicología, Emociones y Desarrollo Personal'),
    ('Coaching de Vida', 'Psicología, Emociones y Desarrollo Personal'),
    ('EFT (Liberación Emocional)', 'Psicología, Emociones y Desarrollo Personal'),
    ('EMDR', 'Psicología, Emociones y Desarrollo Personal'),
    ('Eneagrama', 'Psicología, Emociones y Desarrollo Personal'),
    ('Gestalt', 'Psicología, Emociones y Desarrollo Personal'),
    ('Hipnosis', 'Psicología, Emociones y Desarrollo Personal'),
    ('PNL (Programación Neurolingüística)', 'Psicología, Emociones y Desarrollo Personal'),
    ('Terapia Emocional', 'Psicología, Emociones y Desarrollo Personal'),
    ('Terapia Transpersonal', 'Psicología, Emociones y Desarrollo Personal'),
    ('Constelaciones Familiares', 'Terapias Sistémicas y Relacionales'),
    ('Terapia de Pareja', 'Terapias Sistémicas y Relacionales'),
    ('Terapia Familiar', 'Terapias Sistémicas y Relacionales'),
    ('Astrología Evolutiva', 'Conciencia, Espiritualidad y Crecimiento Interior'),
    ('Astrología Terapéutica', 'Conciencia, Espiritualidad y Crecimiento Interior'),
    ('Chi Kung (Qi Gong)', 'Conciencia, Espiritualidad y Crecimiento Interior'),
    ('Meditación', 'Conciencia, Espiritualidad y Crecimiento Interior'),
    ('Mindfulness', 'Conciencia, Espiritualidad y Crecimiento Interior'),
    ('Registros Akáshicos', 'Conciencia, Espiritualidad y Crecimiento Interior'),
    ('Relajación Guiada', 'Conciencia, Espiritualidad y Crecimiento Interior'),
    ('Respiración Consciente', 'Conciencia, Espiritualidad y Crecimiento Interior'),
    ('Yoga', 'Conciencia, Espiritualidad y Crecimiento Interior'),
    ('Yoga Terapéutico', 'Conciencia, Espiritualidad y Crecimiento Interior'),
    ('Arteterapia', 'Arte, Expresión y Movimiento'),
    ('Danzaterapia', 'Arte, Expresión y Movimiento'),
    ('Comunicación Animal', 'Animales'),
    ('Equinoterapia', 'Animales'),
    ('Feng Shui', 'Espacios y Entorno'),
    ('Otra especialidad o terapia (especificar)', 'Otros')
) AS seed(name, category)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  short_description = COALESCE(public.therapies.short_description, EXCLUDED.short_description);

WITH legacy_help_area_slugs(old_slug, new_slug, new_name, new_category) AS (
  VALUES
    ('autoestima-y-confianza', 'autoestima', 'Autoestima', 'Bienestar Emocional y Desarrollo Personal'),
    ('depresion-y-estado-de-animo-bajo', 'depresion', 'Depresión', 'Bienestar Emocional y Desarrollo Personal'),
    ('cansancio-y-fatiga', 'fatiga', 'Fatiga', 'Sueño y Energía'),
    ('dolores-articulares', 'dolor-articular', 'Dolor Articular', 'Dolor y Sistema Musculoesquelético'),
    ('dolores-cronicos', 'dolor-cronico', 'Dolor Crónico', 'Dolor y Sistema Musculoesquelético'),
    ('dolores-musculares', 'dolor-muscular', 'Dolor Muscular', 'Dolor y Sistema Musculoesquelético'),
    ('embarazo-y-maternidad', 'maternidad', 'Maternidad', 'Relaciones y Sexualidad'),
    ('fobias-y-miedos', 'fobias', 'Fobias', 'Bienestar Emocional y Desarrollo Personal'),
    ('habitos-y-estilo-de-vida', 'habitos-saludables', 'Hábitos Saludables', 'Rendimiento y Hábitos'),
    ('intolerancias-alimentarias', 'intolerancias', 'Intolerancias', 'Alimentación y Digestión'),
    ('insomnio-y-problemas-de-sueno', 'insomnio', 'Insomnio', 'Sueño y Energía'),
    ('problemas-cardiovasculares', 'cardiovascular', 'Cardiovascular', 'Salud Física'),
    ('problemas-de-circulacion', 'circulacion', 'Circulación', 'Salud Física'),
    ('problemas-de-pareja-y-relaciones', 'pareja', 'Pareja', 'Relaciones y Sexualidad'),
    ('problemas-de-vision', 'vision', 'Visión', 'Salud Física'),
    ('problemas-digestivos', 'digestion', 'Digestión', 'Alimentación y Digestión'),
    ('problemas-urinarios', 'urinario', 'Urinario', 'Salud Física'),
    ('salud-sexual', 'sexualidad', 'Sexualidad', 'Relaciones y Sexualidad'),
    ('sistema-respiratorio-orl', 'respiratorio', 'Respiratorio', 'Salud Física'),
    ('traumas-y-experiencias-dificiles', 'trauma', 'Trauma', 'Bienestar Emocional y Desarrollo Personal'),
    ('otro', 'otro-especificar', 'Otro (especificar)', 'Otros')
)
UPDATE public.help_areas help_area
SET
  slug = legacy_help_area_slugs.new_slug,
  name = legacy_help_area_slugs.new_name,
  category = legacy_help_area_slugs.new_category
FROM legacy_help_area_slugs
WHERE help_area.slug = legacy_help_area_slugs.old_slug
  AND NOT EXISTS (
    SELECT 1
    FROM public.help_areas existing
    WHERE existing.slug = legacy_help_area_slugs.new_slug
  );

INSERT INTO public.help_areas (slug, name, category, description, keywords)
SELECT
  public.slugify_taxonomy(seed.name) AS slug,
  seed.name,
  seed.category,
  'Área de especialización incluida en el catálogo canónico de Mallorca Holística.',
  ARRAY[public.slugify_taxonomy(seed.name)]
FROM (
  VALUES
    ('Adicciones', 'Bienestar Emocional y Desarrollo Personal'),
    ('Ansiedad', 'Bienestar Emocional y Desarrollo Personal'),
    ('Autoestima', 'Bienestar Emocional y Desarrollo Personal'),
    ('Autoconocimiento', 'Bienestar Emocional y Desarrollo Personal'),
    ('Burnout', 'Bienestar Emocional y Desarrollo Personal'),
    ('Crecimiento Personal', 'Bienestar Emocional y Desarrollo Personal'),
    ('Depresión', 'Bienestar Emocional y Desarrollo Personal'),
    ('Duelo', 'Bienestar Emocional y Desarrollo Personal'),
    ('Estrés', 'Bienestar Emocional y Desarrollo Personal'),
    ('Fobias', 'Bienestar Emocional y Desarrollo Personal'),
    ('Gestión Emocional', 'Bienestar Emocional y Desarrollo Personal'),
    ('Propósito de Vida', 'Bienestar Emocional y Desarrollo Personal'),
    ('Trauma', 'Bienestar Emocional y Desarrollo Personal'),
    ('Fertilidad', 'Relaciones y Sexualidad'),
    ('Maternidad', 'Relaciones y Sexualidad'),
    ('Pareja', 'Relaciones y Sexualidad'),
    ('Rupturas', 'Relaciones y Sexualidad'),
    ('Sexualidad', 'Relaciones y Sexualidad'),
    ('Ciclo Menstrual', 'Salud Femenina y Hormonal'),
    ('Equilibrio Hormonal', 'Salud Femenina y Hormonal'),
    ('Menopausia', 'Salud Femenina y Hormonal'),
    ('Salud Femenina', 'Salud Femenina y Hormonal'),
    ('Fatiga', 'Sueño y Energía'),
    ('Insomnio', 'Sueño y Energía'),
    ('Vitalidad', 'Sueño y Energía'),
    ('Alimentación', 'Alimentación y Digestión'),
    ('Digestión', 'Alimentación y Digestión'),
    ('Intolerancias', 'Alimentación y Digestión'),
    ('Microbiota Intestinal', 'Alimentación y Digestión'),
    ('Pérdida de Peso', 'Alimentación y Digestión'),
    ('Dolor Articular', 'Dolor y Sistema Musculoesquelético'),
    ('Dolor Cervical', 'Dolor y Sistema Musculoesquelético'),
    ('Dolor Crónico', 'Dolor y Sistema Musculoesquelético'),
    ('Dolor de Cabeza', 'Dolor y Sistema Musculoesquelético'),
    ('Dolor de Espalda', 'Dolor y Sistema Musculoesquelético'),
    ('Dolor Muscular', 'Dolor y Sistema Musculoesquelético'),
    ('Alergias', 'Salud Física'),
    ('Cardiovascular', 'Salud Física'),
    ('Circulación', 'Salud Física'),
    ('Inmunidad', 'Salud Física'),
    ('Inflamación Crónica', 'Salud Física'),
    ('Piel', 'Salud Física'),
    ('Respiratorio', 'Salud Física'),
    ('Salud Bucodental', 'Salud Física'),
    ('Urinario', 'Salud Física'),
    ('Visión', 'Salud Física'),
    ('Altas Capacidades', 'Neurodiversidad'),
    ('Autismo (TEA)', 'Neurodiversidad'),
    ('Discalculia', 'Neurodiversidad'),
    ('Dislexia', 'Neurodiversidad'),
    ('Hipersensibilidad', 'Neurodiversidad'),
    ('Procesamiento Sensorial', 'Neurodiversidad'),
    ('TDAH', 'Neurodiversidad'),
    ('Trastornos del Aprendizaje', 'Neurodiversidad'),
    ('Adolescencia', 'Infancia y Adolescencia'),
    ('Crianza', 'Infancia y Adolescencia'),
    ('Infancia', 'Infancia y Adolescencia'),
    ('Alzheimer', 'Salud Cognitiva y Neurológica'),
    ('Deterioro Cognitivo', 'Salud Cognitiva y Neurológica'),
    ('Estimulación Cognitiva', 'Salud Cognitiva y Neurológica'),
    ('Memoria', 'Salud Cognitiva y Neurológica'),
    ('Parkinson', 'Salud Cognitiva y Neurológica'),
    ('Salud Neurológica', 'Salud Cognitiva y Neurológica'),
    ('Cáncer y Procesos Oncológicos', 'Procesos de Salud Complejos'),
    ('Enfermedades Autoinmunes', 'Procesos de Salud Complejos'),
    ('Fatiga Crónica', 'Procesos de Salud Complejos'),
    ('Fibromialgia', 'Procesos de Salud Complejos'),
    ('Hábitos Saludables', 'Rendimiento y Hábitos'),
    ('Preparación Mental', 'Rendimiento y Hábitos'),
    ('Rendimiento Deportivo', 'Rendimiento y Hábitos'),
    ('Desarrollo Espiritual', 'Espiritualidad y Conciencia'),
    ('Espiritualidad', 'Espiritualidad y Conciencia'),
    ('Expansión de Conciencia', 'Espiritualidad y Conciencia'),
    ('Meditación', 'Espiritualidad y Conciencia'),
    ('Bienestar Animal', 'Animales y Comportamiento'),
    ('Comportamiento Animal', 'Animales y Comportamiento'),
    ('Feng Shui', 'Espacios y Entorno'),
    ('Hogar y Espacios', 'Espacios y Entorno'),
    ('Otro (especificar)', 'Otros')
) AS seed(name, category)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = COALESCE(public.help_areas.description, EXCLUDED.description),
  keywords = CASE
    WHEN COALESCE(array_length(public.help_areas.keywords, 1), 0) = 0 THEN EXCLUDED.keywords
    ELSE public.help_areas.keywords
  END;

INSERT INTO public.municipalities (name, slug, lat, lng)
SELECT
  seed.name,
  public.slugify_taxonomy(seed.name) AS slug,
  NULL::NUMERIC,
  NULL::NUMERIC
FROM (
  VALUES
    ('Alaró'),
    ('Alcúdia'),
    ('Algaida'),
    ('Andratx'),
    ('Ariany'),
    ('Artà'),
    ('Banyalbufar'),
    ('Binissalem'),
    ('Búger'),
    ('Bunyola'),
    ('Calvià'),
    ('Campanet'),
    ('Campos'),
    ('Capdepera'),
    ('Consell'),
    ('Costitx'),
    ('Deià'),
    ('Escorca'),
    ('Esporles'),
    ('Estellencs'),
    ('Felanitx'),
    ('Fornalutx'),
    ('Inca'),
    ('Lloret de Vistalegre'),
    ('Lloseta'),
    ('Llubí'),
    ('Llucmajor'),
    ('Manacor'),
    ('Mancor de la Vall'),
    ('Maria de la Salut'),
    ('Marratxí'),
    ('Montuïri'),
    ('Muro'),
    ('Palma'),
    ('Petra'),
    ('Pollença'),
    ('Porreres'),
    ('Puigpunyent'),
    ('Sa Pobla'),
    ('Sant Joan'),
    ('Sant Llorenç des Cardassar'),
    ('Santa Eugènia'),
    ('Santa Margalida'),
    ('Santa Maria del Camí'),
    ('Santanyí'),
    ('Selva'),
    ('Sencelles'),
    ('Ses Salines'),
    ('Sineu'),
    ('Sóller'),
    ('Son Servera'),
    ('Valldemossa'),
    ('Vilafranca de Bonany')
) AS seed(name)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  lat = COALESCE(public.municipalities.lat, EXCLUDED.lat),
  lng = COALESCE(public.municipalities.lng, EXCLUDED.lng);

COMMIT;
