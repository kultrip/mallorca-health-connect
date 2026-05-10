# Mallorca Holística Plan

## Current Stage

Owner-visible polish implementation is complete on branch:

```text
codex-owner-visible-polish
```

The work is not merged into `main` yet.

## Completed Work

- [x] Read repo and summarized current app behavior.
- [x] Read documentation zip and prioritized `comentarios-nadege`.
- [x] Confirmed product decisions with the user:
  - latest owner comments are source of truth
  - first pass is owner-visible polish
  - route rename is deferred
  - visitors have no accounts
  - plant/branch hero image should be used
- [x] Wrote and committed design spec:
  - `docs/superpowers/specs/2026-05-10-owner-visible-polish-design.md`
- [x] Clarified plan-aware contact rules from subscription plan docs.
- [x] Wrote and committed implementation plan:
  - `docs/superpowers/plans/2026-05-10-owner-visible-polish.md`
- [x] Created isolated worktree:
  - `.worktrees/owner-visible-polish`
- [x] Implemented owner-visible polish:
  - metadata cleanup
  - plan-aware contact helper
  - therapist profile MVP layout
  - concise conversational search intro
  - refined testimonials
- [x] Verified build and targeted lint on touched files.

## Remaining Integration Decision

Ask the user what to do with the branch:

1. Merge back to `main` locally
2. Push and create a Pull Request
3. Keep the branch as-is
4. Discard this work

User has not yet chosen an integration option.

## Recommended Next Steps

1. Let the user visually review the branch at `http://localhost:8080/`.
2. If approved, merge locally or create a PR.
3. Next product pass: route/API alignment.
4. Then build public MVP skeleton:
   - therapy A-Z page
   - therapy detail pages
   - activities list
   - activity detail pages
5. Later passes:
   - professional registration
   - admin validation
   - dashboard
   - analytics/tracking table
   - plan enforcement in backend/admin
   - multilingual i18n

## Verification Commands

Run from:

```text
/Users/charles.santana/Kultrip/gemini-dev/mallorca-health-connect/.worktrees/owner-visible-polish
```

Commands:

```bash
npm run build
npx eslint src/lib/plan-access.ts src/routes/buscar.tsx 'src/routes/profesionales.$slug.tsx' src/components/home/Testimonials.tsx src/routes/__root.tsx
npm run dev
```

Expected:
- build exits `0`
- targeted eslint exits `0`
- dev server starts on `http://localhost:8080/`

Known:
- full `npm run lint` fails from pre-existing repo-wide issues outside this pass
- route tree may regenerate as a side effect and should be restored if not intentional

## Files Changed In The Feature Branch

```text
src/components/home/Testimonials.tsx
src/lib/plan-access.ts
src/routes/__root.tsx
src/routes/buscar.tsx
src/routes/profesionales.$slug.tsx
```

Handoff files added:

```text
README.md
CONTEXT.md
PLAN.md
SKILL.md
```
