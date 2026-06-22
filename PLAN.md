# Mallorca Holística Plan

## Current Stage

Owner-visible polish, public route alignment, Therapy guide MVP, and Professional Workflows (Registration, Dashboard, Admin Validation, Analytics) are complete on branch:

```text
main
```

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
- [x] Wrote and committed route alignment plan:
  - `docs/superpowers/plans/2026-05-10-public-route-alignment.md`
- [x] Implemented canonical public routes:
  - `/professionals`
  - `/professionals/$slug`
  - `/therapies`
  - `/activities`
  - `/search`
  - `/trust`
  - `/plans`
  - `/register`
  - `/for-professionals`
- [x] Kept Spanish public routes as compatibility redirects.
- [x] Wrote and committed Therapy guide design spec:
  - `docs/superpowers/specs/2026-05-11-therapy-guide-design.md`
- [x] Wrote and committed Therapy guide implementation plan:
  - `docs/superpowers/plans/2026-05-11-therapy-guide.md`
- [x] Implemented Therapy guide MVP:
  - `/therapies` A-Z Supabase-powered guide
  - `/therapies/$slug` detail pages
  - related professionals via `therapist_therapies`
  - `/terapias/$slug` compatibility redirect
- [x] Implemented UI/UX polish on the main page (typography, contrast, navigation, search bar, background fade).
- [x] Implemented Professional Workflows & Admin Dashboard:
  - `/register` & `/login` using Supabase Auth.
  - `/onboarding` for new professionals to create a `pending` profile.
  - `/dashboard` layout and `/dashboard/index` for profile management.
  - `/dashboard/admin` for admins to approve/reject pending professionals.
  - `/dashboard/analytics` with a `profile_views` database table and public profile tracking.
- [x] Expanded Professional profile editor:
  - complete public therapist ficha editing
  - direct contact fields
  - address/location and modalities
  - therapy links and help-area links for matching
  - optional session offerings
- [x] Implemented analytics/search foundation:
  - `analytics_events`
  - conversational search logging
  - profile/contact tracking
  - professional analytics summary
  - admin analytics summary
- [x] Implemented optional billing/fiscal profile:
  - private `billing_profiles`
  - optional NIF/NIE/CIF fields
  - Stripe customer billing metadata sync before Checkout
- [x] Implemented provider-free map panels alongside professional lists:
  - `/professionals`
  - `/search` recommendations
  - `/therapies/$slug` related professionals
- [x] Implemented Admin data management:
  - professional operations
  - therapy/help-area/activity editing
  - read-only plan overview
  - admin email center with `admin_email_logs`
- [x] Implemented MVP location data completion:
  - `therapists.city` public city/area field
  - professional onboarding/dashboard/admin location editing
  - city-aware public cards, search filtering, and map labels
  - profile map fallback through municipality coordinates

## Remaining Integration Decision

Ask the user what to do with the branch:

1. Merge back to `main` locally
2. Push and create a Pull Request
3. Keep the branch as-is
4. Discard this work

User has not yet chosen an integration option.

## Recommended Next Steps

User-approved MVP finish sequence:

1. Professional profile editing: done.
2. Optional billing/fiscal profile for invoices: done.
   - private `billing_profiles`
   - optional NIF/NIE/CIF fields
   - legal billing name and billing address
   - Stripe customer billing metadata sync before Checkout
3. Admin data management: done.
4. End-to-end Stripe test:
   - checkout
   - webhook
   - paid contact benefit unlock
   - Customer Portal and invoices
   - preapproval paid plan setup before verification
5. Production deployment readiness:
   - env/secrets check
   - Stripe webhook endpoint check
   - Resend sender/domain check
   - production smoke QA

Deferred beyond MVP:
- Activities/agenda creation and public activity detail/list expansion.

Standing UX requirement:
- Any professional result list should be paired with a Mallorca map showing the listed professionals where location is useful:
  - hero/search-box results
  - conversational AI recommendations
  - `/professionals`
  - therapy-related professional lists
  - future admin/public professional listings
- Professionals should enter an address and a plain-language city. The city is the important search/display unit; it does not need to be constrained to the formal municipality/town taxonomy.
- Use `lat`/`lng` for map pins when available. Public lists and profiles fall back to municipality coordinates when exact professional coordinates are missing.

## Verification Commands

Commands:

```bash
npm run build
npx eslint src/lib/plan-access.ts src/lib/routes.ts src/lib/redirects.ts src/lib/route-schemas.ts src/features/professionals/ProfessionalsPage.tsx src/features/professionals/ProfessionalProfilePage.tsx src/features/search/ConversationalSearchPage.tsx src/routes/professionals.tsx 'src/routes/professionals_.$slug.tsx' src/routes/search.tsx src/components/home/Testimonials.tsx src/routes/__root.tsx
npx eslint src/features/therapies/types.ts src/features/therapies/therapy-utils.ts src/features/therapies/TherapiesPage.tsx src/features/therapies/TherapyDetailPage.tsx src/routes/therapies.tsx 'src/routes/therapies_.$slug.tsx' 'src/routes/terapias_.$slug.tsx' src/lib/routes.ts src/lib/redirects.ts
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
src/components/home/StartHere.tsx
src/components/layout/SiteFooter.tsx
src/components/layout/SiteHeader.tsx
src/components/search/SearchBar.tsx
src/components/search/SymptomPrompt.tsx
src/components/therapists/TherapistCard.tsx
src/features/professionals/ProfessionalProfilePage.tsx
src/features/professionals/ProfessionalsPage.tsx
src/features/search/ConversationalSearchPage.tsx
src/features/therapies/TherapiesPage.tsx
src/features/therapies/TherapyDetailPage.tsx
src/features/therapies/therapy-utils.ts
src/features/therapies/types.ts
src/lib/plan-access.ts
src/lib/redirects.ts
src/lib/route-schemas.ts
src/lib/routes.ts
src/routes/__root.tsx
src/routes/*
```

Handoff files added:

```text
README.md
CONTEXT.md
PLAN.md
SKILL.md
```
