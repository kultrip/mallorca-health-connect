# Analytics, Conversational Search, Activities, And Billing Data Design

## Purpose

This phase turns Mallorca Holistica from a mostly browsable directory into a measurable marketplace:

- visitors can describe how they feel and receive professionals who treat those needs
- admins can understand what is happening across the whole platform
- professionals can understand their own performance
- activities can be created only by authorized users
- billing/tax data can support Stripe invoices and professional accounting

The work should be split into implementation passes, with the analytics/event foundation first.

## Current Baseline

Already present:

- `help_areas` describes needs/problems such as anxiety, fatigue, stress, sleep, and emotional overwhelm.
- `therapist_help_areas` links professionals to the needs they say they treat.
- `ai_search_queries` logs conversational searches.
- `symptom-search` Edge Function already asks AI to infer help areas and therapies from free text, then returns professionals linked through `therapist_help_areas`.
- `profile_views` tracks public profile visits.
- `activities` table exists.
- `/dashboard/analytics` exists but currently only shows profile views for the current professional.
- `/dashboard/admin` exists for verification requests.
- `/dashboard/billing` exists and subscription links are correctly routed to `/dashboard/billing`.

Main gaps:

- analytics events are not unified
- contact clicks are not tracked
- activity views/clicks are not tracked
- search result impressions are not tracked
- admin analytics dashboard is not complete
- professional analytics dashboard is too thin
- activities creation permissions are not enforced by active plan
- professional onboarding does not yet collect NIF/tax identity

## Recommended Sequence

1. **Analytics/event foundation**
2. **Conversational search reliability and logging**
3. **Admin analytics dashboard**
4. **Professional analytics dashboard**
5. **NIF/tax profile fields and Stripe customer tax data**
6. **Activities creation workflow and plan enforcement**

This order avoids building dashboards on incomplete event data.

## Analytics Event Foundation

Create a general event table for marketplace behavior.

Suggested table: `analytics_events`

Fields:

- `id`
- `event_type`
- `visitor_id`
- `user_id`
- `therapist_id`
- `activity_id`
- `search_query_id`
- `metadata`
- `created_at`

Initial event types:

- `conversational_search`
- `search_result_impression`
- `professional_profile_view`
- `professional_contact_click`
- `activity_view`
- `activity_contact_click`

Keep `profile_views` for backward compatibility in the short term, but new dashboards should read from `analytics_events`.

Privacy:

- visitors do not need accounts
- use anonymous `visitor_id`, stored in browser localStorage
- do not store sensitive health text outside the existing `ai_search_queries.query` unless intentionally needed for admin search analytics
- aggregate analytics in dashboards by counts, not by exposing individual visitor journeys

## Conversational Search Design

The existing `symptom-search` function should remain the search brain.

Target flow:

1. Visitor enters text such as "Estoy ansiosa, cansada y no duermo bien".
2. Edge Function loads `help_areas` and therapies.
3. AI maps the text to help area slugs and therapy slugs.
4. Function resolves help area IDs.
5. Function finds professionals linked in `therapist_help_areas`.
6. Function returns published professionals, ranked by verification and number of matched help areas.
7. Function logs:
   - `ai_search_queries`
   - `analytics_events.conversational_search`
   - `analytics_events.search_result_impression` for returned professionals

Fallback:

- if AI fails, use keyword matching against `help_areas.keywords`
- if no help area matches, return a graceful empty state and log the query

Ranking v1:

- published only
- verified first
- professionals matching more inferred help areas first
- active paid plans should not affect ranking in this first analytics/search pass

## Admin Analytics Dashboard

Admin should see whole-platform statistics:

- searches today
- searches over time
- most common searches / inferred help areas
- professionals most shown in search results
- professionals most visited
- professionals with most contact clicks
- activities most visited
- activities with most contact clicks
- conversion funnel:
  - search
  - impression
  - profile view
  - contact click
- verification/subscription overview:
  - pending verification requests
  - verified professionals
  - active subscriptions by plan

Use server-side/admin-safe queries for admin analytics. Do not expose platform-wide analytics through public RLS reads.

## Professional Analytics Dashboard

Professional users should see only their own data:

- profile visits
- appearances in search results
- contact clicks
- top inferred help areas where they appeared
- activity visits and contact clicks for their own activities
- basic trend by day

Professional dashboard must filter by `therapists.user_id = auth.uid()`.

## Contact Tracking

Track contact clicks when a visitor clicks:

- WhatsApp
- website
- reservation link

Event:

```text
professional_contact_click
```

Metadata:

```json
{
  "channel": "whatsapp|website|reservation"
}
```

The click should still happen even if event logging fails.

## Activities

Creation rules:

- Admin can create/edit/publish any activity.
- Professionals with active `centros-organizadores` plan can create activities.
- `profesional` plan cannot create activities in this phase.

Activity analytics:

- public activity page logs `activity_view`
- activity booking/contact link logs `activity_contact_click`

Activities should reuse existing `activities` table first. Add fields only when the creation UI needs them.

## Billing, NIF, And Invoices

Professionals should provide billing/tax details during onboarding or before checkout:

- NIF/CIF/NIE
- legal billing name
- billing address
- city/postal code/country

Store these fields on `therapists` or a separate `billing_profiles` table.

- create `billing_profiles` keyed by `user_id` and optionally `therapist_id`
- send billing details to Stripe Customer before checkout
- create Stripe customer tax ID when NIF is present, if supported by the Stripe account/country configuration

Invoices:

- Stripe Customer Portal should let professionals download invoices.
- The app can link to the portal instead of generating invoices itself.
- Future admin dashboard can show invoice/payment status from Stripe-derived subscription data.

## Route And UI Notes

Routes:

- `/search`: conversational search results
- `/dashboard/analytics`: professional analytics by default
- `/dashboard/admin`: keep verification
- add `/dashboard/admin/analytics` or add an analytics tab inside `/dashboard/admin`
- add `/dashboard/activities` in the activity workflow pass for professional/admin activity management

The dashboard sidebar currently has a working `Suscripción` link to `/dashboard/billing`.

## Error Handling

- Analytics logging is best-effort and should not block visitor navigation.
- Search should return graceful empty states when AI, database, or matching fails.
- Admin analytics should show zero states when there is no data.
- Professional analytics should show only owned data and zero states for new professionals.

## Testing And Verification

Minimum checks:

- conversational query maps to help areas and returns linked professionals
- failed AI request falls back to keyword matching or graceful empty state
- search logs query and analytics events
- contact clicks log events without blocking navigation
- admin analytics cannot be read by a non-admin
- professional analytics excludes other professionals' data
- activities creation is blocked for Free/Profesional users and allowed for Centros/admin
- NIF/tax fields are stored and passed to Stripe customer setup

## Open Implementation Notes

- This spec intentionally starts with analytics/event foundation because dashboards depend on reliable event capture.
- The current `symptom-search` Edge Function reads `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; if Supabase blocks those secret names, mirror the Stripe webhook pattern and read `SECRET_SUPABASE_URL` / `SECRET_SUPABASE_SERVICE_ROLE_KEY` with fallback support.
- The professional subscription link was checked during this design pass: route tree includes `/dashboard/billing`, and `src/routes/dashboard.tsx` links to that route.
