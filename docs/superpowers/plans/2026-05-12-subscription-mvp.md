# Subscription MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let verified Mallorca Holistica professionals subscribe to Profesional or Centros from `/dashboard/billing`, pay through Stripe Checkout, and unlock plan benefits only after Stripe webhooks confirm an active subscription.

**Architecture:** Supabase `plans` becomes the source of truth for paid plan metadata and Stripe price mapping. The client sends only a plan slug to authenticated TanStack server functions; the server validates the current user, verifies the therapist profile is approved, creates Stripe Checkout/Portal sessions, and lets the Stripe webhook update `therapists.plan_id` and subscription fields. Public profile benefits continue to read plan data, but direct contact requires an active paid subscription plus verified/published therapist status.

**Tech Stack:** React/TanStack Start routes and server functions, Supabase Auth/Postgres/RLS/service role, Stripe Checkout, Stripe Customer Portal, Supabase Edge Function webhooks, TypeScript, ESLint, Vite.

---

## Product Decisions

- Only professionals with `therapists.verified = true` and `therapists.status = 'published'` can start Stripe Checkout.
- Payment does not replace admin verification.
- Stripe webhook confirmation is the source of truth for paid benefits.
- A therapist has paid public benefits only when:
  - `verified = true`
  - `status = 'published'`
  - `subscription_status = 'active'`
  - `plans.slug` is `profesional` or `centros-organizadores`
- The client must not send trusted billing identity values such as `userId`, `customerId`, or raw Stripe price IDs.
- The temporary test products can use Stripe test mode. Production values must be configured before live payments.

## Required Stripe Dashboard Setup

Before testing checkout end-to-end, create or confirm these Stripe test-mode objects:

- Product: `Mallorca Holistica Profesional`
  - Monthly recurring price
  - Current repo draft price ID: `price_1TVhCGB0PmMiFfkDBt929ffT`
  - Confirm this price exists in the Stripe account before applying the migration
- Product: `Mallorca Holistica Centros`
  - Monthly recurring price
  - Current repo draft price ID: `price_1TVhD1B0PmMiFfkDcDzJNeZg`
  - Confirm this price exists in the Stripe account before applying the migration
- Customer Portal:
  - Activate the Stripe Customer Portal in test mode
  - Enable subscription cancellation and payment method updates
- Webhook endpoint:
  - URL points to the deployed Supabase Edge Function `stripe-webhook`
  - Events:
    - `checkout.session.completed`
    - `customer.subscription.created`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`

## Environment Variables

Application server/runtime:

```text
STRIPE_SECRET_KEY=sk_test_...
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Supabase Edge Function secrets:

```text
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SECRET_SUPABASE_URL=...
SECRET_SUPABASE_SERVICE_ROLE_KEY=...
```

Set Edge Function secrets with:

```bash
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_...
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
npx supabase secrets set SECRET_SUPABASE_URL=...
npx supabase secrets set SECRET_SUPABASE_SERVICE_ROLE_KEY=...
```

Do not commit real Stripe or Supabase secrets.

## File Structure

- Modify `supabase/migrations/20260512000001_subscription_plan_mapping.sql`: add Stripe mapping fields to `plans`, seed/update paid plan rows, and create useful indexes.
- Modify `src/integrations/supabase/types.ts`: add new `plans` columns to generated TypeScript types.
- Modify `src/lib/plan-access.ts`: require active paid subscription plus verified/published status for direct contact benefits.
- Replace `src/lib/stripe-functions.ts`: authenticated server functions for checkout and portal.
- Modify `src/routes/dashboard/billing.tsx`: use secure server functions, load billing-enabled plans, block unverified checkout, and show plan states.
- Modify `supabase/functions/stripe-webhook/index.ts`: verify Stripe signatures and update therapist subscription state and `plan_id` from the Stripe price ID.
- Modify `README.md`: document Stripe setup, env vars, migration commands, and webhook deployment/testing.
- Modify `CONTEXT.md`: document the implemented subscription decisions for future agents.

---

### Task 1: Add Stripe Mapping To Plans

**Files:**

- Create: `supabase/migrations/20260512000001_subscription_plan_mapping.sql`
- Modify: `src/integrations/supabase/types.ts`

- [ ] **Step 1: Add the migration**

Create `supabase/migrations/20260512000001_subscription_plan_mapping.sql`:

```sql
-- ============ STRIPE PLAN MAPPING ============
ALTER TABLE public.plans
ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS billing_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS billing_interval TEXT NOT NULL DEFAULT 'month';

CREATE INDEX IF NOT EXISTS idx_plans_billing_enabled
ON public.plans (billing_enabled, rank);

CREATE INDEX IF NOT EXISTS idx_plans_stripe_price_id
ON public.plans (stripe_price_id)
WHERE stripe_price_id IS NOT NULL;

INSERT INTO public.plans (slug, name, price_monthly_cents, description, features, rank, billing_enabled, billing_interval)
VALUES
  (
    'presencia',
    'Presencia',
    0,
    'Perfil verificado gratuito dentro del ecosistema Mallorca Holistica.',
    '{"direct_contact": false, "activities": false}'::jsonb,
    10,
    false,
    'month'
  ),
  (
    'profesional',
    'Profesional',
    2900,
    'Plan para profesionales verificados que quieren mostrar contacto directo y enlaces de reserva.',
    '{"direct_contact": true, "activities": false}'::jsonb,
    20,
    true,
    'month'
  ),
  (
    'centros-organizadores',
    'Centros & Organizadores',
    5900,
    'Plan para centros y organizadores verificados con visibilidad avanzada y actividades.',
    '{"direct_contact": true, "activities": true}'::jsonb,
    30,
    true,
    'month'
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  price_monthly_cents = EXCLUDED.price_monthly_cents,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  rank = EXCLUDED.rank,
  billing_enabled = EXCLUDED.billing_enabled,
  billing_interval = EXCLUDED.billing_interval;

UPDATE public.plans
SET stripe_price_id = 'price_1TVhCGB0PmMiFfkDBt929ffT'
WHERE slug = 'profesional';

UPDATE public.plans
SET stripe_price_id = 'price_1TVhD1B0PmMiFfkDcDzJNeZg'
WHERE slug = 'centros-organizadores';
```

- [ ] **Step 2: Confirm Stripe price IDs before applying the migration**

Open the Stripe Dashboard in test mode and confirm both prices exist:

```text
price_1TVhCGB0PmMiFfkDBt929ffT
price_1TVhD1B0PmMiFfkDcDzJNeZg
```

Expected: both are active monthly recurring test-mode prices in the connected Stripe account. If either price does not exist, create the correct Stripe price first and update the two SQL `UPDATE public.plans` statements with the actual returned `price_...` values before running `npx supabase db push`.

- [ ] **Step 3: Update Supabase types manually**

In `src/integrations/supabase/types.ts`, add these fields to `public.Tables.plans.Row`:

```ts
billing_enabled: boolean;
billing_interval: string;
stripe_price_id: string | null;
stripe_product_id: string | null;
```

Add these fields to `public.Tables.plans.Insert`:

```ts
billing_enabled?: boolean;
billing_interval?: string;
stripe_price_id?: string | null;
stripe_product_id?: string | null;
```

Add these fields to `public.Tables.plans.Update`:

```ts
billing_enabled?: boolean;
billing_interval?: string;
stripe_price_id?: string | null;
stripe_product_id?: string | null;
```

- [ ] **Step 4: Verify the migration and types**

Run:

```bash
rg -n "stripe_price_id|billing_enabled|billing_interval" supabase/migrations/20260512000001_subscription_plan_mapping.sql src/integrations/supabase/types.ts
```

Expected: output shows the SQL migration and all three TypeScript type sections.

---

### Task 2: Harden Plan Benefit Checks

**Files:**

- Modify: `src/lib/plan-access.ts`
- Modify: `src/features/professionals/ProfessionalProfilePage.tsx`

- [ ] **Step 1: Replace the permissive helper with subscription-aware helpers**

Replace `src/lib/plan-access.ts` with:

```ts
type PlanLike =
  | {
      slug?: string | null;
      name?: string | null;
      price_monthly_cents?: number | null;
    }
  | null
  | undefined;

type TherapistAccessLike = {
  verified?: boolean | null;
  status?: string | null;
  subscription_status?: string | null;
};

const directContactPlanSlugs = new Set(["profesional", "centros-organizadores"]);

export function isActivePaidSubscription(status: string | null | undefined): boolean {
  return status === "active";
}

export function planSupportsDirectContact(plan: PlanLike): boolean {
  const slug = plan?.slug?.toLowerCase();
  return Boolean(slug && directContactPlanSlugs.has(slug));
}

export function therapistCanShowDirectContact(
  therapist: TherapistAccessLike,
  plan: PlanLike,
): boolean {
  return (
    therapist.verified === true &&
    therapist.status === "published" &&
    isActivePaidSubscription(therapist.subscription_status) &&
    planSupportsDirectContact(plan)
  );
}
```

- [ ] **Step 2: Update profile page usage**

In `src/features/professionals/ProfessionalProfilePage.tsx`, replace the current import:

```ts
import { planSupportsDirectContact } from "@/lib/plan-access";
```

with:

```ts
import { therapistCanShowDirectContact } from "@/lib/plan-access";
```

Replace:

```ts
const canShowDirectContact = planSupportsDirectContact(firstRelation(extra.plans));
```

with:

```ts
const canShowDirectContact = therapistCanShowDirectContact(data, firstRelation(extra.plans));
```

- [ ] **Step 3: Verify the changed benefit rule**

Run:

```bash
npx eslint src/lib/plan-access.ts src/features/professionals/ProfessionalProfilePage.tsx
```

Expected: exits 0.

---

### Task 3: Replace Stripe Server Functions

**Files:**

- Modify: `src/lib/stripe-functions.ts`

- [ ] **Step 1: Replace client-trusted inputs**

Replace the current `src/lib/stripe-functions.ts` with server-authenticated functions that accept only safe inputs:

```ts
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type CheckoutInput = {
  planSlug: string;
  origin: string;
};

type PortalInput = {
  origin: string;
};

const paidPlanSlugs = new Set(["profesional", "centros-organizadores"]);

function normalizeOrigin(origin: string) {
  const url = new URL(origin);
  return url.origin;
}

function getStripeSecretKey() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Response("Missing STRIPE_SECRET_KEY", { status: 500 });
  return key;
}

export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((data: CheckoutInput) => data)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    if (!paidPlanSlugs.has(data.planSlug)) {
      throw new Response("Unsupported plan", { status: 400 });
    }

    const { default: Stripe } = await import("stripe");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const stripe = new Stripe(getStripeSecretKey(), { apiVersion: "2025-02-24.acacia" });
    const origin = normalizeOrigin(data.origin);

    const { data: therapist, error: therapistError } = await supabaseAdmin
      .from("therapists")
      .select("id, user_id, full_name, email, verified, status, stripe_customer_id")
      .eq("user_id", context.userId)
      .single();

    if (therapistError) throw therapistError;
    if (!therapist || therapist.user_id !== context.userId) {
      throw new Response("Therapist profile not found", { status: 404 });
    }
    if (therapist.verified !== true || therapist.status !== "published") {
      throw new Response("Professional verification is required before subscribing", {
        status: 403,
      });
    }

    const { data: plan, error: planError } = await supabaseAdmin
      .from("plans")
      .select("id, slug, name, stripe_price_id, billing_enabled")
      .eq("slug", data.planSlug)
      .eq("billing_enabled", true)
      .single();

    if (planError) throw planError;
    if (!plan?.stripe_price_id) {
      throw new Response("Plan is not configured for Stripe checkout", { status: 500 });
    }

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
        user_id: context.userId,
        therapist_id: therapist.id,
        plan_id: plan.id,
        plan_slug: plan.slug,
      },
    });

    return { url: session.url };
  });

export const createCustomerPortalSession = createServerFn({ method: "POST" })
  .inputValidator((data: PortalInput) => data)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { default: Stripe } = await import("stripe");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const stripe = new Stripe(getStripeSecretKey(), { apiVersion: "2025-02-24.acacia" });
    const origin = normalizeOrigin(data.origin);

    const { data: therapist, error } = await supabaseAdmin
      .from("therapists")
      .select("stripe_customer_id")
      .eq("user_id", context.userId)
      .single();

    if (error) throw error;
    if (!therapist?.stripe_customer_id) {
      throw new Response("No Stripe customer found", { status: 404 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: therapist.stripe_customer_id,
      return_url: `${origin}/dashboard/billing`,
    });

    return { url: session.url };
  });
```

- [ ] **Step 2: Verify server function syntax**

Run:

```bash
npx eslint src/lib/stripe-functions.ts
```

Expected: exits 0. If `.inputValidator` fails at runtime, match the established pattern in `src/lib/professional-verification.ts`.

---

### Task 4: Update Billing UI

**Files:**

- Modify: `src/routes/dashboard/billing.tsx`

- [ ] **Step 1: Use typed state and load paid plans from Supabase**

In `src/routes/dashboard/billing.tsx`, remove hardcoded Stripe price IDs and load plans with:

```ts
const { data: plans, error: plansError } = await supabase
  .from("plans")
  .select("id, slug, name, description, price_monthly_cents, features, rank, billing_enabled")
  .eq("billing_enabled", true)
  .order("rank", { ascending: true });
```

Expected: plan cards come from Supabase rows for `profesional` and `centros-organizadores`.

- [ ] **Step 2: Pass only `planSlug` to checkout**

Replace the existing checkout call with:

```ts
const accessToken = await getAccessToken();
const { url } = await createCheckoutSession({
  data: {
    planSlug,
    origin: window.location.origin,
  },
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
```

Add helper:

```ts
async function getAccessToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const token = data.session?.access_token;
  if (!token) throw new Error("Tu sesion ha caducado. Vuelve a iniciar sesion.");
  return token;
}
```

- [ ] **Step 3: Pass no customer ID to the portal function**

Replace the existing portal call with:

```ts
const accessToken = await getAccessToken();
const { url } = await createCustomerPortalSession({
  data: {
    origin: window.location.origin,
  },
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
```

- [ ] **Step 4: Add verification gate copy**

If the therapist profile is missing, show:

```text
Completa tu perfil profesional antes de elegir un plan.
```

If `profile.verified !== true || profile.status !== "published"`, show:

```text
Tu perfil debe ser verificado por Mallorca Holistica antes de contratar un plan.
```

Disable checkout buttons in that state.

- [ ] **Step 5: Show active subscription state**

Use:

```ts
const isActive = profile?.subscription_status === "active";
const currentPlanName = profile?.plans?.name ?? "Presencia";
```

When active, show:

```text
Tu suscripcion esta activa.
```

and a `Gestionar facturacion` button.

- [ ] **Step 6: Verify billing route lint**

Run:

```bash
npx eslint src/routes/dashboard/billing.tsx src/lib/stripe-functions.ts
```

Expected: exits 0.

---

### Task 5: Harden Stripe Webhook

**Files:**

- Modify: `supabase/functions/stripe-webhook/index.ts`

- [ ] **Step 1: Use Stripe price IDs to map subscriptions to plans**

In `supabase/functions/stripe-webhook/index.ts`, add a helper:

```ts
async function applySubscriptionState(
  supabase: ReturnType<typeof createClient>,
  subscription: Stripe.Subscription,
) {
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const firstItem = subscription.items.data[0];
  const priceId = firstItem?.price?.id ?? null;

  if (!priceId) {
    throw new Error(`Subscription ${subscription.id} has no price id`);
  }

  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("id")
    .eq("stripe_price_id", priceId)
    .maybeSingle();

  if (planError) throw planError;

  const { error: therapistError } = await supabase
    .from("therapists")
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      subscription_status: subscription.status,
      plan_id: subscription.status === "active" && plan?.id ? plan.id : null,
    })
    .eq("stripe_customer_id", customerId);

  if (therapistError) throw therapistError;
}
```

- [ ] **Step 2: Retrieve subscriptions for checkout completion**

In the `checkout.session.completed` case, retrieve the subscription and apply state:

```ts
case "checkout.session.completed": {
  const session = event.data.object as Stripe.Checkout.Session;

  if (session.mode === "subscription" && session.subscription) {
    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : session.subscription.id;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await applySubscriptionState(supabase, subscription);
  }

  break;
}
```

- [ ] **Step 3: Apply state on subscription created/updated/deleted**

Use:

```ts
case "customer.subscription.created":
case "customer.subscription.updated":
case "customer.subscription.deleted": {
  const subscription = event.data.object as Stripe.Subscription;
  await applySubscriptionState(supabase, subscription);
  break;
}
```

- [ ] **Step 4: Keep canceled subscriptions from retaining paid plan benefits**

Confirm the helper sets:

```ts
plan_id: subscription.status === "active" && plan?.id ? plan.id : null;
```

Expected: canceled, unpaid, incomplete, or past-due subscriptions do not keep paid direct-contact benefits.

- [ ] **Step 5: Verify webhook code formatting by deploy dry run/build**

Run:

```bash
npx supabase functions deploy stripe-webhook
```

Expected: deploy succeeds after Supabase secrets are set. If testing locally first, run the local Supabase function flow with Stripe CLI forwarding.

---

### Task 6: Apply Migration And Configure Stripe Values

**Files:**

- Remote Supabase database
- Stripe Dashboard

- [ ] **Step 1: Push the migration**

Run:

```bash
npx supabase db push
```

Expected: migration `20260512000001` is applied.

- [ ] **Step 2: Confirm migration history**

Run:

```bash
npx supabase migration list
```

Expected: local and remote both include:

```text
20260512000001 | 20260512000001
```

- [ ] **Step 3: Confirm plan rows**

In Supabase SQL Editor, run:

```sql
SELECT slug, name, price_monthly_cents, billing_enabled, stripe_price_id
FROM public.plans
ORDER BY rank;
```

Expected:

- `presencia` has `billing_enabled = false`
- `profesional` has `billing_enabled = true` and a test `price_...`
- `centros-organizadores` has `billing_enabled = true` and a test `price_...`

---

### Task 7: End-To-End Verification

**Files:**

- Verify all files modified in Tasks 1-6.

- [ ] **Step 1: Run targeted lint**

Run:

```bash
npx eslint src/lib/plan-access.ts src/lib/stripe-functions.ts src/routes/dashboard/billing.tsx src/features/professionals/ProfessionalProfilePage.tsx
```

Expected: exits 0.

- [ ] **Step 2: Run build**

Run:

```bash
npm run build
```

Expected: exits 0. Existing Wrangler log-write permission warnings may appear without failing the build.

- [ ] **Step 3: Check client bundle for server-only strings**

Run:

```bash
rg -n "STRIPE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY|stripe\\.checkout|billingPortal|supabaseAdmin" dist/client
```

Expected: no results that expose secret-bearing server implementation in client assets.

- [ ] **Step 4: Browser smoke test unverified profile**

Start dev server:

```bash
npm run dev -- --host 127.0.0.1 --port 8081
```

Visit:

```text
http://127.0.0.1:8081/dashboard/billing
```

Expected for unverified professional:

- checkout buttons are disabled
- page says verification is required before choosing a plan
- no Stripe redirect can be started

- [ ] **Step 5: Browser smoke test verified profile**

With a verified/published therapist:

```sql
UPDATE public.therapists
SET verified = true, status = 'published'
WHERE user_id = '<TEST_USER_ID>';
```

Visit `/dashboard/billing`.

Expected:

- Profesional and Centros cards appear
- clicking a plan opens Stripe Checkout
- cancel returns to `/dashboard/billing?checkout=cancelled`

- [ ] **Step 6: Test successful subscription webhook**

Complete checkout with a Stripe test card.

Expected in Supabase:

```sql
SELECT subscription_status, stripe_customer_id, stripe_subscription_id, stripe_price_id, plan_id
FROM public.therapists
WHERE user_id = '<TEST_USER_ID>';
```

Expected:

- `subscription_status = 'active'`
- `stripe_customer_id` is non-null
- `stripe_subscription_id` is non-null
- `stripe_price_id` equals the chosen plan price
- `plan_id` points to the chosen plan

- [ ] **Step 7: Test public profile benefit unlock**

Open the professional public profile.

Expected:

- active Profesional or Centros subscription shows direct contact/reservation actions when contact fields exist
- Free verified profile does not show the prominent direct contact block

---

## Self-Review

- Spec coverage: covers verified-only checkout, Stripe Checkout, Customer Portal, webhook-confirmed Supabase plan updates, and plan-aware public contact benefits.
- Security coverage: removes client-trusted `userId`, `customerId`, raw `priceId`, and subscription status updates.
- Type consistency: `stripe_price_id`, `stripe_product_id`, `billing_enabled`, and `billing_interval` are defined in SQL and Supabase types.
- Scope check: activities publishing and center-specific workflows are out of scope for this plan; the Centros plan only records subscription entitlement for future activity permissions.
- Operational coverage: includes Stripe Dashboard setup, Edge Function secrets, migration push, webhook deploy, lint/build checks, and browser smoke tests.
