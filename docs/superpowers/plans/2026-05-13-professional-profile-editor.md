# Professional Profile Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade `/dashboard` so a verified or pending professional can maintain the full public therapist profile described in the Mallorca Holistica documentation.

**Architecture:** Keep profile editing in the existing dashboard route, but move persistence into a dedicated TanStack server function that verifies ownership and writes the therapist row plus related therapies, help areas, and session offerings in one save operation. Add a small Supabase table for optional session offerings, then update the public profile page to read those rows instead of the currently unused `sessions` property.

**Tech Stack:** React, TanStack Router, TanStack server functions, Supabase Postgres/RLS/Storage, TypeScript, existing shadcn-style UI components, existing analytics helpers.

---

## Product Scope From Documentation

The therapist profile must remain a human, trust-building ficha that makes direct contact easy. It is not an internal booking system.

Fields to support in the professional dashboard:

- Public identity: `full_name`, `headline`, `frase_clave`, `especialidad`, `subespecialidades`, `years_experience`, `photo_url`.
- Search matching: selected therapies through `therapist_therapies`, selected problem/help areas through `therapist_help_areas`.
- Location and modality: `municipality_id`, `address`, `lat`, `lng`, `modalities` with `presencial`, `online`, and `domicilio`.
- Contact: `whatsapp`, `phone`, `email`, `website`, `link_reserva`.
- Narrative content: `sobre_mi`, `formacion`, `experiencia`.
- Optional session offerings: name, duration, price.

Public profile behavior to preserve:

- Show direct WhatsApp contact only when subscription permissions allow it and `whatsapp` exists.
- Show “Solicitar sesión” only when subscription permissions allow it and `link_reserva` exists.
- Open external booking links in a new tab.
- Hide sessions when no sessions exist.
- Hide the map when coordinates are absent.
- Keep analytics events for profile views and contact clicks.

Out of scope for this plan:

- Internal calendar or in-platform booking.
- Verification workflow changes.
- Stripe entitlement changes.
- Admin analytics dashboards.

## File Structure

- Create `supabase/migrations/20260513000001_therapist_sessions.sql`
  - Adds normalized optional session offerings for therapists.
  - Enables owner/admin write RLS and public read only when the therapist profile is public or the reader owns/admins it.

- Modify `src/integrations/supabase/types.ts`
  - Adds the generated-style TypeScript table entry for `therapist_sessions`.

- Create `src/lib/professional-profile-editor.ts`
  - Contains the owner-authenticated server function for saving professional profile edits.
  - Normalizes empty form values before writing to Supabase.
  - Replaces therapy, help-area, and session rows for the therapist.

- Modify `src/routes/dashboard/index.tsx`
  - Replaces the small current editor with a documented ficha editor.
  - Loads catalog data for therapies, help areas, and municipalities.
  - Uploads the profile image to existing Supabase Storage.
  - Calls the server function for profile save.

- Modify `src/features/professionals/ProfessionalProfilePage.tsx`
  - Selects and renders `therapist_sessions`.
  - Removes reliance on the current non-persisted `sessions` property.

- Modify `README.md`, `CONTEXT.md`, `PLAN.md`, and `SKILL.md`
  - Documents that the professional dashboard now edits the public ficha fields used by public profiles and conversational matching.

## Task 1: Add Therapist Sessions Table

**Files:**

- Create: `supabase/migrations/20260513000001_therapist_sessions.sql`

- [ ] **Step 1: Create the migration**

Create `supabase/migrations/20260513000001_therapist_sessions.sql` with exactly this schema and policies:

```sql
CREATE TABLE public.therapist_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(trim(name)) > 0),
  duration TEXT,
  price_cents INTEGER CHECK (price_cents IS NULL OR price_cents >= 0),
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX therapist_sessions_therapist_id_idx
  ON public.therapist_sessions(therapist_id);

CREATE INDEX therapist_sessions_order_idx
  ON public.therapist_sessions(therapist_id, position, created_at);

ALTER TABLE public.therapist_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "therapist_sessions_public_read"
  ON public.therapist_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.therapists t
      WHERE t.id = therapist_sessions.therapist_id
        AND (
          t.status = 'published'
          OR t.user_id = auth.uid()
          OR public.has_role(auth.uid(), 'admin'::app_role)
        )
    )
  );

CREATE POLICY "therapist_sessions_owner_admin_insert"
  ON public.therapist_sessions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.therapists t
      WHERE t.id = therapist_sessions.therapist_id
        AND (
          t.user_id = auth.uid()
          OR public.has_role(auth.uid(), 'admin'::app_role)
        )
    )
  );

CREATE POLICY "therapist_sessions_owner_admin_update"
  ON public.therapist_sessions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.therapists t
      WHERE t.id = therapist_sessions.therapist_id
        AND (
          t.user_id = auth.uid()
          OR public.has_role(auth.uid(), 'admin'::app_role)
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.therapists t
      WHERE t.id = therapist_sessions.therapist_id
        AND (
          t.user_id = auth.uid()
          OR public.has_role(auth.uid(), 'admin'::app_role)
        )
    )
  );

CREATE POLICY "therapist_sessions_owner_admin_delete"
  ON public.therapist_sessions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.therapists t
      WHERE t.id = therapist_sessions.therapist_id
        AND (
          t.user_id = auth.uid()
          OR public.has_role(auth.uid(), 'admin'::app_role)
        )
    )
  );
```

- [ ] **Step 2: Apply the migration locally or remotely**

Run:

```bash
npx supabase db push
```

Expected result:

```text
Applying migration 20260513000001_therapist_sessions.sql...
Finished supabase db push.
```

If Supabase reports that the remote database is already ahead, run:

```bash
npx supabase migration list
```

Expected result includes `20260513000001` as unapplied or applied. Continue only when the migration state is understood.

## Task 2: Add Supabase Types

**Files:**

- Modify: `src/integrations/supabase/types.ts`

- [ ] **Step 1: Add the `therapist_sessions` table type**

In `Database["public"]["Tables"]`, add this table entry near the other therapist relation tables:

```ts
      therapist_sessions: {
        Row: {
          created_at: string
          duration: string | null
          id: string
          name: string
          position: number
          price_cents: number | null
          therapist_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration?: string | null
          id?: string
          name: string
          position?: number
          price_cents?: number | null
          therapist_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration?: string | null
          id?: string
          name?: string
          position?: number
          price_cents?: number | null
          therapist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_sessions_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
```

- [ ] **Step 2: Run a targeted type check**

Run:

```bash
npx tsc --noEmit
```

Expected result before later code tasks may include existing unrelated errors, but it must not report a syntax error inside `src/integrations/supabase/types.ts`.

## Task 3: Add Owner-Only Profile Save Function

**Files:**

- Create: `src/lib/professional-profile-editor.ts`

- [ ] **Step 1: Create the server function file**

Create `src/lib/professional-profile-editor.ts` with this implementation:

```ts
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/server";

const modalitySchema = z.enum(["presencial", "online", "domicilio"]);

const sessionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
  duration: z.string().trim().max(80).optional().nullable(),
  price_cents: z.number().int().min(0).optional().nullable(),
  position: z.number().int().min(0),
});

const profileEditorSchema = z.object({
  therapistId: z.string().uuid(),
  profile: z.object({
    full_name: z.string().trim().min(2).max(160),
    headline: z.string().trim().max(180).optional().nullable(),
    frase_clave: z.string().trim().max(220).optional().nullable(),
    especialidad: z.string().trim().max(120).optional().nullable(),
    subespecialidades: z.array(z.string().trim().min(1).max(80)).max(12),
    modalities: z.array(modalitySchema).min(1),
    years_experience: z.number().int().min(0).max(80).optional().nullable(),
    municipality_id: z.string().uuid().optional().nullable(),
    address: z.string().trim().max(220).optional().nullable(),
    lat: z.number().min(-90).max(90).optional().nullable(),
    lng: z.number().min(-180).max(180).optional().nullable(),
    whatsapp: z.string().trim().max(40).optional().nullable(),
    phone: z.string().trim().max(40).optional().nullable(),
    email: z.string().trim().email().max(180).optional().nullable(),
    website: z.string().trim().url().max(240).optional().nullable(),
    link_reserva: z.string().trim().url().max(240).optional().nullable(),
    sobre_mi: z.string().trim().max(3000).optional().nullable(),
    formacion: z.string().trim().max(3000).optional().nullable(),
    experiencia: z.string().trim().max(3000).optional().nullable(),
    photo_url: z.string().trim().url().max(500).optional().nullable(),
  }),
  therapyIds: z.array(z.string().uuid()).max(30),
  helpAreaIds: z.array(z.string().uuid()).max(40),
  sessions: z.array(sessionSchema).max(12),
});

type ProfileEditorInput = z.infer<typeof profileEditorSchema>;

export const saveProfessionalProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => profileEditorSchema.parse(input))
  .handler(async ({ data, context }) => {
    const userId = context.userId;
    const therapist = await loadOwnedTherapist(data.therapistId, userId);
    const normalized = normalizeProfile(data);

    const { error: updateError } = await supabaseAdmin
      .from("therapists")
      .update(normalized.profile)
      .eq("id", therapist.id);

    if (updateError) {
      throw new Error(`No se pudo guardar el perfil: ${updateError.message}`);
    }

    await replaceTherapyLinks(therapist.id, normalized.therapyIds);
    await replaceHelpAreaLinks(therapist.id, normalized.helpAreaIds);
    await replaceSessions(therapist.id, normalized.sessions);

    return { therapistId: therapist.id };
  });

async function loadOwnedTherapist(therapistId: string, userId: string) {
  const request = getWebRequest();
  if (!request) {
    throw new Error("No se pudo validar la sesión.");
  }

  const { data, error } = await supabaseAdmin
    .from("therapists")
    .select("id,user_id")
    .eq("id", therapistId)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo cargar el perfil: ${error.message}`);
  }

  if (!data || data.user_id !== userId) {
    throw new Error("No tienes permisos para editar este perfil.");
  }

  return data;
}

function normalizeProfile(data: ProfileEditorInput) {
  return {
    profile: {
      full_name: data.profile.full_name,
      headline: nullable(data.profile.headline),
      frase_clave: nullable(data.profile.frase_clave),
      especialidad: nullable(data.profile.especialidad),
      subespecialidades: data.profile.subespecialidades,
      modalities: data.profile.modalities,
      years_experience: data.profile.years_experience ?? null,
      municipality_id: data.profile.municipality_id ?? null,
      address: nullable(data.profile.address),
      lat: data.profile.lat ?? null,
      lng: data.profile.lng ?? null,
      whatsapp: nullable(data.profile.whatsapp),
      phone: nullable(data.profile.phone),
      email: nullable(data.profile.email),
      website: nullable(data.profile.website),
      link_reserva: nullable(data.profile.link_reserva),
      sobre_mi: nullable(data.profile.sobre_mi),
      formacion: nullable(data.profile.formacion),
      experiencia: nullable(data.profile.experiencia),
      photo_url: nullable(data.profile.photo_url),
      updated_at: new Date().toISOString(),
    },
    therapyIds: uniqueIds(data.therapyIds),
    helpAreaIds: uniqueIds(data.helpAreaIds),
    sessions: data.sessions
      .filter((session) => session.name.trim().length > 0)
      .map((session, index) => ({
        name: session.name.trim(),
        duration: nullable(session.duration),
        price_cents: session.price_cents ?? null,
        position: index,
      })),
  };
}

async function replaceTherapyLinks(therapistId: string, therapyIds: string[]) {
  const { error: deleteError } = await supabaseAdmin
    .from("therapist_therapies")
    .delete()
    .eq("therapist_id", therapistId);

  if (deleteError) {
    throw new Error(`No se pudieron actualizar las terapias: ${deleteError.message}`);
  }

  if (therapyIds.length === 0) return;

  const { error: insertError } = await supabaseAdmin.from("therapist_therapies").insert(
    therapyIds.map((therapyId) => ({
      therapist_id: therapistId,
      therapy_id: therapyId,
    })),
  );

  if (insertError) {
    throw new Error(`No se pudieron guardar las terapias: ${insertError.message}`);
  }
}

async function replaceHelpAreaLinks(therapistId: string, helpAreaIds: string[]) {
  const { error: deleteError } = await supabaseAdmin
    .from("therapist_help_areas")
    .delete()
    .eq("therapist_id", therapistId);

  if (deleteError) {
    throw new Error(`No se pudieron actualizar las areas de ayuda: ${deleteError.message}`);
  }

  if (helpAreaIds.length === 0) return;

  const { error: insertError } = await supabaseAdmin.from("therapist_help_areas").insert(
    helpAreaIds.map((helpAreaId) => ({
      therapist_id: therapistId,
      help_area_id: helpAreaId,
    })),
  );

  if (insertError) {
    throw new Error(`No se pudieron guardar las areas de ayuda: ${insertError.message}`);
  }
}

async function replaceSessions(
  therapistId: string,
  sessions: Array<{
    name: string;
    duration: string | null;
    price_cents: number | null;
    position: number;
  }>,
) {
  const { error: deleteError } = await supabaseAdmin
    .from("therapist_sessions")
    .delete()
    .eq("therapist_id", therapistId);

  if (deleteError) {
    throw new Error(`No se pudieron actualizar las sesiones: ${deleteError.message}`);
  }

  if (sessions.length === 0) return;

  const { error: insertError } = await supabaseAdmin.from("therapist_sessions").insert(
    sessions.map((session) => ({
      therapist_id: therapistId,
      ...session,
    })),
  );

  if (insertError) {
    throw new Error(`No se pudieron guardar las sesiones: ${insertError.message}`);
  }
}

function nullable(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function uniqueIds(ids: string[]) {
  return Array.from(new Set(ids));
}
```

- [ ] **Step 2: Run lint for the new file**

Run:

```bash
npx eslint src/lib/professional-profile-editor.ts
```

Expected result:

```text
No lint errors in src/lib/professional-profile-editor.ts.
```

If the repo uses a broader lint command instead of direct `eslint`, run the project lint command and confirm no error points at `src/lib/professional-profile-editor.ts`.

## Task 4: Rebuild Dashboard Profile Editor

**Files:**

- Modify: `src/routes/dashboard/index.tsx`

- [ ] **Step 1: Replace ad hoc `any` profile state with typed editor state**

At the top of `src/routes/dashboard/index.tsx`, import the save function and define local types:

```ts
import { saveProfessionalProfile } from "@/lib/professional-profile-editor";
import type { Database } from "@/integrations/supabase/types";

type TherapistRow = Database["public"]["Tables"]["therapists"]["Row"];
type TherapyRow = Database["public"]["Tables"]["therapies"]["Row"];
type HelpAreaRow = Database["public"]["Tables"]["help_areas"]["Row"];
type MunicipalityRow = Database["public"]["Tables"]["municipalities"]["Row"];
type TherapistSessionRow = Database["public"]["Tables"]["therapist_sessions"]["Row"];
type Modality = Database["public"]["Enums"]["modality"];

type ProfileForm = {
  full_name: string;
  headline: string;
  frase_clave: string;
  especialidad: string;
  subespecialidades: string;
  modalities: Modality[];
  years_experience: string;
  municipality_id: string;
  address: string;
  lat: string;
  lng: string;
  whatsapp: string;
  phone: string;
  email: string;
  website: string;
  link_reserva: string;
  sobre_mi: string;
  formacion: string;
  experiencia: string;
  photo_url: string;
};

type SessionForm = {
  id?: string;
  name: string;
  duration: string;
  price_eur: string;
};
```

- [ ] **Step 2: Load the full editor data**

In the existing `useEffect` that loads the dashboard profile, query:

```ts
const [therapistResult, therapiesResult, helpAreasResult, municipalitiesResult] = await Promise.all(
  [
    supabase
      .from("therapists")
      .select(
        `
      *,
      therapist_therapies(therapy_id),
      therapist_help_areas(help_area_id),
      therapist_sessions(id,name,duration,price_cents,position)
    `,
      )
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("therapies").select("id,slug,name,description").order("name"),
    supabase.from("help_areas").select("id,slug,name,description").order("name"),
    supabase.from("municipalities").select("id,slug,name,zone").order("name"),
  ],
);
```

Expected local state after loading:

```ts
setForm(toProfileForm(therapistResult.data));
setSelectedTherapyIds(
  (therapistResult.data.therapist_therapies ?? []).map((row) => row.therapy_id),
);
setSelectedHelpAreaIds(
  (therapistResult.data.therapist_help_areas ?? []).map((row) => row.help_area_id),
);
setSessions(toSessionForms(therapistResult.data.therapist_sessions ?? []));
setTherapies(therapiesResult.data ?? []);
setHelpAreas(helpAreasResult.data ?? []);
setMunicipalities(municipalitiesResult.data ?? []);
```

- [ ] **Step 3: Add conversion helpers**

Add these helpers below the component:

```ts
function toProfileForm(therapist: TherapistRow): ProfileForm {
  return {
    full_name: therapist.full_name ?? "",
    headline: therapist.headline ?? "",
    frase_clave: therapist.frase_clave ?? "",
    especialidad: therapist.especialidad ?? "",
    subespecialidades: (therapist.subespecialidades ?? []).join(", "),
    modalities: therapist.modalities?.length ? therapist.modalities : ["presencial"],
    years_experience: therapist.years_experience?.toString() ?? "",
    municipality_id: therapist.municipality_id ?? "",
    address: therapist.address ?? "",
    lat: therapist.lat?.toString() ?? "",
    lng: therapist.lng?.toString() ?? "",
    whatsapp: therapist.whatsapp ?? "",
    phone: therapist.phone ?? "",
    email: therapist.email ?? "",
    website: therapist.website ?? "",
    link_reserva: therapist.link_reserva ?? "",
    sobre_mi: therapist.sobre_mi ?? "",
    formacion: therapist.formacion ?? "",
    experiencia: therapist.experiencia ?? "",
    photo_url: therapist.photo_url ?? "",
  };
}

function toSessionForms(rows: TherapistSessionRow[]): SessionForm[] {
  return rows
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((row) => ({
      id: row.id,
      name: row.name,
      duration: row.duration ?? "",
      price_eur: row.price_cents === null ? "" : (row.price_cents / 100).toFixed(2),
    }));
}

function splitTags(value: string) {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseOptionalNumber(value: string) {
  const trimmed = value.trim();
  return trimmed ? Number(trimmed) : null;
}

function parsePriceCents(value: string) {
  const trimmed = value.trim().replace(",", ".");
  return trimmed ? Math.round(Number(trimmed) * 100) : null;
}
```

- [ ] **Step 4: Render profile sections that match the documentation**

Replace the existing small profile editor UI with these sections:

- “Identidad pública”: name, headline, key phrase, specialty, sub-specialties, years of experience.
- “Terapias y problemas que acompaño”: therapy checkboxes and help-area checkboxes.
- “Ubicación y modalidad”: municipality select, modality checkboxes, address, latitude, longitude.
- “Contacto directo”: WhatsApp, phone, email, website, booking link.
- “Contenido de la ficha”: about, training, experience.
- “Sesiones”: repeatable rows for session name, duration, and EUR price.
- “Foto”: existing upload control, preview, and current upload behavior.

Use existing components from `src/components/ui/*`. Each list of checkboxes must have a stable scrollable area:

```tsx
<div className="grid max-h-72 gap-3 overflow-y-auto rounded-md border border-border p-3 md:grid-cols-2">
  {therapies.map((therapy) => (
    <label key={therapy.id} className="flex items-start gap-2 text-sm">
      <Checkbox
        checked={selectedTherapyIds.includes(therapy.id)}
        onCheckedChange={() => toggleTherapy(therapy.id)}
      />
      <span>{therapy.name}</span>
    </label>
  ))}
</div>
```

- [ ] **Step 5: Save the complete profile through the server function**

Replace the current direct therapist update handler with:

```ts
async function handleSaveProfile(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  if (!therapist || !session) return;

  setSaving(true);
  setMessage(null);

  try {
    await saveProfessionalProfile({
      data: {
        therapistId: therapist.id,
        profile: {
          full_name: form.full_name,
          headline: form.headline || null,
          frase_clave: form.frase_clave || null,
          especialidad: form.especialidad || null,
          subespecialidades: splitTags(form.subespecialidades),
          modalities: form.modalities,
          years_experience: parseOptionalNumber(form.years_experience),
          municipality_id: form.municipality_id || null,
          address: form.address || null,
          lat: parseOptionalNumber(form.lat),
          lng: parseOptionalNumber(form.lng),
          whatsapp: form.whatsapp || null,
          phone: form.phone || null,
          email: form.email || null,
          website: form.website || null,
          link_reserva: form.link_reserva || null,
          sobre_mi: form.sobre_mi || null,
          formacion: form.formacion || null,
          experiencia: form.experiencia || null,
          photo_url: form.photo_url || null,
        },
        therapyIds: selectedTherapyIds,
        helpAreaIds: selectedHelpAreaIds,
        sessions: sessions.map((item, index) => ({
          id: item.id,
          name: item.name,
          duration: item.duration || null,
          price_cents: parsePriceCents(item.price_eur),
          position: index,
        })),
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    setMessage({ type: "success", text: "Perfil guardado." });
  } catch (error) {
    setMessage({
      type: "error",
      text: error instanceof Error ? error.message : "No se pudo guardar el perfil.",
    });
  } finally {
    setSaving(false);
  }
}
```

- [ ] **Step 6: Run targeted lint**

Run:

```bash
npx eslint src/routes/dashboard/index.tsx
```

Expected result:

```text
No lint errors in src/routes/dashboard/index.tsx.
```

## Task 5: Render Persisted Sessions on Public Profile

**Files:**

- Modify: `src/features/professionals/ProfessionalProfilePage.tsx`

- [ ] **Step 1: Update the public profile select**

Change the Supabase select to include sessions:

```ts
.select(
  "*, municipalities(name,slug), plans(slug,name,price_monthly_cents), therapist_therapies(therapies(slug,name)), therapist_help_areas(help_areas(slug,name)), therapist_sessions(name,duration,price_cents,position)",
)
```

- [ ] **Step 2: Replace the old `sessions` type**

Use this session type:

```ts
type Session = {
  name: string;
  duration: string | null;
  price_cents: number | null;
  position: number;
};
```

Extend `TherapistExtra` with:

```ts
  therapist_sessions?: Session[] | null;
```

Remove the unused `sessions?: Session[] | null` property.

- [ ] **Step 3: Sort and render persisted sessions**

Replace:

```ts
const sessions = Array.isArray(extra.sessions) ? extra.sessions : [];
```

with:

```ts
const sessions = (extra.therapist_sessions ?? []).slice().sort((a, b) => a.position - b.position);
```

When rendering price, use:

```tsx
{
  session.price_cents !== null && <span>{formatEuro(session.price_cents)}</span>;
}
```

Add this helper near `whatsappHref`:

```ts
function formatEuro(priceCents: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(priceCents / 100);
}
```

- [ ] **Step 4: Run targeted lint**

Run:

```bash
npx eslint src/features/professionals/ProfessionalProfilePage.tsx
```

Expected result:

```text
No lint errors in src/features/professionals/ProfessionalProfilePage.tsx.
```

## Task 6: Update Handoff Documentation

**Files:**

- Modify: `README.md`
- Modify: `CONTEXT.md`
- Modify: `PLAN.md`
- Modify: `SKILL.md`

- [ ] **Step 1: Update `README.md`**

Add this paragraph near the professional dashboard description:

```md
The professional dashboard at `/dashboard` is the editable source for the public therapist ficha. Professionals maintain their public identity, contact channels, modalities, municipality, narrative bio, training, experience, therapy categories, help areas used by conversational search, and optional session offerings. Public contact benefits still depend on the active subscription plan confirmed by Stripe webhooks.
```

- [ ] **Step 2: Update `CONTEXT.md`**

Add this bullet under the current system capabilities:

```md
- `/dashboard` lets a professional maintain the full public ficha fields from the product documentation, including therapies and help areas that feed public filtering and conversational matching.
```

- [ ] **Step 3: Update `PLAN.md`**

Add this completed or current milestone, depending on implementation status:

```md
- Professional profile editor: expand `/dashboard` to edit the complete therapist ficha, including direct contact fields, location, modalities, therapy links, help-area links, and optional session offerings.
```

- [ ] **Step 4: Update `SKILL.md`**

Add this operating note:

```md
- When changing professional profiles, keep `/dashboard`, public profile rendering, and search-matching relations (`therapist_therapies`, `therapist_help_areas`) in sync.
```

## Task 7: Full Verification

**Files:**

- Verify all files modified in Tasks 1-6.

- [ ] **Step 1: Run focused lint**

Run:

```bash
npx eslint src/lib/professional-profile-editor.ts src/routes/dashboard/index.tsx src/features/professionals/ProfessionalProfilePage.tsx src/integrations/supabase/types.ts
```

Expected result:

```text
No lint errors in the changed TypeScript files.
```

- [ ] **Step 2: Run build**

Run:

```bash
npm run build
```

Expected result:

```text
Build completes successfully.
```

- [ ] **Step 3: Check migration state**

Run:

```bash
npx supabase migration list
```

Expected result includes:

```text
20260513000001 | ... | 20260513000001
```

- [ ] **Step 4: Start the local app**

Run:

```bash
npm run dev -- --host 0.0.0.0
```

Expected result:

```text
Local:   http://localhost:8081/
```

If port `8081` is occupied, use the Vite-provided alternate port and report it.

- [ ] **Step 5: Browser smoke test**

In the in-app browser:

1. Open `http://localhost:8081/dashboard`.
2. Confirm the profile editor shows these sections: “Identidad pública”, “Terapias y problemas que acompaño”, “Ubicación y modalidad”, “Contacto directo”, “Contenido de la ficha”, “Sesiones”, and “Foto”.
3. Change one harmless text field such as `frase_clave`.
4. Select one therapy and one help area.
5. Add one session with name `Primera sesión`, duration `60 min`, and price `70`.
6. Save.
7. Reload `/dashboard` and confirm the data persisted.
8. Open the public professional profile and confirm the session appears if the profile route is available for that therapist.

Expected result:

```text
The dashboard save succeeds, reloaded values persist, and the public profile renders the saved session without breaking contact buttons.
```

## Self-Review

- Spec coverage: The plan covers the documentation fields for the professional ficha, direct contact behavior, session offerings, therapy/help-area matching, and public profile rendering.
- Placeholder scan: The plan contains concrete file paths, SQL, TypeScript, commands, and expected outputs. It avoids deferred implementation notes.
- Type consistency: `therapist_sessions`, `TherapistSessionRow`, `SessionForm`, `ProfileForm`, and `saveProfessionalProfile` use the same field names across migration, types, server function, dashboard route, and public profile page.
