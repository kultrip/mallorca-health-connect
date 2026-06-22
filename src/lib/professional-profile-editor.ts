import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const modalitySchema = z.enum(["presencial", "online", "domicilio"]);

const sessionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
  duration: z.string().trim().max(80).optional().nullable(),
  price_cents: z.number().int().min(0).optional().nullable(),
  position: z.number().int().min(0),
});

const locationSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  center_name: z.string().trim().min(1).max(160),
  address: z.string().trim().max(220).optional().nullable(),
  municipality_id: z.string().uuid().optional().nullable(),
});

const teamMemberSchema = z.object({
  name: z.string().trim().max(160),
  role: z.string().trim().max(160),
  photo_url: z.string().trim().url().max(500).optional().nullable(),
});

const profileEditorSchema = z.object({
  therapistId: z.string().uuid(),
  profile: z.object({
    full_name: z.string().trim().min(2).max(160),
    professional_name: z.string().trim().max(160).optional().nullable(),
    headline: z.string().trim().max(180).optional().nullable(),
    frase_clave: z.string().trim().max(220).optional().nullable(),
    especialidad: z.string().trim().max(120).optional().nullable(),
    subespecialidades: z.array(z.string().trim().min(1).max(80)).max(12),
    modalities: z.array(modalitySchema).min(1),
    years_experience: z.number().int().min(0).max(80).optional().nullable(),
    municipality_id: z.string().uuid().optional().nullable(),
    city: z.string().trim().max(120).optional().nullable(),
    address: z.string().trim().max(220).optional().nullable(),
    lat: z.number().min(-90).max(90).optional().nullable(),
    lng: z.number().min(-180).max(180).optional().nullable(),
    whatsapp: z.string().trim().max(40).optional().nullable(),
    phone: z.string().trim().max(40).optional().nullable(),
    email: z.string().trim().email().max(180).optional().nullable(),
    website: z.string().trim().url().max(240).optional().nullable(),
    instagram_url: z.string().trim().url().max(240).optional().nullable(),
    facebook_url: z.string().trim().url().max(240).optional().nullable(),
    linkedin_url: z.string().trim().url().max(240).optional().nullable(),
    youtube_url: z.string().trim().url().max(240).optional().nullable(),
    calendly_url: z.string().trim().url().max(240).optional().nullable(),
    fresha_url: z.string().trim().url().max(240).optional().nullable(),
    whatsapp_business_url: z.string().trim().url().max(240).optional().nullable(),
    other_booking_url: z.string().trim().url().max(240).optional().nullable(),
    show_whatsapp_public: z.boolean().optional().nullable(),
    show_email_public: z.boolean().optional().nullable(),
    link_reserva: z.string().trim().url().max(240).optional().nullable(),
    sobre_mi: z.string().trim().max(3000).optional().nullable(),
    approach_text: z.string().trim().max(3000).optional().nullable(),
    differentiator_text: z.string().trim().max(1000).optional().nullable(),
    formacion: z.string().trim().max(3000).optional().nullable(),
    experiencia: z.string().trim().max(3000).optional().nullable(),
    mission_text: z.string().trim().max(3000).optional().nullable(),
    organisation_type: z.string().trim().max(120).optional().nullable(),
    target_audience: z.array(z.string().trim().min(1).max(80)).max(24),
    accompaniment_modalities: z.array(z.string().trim().min(1).max(80)).max(24),
    session_modalities: z.array(z.string().trim().min(1).max(80)).max(12),
    home_visit_radius: z.string().trim().max(80).optional().nullable(),
    languages: z.array(z.string().trim().min(1).max(80)).max(24),
    facilities: z.array(z.string().trim().min(1).max(80)).optional().nullable(),
    gallery_urls: z.array(z.string().trim().url().max(500)).optional().nullable(),
    team_members: z.array(teamMemberSchema).optional().nullable(),
    responsible_first_name: z.string().trim().max(120).optional().nullable(),
    responsible_last_name: z.string().trim().max(120).optional().nullable(),
    responsible_role: z.string().trim().max(120).optional().nullable(),
    responsible_email: z.string().trim().email().max(180).optional().nullable(),
    responsible_phone: z.string().trim().max(40).optional().nullable(),
    legal_entity_name: z.string().trim().max(180).optional().nullable(),
    legal_entity_tax_id: z.string().trim().max(40).optional().nullable(),
    declares_legal_authority: z.boolean().optional().nullable(),
    organization_signature_name: z.string().trim().max(160).optional().nullable(),
    has_liability_insurance: z.boolean().optional().nullable(),
    accepted_deontological_code: z.boolean().optional().nullable(),
    accepted_truthfulness: z.boolean().optional().nullable(),
    accepted_privacy_policy: z.boolean().optional().nullable(),
    accepted_terms_of_use: z.boolean().optional().nullable(),
    accepted_publication: z.boolean().optional().nullable(),
    logo_url: z.string().trim().url().max(500).optional().nullable(),
    photo_url: z.string().trim().url().max(500).optional().nullable(),
  }),
  therapyIds: z.array(z.string().uuid()).max(30),
  helpAreaIds: z.array(z.string().uuid()).max(40),
  sessions: z.array(sessionSchema).max(12),
  locations: z.array(locationSchema).max(10).optional().default([]),
});

type ProfileEditorInput = z.infer<typeof profileEditorSchema>;

export const saveProfessionalProfile = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => profileEditorSchema.parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const therapist = await loadOwnedTherapist(data.therapistId, context.userId);
    const normalized = normalizeProfile(data);

    const { error: updateError } = await supabaseAdmin
      .from("therapists")
      .update(normalized.profile)
      .eq("id", therapist.id);

    if (updateError) {
      throw new Error(`No se pudo guardar el perfil: ${updateError.message}`);
    }

    await replaceTherapyLinks(therapist.id, normalized.therapyIds);
    await replaceHelpAreaLinks(therapist.id, normalized.helpAreaIds);
    await replaceSessions(therapist.id, normalized.sessions);
    await syncCenters(therapist.user_id, therapist.plan_id, data.locations ?? []);

    return { therapistId: therapist.id };
  });

async function loadOwnedTherapist(therapistId: string, userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("therapists")
    .select("id,user_id,plan_id")
    .eq("id", therapistId)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo cargar el perfil: ${error.message}`);
  }

  if (!data || data.user_id !== userId) {
    throw new Error("No tienes permisos para editar este perfil.");
  }

  return data;
}

function normalizeProfile(data: ProfileEditorInput) {
  return {
    profile: {
      full_name: data.profile.full_name,
      professional_name: nullable(data.profile.professional_name),
      headline: nullable(data.profile.headline),
      frase_clave: nullable(data.profile.frase_clave),
      especialidad: nullable(data.profile.especialidad),
      subespecialidades: data.profile.subespecialidades,
      modalities: data.profile.modalities,
      years_experience: data.profile.years_experience ?? null,
      municipality_id: data.profile.municipality_id ?? null,
      city: nullable(data.profile.city),
      address: nullable(data.profile.address),
      lat: data.profile.lat ?? null,
      lng: data.profile.lng ?? null,
      whatsapp: nullable(data.profile.whatsapp),
      phone: nullable(data.profile.phone),
      email: nullable(data.profile.email),
      website: nullable(data.profile.website),
      instagram_url: nullable(data.profile.instagram_url),
      facebook_url: nullable(data.profile.facebook_url),
      linkedin_url: nullable(data.profile.linkedin_url),
      youtube_url: nullable(data.profile.youtube_url),
      calendly_url: nullable(data.profile.calendly_url),
      fresha_url: nullable(data.profile.fresha_url),
      whatsapp_business_url: nullable(data.profile.whatsapp_business_url),
      other_booking_url: nullable(data.profile.other_booking_url),
      show_whatsapp_public: data.profile.show_whatsapp_public ?? false,
      show_email_public: data.profile.show_email_public ?? false,
      link_reserva: nullable(data.profile.link_reserva),
      sobre_mi: nullable(data.profile.sobre_mi),
      approach_text: nullable(data.profile.approach_text),
      differentiator_text: nullable(data.profile.differentiator_text),
      formacion: nullable(data.profile.formacion),
      experiencia: nullable(data.profile.experiencia),
      mission_text: nullable(data.profile.mission_text),
      organisation_type: nullable(data.profile.organisation_type),
      target_audience: data.profile.target_audience,
      accompaniment_modalities: data.profile.accompaniment_modalities,
      session_modalities: data.profile.session_modalities,
      home_visit_radius: nullable(data.profile.home_visit_radius),
      languages: data.profile.languages,
      facilities: data.profile.facilities ?? null,
      gallery_urls: data.profile.gallery_urls ?? null,
      team_members: data.profile.team_members ?? null,
      responsible_first_name: nullable(data.profile.responsible_first_name),
      responsible_last_name: nullable(data.profile.responsible_last_name),
      responsible_role: nullable(data.profile.responsible_role),
      responsible_email: nullable(data.profile.responsible_email),
      responsible_phone: nullable(data.profile.responsible_phone),
      legal_entity_name: nullable(data.profile.legal_entity_name),
      legal_entity_tax_id: nullable(data.profile.legal_entity_tax_id),
      declares_legal_authority: data.profile.declares_legal_authority ?? false,
      organization_signature_name: nullable(data.profile.organization_signature_name),
      has_liability_insurance: data.profile.has_liability_insurance ?? false,
      accepted_deontological_code: data.profile.accepted_deontological_code ?? false,
      accepted_truthfulness: data.profile.accepted_truthfulness ?? false,
      accepted_privacy_policy: data.profile.accepted_privacy_policy ?? false,
      accepted_terms_of_use: data.profile.accepted_terms_of_use ?? false,
      accepted_publication: data.profile.accepted_publication ?? false,
      logo_url: nullable(data.profile.logo_url),
      photo_url: nullable(data.profile.photo_url),
      updated_at: new Date().toISOString(),
    },
    therapyIds: uniqueIds(data.therapyIds),
    helpAreaIds: uniqueIds(data.helpAreaIds),
    sessions: data.sessions
      .filter((session) => session.name.trim().length > 0)
      .map((session, index) => ({
        name: session.name.trim(),
        duration: nullable(session.duration),
        price_cents: session.price_cents ?? null,
        position: index,
      })),
  };
}

async function replaceTherapyLinks(therapistId: string, therapyIds: string[]) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error: deleteError } = await supabaseAdmin
    .from("therapist_therapies")
    .delete()
    .eq("therapist_id", therapistId);

  if (deleteError) {
    throw new Error(`No se pudieron actualizar las terapias: ${deleteError.message}`);
  }

  if (therapyIds.length === 0) return;

  const { error: insertError } = await supabaseAdmin.from("therapist_therapies").insert(
    therapyIds.map((therapyId) => ({
      therapist_id: therapistId,
      therapy_id: therapyId,
    })),
  );

  if (insertError) {
    throw new Error(`No se pudieron guardar las terapias: ${insertError.message}`);
  }
}

async function replaceHelpAreaLinks(therapistId: string, helpAreaIds: string[]) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error: deleteError } = await supabaseAdmin
    .from("therapist_help_areas")
    .delete()
    .eq("therapist_id", therapistId);

  if (deleteError) {
    throw new Error(`No se pudieron actualizar las areas de ayuda: ${deleteError.message}`);
  }

  if (helpAreaIds.length === 0) return;

  const { error: insertError } = await supabaseAdmin.from("therapist_help_areas").insert(
    helpAreaIds.map((helpAreaId) => ({
      therapist_id: therapistId,
      help_area_id: helpAreaId,
    })),
  );

  if (insertError) {
    throw new Error(`No se pudieron guardar las areas de ayuda: ${insertError.message}`);
  }
}

async function replaceSessions(
  therapistId: string,
  sessions: Array<{
    name: string;
    duration: string | null;
    price_cents: number | null;
    position: number;
  }>,
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error: deleteError } = await supabaseAdmin
    .from("therapist_sessions")
    .delete()
    .eq("therapist_id", therapistId);

  if (deleteError) {
    throw new Error(`No se pudieron actualizar las sesiones: ${deleteError.message}`);
  }

  if (sessions.length === 0) return;

  const { error: insertError } = await supabaseAdmin.from("therapist_sessions").insert(
    sessions.map((session) => ({
      therapist_id: therapistId,
      ...session,
    })),
  );

  if (insertError) {
    throw new Error(`No se pudieron guardar las sesiones: ${insertError.message}`);
  }
}

async function syncCenters(
  userId: string | null,
  planId: string | null,
  locations: ProfileEditorInput["locations"],
) {
  if (!userId || locations.length === 0) return;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: existingCenters, error: loadError } = await supabaseAdmin
    .from("centers")
    .select("id")
    .eq("owner_user_id", userId);

  if (loadError) {
    throw new Error(`No se pudieron cargar las ubicaciones actuales: ${loadError.message}`);
  }

  const municipalityIds = Array.from(
    new Set(locations.map((location) => location.municipality_id).filter(Boolean)),
  ) as string[];
  const municipalityMap = new Map<string, { lat: number | null; lng: number | null }>();

  if (municipalityIds.length > 0) {
    const { data: municipalities, error: municipalitiesError } = await supabaseAdmin
      .from("municipalities")
      .select("id, lat, lng")
      .in("id", municipalityIds);

    if (municipalitiesError) {
      throw new Error(`No se pudieron cargar los municipios: ${municipalitiesError.message}`);
    }

    for (const municipality of municipalities ?? []) {
      municipalityMap.set(municipality.id, { lat: municipality.lat, lng: municipality.lng });
    }
  }

  const keepIds = new Set<string>();
  let mainCenterId: string | null = null;

  for (const [index, location] of locations.entries()) {
    const municipality = location.municipality_id
      ? (municipalityMap.get(location.municipality_id) ?? null)
      : null;
    const payload = {
      owner_user_id: userId,
      plan_id: planId,
      slug: slugify(`${location.center_name}-${index + 1}`),
      name: location.center_name,
      address: location.address,
      municipality_id: location.municipality_id,
      lat: municipality?.lat ?? null,
      lng: municipality?.lng ?? null,
      phone: null,
      website: null,
      photo_url: null,
      description: null,
      status: "pending" as const,
    };

    if (location.id) {
      const { error } = await supabaseAdmin.from("centers").update(payload).eq("id", location.id);
      if (error) {
        throw new Error(`No se pudo actualizar una ubicación: ${error.message}`);
      }
      keepIds.add(location.id);
      if (!mainCenterId) mainCenterId = location.id;
      continue;
    }

    const { data, error } = await supabaseAdmin
      .from("centers")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      throw new Error(`No se pudo crear una ubicación: ${error.message}`);
    }

    if (data?.id) {
      keepIds.add(data.id);
      if (!mainCenterId) mainCenterId = data.id;
    }
  }

  if (mainCenterId) {
    const { error } = await supabaseAdmin
      .from("therapists")
      .update({ center_id: mainCenterId })
      .eq("user_id", userId);
    if (error) {
      throw new Error(`No se pudo actualizar la ubicación principal: ${error.message}`);
    }
  }

  const staleIds = (existingCenters ?? []).map((row) => row.id).filter((id) => !keepIds.has(id));
  if (staleIds.length > 0) {
    const { error } = await supabaseAdmin.from("centers").delete().in("id", staleIds);
    if (error) {
      throw new Error(`No se pudieron limpiar ubicaciones antiguas: ${error.message}`);
    }
  }
}

function nullable(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueIds(ids: string[]) {
  return Array.from(new Set(ids));
}
