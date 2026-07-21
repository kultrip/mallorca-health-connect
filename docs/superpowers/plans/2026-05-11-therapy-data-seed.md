# Therapy Data Seed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Store the Canva therapy guide list and Acupuntura detail content in Supabase and render the richer therapy detail fields in the app.

**Architecture:** Keep the existing `public.therapies` table as the source of truth, adding structured fields for detail-page content instead of introducing a second content table. Seed the full A-Z list from Canva page 7 with idempotent `INSERT ... ON CONFLICT` statements and update the Acupuntura row with structured sections, benefits, session copy, disclaimer, and empty-professional copy from page 8.

**Tech Stack:** Supabase/Postgres migrations, React/TanStack Start, Supabase generated TypeScript types, ESLint, Vite build.

---

### Task 1: Add Therapy Guide Migration

**Files:**

- Create: `supabase/migrations/20260511000002_seed_therapy_guide.sql`

- [ ] **Step 1: Add schema columns to `public.therapies`**

Add nullable/defaulted fields for structured content:

```sql
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
```

- [ ] **Step 2: Seed the Canva page-7 therapy list**

Insert every therapy from page 7 with a stable Spanish slug and a gentle default short description. Preserve existing richer row content by only updating `name` and `category` on conflict.

- [ ] **Step 3: Seed Acupuntura detail content**

Update `slug = 'acupuntura'` with:

- `category = 'Medicina tradicional china'`
- `short_description` describing the therapy in one sentence
- `description` as the full readable fallback text
- `detail_sections` containing “Qué es” and “Cómo funciona”
- `benefits` with the five page-8 examples
- `session_description` with the session copy
- `medical_disclaimer` with the page-8 important note
- `empty_professionals_message` with the page-8 empty state copy

### Task 2: Update App Types And Queries

**Files:**

- Modify: `src/integrations/supabase/types.ts`
- Modify: `src/features/therapies/types.ts`
- Modify: `src/features/therapies/TherapyDetailPage.tsx`

- [ ] **Step 1: Add the new columns to Supabase TypeScript types**

Update `therapies.Row`, `therapies.Insert`, and `therapies.Update` with `detail_sections`, `benefits`, `session_description`, `medical_disclaimer`, and `empty_professionals_message`.

- [ ] **Step 2: Add frontend therapy section types**

Add `TherapyDetailSection` and extend `Therapy` with the new optional fields.

- [ ] **Step 3: Query and render the structured Acupuntura fields**

Update the detail select list and render:

- structured sections before fallback description
- benefits list under “En qué puede ayudar”
- session copy under “Cómo es una sesión”
- disclaimer note
- therapy-specific empty professionals message

### Task 3: Verify

**Files:**

- Verify: `supabase/migrations/20260511000002_seed_therapy_guide.sql`
- Verify: `src/features/therapies/types.ts`
- Verify: `src/features/therapies/TherapyDetailPage.tsx`
- Verify: `src/integrations/supabase/types.ts`

- [ ] **Step 1: Run targeted lint**

Run:

```bash
npx eslint src/features/therapies/types.ts src/features/therapies/TherapyDetailPage.tsx src/integrations/supabase/types.ts
```

Expected: exits 0.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: exits 0. Existing CSS import-order and Wrangler log warnings may appear.
