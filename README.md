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

Active feature branch/worktree:

```text
codex-owner-visible-polish
/Users/charles.santana/Kultrip/gemini-dev/mallorca-health-connect/.worktrees/owner-visible-polish
```

Base branch:

```text
main
```

## Key Commands

```bash
npm install
npm run build
npx eslint src/lib/plan-access.ts src/routes/buscar.tsx 'src/routes/profesionales.$slug.tsx' src/components/home/Testimonials.tsx src/routes/__root.tsx
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
