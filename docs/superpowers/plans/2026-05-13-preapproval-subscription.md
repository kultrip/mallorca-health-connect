# Preapproval Subscription Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let professionals choose Profesional or Centros before admin verification, save their Stripe payment method, and create the paid subscription only after admin approval.

**Architecture:** Add pending-plan and setup-intent fields to `therapists`. Branch the existing checkout server function: verified professionals keep subscription Checkout, unverified professionals use setup-mode Checkout. The Stripe webhook stores the saved payment method, and admin approval attempts subscription activation from the pending plan without unlocking benefits until webhooks confirm an active subscription.

**Tech Stack:** React, TanStack Router, TanStack server functions, Supabase Postgres/RLS, Supabase Edge Functions, Stripe Checkout/Billing, TypeScript.

---

## Scope Rules

- Free plan behavior stays unchanged.
- Paid plan selection before verification saves a payment method, not a charge.
- Admin verification still controls whether a professional becomes public.
- Paid benefits still require `verified = true`, `status = 'published'`, `subscription_status = 'active'`, and a paid `plan_id`.
- If subscription activation fails after approval, verification remains approved and the billing error is shown/stored for follow-up.

## File Structure

- Create `supabase/migrations/20260513000002_preapproval_subscription.sql`
  - Adds pending paid-plan and setup-payment fields to `therapists`.

- Modify `src/integrations/supabase/types.ts`
  - Adds the new therapist fields to Row/Insert/Update.

- Modify `src/lib/stripe-functions.ts`
  - Allows unverified professionals to start paid plan setup.
  - Creates setup-mode Checkout for pending verification profiles.
  - Keeps subscription-mode Checkout for verified/published profiles.

- Modify `supabase/functions/stripe-webhook/index.ts`
  - Handles setup-mode `checkout.session.completed`.
  - Stores setup intent and payment method data.
  - Updates active subscription state as before, while clearing pending plan only when a subscription becomes active.

- Modify `src/lib/professional-verification.ts`
  - After approval, creates the Stripe subscription for saved pending paid plans.
  - Stores activation error text if Stripe cannot activate the subscription.

- Modify `src/routes/dashboard/billing.tsx`
  - Removes the verified-only checkout block.
  - Shows pending approval/payment-method state.
  - Updates button labels and checkout success copy.

- Modify `README.md`, `CONTEXT.md`, `PLAN.md`, and `SKILL.md`
  - Documents the new preapproval subscription behavior.

## Task 1: Add Pending Subscription Columns

**Files:**

- Create: `supabase/migrations/20260513000002_preapproval_subscription.sql`

- [ ] **Step 1: Create migration**

Create `supabase/migrations/20260513000002_preapproval_subscription.sql`:

```sql
ALTER TABLE public.therapists
  ADD COLUMN IF NOT EXISTS pending_plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pending_plan_slug TEXT,
  ADD COLUMN IF NOT EXISTS stripe_setup_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_method_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_pending_checkout_session_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_activation_error TEXT;

CREATE INDEX IF NOT EXISTS idx_therapists_pending_plan
  ON public.therapists (pending_plan_id)
  WHERE pending_plan_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_therapists_stripe_setup_intent
  ON public.therapists (stripe_setup_intent_id)
  WHERE stripe_setup_intent_id IS NOT NULL;
```

- [ ] **Step 2: Push migration**

Run:

```bash
npx supabase db push
```

Expected:

```text
Applying migration 20260513000002_preapproval_subscription.sql...
Finished supabase db push.
```

If the linked project reports drift, run:

```bash
npx supabase migration list
```

Expected: the local and remote migration state clearly shows whether `20260513000002` has been applied.

## Task 2: Update Supabase Types

**Files:**

- Modify: `src/integrations/supabase/types.ts`

- [ ] **Step 1: Add therapist Row fields**

Inside `Database["public"]["Tables"]["therapists"]["Row"]`, add:

```ts
pending_plan_id: string | null;
pending_plan_slug: string | null;
stripe_payment_method_id: string | null;
stripe_pending_checkout_session_id: string | null;
stripe_setup_intent_id: string | null;
subscription_activation_error: string | null;
```

- [ ] **Step 2: Add therapist Insert fields**

Inside `Database["public"]["Tables"]["therapists"]["Insert"]`, add:

```ts
          pending_plan_id?: string | null
          pending_plan_slug?: string | null
          stripe_payment_method_id?: string | null
          stripe_pending_checkout_session_id?: string | null
          stripe_setup_intent_id?: string | null
          subscription_activation_error?: string | null
```

- [ ] **Step 3: Add therapist Update fields**

Inside `Database["public"]["Tables"]["therapists"]["Update"]`, add:

```ts
          pending_plan_id?: string | null
          pending_plan_slug?: string | null
          stripe_payment_method_id?: string | null
          stripe_pending_checkout_session_id?: string | null
          stripe_setup_intent_id?: string | null
          subscription_activation_error?: string | null
```

- [ ] **Step 4: Add relationship metadata**

Inside `therapists.Relationships`, add:

```ts
          {
            foreignKeyName: "therapists_pending_plan_id_fkey"
            columns: ["pending_plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
```

- [ ] **Step 5: Verify type file syntax**

Run:

```bash
npx tsc --noEmit
```

Expected: no syntax error in `src/integrations/supabase/types.ts`. If unrelated repo-wide TypeScript errors exist, note them and continue only if this file parses correctly.

## Task 3: Branch Checkout Between Setup and Subscription

**Files:**

- Modify: `src/lib/stripe-functions.ts`

- [ ] **Step 1: Extend checkout return type**

Add this type near `CheckoutInput`:

```ts
type CheckoutResult = {
  url: string | null;
  mode: "setup" | "subscription";
};
```

Change the server function return statements to return `CheckoutResult`.

- [ ] **Step 2: Load pending fields and remove verified block**

Replace the therapist select in `createCheckoutSession` with:

```ts
.select(
  "id, user_id, full_name, email, verified, status, stripe_customer_id, pending_plan_id, pending_plan_slug, stripe_payment_method_id",
)
```

Delete this verified-only block:

```ts
if (therapist.verified !== true || therapist.status !== "published") {
  throw new Response("Professional verification is required before subscribing", {
    status: 403,
  });
}
```

- [ ] **Step 3: Keep existing customer creation**

Keep the existing customer creation code, but make sure it still runs before either checkout branch:

```ts
let customerId = therapist.stripe_customer_id;

if (!customerId) {
  const customer = await stripe.customers.create({
    email: therapist.email ?? undefined,
    name: therapist.full_name,
    metadata: {
      user_id: context.userId,
      therapist_id: therapist.id,
    },
  });
  customerId = customer.id;

  const { error: updateError } = await supabaseAdmin
    .from("therapists")
    .update({ stripe_customer_id: customerId })
    .eq("id", therapist.id);

  if (updateError) throw updateError;
}
```

- [ ] **Step 4: Add verified subscription Checkout branch**

After loading the plan and customer, add:

```ts
const isVerifiedPublished = therapist.verified === true && therapist.status === "published";

if (isVerifiedPublished) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    client_reference_id: therapist.id,
    line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
    success_url: `${origin}/dashboard/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/dashboard/billing?checkout=cancelled`,
    subscription_data: {
      metadata: {
        user_id: context.userId,
        therapist_id: therapist.id,
        plan_id: plan.id,
        plan_slug: plan.slug,
      },
    },
    metadata: {
      checkout_kind: "subscription",
      user_id: context.userId,
      therapist_id: therapist.id,
      plan_id: plan.id,
      plan_slug: plan.slug,
    },
  });

  return { url: session.url, mode: "subscription" };
}
```

- [ ] **Step 5: Add preapproval setup Checkout branch**

Immediately after the verified branch, add:

```ts
const session = await stripe.checkout.sessions.create({
  customer: customerId,
  mode: "setup",
  client_reference_id: therapist.id,
  payment_method_types: ["card"],
  success_url: `${origin}/dashboard/billing?checkout=setup_success&session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${origin}/dashboard/billing?checkout=cancelled`,
  setup_intent_data: {
    metadata: {
      user_id: context.userId,
      therapist_id: therapist.id,
      plan_id: plan.id,
      plan_slug: plan.slug,
    },
  },
  metadata: {
    checkout_kind: "preapproval_setup",
    user_id: context.userId,
    therapist_id: therapist.id,
    plan_id: plan.id,
    plan_slug: plan.slug,
  },
});

const { error: pendingError } = await supabaseAdmin
  .from("therapists")
  .update({
    pending_plan_id: plan.id,
    pending_plan_slug: plan.slug,
    stripe_pending_checkout_session_id: session.id,
    subscription_activation_error: null,
  })
  .eq("id", therapist.id);

if (pendingError) throw pendingError;

return { url: session.url, mode: "setup" };
```

- [ ] **Step 6: Lint checkout function**

Run:

```bash
npx eslint src/lib/stripe-functions.ts
```

Expected:

```text
No lint errors in src/lib/stripe-functions.ts.
```

## Task 4: Persist Setup-Mode Checkout Webhooks

**Files:**

- Modify: `supabase/functions/stripe-webhook/index.ts`

- [ ] **Step 1: Add setup-session helper**

Add this helper above `applySubscriptionState`:

```ts
async function applySetupSessionState(
  supabase: SupabaseAdmin,
  stripeClient: Stripe,
  session: Stripe.Checkout.Session,
) {
  const therapistId = session.metadata?.therapist_id ?? session.client_reference_id ?? null;
  const planId = session.metadata?.plan_id ?? null;
  const planSlug = session.metadata?.plan_slug ?? null;
  const customerId =
    typeof session.customer === "string" ? session.customer : (session.customer?.id ?? null);
  const setupIntentId =
    typeof session.setup_intent === "string"
      ? session.setup_intent
      : (session.setup_intent?.id ?? null);

  if (!therapistId || !planId || !planSlug || !customerId || !setupIntentId) {
    throw new Error(`Setup session ${session.id} is missing required metadata`);
  }

  const setupIntent = await stripeClient.setupIntents.retrieve(setupIntentId);
  const paymentMethodId =
    typeof setupIntent.payment_method === "string"
      ? setupIntent.payment_method
      : (setupIntent.payment_method?.id ?? null);

  if (!paymentMethodId) {
    throw new Error(`Setup intent ${setupIntentId} has no payment method`);
  }

  await stripeClient.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });

  const { error } = await supabase
    .from("therapists")
    .update({
      stripe_customer_id: customerId,
      stripe_setup_intent_id: setupIntentId,
      stripe_payment_method_id: paymentMethodId,
      stripe_pending_checkout_session_id: session.id,
      pending_plan_id: planId,
      pending_plan_slug: planSlug,
      subscription_activation_error: null,
    })
    .eq("id", therapistId);

  if (error) throw error;
}
```

- [ ] **Step 2: Clear pending plan only after active subscription**

Inside `applySubscriptionState`, replace the `update` object with:

```ts
const isActive = subscription.status === "active";
const update = {
  stripe_customer_id: customerId,
  stripe_subscription_id: subscription.id,
  stripe_price_id: priceId,
  subscription_status: subscription.status,
  plan_id: isActive && plan?.id ? plan.id : null,
  pending_plan_id: isActive ? null : undefined,
  pending_plan_slug: isActive ? null : undefined,
  subscription_activation_error: isActive ? null : undefined,
};
```

Then remove `undefined` keys before calling Supabase:

```ts
const cleanUpdate = Object.fromEntries(
  Object.entries(update).filter(([, value]) => value !== undefined),
);

const query = supabase.from("therapists").update(cleanUpdate);
```

- [ ] **Step 3: Route setup-mode checkout completion**

Inside the `checkout.session.completed` case, replace the existing subscription-only logic with:

```ts
if (session.mode === "setup") {
  await applySetupSessionState(supabase, stripe, session);
}

if (session.mode === "subscription" && session.subscription) {
  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription.id;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await applySubscriptionState(supabase, subscription);
}
```

- [ ] **Step 4: Deploy webhook after implementation**

Run:

```bash
npx supabase functions deploy stripe-webhook
```

Expected:

```text
Deployed Functions on project zkmlbbbpfhbtbedskxcr: stripe-webhook
```

If authentication is required, run `npx supabase login` and retry.

## Task 5: Activate Pending Subscription on Admin Approval

**Files:**

- Modify: `src/lib/professional-verification.ts`

- [ ] **Step 1: Add Stripe key helper**

Add below `adminUrl`:

```ts
function getStripeSecretKey() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Response("Missing STRIPE_SECRET_KEY", { status: 500 });
  return key;
}
```

- [ ] **Step 2: Add activation helper**

Add this function above `requireAdmin`:

```ts
async function activatePendingSubscription(therapistId: string) {
  const { default: Stripe } = await import("stripe");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const stripe = new Stripe(getStripeSecretKey(), { apiVersion: "2025-02-24.acacia" });

  const { data: therapist, error } = await supabaseAdmin
    .from("therapists")
    .select(
      "id, user_id, stripe_customer_id, stripe_payment_method_id, pending_plan_id, pending_plan_slug",
    )
    .eq("id", therapistId)
    .single();

  if (error) throw error;
  if (!therapist.pending_plan_id) return;

  if (!therapist.stripe_customer_id || !therapist.stripe_payment_method_id) {
    const message =
      "El plan de pago esta seleccionado, pero falta guardar el metodo de pago en Stripe.";
    await supabaseAdmin
      .from("therapists")
      .update({ subscription_activation_error: message })
      .eq("id", therapistId);
    return;
  }

  const { data: plan, error: planError } = await supabaseAdmin
    .from("plans")
    .select("id, slug, stripe_price_id, billing_enabled")
    .eq("id", therapist.pending_plan_id)
    .single();

  if (planError) throw planError;
  if (!plan.billing_enabled || !plan.stripe_price_id) {
    const message = "El plan pendiente no esta configurado para Stripe.";
    await supabaseAdmin
      .from("therapists")
      .update({ subscription_activation_error: message })
      .eq("id", therapistId);
    return;
  }

  try {
    await stripe.subscriptions.create({
      customer: therapist.stripe_customer_id,
      items: [{ price: plan.stripe_price_id }],
      default_payment_method: therapist.stripe_payment_method_id,
      collection_method: "charge_automatically",
      payment_behavior: "error_if_incomplete",
      metadata: {
        user_id: therapist.user_id,
        therapist_id: therapist.id,
        plan_id: plan.id,
        plan_slug: plan.slug,
      },
      payment_settings: {
        save_default_payment_method: "on_subscription",
      },
    });

    await supabaseAdmin
      .from("therapists")
      .update({ subscription_activation_error: null })
      .eq("id", therapistId);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo activar la suscripcion en Stripe.";
    await supabaseAdmin
      .from("therapists")
      .update({ subscription_activation_error: message })
      .eq("id", therapistId);
  }
}
```

- [ ] **Step 3: Call activation after approval update**

In `approveProfessionalRequest`, after:

```ts
if (error) throw error;
```

add:

```ts
await activatePendingSubscription(therapist.id);
```

Keep the approval email after the activation attempt, so the user receives the normal approval email even if subscription activation needs follow-up.

- [ ] **Step 4: Lint verification function**

Run:

```bash
npx eslint src/lib/professional-verification.ts
```

Expected:

```text
No lint errors in src/lib/professional-verification.ts.
```

## Task 6: Update Billing Dashboard UI

**Files:**

- Modify: `src/routes/dashboard/billing.tsx`

- [ ] **Step 1: Replace checkout success copy**

In the checkout query-param effect, use:

```ts
if (checkout === "success") {
  toast.success("Pago recibido. Estamos actualizando tu suscripcion.");
}
if (checkout === "setup_success") {
  toast.success("Metodo de pago guardado. Tu plan se activara cuando aprobemos tu perfil.");
}
if (checkout === "cancelled") {
  toast.info("Checkout cancelado. Puedes elegir un plan cuando quieras.");
}
```

- [ ] **Step 2: Replace checkout eligibility**

Replace:

```ts
const isVerified = profile?.verified === true && profile.status === "published";
const canCheckout = Boolean(profile && isVerified && !isActive);
```

with:

```ts
const isVerified = profile?.verified === true && profile.status === "published";
const hasPendingPaidPlan = Boolean(profile?.pending_plan_id || profile?.pending_plan_slug);
const hasSavedPaymentMethod = Boolean(profile?.stripe_payment_method_id);
const canCheckout = Boolean(profile && !isActive);
```

- [ ] **Step 3: Replace verification warning card**

Replace the current “Verificacion requerida” card body with copy that does not block plan setup:

```tsx
{
  profile && !isVerified && (
    <Card className="border-amber-300 bg-amber-50/70">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-950">
          <LockKeyhole className="h-5 w-5" />
          Verificacion pendiente
        </CardTitle>
        <CardDescription className="text-amber-900">
          Puedes elegir un plan de pago ahora. Guardaremos el metodo de pago y la suscripcion
          empezara solo si Mallorca Holistica aprueba tu perfil.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
```

- [ ] **Step 4: Add pending-plan status card**

After the current plan card, add:

```tsx
{
  profile && !isActive && hasPendingPaidPlan && (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle>Plan pendiente de aprobacion</CardTitle>
        <CardDescription>
          Has elegido {formatPlanSlug(profile.pending_plan_slug)}.
          {hasSavedPaymentMethod
            ? " El metodo de pago esta guardado y se cobrara cuando aprobemos tu perfil."
            : " Falta completar Stripe para guardar el metodo de pago."}
        </CardDescription>
        {profile.subscription_activation_error && (
          <p className="text-sm text-destructive">{profile.subscription_activation_error}</p>
        )}
      </CardHeader>
    </Card>
  );
}
```

Add this helper below `formatMonthlyPrice`:

```ts
function formatPlanSlug(slug: string | null | undefined) {
  if (slug === "profesional") return "Profesional";
  if (slug === "centros-organizadores") return "Centros";
  return "un plan de pago";
}
```

- [ ] **Step 5: Update plan button label**

Replace the button label expression with:

```tsx
{
  pendingPlanSlug === plan.slug
    ? "Abriendo Stripe..."
    : isVerified
      ? `Seleccionar ${plan.name}`
      : `Elegir ${plan.name}`;
}
```

- [ ] **Step 6: Lint billing page**

Run:

```bash
npx eslint src/routes/dashboard/billing.tsx
```

Expected:

```text
No lint errors in src/routes/dashboard/billing.tsx.
```

## Task 7: Update Documentation

**Files:**

- Modify: `README.md`
- Modify: `CONTEXT.md`
- Modify: `PLAN.md`
- Modify: `SKILL.md`

- [ ] **Step 1: Update README billing section**

Replace the old line that says checkout is restricted to verified/published professionals with:

```md
Paid plan selection can start before admin verification. Unverified professionals use Stripe Checkout in setup mode to save a payment method; no subscription is created and no charge is made until an admin approves the profile. Verified/published professionals use subscription Checkout directly.
```

- [ ] **Step 2: Update CONTEXT billing bullets**

Replace the old checkout block with:

```md
- `/dashboard/billing` loads billing-enabled plans from Supabase.
- Unverified professionals can choose a paid plan; Stripe Checkout runs in setup mode and stores a payment method for later.
- Admin approval attempts to create the pending Stripe subscription with the saved payment method.
- Stripe webhooks update `stripe_customer_id`, setup intent/payment method fields, `stripe_subscription_id`, `stripe_price_id`, `subscription_status`, and active `plan_id`.
- Public direct-contact actions require verified/published profile, active subscription, and a paid plan slug.
```

- [ ] **Step 3: Update PLAN milestone**

Add:

```md
- Preapproval subscriptions: allow paid plan selection before verification using Stripe setup-mode Checkout, then activate the subscription after admin approval.
```

- [ ] **Step 4: Update SKILL operating note**

Add:

```md
- Subscription benefits must read active Stripe webhook state. Pending paid plans and saved payment methods never unlock public paid features by themselves.
```

## Task 8: Full Verification

**Files:**

- Verify all files modified in Tasks 1-7.

- [ ] **Step 1: Run focused lint**

Run:

```bash
npx eslint src/lib/stripe-functions.ts src/lib/professional-verification.ts src/routes/dashboard/billing.tsx src/integrations/supabase/types.ts
```

Expected:

```text
No lint errors in changed TypeScript files.
```

- [ ] **Step 2: Run build**

Run:

```bash
npm run build
```

Expected:

```text
Build completes successfully.
```

- [ ] **Step 3: Verify Supabase migration**

Run:

```bash
npx supabase migration list
```

Expected: migration `20260513000002` appears in local and remote history after `db push`.

- [ ] **Step 4: Verify webhook deployment**

Run:

```bash
npx supabase functions deploy stripe-webhook
```

Expected:

```text
Deployed Functions on project zkmlbbbpfhbtbedskxcr: stripe-webhook
```

- [ ] **Step 5: Manual test unverified setup flow**

Use an unverified/pending professional account:

1. Open `/dashboard/billing`.
2. Click a paid plan.
3. Complete Stripe Checkout with a test card.
4. Return to `/dashboard/billing?checkout=setup_success`.
5. Confirm Supabase `therapists` row has:
   - `pending_plan_id`
   - `pending_plan_slug`
   - `stripe_customer_id`
   - `stripe_setup_intent_id`
   - `stripe_payment_method_id`
6. Confirm `subscription_status` is not `active`.
7. Confirm public direct contact remains hidden.

- [ ] **Step 6: Manual test approval activation**

Use an admin account:

1. Open `/dashboard/admin`.
2. Approve the pending professional.
3. Confirm Stripe creates a subscription for the pending plan.
4. Confirm webhook sets:
   - `verified = true`
   - `status = 'published'`
   - `subscription_status = 'active'`
   - active paid `plan_id`
   - `pending_plan_id = null`
   - `pending_plan_slug = null`
5. Confirm public direct contact appears if the paid plan supports it.

## Self-Review

- Spec coverage: The plan covers setup-mode Checkout before verification, approval-time subscription creation, webhook state updates, dashboard status, and unchanged paid benefit rules.
- Placeholder scan: The plan contains concrete migration SQL, TypeScript snippets, commands, and expected outputs.
- Type consistency: `pending_plan_id`, `pending_plan_slug`, `stripe_setup_intent_id`, `stripe_payment_method_id`, `stripe_pending_checkout_session_id`, and `subscription_activation_error` are named consistently across migration, types, server functions, webhook, and dashboard.
