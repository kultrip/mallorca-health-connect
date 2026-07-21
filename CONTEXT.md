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
   - recommendations should be shown alongside a Mallorca map when locations are available

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
  - `Presencia` / Free: basic public presence, search appearance, specialties, location, no prominent direct conversion block.
  - `Profesional`: direct contact/reservation block after Stripe confirms an active subscription.
  - `Centros & Organizadores`: includes Profesional contact capabilities after Stripe confirms an active subscription, plus activity/agenda emphasis later.
- Paid plan selection can happen before admin verification; preapproval checkout saves a payment method and charges only after approval.
- Stripe webhook confirmation is the source of truth for paid plan benefits.
- Professional result lists should generally be paired with a map of Mallorca showing the professionals in the current result set.
- Professionals should enter an address and a plain-language city. The city is the important search/display unit and does not need to be constrained to the formal municipality/town taxonomy.
- Use `lat`/`lng` for map pins when available; public maps use municipality coordinates as fallback when exact professional coordinates are missing.
- Professional result maps are provider-free in the MVP. Use therapist coordinates first, municipality coordinates as fallback, and never use billing/fiscal address data for map pins.
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
main
```

Implemented on the branch:

- root metadata changed from Lovable to Mallorca Holística
- `src/lib/plan-access.ts` added for plan-aware contact decisions
- therapist profile page reworked toward Nadège MVP spec
- conversational search intro forced to concise owner-approved tone
- testimonials reduced to three natural owner-provided quotes
- public URL routes aligned to English/OpenAPI names with Spanish redirects
- Therapy guide MVP implemented
- UI/UX polish on the main page (typography, contrast, navigation, search bar, background fade).
- Professional Workflows & Admin Dashboard:
  - Authentication (`/login`, `/register`).
  - Professional Onboarding (`/onboarding`).
  - Protected Dashboard (`/dashboard`, `/dashboard/index`, `/dashboard/admin`, `/dashboard/analytics`).
  - `/dashboard` lets a professional maintain the full public ficha fields from the product documentation, including therapies and help areas that feed public filtering and conversational matching.
  - `profile_views` analytics tracking.
- Subscription MVP:
  - `/dashboard/billing` loads billing-enabled plans from Supabase.
  - Unverified professionals can choose a paid plan; Stripe Checkout runs in setup mode and stores a payment method for later.
  - Admin approval attempts to create the pending Stripe subscription with the saved payment method.
  - Stripe webhooks update `stripe_customer_id`, setup intent/payment method fields, `stripe_subscription_id`, `stripe_price_id`, `subscription_status`, and active `plan_id`.
  - public direct-contact actions require verified/published profile, active subscription, and a paid plan slug.
  - Billing/fiscal details are optional and private. Checkout works without them; if present, they sync to the Stripe customer before Checkout for invoice metadata.
- Analytics/search foundation:
  - `analytics_events` is the canonical event table for dashboards.
  - `symptom-search` maps visitor text to `help_areas`, finds matching professionals through `therapist_help_areas`, and logs search/impression events.
  - professional profile views and contact clicks are tracked.
  - `/dashboard/analytics` reads own profile/search/contact data through `therapist_analytics_summary`.
  - `/dashboard/admin/analytics` reads platform-wide aggregate data through `admin_analytics_summary`.
- Admin data management console:
  - tabs for requests, professionals, therapies, help areas, activities, plans, and emails.
  - admin email center sends Resend emails to selected professionals and logs one row per recipient.
- Location data completion:
  - `therapists.city` stores the public city/area label.
  - onboarding, professional dashboard, and admin professional editor collect city, address, map zone, and optional exact coordinates.
  - professional cards, public profile, directory search, therapy-related lists, and conversational recommendations carry the city field.
  - provider-free maps use exact professional coordinates first and municipality coordinates second.

## MVP Finish Sequence

The user approved this order for the remaining MVP work:

1. Professional profile editing: done.
2. Optional billing/fiscal profile for invoices: done.
3. Admin data management.
4. End-to-end Stripe test and Customer Portal/invoice check.
5. Production deployment readiness.

Activities are explicitly deferred beyond MVP.

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

## Supabase Remote Migration Status

Project ref:

```text
zkmlbbbpfhbtbedskxcr
```

On 2026-05-12, the repo was linked with:

```bash
npx supabase link --project-ref zkmlbbbpfhbtbedskxcr
```

Then migrations were checked with:

```bash
npx supabase db push
npx supabase migration list
```

Supabase reported the remote database is up to date, and migration `20260512000000` is present on both local and remote. This means the professional verification columns from `supabase/migrations/20260512000000_professional_verification_workflow.sql` have been applied to the linked remote project.

Subscription migration `20260512000001_subscription_plan_mapping.sql` adds Stripe mapping fields to `plans` and seeds these test-mode price IDs:

```text
profesional: price_1TVhCGB0PmMiFfkDBt929ffT
centros-organizadores: price_1TVhD1B0PmMiFfkDcDzJNeZg
```

Before end-to-end subscription testing, confirm those prices exist in the connected Stripe account, configure the Stripe Customer Portal, set the Edge Function secrets, deploy `stripe-webhook`, and push migration `20260512000001`.

On 2026-05-12:

```text
20260512000001 | 20260512000001
```

was confirmed by `npx supabase migration list`, and `npx supabase functions deploy stripe-webhook` deployed the updated Stripe webhook to project `zkmlbbbpfhbtbedskxcr`.

Remaining external setup: configure Customer Portal, create the Stripe webhook endpoint, and set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SECRET_SUPABASE_URL`, and `SECRET_SUPABASE_SERVICE_ROLE_KEY` for the Edge Function.

## Analytics Foundation

`analytics_events` is the canonical event table for dashboards.

Professional analytics reads own profile/search/contact data through `therapist_analytics_summary`.
Admin analytics reads platform-wide aggregate data through `admin_analytics_summary`.
Search analytics is logged by the `symptom-search` Edge Function.

On 2026-05-13:

```text
20260513000000 | 20260513000000
```

was confirmed by `npx supabase migration list`, and `npx supabase functions deploy symptom-search` deployed the updated search function to project `zkmlbbbpfhbtbedskxcr`.

On 2026-05-14, `npx supabase db push` applied migration `20260514000000`, adding
`therapists.city`, and `npx supabase migration list` confirmed:

```text
20260514000000 | 20260514000000
```

`npx supabase functions deploy symptom-search` deployed the updated search function again so
conversational recommendations include the public city/area field.

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
