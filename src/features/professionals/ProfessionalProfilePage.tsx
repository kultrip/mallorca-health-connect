import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Calendar,
  Check,
  ChevronDown,
  Globe,
  HeartHandshake,
  Info,
  Leaf,
  MapPin,
  MessageCircle,
  Monitor,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  User,
} from "lucide-react";
import { useEffect } from "react";

import heroImg from "@/assets/hero-branch.jpg";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { trackAnalyticsEventSoon } from "@/lib/analytics";
import {
  planSupportsPremiumPublicProfile,
  therapistCanShowDirectContact,
  therapistCanShowReviews,
  therapistCanShowVerificationBadge,
} from "@/lib/plan-access";
import { ProfessionalReviewsSection } from "./ProfessionalReviewsSection";

type NamedSlug = {
  slug: string;
  name: string;
};

type MunicipalityData = NamedSlug & {
  lat?: number | null;
  lng?: number | null;
};

type CenterData = {
  id: string;
  name: string;
  address: string | null;
  photo_url: string | null;
  phone: string | null;
  website: string | null;
  municipality_id: string | null;
  municipalities?: MunicipalityData | MunicipalityData[] | null;
};

type TherapyLink = {
  therapies: NamedSlug | NamedSlug[] | null;
};

type HelpAreaLink = {
  help_areas: NamedSlug | NamedSlug[] | null;
};

type Session = {
  name: string;
  duration: string | null;
  price_cents: number | null;
  position: number;
};

type PlanData = {
  slug?: string | null;
  name?: string | null;
  price_monthly_cents?: number | null;
};

type TherapistExtras = {
  therapist_therapies?: TherapyLink[] | null;
  therapist_help_areas?: HelpAreaLink[] | null;
  therapist_sessions?: Session[] | null;
  plans?: PlanData | PlanData[] | null;
  logo_url?: string | null;
  approach_text?: string | null;
  differentiator_text?: string | null;
  mission_text?: string | null;
  target_audience?: string[] | null;
  session_modalities?: string[] | null;
  home_visit_radius?: string | null;
  gallery_urls?: string[] | null;
  team_members?: Array<{
    name?: string | null;
    role?: string | null;
    photo_url?: string | null;
  }> | null;
  organisation_type?: string | null;
};

export function ProfessionalProfilePage({ slug }: { slug: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["therapist", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("therapists")
        .select(
          "*, municipalities(name,slug,lat,lng), plans!therapists_plan_id_fkey(slug,name,price_monthly_cents), therapist_therapies(therapies(slug,name)), therapist_help_areas(help_areas(slug,name)), therapist_sessions(name,duration,price_cents,position)",
        )
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: centers = [] } = useQuery({
    queryKey: ["therapist-centers", data?.user_id ?? slug],
    enabled: Boolean(data?.user_id),
    queryFn: async () => {
      const { data: centersData, error } = await supabase
        .from("centers")
        .select(
          "id,name,address,photo_url,phone,website,municipality_id, municipalities(name,slug,lat,lng)",
        )
        .eq("owner_user_id", data?.user_id ?? "")
        .eq("status", "published")
        .order("created_at");
      if (error) throw error;
      return (centersData ?? []) as CenterData[];
    },
  });

  useEffect(() => {
    if (data?.id) {
      supabase.rpc("track_profile_view", { _therapist_id: data.id }).then();
      trackAnalyticsEventSoon({
        eventType: "professional_profile_view",
        therapistId: data.id,
      });
    }
  }, [data?.id]);

  if (isLoading) {
    return (
      <PageShell>
        <div className="mx-auto max-w-[1180px] px-6 py-16 md:px-10">
          <Skeleton className="h-96 w-full rounded-[2rem]" />
        </div>
      </PageShell>
    );
  }

  if (!data) {
    return (
      <PageShell>
        <div className="mx-auto max-w-[1180px] px-6 py-24 text-center md:px-10">
          <p className="font-display text-2xl text-foreground/80">
            No encontramos este profesional.
          </p>
          <Link
            to="/professionals"
            className="mt-6 inline-flex rounded-full border border-border bg-background px-5 py-2 text-sm hover:bg-muted"
          >
            Ver directorio
          </Link>
        </div>
      </PageShell>
    );
  }

  const extra = data as typeof data & TherapistExtras;
  const therapies = (extra.therapist_therapies ?? [])
    .map((tt) => firstRelation(tt.therapies))
    .filter((therapy): therapy is NamedSlug => Boolean(therapy));
  const helpAreas = (extra.therapist_help_areas ?? [])
    .map((th) => firstRelation(th.help_areas))
    .filter((helpArea): helpArea is NamedSlug => Boolean(helpArea));
  const sessions = (extra.therapist_sessions ?? []).slice().sort((a, b) => a.position - b.position);
  const plan = firstRelation(extra.plans);
  const isPremiumPlan = planSupportsPremiumPublicProfile(plan);
  const isOrganisationPlan = plan?.slug?.toLowerCase() === "centros-organizadores";
  const visibleTherapies = isPremiumPlan ? therapies : therapies.slice(0, 3);
  const visibleHelpAreas = isPremiumPlan ? helpAreas : helpAreas.slice(0, 5);
  const name = data.full_name ?? "";
  const contactName = firstName(name);
  const municipality = firstRelation(
    data.municipalities as MunicipalityData | MunicipalityData[] | null,
  );
  const locationLabel = data.city || municipality?.name || data.address;
  const canShowDirectContact = therapistCanShowDirectContact(data, firstRelation(extra.plans));
  const hasContactActions = Boolean(
    canShowDirectContact && (data.whatsapp || data.link_reserva || data.website),
  );
  const mapCoordinates = getProfileCoordinates(data.lat, data.lng, municipality);
  const hasMap = Boolean(mapCoordinates);
  const aboutLead =
    data.frase_clave ||
    data.headline ||
    "Acompañamiento desde la calma, el equilibrio y la conexión interior.";
  const modalityLabel = formatModalities(data.modalities);
  const galleryUrls = Array.isArray(extra.gallery_urls) ? extra.gallery_urls : [];
  const teamMembers = Array.isArray(extra.team_members) ? extra.team_members : [];
  const locations = buildLocationCards(data, centers, municipality);
  const hasMultipleLocations = locations.length > 1;
  const premiumProfileReady = therapistCanShowDirectContact(data, plan);
  const showVerificationBadge = therapistCanShowVerificationBadge(data, plan);
  const showReviews = therapistCanShowReviews(data, plan);
  const shortBio = truncateText(data.sobre_mi ?? "", 500);

  return (
    <PageShell>
      <article className="bg-[#fff9f1]">
        <section className="relative overflow-hidden bg-[#f4eadb]">
          <img
            src={heroImg}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#f4eadb_0%,rgba(244,234,219,0.94)_42%,rgba(244,234,219,0.52)_100%)]" />

          <div className="relative mx-auto max-w-[1180px] px-6 py-8 md:px-10 md:py-12">
            <Link
              to="/professionals"
              className="inline-flex items-center gap-2 text-sm text-[#6d5b43] hover:text-[#1f3326]"
            >
              <ArrowLeft className="h-4 w-4" /> Volver a resultados
            </Link>

            <div className="mt-8 grid gap-8 md:grid-cols-[270px_1fr] md:items-center lg:grid-cols-[320px_1fr]">
              <div className="relative mx-auto h-64 w-64 md:mx-0 lg:h-72 lg:w-72">
                <div className="h-full w-full overflow-hidden rounded-full border-4 border-white/80 bg-[#eadfce] shadow-[0_25px_70px_rgba(80,54,24,0.18)]">
                  {data.photo_url ? (
                    <img
                      src={data.photo_url}
                      alt={data.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-display text-7xl text-[#9a866a]">
                      {data.full_name?.[0]}
                    </div>
                  )}
                </div>
                {extra.logo_url && (
                  <div className="absolute -left-2 top-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-white/80 bg-white shadow-md">
                    <img src={extra.logo_url} alt="" className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="absolute -bottom-2 right-5 flex h-20 w-20 items-center justify-center rounded-full border border-[#eadfce] bg-[#f8efe4] text-[#9a7041] shadow-md">
                  <Leaf className="h-10 w-10" strokeWidth={1.3} />
                </div>
              </div>

              <div className="max-w-2xl">
                <h1 className="font-display text-[clamp(3rem,6vw,5.6rem)] leading-none tracking-[-0.03em] text-[#1f3326]">
                  {data.full_name}
                </h1>
                <p className="mt-4 text-lg text-[#31291f]">
                  {[data.especialidad, data.headline].filter(Boolean).join(" · ")}
                </p>
                {isOrganisationPlan && extra.organisation_type && (
                  <p className="mt-2 text-sm uppercase tracking-[0.12em] text-[#6d5b43]">
                    {extra.organisation_type}
                  </p>
                )}
                <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-[#5d5144]">
                  {locationLabel && (
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> {locationLabel}
                    </span>
                  )}
                  {modalityLabel && (
                    <span className="inline-flex items-center gap-2">
                      <Monitor className="h-4 w-4" /> {modalityLabel}
                    </span>
                  )}
                </div>
                <p className="mt-7 max-w-[560px] text-base leading-8 text-[#31291f]">{aboutLead}</p>

                {premiumProfileReady && (
                  <ContactActions
                    data={data}
                    contactName={contactName}
                    hasContactActions={hasContactActions}
                  />
                )}

                {showVerificationBadge && (
                  <p className="mt-5 inline-flex items-center gap-2 text-sm text-[#435039]">
                    <ShieldCheck className="h-4 w-4" />
                    Perfil verificado por Mallorca Holística
                    <Info className="h-3.5 w-3.5" />
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1180px] gap-8 px-6 py-10 md:px-10 lg:grid-cols-[1fr_360px]">
          <div className="space-y-8 rounded-[1.8rem] border border-[#eadfce] bg-white/68 p-6 shadow-[0_18px_60px_rgba(96,68,31,0.08)] md:p-8">
            <ProfileSection eyebrow={isPremiumPlan ? "Presentación" : "Sobre mí"}>
              <h2 className="font-display text-3xl leading-tight text-[#1f3326] md:text-4xl">
                {aboutLead}
              </h2>
              {shortBio && (
                <p className="mt-5 whitespace-pre-line text-base leading-8 text-[#342b22]">
                  {isPremiumPlan ? data.sobre_mi : shortBio}
                </p>
              )}
            </ProfileSection>

            {isPremiumPlan &&
              (extra.approach_text || extra.differentiator_text || extra.mission_text) && (
                <ProfileSection eyebrow="Perfil ampliado">
                  <div className="grid gap-5 md:grid-cols-3">
                    {extra.approach_text && (
                      <div className="rounded-2xl border border-[#eadfce] bg-[#fffaf4] p-5">
                        <h3 className="font-medium text-[#1f3326]">Mi enfoque</h3>
                        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#342b22]">
                          {extra.approach_text}
                        </p>
                      </div>
                    )}
                    {extra.differentiator_text && (
                      <div className="rounded-2xl border border-[#eadfce] bg-[#fffaf4] p-5">
                        <h3 className="font-medium text-[#1f3326]">Qué me diferencia</h3>
                        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#342b22]">
                          {extra.differentiator_text}
                        </p>
                      </div>
                    )}
                    {extra.mission_text && (
                      <div className="rounded-2xl border border-[#eadfce] bg-[#fffaf4] p-5">
                        <h3 className="font-medium text-[#1f3326]">Nuestra misión</h3>
                        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#342b22]">
                          {extra.mission_text}
                        </p>
                      </div>
                    )}
                  </div>
                </ProfileSection>
              )}

            {(extra.target_audience?.length ||
              extra.session_modalities?.length ||
              extra.home_visit_radius ||
              visibleHelpAreas.length > 0) && (
              <ProfileSection eyebrow="Modalidades y públicos">
                <div className="flex flex-wrap gap-3">
                  {(extra.target_audience ?? []).map((item) => (
                    <Pill key={item}>{item}</Pill>
                  ))}
                  {(extra.session_modalities ?? []).map((item) => (
                    <Pill key={item}>{item}</Pill>
                  ))}
                  {extra.home_visit_radius && <Pill>{extra.home_visit_radius}</Pill>}
                </div>
              </ProfileSection>
            )}

            {visibleHelpAreas.length > 0 && (
              <ProfileSection eyebrow="Te acompaño en">
                <div className="flex flex-wrap gap-3">
                  {visibleHelpAreas.map((area) => (
                    <Pill key={area.slug}>{area.name}</Pill>
                  ))}
                </div>
              </ProfileSection>
            )}

            {isPremiumPlan && (
              <ProfileSection eyebrow="Cómo trabajo">
                <div className="grid gap-5 md:grid-cols-3">
                  <WorkStyle
                    icon={HeartHandshake}
                    title="Escucha y presencia"
                    text="Creo un espacio seguro para que puedas expresarte y soltar lo que ya no necesitas."
                  />
                  <WorkStyle
                    icon={Leaf}
                    title="Acompañamiento integrativo"
                    text="Integro terapias y recursos adaptados a tu momento vital y a tu proceso."
                  />
                  <WorkStyle
                    icon={Sun}
                    title="Equilibrio y conexión"
                    text="Te acompaño a reconectar contigo y recuperar tu bienestar natural."
                  />
                </div>
              </ProfileSection>
            )}

            {visibleTherapies.length > 0 && (
              <ProfileSection eyebrow="Terapias">
                <div className="flex flex-wrap gap-3">
                  {visibleTherapies.map((therapy) => (
                    <Pill key={therapy.slug}>{therapy.name}</Pill>
                  ))}
                </div>
              </ProfileSection>
            )}

            {isPremiumPlan && sessions.length > 0 && (
              <ProfileSection eyebrow="Sesiones">
                <div className="grid gap-4 md:grid-cols-2">
                  {sessions.map((session, index) => (
                    <div
                      key={`${session.name}-${index}`}
                      className="flex min-h-40 gap-5 rounded-2xl border border-[#eadfce] bg-[#fffaf4] p-5"
                    >
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#f4ede6] text-[#9a7041]">
                        <Leaf className="h-9 w-9" strokeWidth={1.3} />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <h3 className="font-sans text-base font-semibold text-[#1f1c18]">
                          {session.name}
                        </h3>
                        {session.duration && (
                          <p className="mt-1 text-sm text-[#5d5144]">{session.duration}</p>
                        )}
                        <p className="mt-3 text-sm leading-6 text-[#342b22]">
                          Un espacio personalizado para trabajar aquello que necesitas en este
                          momento.
                        </p>
                        {session.price_cents !== null && (
                          <p className="mt-auto self-end font-medium">
                            {formatEuro(session.price_cents)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ProfileSection>
            )}

            {isOrganisationPlan && extra.logo_url && (
              <ProfileSection eyebrow="Identidad visual">
                <div className="inline-flex items-center gap-4 rounded-[1.4rem] border border-[#eadfce] bg-[#fffaf4] px-5 py-4">
                  <img src={extra.logo_url} alt="" className="h-16 w-16 rounded-2xl object-cover" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-[#6d5b43]">
                      Logo de la organización
                    </p>
                    <p className="mt-1 text-sm text-[#342b22]">
                      Identidad visual principal mostrada en el perfil público.
                    </p>
                  </div>
                </div>
              </ProfileSection>
            )}

            {isOrganisationPlan && extra.facilities?.length ? (
              <ProfileSection eyebrow="Instalaciones">
                <div className="flex flex-wrap gap-3">
                  {extra.facilities.map((item) => (
                    <Pill key={item}>{item}</Pill>
                  ))}
                </div>
              </ProfileSection>
            ) : null}

            {isOrganisationPlan && galleryUrls.length > 0 && (
              <ProfileSection eyebrow="Galería">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {galleryUrls.map((url) => (
                    <img
                      key={url}
                      src={url}
                      alt=""
                      className="h-44 w-full rounded-2xl border border-[#eadfce] object-cover"
                    />
                  ))}
                </div>
              </ProfileSection>
            )}

            {isOrganisationPlan && teamMembers.length > 0 && (
              <ProfileSection eyebrow="Equipo">
                <div className="grid gap-4 md:grid-cols-2">
                  {teamMembers.map((member, index) => (
                    <div
                      key={`${member.name ?? "member"}-${index}`}
                      className="rounded-2xl border border-[#eadfce] bg-[#fffaf4] p-5"
                    >
                      <div className="flex items-start gap-4">
                        {member.photo_url ? (
                          <img
                            src={member.photo_url}
                            alt=""
                            className="h-16 w-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f4ede6] text-[#9a7041]">
                            <User className="h-7 w-7" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-[#1f3326]">{member.name ?? "Equipo"}</h3>
                          <p className="mt-1 text-sm text-[#5d5144]">{member.role ?? ""}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ProfileSection>
            )}

            <ProfessionalReviewsSection
              therapistId={data.id}
              therapistName={data.full_name ?? "este perfil"}
              isVisible={showReviews}
            />
          </div>

          <aside className="space-y-6">
            <SideCard
              icon={ShieldCheck}
              title={showVerificationBadge ? "Sello Mallorca Holística" : "Perfil público"}
            >
              <p className="text-sm text-[#5d5144]">
                {data.years_experience
                  ? `${data.years_experience} años de experiencia`
                  : "Documentación revisada"}
              </p>
              <ul className="mt-5 space-y-3 text-sm text-[#342b22]">
                {[
                  "Formación y diplomas",
                  "Experiencia profesional",
                  "Seguro de responsabilidad civil",
                  "Adhesión al código deontológico",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="h-4 w-4 text-[#526046]" /> {item}
                  </li>
                ))}
              </ul>
            </SideCard>

            {isPremiumPlan && (data.formacion || data.experiencia) && (
              <SideCard icon={Leaf} title="Formación y experiencia">
                {data.formacion && (
                  <p className="whitespace-pre-line text-sm leading-7 text-[#342b22]">
                    {data.formacion}
                  </p>
                )}
                {data.experiencia && (
                  <details className="mt-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-[#526046]">
                      Ver trayectoria completa <ChevronDown className="h-4 w-4" />
                    </summary>
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#342b22]">
                      {data.experiencia}
                    </p>
                  </details>
                )}
              </SideCard>
            )}

            {hasMap && (
              <SideCard icon={MapPin} title="Ubicación">
                <p className="text-sm text-[#342b22]">{locationLabel ?? "Mallorca"}</p>
                <div className="mt-4 min-h-40 rounded-2xl border border-[#eadfce] bg-[linear-gradient(135deg,#dfe9d5,#f5eadb)] p-4 text-sm text-[#5d5144]">
                  Ubicación aproximada en Mallorca
                </div>
                {hasMultipleLocations && isPremiumPlan && (
                  <div className="mt-4 space-y-3">
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#6d5b43]">
                      Ubicaciones
                    </p>
                    <div className="space-y-3">
                      {locations.map((location) => (
                        <div
                          key={location.id}
                          className="rounded-2xl border border-[#eadfce] bg-[#fffaf4] p-4"
                        >
                          <p className="font-medium text-[#1f3326]">{location.name}</p>
                          {location.address && (
                            <p className="mt-1 text-sm text-[#5d5144]">{location.address}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {data.modalities?.includes("online") && (
                  <p className="mt-4 inline-flex items-center gap-2 text-sm text-[#342b22]">
                    <Monitor className="h-4 w-4" /> También disponible online
                  </p>
                )}
              </SideCard>
            )}

            {premiumProfileReady && (
              <SideCard icon={MessageCircle} title="Contacto directo">
                <div className="space-y-3">
                  {data.phone && (
                    <ContactLink
                      href={`tel:${sanitizePhoneHref(data.phone)}`}
                      label="Llamar"
                      description={data.phone}
                    />
                  )}
                  {data.show_whatsapp_public && data.whatsapp && (
                    <ContactLink
                      href={whatsappHref(data.whatsapp, contactName)}
                      label="WhatsApp"
                      description={data.whatsapp}
                    />
                  )}
                  {data.show_email_public && data.email && (
                    <ContactLink
                      href={`mailto:${data.email}`}
                      label="Email"
                      description={data.email}
                    />
                  )}
                  {data.website && (
                    <ContactLink href={data.website} label="Web" description={data.website} />
                  )}
                  {data.calendly_url && (
                    <ContactLink
                      href={data.calendly_url}
                      label="Calendly"
                      description="Reserva online"
                    />
                  )}
                  {data.fresha_url && (
                    <ContactLink
                      href={data.fresha_url}
                      label="Fresha"
                      description="Reserva online"
                    />
                  )}
                  {data.whatsapp_business_url && (
                    <ContactLink
                      href={data.whatsapp_business_url}
                      label="WhatsApp Business"
                      description="Canal de empresa"
                    />
                  )}
                  {data.other_booking_url && (
                    <ContactLink
                      href={data.other_booking_url}
                      label="Otra plataforma"
                      description="Reserva externa"
                    />
                  )}
                </div>
              </SideCard>
            )}
          </aside>
        </section>

        {premiumProfileReady && (
          <section className="mx-auto max-w-[1180px] px-6 pb-10 md:px-10">
            <div className="rounded-[1.8rem] border border-[#eadfce] bg-[#fffaf4] p-7 md:flex md:items-center md:justify-between md:p-9">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f4ede6] text-[#9a7041]">
                  <Leaf className="h-10 w-10" strokeWidth={1.3} />
                </div>
                <div>
                  <h2 className="font-display text-3xl text-[#1f3326]">
                    ¿Sientes que es el momento?
                  </h2>
                  <p className="mt-2 text-sm text-[#5d5144]">
                    Reserva tu sesión o habla directamente con {contactName} para resolver cualquier
                    duda.
                  </p>
                </div>
              </div>
              <ContactActions
                data={data}
                contactName={contactName}
                hasContactActions={hasContactActions}
                compact
              />
            </div>
          </section>
        )}

        <section className="mx-auto max-w-[1180px] px-6 pb-24 md:px-10">
          <div className="rounded-[1.8rem] border border-[#eadfce] bg-[#fffaf4] p-7">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <p className="font-display text-2xl italic leading-relaxed text-[#342b22]">
                “Cada camino es único. Si lo necesitas, explora otras terapias o describe cómo te
                sientes de nuevo.”
              </p>
              <Link
                to="/search"
                search={{ q: "" } as never}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#7a5730] underline-offset-4 hover:underline"
              >
                Nueva búsqueda <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </article>
    </PageShell>
  );
}

function ContactActions({
  data,
  contactName,
  hasContactActions,
  compact = false,
}: {
  data: {
    id: string;
    whatsapp?: string | null;
    link_reserva?: string | null;
    website?: string | null;
  };
  contactName: string;
  hasContactActions: boolean;
  compact?: boolean;
}) {
  if (!hasContactActions) {
    if (compact) return null;
    return (
      <p className="mt-6 text-sm leading-relaxed text-[#5d5144]">
        Este perfil forma parte del ecosistema Mallorca Holística. Las formas de contacto visibles
        dependen del plan activo del profesional.
      </p>
    );
  }

  return (
    <div className={compact ? "mt-6 flex flex-wrap gap-3 md:mt-0" : "mt-7 flex flex-wrap gap-3"}>
      {data.link_reserva && (
        <Button asChild className="rounded-full bg-[#526046] px-7 text-white hover:bg-[#435039]">
          <a
            href={data.link_reserva}
            target="_blank"
            rel="noopener"
            onClick={() =>
              trackAnalyticsEventSoon({
                eventType: "professional_contact_click",
                therapistId: data.id,
                metadata: { channel: "reservation" },
              })
            }
          >
            <Calendar className="h-4 w-4" /> Reservar sesión
          </a>
        </Button>
      )}
      {data.whatsapp && (
        <Button
          asChild
          variant="outline"
          className="rounded-full border-[#9d8d76] bg-white/45 px-7 text-[#342b22] hover:bg-white"
        >
          <a
            href={whatsappHref(data.whatsapp, contactName)}
            target="_blank"
            rel="noopener"
            onClick={() =>
              trackAnalyticsEventSoon({
                eventType: "professional_contact_click",
                therapistId: data.id,
                metadata: { channel: "whatsapp" },
              })
            }
          >
            <MessageCircle className="h-4 w-4" /> Hablar por WhatsApp
          </a>
        </Button>
      )}
      {data.website && !compact && (
        <Button
          asChild
          variant="outline"
          className="rounded-full border-[#9d8d76] bg-white/45 px-7 text-[#342b22] hover:bg-white"
        >
          <a
            href={data.website}
            target="_blank"
            rel="noopener"
            onClick={() =>
              trackAnalyticsEventSoon({
                eventType: "professional_contact_click",
                therapistId: data.id,
                metadata: { channel: "website" },
              })
            }
          >
            <Globe className="h-4 w-4" /> Web
          </a>
        </Button>
      )}
    </div>
  );
}

function ProfileSection({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-[#eadfce] pb-8 last:border-b-0 last:pb-0">
      <div className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6d5b43]">
        <Leaf className="h-4 w-4 text-[#9a7041]" strokeWidth={1.4} />
        {eyebrow}
      </div>
      {children}
    </section>
  );
}

function WorkStyle({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Leaf;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f4ede6] text-[#9a7041]">
        <Icon className="h-7 w-7" strokeWidth={1.35} />
      </div>
      <div>
        <h3 className="font-sans text-base font-semibold text-[#1f1c18]">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#5d5144]">{text}</p>
      </div>
    </div>
  );
}

function SideCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Leaf;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.5rem] border border-[#eadfce] bg-white/68 p-6 shadow-[0_18px_60px_rgba(96,68,31,0.06)]">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f4ede6] text-[#9a7041]">
          <Icon className="h-6 w-6" strokeWidth={1.35} />
        </div>
        <h2 className="font-sans text-sm font-bold uppercase tracking-[0.08em] text-[#342b22]">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[#f4ede6] px-5 py-2 text-sm text-[#4a3d2f]">{children}</span>
  );
}

function firstName(fullName?: string | null) {
  return fullName?.split(" ")[0] ?? "este profesional";
}

function truncateText(value: string, maxChars: number) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, maxChars).trimEnd()}…`;
}

function whatsappHref(phone: string, name: string) {
  const number = phone.replace(/[^0-9]/g, "");
  const message = `Hola ${name}, te he encontrado en Mallorca Holística. Me gustaría saber cómo puedes ayudarme y consultar tu disponibilidad. Gracias`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function sanitizePhoneHref(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

function formatEuro(priceCents: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(priceCents / 100);
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function getProfileCoordinates(
  lat: number | null | undefined,
  lng: number | null | undefined,
  municipality: MunicipalityData | null,
) {
  if (isFiniteNumber(lat) && isFiniteNumber(lng)) return { lat, lng };
  if (isFiniteNumber(municipality?.lat) && isFiniteNumber(municipality?.lng)) {
    return { lat: municipality.lat, lng: municipality.lng };
  }
  return null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function buildLocationCards(
  therapist: {
    center_id?: string | null;
    center_name?: string | null;
    address?: string | null;
    municipality_id?: string | null;
  },
  centers: CenterData[],
  municipality: MunicipalityData | null,
) {
  const cards = centers.map((center) => ({
    id: center.id,
    name: center.name,
    address: center.address ?? "",
    municipality: firstRelation(center.municipalities)?.name ?? "",
    phone: center.phone ?? null,
    website: center.website ?? null,
    photoUrl: center.photo_url ?? null,
  }));

  if (cards.length > 0) return cards;

  if (therapist.center_name || therapist.address || municipality) {
    return [
      {
        id: therapist.center_id ?? "main-location",
        name: therapist.center_name ?? "Ubicación principal",
        address: therapist.address ?? "",
        municipality: municipality?.name ?? "",
        phone: null,
        website: null,
        photoUrl: null,
      },
    ];
  }

  return [];
}

function ContactLink({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description: string;
}) {
  const isExternal = href.startsWith("http");
  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener" : undefined}
      className="flex items-center justify-between rounded-2xl border border-[#eadfce] bg-white px-4 py-3 text-sm text-[#342b22] transition-colors hover:bg-[#fffaf4]"
    >
      <span className="font-medium">{label}</span>
      <span className="max-w-[60%] truncate text-[#6d5b43]">{description}</span>
    </a>
  );
}

function formatModalities(modalities?: string[] | null) {
  if (!modalities?.length) return "";
  return modalities
    .map((modality) => {
      if (modality === "presencial") return "Presencial";
      if (modality === "online") return "Online";
      if (modality === "domicilio") return "A domicilio";
      return modality;
    })
    .join(" · ");
}
