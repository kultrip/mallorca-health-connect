# Professional Results Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a provider-free Mallorca map beside existing professional result lists when public location coordinates are available.

**Architecture:** Extend the shared therapist card data shape with public location fields, add focused map utility/component files, then replace the three successful result grids with a reusable `ProfessionalResultsWithMap` wrapper. Public queries and `symptom-search` will select therapist coordinates plus municipality fallback coordinates; professionals without usable coordinates remain in the list without pins.

**Tech Stack:** React, TypeScript, TanStack Query, Supabase client, Supabase Edge Function, existing Tailwind/shadcn UI tokens, lucide-react icons.

---

## File Structure

- Modify `src/components/therapists/TherapistCard.tsx`
  - Extend `TherapistCardData` with public map/location fields.

- Create `src/components/therapists/professional-map-utils.ts`
  - Converts `TherapistCardData[]` into validated Mallorca map pins.
  - Keeps coordinate fallback and bounds logic testable outside React.

- Create `src/components/therapists/ProfessionalsMap.tsx`
  - Renders provider-free Mallorca map panel and pin buttons.
  - Hides when no pins exist.

- Create `src/components/therapists/ProfessionalResultsWithMap.tsx`
  - Renders existing `TherapistCard` list with optional map column.

- Modify `src/features/professionals/ProfessionalsPage.tsx`
  - Selects location fields.
  - Uses `ProfessionalResultsWithMap`.

- Modify `src/features/search/ConversationalSearchPage.tsx`
  - Uses `ProfessionalResultsWithMap`.

- Modify `src/features/therapies/TherapyDetailPage.tsx`
  - Selects location fields.
  - Uses `ProfessionalResultsWithMap`.

- Modify `src/features/therapies/types.ts`
  - Keeps related-therapist row type compatible with the richer `TherapistCardData`.

- Modify `supabase/functions/symptom-search/index.ts`
  - Returns location fields for AI-recommended professionals.

- Modify `README.md`, `CONTEXT.md`, `PLAN.md`, and `SKILL.md`
  - Documents the implemented map/list pattern and provider-free MVP rule.

## Task 1: Extend Shared Professional Data Shape

**Files:**
- Modify: `src/components/therapists/TherapistCard.tsx`

- [ ] **Step 1: Extend `TherapistCardData`**

Change the type to:

```ts
export type TherapistCardData = {
  id: string;
  slug: string;
  full_name: string;
  headline?: string | null;
  frase_clave?: string | null;
  photo_url?: string | null;
  especialidad?: string | null;
  modalities?: string[] | null;
  verified?: boolean | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  municipalities?: {
    name: string;
    slug: string;
    lat?: number | null;
    lng?: number | null;
  } | null;
};
```

- [ ] **Step 2: Verify type-only change**

Run:

```bash
npx tsc --noEmit
```

Expected: exits `0`.

## Task 2: Add Map Pin Utility

**Files:**
- Create: `src/components/therapists/professional-map-utils.ts`

- [ ] **Step 1: Create utility module**

Create `src/components/therapists/professional-map-utils.ts`:

```ts
import type { TherapistCardData } from "./TherapistCard";

export type ProfessionalMapPin = {
  id: string;
  slug: string;
  name: string;
  locationLabel: string;
  x: number;
  y: number;
  source: "therapist" | "municipality";
};

const MALLORCA_BOUNDS = {
  minLat: 39.25,
  maxLat: 39.98,
  minLng: 2.25,
  maxLng: 3.55,
};

export function getProfessionalMapPins(professionals: TherapistCardData[]): ProfessionalMapPin[] {
  return professionals
    .map((professional) => toMapPin(professional))
    .filter((pin): pin is ProfessionalMapPin => Boolean(pin));
}

export function hasProfessionalMapPins(professionals: TherapistCardData[]) {
  return getProfessionalMapPins(professionals).length > 0;
}

function toMapPin(professional: TherapistCardData): ProfessionalMapPin | null {
  const coordinates = getCoordinates(professional);
  if (!coordinates || !isInMallorcaBounds(coordinates.lat, coordinates.lng)) return null;

  return {
    id: professional.id,
    slug: professional.slug,
    name: professional.full_name,
    locationLabel: getLocationLabel(professional),
    x: toPercent(coordinates.lng, MALLORCA_BOUNDS.minLng, MALLORCA_BOUNDS.maxLng),
    y: 100 - toPercent(coordinates.lat, MALLORCA_BOUNDS.minLat, MALLORCA_BOUNDS.maxLat),
    source: coordinates.source,
  };
}

function getCoordinates(professional: TherapistCardData) {
  if (isFiniteNumber(professional.lat) && isFiniteNumber(professional.lng)) {
    return { lat: professional.lat, lng: professional.lng, source: "therapist" as const };
  }

  if (
    isFiniteNumber(professional.municipalities?.lat) &&
    isFiniteNumber(professional.municipalities?.lng)
  ) {
    return {
      lat: professional.municipalities.lat,
      lng: professional.municipalities.lng,
      source: "municipality" as const,
    };
  }

  return null;
}

function getLocationLabel(professional: TherapistCardData) {
  if (professional.municipalities?.name) return professional.municipalities.name;
  if (professional.address) return professional.address;
  return "Mallorca";
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isInMallorcaBounds(lat: number, lng: number) {
  return (
    lat >= MALLORCA_BOUNDS.minLat &&
    lat <= MALLORCA_BOUNDS.maxLat &&
    lng >= MALLORCA_BOUNDS.minLng &&
    lng <= MALLORCA_BOUNDS.maxLng
  );
}

function toPercent(value: number, min: number, max: number) {
  return ((value - min) / (max - min)) * 100;
}
```

- [ ] **Step 2: Run focused TypeScript**

Run:

```bash
npx tsc --noEmit
```

Expected: exits `0`.

## Task 3: Add Provider-Free Map Component

**Files:**
- Create: `src/components/therapists/ProfessionalsMap.tsx`

- [ ] **Step 1: Create `ProfessionalsMap`**

Create `src/components/therapists/ProfessionalsMap.tsx`:

```tsx
import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { useMemo, useState } from "react";

import type { TherapistCardData } from "./TherapistCard";
import { getProfessionalMapPins } from "./professional-map-utils";

type ProfessionalsMapProps = {
  professionals: TherapistCardData[];
  title?: string;
};

export function ProfessionalsMap({
  professionals,
  title = "Mapa de profesionales",
}: ProfessionalsMapProps) {
  const pins = useMemo(() => getProfessionalMapPins(professionals), [professionals]);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const selectedPin = pins.find((pin) => pin.id === selectedPinId) ?? pins[0];

  if (pins.length === 0) return null;

  return (
    <aside className="rounded-3xl border border-border bg-card p-4 shadow-sm lg:sticky lg:top-24">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl">{title}</h2>
          <p className="text-xs text-muted-foreground">
            {pins.length} ubicación{pins.length === 1 ? "" : "es"} en Mallorca
          </p>
        </div>
        <MapPin className="h-5 w-5 text-primary" />
      </div>

      <div className="relative aspect-[1.2/1] overflow-hidden rounded-2xl border border-border bg-muted/30">
        <div
          aria-hidden="true"
          className="absolute inset-[10%] rounded-[52%_48%_55%_45%/44%_50%_50%_56%] border border-primary/20 bg-background shadow-inner"
        />
        <svg
          aria-hidden="true"
          viewBox="0 0 100 74"
          className="absolute inset-[12%] h-[76%] w-[76%] text-primary/10"
        >
          <path
            d="M8 34c7-17 27-26 48-25 17 1 31 7 36 18 5 10-2 22-14 29-15 9-36 10-52 3C13 53 3 45 8 34Z"
            fill="currentColor"
          />
        </svg>
        {pins.map((pin) => (
          <button
            key={pin.id}
            type="button"
            aria-label={`${pin.name}, ${pin.locationLabel}`}
            onClick={() => setSelectedPinId(pin.id)}
            className="absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-md transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
          </button>
        ))}
      </div>

      {selectedPin && (
        <div className="mt-4 rounded-2xl border border-border bg-background p-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {selectedPin.source === "municipality" ? "Zona aproximada" : "Ubicación"}
          </p>
          <Link
            to="/professionals/$slug"
            params={{ slug: selectedPin.slug }}
            className="mt-1 block font-display text-lg leading-tight hover:text-primary"
          >
            {selectedPin.name}
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">{selectedPin.locationLabel}</p>
        </div>
      )}
    </aside>
  );
}
```

- [ ] **Step 2: Run focused lint**

Run:

```bash
npx eslint src/components/therapists/ProfessionalsMap.tsx src/components/therapists/professional-map-utils.ts
```

Expected: exits `0`.

## Task 4: Add Results Layout Component

**Files:**
- Create: `src/components/therapists/ProfessionalResultsWithMap.tsx`

- [ ] **Step 1: Create wrapper component**

Create `src/components/therapists/ProfessionalResultsWithMap.tsx`:

```tsx
import { cn } from "@/lib/utils";

import { TherapistCard, type TherapistCardData } from "./TherapistCard";
import { ProfessionalsMap } from "./ProfessionalsMap";
import { hasProfessionalMapPins } from "./professional-map-utils";

type ProfessionalResultsWithMapProps = {
  professionals: TherapistCardData[];
  className?: string;
  mapTitle?: string;
};

export function ProfessionalResultsWithMap({
  professionals,
  className,
  mapTitle,
}: ProfessionalResultsWithMapProps) {
  const hasPins = hasProfessionalMapPins(professionals);

  if (!hasPins) {
    return (
      <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
        {professionals.map((professional) => (
          <TherapistCard key={professional.id} t={professional} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]", className)}>
      <div className="grid gap-6 sm:grid-cols-2">
        {professionals.map((professional) => (
          <TherapistCard key={professional.id} t={professional} />
        ))}
      </div>
      <ProfessionalsMap professionals={professionals} title={mapTitle} />
    </div>
  );
}
```

- [ ] **Step 2: Run focused lint**

Run:

```bash
npx eslint src/components/therapists/ProfessionalResultsWithMap.tsx src/components/therapists/ProfessionalsMap.tsx
```

Expected: exits `0`.

## Task 5: Update `/professionals`

**Files:**
- Modify: `src/features/professionals/ProfessionalsPage.tsx`

- [ ] **Step 1: Replace card import**

Replace:

```ts
import { TherapistCard, type TherapistCardData } from "@/components/therapists/TherapistCard";
```

With:

```ts
import type { TherapistCardData } from "@/components/therapists/TherapistCard";
import { ProfessionalResultsWithMap } from "@/components/therapists/ProfessionalResultsWithMap";
```

- [ ] **Step 2: Select public map fields**

Replace the therapist query select string with:

```ts
"id, slug, full_name, headline, frase_clave, photo_url, especialidad, modalities, verified, address, lat, lng, municipalities(name,slug,lat,lng)"
```

- [ ] **Step 3: Replace successful grid**

Replace the successful card grid with:

```tsx
<ProfessionalResultsWithMap
  professionals={therapists!}
  mapTitle="Profesionales en Mallorca"
/>
```

- [ ] **Step 4: Run focused lint**

Run:

```bash
npx eslint src/features/professionals/ProfessionalsPage.tsx src/components/therapists/ProfessionalResultsWithMap.tsx src/components/therapists/ProfessionalsMap.tsx
```

Expected: exits `0`.

## Task 6: Update Conversational Search

**Files:**
- Modify: `src/features/search/ConversationalSearchPage.tsx`
- Modify: `supabase/functions/symptom-search/index.ts`

- [ ] **Step 1: Replace card import**

In `src/features/search/ConversationalSearchPage.tsx`, replace:

```ts
import { TherapistCard, type TherapistCardData } from "@/components/therapists/TherapistCard";
```

With:

```ts
import type { TherapistCardData } from "@/components/therapists/TherapistCard";
import { ProfessionalResultsWithMap } from "@/components/therapists/ProfessionalResultsWithMap";
```

- [ ] **Step 2: Replace recommendation grid**

Replace:

```tsx
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
  {data.therapists.map((t) => (
    <TherapistCard key={t.id} t={t} />
  ))}
</div>
```

With:

```tsx
<ProfessionalResultsWithMap
  professionals={data.therapists}
  mapTitle="Recomendaciones en Mallorca"
/>
```

- [ ] **Step 3: Update Edge Function select**

In `supabase/functions/symptom-search/index.ts`, find the therapist select for recommended professionals and include:

```ts
address,
lat,
lng,
municipalities(name,slug,lat,lng)
```

The final selected therapist fields should include:

```ts
"id, slug, full_name, headline, frase_clave, photo_url, especialidad, modalities, verified, address, lat, lng, municipalities(name,slug,lat,lng)"
```

- [ ] **Step 4: Run focused lint**

Run:

```bash
npx eslint src/features/search/ConversationalSearchPage.tsx src/components/therapists/ProfessionalResultsWithMap.tsx src/components/therapists/ProfessionalsMap.tsx
```

Expected: exits `0`.

## Task 7: Update Therapy Detail Related Professionals

**Files:**
- Modify: `src/features/therapies/TherapyDetailPage.tsx`
- Modify: `src/features/therapies/types.ts`

- [ ] **Step 1: Replace card import**

Replace:

```ts
import { TherapistCard, type TherapistCardData } from "@/components/therapists/TherapistCard";
```

With:

```ts
import type { TherapistCardData } from "@/components/therapists/TherapistCard";
import { ProfessionalResultsWithMap } from "@/components/therapists/ProfessionalResultsWithMap";
```

- [ ] **Step 2: Select public map fields**

Replace the nested therapist select with:

```ts
"therapists(id, slug, full_name, headline, frase_clave, photo_url, especialidad, modalities, verified, address, lat, lng, municipalities(name,slug,lat,lng))"
```

- [ ] **Step 3: Replace related professionals grid**

Replace:

```tsx
<div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
  {relatedTherapists.map((therapist) => (
    <TherapistCard key={therapist.id} t={therapist} />
  ))}
</div>
```

With:

```tsx
<ProfessionalResultsWithMap
  professionals={relatedTherapists}
  className="mt-6"
  mapTitle={`Profesionales de ${therapy.name}`}
/>
```

- [ ] **Step 4: Verify related row type**

Open `src/features/therapies/types.ts` and keep:

```ts
export type RelatedTherapistRow = {
  therapists: TherapistCardData | TherapistCardData[] | null;
};
```

No extra fields are needed because `TherapistCardData` now includes map fields.

- [ ] **Step 5: Run focused lint**

Run:

```bash
npx eslint src/features/therapies/TherapyDetailPage.tsx src/features/therapies/types.ts src/components/therapists/ProfessionalResultsWithMap.tsx src/components/therapists/ProfessionalsMap.tsx
```

Expected: exits `0`.

## Task 8: Update Documentation

**Files:**
- Modify: `README.md`
- Modify: `CONTEXT.md`
- Modify: `PLAN.md`
- Modify: `SKILL.md`

- [ ] **Step 1: Update README**

Add under the existing professional map paragraph:

```md
The MVP map is provider-free: it uses public therapist coordinates first, municipality coordinates as fallback, and hides itself when a result set has no usable coordinates.
```

- [ ] **Step 2: Update CONTEXT**

Add under Major Product Decisions:

```md
- Professional result maps are provider-free in the MVP. Use therapist coordinates first, municipality coordinates as fallback, and never use billing/fiscal address data for map pins.
```

- [ ] **Step 3: Update PLAN**

Add under Completed Work:

```md
- [x] Implemented provider-free map panels alongside professional lists:
  - `/professionals`
  - `/search` recommendations
  - `/therapies/$slug` related professionals
```

- [ ] **Step 4: Update SKILL**

Add under Product Rules:

```md
- Professional list maps are provider-free for MVP. Use public therapist `lat`/`lng`, then municipality `lat`/`lng`; never use billing/fiscal addresses.
```

## Task 9: Verification

**Files:**
- Verify all files modified in Tasks 1-8.

- [ ] **Step 1: Run focused lint**

Run:

```bash
npx eslint src/components/therapists/TherapistCard.tsx src/components/therapists/professional-map-utils.ts src/components/therapists/ProfessionalsMap.tsx src/components/therapists/ProfessionalResultsWithMap.tsx src/features/professionals/ProfessionalsPage.tsx src/features/search/ConversationalSearchPage.tsx src/features/therapies/TherapyDetailPage.tsx src/features/therapies/types.ts
```

Expected: exits `0`.

- [ ] **Step 2: Run type check**

Run:

```bash
npx tsc --noEmit
```

Expected: exits `0`.

- [ ] **Step 3: Run build**

Run:

```bash
npm run build
```

Expected: exits `0`. A Wrangler log-write permission warning may appear while the build still succeeds.

- [ ] **Step 4: Optional Edge Function deploy**

Only after code verification, deploy the updated conversational search function:

```bash
npx supabase functions deploy symptom-search
```

Expected: deploy completes for project `zkmlbbbpfhbtbedskxcr`.

- [ ] **Step 5: Browser smoke**

Start the dev server:

```bash
npm run dev -- --host 127.0.0.1 --port 8081
```

Check:

- `/professionals`
- `/search?q=ansiedad`
- `/therapies/acupuntura`

Expected:

- pages render without runtime errors
- cards still show
- map panel appears when professionals have therapist or municipality coordinates
- map hides if current data has no usable coordinates

## Self-Review

- Spec coverage: The plan implements the shared data shape, provider-free map, three required result surfaces, Edge Function location fields, and documentation updates.
- Placeholder scan: No placeholder markers or deferred implementation text remain in implementation steps.
- Type consistency: `TherapistCardData`, `ProfessionalMapPin`, `ProfessionalsMap`, and `ProfessionalResultsWithMap` use consistent names and imports across all tasks.
