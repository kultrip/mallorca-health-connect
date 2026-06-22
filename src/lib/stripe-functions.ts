import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { syncBillingProfileToStripeCustomer } from "@/lib/billing-profile";

type CheckoutInput = {
  planSlug: string;
  origin: string;
};

type CheckoutResult = {
  url: string | null;
  mode: "setup" | "subscription";
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
  .handler(async ({ context, data }): Promise<CheckoutResult> => {
    if (!paidPlanSlugs.has(data.planSlug)) {
      throw new Response("Unsupported plan", { status: 400 });
    }

    const { default: Stripe } = await import("stripe");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const stripe = new Stripe(getStripeSecretKey(), { apiVersion: "2026-04-22.dahlia" });
    const origin = normalizeOrigin(data.origin);

    const { data: therapist, error: therapistError } = await supabaseAdmin
      .from("therapists")
      .select(
        "id, user_id, full_name, email, verified, status, stripe_customer_id, pending_plan_id, pending_plan_slug, stripe_payment_method_id",
      )
      .eq("user_id", context.userId)
      .single();

    if (therapistError) throw therapistError;
    if (!therapist || therapist.user_id !== context.userId) {
      throw new Response("Therapist profile not found", { status: 404 });
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

    await syncBillingProfileToStripeCustomer({
      userId: context.userId,
      therapistId: therapist.id,
      customerId,
    });

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
  });

export const createCustomerPortalSession = createServerFn({ method: "POST" })
  .inputValidator((data: PortalInput) => data)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { default: Stripe } = await import("stripe");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const stripe = new Stripe(getStripeSecretKey(), { apiVersion: "2026-04-22.dahlia" });
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
