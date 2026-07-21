# Mallorca Holística

Mallorca Holística is a public discovery platform for verified holistic wellbeing professionals in Mallorca.

Visitors can:

- search professionals by therapy, name, modality, and location
- describe their current state in natural language, such as anxiety, sadness, fatigue, or pain
- receive therapist recommendations based on needs/help areas
- open therapist profile pages with richer detail and plan-dependent contact actions

When professionals are listed or recommended, the experience should include a companion map of
Mallorca whenever location data is available. Professional location entry should collect address and
plain-language city; `lat`/`lng` powers exact map pins, with municipality coordinates as fallback.
The MVP map is provider-free: it uses public therapist coordinates first, municipality coordinates
as fallback, and hides itself when a result set has no usable coordinates.

Professionals can:

- register and complete a profile onboarding flow
- publish a verified profile (once approved by an admin)
- manage their full public ficha via a secure dashboard
- view their profile analytics
- choose a subscription plan

Activities/agenda publishing is deferred beyond the MVP.

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

Active branch:

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

## Professional Verification Email Environment

Local Resend testing uses:

```text
RESEND_API_KEY
RESEND_FROM_EMAIL=charles.santana@kultrip.com
ADMIN_EMAIL=charles.santana@kultrip.com
```

Production target after `mallorcaholistica.com` is verified in Resend:

```text
RESEND_FROM_EMAIL=hola@mallorcaholistica.com
ADMIN_EMAIL=hola@mallorcaholistica.com
```

## Supabase Migration Status

The repo is linked to Supabase project:

```text
zkmlbbbpfhbtbedskxcr
```

On 2026-05-12, `npx supabase db push` reported:

```text
Remote database is up to date.
```

`npx supabase migration list` confirmed the professional verification migration is present locally and remotely:

```text
20260512000000 | 20260512000000
```

## Stripe Subscription Environment

Paid plan selection can start before admin verification. Unverified professionals use Stripe
Checkout in setup mode to save a payment method; no subscription is created and no charge is made
until an admin approves the profile. Verified/published professionals use subscription Checkout
directly.

Fiscal invoice details are optional. Professionals can subscribe without NIF/CIF/NIE, and can add
legal billing details later from `/dashboard/billing` when they need invoices with tax data.

Application server/runtime needs:

```text
STRIPE_SECRET_KEY
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Supabase Edge Function `stripe-webhook` needs:

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
SECRET_SUPABASE_URL
SECRET_SUPABASE_SERVICE_ROLE_KEY
```

The webhook also accepts `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as local/dev fallbacks, but Supabase-hosted secrets should use the `SECRET_...` names above.

Current test-mode price IDs stored by migration `20260512000001_subscription_plan_mapping.sql`:

```text
profesional: price_1TVhCGB0PmMiFfkDBt929ffT
centros-organizadores: price_1TVhD1B0PmMiFfkDcDzJNeZg
```

Before live testing, confirm both prices exist in the connected Stripe account and activate/configure the Stripe Customer Portal. The webhook should listen for:

```text
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
```

On 2026-05-12, `npx supabase db push` applied migration `20260512000001`, and `npx supabase migration list` confirmed:

```text
20260512000001 | 20260512000001
```

The updated `stripe-webhook` Edge Function was deployed to project `zkmlbbbpfhbtbedskxcr`.

## Analytics And Conversational Search

The platform tracks marketplace events in `analytics_events`.

Tracked events:

- `conversational_search`
- `search_result_impression`
- `professional_profile_view`
- `professional_contact_click`
- `activity_view`
- `activity_contact_click`

`symptom-search` maps visitor text to `help_areas`, finds matching professionals through `therapist_help_areas`, logs the query in `ai_search_queries`, and logs search/impression events in `analytics_events`.

The professional dashboard at `/dashboard` is the editable source for the public therapist ficha.
Professionals maintain their public identity, contact channels, modalities, municipality,
narrative bio, training, experience, therapy categories, help areas used by conversational search,
plain-language city/area, address, optional exact coordinates, and optional session offerings.
Public contact benefits still depend on the active subscription plan confirmed by Stripe webhooks.

Admins manage MVP operations from `/dashboard/admin`: professional requests, professionals,
therapies, help areas, activities, plan overview, and an email center for individual or selected
bulk professional emails.

On 2026-05-13, `npx supabase db push` applied migration `20260513000000`, and `npx supabase migration list` confirmed:

```text
20260513000000 | 20260513000000
```

The updated `symptom-search` Edge Function was deployed to project `zkmlbbbpfhbtbedskxcr`.

On 2026-05-14, `npx supabase db push` applied migration `20260514000000`, adding
`therapists.city`, and `npx supabase migration list` confirmed:

```text
20260514000000 | 20260514000000
```

The updated `symptom-search` Edge Function was deployed again so conversational recommendations
include the public city/area field.

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
