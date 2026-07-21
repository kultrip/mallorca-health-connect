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
          }`,
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

type NotifyActivityInput = {
  activityId: string;
  activityTitle: string;
  category: string;
  startsAt: string | null;
  location: string | null;
  facilitatorName: string | null;
  price: string;
  therapistId: string;
  origin: string;
};

export const notifyAdminOfNewActivity = createServerFn({ method: "POST" })
  .inputValidator((data: NotifyActivityInput) => data)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendEmail } = await import("@/lib/email/resend");
    const { getAdminEmail } = await import("@/lib/verification-emails");

    // Fetch therapist info
    const { data: therapist, error } = await supabaseAdmin
      .from("therapists")
      .select("full_name, user_id")
      .eq("id", data.therapistId)
      .single();

    if (error) throw error;
    if (therapist.user_id !== context.userId) {
      throw new Response("Forbidden", { status: 403 });
    }

    // Get therapist email from Auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
      therapist.user_id,
    );
    const therapistEmail = userData?.user?.email || "No especificado";

    const to = getAdminEmail();
    const subject = `Nueva actividad creada: ${data.activityTitle}`;

    const escapeHtml = (val: string) => {
      return val
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    };

    const adminPanelUrl = `${data.origin}/dashboard/admin`;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eadfce; border-radius: 12px; background-color: #fffaf3;">
        <h1 style="color: #1f3326; font-family: serif;">Nueva actividad pendiente de revisión</h1>
        <p style="color: #5d5144; line-height: 1.6;">Se ha creado una nueva actividad en Mallorca Holística que requiere revisión:</p>
        <ul style="color: #342b22; line-height: 1.8; list-style-type: none; padding-left: 0;">
          <li><strong>Título:</strong> ${escapeHtml(data.activityTitle)}</li>
          <li><strong>Categoría:</strong> ${escapeHtml(data.category)}</li>
          <li><strong>Fecha:</strong> ${escapeHtml(data.startsAt || "No especificada")}</li>
          <li><strong>Lugar:</strong> ${escapeHtml(data.location || "No especificado")}</li>
          <li><strong>Facilitador:</strong> ${escapeHtml(data.facilitatorName || "No especificado")}</li>
          <li><strong>Precio:</strong> ${escapeHtml(data.price)}</li>
          <li><strong>Creado por:</strong> ${escapeHtml(therapist.full_name || "Terapeuta")} (${escapeHtml(therapistEmail)})</li>
        </ul>
        <div style="margin-top: 30px; text-align: center;">
          <a href="${adminPanelUrl}" style="background-color: #526046; color: white; padding: 12px 24px; border-radius: 30px; text-decoration: none; font-weight: bold; display: inline-block;">Revisar en el panel de administración</a>
        </div>
      </div>
    `;

    const text = `
Se ha creado una nueva actividad en Mallorca Holística que requiere revisión:

Título: ${data.activityTitle}
Categoría: ${data.category}
Fecha: ${data.startsAt || "No especificada"}
Lugar: ${data.location || "No especificado"}
Facilitador: ${data.facilitatorName || "No especificado"}
Precio: ${data.price}
Creado por: ${therapist.full_name || "Terapeuta"} (${therapistEmail})

Accede al panel de administración para revisarla y publicarla: ${adminPanelUrl}
    `.trim();

    await sendEmail({
      to,
      subject,
      text,
      html,
    });

    return { success: true };
  });
