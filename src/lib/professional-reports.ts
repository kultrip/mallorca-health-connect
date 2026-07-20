import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const reportInputSchema = z.object({
  therapistId: z.string().uuid(),
  professionalName: z.string().trim().min(1),
  professionalSlug: z.string().trim().min(1),
  reason: z.string().trim().min(1).max(240),
  details: z.string().trim().max(3000).optional().nullable(),
  reporterEmail: z.string().trim().email().optional().nullable().or(z.literal("")),
  origin: z.string().url(),
});

export const submitProfessionalReport = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => reportInputSchema.parse(input))
  .handler(async ({ data }) => {
    const { sendEmail } = await import("@/lib/email/resend");
    const { getAdminEmail } = await import("@/lib/verification-emails");

    const profileUrl = `${new URL(data.origin).origin}/professionals/${data.professionalSlug}`;
    const reporterEmail = data.reporterEmail?.trim() || "No indicado";
    const details = data.details?.trim() || "Sin detalles adicionales.";

    await sendEmail({
      to: getAdminEmail(),
      subject: `Reporte de perfil: ${data.professionalName}`,
      text: [
        "Nuevo reporte de perfil en Mallorca Holística.",
        "",
        `Profesional: ${data.professionalName}`,
        `ID: ${data.therapistId}`,
        `Perfil: ${profileUrl}`,
        "",
        `Motivo: ${data.reason}`,
        `Email de contacto: ${reporterEmail}`,
        "",
        "Detalles:",
        details,
      ].join("\n"),
      html: `
        <h1>Nuevo reporte de perfil</h1>
        <p><strong>Profesional:</strong> ${escapeHtml(data.professionalName)}</p>
        <p><strong>ID:</strong> ${escapeHtml(data.therapistId)}</p>
        <p><strong>Perfil:</strong> <a href="${profileUrl}">${profileUrl}</a></p>
        <p><strong>Motivo:</strong> ${escapeHtml(data.reason)}</p>
        <p><strong>Email de contacto:</strong> ${escapeHtml(reporterEmail)}</p>
        <h2>Detalles</h2>
        <p>${escapeHtml(details).replace(/\n/g, "<br />")}</p>
      `,
    });

    return { success: true };
  });

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
