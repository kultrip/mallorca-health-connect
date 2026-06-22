import { sendEmail } from "@/lib/email/resend";

type ProfessionalEmailPayload = {
  professionalName: string;
  professionalEmail: string;
  adminUrl: string;
  dashboardUrl: string;
  reviewNote?: string | null;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getAdminEmail() {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) throw new Error("Missing ADMIN_EMAIL");
  return adminEmail;
}

export async function sendAdminVerificationRequestEmail(payload: ProfessionalEmailPayload) {
  const to = getAdminEmail();
  const subject = `Nueva solicitud profesional: ${payload.professionalName}`;
  const text = [
    "Nueva solicitud profesional en Mallorca Holística.",
    "",
    `Profesional: ${payload.professionalName}`,
    `Email: ${payload.professionalEmail}`,
    "",
    `Revisar solicitud: ${payload.adminUrl}`,
  ].join("\n");

  return sendEmail({
    to,
    subject,
    text,
    html: `
      <h1>Nueva solicitud profesional</h1>
      <p><strong>Profesional:</strong> ${escapeHtml(payload.professionalName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(payload.professionalEmail)}</p>
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
      "",
      "Tu perfil profesional ha sido aprobado y ya formas parte de Mallorca Holística.",
      "Puedes entrar en tu panel para revisar tu perfil y elegir una suscripción si quieres activar beneficios adicionales.",
      "",
      payload.dashboardUrl,
    ].join("\n"),
    html: `
      <h1>Tu perfil ha sido aprobado</h1>
      <p>Hola ${escapeHtml(payload.professionalName)},</p>
      <p>Tu perfil profesional ha sido aprobado y ya formas parte de Mallorca Holística.</p>
      <p>Puedes entrar en tu panel para revisar tu perfil y elegir una suscripción si quieres activar beneficios adicionales.</p>
      <p><a href="${payload.dashboardUrl}">Ir a mi panel</a></p>
    `,
  });
}

export async function sendProfessionalRejectedEmail(payload: ProfessionalEmailPayload) {
  const note = payload.reviewNote?.trim();
  const reason =
    note || "Necesitamos revisar o completar algunos datos antes de aprobar tu perfil.";

  return sendEmail({
    to: payload.professionalEmail,
    subject: "Necesitamos revisar tu solicitud profesional",
    text: [
      `Hola ${payload.professionalName},`,
      "",
      "Hemos revisado tu solicitud profesional en Mallorca Holística.",
      reason,
      "",
      "Puedes entrar en tu panel para actualizar la información.",
      "",
      payload.dashboardUrl,
    ].join("\n"),
    html: `
      <h1>Solicitud pendiente de cambios</h1>
      <p>Hola ${escapeHtml(payload.professionalName)},</p>
      <p>Hemos revisado tu solicitud profesional en Mallorca Holística.</p>
      <p>${escapeHtml(reason)}</p>
      <p><a href="${payload.dashboardUrl}">Ir a mi panel</a></p>
    `,
  });
}
