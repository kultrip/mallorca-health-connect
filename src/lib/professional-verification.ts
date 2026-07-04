import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type NotifyRequestInput = {
  therapistId: string;
  professionalEmail: string;
  origin: string;
};

type ReviewInput = {
  therapistId: string;
  professionalEmail: string;
  origin: string;
  reviewNote?: string;
};

function dashboardUrl(origin: string) {
  return `${origin}/dashboard`;
}

function adminUrl(origin: string) {
  return `${origin}/dashboard/admin`;
}

function getStripeSecretKey() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Response("Missing STRIPE_SECRET_KEY", { status: 500 });
  return key;
}

export const notifyAdminOfProfessionalRequest = createServerFn({ method: "POST" })
  .inputValidator((data: NotifyRequestInput) => data)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendAdminVerificationRequestEmail } = await import("@/lib/verification-emails");

    const { data: therapist, error } = await supabaseAdmin
      .from("therapists")
      .select("id, full_name, user_id")
      .eq("id", data.therapistId)
      .single();

    if (error) throw error;
    if (therapist.user_id !== context.userId) {
      throw new Response("Forbidden", { status: 403 });
    }

    await sendAdminVerificationRequestEmail({
      professionalName: therapist.full_name,
      professionalEmail: data.professionalEmail,
      adminUrl: adminUrl(data.origin),
      dashboardUrl: dashboardUrl(data.origin),
    });
  });

export const approveProfessionalRequest = createServerFn({ method: "POST" })
  .inputValidator((data: ReviewInput) => data)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendProfessionalApprovedEmail } = await import("@/lib/verification-emails");

    await requireAdmin(context.userId);

    const { data: therapist, error } = await supabaseAdmin
      .from("therapists")
      .update({
        status: "published",
        verified: true,
        verification_reviewed_at: new Date().toISOString(),
        verification_review_note: data.reviewNote?.trim() || null,
        verification_reviewed_by: context.userId,
      })
      .eq("id", data.therapistId)
      .select("id, full_name")
      .single();

    if (error) throw error;

    await activatePendingSubscription(therapist.id);

    await sendProfessionalApprovedEmail({
      professionalName: therapist.full_name,
      professionalEmail: data.professionalEmail,
      adminUrl: adminUrl(data.origin),
      dashboardUrl: dashboardUrl(data.origin),
      reviewNote: data.reviewNote,
    });

    return therapist;
  });

export const rejectProfessionalRequest = createServerFn({ method: "POST" })
  .inputValidator((data: ReviewInput) => data)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendProfessionalRejectedEmail } = await import("@/lib/verification-emails");

    await requireAdmin(context.userId);

    const { data: therapist, error } = await supabaseAdmin
      .from("therapists")
      .update({
        status: "draft",
        verified: false,
        verification_reviewed_at: new Date().toISOString(),
        verification_review_note: data.reviewNote?.trim() || null,
        verification_reviewed_by: context.userId,
      })
      .eq("id", data.therapistId)
      .select("id, full_name, stripe_customer_id, stripe_subscription_id")
      .single();

    if (error) throw error;

    if (therapist.stripe_subscription_id) {
      try {
        const { default: Stripe } = await import("stripe");
        const stripe = new Stripe(getStripeSecretKey(), { apiVersion: "2026-04-22.dahlia" });

        // Cancel the Stripe subscription immediately
        await stripe.subscriptions.cancel(therapist.stripe_subscription_id);

        // Refund any successful payments for this customer
        if (therapist.stripe_customer_id) {
          const charges = await stripe.charges.list({
            customer: therapist.stripe_customer_id,
            limit: 20,
          });

          for (const charge of charges.data) {
            if (charge.status === "succeeded" && !charge.refunded) {
              await stripe.refunds.create({
                charge: charge.id,
              });
            }
          }
        }
      } catch (stripeError) {
        console.error("Stripe cancellation/refund error during rejection:", stripeError);
        throw new Error(
          `Perfil rechazado, pero falló la cancelación/devolución en Stripe: ${
            stripeError instanceof Error ? stripeError.message : "Error desconocido"
          }`
        );
      }
    }

    await sendProfessionalRejectedEmail({
      professionalName: therapist.full_name,
      professionalEmail: data.professionalEmail,
      adminUrl: adminUrl(data.origin),
      dashboardUrl: dashboardUrl(data.origin),
      reviewNote: data.reviewNote,
    });

    return therapist;
  });

async function activatePendingSubscription(therapistId: string) {
  const { default: Stripe } = await import("stripe");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const stripe = new Stripe(getStripeSecretKey(), { apiVersion: "2026-04-22.dahlia" });

  const { data: therapist, error } = await supabaseAdmin
    .from("therapists")
    .select(
      "id, user_id, stripe_customer_id, stripe_payment_method_id, pending_plan_id, pending_plan_slug, is_founder",
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
    .select("id, slug, stripe_price_id, founder_stripe_price_id, billing_enabled")
    .eq("id", therapist.pending_plan_id)
    .single();

  if (planError) throw planError;

  const useFounderPrice = therapist.is_founder === true && !!plan.founder_stripe_price_id;
  const priceId = useFounderPrice ? plan.founder_stripe_price_id : plan.stripe_price_id;

  if (!plan.billing_enabled || !priceId) {
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
      items: [{ price: priceId }],
      default_payment_method: therapist.stripe_payment_method_id,
      collection_method: "charge_automatically",
      payment_behavior: "error_if_incomplete",
      trial_period_days: useFounderPrice ? 180 : undefined,
      metadata: {
        user_id: therapist.user_id ?? "",
        therapist_id: therapist.id,
        plan_id: plan.id,
        plan_slug: plan.slug,
        is_founder: useFounderPrice ? "true" : "false",
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

async function requireAdmin(userId: string) {
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
