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
/Users/charles.santana/Kultrip/gemini-dev/mallorca-health-connect/.worktrees/owner-visible-polish
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

## Current Plan-Aware Contact Rule

- Free / `Presencia`: basic profile presence, no prominent direct contact/reservation block unless Nadège confirms.
- `Profesional`: direct contact/reservation block.
- `Centros & Organizadores`: same direct contact/reservation capability as Profesional, plus agenda/activity emphasis later.

## Verification

Use these checks for the current branch:

```bash
npm run build
npx eslint src/lib/plan-access.ts src/lib/routes.ts src/lib/redirects.ts src/lib/route-schemas.ts src/features/professionals/ProfessionalsPage.tsx src/features/professionals/ProfessionalProfilePage.tsx src/features/search/ConversationalSearchPage.tsx src/routes/professionals.tsx 'src/routes/professionals.$slug.tsx' src/routes/search.tsx src/components/home/Testimonials.tsx src/routes/__root.tsx
```

Do not claim full repo lint is clean unless `npm run lint` passes. It currently fails because of pre-existing files outside this pass.

## Common Pitfalls

- `npm install` can create `package-lock.json`; do not commit it unless the package manager decision changes.
- TanStack tooling can modify `src/routeTree.gen.ts`; restore it unless route definitions actually changed.
- Build may print a Wrangler log permission warning but still exit `0`.
- Do not turn the platform into Doctoralia or a generic appointment marketplace.

## Next High-Value Work

After owner-visible polish and route alignment are integrated:

1. Therapy guide:
   - A-Z clickable list
   - detail pages
   - related professionals
2. Activities:
   - listing with image cards
   - activity detail pages
3. Admin/professional workflows.

## Canonical Route Map

- `/professionals`
- `/professionals/$slug`
- `/therapies`
- `/activities`
- `/search`
- `/trust`
- `/plans`
- `/register`
- `/for-professionals`

Legacy Spanish public routes should redirect to these canonical routes.
