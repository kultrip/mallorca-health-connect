import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { sendEmail } from "@/lib/email/resend";

const slugSchema = z
  .string()
  .trim()
  .min(1, "El slug es obligatorio.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usa un slug en minusculas, sin espacios.");

const optionalUrlSchema = z
  .string()
  .trim()
  .url("Usa una URL valida.")
  .optional()
  .nullable()
  .or(z.literal(""));

const therapistInputSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().trim().min(1),
  headline: z.string().trim().optional().nullable(),
  frase_clave: z.string().trim().optional().nullable(),
  especialidad: z.string().trim().optional().nullable(),
  subespecialidades: z.array(z.string().trim()).default([]),
  sobre_mi: z.string().trim().optional().nullable(),
  experiencia: z.string().trim().optional().nullable(),
  formacion: z.string().trim().optional().nullable(),
  languages: z.array(z.string().trim()).default([]),
  modalities: z.array(z.enum(["presencial", "online", "domicilio"])).default([]),
  email: z.string().trim().email().optional().nullable().or(z.literal("")),
  phone: z.string().trim().optional().nullable(),
  whatsapp: z.string().trim().optional().nullable(),
  website: optionalUrlSchema,
  link_reserva: optionalUrlSchema,
  city: z.string().trim().optional().nullable(),
  address: z.string().trim().optional().nullable(),
  municipality_id: z.string().uuid().optional().nullable(),
  lat: z.number().min(-90).max(90).optional().nullable(),
  lng: z.number().min(-180).max(180).optional().nullable(),
  status: z.enum(["draft", "pending", "published", "suspended"]),
  verified: z.boolean(),
  therapyIds: z.array(z.string().uuid()).default([]),
  helpAreaIds: z.array(z.string().uuid()).default([]),
});

const therapyInputSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  name: z.string().trim().min(1),
  slug: slugSchema,
  category: z.string().trim().optional().nullable(),
  short_description: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  benefits: z.array(z.string().trim()).default([]),
  session_description: z.string().trim().optional().nullable(),
  medical_disclaimer: z.string().trim().optional().nullable(),
  empty_professionals_message: z.string().trim().optional().nullable(),
  detail_sections: z
    .array(z.object({ title: z.string().trim().min(1), body: z.string().trim().min(1) }))
    .default([]),
});

const helpAreaInputSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  name: z.string().trim().min(1),
  slug: slugSchema,
  description: z.string().trim().optional().nullable(),
  keywords: z.array(z.string().trim()).default([]),
});

const activityInputSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  title: z.string().trim().min(1),
  slug: slugSchema,
  category: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  facilitator_name: z.string().trim().optional().nullable(),
  starts_at: z.string().trim().optional().nullable(),
  ends_at: z.string().trim().optional().nullable(),
  location: z.string().trim().optional().nullable(),
  municipality_id: z.string().uuid().optional().nullable(),
  price_cents: z.number().int().min(0).optional().nullable(),
  link_reserva: optionalUrlSchema,
  image_url: optionalUrlSchema,
  whatsapp: z.string().trim().optional().nullable(),
  instagram: z.string().trim().optional().nullable(),
  email: z.string().trim().email().optional().nullable().or(z.literal("")),
  website: optionalUrlSchema,
  status: z.enum(["draft", "pending", "published", "suspended"]),
  therapist_id: z.string().uuid().optional().nullable(),
  center_id: z.string().uuid().optional().nullable(),
});

const emailInputSchema = z.object({
  therapistIds: z.array(z.string().uuid()).min(1).max(100),
  subject: z.string().trim().min(1).max(180),
  message: z.string().trim().min(1).max(8000),
});

export const saveAdminTherapist = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => therapistInputSchema.parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin
      .from("therapists")
      .update({
        full_name: data.full_name,
        headline: nullable(data.headline),
        frase_clave: nullable(data.frase_clave),
        especialidad: nullable(data.especialidad),
        subespecialidades: cleanList(data.subespecialidades),
        sobre_mi: nullable(data.sobre_mi),
        experiencia: nullable(data.experiencia),
        formacion: nullable(data.formacion),
        languages: cleanList(data.languages),
        modalities: data.modalities,
        email: nullable(data.email),
        phone: nullable(data.phone),
        whatsapp: nullable(data.whatsapp),
        website: nullable(data.website),
        link_reserva: nullable(data.link_reserva),
        city: nullable(data.city),
        address: nullable(data.address),
        municipality_id: data.municipality_id ?? null,
        lat: data.lat ?? null,
        lng: data.lng ?? null,
        status: data.status,
        verified: data.verified,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);

    if (error) throw error;

    await replaceTherapyLinks(data.id, data.therapyIds);
    await replaceHelpAreaLinks(data.id, data.helpAreaIds);

    return { therapistId: data.id };
  });

export const saveAdminTherapy = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => therapyInputSchema.parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const payload = {
      ...(data.id ? { id: data.id } : {}),
      name: data.name,
      slug: data.slug,
      category: nullable(data.category),
      short_description: nullable(data.short_description),
      description: nullable(data.description),
      benefits: cleanList(data.benefits),
      session_description: nullable(data.session_description),
      medical_disclaimer: nullable(data.medical_disclaimer),
      empty_professionals_message: nullable(data.empty_professionals_message),
      detail_sections: data.detail_sections,
    };

    const { data: saved, error } = await supabaseAdmin
      .from("therapies")
      .upsert(payload, { onConflict: "id" })
      .select("id")
      .single();

    if (error) throw error;
    return { therapyId: saved.id };
  });

export const saveAdminHelpArea = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => helpAreaInputSchema.parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const payload = {
      ...(data.id ? { id: data.id } : {}),
      name: data.name,
      slug: data.slug,
      description: nullable(data.description),
      keywords: cleanList(data.keywords),
    };

    const { data: saved, error } = await supabaseAdmin
      .from("help_areas")
      .upsert(payload, { onConflict: "id" })
      .select("id")
      .single();

    if (error) throw error;
    return { helpAreaId: saved.id };
  });

export const saveAdminActivity = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => activityInputSchema.parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const payload = {
      ...(data.id ? { id: data.id } : {}),
      title: data.title,
      slug: data.slug,
      category: nullable(data.category),
      description: nullable(data.description),
      facilitator_name: nullable(data.facilitator_name),
      starts_at: nullable(data.starts_at),
      ends_at: nullable(data.ends_at),
      location: nullable(data.location),
      municipality_id: data.municipality_id ?? null,
      price_cents: data.price_cents ?? null,
      link_reserva: nullable(data.link_reserva),
      image_url: nullable(data.image_url),
      whatsapp: nullable(data.whatsapp),
      instagram: nullable(data.instagram),
      email: nullable(data.email),
      website: nullable(data.website),
      status: data.status,
      therapist_id: data.therapist_id ?? null,
      center_id: data.center_id ?? null,
    };

    const { data: saved, error } = await supabaseAdmin
      .from("activities")
      .upsert(payload, { onConflict: "id" })
      .select("id")
      .single();

    if (error) throw error;
    return { activityId: saved.id };
  });

export const sendAdminProfessionalEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => emailInputSchema.parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: therapists, error } = await supabaseAdmin
      .from("therapists")
      .select("id, full_name, email")
      .in("id", data.therapistIds);

    if (error) throw error;

    const recipients = (therapists ?? []).filter((therapist) => Boolean(therapist.email));
    if (recipients.length === 0) {
      throw new Error("No hay destinatarios con email.");
    }

    const results: Array<{
      therapistId: string;
      email: string | null;
      status: "sent" | "failed";
      error?: string;
    }> = [];

    for (const therapist of recipients) {
      try {
        const sent = await sendEmail({
          to: therapist.email!,
          subject: data.subject,
          text: data.message,
          html: paragraphsToHtml(data.message),
        });

        await supabaseAdmin.from("admin_email_logs").insert({
          sent_by_user_id: context.userId,
          therapist_id: therapist.id,
          recipient_email: therapist.email!,
          recipient_name: therapist.full_name,
          subject: data.subject,
          message: data.message,
          resend_email_id: sent.id ?? null,
          status: "sent",
        });

        results.push({ therapistId: therapist.id, email: therapist.email, status: "sent" });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error desconocido";
        await supabaseAdmin.from("admin_email_logs").insert({
          sent_by_user_id: context.userId,
          therapist_id: therapist.id,
          recipient_email: therapist.email!,
          recipient_name: therapist.full_name,
          subject: data.subject,
          message: data.message,
          status: "failed",
          error_message: message,
        });
        results.push({
          therapistId: therapist.id,
          email: therapist.email,
          status: "failed",
          error: message,
        });
      }
    }

    return {
      sent: results.filter((result) => result.status === "sent").length,
      failed: results.filter((result) => result.status === "failed").length,
      results,
    };
  });

async function assertAdmin(userId: string) {
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

async function replaceTherapyLinks(therapistId: string, therapyIds: string[]) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error: deleteError } = await supabaseAdmin
    .from("therapist_therapies")
    .delete()
    .eq("therapist_id", therapistId);

  if (deleteError) throw deleteError;
  if (therapyIds.length === 0) return;

  const { error: insertError } = await supabaseAdmin.from("therapist_therapies").insert(
    therapyIds.map((therapyId) => ({
      therapist_id: therapistId,
      therapy_id: therapyId,
    })),
  );

  if (insertError) throw insertError;
}

async function replaceHelpAreaLinks(therapistId: string, helpAreaIds: string[]) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error: deleteError } = await supabaseAdmin
    .from("therapist_help_areas")
    .delete()
    .eq("therapist_id", therapistId);

  if (deleteError) throw deleteError;
  if (helpAreaIds.length === 0) return;

  const { error: insertError } = await supabaseAdmin.from("therapist_help_areas").insert(
    helpAreaIds.map((helpAreaId) => ({
      therapist_id: therapistId,
      help_area_id: helpAreaId,
    })),
  );

  if (insertError) throw insertError;
}

function nullable(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function cleanList(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean);
}

function paragraphsToHtml(message: string) {
  return message
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
