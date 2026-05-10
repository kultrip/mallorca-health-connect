# Therapy Guide Design

## Goal

Build the public Therapy guide MVP for Mallorca Holística as a database-first A-Z reference. Visitors should be able to browse therapies, quickly find a therapy by name, open a therapy detail page, and discover related professionals.

This pass covers only the Therapy guide. Activities and Admin/professional workflows remain separate follow-up specs.

## Approved Decisions

- Data source: Supabase `therapies` table.
- Listing style: A-Z directory.
- Detail pages: every therapy links to a detail page, even if content is currently short.
- UI language: Spanish.
- URL language: canonical English routes.
- Visual direction: clean reference guide, not a marketing page.

## Public Routes

- `/therapies`: canonical Therapy guide index.
- `/therapies/$slug`: canonical therapy detail page.
- `/terapias`: existing Spanish compatibility redirect to `/therapies`.
- `/terapias/$slug`: Spanish compatibility redirect to `/therapies/$slug`.

## Data Model

Use existing generated Supabase types.

Primary table:

- `therapies`
  - `id`
  - `slug`
  - `name`
  - `category`
  - `short_description`
  - `description`
  - `created_at`

Relationship for related professionals:

- `therapist_therapies`
  - `therapy_id`
  - `therapist_id`
  - joins to `therapists`

Related professionals should use the same public eligibility as the professionals directory: `therapists.status = "published"`.

## Index Page

`/therapies` should replace the current coming-soon page.

It contains:

- `PageHeader`
  - eyebrow: `Guía`
  - title: `Guía de terapias`
  - intro: short orientation copy explaining that therapies can help visitors understand available approaches.
- Search input
  - filters client-side by therapy name and category.
  - does not need URL search params in the first version.
- A-Z index
  - generated from the first letter of available therapy names.
  - letters without therapies are omitted.
  - clicking a letter scrolls to that section.
- Therapy groups
  - grouped alphabetically by first letter.
  - sorted by `name`.
  - each therapy links to `/therapies/$slug`.
  - each item shows:
    - `name`
    - optional `category`
    - optional `short_description`
- Loading state
  - use skeleton rows/cards.
- Empty state
  - if no therapies exist, show a gentle message that the guide is being prepared.
- No-results state
  - if search returns no matches, invite the visitor to clear the search.

## Detail Page

`/therapies/$slug` shows one therapy.

It contains:

- Back link to `/therapies`.
- Therapy name.
- Optional category.
- `short_description` as the lead paragraph when present.
- `description` as the full body when present.
- Related professionals section.
  - Query published therapists linked through `therapist_therapies`.
  - Display with the existing `TherapistCard`.
  - Limit to a sensible initial number, such as 12.
- Related professionals empty state.
  - If no published professionals are linked yet, show a warm message:
    `Todavía no tenemos profesionales vinculados a esta terapia. Puedes explorar el directorio completo.`
  - Include a link to `/professionals`.
- Missing therapy state.
  - If no therapy matches the slug, show a not-found style message and link back to `/therapies`.

## Components And Boundaries

Create focused feature modules:

- `src/features/therapies/TherapiesPage.tsx`
  - owns fetching all therapies.
  - owns client-side search and A-Z grouping.
  - renders the index page content.

- `src/features/therapies/TherapyDetailPage.tsx`
  - owns fetching one therapy by slug.
  - owns fetching related professionals.
  - renders detail, related professionals, and empty/missing states.

- `src/routes/therapies.tsx`
  - keeps route metadata.
  - renders `TherapiesPage`.

- `src/routes/therapies.$slug.tsx`
  - route metadata using the slug.
  - renders `TherapyDetailPage`.

- `src/routes/terapias.$slug.tsx`
  - compatibility redirect to `/therapies/$slug`.

Update:

- `src/lib/routes.ts`
  - add `therapyDetail: "/therapies/$slug"`.

## Error Handling

- Supabase query errors should surface as gentle page-level error states.
- Do not expose raw error messages to visitors.
- Keep the page useful if related professionals fail separately:
  - therapy content can still render.
  - related professionals section can show a retry/gentle unavailable message.

## Testing And Verification

Required checks:

- `npm run build`
- targeted ESLint for touched therapy files and route helpers.
- browser check:
  - `/therapies` loads the A-Z guide.
  - search filters visible therapies.
  - clicking a therapy opens `/therapies/$slug`.
  - `/terapias` redirects to `/therapies`.
  - `/terapias/$slug` redirects to `/therapies/$slug`.

Known repo context:

- Full `npm run lint` currently fails from pre-existing repo-wide issues.
- Build may print the existing CSS `@import` warning and Wrangler log permission warning while still exiting `0`.

## Out Of Scope

- Editing therapies from an admin UI.
- Creating therapy content locally in code.
- Multilingual routing or translations.
- SEO schema markup beyond normal title/description metadata.
- Activity pages.
- Professional dashboard/admin workflows.

## Success Criteria

- Visitors can browse all Supabase therapies in a clear A-Z guide.
- Every listed therapy has a working detail page.
- Related published professionals appear when linked.
- Empty states are warm and useful.
- Existing Spanish `/terapias` route remains compatible.
