import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  ChevronDown,
  Building2,
  GripVertical,
  Heart,
  Home,
  Leaf,
  Lock,
  MapPin,
  Monitor,
  Plus,
  Search,
  ShieldCheck,
  Upload,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useMemo, useState, useRef } from "react";
import { toast } from "sonner";

import heroImg from "@/assets/hero-branch.jpg";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { stampOrganisationSubmission } from "@/lib/organisation-onboarding";
import { notifyAdminOfProfessionalRequest } from "@/lib/professional-verification";
import {
  getOnboardingPlanConfig,
  resolveOnboardingPlan,
  resolveOnboardingPlanSlug,
  type OnboardingPlan,
} from "@/lib/onboarding-flow";
import { onboardingSearchSchema } from "@/lib/route-schemas";

type MunicipalityRow = Database["public"]["Tables"]["municipalities"]["Row"];
type TherapyRow = Database["public"]["Tables"]["therapies"]["Row"];
type HelpAreaRow = Database["public"]["Tables"]["help_areas"]["Row"];
type PlanRow = Database["public"]["Tables"]["plans"]["Row"];

type WizardStep = 1 | 2 | 3 | 4 | 5;

type LocationDraft = {
  centerName: string;
  address: string;
  municipalityId: string;
};

type TeamMemberDraft = {
  name: string;
  role: string;
  photoFile: File | null;
};

type FormationDraft = {
  formation: string;
  school: string;
  year: string;
};

type WizardDraft = {
  firstName: string;
  lastName: string;
  professionalName: string;
  email: string;
  phone: string;
  whatsapp: string;
  organizationName: string;
  municipalityId: string;
  organizationType: string;
  therapyIds: string[];
  helpAreaIds: string[];
  targetAudience: string[];
  accompanimentModalities: string[];
  organizationPublicAudience: string[];
  organizationActivities: string[];
  sessionModalities: string[];
  homeVisitRadius: string;
  presentationText: string;
  approachText: string;
  differentiatorText: string;
  missionText: string;
  facilities: string[];
  tagline: string;
  languages: string[];
  website: string;
  instagramUrl: string;
  facebookUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  calendlyUrl: string;
  freshaUrl: string;
  whatsappBusinessUrl: string;
  otherBookingUrl: string;
  showWhatsappPublic: boolean;
  showEmailPublic: boolean;
  hasLiabilityInsurance: boolean;
  acceptedDeontologicalCode: boolean;
  acceptedTruthfulness: boolean;
  acceptedPrivacyPolicy: boolean;
  acceptedTermsOfUse: boolean;
  acceptedPublication: boolean;
  declaresLegalAuthority: boolean;
  legalEntityName: string;
  legalEntityTaxId: string;
  responsibleFirstName: string;
  responsibleLastName: string;
  responsibleRole: string;
  responsibleEmail: string;
  responsiblePhone: string;
  signatureName: string;
  locations: LocationDraft[];
  formations: FormationDraft[];
  teamMembers: TeamMemberDraft[];
};

type CatalogItem = {
  id: string;
  name: string;
};

type PlanChoice = "presencia" | "profesional" | "centros-organizadores";

const islandName = "Mallorca";

const freeTargetAudienceOptions = [
  "Mujeres",
  "Hombres",
  "Adultos",
  "Adolescentes",
  "Niños",
  "Personas mayores",
  "Parejas",
  "Familias",
  "Embarazo y maternidad",
  "Personas neurodivergentes",
  "Animales",
  "Empresas y equipos",
];

const accompanimentOptions = [
  "Sesiones Individuales",
  "Sesiones de Pareja",
  "Sesiones Familiares",
  "Sesiones Grupales",
  "Talleres",
  "Cursos y Formaciones",
  "Retiros",
  "Empresas y Organizaciones",
  "Charlas y Conferencias",
  "Eventos y Encuentros",
  "Otro (especificar)",
];

const sessionModalityOptions = [
  "Presencial en consulta",
  "Online (videollamada)",
  "A distancia",
  "Presencial a domicilio",
];

const homeVisitRadiusOptions = ["10 km", "20 km", "30 km", "Toda la isla", "Consultar"];

const professionalLanguages = ["Español", "Inglés", "Francés", "Alemán", "Catalán", "Otro"];

const planSearchValues: PlanChoice[] = ["presencia", "profesional", "centros-organizadores"];

function createInitialDraft(): WizardDraft {
  return {
    firstName: "",
    lastName: "",
    professionalName: "",
    organizationName: "",
    email: "",
    phone: "",
    whatsapp: "",
    municipalityId: "",
    organizationType: "",
    therapyIds: [],
    helpAreaIds: [],
    targetAudience: [],
    accompanimentModalities: [],
    organizationPublicAudience: [],
    organizationActivities: [],
    sessionModalities: [],
    homeVisitRadius: "",
    presentationText: "",
    approachText: "",
    differentiatorText: "",
    missionText: "",
    facilities: [],
    tagline: "",
    languages: ["Español"],
    website: "",
    instagramUrl: "",
    facebookUrl: "",
    linkedinUrl: "",
    youtubeUrl: "",
    calendlyUrl: "",
    freshaUrl: "",
    whatsappBusinessUrl: "",
    otherBookingUrl: "",
    showWhatsappPublic: false,
    showEmailPublic: false,
    hasLiabilityInsurance: false,
    acceptedDeontologicalCode: false,
    acceptedTruthfulness: false,
    acceptedPrivacyPolicy: false,
    acceptedTermsOfUse: false,
    acceptedPublication: false,
    declaresLegalAuthority: false,
    legalEntityName: "",
    legalEntityTaxId: "",
    responsibleFirstName: "",
    responsibleLastName: "",
    responsibleRole: "",
    responsibleEmail: "",
    responsiblePhone: "",
    signatureName: "",
    locations: [{ centerName: "", address: "", municipalityId: "" }],
    formations: [{ formation: "", school: "", year: "" }],
    teamMembers: [{ name: "", role: "", photoFile: null }],
  };
}

export const Route = createFileRoute("/onboarding")({
  validateSearch: onboardingSearchSchema,
  head: () => ({
    meta: [{ title: "Crear ficha profesional — Mallorca Holística" }],
  }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [step, setStep] = useState<WizardStep>(1);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [municipalities, setMunicipalities] = useState<MunicipalityRow[]>([]);
  const [therapies, setTherapies] = useState<TherapyRow[]>([]);
  const [helpAreas, setHelpAreas] = useState<HelpAreaRow[]>([]);
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [currentTherapistSlug, setCurrentTherapistSlug] = useState<string | null>(null);
  const [selectedPlanSlug, setSelectedPlanSlug] = useState<PlanChoice>("profesional");
  const [wizardPlan, setWizardPlan] = useState<OnboardingPlan>("profesional");
  const [loadedPhotoUrl, setLoadedPhotoUrl] = useState<string | null>(null);
  const [loadedLogoUrl, setLoadedLogoUrl] = useState<string | null>(null);
  const [loadedCenterId, setLoadedCenterId] = useState<string | null>(null);
  const [loadedStatus, setLoadedStatus] = useState<string>("draft");
  const [draft, setDraft] = useState<WizardDraft>(createInitialDraft());
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [diplomaFile, setDiplomaFile] = useState<File | null>(null);
  const [extraDocuments, setExtraDocuments] = useState<File[]>([]);
  const [therapySearch, setTherapySearch] = useState("");
  const [helpAreaSearch, setHelpAreaSearch] = useState("");
  const [draggedTherapyIndex, setDraggedTherapyIndex] = useState<number | null>(null);
  const [draggedHelpAreaIndex, setDraggedHelpAreaIndex] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!currentUser) {
        navigate({ to: "/login" });
        return;
      }

      setUser(currentUser);
      setDraft((current) => ({
        ...current,
        email: currentUser.email ?? current.email,
      }));

      let currentTherapistLookup: {
        slug: string;
        pending_plan_slug: string | null;
        plan_id: string | null;
        full_name: string;
        professional_name: string | null;
        email: string | null;
        phone: string | null;
        whatsapp: string | null;
        municipality_id: string | null;
        headline: string | null;
        frase_clave: string | null;
        sobre_mi: string | null;
        approach_text: string | null;
        differentiator_text: string | null;
        mission_text: string | null;
        organisation_type: string | null;
        website: string | null;
        instagram_url: string | null;
        facebook_url: string | null;
        linkedin_url: string | null;
        youtube_url: string | null;
        calendly_url: string | null;
        fresha_url: string | null;
        whatsapp_business_url: string | null;
        other_booking_url: string | null;
        show_whatsapp_public: boolean | null;
        show_email_public: boolean | null;
        has_liability_insurance: boolean | null;
        accepted_deontological_code: boolean | null;
        accepted_truthfulness: boolean | null;
        accepted_privacy_policy: boolean | null;
        accepted_terms_of_use: boolean | null;
        accepted_publication: boolean | null;
        declares_legal_authority: boolean | null;
        target_audience: string[] | null;
        accompaniment_modalities: string[] | null;
        session_modalities: string[] | null;
        home_visit_radius: string | null;
        languages: string[] | null;
        gallery_urls: string[] | null;
        team_members: unknown[] | null;
        responsible_first_name: string | null;
        responsible_last_name: string | null;
        responsible_role: string | null;
        responsible_email: string | null;
        responsible_phone: string | null;
        legal_entity_name: string | null;
        legal_entity_tax_id: string | null;
        organization_signature_name: string | null;
        therapist_therapies?: Array<{ therapy_id: string }> | null;
        therapist_help_areas?: Array<{ help_area_id: string }> | null;
        plans?: { slug: string | null } | null;
        photo_url?: string | null;
        logo_url?: string | null;
        center_id?: string | null;
        status?: string | null;
      } | null = null;

      const { data: therapist } = await supabase
        .from("therapists")
        .select(
          "id, slug, pending_plan_slug, plan_id, full_name, professional_name, email, phone, whatsapp, municipality_id, center_name, address, headline, frase_clave, sobre_mi, approach_text, differentiator_text, mission_text, organisation_type, website, instagram_url, facebook_url, linkedin_url, youtube_url, calendly_url, fresha_url, whatsapp_business_url, other_booking_url, show_whatsapp_public, show_email_public, has_liability_insurance, accepted_deontological_code, accepted_truthfulness, accepted_privacy_policy, accepted_terms_of_use, accepted_publication, declares_legal_authority, target_audience, accompaniment_modalities, session_modalities, home_visit_radius, languages, facilities, gallery_urls, team_members, responsible_first_name, responsible_last_name, responsible_role, responsible_email, responsible_phone, legal_entity_name, legal_entity_tax_id, organization_signature_name, status, photo_url, logo_url, center_id, therapist_therapies(therapy_id), therapist_help_areas(help_area_id), plans!therapists_plan_id_fkey(slug)",
        )
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (!active) return;

      if (therapist) {
        currentTherapistLookup = therapist as NonNullable<typeof currentTherapistLookup>;

        setCurrentTherapistSlug(currentTherapistLookup.slug);
        setLoadedPhotoUrl(currentTherapistLookup.photo_url ?? null);
        setLoadedLogoUrl(currentTherapistLookup.logo_url ?? null);
        setLoadedStatus(currentTherapistLookup.status ?? "draft");
        if (currentTherapistLookup.center_id) {
          setLoadedCenterId(currentTherapistLookup.center_id);
        }
        setDraft((current) => ({
          ...current,
          firstName: currentTherapistLookup.full_name.split(" ")[0] ?? current.firstName,
          lastName:
            currentTherapistLookup.full_name.split(" ").slice(1).join(" ") || current.lastName,
          professionalName: currentTherapistLookup.professional_name ?? current.professionalName,
          organizationName: currentTherapistLookup.full_name ?? current.organizationName,
          organizationType: currentTherapistLookup.organisation_type ?? current.organizationType,
          email: currentTherapistLookup.email ?? current.email,
          phone: currentTherapistLookup.phone ?? current.phone,
          whatsapp: currentTherapistLookup.whatsapp ?? current.whatsapp,
          municipalityId: currentTherapistLookup.municipality_id ?? current.municipalityId,
          presentationText: currentTherapistLookup.sobre_mi ?? current.presentationText,
          approachText: currentTherapistLookup.approach_text ?? current.approachText,
          differentiatorText:
            currentTherapistLookup.differentiator_text ?? current.differentiatorText,
          tagline:
            currentTherapistLookup.headline ??
            currentTherapistLookup.frase_clave ??
            current.tagline,
          website: currentTherapistLookup.website ?? current.website,
          instagramUrl: currentTherapistLookup.instagram_url ?? current.instagramUrl,
          facebookUrl: currentTherapistLookup.facebook_url ?? current.facebookUrl,
          linkedinUrl: currentTherapistLookup.linkedin_url ?? current.linkedinUrl,
          youtubeUrl: currentTherapistLookup.youtube_url ?? current.youtubeUrl,
          calendlyUrl: currentTherapistLookup.calendly_url ?? current.calendlyUrl,
          freshaUrl: currentTherapistLookup.fresha_url ?? current.freshaUrl,
          whatsappBusinessUrl:
            currentTherapistLookup.whatsapp_business_url ?? current.whatsappBusinessUrl,
          otherBookingUrl: currentTherapistLookup.other_booking_url ?? current.otherBookingUrl,
          showWhatsappPublic:
            currentTherapistLookup.show_whatsapp_public ?? current.showWhatsappPublic,
          showEmailPublic: currentTherapistLookup.show_email_public ?? current.showEmailPublic,
          hasLiabilityInsurance:
            currentTherapistLookup.has_liability_insurance ?? current.hasLiabilityInsurance,
          acceptedDeontologicalCode:
            currentTherapistLookup.accepted_deontological_code ?? current.acceptedDeontologicalCode,
          acceptedTruthfulness:
            currentTherapistLookup.accepted_truthfulness ?? current.acceptedTruthfulness,
          acceptedPrivacyPolicy:
            currentTherapistLookup.accepted_privacy_policy ?? current.acceptedPrivacyPolicy,
          acceptedTermsOfUse:
            currentTherapistLookup.accepted_terms_of_use ?? current.acceptedTermsOfUse,
          acceptedPublication:
            currentTherapistLookup.accepted_publication ?? current.acceptedPublication,
          declaresLegalAuthority:
            currentTherapistLookup.declares_legal_authority ?? current.declaresLegalAuthority,
          targetAudience: currentTherapistLookup.target_audience ?? current.targetAudience,
          accompanimentModalities:
            currentTherapistLookup.accompaniment_modalities ?? current.accompanimentModalities,
          organizationPublicAudience:
            currentTherapistLookup.target_audience ?? current.organizationPublicAudience,
          organizationActivities:
            currentTherapistLookup.accompaniment_modalities ?? current.organizationActivities,
          sessionModalities: currentTherapistLookup.session_modalities ?? current.sessionModalities,
          homeVisitRadius: currentTherapistLookup.home_visit_radius ?? current.homeVisitRadius,
          languages: currentTherapistLookup.languages?.length
            ? currentTherapistLookup.languages
            : current.languages,
          facilities: currentTherapistLookup.facilities?.length
            ? currentTherapistLookup.facilities
            : current.facilities,
          responsibleFirstName:
            currentTherapistLookup.responsible_first_name ?? current.responsibleFirstName,
          responsibleLastName:
            currentTherapistLookup.responsible_last_name ?? current.responsibleLastName,
          responsibleRole: currentTherapistLookup.responsible_role ?? current.responsibleRole,
          responsibleEmail: currentTherapistLookup.responsible_email ?? current.responsibleEmail,
          responsiblePhone: currentTherapistLookup.responsible_phone ?? current.responsiblePhone,
          legalEntityName: currentTherapistLookup.legal_entity_name ?? current.legalEntityName,
          legalEntityTaxId: currentTherapistLookup.legal_entity_tax_id ?? current.legalEntityTaxId,
          signatureName:
            currentTherapistLookup.organization_signature_name ?? current.signatureName,
          missionText: currentTherapistLookup.mission_text ?? current.missionText,
          teamMembers: Array.isArray(currentTherapistLookup.team_members)
            ? currentTherapistLookup.team_members.map((item) => ({
                name:
                  typeof (item as { name?: unknown }).name === "string"
                    ? ((item as { name?: string }).name ?? "")
                    : "",
                role:
                  typeof (item as { role?: unknown }).role === "string"
                    ? ((item as { role?: string }).role ?? "")
                    : "",
                photoFile: null,
              }))
            : current.teamMembers,
          therapyIds:
            (currentTherapistLookup.therapist_therapies ?? []).map(
              (relation) => relation.therapy_id,
            ) ?? current.therapyIds,
          helpAreaIds:
            (currentTherapistLookup.therapist_help_areas ?? []).map(
              (relation) => relation.help_area_id,
            ) ?? current.helpAreaIds,
        }));
      } else if (currentUser.user_metadata?.display_name) {
        const [firstName, ...rest] = String(currentUser.user_metadata.display_name)
          .trim()
          .split(/\s+/);
        setDraft((current) => ({
          ...current,
          firstName: current.firstName || firstName || "",
          lastName: current.lastName || rest.join(" "),
        }));
      }

      await loadCatalogs();

      // Load user centers to prepopulate locations
      const { data: userCenters } = await supabase
        .from("centers")
        .select("*")
        .eq("owner_user_id", currentUser.id);

      if (!active) return;

      if (userCenters && userCenters.length > 0) {
        const mappedLocations = userCenters.map((c) => ({
          centerName: c.name || "",
          address: c.address || "",
          municipalityId: c.municipality_id || "",
        }));
        setDraft((current) => ({
          ...current,
          locations: mappedLocations,
        }));
        if (therapist?.center_id) {
          setLoadedCenterId(therapist.center_id);
        } else {
          setLoadedCenterId(userCenters[0].id);
        }
      }

      // Restore furthest onboarding step from metadata
      const cachedStep = currentUser.user_metadata?.furthest_onboarding_step;
      if (cachedStep && cachedStep >= 1 && cachedStep <= 5) {
        setStep(cachedStep as WizardStep);
      }

      const source = {
        searchPlan: normalizePlanChoice(search.plan),
        metadataPlan: normalizePlanChoice(currentUser.user_metadata?.selected_plan),
        profilePlanSlug: normalizePlanChoice(currentTherapistLookup?.plans?.slug),
        pendingPlanSlug: normalizePlanChoice(currentTherapistLookup?.pending_plan_slug),
      };

      setSelectedPlanSlug(resolveOnboardingPlanSlug(source) as PlanChoice);
      setWizardPlan(resolveOnboardingPlan(source));

      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [navigate, search.plan]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const config = useMemo(() => getOnboardingPlanConfig(wizardPlan), [wizardPlan]);
  const selectedTherapies = useMemo(
    () =>
      draft.therapyIds
        .map((id) => therapies.find((item) => item.id === id))
        .filter(Boolean) as TherapyRow[],
    [draft.therapyIds, therapies],
  );
  const selectedHelpAreas = useMemo(
    () =>
      draft.helpAreaIds
        .map((id) => helpAreas.find((item) => item.id === id))
        .filter(Boolean) as HelpAreaRow[],
    [draft.helpAreaIds, helpAreas],
  );
  const sortedMunicipalities = useMemo(
    () => [...municipalities].sort((a, b) => a.name.localeCompare(b.name, "es")),
    [municipalities],
  );
  const sortedTherapies = useMemo(
    () => [...therapies].sort((a, b) => a.name.localeCompare(b.name, "es")),
    [therapies],
  );
  const sortedHelpAreas = useMemo(
    () => [...helpAreas].sort((a, b) => a.name.localeCompare(b.name, "es")),
    [helpAreas],
  );
  const planLabel = config.label;
  const mainLocation = draft.locations[0] ?? { centerName: "", address: "", municipalityId: "" };

  if (loading || !user) {
    return (
      <PageShell>
        <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-6 text-sm text-muted-foreground">
          Preparando tu formulario...
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <form onSubmit={handleSubmit} className="bg-[#fff9f1]">
        <section className="mx-auto max-w-[1180px] px-6 pb-8 pt-10 text-center md:px-10">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-[#dfcfbd] bg-white px-4 py-2 text-xs font-medium text-[#5a4c3e]">
            <ShieldCheck className="h-4 w-4" />
            Plan {planLabel}
          </div>
          <h1 className="font-display text-4xl text-[#11100e] md:text-5xl">
            {config.isOrganisation ? "Crear mi ficha de centro" : "Crear mi ficha profesional"}
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-[#342b22]">
            {config.isOrganisation
              ? "Te acompañamos paso a paso para construir la presencia de tu organización con orden, claridad y calidez."
              : config.isProfessional
                ? "Te acompañamos paso a paso para construir un perfil más completo, con varias ubicaciones y más detalle profesional."
                : "Te acompañamos paso a paso para crear una presencia clara, cálida y bien organizada."}
          </p>
          <WizardProgress step={step} isProfessional={config.isProfessional} />
        </section>

        <section className="mx-auto grid max-w-[1180px] gap-8 px-6 pb-10 md:px-10 lg:grid-cols-[1fr_300px]">
          <div className="rounded-[1.6rem] border border-[#eadfce] bg-white/78 p-6 shadow-[0_18px_60px_rgba(96,68,31,0.08)] md:p-8">
            {step === 1 && (
              <StepShell
                icon={config.isOrganisation ? Building2 : User}
                title="1. Información general"
                intro={
                  config.isOrganisation
                    ? "Empezamos por los datos principales de la organización."
                    : "Primero necesitamos conocerte un poco mejor."
                }
              >
                {config.isOrganisation ? (
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Nombre de la organización *">
                      <Input
                        value={draft.organizationName}
                        onChange={(event) =>
                          updateDraft(setDraft, { organizationName: event.target.value })
                        }
                        placeholder="Ej: Espacio Holístico Mallorca"
                        required
                      />
                    </Field>
                    <Field label="Nombre comercial (opcional)">
                      <Input
                        value={draft.professionalName}
                        onChange={(event) =>
                          updateDraft(setDraft, { professionalName: event.target.value })
                        }
                        placeholder="Ej: Espacio Mallorca Holística"
                      />
                    </Field>
                    <Field label="Tipo de organización *">
                      <div className="grid gap-2 md:grid-cols-2">
                        {[
                          "Centro Holístico",
                          "Escuela o Centro de Formación",
                          "Asociación",
                          "Cooperativa",
                          "Clínica Integrativa",
                          "Organizador de Eventos",
                          "Organizador de Retiros",
                          "Espacio de Bienestar",
                          "Empresa relacionada con el bienestar",
                          "Otro",
                        ].map((option) => {
                          const selected = draft.organizationType === option;
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => updateDraft(setDraft, { organizationType: option })}
                              className={`rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
                                selected
                                  ? "border-[#526046] bg-[#f4ede6] text-[#1f1c18]"
                                  : "border-[#eadfce] bg-white text-[#342b22] hover:bg-[#fffaf4]"
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </Field>
                    <Field label="Municipio principal *">
                      <MunicipalitySelect
                        value={draft.municipalityId}
                        municipalities={sortedMunicipalities}
                        onChange={(value) => updateDraft(setDraft, { municipalityId: value })}
                      />
                    </Field>
                    <Field label="Isla">
                      <ReadOnlyPill>{islandName}</ReadOnlyPill>
                    </Field>
                    <Field label="Correo electrónico *">
                      <Input
                        type="email"
                        value={draft.email}
                        onChange={(event) => updateDraft(setDraft, { email: event.target.value })}
                        autoComplete="email"
                        required
                      />
                    </Field>
                    <Field label="Teléfono">
                      <Input
                        value={draft.phone}
                        onChange={(event) => updateDraft(setDraft, { phone: event.target.value })}
                        autoComplete="tel"
                      />
                    </Field>
                    <Field label="WhatsApp *">
                      <Input
                        value={draft.whatsapp}
                        onChange={(event) =>
                          updateDraft(setDraft, { whatsapp: event.target.value })
                        }
                        autoComplete="tel"
                        placeholder="Número de WhatsApp para contacto"
                        required
                      />
                    </Field>
                    <Field label="Logo *">
                      <UploadBox
                        file={logoFile}
                        label="Subir logo"
                        accept="image/*"
                        onChange={setLogoFile}
                        showCircularPreview={true}
                        initialPreviewUrl={loadedLogoUrl || undefined}
                      />
                    </Field>
                    <Field label="Imagen principal">
                      <UploadBox
                        file={photoFile}
                        label="Subir imagen principal"
                        accept="image/*"
                        onChange={setPhotoFile}
                        showCircularPreview={true}
                        initialPreviewUrl={loadedPhotoUrl || undefined}
                      />
                    </Field>
                  </div>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Nombre *">
                      <Input
                        value={draft.firstName}
                        onChange={(event) =>
                          updateDraft(setDraft, { firstName: event.target.value })
                        }
                        autoComplete="given-name"
                        required
                      />
                    </Field>
                    <Field label="Apellidos *">
                      <Input
                        value={draft.lastName}
                        onChange={(event) =>
                          updateDraft(setDraft, { lastName: event.target.value })
                        }
                        autoComplete="family-name"
                        required
                      />
                    </Field>
                    <Field label="Nombre profesional (opcional)">
                      <Input
                        value={draft.professionalName}
                        onChange={(event) =>
                          updateDraft(setDraft, { professionalName: event.target.value })
                        }
                        placeholder="Ej: Alma Holística"
                      />
                    </Field>
                    <Field label="Municipio principal *">
                      <MunicipalitySelect
                        value={draft.municipalityId}
                        municipalities={sortedMunicipalities}
                        onChange={(value) => updateDraft(setDraft, { municipalityId: value })}
                      />
                    </Field>
                    <Field label="Isla">
                      <ReadOnlyPill>{islandName}</ReadOnlyPill>
                    </Field>
                    <Field label="Correo electrónico *">
                      <Input
                        type="email"
                        value={draft.email}
                        onChange={(event) => updateDraft(setDraft, { email: event.target.value })}
                        autoComplete="email"
                        required
                      />
                    </Field>
                    <Field label="Teléfono">
                      <Input
                        value={draft.phone}
                        onChange={(event) => updateDraft(setDraft, { phone: event.target.value })}
                        autoComplete="tel"
                      />
                    </Field>
                    <Field label="WhatsApp *">
                      <Input
                        value={draft.whatsapp}
                        onChange={(event) =>
                          updateDraft(setDraft, { whatsapp: event.target.value })
                        }
                        autoComplete="tel"
                        placeholder="Número de WhatsApp para contacto"
                        required
                      />
                    </Field>
                    <Field label="Foto principal">
                      <UploadBox
                        file={photoFile}
                        label="Subir foto"
                        accept="image/*"
                        onChange={setPhotoFile}
                        showCircularPreview={true}
                        initialPreviewUrl={loadedPhotoUrl || undefined}
                      />
                    </Field>
                    {config.logoEnabled && (
                      <Field label="Logo profesional (opcional)">
                        <UploadBox
                          file={logoFile}
                          label="Subir logo"
                          accept="image/*"
                          onChange={setLogoFile}
                          showCircularPreview={true}
                          initialPreviewUrl={loadedLogoUrl || undefined}
                        />
                      </Field>
                    )}
                  </div>
                )}
              </StepShell>
            )}

            {step === 2 && (
              <StepShell
                icon={Heart}
                title="2. Actividad"
                intro={
                  config.isOrganisation
                    ? "Selecciona las áreas y servicios que ofrece tu organización."
                    : "Selecciona las terapias, áreas y públicos con los que trabajas."
                }
              >
                <CatalogPicker
                  title={
                    config.isOrganisation
                      ? "Especialidades y servicios"
                      : "Specialidades y terapias"
                  }
                  description={
                    config.isOrganisation
                      ? "Busca todos los servicios y especialidades que ofrece la organización."
                      : config.isProfessional
                        ? "Busca tus terapias principales. En el plan Profesional no hay límite."
                        : "Busca tus terapias principales. En el plan Free puedes seleccionar hasta 3."
                  }
                  placeholder="Buscar una terapia o servicio..."
                  items={sortedTherapies}
                  selectedIds={draft.therapyIds}
                  maxSelection={config.therapyCap}
                  search={therapySearch}
                  onSearchChange={setTherapySearch}
                  onChange={(values) => updateDraft(setDraft, { therapyIds: values })}
                  helperText={
                    config.isOrganisation || config.isProfessional
                      ? "Selección libre."
                      : "Plan Free: máximo 3 terapias."
                  }
                  draggedIndex={draggedTherapyIndex}
                  onDragIndexChange={setDraggedTherapyIndex}
                />

                <CatalogPicker
                  title={config.isOrganisation ? "Áreas de ayuda" : "Áreas de especialización"}
                  description={
                    config.isOrganisation
                      ? "Añade todas las áreas que aborda la organización."
                      : config.isProfessional
                        ? "Añade todas las áreas en las que acompañas."
                        : "Añade las áreas en las que más acompañas. En Free puedes seleccionar hasta 5."
                  }
                  placeholder="Buscar un área..."
                  items={sortedHelpAreas}
                  selectedIds={draft.helpAreaIds}
                  maxSelection={config.helpAreaCap}
                  search={helpAreaSearch}
                  onSearchChange={setHelpAreaSearch}
                  onChange={(values) => updateDraft(setDraft, { helpAreaIds: values })}
                  helperText={
                    config.isOrganisation || config.isProfessional
                      ? "Selección libre."
                      : "Plan Free: máximo 5 áreas."
                  }
                  draggedIndex={draggedHelpAreaIndex}
                  onDragIndexChange={setDraggedHelpAreaIndex}
                />

                <CheckboxGrid
                  title={config.isOrganisation ? "Público" : "Público al que acompañas"}
                  description={
                    config.isOrganisation
                      ? "Marca los públicos a los que se dirige la organización."
                      : "Marca todos los públicos que forman parte de tu práctica."
                  }
                  items={
                    config.isOrganisation
                      ? [
                          "Mujeres",
                          "Hombres",
                          "Adultos",
                          "Adolescentes",
                          "Niños",
                          "Personas mayores",
                          "Familias",
                          "Parejas",
                          "Empresas",
                          "Personas neurodivergentes",
                        ]
                      : freeTargetAudienceOptions
                  }
                  values={
                    config.isOrganisation ? draft.organizationPublicAudience : draft.targetAudience
                  }
                  onChange={(values) => {
                    if (config.isOrganisation) {
                      updateDraft(setDraft, { organizationPublicAudience: values });
                    } else {
                      updateDraft(setDraft, { targetAudience: values });
                    }
                  }}
                  columns="md:grid-cols-2 lg:grid-cols-3"
                />

                <CheckboxGrid
                  title={
                    config.isOrganisation
                      ? "Actividades organizadas"
                      : "Modalidades de acompañamiento"
                  }
                  description={
                    config.isOrganisation
                      ? "Selecciona las actividades, eventos y formatos que organizas."
                      : "Selecciona los formatos en los que ofreces tu trabajo."
                  }
                  items={
                    config.isOrganisation
                      ? [
                          "Talleres",
                          "Cursos",
                          "Formaciones",
                          "Eventos",
                          "Conferencias",
                          "Retiros",
                          "Encuentros",
                          "Actividades recurrentes",
                          "Otro",
                        ]
                      : accompanimentOptions
                  }
                  values={
                    config.isOrganisation
                      ? draft.organizationActivities
                      : draft.accompanimentModalities
                  }
                  onChange={(values) => {
                    if (config.isOrganisation) {
                      updateDraft(setDraft, { organizationActivities: values });
                    } else {
                      updateDraft(setDraft, { accompanimentModalities: values });
                    }
                  }}
                  columns="md:grid-cols-2 lg:grid-cols-3"
                />
              </StepShell>
            )}

            {step === 3 && (
              <StepShell
                icon={Award}
                title="3. Centro y ubicaciones"
                intro={
                  config.isOrganisation
                    ? "Ordenamos la sede principal y, si lo necesitas, otras ubicaciones."
                    : "Definimos cómo ofreces tus sesiones y dónde atiendes."
                }
              >
                {!config.isOrganisation && (
                  <CheckboxGrid
                    title="Modalidades de sesión"
                    description="Puedes ofrecer una o varias formas de atención."
                    items={sessionModalityOptions}
                    values={draft.sessionModalities}
                    onChange={(values) => updateDraft(setDraft, { sessionModalities: values })}
                    columns="md:grid-cols-2"
                    helperByItem={{
                      "A distancia":
                        "A distancia significa acompañamiento remoto, sin videollamada ni presencia física.",
                    }}
                  />
                )}

                {!config.isOrganisation &&
                  draft.sessionModalities.includes("Presencial a domicilio") && (
                    <Field label="Radio de desplazamiento">
                      <div className="grid gap-3 md:grid-cols-5">
                        {homeVisitRadiusOptions.map((option) => {
                          const selected = draft.homeVisitRadius === option;
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => updateDraft(setDraft, { homeVisitRadius: option })}
                              className={`rounded-2xl border px-4 py-3 text-sm transition-colors ${
                                selected
                                  ? "border-[#526046] bg-[#f4ede6] text-[#1f1c18]"
                                  : "border-[#eadfce] bg-white text-[#342b22] hover:bg-[#fffaf4]"
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </Field>
                  )}

                <div className="space-y-4">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <h4 className="font-display text-lg text-[#11100e]">Ubicaciones</h4>
                      <p className="text-sm text-[#6d5b43]">
                        {config.isOrganisation
                          ? "Puedes añadir todas las ubicaciones que necesite la organización."
                          : config.isProfessional
                            ? "Añade la ubicación principal y, si lo necesitas, una o varias consultas más."
                            : "El plan Free incluye una única ubicación."}
                      </p>
                    </div>
                    {config.extraLocationEnabled &&
                      (config.locationLimit === null ||
                        draft.locations.length < config.locationLimit) && (
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-full"
                          onClick={() =>
                            updateDraft(setDraft, {
                              locations: [
                                ...draft.locations,
                                { centerName: "", address: "", municipalityId: "" },
                              ],
                            })
                          }
                        >
                          <Plus className="h-4 w-4" />{" "}
                          {config.isOrganisation ? "Añadir otra ubicación" : "Añadir otra consulta"}
                        </Button>
                      )}
                  </div>

                  {draft.locations.map((location, index) => (
                    <div
                      key={index}
                      className="rounded-3xl border border-[#eadfce] bg-[#fffaf4] p-5"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-[#5d5144]">
                          <MapPin className="h-4 w-4" />
                          {index === 0
                            ? config.isOrganisation
                              ? "Ubicación principal"
                              : "Ubicación principal"
                            : config.isOrganisation
                              ? `Ubicación ${index + 1}`
                              : `Consulta ${index + 1}`}
                        </div>
                        {index > 0 && (
                          <button
                            type="button"
                            className="text-xs font-medium text-[#8a6550] hover:underline"
                            onClick={() =>
                              updateDraft(setDraft, {
                                locations: draft.locations.filter(
                                  (_, locationIndex) => locationIndex !== index,
                                ),
                              })
                            }
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                      <div className="grid gap-5 md:grid-cols-2">
                        <Field label={config.slug === "presencia" && index === 0 ? "Nombre del centro (opcional)" : (index === 0 ? "Nombre del centro *" : "Nombre del centro")}>
                          <Input
                            value={location.centerName}
                            onChange={(event) =>
                              updateLocation(setDraft, index, {
                                centerName: event.target.value,
                              })
                            }
                            placeholder="Ej: Espacio Mallorca"
                            required={index === 0 && config.slug !== "presencia"}
                          />
                        </Field>
                        <Field label={config.slug === "presencia" && index === 0 ? "Dirección (opcional)" : (index === 0 ? "Dirección *" : "Dirección")}>
                          <Input
                            value={location.address}
                            onChange={(event) =>
                              updateLocation(setDraft, index, { address: event.target.value })
                            }
                            placeholder="Calle, número, referencia..."
                            required={index === 0 && config.slug !== "presencia"}
                          />
                        </Field>
                        <Field label="Municipio *">
                          <MunicipalitySelect
                            value={location.municipalityId}
                            municipalities={sortedMunicipalities}
                            onChange={(value) =>
                              updateLocation(setDraft, index, { municipalityId: value })
                            }
                          />
                        </Field>
                        <Field label="Isla">
                          <ReadOnlyPill>{islandName}</ReadOnlyPill>
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>

                {config.isOrganisation && (
                  <>
                    <CheckboxGrid
                      title="Instalaciones"
                      description="Marca los recursos e instalaciones disponibles en la organización."
                      items={[
                        "Salas de terapia",
                        "Salas de formación",
                        "Espacios para eventos",
                        "Jardín",
                        "Alojamiento",
                        "Restaurante",
                        "Cafetería",
                        "Otro",
                      ]}
                      values={draft.facilities}
                      onChange={(values) => updateDraft(setDraft, { facilities: values })}
                      columns="md:grid-cols-2 lg:grid-cols-3"
                    />

                    <Field label="Galería de imágenes">
                      <MultiUploadBox
                        files={galleryFiles}
                        onChange={setGalleryFiles}
                        maxFiles={15}
                        label="Subir imágenes de la galería"
                        accept="image/*"
                        helperText="Puedes añadir hasta 15 imágenes."
                        emptyText="Puedes subir hasta 15 imágenes."
                      />
                    </Field>
                  </>
                )}
              </StepShell>
            )}

            {step === 4 && (
              <StepShell
                icon={MapPin}
                title="4. Perfil"
                intro={
                  config.isOrganisation
                    ? "Contamos quién sois y qué queréis transmitir."
                    : "Cuenta brevemente cómo trabajas y qué te distingue."
                }
              >
                <Field label={config.isOrganisation ? "Quiénes somos *" : "Presentación *"}>
                  <div className="space-y-2">
                    <Textarea
                      value={draft.presentationText}
                      onChange={(event) => {
                        const next = event.target.value.slice(0, config.presentationMaxLength || 3000);
                        updateDraft(setDraft, { presentationText: next });
                      }}
                      maxLength={config.presentationMaxLength || 3000}
                      className="min-h-44"
                      placeholder={
                        config.isOrganisation
                          ? "Contad brevemente quiénes sois y qué proponéis."
                          : config.isProfessional
                            ? "Cuéntanos tu recorrido, tu manera de acompañar y cómo se vive una sesión contigo."
                            : "Cuéntanos tu manera de acompañar y qué necesita saber alguien antes de conocerte."
                      }
                      required
                    />
                    <div className="flex items-center justify-between text-xs text-[#6d5b43]">
                      <span>
                        {config.isOrganisation
                          ? "Un texto cálido y claro para presentar la organización."
                          : config.isProfessional
                            ? "Puedes ampliar mucho más tu historia profesional."
                            : "Mantén un tono claro, amable y breve."}
                      </span>
                      <span>
                        {(draft.presentationText || "").length}/{config.presentationMaxLength || 3000}
                      </span>
                    </div>
                  </div>
                </Field>

                <Field label="Frase de presentación *">
                  <div className="space-y-2">
                    <Input
                      value={draft.tagline}
                      onChange={(event) => {
                        const next = event.target.value.slice(0, 120);
                        updateDraft(setDraft, { tagline: next });
                      }}
                      maxLength={120}
                      placeholder="Creamos espacios de bienestar con cercanía y criterio."
                      required
                    />
                    <div className="flex items-center justify-between text-xs text-[#6d5b43]">
                      <span>Ejemplos: “Escucha profunda y acompañamiento amable”.</span>
                      <span>{draft.tagline.length}/120</span>
                    </div>
                  </div>
                </Field>

                {config.isOrganisation ? (
                  <>
                    <Field label="Nuestra misión *">
                      <div className="space-y-2">
                        <Textarea
                          value={draft.missionText}
                          onChange={(event) =>
                            updateDraft(setDraft, {
                              missionText: event.target.value.slice(0, 2000),
                            })
                          }
                          maxLength={2000}
                          className="min-h-40"
                          placeholder="Explica el propósito, la visión y el impacto que buscáis."
                          required
                        />
                        <div className="flex items-center justify-between text-xs text-[#6d5b43]">
                          <span>Máximo 2000 caracteres.</span>
                          <span>{draft.missionText.length}/2000</span>
                        </div>
                      </div>
                    </Field>

                    <Field label="Qué nos diferencia (opcional)">
                      <div className="space-y-2">
                        <Textarea
                          value={draft.differentiatorText}
                          onChange={(event) =>
                            updateDraft(setDraft, {
                              differentiatorText: event.target.value.slice(0, 1000),
                            })
                          }
                          maxLength={1000}
                          className="min-h-32"
                          placeholder="Comparte aquello que os hace especialmente reconocibles."
                        />
                        <div className="flex items-center justify-between text-xs text-[#6d5b43]">
                          <span>Máximo 1000 caracteres.</span>
                          <span>{draft.differentiatorText.length}/1000</span>
                        </div>
                      </div>
                    </Field>

                    <CheckboxGrid
                      title="Idiomas disponibles"
                      description="Selecciona los idiomas en los que la organización puede atender."
                      items={[
                        "Español",
                        "Catalán",
                        "Inglés",
                        "Alemán",
                        "Francés",
                        "Italiano",
                        "Holandés",
                        "Otro",
                      ]}
                      values={draft.languages}
                      onChange={(values) => updateDraft(setDraft, { languages: values })}
                      columns="md:grid-cols-2 lg:grid-cols-3"
                    />

                    <TeamEditor
                      members={draft.teamMembers}
                      onChange={(teamMembers) => updateDraft(setDraft, { teamMembers })}
                    />
                  </>
                ) : (
                  <>
                    <Field label="Mi enfoque *">
                      <div className="space-y-2">
                        <Textarea
                          value={draft.approachText}
                          onChange={(event) => {
                            const next = event.target.value.slice(0, config.approachMaxLength || 2000);
                            updateDraft(setDraft, { approachText: next });
                          }}
                          maxLength={config.approachMaxLength || 2000}
                          className="min-h-40"
                          placeholder="Describe tu enfoque, metodología y el tipo de acompañamiento que ofreces."
                          required
                        />
                        <div className="flex items-center justify-between text-xs text-[#6d5b43]">
                          <span>Máximo {config.approachMaxLength || 2000} caracteres.</span>
                          <span>
                            {(draft.approachText || "").length}/{config.approachMaxLength || 2000}
                          </span>
                        </div>
                      </div>
                    </Field>

                    <Field label="Qué me diferencia (opcional)">
                      <div className="space-y-2">
                        <Textarea
                          value={draft.differentiatorText}
                          onChange={(event) => {
                            const next = event.target.value.slice(
                              0,
                              config.differentiatorMaxLength || 1000,
                            );
                            updateDraft(setDraft, { differentiatorText: next });
                          }}
                          maxLength={config.differentiatorMaxLength || 1000}
                          className="min-h-32"
                          placeholder="Comparte aquello que te hace especialmente reconocible."
                        />
                        <div className="flex items-center justify-between text-xs text-[#6d5b43]">
                          <span>Máximo {config.differentiatorMaxLength || 1000} caracteres.</span>
                          <span>
                            {(draft.differentiatorText || "").length}/{config.differentiatorMaxLength || 1000}
                          </span>
                        </div>
                      </div>
                    </Field>

                    <FormationEditor
                      formations={draft.formations}
                      onChange={(formations) => updateDraft(setDraft, { formations })}
                    />

                    <CheckboxGrid
                      title="Idiomas"
                      description="Selecciona los idiomas en los que puedes atender."
                      items={professionalLanguages}
                      values={draft.languages}
                      onChange={(values) => updateDraft(setDraft, { languages: values })}
                      columns="md:grid-cols-2 lg:grid-cols-3"
                    />
                  </>
                )}
              </StepShell>
            )}

            {step === 5 && (
              <StepShell
                icon={ShieldCheck}
                title={
                  config.isOrganisation
                    ? "5. Redes, verificación y compromisos"
                    : "5. Redes y compromisos"
                }
                intro={
                  config.isOrganisation
                    ? "Terminamos con los datos públicos, la verificación y la firma responsable."
                    : "Revisamos tus datos públicos y las aceptaciones finales."
                }
              >
                {config.isOrganisation ? (
                  <>
                    <div className="grid gap-5 md:grid-cols-2">
                      <Field label="Página web">
                        <Input
                          value={draft.website}
                          onChange={(event) =>
                            updateDraft(setDraft, { website: event.target.value })
                          }
                          placeholder="https://..."
                        />
                      </Field>
                      <Field label="Instagram">
                        <Input
                          value={draft.instagramUrl}
                          onChange={(event) =>
                            updateDraft(setDraft, { instagramUrl: event.target.value })
                          }
                          placeholder="https://instagram.com/..."
                        />
                      </Field>
                      <Field label="Facebook">
                        <Input
                          value={draft.facebookUrl}
                          onChange={(event) =>
                            updateDraft(setDraft, { facebookUrl: event.target.value })
                          }
                          placeholder="https://facebook.com/..."
                        />
                      </Field>
                      <Field label="LinkedIn">
                        <Input
                          value={draft.linkedinUrl}
                          onChange={(event) =>
                            updateDraft(setDraft, { linkedinUrl: event.target.value })
                          }
                          placeholder="https://linkedin.com/..."
                        />
                      </Field>
                      <Field label="YouTube">
                        <Input
                          value={draft.youtubeUrl}
                          onChange={(event) =>
                            updateDraft(setDraft, { youtubeUrl: event.target.value })
                          }
                          placeholder="https://youtube.com/..."
                        />
                      </Field>
                      <Field label="Calendly">
                        <Input
                          value={draft.calendlyUrl}
                          onChange={(event) =>
                            updateDraft(setDraft, { calendlyUrl: event.target.value })
                          }
                          placeholder="https://calendly.com/..."
                        />
                      </Field>
                      <Field label="Otra plataforma">
                        <Input
                          value={draft.otherBookingUrl}
                          onChange={(event) =>
                            updateDraft(setDraft, { otherBookingUrl: event.target.value })
                          }
                          placeholder="https://..."
                        />
                      </Field>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <Field label="Responsable de la organización — Nombre *">
                        <Input
                          value={draft.responsibleFirstName}
                          onChange={(event) =>
                            updateDraft(setDraft, { responsibleFirstName: event.target.value })
                          }
                          required
                        />
                      </Field>
                      <Field label="Apellidos *">
                        <Input
                          value={draft.responsibleLastName}
                          onChange={(event) =>
                            updateDraft(setDraft, { responsibleLastName: event.target.value })
                          }
                          required
                        />
                      </Field>
                      <Field label="Cargo *">
                        <Input
                          value={draft.responsibleRole}
                          onChange={(event) =>
                            updateDraft(setDraft, { responsibleRole: event.target.value })
                          }
                          required
                        />
                      </Field>
                      <Field label="Email *">
                        <Input
                          type="email"
                          value={draft.responsibleEmail}
                          onChange={(event) =>
                            updateDraft(setDraft, { responsibleEmail: event.target.value })
                          }
                          required
                        />
                      </Field>
                      <Field label="Teléfono *">
                        <Input
                          value={draft.responsiblePhone}
                          onChange={(event) =>
                            updateDraft(setDraft, { responsiblePhone: event.target.value })
                          }
                          required
                        />
                      </Field>
                      <Field label="Nombre legal *">
                        <Input
                          value={draft.legalEntityName}
                          onChange={(event) =>
                            updateDraft(setDraft, { legalEntityName: event.target.value })
                          }
                          required
                        />
                      </Field>
                      <Field label="CIF/NIF *">
                        <Input
                          value={draft.legalEntityTaxId}
                          onChange={(event) =>
                            updateDraft(setDraft, { legalEntityTaxId: event.target.value })
                          }
                          required
                        />
                      </Field>
                      <Field label="Nombre completo del firmante *">
                        <Input
                          value={draft.signatureName}
                          onChange={(event) =>
                            updateDraft(setDraft, { signatureName: event.target.value })
                          }
                          required
                        />
                      </Field>
                    </div>

                    <div className="space-y-4 rounded-2xl border border-[#eadfce] bg-[#fffaf4] p-5">
                      <ConsentCheckbox
                        checked={draft.declaresLegalAuthority}
                        onChange={(value) =>
                          updateDraft(setDraft, { declaresLegalAuthority: value })
                        }
                      >
                        Declaro representar legalmente o contar con autorización para actuar en
                        nombre de esta organización.
                      </ConsentCheckbox>
                      <ConsentCheckbox
                        checked={draft.acceptedTruthfulness}
                        onChange={(value) => updateDraft(setDraft, { acceptedTruthfulness: value })}
                      >
                        Declaro que la información aportada es veraz.
                      </ConsentCheckbox>
                      <ConsentCheckbox
                        checked={draft.acceptedDeontologicalCode}
                        onChange={(value) =>
                          updateDraft(setDraft, { acceptedDeontologicalCode: value })
                        }
                      >
                        He leído y acepto el Código Deontológico de Mallorca Holística.
                      </ConsentCheckbox>
                    </div>

                    <div className="space-y-4 rounded-2xl border border-[#eadfce] bg-[#fffaf4] p-5">
                      <ConsentCheckbox
                        checked={draft.acceptedPrivacyPolicy}
                        onChange={(value) =>
                          updateDraft(setDraft, { acceptedPrivacyPolicy: value })
                        }
                      >
                        Acepto la Política de Privacidad.
                      </ConsentCheckbox>
                      <ConsentCheckbox
                        checked={draft.acceptedTermsOfUse}
                        onChange={(value) => updateDraft(setDraft, { acceptedTermsOfUse: value })}
                      >
                        Acepto las Condiciones de Uso.
                      </ConsentCheckbox>
                      <ConsentCheckbox
                        checked={draft.acceptedPublication}
                        onChange={(value) => updateDraft(setDraft, { acceptedPublication: value })}
                      >
                        Autorizo la publicación de mi perfil en Mallorca Holística.
                      </ConsentCheckbox>
                    </div>

                    <div className="rounded-2xl border border-[#eadfce] bg-[#f7efe7] p-5 text-sm leading-7 text-[#5d5144]">
                      <p className="font-medium text-[#342b22]">Firma</p>
                      <p>
                        Nombre completo del firmante: <strong>{draft.signatureName || "—"}</strong>
                      </p>
                      <p>(Fecha, hora e IP registradas automáticamente)</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid gap-5 md:grid-cols-2">
                      <Field label="Página web">
                        <Input
                          value={draft.website}
                          onChange={(event) =>
                            updateDraft(setDraft, { website: event.target.value })
                          }
                          placeholder="https://..."
                        />
                      </Field>
                      <Field label="Instagram">
                        <Input
                          value={draft.instagramUrl}
                          onChange={(event) =>
                            updateDraft(setDraft, { instagramUrl: event.target.value })
                          }
                          placeholder="https://instagram.com/..."
                        />
                      </Field>
                      {config.isProfessional && (
                        <>
                          <Field label="Facebook">
                            <Input
                              value={draft.facebookUrl}
                              onChange={(event) =>
                                updateDraft(setDraft, { facebookUrl: event.target.value })
                              }
                              placeholder="https://facebook.com/..."
                            />
                          </Field>
                          <Field label="LinkedIn">
                            <Input
                              value={draft.linkedinUrl}
                              onChange={(event) =>
                                updateDraft(setDraft, { linkedinUrl: event.target.value })
                              }
                              placeholder="https://linkedin.com/..."
                            />
                          </Field>
                          <Field label="YouTube">
                            <Input
                              value={draft.youtubeUrl}
                              onChange={(event) =>
                                updateDraft(setDraft, { youtubeUrl: event.target.value })
                              }
                              placeholder="https://youtube.com/..."
                            />
                          </Field>
                          <Field label="Calendly">
                            <Input
                              value={draft.calendlyUrl}
                              onChange={(event) =>
                                updateDraft(setDraft, { calendlyUrl: event.target.value })
                              }
                              placeholder="https://calendly.com/..."
                            />
                          </Field>
                          <Field label="Fresha">
                            <Input
                              value={draft.freshaUrl}
                              onChange={(event) =>
                                updateDraft(setDraft, { freshaUrl: event.target.value })
                              }
                              placeholder="https://fresha.com/..."
                            />
                          </Field>
                          <Field label="WhatsApp Business">
                            <Input
                              value={draft.whatsappBusinessUrl}
                              onChange={(event) =>
                                updateDraft(setDraft, { whatsappBusinessUrl: event.target.value })
                              }
                              placeholder="https://wa.me/..."
                            />
                          </Field>
                          <Field label="Otra plataforma">
                            <Input
                              value={draft.otherBookingUrl}
                              onChange={(event) =>
                                updateDraft(setDraft, { otherBookingUrl: event.target.value })
                              }
                              placeholder="https://..."
                            />
                          </Field>
                        </>
                      )}
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <Field label="WhatsApp visible en el perfil">
                        <BinaryToggle
                          value={draft.showWhatsappPublic}
                          onChange={(value) => updateDraft(setDraft, { showWhatsappPublic: value })}
                        />
                      </Field>
                      <Field label="Correo visible en el perfil">
                        <BinaryToggle
                          value={draft.showEmailPublic}
                          onChange={(value) => updateDraft(setDraft, { showEmailPublic: value })}
                        />
                      </Field>
                    </div>

                    {config.isProfessional && (
                      <div className="space-y-4 rounded-2xl border border-[#eadfce] bg-[#fffaf4] p-5">
                        <h4 className="font-display text-lg text-[#11100e]">
                          Verificación Mallorca Holística
                        </h4>
                        <ConsentCheckbox
                          checked={draft.hasLiabilityInsurance}
                          onChange={(value) =>
                            updateDraft(setDraft, { hasLiabilityInsurance: value })
                          }
                        >
                          Declaro disponer de un Seguro de Responsabilidad Civil vigente.
                        </ConsentCheckbox>
                        <Field label="Diploma o Certificado *">
                          <UploadBox
                            file={diplomaFile}
                            label="Subir diploma"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={setDiplomaFile}
                          />
                        </Field>
                        <Field label="Certificados adicionales (máx. 5)">
                          <MultiUploadBox
                            files={extraDocuments}
                            onChange={setExtraDocuments}
                            maxFiles={5}
                            label="Añadir certificados"
                          />
                        </Field>
                      </div>
                    )}

                    <div className="space-y-4 rounded-2xl border border-[#eadfce] bg-[#fffaf4] p-5">
                      <ConsentCheckbox
                        checked={draft.acceptedDeontologicalCode}
                        onChange={(value) =>
                          updateDraft(setDraft, { acceptedDeontologicalCode: value })
                        }
                      >
                        He leído y acepto el Código Deontológico de Mallorca Holística.
                      </ConsentCheckbox>
                      <ConsentCheckbox
                        checked={draft.acceptedTruthfulness}
                        onChange={(value) => updateDraft(setDraft, { acceptedTruthfulness: value })}
                      >
                        Declaro que toda la información aportada es veraz y está actualizada.
                      </ConsentCheckbox>
                      <ConsentCheckbox
                        checked={draft.acceptedPrivacyPolicy}
                        onChange={(value) =>
                          updateDraft(setDraft, { acceptedPrivacyPolicy: value })
                        }
                      >
                        Acepto la Política de Privacidad.
                      </ConsentCheckbox>
                      <ConsentCheckbox
                        checked={draft.acceptedTermsOfUse}
                        onChange={(value) => updateDraft(setDraft, { acceptedTermsOfUse: value })}
                      >
                        Acepto las Condiciones de Uso.
                      </ConsentCheckbox>
                      <ConsentCheckbox
                        checked={draft.acceptedPublication}
                        onChange={(value) => updateDraft(setDraft, { acceptedPublication: value })}
                      >
                        Autorizo la publicación de mi perfil en Mallorca Holística.
                      </ConsentCheckbox>
                    </div>

                    <div className="rounded-2xl border border-[#eadfce] bg-[#f7efe7] p-5 text-sm leading-7 text-[#5d5144]">
                      Revisa el resumen antes de finalizar. Tu perfil se publicará solo cuando el
                      equipo complete la revisión.
                    </div>
                  </>
                )}
              </StepShell>
            )}

            <div className="mt-8 flex flex-col gap-4 border-t border-[#eadfce] pt-6 md:flex-row md:items-center md:justify-between">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setStep((current) => Math.max(1, current - 1) as WizardStep)}
                disabled={step === 1 || saving}
              >
                <ArrowLeft className="h-4 w-4" /> Atrás
              </Button>
              <span className="text-xs text-[#6d5b43]">
                <Lock className="mr-1 inline h-3.5 w-3.5" />
                Guardamos tu progreso automáticamente en cada paso.
              </span>
              <Button
                type="submit"
                disabled={saving}
                className="rounded-full bg-[#526046] px-8 text-white hover:bg-[#435039]"
              >
                {step === 5 ? (saving ? "Finalizando..." : "Finalizar Perfil") : "Guardar y continuar"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <aside className="space-y-6">
            <img
              src={heroImg}
              alt=""
              className="hidden aspect-[4/5] rounded-[1.4rem] object-cover opacity-85 lg:block"
            />
            <InfoCard icon={Monitor} title="Paso a paso">
              Trabajamos contigo con calma para que completes la ficha sin prisas y con claridad.
            </InfoCard>
            <InfoCard icon={Search} title="Perfil más claro">
              Cuanto más ordenada esté tu información, más fácil será encontrar tu trabajo.
            </InfoCard>
            {config.isOrganisation ? (
              <InfoCard icon={Building2} title="Más ubicaciones">
                Las organizaciones pueden sumar varias sedes para mostrar mejor su actividad.
              </InfoCard>
            ) : config.isProfessional ? (
              <InfoCard icon={Home} title="Más ubicaciones">
                El plan Profesional permite sumar varias consultas para mostrar mejor tu actividad.
              </InfoCard>
            ) : null}
          </aside>
        </section>

        <BenefitsStrip plan={config.slug} />
        <footer className="mx-auto flex max-w-[1180px] flex-col gap-3 px-6 pb-8 text-xs text-[#5d5144] md:flex-row md:items-center md:justify-between md:px-10">
          <span>
            <Lock className="mr-2 inline h-4 w-4" />
            Tu información está segura con nosotros.
          </span>
          <span>¿Tienes dudas? Escríbenos a hola@mallorcaholistica.com</span>
        </footer>
      </form>
    </PageShell>
  );

  async function loadCatalogs() {
    const [municipalitiesResult, therapiesResult, helpAreasResult, plansResult] = await Promise.all(
      [
        supabase.from("municipalities").select("*").order("name"),
        supabase.from("therapies").select("*").order("name"),
        supabase.from("help_areas").select("*").order("name"),
        supabase.from("plans").select("id, slug, name").order("rank"),
      ],
    );

    if (municipalitiesResult.error) toast.error(municipalitiesResult.error.message);
    if (therapiesResult.error) toast.error(therapiesResult.error.message);
    if (helpAreasResult.error) toast.error(helpAreasResult.error.message);
    if (plansResult.error) toast.error(plansResult.error.message);

    setMunicipalities((municipalitiesResult.data ?? []) as MunicipalityRow[]);
    setTherapies((therapiesResult.data ?? []) as TherapyRow[]);
    setHelpAreas((helpAreasResult.data ?? []) as HelpAreaRow[]);
    setPlans((plansResult.data ?? []) as PlanRow[]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateStep(
      step,
      draft,
      config,
      Boolean(logoFile),
      Boolean(diplomaFile),
    );
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (step < 5) {
      setSaving(true);
      try {
        await saveDraftProgress((step + 1) as WizardStep);
        setStep((current) => Math.min(5, (current + 1) as WizardStep) as WizardStep);
      } catch (saveError) {
        console.error("Auto-save error:", saveError);
        toast.error("No se pudo autoguardar tu progreso, pero puedes continuar.");
        setStep((current) => Math.min(5, (current + 1) as WizardStep) as WizardStep);
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!user) return;

    const planId = getPlanId(plans, selectedPlanSlug);
    if (!planId) {
      toast.error("No encontramos el plan seleccionado. Vuelve a abrir el formulario.");
      return;
    }

    setSaving(true);
    try {
      const isOrganisation = config.isOrganisation;
      const publicFullName = isOrganisation
        ? draft.organizationName.trim()
        : [draft.firstName.trim(), draft.lastName.trim()].filter(Boolean).join(" ");
      const slugBase = slugify(
        draft.professionalName.trim() ||
          (isOrganisation ? draft.organizationName.trim() : publicFullName),
      );
      const therapistSlug =
        currentTherapistSlug || `${slugBase}-${Math.floor(Math.random() * 1000)}`;

      const firstLocation = draft.locations[0];
      const mainMunicipality = sortedMunicipalities.find(
        (municipality) => municipality.id === firstLocation.municipalityId,
      );
      const photoUrl = photoFile
        ? await uploadPublicFile(photoFile, "therapist-photos", user.id)
        : null;
      const logoUrl =
        config.logoEnabled && logoFile
          ? await uploadPublicFile(logoFile, "therapist-photos", user.id)
          : null;
      const galleryUrls = isOrganisation
        ? await Promise.all(
            galleryFiles
              .slice(0, 15)
              .map((file) => uploadPublicFile(file, "therapist-photos", user.id)),
          )
        : [];
      const teamMembersPayload = isOrganisation
        ? await Promise.all(
            draft.teamMembers
              .filter((member) => member.name.trim() || member.role.trim() || member.photoFile)
              .map(async (member) => ({
                name: member.name.trim(),
                role: member.role.trim(),
                photo_url: member.photoFile
                  ? await uploadPublicFile(member.photoFile, "therapist-photos", user.id)
                  : null,
              })),
          )
        : [];
      const diplomaUpload =
        config.verificationUploadsEnabled && diplomaFile
          ? await uploadPrivateFile(diplomaFile, "verification-docs", user.id)
          : null;
      const extraUploads = config.verificationUploadsEnabled
        ? await Promise.all(
            extraDocuments
              .slice(0, 5)
              .map((file) => uploadPrivateFile(file, "verification-docs", user.id)),
          )
        : [];

      const mainCenter = await upsertCenter(user.id, planId, firstLocation, therapistSlug);
      const extraCenters = config.extraLocationEnabled
        ? await Promise.all(
            draft.locations
              .slice(1)
              .map((location, index) =>
                upsertCenter(user.id, planId, location, `${therapistSlug}-${index + 2}`),
              ),
          )
        : [];

      const therapistPayload = {
        user_id: user.id,
        slug: therapistSlug,
        full_name: publicFullName,
        professional_name: draft.professionalName.trim() || null,
        headline: draft.tagline.trim() || null,
        frase_clave: draft.tagline.trim() || null,
        sobre_mi: draft.presentationText.trim() || null,
        approach_text: config.isProfessional ? draft.approachText.trim() || null : null,
        differentiator_text: config.isOrganisation
          ? draft.differentiatorText.trim() || null
          : config.isProfessional
            ? draft.differentiatorText.trim() || null
            : null,
        formacion: config.isProfessional ? formatFormations(draft.formations) : null,
        experiencia: null,
        photo_url: photoUrl,
        logo_url: logoUrl,
        especialidad: selectedTherapies[0]?.name ?? null,
        subespecialidades: selectedTherapies.map((item) => item.name),
        modalities: deriveModalities(draft.sessionModalities),
        municipality_id: firstLocation.municipalityId || null,
        center_id: mainCenter.id,
        center_name: firstLocation.centerName.trim() || null,
        address: firstLocation.address.trim() || null,
        city: mainMunicipality?.name ?? null,
        lat: null,
        lng: null,
        whatsapp: draft.whatsapp.trim() || null,
        phone: draft.phone.trim() || null,
        email: draft.email.trim() || user.email,
        link_reserva: buildBookingLink(draft),
        website: draft.website.trim() || null,
        instagram_url: draft.instagramUrl.trim() || null,
        facebook_url: draft.facebookUrl.trim() || null,
        linkedin_url: draft.linkedinUrl.trim() || null,
        youtube_url: draft.youtubeUrl.trim() || null,
        calendly_url: draft.calendlyUrl.trim() || null,
        fresha_url: draft.freshaUrl.trim() || null,
        whatsapp_business_url: draft.whatsappBusinessUrl.trim() || null,
        other_booking_url: draft.otherBookingUrl.trim() || null,
        show_whatsapp_public: draft.showWhatsappPublic,
        show_email_public: draft.showEmailPublic,
        languages: config.isOrganisation
          ? draft.languages
          : config.isProfessional
            ? draft.languages
            : ["Español"],
        target_audience: isOrganisation ? draft.organizationPublicAudience : draft.targetAudience,
        accompaniment_modalities: isOrganisation
          ? draft.organizationActivities
          : draft.accompanimentModalities,
        session_modalities: draft.sessionModalities,
        home_visit_radius: draft.sessionModalities.includes("Presencial a domicilio")
          ? draft.homeVisitRadius || null
          : null,
        tagline: draft.tagline.trim() || null,
        mission_text: isOrganisation ? draft.missionText.trim() || null : null,
        accepted_deontological_code: draft.acceptedDeontologicalCode,
        accepted_truthfulness: draft.acceptedTruthfulness,
        accepted_privacy_policy: draft.acceptedPrivacyPolicy,
        accepted_terms_of_use: draft.acceptedTermsOfUse,
        accepted_publication: draft.acceptedPublication,
        has_liability_insurance: config.isProfessional ? draft.hasLiabilityInsurance : false,
        organisation_type: isOrganisation ? draft.organizationType.trim() || null : null,
        facilities: isOrganisation ? draft.facilities : null,
        gallery_urls: isOrganisation ? galleryUrls : null,
        team_members: isOrganisation ? teamMembersPayload : null,
        responsible_first_name: isOrganisation ? draft.responsibleFirstName.trim() || null : null,
        responsible_last_name: isOrganisation ? draft.responsibleLastName.trim() || null : null,
        responsible_role: isOrganisation ? draft.responsibleRole.trim() || null : null,
        responsible_email: isOrganisation ? draft.responsibleEmail.trim() || null : null,
        responsible_phone: isOrganisation ? draft.responsiblePhone.trim() || null : null,
        legal_entity_name: isOrganisation ? draft.legalEntityName.trim() || null : null,
        legal_entity_tax_id: isOrganisation ? draft.legalEntityTaxId.trim() || null : null,
        declares_legal_authority: isOrganisation ? draft.declaresLegalAuthority : false,
        organization_signature_name: isOrganisation ? draft.signatureName.trim() || null : null,
        status: "pending",
        verified: false,
        plan_id: planId,
        is_founder: user?.user_metadata?.is_founder === true,
        verification_submitted_at: config.isProfessional ? new Date().toISOString() : null,
        verification_document_path: diplomaUpload?.path ?? null,
        verification_document_name: diplomaUpload?.name ?? null,
        verification_extra_document_path: extraUploads.map((item) => item.path).join("\n") || null,
        verification_extra_document_name: extraUploads.map((item) => item.name).join("\n") || null,
        updated_at: new Date().toISOString(),
      };

      const { data: therapist, error } = await supabase
        .from("therapists")
        .upsert(therapistPayload, { onConflict: "user_id" })
        .select("id")
        .single();

      if (error) throw error;
      if (!therapist?.id) throw new Error("No pudimos crear tu perfil profesional.");

      await replaceTherapistRelations(therapist.id, draft.therapyIds, draft.helpAreaIds);

      await replaceTherapistCentres(therapist.id, [mainCenter, ...extraCenters]);

      if (isOrganisation) {
        try {
          const accessToken = await getAccessToken();
          await stampOrganisationSubmission({
            data: {
              therapistId: therapist.id,
            },
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        } catch (stampError) {
          console.error(stampError);
          toast.warning("Perfil guardado, pero no pudimos registrar la marca temporal de firma.");
        }
      }

      try {
        const accessToken = await getAccessToken();
        await notifyAdminOfProfessionalRequest({
          data: {
            therapistId: therapist.id,
            professionalEmail: draft.email.trim() || user.email || "",
            origin: window.location.origin,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } catch (emailError) {
        console.error(emailError);
        toast.warning("Perfil enviado, pero no pudimos avisar al equipo por email.");
      }

      toast.success("Tu perfil ha sido guardado. Redirigiendo al panel...");
      navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error(`Error al guardar perfil: ${getErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  }

  async function saveDraftProgress(targetStep: number) {
    if (!user) return;
    const planId = getPlanId(plans, selectedPlanSlug);
    if (!planId) return;

    const isOrganisation = config.isOrganisation;
    const publicFullName = isOrganisation
      ? draft.organizationName.trim()
      : [draft.firstName.trim(), draft.lastName.trim()].filter(Boolean).join(" ");
    const slugBase = slugify(
      draft.professionalName.trim() ||
        (isOrganisation ? draft.organizationName.trim() : publicFullName),
    );
    const therapistSlug =
      currentTherapistSlug || `${slugBase}-${Math.floor(Math.random() * 1000)}`;
    if (!currentTherapistSlug) {
      setCurrentTherapistSlug(therapistSlug);
    }

    // 1. Upload files if present
    let photoUrl = loadedPhotoUrl;
    if (photoFile) {
      photoUrl = await uploadPublicFile(photoFile, "therapist-photos", user.id);
      setLoadedPhotoUrl(photoUrl);
    }

    let logoUrl = loadedLogoUrl;
    if (config.logoEnabled && logoFile) {
      logoUrl = await uploadPublicFile(logoFile, "therapist-photos", user.id);
      setLoadedLogoUrl(logoUrl);
    }

    // 2. Upsert main center
    let mainCenterId = loadedCenterId;
    if (draft.locations.length > 0) {
      const firstLocation = draft.locations[0];
      const mainCenter = await upsertCenter(user.id, planId, firstLocation, therapistSlug);
      mainCenterId = mainCenter.id;
      setLoadedCenterId(mainCenterId);

      // Upsert extra centers if any
      if (config.extraLocationEnabled && draft.locations.length > 1) {
        await Promise.all(
          draft.locations
            .slice(1)
            .map((location, index) =>
              upsertCenter(user.id, planId, location, `${therapistSlug}-${index + 2}`),
            ),
        );
      }
    }

    const firstLocation = draft.locations[0];
    const mainMunicipality = sortedMunicipalities.find(
      (municipality) => municipality.id === (firstLocation?.municipalityId || null),
    );

    const draftPayload = {
      user_id: user.id,
      slug: therapistSlug,
      full_name: publicFullName || "Draft Professional",
      professional_name: draft.professionalName.trim() || null,
      headline: draft.tagline.trim() || null,
      frase_clave: draft.tagline.trim() || null,
      sobre_mi: draft.presentationText.trim() || null,
      approach_text: config.isProfessional ? draft.approachText.trim() || null : null,
      differentiator_text: config.isOrganisation
        ? draft.differentiatorText.trim() || null
        : config.isProfessional
          ? draft.differentiatorText.trim() || null
          : null,
      formacion: config.isProfessional ? formatFormations(draft.formations) : null,
      experiencia: null,
      photo_url: photoUrl,
      logo_url: logoUrl,
      especialidad: selectedTherapies[0]?.name ?? null,
      subespecialidades: selectedTherapies.map((item) => item.name),
      modalities: deriveModalities(draft.sessionModalities),
      municipality_id: firstLocation?.municipalityId || null,
      center_id: mainCenterId,
      center_name: firstLocation?.centerName.trim() || null,
      address: firstLocation?.address.trim() || null,
      city: mainMunicipality?.name ?? null,
      lat: null,
      lng: null,
      whatsapp: draft.whatsapp.trim() || null,
      phone: draft.phone.trim() || null,
      email: draft.email.trim() || user.email,
      link_reserva: buildBookingLink(draft),
      website: draft.website.trim() || null,
      instagram_url: draft.instagramUrl.trim() || null,
      facebook_url: draft.facebookUrl.trim() || null,
      linkedin_url: draft.linkedinUrl.trim() || null,
      youtube_url: draft.youtubeUrl.trim() || null,
      calendly_url: draft.calendlyUrl.trim() || null,
      fresha_url: draft.freshaUrl.trim() || null,
      whatsapp_business_url: draft.whatsappBusinessUrl.trim() || null,
      other_booking_url: draft.otherBookingUrl.trim() || null,
      show_whatsapp_public: draft.showWhatsappPublic,
      show_email_public: draft.showEmailPublic,
      languages: config.isOrganisation
        ? draft.languages
        : config.isProfessional
          ? draft.languages
          : ["Español"],
      target_audience: isOrganisation ? draft.organizationPublicAudience : draft.targetAudience,
      accompaniment_modalities: isOrganisation
        ? draft.organizationActivities
        : draft.accompanimentModalities,
      session_modalities: draft.sessionModalities,
      home_visit_radius: draft.sessionModalities.includes("Presencial a domicilio")
        ? draft.homeVisitRadius || null
        : null,
      tagline: draft.tagline.trim() || null,
      mission_text: isOrganisation ? draft.missionText.trim() || null : null,
      accepted_deontological_code: draft.acceptedDeontologicalCode,
      accepted_truthfulness: draft.acceptedTruthfulness,
      accepted_privacy_policy: draft.acceptedPrivacyPolicy,
      accepted_terms_of_use: draft.acceptedTermsOfUse,
      accepted_publication: draft.acceptedPublication,
      has_liability_insurance: config.isProfessional ? draft.hasLiabilityInsurance : false,
      organisation_type: isOrganisation ? draft.organizationType.trim() || null : null,
      facilities: isOrganisation ? draft.facilities : null,
      status: loadedStatus || "draft",
      plan_id: planId,
      is_founder: user?.user_metadata?.is_founder === true,
      updated_at: new Date().toISOString(),
    };

    const { data: savedTherapist, error: upsertError } = await supabase
      .from("therapists")
      .upsert(draftPayload, { onConflict: "user_id" })
      .select("id")
      .single();

    if (upsertError) throw upsertError;

    if (savedTherapist?.id) {
      await replaceTherapistRelations(savedTherapist.id, draft.therapyIds, draft.helpAreaIds);
    }

    // Update furthest onboarding step in user metadata
    await supabase.auth.updateUser({
      data: { furthest_onboarding_step: targetStep },
    });
  }

  async function replaceTherapistRelations(
    therapistId: string,
    therapyIds: string[],
    helpAreaIds: string[],
  ) {
    if (therapyIds.length > 0) {
      const { error: deleteError } = await supabase
        .from("therapist_therapies")
        .delete()
        .eq("therapist_id", therapistId);
      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase.from("therapist_therapies").insert(
        therapyIds.map((therapyId) => ({
          therapist_id: therapistId,
          therapy_id: therapyId,
        })),
      );
      if (insertError) throw insertError;
    }

    if (helpAreaIds.length > 0) {
      const { error: deleteError } = await supabase
        .from("therapist_help_areas")
        .delete()
        .eq("therapist_id", therapistId);
      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase.from("therapist_help_areas").insert(
        helpAreaIds.map((helpAreaId) => ({
          therapist_id: therapistId,
          help_area_id: helpAreaId,
        })),
      );
      if (insertError) throw insertError;
    }
  }

  async function replaceTherapistCentres(
    therapistId: string,
    centersToKeep: Array<{ id: string }>,
  ) {
    const { error } = await supabase
      .from("therapists")
      .update({ center_id: centersToKeep[0]?.id ?? null })
      .eq("id", therapistId);
    if (error) throw error;
  }

  async function upsertCenter(
    ownerUserId: string,
    planId: string,
    location: LocationDraft,
    slugSeed: string,
  ) {
    const municipality = sortedMunicipalities.find((item) => item.id === location.municipalityId);
    const centerNameClean = location.centerName.trim() || "Consulta";
    const centerPayload = {
      owner_user_id: ownerUserId,
      plan_id: planId,
      slug: slugify(`${centerNameClean}-${slugSeed}`),
      name: centerNameClean,
      address: location.address.trim() || null,
      municipality_id: location.municipalityId || null,
      lat: municipality?.lat ?? null,
      lng: municipality?.lng ?? null,
      phone: null,
      website: null,
      photo_url: null,
      description: null,
      status: "pending" as const,
    };

    const { data, error } = await supabase
      .from("centers")
      .upsert(centerPayload, { onConflict: "slug" })
      .select("id")
      .single();

    if (error) throw error;
    if (!data?.id) throw new Error("No pudimos crear una ubicación.");

    return data;
  }

  async function uploadPublicFile(file: File, bucket: string, ownerId: string) {
    const path = await uploadFile(file, bucket, ownerId);
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async function uploadPrivateFile(file: File, bucket: string, ownerId: string) {
    const path = await uploadFile(file, bucket, ownerId);
    return {
      path,
      name: file.name,
    };
  }

  async function uploadFile(file: File, bucket: string, ownerId: string) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${ownerId}/${crypto.randomUUID()}.${fileExt}`;

    const { error } = await supabase.storage.from(bucket).upload(fileName, file, { upsert: true });
    if (error) throw error;

    return fileName;
  }

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("No active session found.");
    }

    return session.access_token;
  }
}

function WizardProgress({ step, isProfessional }: { step: WizardStep; isProfessional: boolean }) {
  const labels = isProfessional
    ? ["Información", "Actividad", "Consultas", "Perfil", "Redes"]
    : ["Información", "Actividad", "Consultas", "Perfil", "Redes"];

  return (
    <div className="mx-auto mt-10 grid max-w-[980px] grid-cols-5 items-start gap-2">
      {labels.map((title, index) => {
        const number = (index + 1) as WizardStep;
        const active = step === number;
        const done = step > number;
        return (
          <div key={title} className="relative flex flex-col items-center gap-2 text-center">
            {number > 1 && (
              <span className="absolute right-1/2 top-7 hidden h-px w-full bg-[#cfc1ad] md:block" />
            )}
            <span
              className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full border ${
                active || done
                  ? "border-[#526046] bg-[#526046] text-white"
                  : "border-[#eadfce] bg-white text-[#526046]"
              }`}
            >
              {done ? (
                <Check className="h-5 w-5" />
              ) : (
                <span className="text-sm font-medium">{number}</span>
              )}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#6d5b43]">
              {title}
            </span>
            <span className="text-[11px] text-[#8c7a66]">
              {step === number ? "Activo" : done ? "Hecho" : "Pendiente"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function StepShell({
  icon: Icon,
  title,
  intro,
  children,
}: {
  icon: LucideIcon;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-8">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f4ede6] text-[#526046]">
          <Icon className="h-6 w-6" />
        </span>
        <div>
          <h2 className="font-display text-2xl text-[#11100e]">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-[#5d5144]">{intro}</p>
        </div>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-[#342b22]">{label}</span>
      {children}
    </label>
  );
}

function MunicipalitySelect({
  value,
  municipalities,
  onChange,
}: {
  value: string;
  municipalities: MunicipalityRow[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none rounded-2xl border border-[#eadfce] bg-white px-4 py-3 pr-10 text-sm text-[#342b22] outline-none transition focus:border-[#526046]"
        required
      >
        <option value="">Selecciona un municipio</option>
        {municipalities.map((municipality) => (
          <option key={municipality.id} value={municipality.id}>
            {municipality.name}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c7a66]" />
    </div>
  );
}

function ReadOnlyPill({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#d8c6b0] bg-[#faf4eb] px-4 py-3 text-sm text-[#5d5144]">
      {children}
    </div>
  );
}

function UploadBox({
  file,
  label,
  accept,
  onChange,
  showCircularPreview,
  initialPreviewUrl,
}: {
  file: File | null;
  label: string;
  accept: string;
  onChange: (file: File | null) => void;
  showCircularPreview?: boolean;
  initialPreviewUrl?: string;
}) {
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setLocalPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setLocalPreview(null);
    }
  }, [file]);

  const previewSrc = localPreview || initialPreviewUrl;

  return (
    <div className="rounded-2xl border border-dashed border-[#d8c6b0] bg-white p-4">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        {showCircularPreview && previewSrc && (
          <div className="relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-full border-2 border-[#d8c6b0]">
            <img
              src={previewSrc}
              alt="Vista previa"
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <label className="flex flex-1 cursor-pointer flex-col gap-3">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[#342b22]">
            <Upload className="h-4 w-4" />
            {label}
          </span>
          <Input
            type="file"
            accept={accept}
            onChange={(event) => onChange(event.target.files?.[0] ?? null)}
            className="hidden"
          />
          <span className="text-xs text-[#6d5b43]">
            {file ? file.name : "Selecciona un archivo desde tu equipo"}
          </span>
        </label>
      </div>
    </div>
  );
}

function MultiUploadBox({
  files,
  onChange,
  maxFiles,
  label,
  accept = ".pdf,.png,.jpg,.jpeg",
  helperText,
  emptyText,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles: number;
  label: string;
  accept?: string;
  helperText?: string;
  emptyText?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#d8c6b0] bg-white p-4">
      <label className="flex cursor-pointer flex-col gap-3">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-[#342b22]">
          <Upload className="h-4 w-4" />
          {label}
        </span>
        <Input
          type="file"
          accept={accept}
          multiple
          onChange={(event) => onChange(Array.from(event.target.files ?? []).slice(0, maxFiles))}
          className="hidden"
        />
        <span className="text-xs text-[#6d5b43]">
          {files.length > 0
            ? `${files.length} archivo${files.length === 1 ? "" : "s"} seleccionado${
                files.length === 1 ? "" : "s"
              }`
            : (emptyText ?? "Puedes subir hasta 5 certificados adicionales")}
        </span>
      </label>
      {helperText && <p className="mt-2 text-xs text-[#6d5b43]">{helperText}</p>}
      {files.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-[#6d5b43]">
          {files.map((file) => (
            <li key={`${file.name}-${file.size}`}>{file.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CheckboxGrid({
  title,
  description,
  items,
  values,
  onChange,
  columns,
  helperByItem,
}: {
  title: string;
  description: string;
  items: string[];
  values: string[];
  onChange: (values: string[]) => void;
  columns: string;
  helperByItem?: Record<string, string>;
}) {
  function toggle(item: string) {
    const exists = values.includes(item);
    const next = exists ? values.filter((value) => value !== item) : [...values, item];
    onChange(next);
  }

  return (
    <div className="space-y-3 rounded-3xl border border-[#eadfce] bg-[#fffaf4] p-5">
      <div>
        <h4 className="font-display text-lg text-[#11100e]">{title}</h4>
        <p className="mt-1 text-sm text-[#6d5b43]">{description}</p>
      </div>
      <div className={`grid gap-3 ${columns}`}>
        {items.map((item) => {
          const selected = values.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => toggle(item)}
              className={`rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
                selected
                  ? "border-[#526046] bg-white text-[#1f1c18]"
                  : "border-[#eadfce] bg-white/70 text-[#342b22] hover:bg-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    selected ? "border-[#526046] bg-[#526046] text-white" : "border-[#c5b39d]"
                  }`}
                >
                  {selected && <Check className="h-3 w-3" />}
                </span>
                <span>{item}</span>
              </span>
              {helperByItem?.[item] && (
                <span className="mt-2 block text-xs leading-5 text-[#7a6653]">
                  {helperByItem[item]}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BinaryToggle({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm transition-colors ${
        value
          ? "border-[#526046] bg-[#526046] text-white"
          : "border-[#eadfce] bg-white text-[#342b22]"
      }`}
    >
      <span className={`h-3 w-3 rounded-full ${value ? "bg-white" : "bg-[#c5b39d]"}`} />
      {value ? "Sí" : "No"}
    </button>
  );
}

function ConsentCheckbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-[#eadfce] bg-white px-4 py-3 text-sm text-[#342b22]">
      <Checkbox checked={checked} onCheckedChange={(value) => onChange(Boolean(value))} />
      <span className="leading-6">{children}</span>
    </label>
  );
}

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[1.4rem] border border-[#eadfce] bg-[#fffaf4] p-5 text-sm leading-7 text-[#5d5144]">
      <div className="mb-3 flex items-center gap-2 text-[#11100e]">
        <Icon className="h-4 w-4 text-[#526046]" />
        <span className="font-medium">{title}</span>
      </div>
      {children}
    </div>
  );
}

function BenefitsStrip({ plan }: { plan: OnboardingPlan }) {
  const benefits =
    plan === "centro"
      ? [
          "Varias ubicaciones para mostrar todo el espacio.",
          "Un perfil completo para organizaciones y equipos.",
          "Firma y verificación con trazabilidad de la organización.",
        ]
      : plan === "profesional"
        ? [
            "Más de una ubicación para mostrar tu actividad.",
            "Más espacio para contar tu enfoque profesional.",
            "Verificación con documentación profesional.",
          ]
        : [
            "Un formulario claro y amable para empezar sin fricción.",
            "Límites suaves para mantener la ficha ordenada.",
            "Un perfil simple pero coherente desde el primer día.",
          ];

  return (
    <section className="mx-auto max-w-[1180px] px-6 pb-8 md:px-10">
      <div className="grid gap-4 rounded-[1.5rem] border border-[#eadfce] bg-white px-6 py-5 md:grid-cols-3">
        {benefits.map((benefit) => (
          <div key={benefit} className="flex items-start gap-3 text-sm leading-6 text-[#5d5144]">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#526046] text-white">
              <Check className="h-3 w-3" />
            </span>
            <span>{benefit}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CatalogPicker({
  title,
  description,
  placeholder,
  items,
  selectedIds,
  maxSelection,
  search,
  onSearchChange,
  onChange,
  helperText,
  draggedIndex,
  onDragIndexChange,
}: {
  title: string;
  description: string;
  placeholder: string;
  items: CatalogItem[];
  selectedIds: string[];
  maxSelection: number | null;
  search: string;
  onSearchChange: (value: string) => void;
  onChange: (values: string[]) => void;
  helperText: string;
  draggedIndex: number | null;
  onDragIndexChange: (value: number | null) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function toggle(id: string) {
    const exists = selectedIds.includes(id);
    if (!exists && maxSelection !== null && selectedIds.length >= maxSelection) return;
    const next = exists ? selectedIds.filter((value) => value !== id) : [...selectedIds, id];
    onChange(next);
  }

  function remove(id: string) {
    onChange(selectedIds.filter((value) => value !== id));
  }

  function move(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    const next = [...selectedIds];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    onChange(next);
  }

  return (
    <div className="space-y-4 rounded-3xl border border-[#eadfce] bg-[#fffaf4] p-5">
      <div>
        <h4 className="font-display text-lg text-[#11100e]">{title}</h4>
        <p className="mt-1 text-sm text-[#6d5b43]">{description}</p>
      </div>

      <div className="relative" ref={containerRef}>
        <Input
          value={search}
          onChange={(event) => {
            onSearchChange(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pr-10"
        />
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c7a66]" />

        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 grid max-h-60 gap-2 overflow-auto rounded-2xl border border-[#eadfce] bg-white p-3 shadow-lg">
            {filtered.map((item) => {
              const selected = selectedIds.includes(item.id);
              const disabled = !selected && maxSelection !== null && selectedIds.length >= maxSelection;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggle(item.id)}
                  disabled={disabled}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
                    selected
                      ? "border-[#526046] bg-[#f4ede6] text-[#1f1c18]"
                      : "border-[#eadfce] bg-white text-[#342b22] hover:bg-[#fffaf4]"
                  } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  <span>{item.name}</span>
                  {selected ? (
                    <Check className="h-4 w-4 text-[#526046]" />
                  ) : (
                    <Plus className="h-4 w-4 text-[#8c7a66]" />
                  )}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-[#8c7a66] text-center">No encontramos resultados.</p>
            )}
          </div>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedIds.map((id, index) => {
            const item = items.find((entry) => entry.id === id);
            if (!item) return null;
            return (
              <div
                key={id}
                draggable
                onDragStart={() => onDragIndexChange(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (draggedIndex === null) return;
                  move(draggedIndex, index);
                  onDragIndexChange(null);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[#d8c6b0] bg-white px-3 py-2 text-sm text-[#342b22]"
              >
                <GripVertical className="h-3.5 w-3.5 text-[#8c7a66]" />
                <span>{item.name}</span>
                <button
                  type="button"
                  onClick={() => remove(id)}
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#f2e6d7] text-[#7f6046]"
                  aria-label={`Quitar ${item.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-[#6d5b43]">{helperText}</p>
    </div>
  );
}

function FormationEditor({
  formations,
  onChange,
}: {
  formations: FormationDraft[];
  onChange: (formations: FormationDraft[]) => void;
}) {
  function addFormation() {
    onChange([...formations, { formation: "", school: "", year: "" }]);
  }

  function updateFormation(index: number, next: Partial<FormationDraft>) {
    onChange(
      formations.map((item, currentIndex) =>
        currentIndex === index ? { ...item, ...next } : item,
      ),
    );
  }

  function removeFormation(index: number) {
    onChange(formations.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <div className="space-y-4 rounded-3xl border border-[#eadfce] bg-[#fffaf4] p-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h4 className="font-display text-lg text-[#11100e]">Formación principal</h4>
          <p className="mt-1 text-sm text-[#6d5b43]">
            Añade una o varias formaciones para contar tu recorrido.
          </p>
        </div>
        <Button type="button" variant="outline" className="rounded-full" onClick={addFormation}>
          <Plus className="h-4 w-4" /> Añadir otra formación
        </Button>
      </div>
      <div className="space-y-4">
        {formations.map((formation, index) => (
          <div
            key={index}
            className="rounded-2xl border border-[#eadfce] bg-white p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-[#5d5144]">Formación {index + 1}</span>
              {formations.length > 1 && (
                <button
                  type="button"
                  className="text-xs font-medium text-[#8a6550] hover:underline"
                  onClick={() => removeFormation(index)}
                >
                  Eliminar
                </button>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Formación">
                <Input
                  value={formation.formation}
                  onChange={(event) => updateFormation(index, { formation: event.target.value })}
                  placeholder="Ej: Psicoterapia Gestalt"
                />
              </Field>
              <Field label="Escuela">
                <Input
                  value={formation.school}
                  onChange={(event) => updateFormation(index, { school: event.target.value })}
                  placeholder="Ej: Escuela de Vida"
                />
              </Field>
              <Field label="Año">
                <Input
                  value={formation.year}
                  onChange={(event) => updateFormation(index, { year: event.target.value })}
                  placeholder="Ej: 2024"
                />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamEditor({
  members,
  onChange,
}: {
  members: TeamMemberDraft[];
  onChange: (members: TeamMemberDraft[]) => void;
}) {
  function addMember() {
    onChange([...members, { name: "", role: "", photoFile: null }]);
  }

  function updateMember(index: number, next: Partial<TeamMemberDraft>) {
    onChange(
      members.map((item, currentIndex) => (currentIndex === index ? { ...item, ...next } : item)),
    );
  }

  function removeMember(index: number) {
    onChange(members.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <div className="space-y-4 rounded-3xl border border-[#eadfce] bg-[#fffaf4] p-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h4 className="font-display text-lg text-[#11100e]">Equipo</h4>
          <p className="mt-1 text-sm text-[#6d5b43]">
            Añade a las personas clave del centro si quieres mostrar el equipo.
          </p>
        </div>
        <Button type="button" variant="outline" className="rounded-full" onClick={addMember}>
          <Plus className="h-4 w-4" /> Añadir miembro
        </Button>
      </div>
      <div className="space-y-4">
        {members.map((member, index) => (
          <div
            key={index}
            className="rounded-2xl border border-[#eadfce] bg-white p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-[#5d5144]">Miembro {index + 1}</span>
              {members.length > 1 && (
                <button
                  type="button"
                  className="text-xs font-medium text-[#8a6550] hover:underline"
                  onClick={() => removeMember(index)}
                >
                  Eliminar
                </button>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Nombre">
                <Input
                  value={member.name}
                  onChange={(event) => updateMember(index, { name: event.target.value })}
                  placeholder="Ej: Marta"
                />
              </Field>
              <Field label="Especialidad / Cargo">
                <Input
                  value={member.role}
                  onChange={(event) => updateMember(index, { role: event.target.value })}
                  placeholder="Ej: Psicóloga"
                />
              </Field>
              <Field label="Foto">
                <UploadBox
                  file={member.photoFile}
                  label="Subir foto"
                  accept="image/*"
                  onChange={(file) => updateMember(index, { photoFile: file })}
                />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function updateDraft<K extends keyof WizardDraft>(
  setDraft: React.Dispatch<React.SetStateAction<WizardDraft>>,
  update: Pick<WizardDraft, K>,
) {
  setDraft((current) => ({ ...current, ...update }));
}

function updateLocation(
  setDraft: React.Dispatch<React.SetStateAction<WizardDraft>>,
  index: number,
  update: Partial<LocationDraft>,
) {
  setDraft((current) => ({
    ...current,
    locations: current.locations.map((item, currentIndex) =>
      currentIndex === index ? { ...item, ...update } : item,
    ),
  }));
}

function validateStep(
  step: WizardStep,
  draft: WizardDraft,
  config: ReturnType<typeof getOnboardingPlanConfig>,
  hasLogoFile: boolean,
  hasDiplomaFile: boolean,
) {
  if (step === 1) {
    if (config.isOrganisation) {
      if (!draft.organizationName.trim()) return "Completa el nombre de la organización.";
      if (!draft.organizationType.trim()) return "Selecciona el tipo de organización.";
      if (!draft.municipalityId) return "Elige el municipio principal.";
      if (!draft.email.trim()) return "Añade el correo electrónico.";
      if (!draft.whatsapp.trim()) return "Añade el WhatsApp.";
      if (!hasLogoFile) return "Añade el logo de la organización.";
    } else if (!draft.firstName.trim() || !draft.lastName.trim())
      return "Completa tu nombre y apellidos.";
    if (!draft.municipalityId) return "Elige tu municipio principal.";
    if (!draft.email.trim()) return "Añade tu correo electrónico.";
    if (!draft.whatsapp.trim()) return "Añade tu WhatsApp.";
    return null;
  }

  if (step === 2) {
    if (draft.therapyIds.length === 0) return "Selecciona al menos una terapia.";
    if (draft.helpAreaIds.length === 0) return "Selecciona al menos un área de especialización.";
    return null;
  }

  if (step === 3) {
    if (!config.isOrganisation) {
      if (draft.sessionModalities.length === 0)
        return "Selecciona al menos una modalidad de sesión.";
      if (draft.sessionModalities.includes("Presencial a domicilio") && !draft.homeVisitRadius) {
        return "Indica el radio de desplazamiento.";
      }
    }
    const isFreePlan = config.slug === "presencia";
    if (!isFreePlan) {
      if (!draft.locations[0]?.centerName.trim()) return "Añade el nombre de la ubicación principal.";
      if (!draft.locations[0]?.address.trim()) return "Añade la dirección de la ubicación principal.";
    }
    if (!draft.locations[0]?.municipalityId)
      return "Selecciona el municipio de la ubicación principal.";
    return null;
  }

  if (step === 4) {
    if (!draft.presentationText.trim()) return "Añade tu presentación.";
    if (!draft.tagline.trim()) return "Añade una frase de presentación.";
    if (config.isOrganisation) {
      if (!draft.missionText.trim()) return "Añade la misión de la organización.";
    } else if (config.isProfessional && draft.formations.every((item) => !item.formation.trim())) {
      return "Añade al menos una formación principal.";
    }
    return null;
  }

  if (step === 5) {
    if (config.isOrganisation) {
      if (!draft.responsibleFirstName.trim()) return "Añade el nombre de la persona responsable.";
      if (!draft.responsibleLastName.trim())
        return "Añade los apellidos de la persona responsable.";
      if (!draft.responsibleRole.trim()) return "Añade el cargo de la persona responsable.";
      if (!draft.responsibleEmail.trim()) return "Añade el email de la persona responsable.";
      if (!draft.responsiblePhone.trim()) return "Añade el teléfono de la persona responsable.";
      if (!draft.legalEntityName.trim()) return "Añade el nombre legal de la entidad.";
      if (!draft.legalEntityTaxId.trim()) return "Añade el CIF/NIF de la entidad.";
      if (!draft.signatureName.trim()) return "Añade el nombre completo del firmante.";
      if (!draft.declaresLegalAuthority) {
        return "Debes declarar que representas legalmente a la organización.";
      }
      if (!draft.acceptedTruthfulness) return "Debes declarar que la información es veraz.";
      if (!draft.acceptedDeontologicalCode) return "Debes aceptar el Código Deontológico.";
      if (!draft.acceptedPrivacyPolicy) return "Debes aceptar la Política de Privacidad.";
      if (!draft.acceptedTermsOfUse) return "Debes aceptar las Condiciones de Uso.";
      if (!draft.acceptedPublication) return "Debes autorizar la publicación del perfil.";
      return null;
    }

    if (!draft.website.trim() && !draft.instagramUrl.trim()) {
      return "Añade al menos una forma de encontrarte online.";
    }
    if (!draft.acceptedDeontologicalCode) return "Debes aceptar el Código Deontológico.";
    if (!draft.acceptedTruthfulness) return "Debes declarar que la información es veraz.";
    if (!draft.acceptedPrivacyPolicy) return "Debes aceptar la Política de Privacidad.";
    if (!draft.acceptedTermsOfUse) return "Debes aceptar las Condiciones de Uso.";
    if (!draft.acceptedPublication) return "Debes autorizar la publicación del perfil.";
    if (config.isProfessional) {
      if (!draft.hasLiabilityInsurance)
        return "Debes confirmar tu seguro de responsabilidad civil.";
      if (!hasDiplomaFile) return "Debes subir al menos un diploma o certificado.";
    }
  }

  return null;
}

function formatFormations(formations: FormationDraft[]) {
  return formations
    .filter((item) => item.formation.trim() || item.school.trim() || item.year.trim())
    .map((item) =>
      [item.formation.trim(), item.school.trim(), item.year.trim()].filter(Boolean).join(" · "),
    )
    .join("\n");
}

function deriveModalities(modalities: string[]): Array<"presencial" | "online" | "domicilio"> {
  const values: Array<"presencial" | "online" | "domicilio"> = [];
  if (modalities.includes("Presencial en consulta")) values.push("presencial");
  if (modalities.includes("Online (videollamada)")) values.push("online");
  if (modalities.includes("Presencial a domicilio")) values.push("domicilio");
  return values.length ? values : ["presencial"];
}

function buildBookingLink(draft: WizardDraft) {
  return draft.calendlyUrl.trim() || draft.freshaUrl.trim() || draft.otherBookingUrl.trim() || null;
}

function getPlanId(plans: PlanRow[], selectedPlanSlug: PlanChoice) {
  return plans.find((plan) => plan.slug === selectedPlanSlug)?.id ?? null;
}

function normalizePlanChoice(value: unknown): PlanChoice | null {
  if (typeof value !== "string") return null;
  if (planSearchValues.includes(value as PlanChoice)) return value as PlanChoice;
  return null;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "No se pudo guardar el perfil.";
}
