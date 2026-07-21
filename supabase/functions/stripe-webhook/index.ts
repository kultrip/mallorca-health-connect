import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@16.2.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

type SupabaseAdmin = ReturnType<typeof createClient>;

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

async function applySubscriptionState(supabase: SupabaseAdmin, subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const firstItem = subscription.items.data[0];
  const priceId = firstItem?.price?.id ?? null;
  const therapistId = subscription.metadata?.therapist_id ?? null;

  if (!priceId) {
    throw new Error(`Subscription ${subscription.id} has no price id`);
  }

  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("id")
    .or(`stripe_price_id.eq.${priceId},founder_stripe_price_id.eq.${priceId}`)
    .maybeSingle();

  if (planError) throw planError;

  const hasPremiumAccess =
    subscription.status === "active" || subscription.status === "trialing";
  const update = {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    subscription_status: subscription.status,
    plan_id: hasPremiumAccess && plan?.id ? plan.id : null,
    pending_plan_id: hasPremiumAccess ? null : undefined,
    pending_plan_slug: hasPremiumAccess ? null : undefined,
    subscription_activation_error: hasPremiumAccess ? null : undefined,
  };
  const cleanUpdate = Object.fromEntries(
    Object.entries(update).filter(([, value]) => value !== undefined),
  );

  const query = supabase.from("therapists").update(cleanUpdate);
  const { error: therapistError } = therapistId
    ? await query.eq("id", therapistId)
    : await query.eq("stripe_customer_id", customerId);

  if (therapistError) throw therapistError;
}

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  try {
    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    const supabaseUrl = Deno.env.get("SECRET_SUPABASE_URL") || Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey =
      Deno.env.get("SECRET_SUPABASE_SERVICE_ROLE_KEY") ||
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
      "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "setup") {
          await applySetupSessionState(supabase, stripe, session);
        }

        if (session.mode === "subscription" && session.subscription) {
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await applySubscriptionState(supabase, subscription);
        }

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await applySubscriptionState(supabase, subscription);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(error instanceof Error ? error.message : "Webhook error", {
      status: 400,
    });
  }
});
