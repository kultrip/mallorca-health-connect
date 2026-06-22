# Location Data Completion Design

Date: 2026-05-14

## Goal

Make professional location data reliable enough for MVP search, maps, profile display, and admin review without adding a third-party maps/geocoding provider.

## Decisions

- Add `therapists.city` as the plain-language public city or service-area label.
- Keep `municipality_id` as the structured map/search fallback.
- Keep exact `lat`/`lng` optional.
- Use exact professional coordinates first.
- If exact coordinates are empty, use selected municipality coordinates for maps.
- Never use fiscal/billing addresses for public maps.
- Activities/agenda work is deferred beyond MVP.

## Product Behavior

- Professional onboarding asks for city/area, address or service zone, and map zone.
- Professional dashboard lets professionals maintain city/area, address, map zone, and optional coordinates.
- Admin professional editor can correct the same fields.
- Public cards and map pin labels prefer city/area, then municipality, then address.
- Directory free-text search includes city, address, and municipality names.
- Public profile map section appears when exact coordinates or municipality fallback coordinates exist.

## Non-Goals

- No Google Maps/Mapbox provider.
- No automatic geocoding.
- No mandatory exact address.
- No activity creation in MVP.
