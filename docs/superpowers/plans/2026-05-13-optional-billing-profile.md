# Optional Billing Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let professionals optionally save fiscal invoice details for Stripe invoices without blocking paid checkout for informal professionals.

**Architecture:** Add a private `billing_profiles` table keyed by `user_id`, expose owner-only TanStack server functions for saving it, and render the form inside `/dashboard/billing`. Stripe checkout keeps working with or without billing data; when complete billing data exists, the checkout server function syncs it to the Stripe customer before setup/subscription Checkout.

**Tech Stack:** Supabase Postgres/RLS, TanStack Router, TanStack server functions, React, Stripe Customers, TypeScript, existing shadcn-style UI components.

---

## Scope Rules

- Billing/fiscal details are optional.
- Paid checkout must not be blocked when billing details are empty.
- Fiscal invoice details are private and never shown on public profiles.
- Stripe remains the invoice/factura source; the app does not generate PDFs.
- Public professional address/city and billing address/city are separate concepts.

## File Structure

- Create `supabase/migrations/20260513000005_billing_profiles.sql`
  - Adds `billing_profiles`.
  - Enables owner/admin RLS.

- Modify `src/integrations/supabase/types.ts`
  - Adds generated-style types for `billing_profiles`.

- Create `src/lib/billing-profile.ts`
  - Server functions to save billing profile and sync billing data to Stripe customers.

- Modify `src/lib/stripe-functions.ts`
  - Loads optional billing profile and syncs complete billing data before Stripe Checkout.

- Modify `src/routes/dashboard/billing.tsx`
  - Loads optional billing profile.
  - Renders a fiscal invoice details card above plan cards.
  - Saves optional invoice fields.

- Modify `README.md`, `CONTEXT.md`, `PLAN.md`, and `SKILL.md`
  - Documents optional factura details and the non-blocking checkout rule.

## Task 1: Add `billing_profiles` Table

**Files:**

- Create: `supabase/migrations/20260513000005_billing_profiles.sql`

- [ ] **Step 1: Create migration**

Create `supabase/migrations/20260513000005_billing_profiles.sql`:

```sql
CREATE TABLE IF NOT EXISTS public.billing_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES public.therapists(id) ON DELETE SET NULL,
  legal_name TEXT,
  tax_id_type TEXT CHECK (
    tax_id_type IS NULL OR tax_id_type IN ('nif', 'nie', 'cif', 'other')
  ),
  tax_id_value TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'ES',
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_billing_profiles_therapist_id
  ON public.billing_profiles (therapist_id);

CREATE INDEX IF NOT EXISTS idx_billing_profiles_stripe_customer_id
  ON public.billing_profiles (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

ALTER TABLE public.billing_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "billing_profiles_owner_read"
  ON public.billing_profiles
  FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "billing_profiles_owner_insert"
  ON public.billing_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "billing_profiles_owner_update"
  ON public.billing_profiles
  FOR UPDATE
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "billing_profiles_admin_delete"
  ON public.billing_profiles
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));
```

- [ ] **Step 2: Apply migration**

Run:

```bash
npx supabase db push
```

Expected:

```text
Applying migration 20260513000005_billing_profiles.sql...
Finished supabase db push.
```

## Task 2: Add Supabase Types

**Files:**

- Modify: `src/integrations/supabase/types.ts`

- [ ] **Step 1: Add `billing_profiles` table type**

Add this entry inside `Database["public"]["Tables"]`, near `activities` or before `plans`:

```ts
      billing_profiles: {
        Row: {
          address_line1: string | null;
          address_line2: string | null;
          city: string | null;
          country: string;
          created_at: string;
          id: string;
          legal_name: string | null;
          postal_code: string | null;
          stripe_customer_id: string | null;
          tax_id_type: string | null;
          tax_id_value: string | null;
          therapist_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          country?: string;
          created_at?: string;
          id?: string;
          legal_name?: string | null;
          postal_code?: string | null;
          stripe_customer_id?: string | null;
          tax_id_type?: string | null;
          tax_id_value?: string | null;
          therapist_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          country?: string;
          created_at?: string;
          id?: string;
          legal_name?: string | null;
          postal_code?: string | null;
          stripe_customer_id?: string | null;
          tax_id_type?: string | null;
          tax_id_value?: string | null;
          therapist_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "billing_profiles_therapist_id_fkey";
            columns: ["therapist_id"];
            isOneToOne: false;
            referencedRelation: "therapists";
            referencedColumns: ["id"];
          },
        ];
      };
```

- [ ] **Step 2: Verify syntax**

Run:

```bash
npx tsc --noEmit
```

Expected: TypeScript completes with no errors.

## Task 3: Add Billing Profile Server Functions

**Files:**

- Create: `src/lib/billing-profile.ts`

- [ ] **Step 1: Create server function module**

Create `src/lib/billing-profile.ts`:

```ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const taxIdTypeSchema = z.enum(["nif", "nie", "cif", "other"]);

const billingProfileSchema = z.object({
  therapistId: z.string().uuid().optional().nullable(),
  legal_name: z.string().trim().max(180).optional().nullable(),
  tax_id_type: taxIdTypeSchema.optional().nullable(),
  tax_id_value: z.string().trim().max(80).optional().nullable(),
  address_line1: z.string().trim().max(220).optional().nullable(),
  address_line2: z.string().trim().max(220).optional().nullable(),
  city: z.string().trim().max(120).optional().nullable(),
  postal_code: z.string().trim().max(40).optional().nullable(),
  country: z.string().trim().length(2).default("ES"),
});

export type BillingProfileInput = z.infer<typeof billingProfileSchema>;

export const saveBillingProfile = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => billingProfileSchema.parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const normalized = normalizeBillingProfile(data);
    const therapistId = await resolveOwnedTherapistId(context.userId, normalized.therapistId);

    validateOptionalInvoiceProfile(normalized);

    const { data: saved, error } = await supabaseAdmin
      .from("billing_profiles")
      .upsert(
        {
          user_id: context.userId,
          therapist_id: therapistId,
          legal_name: nullable(normalized.legal_name),
          tax_id_type: normalized.tax_id_type ?? null,
          tax_id_value: nullable(normalized.tax_id_value),
          address_line1: nullable(normalized.address_line1),
          address_line2: nullable(normalized.address_line2),
          city: nullable(normalized.city),
          postal_code: nullable(normalized.postal_code),
          country: normalized.country || "ES",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )
      .select("*")
      .single();

    if (error) {
      throw new Error(`No se pudieron guardar los datos fiscales: ${error.message}`);
    }

    return saved;
  });

export async function syncBillingProfileToStripeCustomer({
  userId,
  therapistId,
  customerId,
}: {
  userId: string;
  therapistId: string;
  customerId: string;
}) {
  const { default: Stripe } = await import("stripe");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const stripe = new Stripe(getStripeSecretKey(), { apiVersion: "2026-04-22.dahlia" });

  const { data: billingProfile, error } = await supabaseAdmin
    .from("billing_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!billingProfile || !hasStripeSyncableBillingDetails(billingProfile)) return;

  await stripe.customers.update(customerId, {
    name: billingProfile.legal_name ?? undefined,
    address: hasCompleteInvoiceAddress(billingProfile)
      ? {
          line1: billingProfile.address_line1 ?? undefined,
          line2: billingProfile.address_line2 ?? undefined,
          city: billingProfile.city ?? undefined,
          postal_code: billingProfile.postal_code ?? undefined,
          country: billingProfile.country || "ES",
        }
      : undefined,
    metadata: {
      user_id: userId,
      therapist_id: therapistId,
      tax_id_type: billingProfile.tax_id_type ?? "",
      tax_id_value: billingProfile.tax_id_value ?? "",
    },
  });

  await syncStripeTaxId({
    stripe,
    customerId,
    taxIdType: billingProfile.tax_id_type,
    taxIdValue: billingProfile.tax_id_value,
  });

  await supabaseAdmin
    .from("billing_profiles")
    .update({ stripe_customer_id: customerId })
    .eq("user_id", userId);
}

async function resolveOwnedTherapistId(userId: string, therapistId?: string | null) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const query = supabaseAdmin.from("therapists").select("id,user_id").eq("user_id", userId);
  const { data, error } = therapistId
    ? await query.eq("id", therapistId).maybeSingle()
    : await query.maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}

function normalizeBillingProfile(data: BillingProfileInput) {
  return {
    ...data,
    country: (data.country || "ES").trim().toUpperCase(),
  };
}

function validateOptionalInvoiceProfile(data: BillingProfileInput) {
  const hasAnyValue = [
    data.legal_name,
    data.tax_id_type,
    data.tax_id_value,
    data.address_line1,
    data.address_line2,
    data.city,
    data.postal_code,
  ].some((value) => Boolean(String(value ?? "").trim()));

  if (!hasAnyValue) return;

  if (!data.legal_name?.trim()) {
    throw new Error("El nombre fiscal es necesario si guardas datos de factura.");
  }

  if (Boolean(data.tax_id_type) !== Boolean(data.tax_id_value?.trim())) {
    throw new Error("El tipo y el numero fiscal deben guardarse juntos.");
  }

  const hasAnyAddress = [data.address_line1, data.address_line2, data.city, data.postal_code].some(
    (value) => Boolean(String(value ?? "").trim()),
  );

  if (
    hasAnyAddress &&
    (!data.address_line1?.trim() ||
      !data.city?.trim() ||
      !data.postal_code?.trim() ||
      !data.country?.trim())
  ) {
    throw new Error("La direccion, ciudad y codigo postal son necesarios para datos de factura.");
  }
}

async function syncStripeTaxId({
  stripe,
  customerId,
  taxIdType,
  taxIdValue,
}: {
  stripe: import("stripe").default;
  customerId: string;
  taxIdType: string | null;
  taxIdValue: string | null;
}) {
  const stripeType = stripeTaxIdTypeFor(taxIdType);
  const normalizedValue = taxIdValue?.trim();

  if (!stripeType || !normalizedValue) return;

  try {
    const existing = await stripe.customers.listTaxIds(customerId, { limit: 100 });
    const alreadyExists = existing.data.some(
      (taxId) => taxId.type === stripeType && taxId.value === normalizedValue,
    );

    if (!alreadyExists) {
      await stripe.customers.createTaxId(customerId, {
        type: stripeType,
        value: normalizedValue,
      });
    }
  } catch (error) {
    console.warn("Stripe rejected billing tax ID sync; keeping local metadata only.", error);
  }
}

function stripeTaxIdTypeFor(taxIdType: string | null) {
  if (taxIdType === "nif" || taxIdType === "nie" || taxIdType === "cif") return "es_cif";
  return null;
}

function hasCompleteInvoiceAddress(profile: {
  legal_name: string | null;
  address_line1: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
}) {
  return Boolean(
    profile.legal_name?.trim() &&
    profile.address_line1?.trim() &&
    profile.city?.trim() &&
    profile.postal_code?.trim() &&
    profile.country?.trim(),
  );
}

function hasStripeSyncableBillingDetails(profile: {
  legal_name: string | null;
  tax_id_type: string | null;
  tax_id_value: string | null;
  address_line1: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
}) {
  return Boolean(
    profile.legal_name?.trim() ||
    hasCompleteInvoiceAddress(profile) ||
    (profile.tax_id_type && profile.tax_id_value?.trim()),
  );
}

function nullable(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function getStripeSecretKey() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Response("Missing STRIPE_SECRET_KEY", { status: 500 });
  return key;
}
```

- [ ] **Step 2: Lint server function**

Run:

```bash
npx eslint src/lib/billing-profile.ts
```

Expected:

```text
No lint errors.
```

## Task 4: Sync Optional Billing Data Before Checkout

**Files:**

- Modify: `src/lib/stripe-functions.ts`

- [ ] **Step 1: Import sync helper**

Add:

```ts
import { syncBillingProfileToStripeCustomer } from "@/lib/billing-profile";
```

- [ ] **Step 2: Call sync helper after customer creation/reuse**

After the `if (!customerId) { ... }` block and before `const isVerifiedPublished = ...`, add:

```ts
await syncBillingProfileToStripeCustomer({
  userId: context.userId,
  therapistId: therapist.id,
  customerId,
});
```

- [ ] **Step 3: Lint Stripe functions**

Run:

```bash
npx eslint src/lib/stripe-functions.ts src/lib/billing-profile.ts
```

Expected:

```text
No lint errors.
```

## Task 5: Add Billing Profile UI

**Files:**

- Modify: `src/routes/dashboard/billing.tsx`

- [ ] **Step 1: Import form controls and server function**

Add imports:

```ts
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveBillingProfile } from "@/lib/billing-profile";
```

- [ ] **Step 2: Add billing profile types and state**

Add:

```ts
type BillingProfileRow = Database["public"]["Tables"]["billing_profiles"]["Row"];

type BillingProfileForm = {
  legal_name: string;
  tax_id_type: "nif" | "nie" | "cif" | "other" | "";
  tax_id_value: string;
  address_line1: string;
  address_line2: string;
  city: string;
  postal_code: string;
  country: string;
};
```

Inside `BillingPage`, add:

```ts
const [billingProfile, setBillingProfile] = useState<BillingProfileRow | null>(null);
const [billingForm, setBillingForm] = useState<BillingProfileForm>(emptyBillingProfileForm());
const [billingSaving, setBillingSaving] = useState(false);
```

- [ ] **Step 3: Load billing profile with billing data**

Change `Promise.all` to include a billing profile query:

```ts
const [profileResult, plansResult, billingProfileResult] = await Promise.all([
  supabase.from("therapists").select("*, plans(name, slug)").eq("user_id", user.id).maybeSingle(),
  supabase
    .from("plans")
    .select("id, slug, name, description, price_monthly_cents, features, rank, billing_enabled")
    .eq("billing_enabled", true)
    .order("rank", { ascending: true }),
  supabase.from("billing_profiles").select("*").eq("user_id", user.id).maybeSingle(),
]);
```

After existing result handling, add:

```ts
if (billingProfileResult.error) {
  toast.error(billingProfileResult.error.message);
} else {
  setBillingProfile(billingProfileResult.data as BillingProfileRow | null);
  setBillingForm(toBillingProfileForm(billingProfileResult.data as BillingProfileRow | null));
}
```

- [ ] **Step 4: Add save handler**

Add inside `BillingPage`:

```ts
const handleSaveBillingProfile = async () => {
  try {
    setBillingSaving(true);
    const accessToken = await getAccessToken();
    const saved = await saveBillingProfile({
      data: {
        therapistId: profile?.id ?? null,
        legal_name: billingForm.legal_name || null,
        tax_id_type: billingForm.tax_id_type || null,
        tax_id_value: billingForm.tax_id_value || null,
        address_line1: billingForm.address_line1 || null,
        address_line2: billingForm.address_line2 || null,
        city: billingForm.city || null,
        postal_code: billingForm.postal_code || null,
        country: billingForm.country || "ES",
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    setBillingProfile(saved as BillingProfileRow);
    toast.success("Datos fiscales guardados.");
  } catch (error) {
    toast.error(getErrorMessage(error));
  } finally {
    setBillingSaving(false);
  }
};
```

- [ ] **Step 5: Render billing profile card before plan cards**

Place this card after the current plan card and before pending-plan card:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Datos fiscales para facturas</CardTitle>
    <CardDescription>
      Opcional. Estos datos se usan si necesitas facturas con NIF/CIF/NIE. No se muestran en tu
      perfil publico.
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {!hasBillingDetails(billingForm) && (
      <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
        Puedes añadir datos fiscales si necesitas facturas con NIF/CIF/NIE.
      </p>
    )}
    <div className="grid gap-4 md:grid-cols-2">
      <Field
        id="legal_name"
        label="Nombre fiscal"
        value={billingForm.legal_name}
        onChange={(value) => setBillingForm((current) => ({ ...current, legal_name: value }))}
      />
      <div className="space-y-2">
        <Label>Tipo fiscal</Label>
        <Select
          value={billingForm.tax_id_type || "none"}
          onValueChange={(value) =>
            setBillingForm((current) => ({
              ...current,
              tax_id_type: value === "none" ? "" : (value as BillingProfileForm["tax_id_type"]),
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin datos fiscales</SelectItem>
            <SelectItem value="nif">NIF</SelectItem>
            <SelectItem value="nie">NIE</SelectItem>
            <SelectItem value="cif">CIF</SelectItem>
            <SelectItem value="other">Otro</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Field
        id="tax_id_value"
        label="Numero fiscal"
        value={billingForm.tax_id_value}
        onChange={(value) => setBillingForm((current) => ({ ...current, tax_id_value: value }))}
      />
      <Field
        id="address_line1"
        label="Direccion fiscal"
        value={billingForm.address_line1}
        onChange={(value) => setBillingForm((current) => ({ ...current, address_line1: value }))}
      />
      <Field
        id="address_line2"
        label="Direccion fiscal 2"
        value={billingForm.address_line2}
        onChange={(value) => setBillingForm((current) => ({ ...current, address_line2: value }))}
      />
      <Field
        id="city"
        label="Ciudad"
        value={billingForm.city}
        onChange={(value) => setBillingForm((current) => ({ ...current, city: value }))}
      />
      <Field
        id="postal_code"
        label="Codigo postal"
        value={billingForm.postal_code}
        onChange={(value) => setBillingForm((current) => ({ ...current, postal_code: value }))}
      />
      <Field
        id="country"
        label="Pais"
        value={billingForm.country}
        onChange={(value) =>
          setBillingForm((current) => ({ ...current, country: value.toUpperCase() }))
        }
      />
    </div>
    <Button type="button" onClick={handleSaveBillingProfile} disabled={billingSaving}>
      {billingSaving ? "Guardando..." : "Guardar datos fiscales"}
    </Button>
  </CardContent>
</Card>
```

- [ ] **Step 6: Add billing helper components/functions**

Add below `formatPlanSlug`:

```tsx
function Field({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function emptyBillingProfileForm(): BillingProfileForm {
  return {
    legal_name: "",
    tax_id_type: "",
    tax_id_value: "",
    address_line1: "",
    address_line2: "",
    city: "",
    postal_code: "",
    country: "ES",
  };
}

function toBillingProfileForm(row: BillingProfileRow | null): BillingProfileForm {
  return {
    legal_name: row?.legal_name ?? "",
    tax_id_type: (row?.tax_id_type as BillingProfileForm["tax_id_type"]) ?? "",
    tax_id_value: row?.tax_id_value ?? "",
    address_line1: row?.address_line1 ?? "",
    address_line2: row?.address_line2 ?? "",
    city: row?.city ?? "",
    postal_code: row?.postal_code ?? "",
    country: row?.country ?? "ES",
  };
}

function hasBillingDetails(form: BillingProfileForm) {
  return [
    form.legal_name,
    form.tax_id_type,
    form.tax_id_value,
    form.address_line1,
    form.address_line2,
    form.city,
    form.postal_code,
  ].some((value) => value.trim().length > 0);
}
```

- [ ] **Step 7: Lint billing UI**

Run:

```bash
npx eslint src/routes/dashboard/billing.tsx src/lib/billing-profile.ts
```

Expected:

```text
No lint errors.
```

## Task 6: Update Docs

**Files:**

- Modify: `README.md`
- Modify: `CONTEXT.md`
- Modify: `PLAN.md`
- Modify: `SKILL.md`

- [ ] **Step 1: Update README**

Add near billing/subscription docs:

```md
Fiscal invoice details are optional. Professionals can subscribe without NIF/CIF/NIE, and can add legal billing details later from `/dashboard/billing` when they need invoices with tax data.
```

- [ ] **Step 2: Update CONTEXT**

Add under subscription MVP:

```md
- Billing/fiscal details are optional and private. Checkout works without them; if present, they sync to the Stripe customer before Checkout for invoice metadata.
```

- [ ] **Step 3: Update PLAN**

Mark NIF/billing profile as complete:

```md
- [x] Optional billing/fiscal profile for invoices:
  - private `billing_profiles`
  - optional NIF/NIE/CIF fields
  - Stripe customer billing metadata sync before Checkout
```

- [ ] **Step 4: Update SKILL**

Add product rule:

```md
- Fiscal invoice fields are optional. Do not block paid subscriptions for informal professionals that do not need NIF/CIF/NIE invoices.
```

## Task 7: Verification

**Files:**

- Verify all files modified in Tasks 1-6.

- [ ] **Step 1: Run focused lint**

Run:

```bash
npx eslint src/lib/billing-profile.ts src/lib/stripe-functions.ts src/routes/dashboard/billing.tsx src/integrations/supabase/types.ts
```

Expected:

```text
No lint errors.
```

- [ ] **Step 2: Run type check**

Run:

```bash
npx tsc --noEmit
```

Expected:

```text
No TypeScript errors.
```

- [ ] **Step 3: Run build**

Run:

```bash
npm run build
```

Expected: build exits `0`. A Wrangler log-file permission warning may appear while the build still succeeds.

- [ ] **Step 4: Verify migration**

Run:

```bash
npx supabase migration list
```

Expected: `20260513000005` appears in local and remote migration history after `db push`.

- [ ] **Step 5: Manual browser smoke**

1. Open `/dashboard/billing`.
2. Confirm the optional “Datos fiscales para facturas” card appears.
3. Save empty form; it should succeed or keep empty values without blocking checkout.
4. Save legal name plus NIF/CIF/NIE details and address; reload and confirm persistence.
5. Start paid checkout with and without fiscal details; both should proceed.

## Self-Review

- Spec coverage: The plan makes fiscal billing data optional, private, editable, and synced to Stripe when present.
- Placeholder scan: The plan includes exact SQL, TypeScript, UI snippets, commands, and expected outputs.
- Type consistency: `billing_profiles`, `BillingProfileForm`, `saveBillingProfile`, and `syncBillingProfileToStripeCustomer` use consistent field names across SQL, types, server functions, UI, and Stripe sync.
