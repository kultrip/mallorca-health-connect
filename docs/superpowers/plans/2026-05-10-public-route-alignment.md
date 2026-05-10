# Public Route Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all public Spanish URL paths use the English/OpenAPI-aligned route names while preserving old Spanish URLs as redirects.

**Architecture:** Canonical public pages move to English route files. Existing Spanish route files become thin compatibility redirect routes that preserve search parameters and profile slugs. Large route components are extracted into reusable page modules only where dual route wrappers would otherwise duplicate behavior.

**Tech Stack:** TanStack Start, TanStack Router file routes, React, TypeScript, Supabase, Vite.

---

## Route Map

Canonical routes:

- `/professionals`
- `/professionals/$slug`
- `/therapies`
- `/activities`
- `/search`
- `/trust`
- `/plans`
- `/register`
- `/for-professionals`

Compatibility redirects:

- `/profesionales` -> `/professionals`
- `/profesionales/$slug` -> `/professionals/$slug`
- `/terapias` -> `/therapies`
- `/actividades` -> `/activities`
- `/buscar` -> `/search`
- `/confianza` -> `/trust`
- `/planes` -> `/plans`
- `/registro` -> `/register`
- `/soy-profesional` -> `/for-professionals`

Routes left unchanged:

- `/`
- `/login`

## Implementation Tasks

1. Add shared canonical route constants and redirect helpers.
2. Extract professionals pages into feature modules and add canonical `/professionals` routes.
3. Replace Spanish professionals routes with redirect wrappers.
4. Add canonical static public routes and replace their Spanish counterparts with redirects.
5. Extract the conversational search page and add canonical `/search`.
6. Update header, footer, cards, forms, and homepage links to canonical routes.
7. Update handoff docs with the route map.
8. Verify with build, targeted ESLint, route-link search, and browser checks for canonical routes plus representative redirects.

## Key Files

- `src/lib/routes.ts`
- `src/lib/redirects.ts`
- `src/features/professionals/ProfessionalsPage.tsx`
- `src/features/professionals/ProfessionalProfilePage.tsx`
- `src/features/search/ConversationalSearchPage.tsx`
- `src/routes/professionals.tsx`
- `src/routes/professionals.$slug.tsx`
- `src/routes/search.tsx`
- `src/routes/therapies.tsx`
- `src/routes/activities.tsx`
- `src/routes/trust.tsx`
- `src/routes/plans.tsx`
- `src/routes/register.tsx`
- `src/routes/for-professionals.tsx`
- Legacy Spanish route files become redirect wrappers.
- `src/components/layout/SiteHeader.tsx`
- `src/components/layout/SiteFooter.tsx`
- `src/components/home/StartHere.tsx`
- `src/components/search/SearchBar.tsx`
- `src/components/search/SymptomPrompt.tsx`
- `src/components/therapists/TherapistCard.tsx`
- `README.md`
- `CONTEXT.md`
- `PLAN.md`
- `SKILL.md`

## Verification

Run:

```bash
npm run build
npx eslint src/lib/routes.ts src/lib/redirects.ts src/features/professionals/ProfessionalsPage.tsx src/features/professionals/ProfessionalProfilePage.tsx src/features/search/ConversationalSearchPage.tsx src/routes/professionals.tsx 'src/routes/professionals.$slug.tsx' src/routes/profesionales.tsx 'src/routes/profesionales.$slug.tsx' src/routes/search.tsx src/routes/buscar.tsx src/routes/therapies.tsx src/routes/activities.tsx src/routes/trust.tsx src/routes/plans.tsx src/routes/register.tsx src/routes/for-professionals.tsx src/components/layout/SiteHeader.tsx src/components/layout/SiteFooter.tsx src/components/home/StartHere.tsx src/components/search/SearchBar.tsx src/components/search/SymptomPrompt.tsx src/components/therapists/TherapistCard.tsx
```

Search for remaining old public links:

```bash
rg '"/(profesionales|terapias|actividades|buscar|confianza|planes|registro|soy-profesional)' src
rg "'/(profesionales|terapias|actividades|buscar|confianza|planes|registro|soy-profesional)" src
```

Expected: matches are limited to redirect wrappers, `src/lib/routes.ts`, and generated route tree entries.

Browser-check:

- `/professionals`
- `/therapies`
- `/activities`
- `/search?q=ansiedad`
- `/trust`
- `/plans`
- `/register`
- `/for-professionals`
- `/profesionales?municipio=Sóller` redirects to `/professionals?municipio=Sóller`
- `/buscar?q=ansiedad` redirects to `/search?q=ansiedad`
- `/soy-profesional` redirects to `/for-professionals`

## Self-Review

- The route map covers every Spanish public route currently present in `src/routes`.
- The plan keeps `/` and `/login` unchanged.
- The plan keeps visible Spanish UI copy unchanged; only public URLs and internal navigation are aligned.
- The plan preserves old Spanish URLs through redirects instead of removing them.
