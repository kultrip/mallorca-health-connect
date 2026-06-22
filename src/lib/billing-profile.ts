import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const taxIdTypeSchema = z.enum(["nif", "nie", "cif", "other"]);

const billingProfileSchema = z.object({
  therapistId: z.string().uuid().optional().nullable(),
  legal_name: z.string().trim().max(180).optional().nullable(),
  tax_id_type: taxIdTypeSchema.optional().nullable(),
  tax_id_value: z.string().trim().max(80).optional().nullable(),
  address_line1: z.string().trim().max(220).optional().nullable(),
  address_line2: z.string().trim().max(220).optional().nullable(),
  city: z.string().trim().max(120).optional().nullable(),
  postal_code: z.string().trim().max(40).optional().nullable(),
  country: z.string().trim().length(2).default("ES"),
});

export type BillingProfileInput = z.infer<typeof billingProfileSchema>;

export const saveBillingProfile = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => billingProfileSchema.parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const normalized = normalizeBillingProfile(data);
    const therapistId = await resolveOwnedTherapistId(context.userId, normalized.therapistId);

    validateOptionalInvoiceProfile(normalized);

    const { data: saved, error } = await supabaseAdmin
      .from("billing_profiles")
      .upsert(
        {
          user_id: context.userId,
          therapist_id: therapistId,
          legal_name: nullable(normalized.legal_name),
          tax_id_type: normalized.tax_id_type ?? null,
          tax_id_value: nullable(normalized.tax_id_value),
          address_line1: nullable(normalized.address_line1),
          address_line2: nullable(normalized.address_line2),
          city: nullable(normalized.city),
          postal_code: nullable(normalized.postal_code),
          country: normalized.country || "ES",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )
      .select("*")
      .single();

    if (error) {
      throw new Error(`No se pudieron guardar los datos fiscales: ${error.message}`);
    }

    return saved;
  });

export async function syncBillingProfileToStripeCustomer({
  userId,
  therapistId,
  customerId,
}: {
  userId: string;
  therapistId: string;
  customerId: string;
}) {
  const { default: Stripe } = await import("stripe");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const stripe = new Stripe(getStripeSecretKey(), { apiVersion: "2026-04-22.dahlia" });

  const { data: billingProfile, error } = await supabaseAdmin
    .from("billing_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!billingProfile || !hasStripeSyncableBillingDetails(billingProfile)) return;

  await stripe.customers.update(customerId, {
    name: billingProfile.legal_name ?? undefined,
    address: hasCompleteInvoiceAddress(billingProfile)
      ? {
          line1: billingProfile.address_line1 ?? undefined,
          line2: billingProfile.address_line2 ?? undefined,
          city: billingProfile.city ?? undefined,
          postal_code: billingProfile.postal_code ?? undefined,
          country: billingProfile.country || "ES",
        }
      : undefined,
    metadata: {
      user_id: userId,
      therapist_id: therapistId,
      tax_id_type: billingProfile.tax_id_type ?? "",
      tax_id_value: billingProfile.tax_id_value ?? "",
    },
  });

  await syncStripeTaxId({
    stripe,
    customerId,
    taxIdType: billingProfile.tax_id_type,
    taxIdValue: billingProfile.tax_id_value,
  });

  await supabaseAdmin
    .from("billing_profiles")
    .update({ stripe_customer_id: customerId })
    .eq("user_id", userId);
}

async function resolveOwnedTherapistId(userId: string, therapistId?: string | null) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const query = supabaseAdmin.from("therapists").select("id,user_id").eq("user_id", userId);
  const { data, error } = therapistId
    ? await query.eq("id", therapistId).maybeSingle()
    : await query.maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}

function normalizeBillingProfile(data: BillingProfileInput) {
  return {
    ...data,
    country: (data.country || "ES").trim().toUpperCase(),
  };
}

function validateOptionalInvoiceProfile(data: BillingProfileInput) {
  const hasAnyValue = [
    data.legal_name,
    data.tax_id_type,
    data.tax_id_value,
    data.address_line1,
    data.address_line2,
    data.city,
    data.postal_code,
  ].some((value) => Boolean(String(value ?? "").trim()));

  if (!hasAnyValue) return;

  if (!data.legal_name?.trim()) {
    throw new Error("El nombre fiscal es necesario si guardas datos de factura.");
  }

  if (Boolean(data.tax_id_type) !== Boolean(data.tax_id_value?.trim())) {
    throw new Error("El tipo y el numero fiscal deben guardarse juntos.");
  }

  const hasAnyAddress = [data.address_line1, data.address_line2, data.city, data.postal_code].some(
    (value) => Boolean(String(value ?? "").trim()),
  );

  if (
    hasAnyAddress &&
    (!data.address_line1?.trim() ||
      !data.city?.trim() ||
      !data.postal_code?.trim() ||
      !data.country?.trim())
  ) {
    throw new Error("La direccion, ciudad y codigo postal son necesarios para datos de factura.");
  }
}

async function syncStripeTaxId({
  stripe,
  customerId,
  taxIdType,
  taxIdValue,
}: {
  stripe: import("stripe").default;
  customerId: string;
  taxIdType: string | null;
  taxIdValue: string | null;
}) {
  const stripeType = stripeTaxIdTypeFor(taxIdType);
  const normalizedValue = taxIdValue?.trim();

  if (!stripeType || !normalizedValue) return;

  try {
    const existing = await stripe.customers.listTaxIds(customerId, { limit: 100 });
    const alreadyExists = existing.data.some(
      (taxId) => taxId.type === stripeType && taxId.value === normalizedValue,
    );

    if (!alreadyExists) {
      await stripe.customers.createTaxId(customerId, {
        type: stripeType,
        value: normalizedValue,
      });
    }
  } catch (error) {
    console.warn("Stripe rejected billing tax ID sync; keeping local metadata only.", error);
  }
}

function stripeTaxIdTypeFor(taxIdType: string | null) {
  if (taxIdType === "nif" || taxIdType === "nie" || taxIdType === "cif") return "es_cif";
  return null;
}

function hasCompleteInvoiceAddress(profile: {
  legal_name: string | null;
  address_line1: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
}) {
  const hasAddress =
    profile.legal_name?.trim() &&
    profile.address_line1?.trim() &&
    profile.city?.trim() &&
    profile.postal_code?.trim() &&
    profile.country?.trim();

  return Boolean(hasAddress);
}

function hasStripeSyncableBillingDetails(profile: {
  legal_name: string | null;
  tax_id_type: string | null;
  tax_id_value: string | null;
  address_line1: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
}) {
  const hasTaxId = profile.tax_id_type && profile.tax_id_value?.trim();

  return Boolean(profile.legal_name?.trim() || hasCompleteInvoiceAddress(profile) || hasTaxId);
}

function nullable(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function getStripeSecretKey() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Response("Missing STRIPE_SECRET_KEY", { status: 500 });
  return key;
}
