import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { sendEmail } from "@/lib/email/resend";

type SupabaseAdminClient =
  (typeof import("@/integrations/supabase/client.server"))["supabaseAdmin"];

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
  slug: slugSchema,
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
  photo_url: optionalUrlSchema,
  logo_url: optionalUrlSchema,
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
        slug: data.slug,
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
        photo_url: nullable(data.photo_url),
        logo_url: nullable(data.logo_url),
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

function throwIfSupabaseError(error: { message: string } | null | undefined) {
  if (error) throw error;
}

async function authUserEmailExists(supabaseAdmin: SupabaseAdminClient, email: string) {
  const target = email.trim().toLowerCase();
  const perPage = 1000;
  let page = 1;

  while (true) {
    const {
      data: { users },
      error,
    } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });

    if (error) throw error;
    if (users.some((user) => user.email?.toLowerCase() === target)) return true;
    if (users.length < perPage) return false;
    page += 1;
  }
}

const deleteAdminActivitySchema = z.object({
  id: z.string().uuid(),
});

const deleteAdminTherapistSchema = z.object({
  id: z.string().uuid(),
});

const createAdminTherapistSchema = z.object({
  email: z.string().trim().email("Usa un correo valido."),
  full_name: z.string().trim().min(1, "El nombre es obligatorio."),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres."),
  photo_url: optionalUrlSchema,
});

export const deleteAdminActivity = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => deleteAdminActivitySchema.parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Delete analytics events associated with this activity
    const { error: analyticsError } = await supabaseAdmin
      .from("analytics_events")
      .delete()
      .eq("activity_id", data.id);

    if (analyticsError) throw analyticsError;

    // 2. Delete the activity itself
    const { error: deleteError } = await supabaseAdmin
      .from("activities")
      .delete()
      .eq("id", data.id);

    if (deleteError) throw deleteError;

    return { success: true };
  });

export const deleteAdminTherapist = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => deleteAdminTherapistSchema.parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Fetch the therapist to find their user_id
    const { data: therapist, error: fetchError } = await supabaseAdmin
      .from("therapists")
      .select("id, user_id")
      .eq("id", data.id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!therapist) throw new Error("Profesional no encontrado.");

    // 2. Delete therapist's activities' analytics events, then activities
    const { data: activities, error: fetchActivitiesError } = await supabaseAdmin
      .from("activities")
      .select("id")
      .eq("therapist_id", data.id);

    if (fetchActivitiesError) throw fetchActivitiesError;

    const activityIds = (activities ?? []).map((a) => a.id);
    if (activityIds.length > 0) {
      const { error: activityAnalyticsError } = await supabaseAdmin
        .from("analytics_events")
        .delete()
        .in("activity_id", activityIds);
      throwIfSupabaseError(activityAnalyticsError);

      const { error: activitiesDeleteError } = await supabaseAdmin
        .from("activities")
        .delete()
        .in("id", activityIds);
      throwIfSupabaseError(activitiesDeleteError);
    }

    // 3. Delete any analytics events directly referencing therapist_id
    const { error: therapistAnalyticsError } = await supabaseAdmin
      .from("analytics_events")
      .delete()
      .eq("therapist_id", data.id);
    throwIfSupabaseError(therapistAnalyticsError);

    // 4. Delete therapist relations
    const { error: therapiesDeleteError } = await supabaseAdmin
      .from("therapist_therapies")
      .delete()
      .eq("therapist_id", data.id);
    throwIfSupabaseError(therapiesDeleteError);

    const { error: helpAreasDeleteError } = await supabaseAdmin
      .from("therapist_help_areas")
      .delete()
      .eq("therapist_id", data.id);
    throwIfSupabaseError(helpAreasDeleteError);

    // 5. Delete the user from auth.users (cascades public profiles, user_roles)
    if (therapist.user_id) {
      const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(
        therapist.user_id,
      );
      if (deleteUserError) throw deleteUserError;
    } else {
      // Direct delete from therapists if no user_id exists
      const { error: deleteTherapistError } = await supabaseAdmin
        .from("therapists")
        .delete()
        .eq("id", data.id);
      if (deleteTherapistError) throw deleteTherapistError;
    }

    return { success: true };
  });

export const createAdminTherapist = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => createAdminTherapistSchema.parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Check if email already exists in auth.users
    if (await authUserEmailExists(supabaseAdmin, data.email)) {
      throw new Error("El correo electronico ya esta registrado.");
    }

    // 2. Create the auth user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { display_name: data.full_name },
    });

    if (createError) throw createError;
    const userId = newUser.user.id;

    // 3. Generate a unique slug
    let slug = data.full_name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const { data: existingSlug } = await supabaseAdmin
      .from("therapists")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingSlug) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // 4. Create the therapist profile row
    const { data: therapist, error: insertError } = await supabaseAdmin
      .from("therapists")
      .insert({
        user_id: userId,
        full_name: data.full_name,
        email: data.email,
        slug: slug,
        status: "draft",
        pending_plan_slug: "profesional", // triggers role sync to 'professional'
        photo_url: data.photo_url || null,
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertError) {
      // Attempt auth rollback if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw insertError;
    }

    return { therapistId: therapist.id };
  });
