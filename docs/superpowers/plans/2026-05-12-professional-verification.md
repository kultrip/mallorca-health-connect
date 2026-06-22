# Professional Verification MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first professional verification pipeline: onboarding submission with verification documents, admin review, Resend email notifications, and approval/rejection state updates.

**Architecture:** Keep the existing `therapists` table as the professional profile source of truth, adding review/document metadata columns with a Supabase migration. Client routes continue to use the browser Supabase client for user-owned profile edits, while trusted notification and admin-review side effects are centralized in server functions that use Resend and Supabase service-role access.

**Tech Stack:** React/TanStack Start routes, Supabase Auth/Storage/Postgres/RLS, Resend transactional email API, TypeScript, ESLint, Vite.

---

## File Structure

- Create `supabase/migrations/20260512000000_professional_verification_workflow.sql`
  - Adds document metadata and review fields to `public.therapists`.
  - Adds helper indexes for pending review queue.

- Create `src/lib/email/resend.ts`
  - Server-only helper for sending Resend emails.
  - Reads `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `ADMIN_EMAIL`.
  - Keeps email transport separate from route/UI logic.

- Create `src/lib/verification-emails.ts`
  - Server-only email composition helpers for admin notification, approval, and rejection/request-changes.
  - Exports small functions that accept typed payloads and call `sendEmail`.

- Create `src/lib/professional-verification.ts`
  - Server-side operations for sending admin notification and admin approval/rejection.
  - Uses `supabaseAdmin` for trusted updates and signed document links where needed.

- Modify `src/routes/onboarding.tsx`
  - Require one professional documentation upload.
  - Add optional supporting document upload.
  - Store document paths/names on `therapists`.
  - Submit status as `pending`.
  - Trigger admin notification after successful profile creation.

- Modify `src/routes/dashboard/admin.tsx`
  - Show richer pending profile details and document names.
  - Add a rejection/request-changes note.
  - Use server-side approve/reject operations so emails are sent with state changes.

- Modify `src/integrations/supabase/types.ts`
  - Add the new `therapists` columns to generated types manually until Supabase typegen is available.

- Modify `.env` locally only if needed
  - Required runtime variables:
    - `RESEND_API_KEY`
    - `RESEND_FROM_EMAIL=charles.santana@kultrip.com`
    - `ADMIN_EMAIL=charles.santana@kultrip.com`
  - Do not commit real secrets.

---

### Task 1: Add Verification Metadata Schema

**Files:**
- Create: `supabase/migrations/20260512000000_professional_verification_workflow.sql`
- Modify: `src/integrations/supabase/types.ts`

- [ ] **Step 1: Add the migration**

Create `supabase/migrations/20260512000000_professional_verification_workflow.sql`:

```sql
ALTER TABLE public.therapists
  ADD COLUMN IF NOT EXISTS verification_document_path TEXT,
  ADD COLUMN IF NOT EXISTS verification_document_name TEXT,
  ADD COLUMN IF NOT EXISTS verification_extra_document_path TEXT,
  ADD COLUMN IF NOT EXISTS verification_extra_document_name TEXT,
  ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_review_note TEXT,
  ADD COLUMN IF NOT EXISTS verification_reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_therapists_pending_verification
  ON public.therapists (verification_submitted_at DESC)
  WHERE status = 'pending';
```

- [ ] **Step 2: Update Supabase types**

In `src/integrations/supabase/types.ts`, add these fields to `therapists.Row`, `therapists.Insert`, and `therapists.Update`:

```ts
verification_document_path: string | null
verification_document_name: string | null
verification_extra_document_path: string | null
verification_extra_document_name: string | null
verification_submitted_at: string | null
verification_reviewed_at: string | null
verification_review_note: string | null
verification_reviewed_by: string | null
```

For `Insert` and `Update`, all eight fields are optional and nullable.

- [ ] **Step 3: Verify targeted type edits**

Run:

```bash
rg -n "verification_document_path|verification_reviewed_by|idx_therapists_pending_verification" supabase/migrations/20260512000000_professional_verification_workflow.sql src/integrations/supabase/types.ts
```

Expected: output shows the migration and all three type sections.

---

### Task 2: Add Server Email Helpers

**Files:**
- Create: `src/lib/email/resend.ts`
- Create: `src/lib/verification-emails.ts`

- [ ] **Step 1: Create Resend transport helper**

Create `src/lib/email/resend.ts`:

```ts
type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

type ResendSendResponse = {
  id?: string;
  message?: string;
  name?: string;
};

function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    throw new Error("Missing RESEND_API_KEY or RESEND_FROM_EMAIL");
  }

  return { apiKey, from };
}

export async function sendEmail(message: EmailMessage) {
  const { apiKey, from } = getEmailConfig();

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as ResendSendResponse;

  if (!response.ok) {
    throw new Error(payload.message || `Resend email failed with status ${response.status}`);
  }

  return payload;
}
```

- [ ] **Step 2: Create verification email compositions**

Create `src/lib/verification-emails.ts`:

```ts
import { sendEmail } from "@/lib/email/resend";

type ProfessionalEmailPayload = {
  professionalName: string;
  professionalEmail: string;
  adminUrl: string;
  dashboardUrl: string;
  reviewNote?: string | null;
};

function getAdminEmail() {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) throw new Error("Missing ADMIN_EMAIL");
  return adminEmail;
}

export async function sendAdminVerificationRequestEmail(payload: ProfessionalEmailPayload) {
  const to = getAdminEmail();
  const subject = `Nueva solicitud profesional: ${payload.professionalName}`;
  const text = [
    `Nueva solicitud profesional en Mallorca Holística.`,
    ``,
    `Profesional: ${payload.professionalName}`,
    `Email: ${payload.professionalEmail}`,
    ``,
    `Revisar solicitud: ${payload.adminUrl}`,
  ].join("\n");

  return sendEmail({
    to,
    subject,
    text,
    html: `
      <h1>Nueva solicitud profesional</h1>
      <p><strong>Profesional:</strong> ${payload.professionalName}</p>
      <p><strong>Email:</strong> ${payload.professionalEmail}</p>
      <p><a href="${payload.adminUrl}">Revisar en el panel de administración</a></p>
    `,
  });
}

export async function sendProfessionalApprovedEmail(payload: ProfessionalEmailPayload) {
  return sendEmail({
    to: payload.professionalEmail,
    subject: "Tu perfil profesional ha sido aprobado",
    text: [
      `Hola ${payload.professionalName},`,
      ``,
      `Tu perfil profesional ha sido aprobado y ya formas parte de Mallorca Holística.`,
      `Puedes entrar en tu panel para revisar tu perfil y elegir una suscripción si quieres activar beneficios adicionales.`,
      ``,
      payload.dashboardUrl,
    ].join("\n"),
    html: `
      <h1>Tu perfil ha sido aprobado</h1>
      <p>Hola ${payload.professionalName},</p>
      <p>Tu perfil profesional ha sido aprobado y ya formas parte de Mallorca Holística.</p>
      <p>Puedes entrar en tu panel para revisar tu perfil y elegir una suscripción si quieres activar beneficios adicionales.</p>
      <p><a href="${payload.dashboardUrl}">Ir a mi panel</a></p>
    `,
  });
}

export async function sendProfessionalRejectedEmail(payload: ProfessionalEmailPayload) {
  const note = payload.reviewNote?.trim();
  const reason = note || "Necesitamos revisar o completar algunos datos antes de aprobar tu perfil.";

  return sendEmail({
    to: payload.professionalEmail,
    subject: "Necesitamos revisar tu solicitud profesional",
    text: [
      `Hola ${payload.professionalName},`,
      ``,
      `Hemos revisado tu solicitud profesional en Mallorca Holística.`,
      reason,
      ``,
      `Puedes entrar en tu panel para actualizar la información.`,
      ``,
      payload.dashboardUrl,
    ].join("\n"),
    html: `
      <h1>Solicitud pendiente de cambios</h1>
      <p>Hola ${payload.professionalName},</p>
      <p>Hemos revisado tu solicitud profesional en Mallorca Holística.</p>
      <p>${reason}</p>
      <p><a href="${payload.dashboardUrl}">Ir a mi panel</a></p>
    `,
  });
}
```

- [ ] **Step 3: Run targeted lint for helper files**

Run:

```bash
npx eslint src/lib/email/resend.ts src/lib/verification-emails.ts
```

Expected: exits 0.

---

### Task 3: Add Server Verification Operations

**Files:**
- Create: `src/lib/professional-verification.ts`

- [ ] **Step 1: Create server operation module**

Create `src/lib/professional-verification.ts`:

```ts
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  sendAdminVerificationRequestEmail,
  sendProfessionalApprovedEmail,
  sendProfessionalRejectedEmail,
} from "@/lib/verification-emails";

type NotifyRequestInput = {
  therapistId: string;
  professionalEmail: string;
  origin: string;
};

type ReviewInput = {
  therapistId: string;
  reviewerUserId: string;
  professionalEmail: string;
  origin: string;
  reviewNote?: string;
};

async function getTherapistForEmail(therapistId: string) {
  const { data, error } = await supabaseAdmin
    .from("therapists")
    .select("id, full_name")
    .eq("id", therapistId)
    .single();

  if (error) throw error;
  return data;
}

function dashboardUrl(origin: string) {
  return `${origin}/dashboard`;
}

function adminUrl(origin: string) {
  return `${origin}/dashboard/admin`;
}

export async function notifyAdminOfProfessionalRequest(input: NotifyRequestInput) {
  const therapist = await getTherapistForEmail(input.therapistId);

  await sendAdminVerificationRequestEmail({
    professionalName: therapist.full_name,
    professionalEmail: input.professionalEmail,
    adminUrl: adminUrl(input.origin),
    dashboardUrl: dashboardUrl(input.origin),
  });
}

export async function approveProfessionalRequest(input: ReviewInput) {
  const { data, error } = await supabaseAdmin
    .from("therapists")
    .update({
      status: "published",
      verified: true,
      verification_reviewed_at: new Date().toISOString(),
      verification_review_note: input.reviewNote?.trim() || null,
      verification_reviewed_by: input.reviewerUserId,
    })
    .eq("id", input.therapistId)
    .select("id, full_name")
    .single();

  if (error) throw error;

  await sendProfessionalApprovedEmail({
    professionalName: data.full_name,
    professionalEmail: input.professionalEmail,
    adminUrl: adminUrl(input.origin),
    dashboardUrl: dashboardUrl(input.origin),
    reviewNote: input.reviewNote,
  });

  return data;
}

export async function rejectProfessionalRequest(input: ReviewInput) {
  const { data, error } = await supabaseAdmin
    .from("therapists")
    .update({
      status: "draft",
      verified: false,
      verification_reviewed_at: new Date().toISOString(),
      verification_review_note: input.reviewNote?.trim() || null,
      verification_reviewed_by: input.reviewerUserId,
    })
    .eq("id", input.therapistId)
    .select("id, full_name")
    .single();

  if (error) throw error;

  await sendProfessionalRejectedEmail({
    professionalName: data.full_name,
    professionalEmail: input.professionalEmail,
    adminUrl: adminUrl(input.origin),
    dashboardUrl: dashboardUrl(input.origin),
    reviewNote: input.reviewNote,
  });

  return data;
}
```

- [ ] **Step 2: Run targeted lint**

Run:

```bash
npx eslint src/lib/professional-verification.ts
```

Expected: exits 0.

---

### Task 4: Wire Onboarding Submission

**Files:**
- Modify: `src/routes/onboarding.tsx`

- [ ] **Step 1: Import server notification operation**

Add:

```ts
import { notifyAdminOfProfessionalRequest } from "@/lib/professional-verification";
```

- [ ] **Step 2: Add optional extra document state**

Add alongside `docFile`:

```ts
const [extraDocFile, setExtraDocFile] = useState<File | null>(null);
```

- [ ] **Step 3: Require professional documentation before submit**

At the start of `handleSubmit`, after `if (!user) return;`, add:

```ts
if (!docFile) {
  toast.error("Sube tu documentación profesional para enviar la solicitud.");
  return;
}
```

- [ ] **Step 4: Store uploaded document paths and names**

Replace the current document upload block:

```ts
if (docFile) {
  await uploadFile(docFile, 'verification-docs');
}
```

with:

```ts
const verificationDocumentPath = await uploadFile(docFile, "verification-docs");
let verificationExtraDocumentPath: string | null = null;

if (extraDocFile) {
  verificationExtraDocumentPath = await uploadFile(extraDocFile, "verification-docs");
}
```

- [ ] **Step 5: Insert verification metadata and return the therapist id**

Change the insert to:

```ts
const { data: therapist, error } = await supabase
  .from("therapists")
  .insert({
    user_id: user.id,
    slug,
    full_name: fullName,
    headline,
    modalities: [modality],
    phone,
    email: user.email,
    especialidad,
    sobre_mi: sobreMi,
    formacion,
    experiencia,
    photo_url: photoUrl,
    status: "pending",
    verified: false,
    verification_document_path: verificationDocumentPath,
    verification_document_name: docFile.name,
    verification_extra_document_path: verificationExtraDocumentPath,
    verification_extra_document_name: extraDocFile?.name ?? null,
    verification_submitted_at: new Date().toISOString(),
  })
  .select("id")
  .single();
```

- [ ] **Step 6: Trigger admin notification**

After the insert succeeds, add:

```ts
await notifyAdminOfProfessionalRequest({
  therapistId: therapist.id,
  professionalEmail: user.email ?? "",
  origin: window.location.origin,
});
```

If this email call fails, catch it separately so the submitted profile remains pending:

```ts
try {
  await notifyAdminOfProfessionalRequest({
    therapistId: therapist.id,
    professionalEmail: user.email ?? "",
    origin: window.location.origin,
  });
} catch (emailError) {
  console.error(emailError);
  toast.warning("Perfil enviado, pero no pudimos enviar el email al equipo.");
}
```

- [ ] **Step 7: Add optional extra document upload UI**

Under the required document input, add:

```tsx
<div className="space-y-2 border-t pt-6">
  <Label htmlFor="extraDoc" className="flex items-center gap-2">
    <FileText className="h-4 w-4" /> Documento adicional opcional
  </Label>
  <p className="mb-2 text-xs text-muted-foreground">
    Puedes añadir otro certificado, acreditación o documento que ayude al equipo a revisar tu solicitud.
  </p>
  <Input
    id="extraDoc"
    type="file"
    onChange={(e) => setExtraDocFile(e.target.files?.[0] || null)}
  />
</div>
```

- [ ] **Step 8: Run targeted lint**

Run:

```bash
npx eslint src/routes/onboarding.tsx
```

Expected: exits 0.

---

### Task 5: Wire Admin Approval And Rejection Emails

**Files:**
- Modify: `src/routes/dashboard/admin.tsx`

- [ ] **Step 1: Import server review operations and UI controls**

Add:

```ts
import { approveProfessionalRequest, rejectProfessionalRequest } from "@/lib/professional-verification";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
```

- [ ] **Step 2: Track current admin user and review notes**

Add state:

```ts
const [adminUserId, setAdminUserId] = useState<string | null>(null);
const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
```

In `checkAdminAndLoad`, after user is confirmed:

```ts
setAdminUserId(user.id);
```

- [ ] **Step 3: Load professional email fields**

Keep the query as `.select("*")` because `email` is already part of `therapists`.

- [ ] **Step 4: Replace approve logic**

Replace `handleApprove` with:

```ts
const handleApprove = async (therapist: any) => {
  if (!adminUserId) return;

  try {
    await approveProfessionalRequest({
      therapistId: therapist.id,
      reviewerUserId: adminUserId,
      professionalEmail: therapist.email,
      origin: window.location.origin,
      reviewNote: reviewNotes[therapist.id],
    });
    toast.success("Perfil aprobado, publicado y notificado.");
    loadPending();
  } catch (error: any) {
    toast.error("Error al aprobar: " + error.message);
  }
};
```

- [ ] **Step 5: Replace reject logic**

Replace `handleReject` with:

```ts
const handleReject = async (therapist: any) => {
  if (!adminUserId) return;

  const note = reviewNotes[therapist.id]?.trim();
  if (!note) {
    toast.error("Añade una nota para explicar qué debe corregir el profesional.");
    return;
  }

  try {
    await rejectProfessionalRequest({
      therapistId: therapist.id,
      reviewerUserId: adminUserId,
      professionalEmail: therapist.email,
      origin: window.location.origin,
      reviewNote: note,
    });
    toast.success("Solicitud devuelta con nota enviada al profesional.");
    loadPending();
  } catch (error: any) {
    toast.error("Error al rechazar: " + error.message);
  }
};
```

- [ ] **Step 6: Show document metadata and review note UI**

Inside each pending therapist card, show:

```tsx
<div className="mt-3 space-y-1 text-xs text-muted-foreground">
  {therapist.verification_document_name && (
    <p>Documento profesional: {therapist.verification_document_name}</p>
  )}
  {therapist.verification_extra_document_name && (
    <p>Documento adicional: {therapist.verification_extra_document_name}</p>
  )}
  {therapist.verification_submitted_at && (
    <p>Enviado: {new Date(therapist.verification_submitted_at).toLocaleDateString("es-ES")}</p>
  )}
</div>
```

Add before action buttons:

```tsx
<div className="space-y-2">
  <Label htmlFor={`review-${therapist.id}`}>Nota de revisión</Label>
  <Textarea
    id={`review-${therapist.id}`}
    value={reviewNotes[therapist.id] ?? ""}
    onChange={(event) =>
      setReviewNotes((current) => ({ ...current, [therapist.id]: event.target.value }))
    }
    placeholder="Escribe una nota si necesitas pedir cambios."
  />
</div>
```

Change button handlers to:

```tsx
onClick={() => handleReject(therapist)}
onClick={() => handleApprove(therapist)}
```

- [ ] **Step 7: Run targeted lint**

Run:

```bash
npx eslint src/routes/dashboard/admin.tsx src/lib/professional-verification.ts src/lib/verification-emails.ts src/lib/email/resend.ts
```

Expected: exits 0.

---

### Task 6: Document Local Environment Variables

**Files:**
- Modify: `docs/superpowers/specs/2026-05-12-professional-verification-design.md`
- Modify: `README.md` or `CONTEXT.md`

- [ ] **Step 1: Add implementation env names to docs**

Add a short section:

```md
### Professional Verification Email Environment

Local testing:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL=charles.santana@kultrip.com`
- `ADMIN_EMAIL=charles.santana@kultrip.com`

Production target after domain verification:

- `RESEND_FROM_EMAIL=hola@mallorcaholistica.com`
- `ADMIN_EMAIL=hola@mallorcaholistica.com`
```

- [ ] **Step 2: Do not commit secrets**

Run:

```bash
rg -n "[r]e_[A-Za-z0-9_]{20,}|[R]ESEND_API_KEY=.*[A-Za-z0-9]" . README.md CONTEXT.md docs/superpowers/specs/2026-05-12-professional-verification-design.md
```

Expected: no real Resend API key appears in tracked docs or source.

---

### Task 7: Final Verification

**Files:**
- Verify all files modified in Tasks 1-6.

- [ ] **Step 1: Run targeted lint**

Run:

```bash
npx eslint src/routes/onboarding.tsx src/routes/dashboard/admin.tsx src/lib/email/resend.ts src/lib/verification-emails.ts src/lib/professional-verification.ts
```

Expected: exits 0.

- [ ] **Step 2: Run build**

Run:

```bash
npm run build
```

Expected: exits 0. Existing Wrangler log permission warning may appear.

- [ ] **Step 3: Manual browser smoke test**

Start or use the existing dev server and verify:

```text
/onboarding
/dashboard/admin
```

Expected:

- onboarding shows required professional documentation plus optional extra document
- admin pending cards show document names and review note
- no blank page or runtime console errors

---

## Self-Review

- Spec coverage: covers professional-only onboarding, flexible required+optional document upload, pending request, admin review, admin/professional emails, and Free verified profile. Subscription checkout remains separate.
- Placeholder scan: no intentional placeholders; all paths, env vars, and expected commands are explicit.
- Type consistency: the new verification columns use the same names across SQL, Supabase types, onboarding insert, and admin display.
- Scope check: Stripe subscription benefit automation is intentionally out of this plan and should be implemented as the next separate phase.

## Remote Migration Application

Applied/confirmed on 2026-05-12 against Supabase project `zkmlbbbpfhbtbedskxcr`.

Commands run:

```bash
npx supabase link --project-ref zkmlbbbpfhbtbedskxcr
npx supabase db push
npx supabase migration list
```

Result:

```text
Remote database is up to date.
20260512000000 | 20260512000000
```

The professional verification migration is now present in both local and remote migration history.
