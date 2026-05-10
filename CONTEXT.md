# Mallorca Holística Context

## Product Summary

Mallorca Holística is a directory and discovery platform for holistic therapists and wellbeing professionals in Mallorca.

The core visitor journeys are:

1. Classic search:
   - therapy/category
   - name
   - location
   - modality

2. Conversational search:
   - visitor describes how they feel
   - platform maps that to help areas/therapies
   - platform recommends professionals

3. Therapist profile:
   - compact result cards lead to detailed profile pages
   - profile detail and contact affordances depend on subscription plan

## Latest Source Of Truth

Treat `comentarios-nadege` as the latest product authority.

Especially important files:
- `Comentarios_Nadege.docx`
- `business_model.docx`
- `Arquitectura de Planes Mallorca Holística (1).pdf`
- `Documento de Producto - Ficha Terapeuta.docx`
- `mallorca-holistica-meeting-2026-04-27.docx`
- `Visuales Canva MH.pdf`
- `Ficha Terapeuta MVP.png`

## Major Product Decisions

- Visitors do not have accounts in the MVP.
- Do not build an internal booking calendar in the MVP.
- Contact is hybrid/direct:
  - WhatsApp
  - phone/email if allowed by plan
  - optional external reservation link such as Calendly or Google Calendar
- Therapist contact is plan-aware:
  - `Presencia` / Free: basic public presence, search appearance, specialties, location, no prominent direct conversion block unless Nadège confirms.
  - `Profesional`: direct contact/reservation block, richer presentation, highlighted tags.
  - `Centros & Organizadores`: includes Profesional contact capabilities plus activity/agenda emphasis.
- Public routes are now aligned to OpenAPI/brief names:
  - `/professionals`
  - `/professionals/$slug`
  - `/therapies`
  - `/therapies/$slug`
  - `/activities`
  - `/search`
  - `/trust`
  - `/plans`
  - `/register`
  - `/for-professionals`
- Spanish public routes are compatibility redirects only.

## Current Implementation State

Feature branch:

```text
codex-therapy-guide
```

Implemented on the branch:
- root metadata changed from Lovable to Mallorca Holística
- `src/lib/plan-access.ts` added for plan-aware contact decisions
- therapist profile page reworked toward Nadège MVP spec
- conversational search intro forced to concise owner-approved tone
- testimonials reduced to three natural owner-provided quotes
- public URL routes aligned to English/OpenAPI names with Spanish redirects
- Therapy guide MVP implemented:
  - `/therapies` is a Supabase-powered A-Z directory
  - `/therapies/$slug` is the therapy detail page
  - `/terapias/$slug` redirects to `/therapies/$slug`
  - related published professionals render from `therapist_therapies`

## Verification Status

Passing:

```bash
npm run build
npx eslint src/lib/plan-access.ts src/lib/routes.ts src/lib/redirects.ts src/lib/route-schemas.ts src/features/professionals/ProfessionalsPage.tsx src/features/professionals/ProfessionalProfilePage.tsx src/features/search/ConversationalSearchPage.tsx src/routes/professionals.tsx 'src/routes/professionals_.$slug.tsx' src/routes/search.tsx src/components/home/Testimonials.tsx src/routes/__root.tsx
npx eslint src/features/therapies/types.ts src/features/therapies/therapy-utils.ts src/features/therapies/TherapiesPage.tsx src/features/therapies/TherapyDetailPage.tsx src/routes/therapies.tsx 'src/routes/therapies_.$slug.tsx' 'src/routes/terapias_.$slug.tsx' src/lib/routes.ts src/lib/redirects.ts
```

Known non-blocking/current issues:
- `npm run lint` fails repo-wide due to pre-existing Prettier/type issues outside the touched files.
- `npm run build` prints a CSS `@import` ordering warning from `src/styles.css`.
- Wrangler may print a log-write permission warning while still exiting `0`.
- TanStack build/dev tooling may modify `src/routeTree.gen.ts`; restore it if it is an unintended side effect.

## Browser Check

Dev server was run at:

```text
http://localhost:8080/
```

Checked:
- homepage title metadata is Mallorca Holística
- homepage uses the branch/plant hero image
- conversational search page eventually shows:
  `Gracias por compartirlo. Aquí tienes personas y propuestas que pueden acompañarte.`
- `/therapies` loads the A-Z guide when therapy data exists, or the empty state when it does not
- `/terapias/$slug` redirects to `/therapies/$slug`

Directory/profile data may show zero professionals depending on connected Supabase data.

## Do Not Do Accidentally

- Do not add visitor accounts.
- Do not build internal bookings.
- Do not add new Spanish public links; use canonical English route names.
- Do not wire analytics into the wrong table.
- Do not commit generated `package-lock.json` if it appears from `npm install`; this repo currently uses `bun.lock`.
- Do not commit generated `src/routeTree.gen.ts` changes unless the route files actually changed.
