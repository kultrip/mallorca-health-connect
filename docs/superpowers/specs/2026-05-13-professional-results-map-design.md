# Professional Results Map Design

## Goal

Add a lightweight Mallorca map alongside professional result lists so visitors can understand where recommended or filtered professionals are located.

## Scope

This MVP covers professional lists that already exist:

- `/professionals`
- conversational search recommendations at `/search`
- related professionals on `/therapies/$slug`

The map is a visual companion to the list. It is not a full route planner, booking interface, or external interactive map integration.

## Product Behavior

Whenever a page shows a list of professionals, the page should also show a Mallorca map if at least one listed professional has usable location coordinates.

The professional cards remain the primary browsing surface. The map helps visitors quickly see the geographic spread of results.

If none of the listed professionals have usable coordinates, the map is hidden and the current card-only layout remains.

## Map Type

Use a provider-free lightweight map panel for MVP.

Do not add Mapbox, Google Maps, Leaflet, OpenStreetMap tile loading, API keys, or external map services in this pass.

The map should render:

- a simple Mallorca silhouette or bounded map area
- professional pins positioned from coordinates
- a concise selected-pin summary with professional name and city/location

This keeps the feature fast, reliable, and independent from third-party provider decisions.

## Location Data Rules

Each professional can produce at most one map pin.

Coordinate priority:

1. Use therapist `lat` and `lng` when both exist.
2. Otherwise use related municipality `lat` and `lng` when both exist.
3. Otherwise show the professional in the list but do not create a map pin.

Professional location fields:

- therapist `address`
- therapist `lat`
- therapist `lng`
- municipality `name`
- municipality `slug`
- municipality `lat`
- municipality `lng`

The map uses public professional location only. It must never use private billing/fiscal address data.

## Components

### `ProfessionalsMap`

Responsibility:

- accepts professionals with optional coordinates
- computes valid pins
- renders the Mallorca map panel
- manages selected pin state locally
- hides itself when no pins exist

Suggested props:

```ts
type ProfessionalsMapProps = {
  professionals: TherapistCardData[];
  title?: string;
  emptyLabel?: string;
};
```

### `ProfessionalResultsWithMap`

Responsibility:

- lays out existing `TherapistCard` cards with the map
- preserves current empty/loading states by letting pages pass only real loaded professionals
- keeps card rendering consistent across `/professionals`, `/search`, and `/therapies/$slug`

Suggested props:

```ts
type ProfessionalResultsWithMapProps = {
  professionals: TherapistCardData[];
  className?: string;
  mapTitle?: string;
};
```

Layout:

- desktop: list grid on the left, sticky map panel on the right
- mobile: map above the cards, then the card list
- if no pins exist: card grid uses the full width

## Data Updates

Update professional queries to select map fields:

```sql
id,
slug,
full_name,
headline,
frase_clave,
photo_url,
especialidad,
modalities,
verified,
address,
lat,
lng,
municipalities(name, slug, lat, lng)
```

Update `TherapistCardData` to include:

```ts
address?: string | null;
lat?: number | null;
lng?: number | null;
municipalities?: {
  name: string;
  slug: string;
  lat?: number | null;
  lng?: number | null;
} | null;
```

The Supabase Edge Function `symptom-search` must also return these fields for recommended professionals.

## Pages

### `/professionals`

Replace the successful result grid with `ProfessionalResultsWithMap`.

The filters and count stay as they are.

### `/search`

Replace the recommendation grid with `ProfessionalResultsWithMap`.

The AI intro and search form stay as they are.

### `/therapies/$slug`

Replace the related-professionals grid with `ProfessionalResultsWithMap`.

The therapy content and empty state stay as they are.

## Visual Direction

The map should feel calm and editorial, not like a dense operations dashboard.

Use existing design tokens:

- `bg-card`
- `border-border`
- muted text
- primary accent for pins

Avoid oversized marketing graphics, decorative blobs, or a one-note color palette. The map should be practical and quiet.

## Accessibility

Pins should be buttons with readable labels.

Each pin label should include the professional name and location when available.

The selected-pin summary should be text, not only visual state.

The map panel should not trap keyboard focus.

## Error Handling

Invalid or missing coordinates are ignored for pins.

Coordinates outside a Mallorca bounding box are ignored for pins in this MVP, while the professional remains visible in the list.

If all coordinates are invalid or missing, the map hides and the page behaves like today.

## Verification

Automated checks:

- focused ESLint on new map components and changed pages
- `npx tsc --noEmit`
- `npm run build`

Manual smoke:

- `/professionals` shows cards plus map when coordinates exist
- `/search?q=ansiedad` shows recommendations plus map when coordinates exist
- `/therapies/acupuntura` shows related professionals plus map when coordinates exist
- pages still render card-only when professionals lack coordinates

## Non-Goals

- external map provider integration
- zoom and pan
- geocoding addresses
- route planning or directions
- clustering pins
- admin location management
- changing private billing/fiscal address behavior

## Self-Review

- The design keeps the map provider-free as requested.
- The map never uses billing/fiscal address data.
- The scope is focused on three existing professional result surfaces.
- Missing coordinates have explicit fallback behavior.
- No implementation depends on external API keys.
