import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const organisationSubmissionSchema = z.object({
  therapistId: z.string().trim().min(1),
});

export const stampOrganisationSubmission = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    return organisationSubmissionSchema.parse(input);
  })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const ipAddress =
      extractClientIp(request?.headers?.get("x-forwarded-for")) ??
      extractClientIp(request?.headers?.get("cf-connecting-ip"));

    const { data: therapist, error } = await supabaseAdmin
      .from("therapists")
      .update({
        organization_signed_at: new Date().toISOString(),
        organization_signed_ip: ipAddress,
      })
      .eq("id", data.therapistId)
      .eq("user_id", context.userId)
      .select("id")
      .single();

    if (error) throw error;

    return therapist;
  });

function extractClientIp(value: string | null) {
  if (!value) return null;
  const first = value.split(",")[0]?.trim();
  return first || null;
}
