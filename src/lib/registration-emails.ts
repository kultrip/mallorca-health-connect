import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { sendEmail } from "@/lib/email/resend";

const registrationConfirmationSchema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().min(1),
  planLabel: z.string().trim().min(1).optional(),
});

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export const sendRegistrationConfirmationEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => registrationConfirmationSchema.parse(data))
  .handler(async ({ data }) => {
    const planLabel = data.planLabel?.trim() || "Presencia";

    return sendEmail({
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
  });
