# Analytics And Search Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the analytics event foundation for Mallorca Holistica, connect conversational search to help-area matching metrics, track contact clicks, and show first useful admin/professional analytics dashboards.

**Architecture:** Add a general `analytics_events` table and small RPC helpers in Supabase. Keep the existing `symptom-search` Edge Function as the search brain, but make it log search and impression events. Add a tiny browser analytics helper for anonymous visitor IDs and best-effort click/view tracking, then update professional/admin dashboards to read aggregate data through safe Supabase queries.

**Tech Stack:** Supabase Postgres/RLS/RPC/Edge Functions, React/TanStack Router, React Query, TypeScript, existing UI components, ESLint, Vite.

---

## Scope

This plan implements the first foundation pass from:

```text
docs/superpowers/specs/2026-05-13-analytics-search-activities-design.md
```

Included:

- unified analytics event table
- visitor ID helper
- conversational search logging and search result impressions
- profile view event logging
- contact click tracking for WhatsApp, website, and reservation links
- professional analytics dashboard with own profile/search/contact counts
- admin analytics route with platform-level counts
- docs/context updates

Deferred to separate plans:

- NIF/tax profile and Stripe invoice metadata
- activities creation UI and permission enforcement
- activity detail pages and activity analytics

## File Structure

- Create `supabase/migrations/20260513000000_analytics_events.sql`: analytics event table, indexes, RLS policies, and helper functions.
- Modify `src/integrations/supabase/types.ts`: add `analytics_events` table types and RPC function types.
- Create `src/lib/analytics.ts`: browser visitor ID and best-effort event tracking helper.
- Modify `supabase/functions/symptom-search/index.ts`: support `SECRET_SUPABASE_*` names, accept `visitorId`, log query plus search/impression events, and improve deterministic fallback.
- Modify `src/features/search/ConversationalSearchPage.tsx`: pass visitor ID to `symptom-search`.
- Modify `src/features/professionals/ProfessionalProfilePage.tsx`: track analytics profile view and contact clicks.
- Modify `src/routes/dashboard/analytics.tsx`: show professional-owned analytics.
- Create `src/routes/dashboard/admin/analytics.tsx`: show admin platform analytics.
- Modify `src/routes/dashboard.tsx`: add admin analytics nav link for admins.
- Modify `README.md` and `CONTEXT.md`: document the new analytics/search foundation.

---

### Task 1: Add Analytics Event Schema

**Files:**
- Create: `supabase/migrations/20260513000000_analytics_events.sql`
- Modify: `src/integrations/supabase/types.ts`

- [ ] **Step 1: Add the migration**

Create `supabase/migrations/20260513000000_analytics_events.sql`:

```sql
-- ============ ANALYTICS EVENTS ============
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'conversational_search',
      'search_result_impression',
      'professional_profile_view',
      'professional_contact_click',
      'activity_view',
      'activity_contact_click'
    )
  ),
  visitor_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  therapist_id UUID REFERENCES public.therapists(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  search_query_id UUID REFERENCES public.ai_search_queries(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created
ON public.analytics_events (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_therapist_created
ON public.analytics_events (therapist_id, created_at DESC)
WHERE therapist_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_analytics_events_activity_created
ON public.analytics_events (activity_id, created_at DESC)
WHERE activity_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_analytics_events_search_query
ON public.analytics_events (search_query_id)
WHERE search_query_id IS NOT NULL;

CREATE POLICY "analytics_events_insert_anyone"
ON public.analytics_events
FOR INSERT
WITH CHECK (true);

CREATE POLICY "analytics_events_admin_read"
ON public.analytics_events
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "analytics_events_therapist_owner_read"
ON public.analytics_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.therapists t
    WHERE t.id = analytics_events.therapist_id
      AND t.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM public.activities a
    JOIN public.therapists t ON t.id = a.therapist_id
    WHERE a.id = analytics_events.activity_id
      AND t.user_id = auth.uid()
  )
);

CREATE OR REPLACE FUNCTION public.track_analytics_event(
  _event_type TEXT,
  _visitor_id TEXT DEFAULT NULL,
  _therapist_id UUID DEFAULT NULL,
  _activity_id UUID DEFAULT NULL,
  _search_query_id UUID DEFAULT NULL,
  _metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _event_id UUID;
BEGIN
  INSERT INTO public.analytics_events (
    event_type,
    visitor_id,
    user_id,
    therapist_id,
    activity_id,
    search_query_id,
    metadata
  )
  VALUES (
    _event_type,
    _visitor_id,
    auth.uid(),
    _therapist_id,
    _activity_id,
    _search_query_id,
    COALESCE(_metadata, '{}'::jsonb)
  )
  RETURNING id INTO _event_id;

  RETURN _event_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_analytics_summary(_since TIMESTAMPTZ DEFAULT now() - interval '30 days')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _result JSONB;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT jsonb_build_object(
    'searches_today', (
      SELECT COUNT(*)
      FROM public.analytics_events
      WHERE event_type = 'conversational_search'
        AND created_at >= date_trunc('day', now())
    ),
    'searches_period', (
      SELECT COUNT(*)
      FROM public.analytics_events
      WHERE event_type = 'conversational_search'
        AND created_at >= _since
    ),
    'profile_views_period', (
      SELECT COUNT(*)
      FROM public.analytics_events
      WHERE event_type = 'professional_profile_view'
        AND created_at >= _since
    ),
    'contact_clicks_period', (
      SELECT COUNT(*)
      FROM public.analytics_events
      WHERE event_type = 'professional_contact_click'
        AND created_at >= _since
    ),
    'top_professionals', COALESCE((
      SELECT jsonb_agg(row_to_json(x))
      FROM (
        SELECT t.id, t.full_name, t.slug, COUNT(e.id) AS views
        FROM public.analytics_events e
        JOIN public.therapists t ON t.id = e.therapist_id
        WHERE e.event_type = 'professional_profile_view'
          AND e.created_at >= _since
        GROUP BY t.id, t.full_name, t.slug
        ORDER BY views DESC
        LIMIT 10
      ) x
    ), '[]'::jsonb),
    'top_help_areas', COALESCE((
      SELECT jsonb_agg(row_to_json(x))
      FROM (
        SELECT area_slug, COUNT(*) AS searches
        FROM public.ai_search_queries q
        CROSS JOIN LATERAL jsonb_array_elements_text(q.matched_help_areas) AS area_slug
        WHERE q.created_at >= _since
        GROUP BY area_slug
        ORDER BY searches DESC
        LIMIT 10
      ) x
    ), '[]'::jsonb)
  ) INTO _result;

  RETURN _result;
END;
$$;

CREATE OR REPLACE FUNCTION public.therapist_analytics_summary(_since TIMESTAMPTZ DEFAULT now() - interval '30 days')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _therapist_id UUID;
  _result JSONB;
BEGIN
  SELECT id INTO _therapist_id
  FROM public.therapists
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF _therapist_id IS NULL THEN
    RETURN jsonb_build_object(
      'profile_views_period', 0,
      'search_impressions_period', 0,
      'contact_clicks_period', 0,
      'contact_clicks_by_channel', '[]'::jsonb,
      'daily_counts', '[]'::jsonb
    );
  END IF;

  SELECT jsonb_build_object(
    'profile_views_period', (
      SELECT COUNT(*)
      FROM public.analytics_events
      WHERE therapist_id = _therapist_id
        AND event_type = 'professional_profile_view'
        AND created_at >= _since
    ),
    'search_impressions_period', (
      SELECT COUNT(*)
      FROM public.analytics_events
      WHERE therapist_id = _therapist_id
        AND event_type = 'search_result_impression'
        AND created_at >= _since
    ),
    'contact_clicks_period', (
      SELECT COUNT(*)
      FROM public.analytics_events
      WHERE therapist_id = _therapist_id
        AND event_type = 'professional_contact_click'
        AND created_at >= _since
    ),
    'contact_clicks_by_channel', COALESCE((
      SELECT jsonb_agg(row_to_json(x))
      FROM (
        SELECT metadata->>'channel' AS channel, COUNT(*) AS clicks
        FROM public.analytics_events
        WHERE therapist_id = _therapist_id
          AND event_type = 'professional_contact_click'
          AND created_at >= _since
        GROUP BY metadata->>'channel'
        ORDER BY clicks DESC
      ) x
    ), '[]'::jsonb),
    'daily_counts', COALESCE((
      SELECT jsonb_agg(row_to_json(x))
      FROM (
        SELECT
          date_trunc('day', created_at)::date AS day,
          COUNT(*) FILTER (WHERE event_type = 'professional_profile_view') AS profile_views,
          COUNT(*) FILTER (WHERE event_type = 'search_result_impression') AS search_impressions,
          COUNT(*) FILTER (WHERE event_type = 'professional_contact_click') AS contact_clicks
        FROM public.analytics_events
        WHERE therapist_id = _therapist_id
          AND created_at >= _since
        GROUP BY date_trunc('day', created_at)::date
        ORDER BY day ASC
      ) x
    ), '[]'::jsonb)
  ) INTO _result;

  RETURN _result;
END;
$$;
```

- [ ] **Step 2: Update generated Supabase types**

In `src/integrations/supabase/types.ts`, add table type `analytics_events` under `public.Tables`:

```ts
analytics_events: {
  Row: {
    activity_id: string | null
    created_at: string
    event_type: string
    id: string
    metadata: Json
    search_query_id: string | null
    therapist_id: string | null
    user_id: string | null
    visitor_id: string | null
  }
  Insert: {
    activity_id?: string | null
    created_at?: string
    event_type: string
    id?: string
    metadata?: Json
    search_query_id?: string | null
    therapist_id?: string | null
    user_id?: string | null
    visitor_id?: string | null
  }
  Update: {
    activity_id?: string | null
    created_at?: string
    event_type?: string
    id?: string
    metadata?: Json
    search_query_id?: string | null
    therapist_id?: string | null
    user_id?: string | null
    visitor_id?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "analytics_events_activity_id_fkey"
      columns: ["activity_id"]
      isOneToOne: false
      referencedRelation: "activities"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "analytics_events_search_query_id_fkey"
      columns: ["search_query_id"]
      isOneToOne: false
      referencedRelation: "ai_search_queries"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "analytics_events_therapist_id_fkey"
      columns: ["therapist_id"]
      isOneToOne: false
      referencedRelation: "therapists"
      referencedColumns: ["id"]
    },
  ]
}
```

Add these functions to `public.Functions`:

```ts
admin_analytics_summary: {
  Args: { _since?: string }
  Returns: Json
}
therapist_analytics_summary: {
  Args: { _since?: string }
  Returns: Json
}
track_analytics_event: {
  Args: {
    _activity_id?: string
    _event_type: string
    _metadata?: Json
    _search_query_id?: string
    _therapist_id?: string
    _visitor_id?: string
  }
  Returns: string
}
```

- [ ] **Step 3: Verify schema references**

Run:

```bash
rg -n "analytics_events|track_analytics_event|admin_analytics_summary|therapist_analytics_summary" supabase/migrations/20260513000000_analytics_events.sql src/integrations/supabase/types.ts
```

Expected: output shows the migration table, functions, and TypeScript entries.

---

### Task 2: Add Browser Analytics Helper

**Files:**
- Create: `src/lib/analytics.ts`

- [ ] **Step 1: Create visitor ID and tracking helper**

Create `src/lib/analytics.ts`:

```ts
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

const visitorStorageKey = "mh_visitor_id";

export type AnalyticsEventType =
  | "conversational_search"
  | "search_result_impression"
  | "professional_profile_view"
  | "professional_contact_click"
  | "activity_view"
  | "activity_contact_click";

type TrackEventInput = {
  eventType: AnalyticsEventType;
  therapistId?: string | null;
  activityId?: string | null;
  searchQueryId?: string | null;
  metadata?: Json;
};

export function getVisitorId() {
  if (typeof window === "undefined") return null;

  const existing = window.localStorage.getItem(visitorStorageKey);
  if (existing) return existing;

  const next =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(visitorStorageKey, next);
  return next;
}

export async function trackAnalyticsEvent(input: TrackEventInput) {
  const visitorId = getVisitorId();

  const { error } = await supabase.rpc("track_analytics_event", {
    _event_type: input.eventType,
    _visitor_id: visitorId,
    _therapist_id: input.therapistId ?? null,
    _activity_id: input.activityId ?? null,
    _search_query_id: input.searchQueryId ?? null,
    _metadata: input.metadata ?? {},
  });

  if (error) {
    console.warn("[analytics] event failed", error);
  }
}

export function trackAnalyticsEventSoon(input: TrackEventInput) {
  void trackAnalyticsEvent(input);
}
```

- [ ] **Step 2: Verify helper lint**

Run:

```bash
npx eslint src/lib/analytics.ts
```

Expected: exits 0.

---

### Task 3: Log Conversational Search Analytics

**Files:**
- Modify: `supabase/functions/symptom-search/index.ts`
- Modify: `src/features/search/ConversationalSearchPage.tsx`

- [ ] **Step 1: Accept `visitorId` from the browser**

In `src/features/search/ConversationalSearchPage.tsx`, import:

```ts
import { getVisitorId } from "@/lib/analytics";
```

Change the Edge Function invoke body from:

```ts
body: { query: q },
```

to:

```ts
body: { query: q, visitorId: getVisitorId() },
```

- [ ] **Step 2: Support Supabase secret names in the Edge Function**

In `supabase/functions/symptom-search/index.ts`, replace:

```ts
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
```

with:

```ts
const SUPABASE_URL =
  Deno.env.get("SECRET_SUPABASE_URL") || Deno.env.get("SUPABASE_URL") || "";
const SERVICE_KEY =
  Deno.env.get("SECRET_SUPABASE_SERVICE_ROLE_KEY") ||
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  "";
```

- [ ] **Step 3: Parse visitor ID in the Edge Function**

Replace:

```ts
const { query } = await req.json();
```

with:

```ts
const { query, visitorId } = await req.json();
const cleanVisitorId = typeof visitorId === "string" ? visitorId : null;
```

- [ ] **Step 4: Make AI fallback deterministic**

After loading `helpAreas`, add this helper near the bottom of the file:

```ts
function keywordMatchHelpAreas(
  query: string,
  helpAreas: Array<{ slug: string; name: string; keywords?: string[] | null }> | null | undefined,
) {
  const normalized = query.toLowerCase();

  return (helpAreas ?? [])
    .filter((area) => {
      const candidates = [area.slug, area.name, ...(area.keywords ?? [])].map((item) =>
        item.toLowerCase(),
      );
      return candidates.some((candidate) => normalized.includes(candidate));
    })
    .map((area) => area.slug)
    .slice(0, 4);
}
```

Change:

```ts
const matchedHelpAreas = parsed.matched_help_areas ?? [];
```

to:

```ts
const matchedHelpAreas =
  parsed.matched_help_areas && parsed.matched_help_areas.length > 0
    ? parsed.matched_help_areas
    : keywordMatchHelpAreas(query, helpAreas);
```

- [ ] **Step 5: Insert search query and keep its ID**

Replace the best-effort `ai_search_queries` insert:

```ts
await supabase.from("ai_search_queries").insert({
  query,
  ai_intro: parsed.intro,
  matched_help_areas: matchedHelpAreas,
  suggested_therapies: suggestedTherapies,
});
```

with:

```ts
const { data: searchLog } = await supabase
  .from("ai_search_queries")
  .insert({
    query,
    ai_intro: parsed.intro,
    matched_help_areas: matchedHelpAreas,
    suggested_therapies: suggestedTherapies,
  })
  .select("id")
  .single();

const searchQueryId = searchLog?.id ?? null;
```

- [ ] **Step 6: Insert analytics events from the Edge Function**

After `searchQueryId`, insert:

```ts
await supabase.from("analytics_events").insert({
  event_type: "conversational_search",
  visitor_id: cleanVisitorId,
  search_query_id: searchQueryId,
  metadata: {
    query_length: query.length,
    matched_help_areas: matchedHelpAreas,
    suggested_therapies: suggestedTherapies,
  },
});

if (therapists.length > 0) {
  await supabase.from("analytics_events").insert(
    therapists.map((therapist) => ({
      event_type: "search_result_impression",
      visitor_id: cleanVisitorId,
      therapist_id: therapist.id,
      search_query_id: searchQueryId,
      metadata: {
        matched_help_areas: matchedHelpAreas,
      },
    })),
  );
}
```

- [ ] **Step 7: Return `search_query_id` to the browser**

Add `search_query_id` to the JSON response:

```ts
return json({
  intro: parsed.intro ?? "",
  matched_help_areas: matchedHelpAreas,
  suggested_therapies: suggestedTherapies,
  search_query_id: searchQueryId,
  therapists,
});
```

- [ ] **Step 8: Update search result type**

In `src/features/search/ConversationalSearchPage.tsx`, add:

```ts
search_query_id?: string | null;
```

to `SearchResult`.

- [ ] **Step 9: Verify search files**

Run:

```bash
npx eslint src/features/search/ConversationalSearchPage.tsx src/lib/analytics.ts
```

Expected: exits 0.

Deploy function after local verification:

```bash
npx supabase functions deploy symptom-search
```

Expected: deploy succeeds on project `zkmlbbbpfhbtbedskxcr`.

---

### Task 4: Track Profile Views And Contact Clicks

**Files:**
- Modify: `src/features/professionals/ProfessionalProfilePage.tsx`

- [ ] **Step 1: Import analytics helper**

Add:

```ts
import { trackAnalyticsEventSoon } from "@/lib/analytics";
```

- [ ] **Step 2: Track profile views in the new event table**

Inside the existing `useEffect` that calls `track_profile_view`, add:

```ts
trackAnalyticsEventSoon({
  eventType: "professional_profile_view",
  therapistId: data.id,
});
```

Expected behavior: both legacy `profile_views` and new `analytics_events` receive profile views.

- [ ] **Step 3: Track WhatsApp clicks**

On the WhatsApp `<a>` element, add:

```tsx
onClick={() =>
  trackAnalyticsEventSoon({
    eventType: "professional_contact_click",
    therapistId: data.id,
    metadata: { channel: "whatsapp" },
  })
}
```

- [ ] **Step 4: Track reservation clicks**

On the reservation link `<a>` element, add:

```tsx
onClick={() =>
  trackAnalyticsEventSoon({
    eventType: "professional_contact_click",
    therapistId: data.id,
    metadata: { channel: "reservation" },
  })
}
```

- [ ] **Step 5: Track website clicks**

On the website link `<a>` element, add:

```tsx
onClick={() =>
  trackAnalyticsEventSoon({
    eventType: "professional_contact_click",
    therapistId: data.id,
    metadata: { channel: "website" },
  })
}
```

- [ ] **Step 6: Verify profile tracking lint**

Run:

```bash
npx eslint src/features/professionals/ProfessionalProfilePage.tsx src/lib/analytics.ts
```

Expected: exits 0.

---

### Task 5: Build Professional Analytics Dashboard

**Files:**
- Modify: `src/routes/dashboard/analytics.tsx`

- [ ] **Step 1: Replace the current single-count page with RPC summary**

Replace `src/routes/dashboard/analytics.tsx` with:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { Eye, MousePointerClick, Search, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/analytics")({
  component: AnalyticsPage,
});

type ChannelCount = {
  channel: string | null;
  clicks: number;
};

type DayCount = {
  day: string;
  profile_views: number;
  search_impressions: number;
  contact_clicks: number;
};

type TherapistSummary = {
  profile_views_period: number;
  search_impressions_period: number;
  contact_clicks_period: number;
  contact_clicks_by_channel: ChannelCount[];
  daily_counts: DayCount[];
};

const emptySummary: TherapistSummary = {
  profile_views_period: 0,
  search_impressions_period: 0,
  contact_clicks_period: 0,
  contact_clicks_by_channel: [],
  daily_counts: [],
};

function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<TherapistSummary>(emptySummary);

  useEffect(() => {
    void loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const { data, error } = await supabase.rpc("therapist_analytics_summary", {
      _since: since.toISOString(),
    });

    if (!error && data) {
      setSummary(data as unknown as TherapistSummary);
    }

    setLoading(false);
  };

  if (loading) return <div>Cargando estadísticas...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Estadísticas</h1>
        <p className="text-muted-foreground">
          Analiza el rendimiento de tu perfil durante los últimos 30 días.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={<Eye className="h-4 w-4" />}
          label="Visitas al perfil"
          value={summary.profile_views_period}
        />
        <MetricCard
          icon={<Search className="h-4 w-4" />}
          label="Apariciones en búsquedas"
          value={summary.search_impressions_period}
        />
        <MetricCard
          icon={<MousePointerClick className="h-4 w-4" />}
          label="Contactos solicitados"
          value={summary.contact_clicks_period}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            Contactos por canal
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary.contact_clicks_by_channel.length > 0 ? (
            <div className="space-y-3">
              {summary.contact_clicks_by_channel.map((item) => (
                <div key={item.channel ?? "unknown"} className="flex justify-between text-sm">
                  <span className="capitalize">{labelForChannel(item.channel)}</span>
                  <span className="font-medium">{item.clicks}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aún no hay contactos registrados en este periodo.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
          {icon}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <span className="text-4xl font-semibold">{value}</span>
      </CardContent>
    </Card>
  );
}

function labelForChannel(channel: string | null) {
  if (channel === "whatsapp") return "WhatsApp";
  if (channel === "reservation") return "Reserva";
  if (channel === "website") return "Web";
  return "Otro";
}
```

- [ ] **Step 2: Verify professional dashboard lint**

Run:

```bash
npx eslint src/routes/dashboard/analytics.tsx
```

Expected: exits 0.

---

### Task 6: Build Admin Analytics Route

**Files:**
- Create: `src/routes/dashboard/admin/analytics.tsx`
- Modify: `src/routes/dashboard.tsx`

- [ ] **Step 1: Create admin analytics route**

Create `src/routes/dashboard/admin/analytics.tsx`:

```tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, MousePointerClick, Search, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/admin/analytics")({
  component: AdminAnalyticsPage,
});

type TopProfessional = {
  id: string;
  full_name: string;
  slug: string;
  views: number;
};

type TopHelpArea = {
  area_slug: string;
  searches: number;
};

type AdminSummary = {
  searches_today: number;
  searches_period: number;
  profile_views_period: number;
  contact_clicks_period: number;
  top_professionals: TopProfessional[];
  top_help_areas: TopHelpArea[];
};

const emptySummary: AdminSummary = {
  searches_today: 0,
  searches_period: 0,
  profile_views_period: 0,
  contact_clicks_period: 0,
  top_professionals: [],
  top_help_areas: [],
};

function AdminAnalyticsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AdminSummary>(emptySummary);

  useEffect(() => {
    void loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate({ to: "/login" });
      return;
    }

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const { data, error } = await supabase.rpc("admin_analytics_summary", {
      _since: since.toISOString(),
    });

    if (error) {
      navigate({ to: "/dashboard" });
      return;
    }

    setSummary((data as unknown as AdminSummary) ?? emptySummary);
    setLoading(false);
  };

  if (loading) return <div>Cargando estadísticas de administración...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <ShieldCheck className="h-6 w-6" />
          Estadísticas globales
        </h1>
        <p className="text-muted-foreground">
          Vista de actividad de la plataforma durante los últimos 30 días.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={<Search className="h-4 w-4" />} label="Búsquedas hoy" value={summary.searches_today} />
        <MetricCard icon={<Search className="h-4 w-4" />} label="Búsquedas 30 días" value={summary.searches_period} />
        <MetricCard icon={<Eye className="h-4 w-4" />} label="Visitas a perfiles" value={summary.profile_views_period} />
        <MetricCard icon={<MousePointerClick className="h-4 w-4" />} label="Contactos" value={summary.contact_clicks_period} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profesionales más visitados</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.top_professionals.length > 0 ? (
              <div className="space-y-3">
                {summary.top_professionals.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4 text-sm">
                    <span>{item.full_name}</span>
                    <span className="font-medium">{item.views}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aún no hay visitas registradas.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Necesidades más buscadas</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.top_help_areas.length > 0 ? (
              <div className="space-y-3">
                {summary.top_help_areas.map((item) => (
                  <div key={item.area_slug} className="flex justify-between gap-4 text-sm">
                    <span>{item.area_slug}</span>
                    <span className="font-medium">{item.searches}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aún no hay búsquedas registradas.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
          {icon}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <span className="text-3xl font-semibold">{value}</span>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Add nav link for admins**

In `src/routes/dashboard.tsx`, inside the `isAdmin` block, add a second admin link after `Panel de Administración`:

```tsx
<Link
  to="/dashboard/admin/analytics"
  className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary transition-colors hover:bg-primary/20"
  activeProps={{ className: "bg-primary/20 font-medium" }}
>
  Estadísticas globales
</Link>
```

- [ ] **Step 3: Verify route generation and lint**

Run:

```bash
npx eslint src/routes/dashboard.tsx src/routes/dashboard/admin/analytics.tsx
npm run build
```

Expected:

- ESLint exits 0 for the two files.
- Build exits 0.
- `src/routeTree.gen.ts` includes `/dashboard/admin/analytics`.

---

### Task 7: Apply Migration, Deploy Function, And Verify

**Files:**
- Remote Supabase database
- Supabase Edge Function `symptom-search`

- [ ] **Step 1: Push migration**

Run:

```bash
npx supabase db push
```

Expected: migration `20260513000000_analytics_events.sql` is applied.

- [ ] **Step 2: Confirm migration history**

Run:

```bash
npx supabase migration list
```

Expected:

```text
20260513000000 | 20260513000000
```

- [ ] **Step 3: Deploy symptom-search**

Run:

```bash
npx supabase functions deploy symptom-search
```

Expected: deploy succeeds on project `zkmlbbbpfhbtbedskxcr`.

- [ ] **Step 4: Run targeted lint**

Run:

```bash
npx eslint src/lib/analytics.ts src/features/search/ConversationalSearchPage.tsx src/features/professionals/ProfessionalProfilePage.tsx src/routes/dashboard/analytics.tsx src/routes/dashboard/admin/analytics.tsx src/routes/dashboard.tsx
```

Expected: exits 0.

- [ ] **Step 5: Run build**

Run:

```bash
npm run build
```

Expected: exits 0. Existing Wrangler log-write permission warnings may appear without failing the build.

- [ ] **Step 6: Browser smoke test**

Start dev server:

```bash
npm run dev -- --host 127.0.0.1 --port 8081
```

Check:

```text
/search?q=me siento ansiosa y cansada
/dashboard/analytics
/dashboard/admin/analytics
```

Expected:

- search page loads without a runtime error
- professional dashboard shows zero states or counts
- admin analytics redirects non-admins away and loads for admins

- [ ] **Step 7: Database verification queries**

In Supabase SQL Editor, run:

```sql
SELECT event_type, COUNT(*)
FROM public.analytics_events
GROUP BY event_type
ORDER BY event_type;
```

Expected after smoke testing:

- at least `conversational_search` appears after a search
- `search_result_impression` appears if results were returned
- `professional_profile_view` appears after visiting a professional profile
- `professional_contact_click` appears after clicking a contact action

---

### Task 8: Update Handoff Docs

**Files:**
- Modify: `README.md`
- Modify: `CONTEXT.md`
- Modify: `PLAN.md`
- Modify: `SKILL.md`

- [ ] **Step 1: Update README**

Add a short section:

```md
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
```

- [ ] **Step 2: Update CONTEXT**

Add:

```md
## Analytics Foundation

`analytics_events` is the canonical event table for dashboards.

Professional analytics reads own profile/search/contact data through `therapist_analytics_summary`.
Admin analytics reads platform-wide aggregate data through `admin_analytics_summary`.
Search analytics is logged by the `symptom-search` Edge Function.
```

- [ ] **Step 3: Update PLAN and SKILL**

In `PLAN.md`, add this feature under completed/current work once implemented:

```md
- Analytics/search foundation:
  - `analytics_events`
  - conversational search logging
  - profile/contact tracking
  - professional analytics summary
  - admin analytics summary
```

In `SKILL.md`, add a continuation note:

```md
- Use `analytics_events` for new dashboard metrics. Keep `profile_views` only for backward compatibility.
- Conversational search should map text to `help_areas`, then professionals through `therapist_help_areas`.
```

- [ ] **Step 4: Verify docs**

Run:

```bash
rg -n "analytics_events|therapist_analytics_summary|admin_analytics_summary|symptom-search" README.md CONTEXT.md PLAN.md SKILL.md
```

Expected: output shows all four handoff files mention the analytics foundation.

---

## Self-Review

- Spec coverage: this plan covers the analytics/event foundation, conversational search logging, contact tracking, and first admin/professional analytics dashboards from the approved spec.
- Deferred scope: NIF/tax/Stripe invoice metadata and activity creation permissions are intentionally separate implementation plans.
- Security coverage: platform-wide analytics uses admin-only RPC; professional analytics uses current authenticated user.
- Privacy coverage: visitor analytics uses anonymous localStorage visitor IDs and aggregate dashboards.
- Type consistency: `analytics_events`, `track_analytics_event`, `admin_analytics_summary`, and `therapist_analytics_summary` are named consistently across SQL, Supabase types, and React code.
