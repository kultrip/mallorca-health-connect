import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { sendEmail } from "@/lib/email/resend";
import { getAdminEmail } from "./verification-emails";

const registrationConfirmationSchema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().min(1),
  planLabel: z.string().trim().min(1).optional(),
});

const signUpSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().min(8),
  selectedPlan: z.string().trim().min(1),
  isFounder: z.boolean().optional(),
  origin: z.string().trim().min(1),
});

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getPlanLabel(plan: string) {
  if (plan === "profesional") return "Profesional";
  if (plan === "centros-organizadores") return "Centros & Organizadores";
  return "Presencia";
}

export const signUpUser = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => signUpSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const planLabel = getPlanLabel(data.selectedPlan);
    const redirectToUrl = `${data.origin}/onboarding?plan=${encodeURIComponent(data.selectedPlan)}`;

    // Generate the signup link using Supabase Admin Auth
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email: data.email,
      password: data.password,
      options: {
        data: {
          display_name: data.name,
          selected_plan: data.selectedPlan,
          is_founder: data.isFounder ?? false,
        },
        redirectTo: redirectToUrl,
      },
    });

    if (linkError) {
      throw new Error(linkError.message);
    }

    const actionLink = linkData.properties.action_link;

    // Send the custom confirmation email to the user (Sent by Mallorca Holística)
    const userEmailPromise = sendEmail({
      to: data.email,
      subject: "Confirma tu cuenta de Mallorca Holística",
      text: [
        `Hola ${data.name},`,
        "",
        "¡Bienvenido/a a Mallorca Holística!",
        "",
        "Gracias por registrarte en nuestra plataforma de salud y bienestar.",
        `Hemos recibido tu alta para el plan ${planLabel}.`,
        "",
        "Para confirmar tu dirección de correo electrónico y activar tu cuenta, haz clic en el siguiente enlace o cópialo en tu navegador:",
        "",
        actionLink,
        "",
        "Si no te has registrado, puedes ignorar este correo de forma segura.",
        "",
        "Un abrazo,",
        "Mallorca Holística",
      ].join("\n"),
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; border: 1px solid #f1f5f9; border-radius: 24px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);">
          <div style="text-align: center; margin-bottom: 28px;">
            <span style="font-size: 28px; font-weight: 800; letter-spacing: -0.025em; color: #8b5cf6;">Mallorca Holística</span>
          </div>
          <h1 style="color: #0f172a; font-size: 22px; font-weight: bold; margin-bottom: 16px; text-align: center; letter-spacing: -0.025em;">¡Bienvenido/a a nuestra comunidad!</h1>
          <p style="color: #334155; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">Hola <strong>${escapeHtml(data.name)}</strong>,</p>
          <p style="color: #334155; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">Gracias por registrarte en nuestra plataforma de profesionales de la salud y el bienestar en Mallorca. Hemos recibido tu alta para el plan <strong>${escapeHtml(planLabel)}</strong>.</p>
          
          <div style="text-align: center; margin: 36px 0;">
            <a href="${actionLink}" style="background-color: #8b5cf6; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 9999px; font-weight: 600; display: inline-block; font-size: 15px; box-shadow: 0 10px 15px -3px rgba(139, 92, 246, 0.3);">Confirmar correo electrónico</a>
          </div>
          
          <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin-bottom: 8px;">Si el botón no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:</p>
          <p style="color: #8b5cf6; font-size: 13px; line-height: 1.6; word-break: break-all; margin-bottom: 32px;"><a href="${actionLink}" style="color: #8b5cf6; text-decoration: underline;">${actionLink}</a></p>
          
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 32px 0;" />
          <p style="color: #475569; font-size: 14px; text-align: center; margin: 0; line-height: 1.5;">Un abrazo,<br /><strong style="color: #8b5cf6;">Mallorca Holística</strong></p>
        </div>
      `,
    });

    // Send the admin notification email
    const adminEmail = getAdminEmail();
    const adminEmailPromise = sendEmail({
      to: adminEmail,
      subject: `Nuevo registro de usuario: ${data.name}`,
      text: [
        "Se ha registrado un nuevo usuario en Mallorca Holística.",
        "",
        `Nombre o Centro: ${data.name}`,
        `Email: ${data.email}`,
        `Plan seleccionado: ${planLabel}`,
        "",
        "Equipo de Mallorca Holística",
      ].join("\n"),
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
          <h1 style="color: #0f172a; font-size: 20px; font-weight: bold; margin-bottom: 16px;">Nuevo registro de usuario</h1>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">Se ha registrado un nuevo usuario en Mallorca Holística y se le ha enviado su enlace de confirmación personalizado de Mallorca Holística.</p>
          <ul style="color: #334155; font-size: 15px; line-height: 1.6; padding-left: 20px; margin-top: 16px;">
            <li><strong>Nombre o Centro:</strong> ${escapeHtml(data.name)}</li>
            <li><strong>Email:</strong> ${escapeHtml(data.email)}</li>
            <li><strong>Plan seleccionado:</strong> ${escapeHtml(planLabel)}</li>
          </ul>
        </div>
      `,
    }).catch((err) => {
      console.error("Error al enviar email de notificación de registro al admin:", err);
    });

    let emailSent = false;
    let emailError: string | undefined = undefined;

    try {
      await userEmailPromise;
      emailSent = true;
    } catch (err) {
      console.error("Error al enviar email de confirmación al usuario:", err);
      emailError = err instanceof Error ? err.message : String(err);
      
      // Log the activation link to the console for easy local development
      console.log("\n===========================================================");
      console.log("⚠️ ERROR AL ENVIAR EMAIL DE CONFIRMACIÓN DE REGISTRO:");
      console.log(`Usuario: ${data.name} (${data.email})`);
      console.log(`Enlace de activación: ${actionLink}`);
      console.log("===========================================================\n");
    }

    try {
      if (adminEmailPromise) {
        await adminEmailPromise;
      }
    } catch (err) {
      // already logged in the catch block inside the promise, but just in case
    }

    const isDev = process.env.NODE_ENV === "development" || !process.env.RESEND_API_KEY;

    return {
      success: true,
      userId: linkData.user.id,
      emailSent,
      emailError,
      actionLink: (isDev || !emailSent) ? actionLink : undefined,
    };
  });

export const testResendConfig = createServerFn({ method: "POST" })
  .inputValidator((email: unknown) => z.string().email().parse(email))
  .handler(async ({ data: email }) => {
    try {
      const res = await sendEmail({
        to: email,
        subject: "Prueba de configuración de Resend - Mallorca Holística",
        text: "Si recibes este correo, la configuración de Resend en el servidor funciona correctamente.",
        html: "<p>Si recibes este correo, la configuración de Resend en el servidor funciona correctamente.</p>",
      });
      return { success: true, payload: res };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  });

// Keep existing sendRegistrationConfirmationEmail function just in case other modules import it
export const sendRegistrationConfirmationEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => registrationConfirmationSchema.parse(data))
  .handler(async ({ data }) => {
    const planLabel = data.planLabel?.trim() || "Presencia";
    const adminEmail = getAdminEmail();

    const userEmailPromise = sendEmail({
      to: data.email,
      subject: "Tu perfil de Mallorca Holística está en marcha",
      text: [
        `Hola ${data.name},`,
        "",
        "Gracias por crear tu cuenta en Mallorca Holística.",
        `Hemos recibido tu alta para el plan ${planLabel}.`,
        "Puedes continuar con tu ficha profesional cuando lo necesites.",
        "",
        "Un abrazo,",
        "Mallorca Holística",
      ].join("\n"),
      html: `
        <h1>Tu cuenta está en marcha</h1>
        <p>Hola ${escapeHtml(data.name)},</p>
        <p>Gracias por crear tu cuenta en Mallorca Holística.</p>
        <p>Hemos recibido tu alta para el plan <strong>${escapeHtml(planLabel)}</strong>.</p>
        <p>Puedes continuar con tu ficha profesional cuando lo necesites.</p>
      `,
    });

    const adminEmailPromise = sendEmail({
      to: adminEmail,
      subject: `Nuevo registro de usuario: ${data.name}`,
      text: [
        "Se ha registrado un nuevo usuario en Mallorca Holística.",
        "",
        `Nombre o Centro: ${data.name}`,
        `Email: ${data.email}`,
        `Plan seleccionado: ${planLabel}`,
        "",
        "Equipo de Mallorca Holística",
      ].join("\n"),
      html: `
        <h1>Nuevo registro de usuario</h1>
        <p>Se ha registrado un nuevo usuario en Mallorca Holística.</p>
        <ul>
          <li><strong>Nombre o Centro:</strong> ${escapeHtml(data.name)}</li>
          <li><strong>Email:</strong> ${escapeHtml(data.email)}</li>
          <li><strong>Plan seleccionado:</strong> ${escapeHtml(planLabel)}</li>
        </ul>
      `,
    }).catch((err) => {
      console.error("Error al enviar email de notificación de registro al admin:", err);
    });

    const [userResponse] = await Promise.all([userEmailPromise, adminEmailPromise]);
    return userResponse;
  });
