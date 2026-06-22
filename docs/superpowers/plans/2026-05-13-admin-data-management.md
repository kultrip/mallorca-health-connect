# Admin Data Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a practical admin operations console for managing professionals, therapies, help areas, activities, plan state, and professional emails from the app.

**Architecture:** Add an audited `admin_email_logs` table, implement admin-only TanStack server functions for writes/email sends, and split the admin UI into focused tab panels mounted under the existing `/dashboard/admin` route. Reads use the existing Supabase client where admin RLS permits it; writes and email sends use service-role server functions protected by `requireSupabaseAuth` plus an admin role check.

**Tech Stack:** Supabase Postgres/RLS, TanStack Router, TanStack server functions, React, TypeScript, Resend, existing shadcn UI components, sonner toasts.

---

## Scope Rules

- Keep `/dashboard/admin` as one tabbed operations console.
- Keep `/dashboard/admin/analytics` separate.
- Do not build a CRM, inbox, campaign scheduler, rich text editor, or email-type taxonomy.
- Do not allow admins to manually fake active Stripe-paid benefits.
- Log one email row per recipient.
- Use server functions for all admin writes and email sends.

## File Structure

- Create `supabase/migrations/20260513000006_admin_email_logs.sql`
  - Adds admin email log table, status check, indexes, admin-only RLS.

- Modify `src/integrations/supabase/types.ts`
  - Adds generated-style `admin_email_logs` table type.

- Create `src/lib/admin-data-management.ts`
  - Admin assertion helper.
  - Save functions for therapists, therapies, help areas, activities.
  - Email send function with logging.

- Create `src/components/admin/admin-utils.ts`
  - Shared admin parsing/format helpers.

- Create `src/components/admin/AdminRequestsPanel.tsx`
  - Moves current pending approval UI out of the route file.

- Create `src/components/admin/AdminProfessionalsPanel.tsx`
  - Professional list/filter/edit form plus individual email launcher.

- Create `src/components/admin/AdminTherapiesPanel.tsx`
  - Therapy list/create/edit form.

- Create `src/components/admin/AdminHelpAreasPanel.tsx`
  - Help area list/create/edit form.

- Create `src/components/admin/AdminActivitiesPanel.tsx`
  - Activity list/create/edit form.

- Create `src/components/admin/AdminPlansPanel.tsx`
  - Read-only plan/subscription overview.

- Create `src/components/admin/AdminEmailCenterPanel.tsx`
  - Recipient filters, selection, subject/body, confirmation, send results.

- Rewrite `src/routes/dashboard/admin.tsx`
  - Admin guard, data loading, tabs, and panel orchestration.

- Modify `src/routes/dashboard.tsx`
  - Rename admin sidebar label from “Panel de Administración” to “Administración” if desired.

- Modify `README.md`, `CONTEXT.md`, `PLAN.md`, and `SKILL.md`
  - Document admin console and email center.

## Task 1: Add Email Log Migration

**Files:**
- Create: `supabase/migrations/20260513000006_admin_email_logs.sql`

- [ ] **Step 1: Create migration**

Create `supabase/migrations/20260513000006_admin_email_logs.sql`:

```sql
CREATE TABLE IF NOT EXISTS public.admin_email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  therapist_id UUID REFERENCES public.therapists(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  resend_email_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_admin_email_logs_created_at
  ON public.admin_email_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_email_logs_therapist_id
  ON public.admin_email_logs (therapist_id);

CREATE INDEX IF NOT EXISTS idx_admin_email_logs_sent_by_user_id
  ON public.admin_email_logs (sent_by_user_id);

ALTER TABLE public.admin_email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_email_logs_admin_read"
  ON public.admin_email_logs
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admin_email_logs_admin_insert"
  ON public.admin_email_logs
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
```

- [ ] **Step 2: Apply migration**

Run:

```bash
npx supabase db push
```

Expected: `20260513000006_admin_email_logs.sql` is applied to the linked remote project.

## Task 2: Add Supabase Types

**Files:**
- Modify: `src/integrations/supabase/types.ts`

- [ ] **Step 1: Add `admin_email_logs` table type**

Add this entry inside `Database["public"]["Tables"]`, near `analytics_events`:

```ts
      admin_email_logs: {
        Row: {
          created_at: string;
          error_message: string | null;
          id: string;
          message: string;
          recipient_email: string;
          recipient_name: string | null;
          resend_email_id: string | null;
          sent_by_user_id: string | null;
          status: string;
          subject: string;
          therapist_id: string | null;
        };
        Insert: {
          created_at?: string;
          error_message?: string | null;
          id?: string;
          message: string;
          recipient_email: string;
          recipient_name?: string | null;
          resend_email_id?: string | null;
          sent_by_user_id?: string | null;
          status: string;
          subject: string;
          therapist_id?: string | null;
        };
        Update: {
          created_at?: string;
          error_message?: string | null;
          id?: string;
          message?: string;
          recipient_email?: string;
          recipient_name?: string | null;
          resend_email_id?: string | null;
          sent_by_user_id?: string | null;
          status?: string;
          subject?: string;
          therapist_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "admin_email_logs_therapist_id_fkey";
            columns: ["therapist_id"];
            isOneToOne: false;
            referencedRelation: "therapists";
            referencedColumns: ["id"];
          },
        ];
      };
```

- [ ] **Step 2: Verify types**

Run:

```bash
npx tsc --noEmit
```

Expected: exits `0`.

## Task 3: Create Admin Server Functions

**Files:**
- Create: `src/lib/admin-data-management.ts`

- [ ] **Step 1: Create schemas and admin assertion**

Create `src/lib/admin-data-management.ts` with these imports and shared helpers:

```ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { sendEmail } from "@/lib/email/resend";

const slugSchema = z
  .string()
  .trim()
  .min(1, "El slug es obligatorio.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usa un slug en minúsculas, sin espacios.");

const optionalUrlSchema = z
  .string()
  .trim()
  .url("Usa una URL válida.")
  .optional()
  .nullable()
  .or(z.literal(""));

const therapistInputSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().trim().min(1),
  headline: z.string().trim().optional().nullable(),
  frase_clave: z.string().trim().optional().nullable(),
  especialidad: z.string().trim().optional().nullable(),
  subespecialidades: z.array(z.string().trim()).default([]),
  sobre_mi: z.string().trim().optional().nullable(),
  experiencia: z.string().trim().optional().nullable(),
  formacion: z.string().trim().optional().nullable(),
  languages: z.array(z.string().trim()).default([]),
  modalities: z.array(z.enum(["presencial", "online", "domicilio"])).default([]),
  email: z.string().trim().email().optional().nullable().or(z.literal("")),
  phone: z.string().trim().optional().nullable(),
  whatsapp: z.string().trim().optional().nullable(),
  website: optionalUrlSchema,
  link_reserva: optionalUrlSchema,
  address: z.string().trim().optional().nullable(),
  municipality_id: z.string().uuid().optional().nullable(),
  lat: z.number().min(-90).max(90).optional().nullable(),
  lng: z.number().min(-180).max(180).optional().nullable(),
  status: z.enum(["draft", "pending", "published", "suspended"]),
  verified: z.boolean(),
  therapyIds: z.array(z.string().uuid()).default([]),
  helpAreaIds: z.array(z.string().uuid()).default([]),
});

const therapyInputSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  name: z.string().trim().min(1),
  slug: slugSchema,
  category: z.string().trim().optional().nullable(),
  short_description: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  benefits: z.array(z.string().trim()).default([]),
  session_description: z.string().trim().optional().nullable(),
  medical_disclaimer: z.string().trim().optional().nullable(),
  empty_professionals_message: z.string().trim().optional().nullable(),
  detail_sections: z
    .array(z.object({ title: z.string().trim().min(1), body: z.string().trim().min(1) }))
    .default([]),
});

const helpAreaInputSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  name: z.string().trim().min(1),
  slug: slugSchema,
  description: z.string().trim().optional().nullable(),
  keywords: z.array(z.string().trim()).default([]),
});

const activityInputSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  title: z.string().trim().min(1),
  slug: slugSchema,
  description: z.string().trim().optional().nullable(),
  starts_at: z.string().trim().optional().nullable(),
  ends_at: z.string().trim().optional().nullable(),
  location: z.string().trim().optional().nullable(),
  municipality_id: z.string().uuid().optional().nullable(),
  price_cents: z.number().int().min(0).optional().nullable(),
  link_reserva: optionalUrlSchema,
  image_url: optionalUrlSchema,
  status: z.enum(["draft", "pending", "published", "suspended"]),
  therapist_id: z.string().uuid().optional().nullable(),
  center_id: z.string().uuid().optional().nullable(),
});

const emailInputSchema = z.object({
  therapistIds: z.array(z.string().uuid()).min(1).max(100),
  subject: z.string().trim().min(1).max(180),
  message: z.string().trim().min(1).max(8000),
});

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Response("Forbidden", { status: 403 });
}

function nullable(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function cleanList(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean);
}
```

- [ ] **Step 2: Add therapist save function**

Append:

```ts
export const saveAdminTherapist = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => therapistInputSchema.parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin
      .from("therapists")
      .update({
        full_name: data.full_name,
        headline: nullable(data.headline),
        frase_clave: nullable(data.frase_clave),
        especialidad: nullable(data.especialidad),
        subespecialidades: cleanList(data.subespecialidades),
        sobre_mi: nullable(data.sobre_mi),
        experiencia: nullable(data.experiencia),
        formacion: nullable(data.formacion),
        languages: cleanList(data.languages),
        modalities: data.modalities,
        email: nullable(data.email),
        phone: nullable(data.phone),
        whatsapp: nullable(data.whatsapp),
        website: nullable(data.website),
        link_reserva: nullable(data.link_reserva),
        address: nullable(data.address),
        municipality_id: data.municipality_id ?? null,
        lat: data.lat ?? null,
        lng: data.lng ?? null,
        status: data.status,
        verified: data.verified,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);

    if (error) throw error;

    await replaceLinks("therapist_therapies", "therapy_id", data.id, data.therapyIds);
    await replaceLinks("therapist_help_areas", "help_area_id", data.id, data.helpAreaIds);

    return { therapistId: data.id };
  });
```

- [ ] **Step 3: Add content save functions**

Append:

```ts
export const saveAdminTherapy = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => therapyInputSchema.parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: saved, error } = await supabaseAdmin
      .from("therapies")
      .upsert(
        {
          id: data.id ?? undefined,
          name: data.name,
          slug: data.slug,
          category: nullable(data.category),
          short_description: nullable(data.short_description),
          description: nullable(data.description),
          benefits: cleanList(data.benefits),
          session_description: nullable(data.session_description),
          medical_disclaimer: nullable(data.medical_disclaimer),
          empty_professionals_message: nullable(data.empty_professionals_message),
          detail_sections: data.detail_sections,
        },
        { onConflict: "id" },
      )
      .select("id")
      .single();

    if (error) throw error;
    return { therapyId: saved.id };
  });

export const saveAdminHelpArea = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => helpAreaInputSchema.parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: saved, error } = await supabaseAdmin
      .from("help_areas")
      .upsert(
        {
          id: data.id ?? undefined,
          name: data.name,
          slug: data.slug,
          description: nullable(data.description),
          keywords: cleanList(data.keywords),
        },
        { onConflict: "id" },
      )
      .select("id")
      .single();

    if (error) throw error;
    return { helpAreaId: saved.id };
  });

export const saveAdminActivity = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => activityInputSchema.parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: saved, error } = await supabaseAdmin
      .from("activities")
      .upsert(
        {
          id: data.id ?? undefined,
          title: data.title,
          slug: data.slug,
          description: nullable(data.description),
          starts_at: nullable(data.starts_at),
          ends_at: nullable(data.ends_at),
          location: nullable(data.location),
          municipality_id: data.municipality_id ?? null,
          price_cents: data.price_cents ?? null,
          link_reserva: nullable(data.link_reserva),
          image_url: nullable(data.image_url),
          status: data.status,
          therapist_id: data.therapist_id ?? null,
          center_id: data.center_id ?? null,
        },
        { onConflict: "id" },
      )
      .select("id")
      .single();

    if (error) throw error;
    return { activityId: saved.id };
  });
```

- [ ] **Step 4: Add email send function and helper functions**

Append:

```ts
export const sendAdminProfessionalEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => emailInputSchema.parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: therapists, error } = await supabaseAdmin
      .from("therapists")
      .select("id, full_name, email")
      .in("id", data.therapistIds);

    if (error) throw error;

    const recipients = (therapists ?? []).filter((therapist) => Boolean(therapist.email));
    if (recipients.length === 0) {
      throw new Error("No hay destinatarios con email.");
    }

    const results = [];
    for (const therapist of recipients) {
      try {
        const sent = await sendEmail({
          to: therapist.email!,
          subject: data.subject,
          text: data.message,
          html: paragraphsToHtml(data.message),
        });

        await supabaseAdmin.from("admin_email_logs").insert({
          sent_by_user_id: context.userId,
          therapist_id: therapist.id,
          recipient_email: therapist.email!,
          recipient_name: therapist.full_name,
          subject: data.subject,
          message: data.message,
          resend_email_id: sent.id ?? null,
          status: "sent",
        });

        results.push({ therapistId: therapist.id, email: therapist.email, status: "sent" });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error desconocido";
        await supabaseAdmin.from("admin_email_logs").insert({
          sent_by_user_id: context.userId,
          therapist_id: therapist.id,
          recipient_email: therapist.email!,
          recipient_name: therapist.full_name,
          subject: data.subject,
          message: data.message,
          status: "failed",
          error_message: message,
        });
        results.push({
          therapistId: therapist.id,
          email: therapist.email,
          status: "failed",
          error: message,
        });
      }
    }

    return {
      sent: results.filter((result) => result.status === "sent").length,
      failed: results.filter((result) => result.status === "failed").length,
      results,
    };
  });

async function replaceLinks(
  table: "therapist_therapies" | "therapist_help_areas",
  idColumn: "therapy_id" | "help_area_id",
  therapistId: string,
  ids: string[],
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { error: deleteError } = await supabaseAdmin
    .from(table)
    .delete()
    .eq("therapist_id", therapistId);

  if (deleteError) throw deleteError;

  if (ids.length === 0) return;

  const { error: insertError } = await supabaseAdmin.from(table).insert(
    ids.map((id) => ({
      therapist_id: therapistId,
      [idColumn]: id,
    })),
  );

  if (insertError) throw insertError;
}

function paragraphsToHtml(message: string) {
  return message
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
```

- [ ] **Step 5: Run focused lint**

Run:

```bash
npx eslint src/lib/admin-data-management.ts
```

Expected: exits `0`.

## Task 4: Add Shared Admin UI Helpers

**Files:**
- Create: `src/components/admin/admin-utils.ts`

- [ ] **Step 1: Create helpers**

Create `src/components/admin/admin-utils.ts`:

```ts
export function splitLines(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function joinLines(values: string[] | null | undefined) {
  return (values ?? []).join("\n");
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getAccessTokenFromSupabase(supabase: {
  auth: { getSession: () => Promise<{ data: { session: { access_token: string } | null } }> };
}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Tu sesión ha caducado. Vuelve a iniciar sesión.");
  return token;
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "No se pudo completar la acción.";
}
```

- [ ] **Step 2: Run focused lint**

Run:

```bash
npx eslint src/components/admin/admin-utils.ts
```

Expected: exits `0`.

## Task 5: Split Existing Requests Panel

**Files:**
- Create: `src/components/admin/AdminRequestsPanel.tsx`
- Modify later: `src/routes/dashboard/admin.tsx`

- [ ] **Step 1: Move current approval UI into component**

Create `src/components/admin/AdminRequestsPanel.tsx` using the current request list logic from `src/routes/dashboard/admin.tsx`.

The component signature must be:

```ts
type AdminRequestsPanelProps = {
  pendingTherapists: TherapistRow[];
  onReload: () => Promise<void>;
};
```

It should:

- keep local `reviewNotes`
- call `approveProfessionalRequest`
- call `rejectProfessionalRequest`
- require a note before reject
- show the same pending-request cards currently shown in `/dashboard/admin`

- [ ] **Step 2: Run focused lint**

Run:

```bash
npx eslint src/components/admin/AdminRequestsPanel.tsx
```

Expected: exits `0`.

## Task 6: Add Professionals Management Panel

**Files:**
- Create: `src/components/admin/AdminProfessionalsPanel.tsx`

- [ ] **Step 1: Create professional panel**

Create a panel with this behavior:

- props:

```ts
type AdminProfessionalsPanelProps = {
  therapists: AdminTherapist[];
  therapies: TherapyRow[];
  helpAreas: HelpAreaRow[];
  municipalities: MunicipalityRow[];
  onReload: () => Promise<void>;
  onEmailOne: (therapistId: string) => void;
};
```

- local state:
  - search string
  - status filter
  - selected therapist id
  - editable form object
  - saving boolean

- list columns:
  - name
  - email
  - status
  - verified
  - plan/subscription
  - location

- edit form fields:
  - the editable professional fields from the spec
  - therapy multi-select as checkboxes
  - help area multi-select as checkboxes
  - latitude/longitude numeric inputs
  - save button
  - email button that calls `onEmailOne(selected.id)`

- save calls `saveAdminTherapist` with bearer token from `getAccessTokenFromSupabase`.

Use compact, work-focused layout with `Card`, `Input`, `Textarea`, `Select`, `Checkbox`, `Button`, and `Badge`.

- [ ] **Step 2: Run focused lint**

Run:

```bash
npx eslint src/components/admin/AdminProfessionalsPanel.tsx
```

Expected: exits `0`.

## Task 7: Add Therapy Management Panel

**Files:**
- Create: `src/components/admin/AdminTherapiesPanel.tsx`

- [ ] **Step 1: Create therapy panel**

Create a panel with:

- list/search therapies by name/category
- select one therapy or create new
- edit:
  - name
  - slug
  - category
  - short description
  - description
  - benefits as one item per line
  - session description
  - medical disclaimer
  - empty professionals message
  - detail sections as JSON textarea containing an array of `{ "title": "...", "body": "..." }`
- auto-slug button using `slugify(name)`
- save calls `saveAdminTherapy`

When parsing detail sections, validate JSON before calling the server function and show a toast if it is invalid.

- [ ] **Step 2: Run focused lint**

Run:

```bash
npx eslint src/components/admin/AdminTherapiesPanel.tsx
```

Expected: exits `0`.

## Task 8: Add Help Areas Panel

**Files:**
- Create: `src/components/admin/AdminHelpAreasPanel.tsx`

- [ ] **Step 1: Create help areas panel**

Create a panel with:

- list/search help areas by name/slug/keywords
- select one or create new
- edit:
  - name
  - slug
  - description
  - keywords as one item per line
- auto-slug button using `slugify(name)`
- save calls `saveAdminHelpArea`

- [ ] **Step 2: Run focused lint**

Run:

```bash
npx eslint src/components/admin/AdminHelpAreasPanel.tsx
```

Expected: exits `0`.

## Task 9: Add Activities Panel

**Files:**
- Create: `src/components/admin/AdminActivitiesPanel.tsx`

- [ ] **Step 1: Create activities panel**

Create a panel with:

- list/search activities by title/status/location
- select one or create new
- edit:
  - title
  - slug
  - description
  - starts at
  - ends at
  - location
  - municipality
  - price in euros in UI, converted to cents for save
  - reservation link
  - image URL
  - status
  - therapist association
- save calls `saveAdminActivity`

Use `datetime-local` inputs for date fields and store ISO strings.

- [ ] **Step 2: Run focused lint**

Run:

```bash
npx eslint src/components/admin/AdminActivitiesPanel.tsx
```

Expected: exits `0`.

## Task 10: Add Plans Overview Panel

**Files:**
- Create: `src/components/admin/AdminPlansPanel.tsx`

- [ ] **Step 1: Create read-only plan overview**

Create a panel that accepts:

```ts
type AdminPlansPanelProps = {
  plans: PlanRow[];
  therapists: AdminTherapist[];
};
```

Show:

- plan name/slug
- monthly price
- Stripe price id
- billing enabled
- count of therapists with that `plan_id`
- count of active subscriptions by plan
- count of pending paid plans by plan slug
- list of subscription errors

Do not add edit buttons.

- [ ] **Step 2: Run focused lint**

Run:

```bash
npx eslint src/components/admin/AdminPlansPanel.tsx
```

Expected: exits `0`.

## Task 11: Add Email Center Panel

**Files:**
- Create: `src/components/admin/AdminEmailCenterPanel.tsx`

- [ ] **Step 1: Create email center**

Create a panel with:

- recipient filters:
  - all with email
  - pending
  - verified
  - published
  - plan slug
  - municipality
- checkbox list of matching professionals
- subject input
- message textarea
- recipient count and preview
- confirmation checkbox or explicit confirm step
- send button disabled until subject, message, and at least one recipient exist
- calls `sendAdminProfessionalEmail`
- shows sent/failed counts

Props:

```ts
type AdminEmailCenterPanelProps = {
  therapists: AdminTherapist[];
  municipalities: MunicipalityRow[];
  initialTherapistId?: string | null;
  onInitialTherapistHandled: () => void;
};
```

If `initialTherapistId` exists, preselect only that therapist and scroll/focus the email form.

- [ ] **Step 2: Run focused lint**

Run:

```bash
npx eslint src/components/admin/AdminEmailCenterPanel.tsx
```

Expected: exits `0`.

## Task 12: Rewrite Admin Route as Console Coordinator

**Files:**
- Modify: `src/routes/dashboard/admin.tsx`

- [ ] **Step 1: Replace route implementation**

Rewrite `src/routes/dashboard/admin.tsx` so it:

- checks authenticated user
- checks admin role
- loads:
  - therapists with plans, municipalities, therapy/help links
  - therapies
  - help areas
  - municipalities
  - activities
  - plans
- derives pending therapists for `Solicitudes`
- renders `Tabs` with:
  - `Solicitudes`
  - `Profesionales`
  - `Terapias`
  - `Necesidades`
  - `Actividades`
  - `Planes`
  - `Emails`
- passes `loadAdminData` down as `onReload`
- keeps `emailInitialTherapistId` state for the “email this professional” action

Use Supabase select strings:

```ts
const therapistSelect =
  "*, plans(name,slug,price_monthly_cents), municipalities(name,slug), therapist_therapies(therapy_id), therapist_help_areas(help_area_id)";
```

```ts
const [therapistsResult, therapiesResult, helpAreasResult, municipalitiesResult, activitiesResult, plansResult] =
  await Promise.all([
    supabase.from("therapists").select(therapistSelect).order("created_at", { ascending: false }),
    supabase.from("therapies").select("*").order("name"),
    supabase.from("help_areas").select("*").order("name"),
    supabase.from("municipalities").select("*").order("name"),
    supabase.from("activities").select("*").order("created_at", { ascending: false }),
    supabase.from("plans").select("*").order("rank", { ascending: true }),
  ]);
```

- [ ] **Step 2: Run focused lint**

Run:

```bash
npx eslint src/routes/dashboard/admin.tsx src/components/admin/*.tsx src/components/admin/admin-utils.ts src/lib/admin-data-management.ts
```

Expected: exits `0`.

## Task 13: Update Dashboard Sidebar Copy

**Files:**
- Modify: `src/routes/dashboard.tsx`

- [ ] **Step 1: Rename admin link**

Change visible sidebar label from:

```tsx
Panel de Administración
```

To:

```tsx
Administración
```

Keep `/dashboard/admin/analytics` label as `Estadísticas globales`.

- [ ] **Step 2: Run focused lint**

Run:

```bash
npx eslint src/routes/dashboard.tsx
```

Expected: exits `0`.

## Task 14: Update Documentation

**Files:**
- Modify: `README.md`
- Modify: `CONTEXT.md`
- Modify: `PLAN.md`
- Modify: `SKILL.md`

- [ ] **Step 1: Update README**

Add under dashboard/admin docs:

```md
Admins manage MVP operations from `/dashboard/admin`: professional requests, professionals, therapies, help areas, activities, plan overview, and an email center for individual or selected bulk professional emails.
```

- [ ] **Step 2: Update CONTEXT**

Add under current implementation state:

```md
- Admin data management console:
  - tabs for requests, professionals, therapies, help areas, activities, plans, and emails
  - admin email center sends Resend emails to selected professionals and logs one row per recipient
```

- [ ] **Step 3: Update PLAN**

Mark Admin data management complete:

```md
- [x] Implemented Admin data management:
  - professional operations
  - therapy/help-area/activity editing
  - read-only plan overview
  - admin email center with `admin_email_logs`
```

- [ ] **Step 4: Update SKILL**

Add product rule:

```md
- Admin emails are simple subject/message sends to selected professionals. Do not add email-type taxonomy, campaign scheduling, or internal inbox behavior in MVP.
```

## Task 15: Verification

**Files:**
- Verify all files modified in Tasks 1-14.

- [ ] **Step 1: Run focused lint**

Run:

```bash
npx eslint src/lib/admin-data-management.ts src/components/admin/admin-utils.ts src/components/admin/AdminRequestsPanel.tsx src/components/admin/AdminProfessionalsPanel.tsx src/components/admin/AdminTherapiesPanel.tsx src/components/admin/AdminHelpAreasPanel.tsx src/components/admin/AdminActivitiesPanel.tsx src/components/admin/AdminPlansPanel.tsx src/components/admin/AdminEmailCenterPanel.tsx src/routes/dashboard/admin.tsx src/routes/dashboard.tsx
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

- [ ] **Step 4: Verify migration history**

Run:

```bash
npx supabase migration list
```

Expected: `20260513000006` appears locally and remotely after `db push`.

- [ ] **Step 5: Browser smoke**

Start dev server:

```bash
npm run dev -- --host 127.0.0.1 --port 8081
```

Check as admin:

- `/dashboard/admin` loads tabs.
- `Solicitudes` shows current pending requests.
- `Profesionales` list renders and one safe text field can be edited/persisted.
- `Terapias` saves a therapy edit.
- `Necesidades` saves a help area edit.
- `Actividades` saves an activity draft.
- `Planes` shows read-only plan/subscription counts.
- `Emails` can send to one test professional and creates `admin_email_logs`.

Check as non-admin:

- `/dashboard/admin` redirects or blocks access.

## Self-Review

- Spec coverage: The plan covers all seven admin tabs, server-side admin writes, email sending/logging, migration, docs, and verification.
- Placeholder scan: No vague markers or deferred implementation steps remain.
- Type consistency: The server functions, panel names, migration table, and route orchestration use consistent names throughout.
