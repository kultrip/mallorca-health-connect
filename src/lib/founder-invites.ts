import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { normalizeFounderWhatsApp } from "@/lib/phone-normalization";

const founderInviteLookupSchema = z.object({
  whatsapp: z.string().trim().min(5).max(40),
});

export type FounderInviteLookupResult =
  | {
      matched: true;
      inviteToken: string;
      invitedName: string | null;
    }
  | {
      matched: false;
    };

export const checkFounderInviteByWhatsApp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => founderInviteLookupSchema.parse(input))
  .handler(async ({ data }): Promise<FounderInviteLookupResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const normalizedWhatsApp = normalizeFounderWhatsApp(data.whatsapp);

    if (!normalizedWhatsApp) return { matched: false };

    const { data: invite, error } = await supabaseAdmin
      .from("founder_invites")
      .select("invite_token, invited_name")
      .eq("normalized_whatsapp", normalizedWhatsApp)
      .is("used_at", null)
      .maybeSingle();

    if (error) throw error;
    if (!invite?.invite_token) return { matched: false };

    return {
      matched: true,
      inviteToken: invite.invite_token,
      invitedName: invite.invited_name ?? null,
    };
  });

export async function consumeFounderInvite(input: {
  inviteToken: string | null | undefined;
  whatsapp: string | null | undefined;
  userId: string;
  email: string;
}) {
  const token = input.inviteToken?.trim();
  const normalizedWhatsApp = normalizeFounderWhatsApp(input.whatsapp ?? "");

  if (!token || !normalizedWhatsApp) {
    return { consumed: false, inviteId: null as string | null };
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("founder_invites")
    .update({
      used_at: new Date().toISOString(),
      used_by_user_id: input.userId,
      used_by_email: input.email,
    })
    .eq("invite_token", token)
    .eq("normalized_whatsapp", normalizedWhatsApp)
    .is("used_at", null)
    .select("id")
    .maybeSingle();

  if (error) throw error;

  return {
    consumed: Boolean(data?.id),
    inviteId: data?.id ?? null,
  };
}
