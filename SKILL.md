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
- Keep Spanish routes until the dedicated route-rename pass.
- Prefer visible product clarity over SaaS complexity.

## Current Plan-Aware Contact Rule

- Free / `Presencia`: basic profile presence, no prominent direct contact/reservation block unless Nadège confirms.
- `Profesional`: direct contact/reservation block.
- `Centros & Organizadores`: same direct contact/reservation capability as Profesional, plus agenda/activity emphasis later.

## Verification

Use these checks for the current branch:

```bash
npm run build
npx eslint src/lib/plan-access.ts src/routes/buscar.tsx 'src/routes/profesionales.$slug.tsx' src/components/home/Testimonials.tsx src/routes/__root.tsx
```

Do not claim full repo lint is clean unless `npm run lint` passes. It currently fails because of pre-existing files outside this pass.

## Common Pitfalls

- `npm install` can create `package-lock.json`; do not commit it unless the package manager decision changes.
- TanStack tooling can modify `src/routeTree.gen.ts`; restore it unless route definitions actually changed.
- Build may print a Wrangler log permission warning but still exit `0`.
- Do not turn the platform into Doctoralia or a generic appointment marketplace.

## Next High-Value Work

After owner-visible polish is integrated:

1. Route/API rename pass:
   - `/professionals`
   - `/therapies`
   - `/activities`
2. Therapy guide:
   - A-Z clickable list
   - detail pages
   - related professionals
3. Activities:
   - listing with image cards
   - activity detail pages
4. Admin/professional workflows.
