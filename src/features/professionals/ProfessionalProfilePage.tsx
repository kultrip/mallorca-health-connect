import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Calendar,
  Check,
  ChevronDown,
  Flag,
  Globe,
  Handshake,
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
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

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
import { submitProfessionalReport } from "@/lib/professional-reports";
import { ProfessionalReviewsSection } from "./ProfessionalReviewsSection";
import { SingleProfessionalMap } from "@/components/therapists/SingleProfessionalMap";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MUNICIPALITY_COORDINATES } from "@/lib/municipality-coordinates";

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

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportEmail, setReportEmail] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

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
    canShowDirectContact && (data.whatsapp || data.phone || data.link_reserva || data.website),
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

  const schema = {
    "@context": "https://schema.org",
    "@type": data.is_center ? "LocalBusiness" : "Person",
    name: data.full_name,
    image: data.photo_url || undefined,
    description: data.sobre_mi || data.headline || undefined,
    jobTitle: data.is_center ? undefined : data.especialidad || "Terapeuta",
    address: {
      "@type": "PostalAddress",
      addressLocality: data.city || municipality?.name || "Mallorca",
      addressRegion: "Islas Baleares",
      addressCountry: "ES",
    },
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {!data.is_claimed && (
        <div className="bg-[#fcf8f2] border-b border-[#eadfce] px-6 py-4 relative z-40 shadow-sm animate-fade-in">
          <div className="mx-auto max-w-[1180px] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1f3326]">¿Eres tú {data.full_name || data.business_name}?</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Este perfil se ha recopilado de fuentes públicas. Reclámalo gratis para editar tus datos, responder valoraciones y captar clientes.
                </p>
              </div>
            </div>
            <Link
              to="/register"
              search={{ claim: data.id }}
              className="inline-flex items-center gap-2 rounded-full bg-[#1f3326] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#112016] transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
            >
              Reclamar este Perfil Gratis <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
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
                  <TooltipProvider>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <button className="mt-5 inline-flex items-center gap-2 text-sm text-[#435039] hover:text-[#2d3a27] bg-[#526046]/5 hover:bg-[#526046]/10 px-3 py-1.5 rounded-full transition-all duration-300 font-medium border border-[#526046]/10 cursor-pointer">
                          <ShieldCheck className="h-4 w-4 text-[#526046] animate-pulse" />
                          <span>Perfil verificado por Mallorca Holística</span>
                          <Info className="h-3.5 w-3.5 text-[#526046]/70" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-4 bg-white border border-[#eadfce] text-[#31291f] rounded-2xl shadow-xl space-y-2.5">
                        <div className="font-display font-bold text-sm text-[#1f3326] flex items-center gap-1.5">
                          <ShieldCheck className="h-4 w-4 text-[#526046]" />
                          Sello de Confianza Activo
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Este profesional ha completado el riguroso proceso de admisión de Mallorca
                          Holística:
                        </p>
                        <div className="space-y-1.5 pt-1 text-xs">
                          <div className="flex items-center gap-2 text-emerald-800 font-medium">
                            <span className="text-[#526046] font-bold">✓</span>
                            <span>Código Deontológico aceptado</span>
                          </div>
                          {data.verification_document_path && (
                            <div className="flex items-center gap-2 text-emerald-800 font-medium">
                              <span className="text-[#526046] font-bold">✓</span>
                              <span>Titulación profesional verificada</span>
                            </div>
                          )}
                          {data.has_liability_insurance && (
                            <div className="flex items-center gap-2 text-emerald-800 font-medium">
                              <span className="text-[#526046] font-bold">✓</span>
                              <span>Seguro de Responsabilidad Civil</span>
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
              title={showVerificationBadge ? "Sello de Confianza" : "Perfil público"}
            >
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-[#5d5144]">
                  {showVerificationBadge ? (
                    <span>
                      Este profesional ha superado el{" "}
                      <strong>proceso de auditoría y verificación</strong> de Mallorca Holística,
                      habiendo aportado documentación que acredita de forma fehaciente los
                      siguientes criterios:
                    </span>
                  ) : (
                    <span>
                      Este perfil está registrado como miembro del ecosistema. Sus credenciales
                      están sujetas a la verificación oficial de Mallorca Holística:
                    </span>
                  )}
                </p>

                <div className="mt-4 space-y-3">
                  {[
                    {
                      label: "Identidad Verificada",
                      desc: "Validación de DNI/NIE o documento de identidad oficial.",
                    },
                    {
                      label: "Titulación y Formación",
                      desc: "Diplomas, posgrados y certificaciones oficiales acreditados.",
                    },
                    {
                      label: "Seguro de Responsabilidad Civil",
                      desc: "Póliza de seguro vigente de RC profesional aportada.",
                    },
                    {
                      label: "Código Deontológico",
                      desc: "Adhesión formal y compromiso de cumplimiento ético.",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 rounded-2xl border border-[#eadfce]/40 bg-[#fffdfa]/60 p-3"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#eef5eb] text-[#435039]">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-[#1f3326]">{item.label}</p>
                        <p className="text-[11px] leading-relaxed text-[#6d5b43] mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SideCard>

            {/* Report Profile Button */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setReportSubmitted(false);
                  setReportReason("");
                  setReportDetails("");
                  setReportEmail("");
                  setShowReportModal(true);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#eadfce]/60 bg-white/40 py-3 text-xs font-semibold text-[#8c7a66] hover:bg-white hover:text-[#d32f2f] active:scale-95 transition-all cursor-pointer"
              >
                <Flag className="h-3.5 w-3.5" />
                Reportar este perfil
              </button>
            </div>

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

            {hasMap && mapCoordinates && (
              <SideCard icon={MapPin} title="Ubicación">
                <p className="text-sm text-[#342b22]">{locationLabel ?? "Mallorca"}</p>
                <div className="mt-4">
                  <SingleProfessionalMap
                    lat={mapCoordinates.lat}
                    lng={mapCoordinates.lng}
                    name={name}
                    isApproximate={!data.address || !data.lat || !data.lng}
                  />
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

            {premiumProfileReady ? (
              <SideCard icon={MessageCircle} title="Contacto directo">
                <div className="space-y-3">
                  {data.phone && (
                    <ContactLink
                      href={`tel:${sanitizePhoneHref(data.phone)}`}
                      label="Llamar"
                      description={data.phone}
                    />
                  )}
                  {(data.show_whatsapp_public || premiumProfileReady) &&
                    (data.whatsapp || data.phone) && (
                      <ContactLink
                        href={whatsappHref(data.whatsapp || data.phone || "", contactName)}
                        label="WhatsApp"
                        description={data.whatsapp || data.phone || ""}
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
            ) : (
              (data.phone || (data.show_whatsapp_public && (data.whatsapp || data.phone))) && (
                <SideCard icon={MessageCircle} title="Contacto directo">
                  <div className="space-y-3">
                    {data.phone && (
                      <ContactLink
                        href={`tel:${sanitizePhoneHref(data.phone)}`}
                        label="Llamar"
                        description={data.phone}
                      />
                    )}
                    {data.show_whatsapp_public && (data.whatsapp || data.phone) && (
                      <ContactLink
                        href={whatsappHref(data.whatsapp || data.phone || "", contactName)}
                        label="WhatsApp"
                        description={data.whatsapp || data.phone || ""}
                      />
                    )}
                  </div>
                </SideCard>
              )
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

      {/* Report Profile Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg rounded-[2.5rem] border border-[#eadfce] bg-[#fffaf4] p-6 shadow-2xl md:p-8 animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute right-6 top-6 rounded-full p-2 text-[#8c7a66] hover:bg-[#f4eadb] hover:text-[#1f3326] transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {!reportSubmitted ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!reportReason) return;
                  setIsSubmittingReport(true);

                  try {
                    await submitProfessionalReport({
                      data: {
                        therapistId: data.id,
                        professionalName: data.full_name ?? contactName,
                        professionalSlug: slug,
                        reason: reportReason,
                        details: reportDetails || null,
                        reporterEmail: reportEmail || null,
                        origin: window.location.origin,
                      },
                    });

                    trackAnalyticsEventSoon({
                      eventType: "professional_profile_reported",
                      therapistId: data.id,
                      metadata: {
                        reason: reportReason,
                        hasDetails: Boolean(reportDetails.trim()),
                        hasReporterEmail: Boolean(reportEmail.trim()),
                      },
                    });

                    setReportSubmitted(true);
                  } catch (error) {
                    console.error("Profile report submission failed:", error);
                    toast.error("No pudimos enviar el reporte. Inténtalo de nuevo.");
                  } finally {
                    setIsSubmittingReport(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <h3 className="font-display text-2xl text-[#1f3326]">
                    Reportar perfil de {contactName}
                  </h3>
                  <p className="mt-1 text-xs text-[#6d5b43]">
                    Ayúdanos a mantener la confianza del ecosistema. Revisamos con rigor cada
                    reporte de forma manual.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.08em] text-[#342b22] block">
                    Motivo del reporte *
                  </label>
                  <div className="space-y-2">
                    {[
                      "Información incorrecta o desactualizada",
                      "No responde a solicitudes de contacto",
                      "Dudas sobre la titulación o veracidad del perfil",
                      "Comportamiento inadecuado o no profesional",
                      "Otro motivo",
                    ].map((reason) => (
                      <label
                        key={reason}
                        className="flex cursor-pointer items-start gap-2.5 rounded-2xl border border-[#eadfce]/60 bg-white/50 p-3 text-xs text-[#342b22] hover:bg-white transition-all"
                      >
                        <input
                          type="radio"
                          name="reportReason"
                          value={reason}
                          checked={reportReason === reason}
                          onChange={(e) => setReportReason(e.target.value)}
                          className="mt-0.5 accent-[#526046]"
                          required
                        />
                        <span className="ml-2">{reason}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-[0.08em] text-[#342b22] block">
                    Detalles o comentarios adicionales
                  </label>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Describe detalladamente lo ocurrido o la información inexacta..."
                    className="w-full min-h-[90px] rounded-2xl border border-[#eadfce] bg-white p-3 text-xs text-[#342b22] placeholder:text-[#dfcfbd] focus:border-[#526046] focus:outline-none focus:ring-1 focus:ring-[#526046]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-[0.08em] text-[#342b22] block">
                    Tu dirección de email (opcional)
                  </label>
                  <input
                    type="email"
                    value={reportEmail}
                    onChange={(e) => setReportEmail(e.target.value)}
                    placeholder="Para contactarte en caso de requerir aclaraciones..."
                    className="w-full rounded-2xl border border-[#eadfce] bg-white p-3 text-xs text-[#342b22] placeholder:text-[#dfcfbd] focus:border-[#526046] focus:outline-none focus:ring-1 focus:ring-[#526046]"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 rounded-2xl border border-[#eadfce] bg-white py-3 text-xs font-semibold text-[#8c7a66] hover:bg-[#fff9f1] active:scale-95 transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReport || !reportReason}
                    className="flex-1 rounded-2xl bg-[#526046] py-3 text-xs font-semibold text-white hover:bg-[#434f37] disabled:opacity-50 disabled:pointer-events-none active:scale-95 transition-all shadow-md shadow-[#526046]/10 cursor-pointer"
                  >
                    {isSubmittingReport ? "Enviando..." : "Enviar reporte"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-6 text-center space-y-4">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#eef5eb] text-[#526046]">
                  <Check className="h-8 w-8" strokeWidth={2.5} />
                </span>
                <div className="space-y-2">
                  <h3 className="font-display text-2xl text-[#1f3326]">
                    ¡Reporte recibido con éxito!
                  </h3>
                  <p className="text-sm text-[#5d5144] max-w-sm mx-auto leading-relaxed">
                    Muchas gracias por colaborar. Revisaremos este perfil manualmente en un plazo
                    máximo de 48 horas y tomaremos las acciones pertinentes.
                  </p>
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="min-w-40 rounded-2xl bg-[#526046] py-3 px-6 text-xs font-semibold text-white hover:bg-[#434f37] active:scale-95 transition-all cursor-pointer"
                  >
                    Cerrar ventana
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
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
    phone?: string | null;
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
      {(data.whatsapp || data.phone) && (
        <Button
          asChild
          variant="outline"
          className="rounded-full border-[#9d8d76] bg-white/45 px-7 text-[#342b22] hover:bg-white"
        >
          <a
            href={whatsappHref(data.whatsapp || data.phone || "", contactName)}
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
  if (municipality?.slug) {
    const fallback = MUNICIPALITY_COORDINATES[municipality.slug.toLowerCase()];
    if (fallback) return fallback;
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
