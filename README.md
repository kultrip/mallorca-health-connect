# Mallorca Holística

Mallorca Holística is a public discovery platform for verified holistic wellbeing professionals in Mallorca.

Visitors can:
- search professionals by therapy, name, modality, and location
- describe their current state in natural language, such as anxiety, sadness, fatigue, or pain
- receive therapist recommendations based on needs/help areas
- open therapist profile pages with richer detail and plan-dependent contact actions

Professionals can eventually:
- publish a verified profile
- choose a subscription plan
- appear in search/results
- publish activities depending on plan

## Current Product Direction

Use `comentarios-nadege` from the documentation zip as the latest source of truth.

The platform should feel:
- human
- calm
- professional
- clear
- warm
- trustworthy

It should not feel like:
- a cold appointment marketplace
- an internal booking/calendar system
- an over-technical SaaS dashboard
- a pressure-heavy sales funnel

## Current Branch

Active feature branch:

```text
codex-therapy-guide
```

Base branch:

```text
main
```

## Key Commands

```bash
npm install
npm run build
npx eslint src/lib/plan-access.ts src/lib/routes.ts src/lib/redirects.ts src/lib/route-schemas.ts src/features/professionals/ProfessionalsPage.tsx src/features/professionals/ProfessionalProfilePage.tsx src/features/search/ConversationalSearchPage.tsx src/routes/professionals.tsx 'src/routes/professionals_.$slug.tsx' src/routes/search.tsx src/components/home/Testimonials.tsx src/routes/__root.tsx
npx eslint src/features/therapies/types.ts src/features/therapies/therapy-utils.ts src/features/therapies/TherapiesPage.tsx src/features/therapies/TherapyDetailPage.tsx src/routes/therapies.tsx 'src/routes/therapies_.$slug.tsx' 'src/routes/terapias_.$slug.tsx' src/lib/routes.ts src/lib/redirects.ts
npm run dev
```

Notes:
- `npm run build` currently exits successfully.
- `npm run lint` fails repo-wide because of pre-existing formatting/type issues outside this pass.
- The build prints a pre-existing Tailwind/CSS `@import` warning.
- Wrangler may print a log-write permission warning, but the build exits `0`.

## Important Files

- `CONTEXT.md`: current product/repo context and decisions.
- `PLAN.md`: implementation state and next steps.
- `SKILL.md`: instructions for an AI agent continuing Mallorca Holística work.
- `docs/superpowers/specs/2026-05-10-owner-visible-polish-design.md`: approved design spec.
- `docs/superpowers/plans/2026-05-10-owner-visible-polish.md`: implementation plan.
- `docs/superpowers/plans/2026-05-10-public-route-alignment.md`: public route alignment plan.
- `docs/superpowers/specs/2026-05-11-therapy-guide-design.md`: approved Therapy guide design.
- `docs/superpowers/plans/2026-05-11-therapy-guide.md`: Therapy guide implementation plan.

## Canonical Public Routes

Use English/OpenAPI-aligned public routes in new links:

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

Spanish routes are compatibility redirects only.

## Documentation Zip

Original docs are here:

```text
/Users/charles.santana/Downloads/MallorcaHolistica-20260510T171629Z-3-001.zip
```

Useful extracted text/reference files were created during this session under:

```text
/tmp/mh_texts
/tmp/mallorca-holistica-docs
```

If those temp folders are gone, re-extract from the zip.
