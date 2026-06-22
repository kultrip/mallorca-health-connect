---
name: mallorca-holistica-continuation
description: Use when continuing development, review, or product implementation work in the Mallorca Holística repository.
---

# Mallorca Holística Continuation Skill

## First Moves

1. Read `CONTEXT.md`.
2. Read `PLAN.md`.
3. Check the active branch and worktree:

```bash
git branch --show-current
git status --short
```

4. If continuing the current polish pass, work in:

```text
/Users/charles.santana/Kultrip/gemini-dev/mallorca-health-connect
```

## Product Rules

- Use `comentarios-nadege` as the latest source of truth.
- Keep the product human, calm, warm, clear, and professional.
- Do not build internal bookings for the MVP.
- Do not add visitor accounts for the MVP.
- Contact actions are plan-aware.
- Use canonical English public routes for new links.
- Keep Spanish public route files only as compatibility redirects.
- Prefer visible product clarity over SaaS complexity.
- Use `analytics_events` for new dashboard metrics. Keep `profile_views` only for backward compatibility.
- Conversational search should map text to `help_areas`, then professionals through `therapist_help_areas`.
- When changing professional profiles, keep `/dashboard`, public profile rendering, and search-matching relations (`therapist_therapies`, `therapist_help_areas`) in sync.
- Professional location should include address and plain-language city. City is the important user-facing search/display unit; municipality can remain structured metadata.
- Any professional list should be designed with a companion Mallorca map when locations are available.
- Professional list maps are provider-free for MVP. Use public therapist `lat`/`lng`, then municipality `lat`/`lng`; never use billing/fiscal addresses.
- `therapists.city` is the public city/area label. Keep onboarding, `/dashboard`, admin editing, public cards, profiles, search results, and Edge Function recommendation selects in sync when changing location behavior.
- Subscription benefits must read active Stripe webhook state. Pending paid plans and saved payment methods never unlock public paid features by themselves.
- Fiscal invoice fields are optional. Do not block paid subscriptions for informal professionals that do not need NIF/CIF/NIE invoices.
- Admin emails are simple subject/message sends to selected professionals. Do not add email-type taxonomy, campaign scheduling, or internal inbox behavior in MVP.

## Current Plan-Aware Contact Rule

- Free / `Presencia`: basic profile presence, no prominent direct contact/reservation block unless Nadège confirms.
- `Profesional`: direct contact/reservation block.
- `Centros & Organizadores`: same direct contact/reservation capability as Profesional, plus agenda/activity emphasis later.

## Verification

Use these checks for the current branch:

```bash
npm run build
npx eslint src/lib/plan-access.ts src/lib/routes.ts src/lib/redirects.ts src/lib/route-schemas.ts src/features/professionals/ProfessionalsPage.tsx src/features/professionals/ProfessionalProfilePage.tsx src/features/search/ConversationalSearchPage.tsx src/routes/professionals.tsx 'src/routes/professionals_.$slug.tsx' src/routes/search.tsx src/components/home/Testimonials.tsx src/routes/__root.tsx
npx eslint src/features/therapies/types.ts src/features/therapies/therapy-utils.ts src/features/therapies/TherapiesPage.tsx src/features/therapies/TherapyDetailPage.tsx src/routes/therapies.tsx 'src/routes/therapies_.$slug.tsx' 'src/routes/terapias_.$slug.tsx' src/lib/routes.ts src/lib/redirects.ts
```

Do not claim full repo lint is clean unless `npm run lint` passes. It currently fails because of pre-existing files outside this pass.

## Common Pitfalls

- `npm install` can create `package-lock.json`; do not commit it unless the package manager decision changes.
- TanStack tooling can modify `src/routeTree.gen.ts`; restore it unless route definitions actually changed.
- Build may print a Wrangler log permission warning but still exit `0`.
- Do not turn the platform into Doctoralia or a generic appointment marketplace.

## Next High-Value Work

After owner-visible polish, route alignment, Therapy guide, Professional Dashboard, and profile editing are integrated:

1. End-to-end Stripe test and Customer Portal/invoice check.
2. Production readiness.

Activities/agenda work is deferred beyond MVP.

## Canonical Route Map

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

Legacy Spanish public routes should redirect to these canonical routes.

## Therapy Guide

- `/therapies` is a database-first A-Z guide powered by Supabase `therapies`.
- `/therapies/$slug` shows one therapy and related published professionals.
- `/terapias/$slug` redirects to `/therapies/$slug`.
