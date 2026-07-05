import { type FormEvent, type ReactNode, useMemo, useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  GripVertical,
  Heart,
  Home,
  Lock,
  MapPin,
  Monitor,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  User,
  X,
  Leaf,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import heroImg from "@/assets/hero-branch.jpg";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UpgradeLock } from "@/components/dashboard/UpgradeLock";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { saveProfessionalProfile } from "@/lib/professional-profile-editor";
import {
  getOnboardingPlanConfig,
  resolveOnboardingPlan,
  type OnboardingPlan,
} from "@/lib/onboarding-flow";

type MunicipalityRow = Database["public"]["Tables"]["municipalities"]["Row"];
type TherapyRow = Database["public"]["Tables"]["therapies"]["Row"];
type HelpAreaRow = Database["public"]["Tables"]["help_areas"]["Row"];
type TherapistSessionRow = Database["public"]["Tables"]["therapist_sessions"]["Row"];
type CenterRow = Database["public"]["Tables"]["centers"]["Row"];

type TherapistEditorData = Database["public"]["Tables"]["therapists"]["Row"] & {
  therapist_therapies?: Array<{ therapy_id: string | null }> | null;
  therapist_help_areas?: Array<{ help_area_id: string | null }> | null;
  therapist_sessions?: TherapistSessionRow[] | null;
  plans?: { slug: string | null; name: string | null } | null;
};

type LocationDraft = {
  id?: string | null;
  centerName: string;
  address: string;
  municipalityId: string;
};

type TeamMemberDraft = {
  name: string;
  role: string;
  photoUrl: string | null;
  photoFile: File | null;
};

type SessionDraft = {
  clientId: string;
  id?: string;
  name: string;
  duration: string;
  priceEur: string;
};

type ProfileDraft = {
  fullName: string;
  professionalName: string;
  organizationName: string;
  organizationType: string;
  municipalityId: string;
  city: string;
  address: string;
  lat: string;
  lng: string;
  email: string;
  phone: string;
  whatsapp: string;
  photoUrl: string;
  logoUrl: string;
  headline: string;
  sobreMi: string;
  approachText: string;
  differentiatorText: string;
  missionText: string;
  tagline: string;
  formacion: string;
  experiencia: string;
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
  targetAudience: string[];
  accompanimentModalities: string[];
  sessionModalities: string[];
  homeVisitRadius: string;
  languages: string[];
  facilities: string[];
  galleryUrls: string[];
  organizationPublicAudience: string[];
  organizationActivities: string[];
  therapyIds: string[];
  helpAreaIds: string[];
};

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

const organisationAudienceOptions = [
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

const organisationActivitiesOptions = [
  "Talleres",
  "Cursos",
  "Formaciones",
  "Eventos",
  "Conferencias",
  "Retiros",
  "Encuentros",
  "Actividades recurrentes",
  "Otro",
];

const sessionModalityOptions = [
  "Presencial en consulta",
  "Online (videollamada)",
  "A distancia",
  "Presencial a domicilio",
];

const homeVisitRadiusOptions = ["10 km", "20 km", "30 km", "Toda la isla", "Consultar"];

const professionalLanguages = ["Español", "Inglés", "Francés", "Alemán", "Catalán", "Otro"];

const organisationLanguages = [
  "Español",
  "Catalán",
  "Inglés",
  "Alemán",
  "Francés",
  "Italiano",
  "Holandés",
  "Otro",
];

const planToSlug = (value: string | null | undefined): OnboardingPlan =>
  resolveOnboardingPlan({ searchPlan: value });

export function DashboardProfileEditor({
  therapist,
  therapies,
  helpAreas,
  municipalities,
  centers,
}: {
  therapist: TherapistEditorData;
  therapies: TherapyRow[];
  helpAreas: HelpAreaRow[];
  municipalities: MunicipalityRow[];
  centers: CenterRow[];
}) {
  const plan = useMemo(
    () => planToSlug(therapist.plans?.slug ?? therapist.pending_plan_slug),
    [therapist.pending_plan_slug, therapist.plans?.slug],
  );
  const config = useMemo(() => getOnboardingPlanConfig(plan), [plan]);
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

  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryUrls, setGalleryUrls] = useState<string[]>(
    Array.isArray(therapist.gallery_urls) ? therapist.gallery_urls : [],
  );
  const [diplomaFile, setDiplomaFile] = useState<File | null>(null);
  const [extraDocuments, setExtraDocuments] = useState<File[]>([]);
  const [therapySearch, setTherapySearch] = useState("");
  const [helpAreaSearch, setHelpAreaSearch] = useState("");
  const [draggedTherapyIndex, setDraggedTherapyIndex] = useState<number | null>(null);
  const [draggedHelpAreaIndex, setDraggedHelpAreaIndex] = useState<number | null>(null);

  const [draft, setDraft] = useState<ProfileDraft>(() =>
    buildDraft(therapist, centers, config.isOrganisation),
  );
  const [selectedTherapyIds, setSelectedTherapyIds] = useState<string[]>(
    (therapist.therapist_therapies ?? [])
      .map((row) => row.therapy_id)
      .filter((id): id is string => Boolean(id)),
  );
  const [selectedHelpAreaIds, setSelectedHelpAreaIds] = useState<string[]>(
    (therapist.therapist_help_areas ?? [])
      .map((row) => row.help_area_id)
      .filter((id): id is string => Boolean(id)),
  );
  const [sessions, setSessions] = useState<SessionDraft[]>(
    (therapist.therapist_sessions ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((row) => ({
        clientId: row.id,
        id: row.id,
        name: row.name,
        duration: row.duration ?? "",
        priceEur: row.price_cents === null ? "" : (row.price_cents / 100).toFixed(2),
      })),
  );
  const [locations, setLocations] = useState<LocationDraft[]>(
    buildLocations(therapist, centers, config.isOrganisation),
  );
  const [teamMembers, setTeamMembers] = useState<TeamMemberDraft[]>(
    buildTeamMembers(therapist.team_members),
  );

  const [localPhotoPreview, setLocalPhotoPreview] = useState<string | null>(null);
  const [localLogoPreview, setLocalLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!photoFile) {
      setLocalPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setLocalPhotoPreview(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [photoFile]);

  useEffect(() => {
    if (!logoFile) {
      setLocalLogoPreview(null);
      return;
    }
    const url = URL.createObjectURL(logoFile);
    setLocalLogoPreview(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [logoFile]);

  const displayPhotoUrl = localPhotoPreview || draft.photoUrl || null;
  const displayLogoUrl = localLogoPreview || draft.logoUrl || null;

  const selectedMunicipality = useMemo(
    () => sortedMunicipalities.find((m) => m.id === draft.municipalityId),
    [sortedMunicipalities, draft.municipalityId],
  );

  function updateDraft<Key extends keyof ProfileDraft>(key: Key, value: ProfileDraft[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function toggleId(current: string[], id: string) {
    return current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
  }

  function toggleTherapy(therapyId: string) {
    const cap = config.therapyCap;
    setSelectedTherapyIds((current) => {
      const exists = current.includes(therapyId);
      if (!exists && cap !== null && current.length >= cap) return current;
      return toggleId(current, therapyId);
    });
  }

  function toggleHelpArea(helpAreaId: string) {
    const cap = config.helpAreaCap;
    setSelectedHelpAreaIds((current) => {
      const exists = current.includes(helpAreaId);
      if (!exists && cap !== null && current.length >= cap) return current;
      return toggleId(current, helpAreaId);
    });
  }

  function toggleCheckbox(list: string[], value: string, max: number | null = null) {
    const exists = list.includes(value);
    if (!exists && max !== null && list.length >= max) return list;
    return exists ? list.filter((item) => item !== value) : [...list, value];
  }

  function addLocation() {
    setLocations((current) => [
      ...current,
      { id: null, centerName: "", address: "", municipalityId: "" },
    ]);
  }

  function updateLocation(index: number, patch: Partial<LocationDraft>) {
    setLocations((current) =>
      current.map((location, currentIndex) =>
        currentIndex === index ? { ...location, ...patch } : location,
      ),
    );
  }

  function removeLocation(index: number) {
    setLocations((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  function addSession() {
    setSessions((current) => [
      ...current,
      { clientId: crypto.randomUUID(), name: "", duration: "", priceEur: "" },
    ]);
  }

  function updateSession(clientId: string, patch: Partial<SessionDraft>) {
    setSessions((current) =>
      current.map((session) =>
        session.clientId === clientId ? { ...session, ...patch } : session,
      ),
    );
  }

  function removeSession(clientId: string) {
    setSessions((current) => current.filter((session) => session.clientId !== clientId));
  }

  function addTeamMember() {
    setTeamMembers((current) => [
      ...current,
      { name: "", role: "", photoUrl: null, photoFile: null },
    ]);
  }

  function updateTeamMember(index: number, patch: Partial<TeamMemberDraft>) {
    setTeamMembers((current) =>
      current.map((member, currentIndex) =>
        currentIndex === index ? { ...member, ...patch } : member,
      ),
    );
  }

  function removeTeamMember(index: number) {
    setTeamMembers((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const validationError = validateForm(
      draft,
      config,
      selectedTherapyIds,
      selectedHelpAreaIds,
      locations,
      logoFile,
      diplomaFile,
    );

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSaving(true);
    try {
      const accessToken = await getAccessToken();
      const photoUrl = photoFile
        ? await uploadPublicFile(photoFile, "therapist-photos")
        : draft.photoUrl;
      const logoUrl = logoFile
        ? await uploadPublicFile(logoFile, "therapist-photos")
        : draft.logoUrl;
      const nextGalleryUrls = await uploadGallery(
        galleryUrls,
        galleryFiles,
        config.galleryMaxFiles,
        config.isOrganisation,
      );
      const diplomaUpload =
        config.verificationUploadsEnabled && diplomaFile
          ? await uploadPrivateFile(diplomaFile, "verification-docs")
          : null;
      const extraUploads = config.verificationUploadsEnabled
        ? await Promise.all(
            extraDocuments.slice(0, 5).map((file) => uploadPrivateFile(file, "verification-docs")),
          )
        : [];
      const teamMembersPayload = await Promise.all(
        teamMembers
          .filter(
            (member) =>
              member.name.trim() || member.role.trim() || member.photoFile || member.photoUrl,
          )
          .map(async (member) => ({
            name: member.name.trim(),
            role: member.role.trim(),
            photo_url: member.photoFile
              ? await uploadPublicFile(member.photoFile, "therapist-photos")
              : member.photoUrl || null,
          })),
      );

      await saveProfessionalProfile({
        data: {
          therapistId: therapist.id,
          profile: {
            full_name: draft.fullName.trim(),
            professional_name: draft.professionalName.trim() || null,
            headline: draft.tagline.trim() || null,
            frase_clave: draft.tagline.trim() || null,
            especialidad:
              sortedTherapies.find((item) => selectedTherapyIds.includes(item.id))?.name ?? null,
            subespecialidades: selectedTherapyIds
              .map((id) => sortedTherapies.find((item) => item.id === id)?.name)
              .filter((item): item is string => Boolean(item)),
            modalities: deriveModalities(draft.sessionModalities),
            years_experience: therapist.years_experience ?? null,
            municipality_id: draft.municipalityId || null,
            city: draft.city.trim() || null,
            address: draft.address.trim() || null,
            lat: parseOptionalNumber(draft.lat),
            lng: parseOptionalNumber(draft.lng),
            whatsapp: draft.whatsapp.trim() || null,
            phone: draft.phone.trim() || null,
            email: draft.email.trim() || null,
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
            link_reserva: buildBookingLink(draft),
            sobre_mi: draft.sobreMi.trim() || null,
            approach_text: draft.approachText.trim() || null,
            differentiator_text: draft.differentiatorText.trim() || null,
            formacion: draft.formacion.trim() || null,
            experiencia: draft.experiencia.trim() || null,
            mission_text: draft.missionText.trim() || null,
            organisation_type: config.isOrganisation ? draft.organizationType.trim() || null : null,
            target_audience: config.isOrganisation
              ? draft.organizationPublicAudience
              : draft.targetAudience,
            accompaniment_modalities: config.isOrganisation
              ? draft.organizationActivities
              : draft.accompanimentModalities,
            session_modalities: draft.sessionModalities,
            home_visit_radius: draft.sessionModalities.includes("Presencial a domicilio")
              ? draft.homeVisitRadius || null
              : null,
            languages: draft.languages,
            facilities: config.isOrganisation ? draft.facilities : null,
            gallery_urls: config.isOrganisation ? nextGalleryUrls : null,
            team_members: config.isOrganisation ? teamMembersPayload : null,
            responsible_first_name: config.isOrganisation
              ? draft.responsibleFirstName.trim() || null
              : null,
            responsible_last_name: config.isOrganisation
              ? draft.responsibleLastName.trim() || null
              : null,
            responsible_role: config.isOrganisation ? draft.responsibleRole.trim() || null : null,
            responsible_email: config.isOrganisation ? draft.responsibleEmail.trim() || null : null,
            responsible_phone: config.isOrganisation ? draft.responsiblePhone.trim() || null : null,
            legal_entity_name: config.isOrganisation ? draft.legalEntityName.trim() || null : null,
            legal_entity_tax_id: config.isOrganisation
              ? draft.legalEntityTaxId.trim() || null
              : null,
            declares_legal_authority: config.isOrganisation ? draft.declaresLegalAuthority : false,
            organization_signature_name: config.isOrganisation
              ? draft.signatureName.trim() || null
              : null,
            has_liability_insurance: config.isProfessional ? draft.hasLiabilityInsurance : false,
            accepted_deontological_code: draft.acceptedDeontologicalCode,
            accepted_truthfulness: draft.acceptedTruthfulness,
            accepted_privacy_policy: draft.acceptedPrivacyPolicy,
            accepted_terms_of_use: draft.acceptedTermsOfUse,
            accepted_publication: draft.acceptedPublication,
            logo_url: config.logoEnabled ? logoUrl : null,
            photo_url: photoUrl,
          },
          therapyIds: selectedTherapyIds,
          helpAreaIds: selectedHelpAreaIds,
          sessions: sessions
            .filter((session) => session.name.trim())
            .map((session, index) => ({
              id: session.id,
              name: session.name,
              duration: session.duration || null,
              price_cents: parsePriceCents(session.priceEur),
              position: index,
            })),
          locations: locations.map((location) => ({
            id: location.id,
            center_name: location.centerName.trim(),
            address: location.address.trim() || null,
            municipality_id: location.municipalityId || null,
          })),
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (config.isProfessional && !diplomaFile && !therapist.verification_document_path) {
        toast.warning("Recuerda subir tu diploma si quieres completar la verificación.");
      }

      if (config.verificationUploadsEnabled && extraUploads.length > 0) {
        toast.success("Documentación subida correctamente.");
      }

      toast.success("Perfil guardado.");
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el perfil.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <section className="rounded-[2rem] border border-[#eadfce] bg-[#fff9f1] p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#dfcfbd] bg-white px-4 py-2 text-xs font-medium text-[#5a4c3e]">
              <ShieldCheck className="h-4 w-4" />
              Plan {config.label}
            </div>
            <h1 className="font-display text-4xl text-[#11100e]">Mi perfil público</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[#342b22]">
              Edita tu ficha con calma. Los cambios se guardan en una sola revisión para mantener el
              perfil claro y coherente.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-[#6d5b43]">
            <AnchorButton href="#general" label="Información General" />
            <AnchorButton href="#actividad" label="Actividad Profesional" />
            <AnchorButton href="#consultas" label="Consultas y Modalidades" />
            <AnchorButton href="#perfil" label="Experiencia y Perfil" />
            <AnchorButton href="#redes" label="Redes y Verificación" />
          </div>
        </div>
      </section>

      <section id="general" className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="rounded-[1.6rem] border border-[#eadfce] bg-white p-6 md:p-8">
          <SectionHeading
            icon={User}
            title="Información General"
            description="Tus datos principales y tu presentación visual."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label={config.isOrganisation ? "Nombre de la organización *" : "Nombre completo *"}
            >
              <Input
                value={draft.fullName}
                onChange={(e) => updateDraft("fullName", e.target.value)}
              />
            </Field>
            <Field label="Nombre profesional (opcional)">
              <Input
                value={draft.professionalName}
                onChange={(e) => updateDraft("professionalName", e.target.value)}
              />
            </Field>
            {config.isOrganisation && (
              <Field label="Tipo de organización *">
                <Select
                  value={draft.organizationType || "none"}
                  onValueChange={(value) =>
                    updateDraft("organizationType", value === "none" ? "" : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Selecciona tipo</SelectItem>
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
                    ].map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
            <Field label="Municipio principal *">
              <MunicipalitySelect
                value={draft.municipalityId}
                municipalities={sortedMunicipalities}
                onChange={(value) => updateDraft("municipalityId", value)}
              />
            </Field>
            <Field label="Isla">
              <ReadOnlyPill>Mallorca</ReadOnlyPill>
            </Field>
            <Field label="Correo electrónico *">
              <Input
                type="email"
                value={draft.email}
                onChange={(e) => updateDraft("email", e.target.value)}
              />
            </Field>
            <Field label="Teléfono">
              <Input value={draft.phone} onChange={(e) => updateDraft("phone", e.target.value)} />
            </Field>
            <Field label="WhatsApp *">
              <Input
                value={draft.whatsapp}
                onChange={(e) => updateDraft("whatsapp", e.target.value)}
                required
              />
            </Field>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Field label="Foto principal">
              <UploadBox
                file={photoFile}
                label="Subir foto"
                accept="image/*"
                onChange={setPhotoFile}
              />
            </Field>

            <UpgradeLock
              title="Logo profesional"
              description="El logo da más presencia a tu ficha. Disponible para planes superiores."
              requiredPlan="Profesional"
              isLocked={!config.logoEnabled}
            >
              <Field label={config.isOrganisation ? "Logo *" : "Logo profesional (opcional)"}>
                <UploadBox
                  file={logoFile}
                  label="Subir logo"
                  accept="image/*"
                  onChange={setLogoFile}
                />
              </Field>
            </UpgradeLock>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <p className="font-display font-medium text-[#342b22]">Vista previa de tu cabecera (ficha pública)</p>
            <div className="relative overflow-hidden rounded-2xl border border-[#eadfce] bg-[#f4eadb] p-6 md:p-8 shadow-sm">
              <img
                src={heroImg}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-45 pointer-events-none"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,#f4eadb_0%,rgba(244,234,219,0.95)_42%,rgba(244,234,219,0.55)_100%)] pointer-events-none" />

              <div className="relative flex flex-col sm:flex-row items-center gap-6 sm:gap-8 text-center sm:text-left">
                <div className="relative h-28 w-28 md:h-32 md:w-32 flex-shrink-0">
                  <div className="h-full w-full overflow-hidden rounded-full border-4 border-white/80 bg-[#eadfce] shadow-[0_15px_45px_rgba(80,54,24,0.14)]">
                    {displayPhotoUrl ? (
                      <img
                        src={displayPhotoUrl}
                        alt={draft.fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-display text-4xl text-[#9a866a]">
                        {draft.fullName?.[0] || "?"}
                      </div>
                    )}
                  </div>
                  {displayLogoUrl && (
                    <div className="absolute -left-1 top-1 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/80 bg-white shadow-md">
                      <img src={displayLogoUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full border border-[#eadfce] bg-[#f8efe4] text-[#9a7041] shadow-md">
                    <Leaf className="h-5 w-5" strokeWidth={1.3} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-2xl md:text-3xl font-semibold leading-none tracking-[-0.02em] text-[#1f3326] truncate">
                    {draft.fullName || "Tu nombre completo"}
                  </h3>
                  {draft.professionalName && (
                    <p className="mt-2 text-sm md:text-base text-[#5d5144] font-medium truncate">
                      {draft.professionalName}
                    </p>
                  )}
                  <p className="mt-1 text-xs md:text-sm text-[#6d5b43] italic line-clamp-1">
                    {draft.tagline || "Tu frase de presentación aparecerá aquí."}
                  </p>
                  
                  <div className="mt-4 flex flex-wrap justify-center sm:justify-start items-center gap-4 text-xs text-[#5d5144]">
                    <span className="inline-flex items-center gap-1.5 bg-white/50 backdrop-blur-[2px] px-3 py-1 rounded-full border border-[#eadfce]">
                      <MapPin className="h-3.5 w-3.5" /> {selectedMunicipality?.name || "Municipio"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-white/50 backdrop-blur-[2px] px-3 py-1 rounded-full border border-[#eadfce]">
                      <Monitor className="h-3.5 w-3.5" /> Presencial y Online
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AsideCards config={config} />
      </section>

      <section
        id="actividad"
        className="rounded-[1.6rem] border border-[#eadfce] bg-white p-6 md:p-8"
      >
        <SectionHeading
          icon={Heart}
          title="Actividad Profesional"
          description="Terapias, áreas de ayuda y públicos con los que trabajas."
        />

        <div className="grid gap-6 xl:grid-cols-2">
          <CatalogPicker
            title="Terapias y especialidades"
            description={
              config.isOrganisation
                ? "Busca los servicios de la organización."
                : "Busca tus terapias principales."
            }
            placeholder="Buscar una terapia..."
            items={sortedTherapies}
            selectedIds={selectedTherapyIds}
            maxSelection={config.therapyCap}
            search={therapySearch}
            onSearchChange={setTherapySearch}
            onChange={setSelectedTherapyIds}
            helperText={
              config.therapyCap ? `Plan Free: máximo ${config.therapyCap}.` : "Selección libre."
            }
            draggedIndex={draggedTherapyIndex}
            onDragIndexChange={setDraggedTherapyIndex}
          />

          <CatalogPicker
            title="Áreas de ayuda"
            description={
              config.isOrganisation
                ? "Añade todas las áreas que aborda la organización."
                : "Añade las áreas en las que acompañas."
            }
            placeholder="Buscar un área..."
            items={sortedHelpAreas}
            selectedIds={selectedHelpAreaIds}
            maxSelection={config.helpAreaCap}
            search={helpAreaSearch}
            onSearchChange={setHelpAreaSearch}
            onChange={setSelectedHelpAreaIds}
            helperText={
              config.helpAreaCap ? `Plan Free: máximo ${config.helpAreaCap}.` : "Selección libre."
            }
            draggedIndex={draggedHelpAreaIndex}
            onDragIndexChange={setDraggedHelpAreaIndex}
          />
        </div>

        <div className="mt-6 grid gap-6">
          <CheckboxGrid
            title={config.isOrganisation ? "Público" : "Público al que acompañas"}
            description={
              config.isOrganisation
                ? "Marca a quién se dirige la organización."
                : "Marca todos los públicos que forman parte de tu práctica."
            }
            items={config.isOrganisation ? organisationAudienceOptions : freeTargetAudienceOptions}
            values={config.isOrganisation ? draft.organizationPublicAudience : draft.targetAudience}
            onChange={(values) =>
              config.isOrganisation
                ? updateDraft("organizationPublicAudience", values)
                : updateDraft("targetAudience", values)
            }
          />

          <CheckboxGrid
            title={
              config.isOrganisation ? "Actividades organizadas" : "Modalidades de acompañamiento"
            }
            description={
              config.isOrganisation
                ? "Selecciona las actividades, eventos y formatos que organizas."
                : "Selecciona los formatos en los que ofreces tu trabajo."
            }
            items={config.isOrganisation ? organisationActivitiesOptions : accompanimentOptions}
            values={
              config.isOrganisation ? draft.organizationActivities : draft.accompanimentModalities
            }
            onChange={(values) =>
              config.isOrganisation
                ? updateDraft("organizationActivities", values)
                : updateDraft("accompanimentModalities", values)
            }
          />
        </div>
      </section>

      <section
        id="consultas"
        className="rounded-[1.6rem] border border-[#eadfce] bg-white p-6 md:p-8"
      >
        <SectionHeading
          icon={MapPin}
          title="Consultas y Modalidades"
          description="Dónde atiendes y qué tipo de sesiones ofreces."
        />

        <div className="grid gap-6">
          <CheckboxGrid
            title="Modalidades de sesión"
            description="Puedes ofrecer una o varias formas de atención."
            items={sessionModalityOptions}
            values={draft.sessionModalities}
            onChange={(values) => updateDraft("sessionModalities", values)}
            helperByItem={{
              "A distancia":
                "A distancia significa acompañamiento remoto, sin videollamada ni presencia física.",
            }}
          />

          {draft.sessionModalities.includes("Presencial a domicilio") && (
            <Field label="Radio de desplazamiento">
              <div className="grid gap-3 md:grid-cols-5">
                {homeVisitRadiusOptions.map((option) => {
                  const selected = draft.homeVisitRadius === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => updateDraft("homeVisitRadius", option)}
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
                      ? "El plan Profesional permite varias consultas."
                      : "El plan Free incluye una única ubicación."}
                </p>
              </div>
              {(config.extraLocationEnabled || config.isOrganisation) && (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={addLocation}
                >
                  <Plus className="h-4 w-4" />{" "}
                  {config.isOrganisation ? "Añadir otra ubicación" : "Añadir otra consulta"}
                </Button>
              )}
            </div>

            {locations.map((location, index) => {
              const card = (
                <div className="rounded-3xl border border-[#eadfce] bg-[#fffaf4] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#5d5144]">
                      <MapPin className="h-4 w-4" />
                      {index === 0
                        ? "Ubicación principal"
                        : config.isOrganisation
                          ? `Ubicación ${index + 1}`
                          : `Consulta ${index + 1}`}
                    </div>
                    {index > 0 && (
                      <button
                        type="button"
                        className="text-xs font-medium text-[#8a6550] hover:underline"
                        onClick={() => removeLocation(index)}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Nombre del centro *">
                      <Input
                        value={location.centerName}
                        onChange={(event) =>
                          updateLocation(index, { centerName: event.target.value })
                        }
                      />
                    </Field>
                    <Field label="Dirección *">
                      <Input
                        value={location.address}
                        onChange={(event) => updateLocation(index, { address: event.target.value })}
                      />
                    </Field>
                    <Field label="Municipio *">
                      <MunicipalitySelect
                        value={location.municipalityId}
                        municipalities={sortedMunicipalities}
                        onChange={(value) => updateLocation(index, { municipalityId: value })}
                      />
                    </Field>
                    <Field label="Isla">
                      <ReadOnlyPill>Mallorca</ReadOnlyPill>
                    </Field>
                  </div>
                </div>
              );

              if (index > 0 && !config.extraLocationEnabled && !config.isOrganisation) {
                return (
                  <UpgradeLock
                    key={location.id ?? index}
                    title="Ubicaciones adicionales"
                    description="El plan Free solo incluye una ubicación. Actualiza para mostrar varias consultas."
                    requiredPlan="Profesional"
                    isLocked
                  >
                    {card}
                  </UpgradeLock>
                );
              }

              return <div key={location.id ?? index}>{card}</div>;
            })}
          </div>

          {config.isOrganisation && (
            <div className="grid gap-6 md:grid-cols-2">
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
                onChange={(values) => updateDraft("facilities", values)}
              />
              <Field label="Galería de imágenes">
                <MultiUploadBox files={galleryFiles} onChange={setGalleryFiles} maxFiles={15} />
                {galleryUrls.length > 0 && (
                  <div className="mt-3 grid gap-2">
                    {galleryUrls.map((url, index) => (
                      <div
                        key={url}
                        className="flex items-center gap-2 rounded-xl border border-[#eadfce] bg-white px-3 py-2 text-xs text-[#5d5144]"
                      >
                        <img src={url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        <span className="flex-1 truncate">{url}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setGalleryUrls((current) =>
                              current.filter((_, currentIndex) => currentIndex !== index),
                            )
                          }
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#f2e6d7] text-[#7f6046]"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Field>
            </div>
          )}

          <SectionHeading
            icon={Monitor}
            title="Sesiones"
            description="Opcional. Se mantiene si ya tienes sesiones creadas."
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#6d5b43]">Puedes guardar una o varias sesiones.</p>
              <Button type="button" variant="outline" className="rounded-full" onClick={addSession}>
                <Plus className="h-4 w-4" /> Añadir sesión
              </Button>
            </div>
            {sessions.map((session) => (
              <div
                key={session.clientId}
                className="grid gap-3 rounded-2xl border border-[#eadfce] bg-white p-4 md:grid-cols-12"
              >
                <div className="space-y-2 md:col-span-5">
                  <Label>Nombre</Label>
                  <Input
                    value={session.name}
                    onChange={(event) =>
                      updateSession(session.clientId, { name: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Label>Duración</Label>
                  <Input
                    value={session.duration}
                    onChange={(event) =>
                      updateSession(session.clientId, { duration: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Label>Precio</Label>
                  <Input
                    value={session.priceEur}
                    onChange={(event) =>
                      updateSession(session.clientId, { priceEur: event.target.value })
                    }
                  />
                </div>
                <div className="flex items-end md:col-span-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeSession(session.clientId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="perfil" className="rounded-[1.6rem] border border-[#eadfce] bg-white p-6 md:p-8">
        <SectionHeading
          icon={Building2}
          title="Experiencia y Perfil"
          description="Cómo te presentas, qué te diferencia y cómo cuentas tu recorrido."
        />

        {config.isOrganisation ? (
          <div className="grid gap-6">
            <Field label="Frase de presentación *">
              <CharacterLimitedInput
                value={draft.tagline}
                maxLength={120}
                onChange={(value) => updateDraft("tagline", value)}
              />
            </Field>
            <Field label="Quiénes somos *">
              <CharacterLimitedTextarea
                value={draft.sobreMi}
                maxLength={3000}
                onChange={(value) => updateDraft("sobreMi", value)}
                minHeight="min-h-44"
              />
            </Field>
            <Field label="Nuestra misión *">
              <CharacterLimitedTextarea
                value={draft.missionText}
                maxLength={2000}
                onChange={(value) => updateDraft("missionText", value)}
                minHeight="min-h-40"
              />
            </Field>
            <Field label="Qué nos diferencia (opcional)">
              <CharacterLimitedTextarea
                value={draft.differentiatorText}
                maxLength={1000}
                onChange={(value) => updateDraft("differentiatorText", value)}
                minHeight="min-h-32"
              />
            </Field>
            <CheckboxGrid
              title="Idiomas disponibles"
              description="Selecciona los idiomas en los que la organización puede atender."
              items={organisationLanguages}
              values={draft.languages}
              onChange={(values) => updateDraft("languages", values)}
            />
            <TeamEditor
              members={teamMembers}
              onAdd={addTeamMember}
              onChange={updateTeamMember}
              onRemove={removeTeamMember}
            />
          </div>
        ) : (
          <div className="grid gap-6">
            <Field label="Frase de presentación *">
              <CharacterLimitedInput
                value={draft.tagline}
                maxLength={120}
                onChange={(value) => updateDraft("tagline", value)}
              />
            </Field>
            <Field label="Presentación">
              <CharacterLimitedTextarea
                value={draft.sobreMi}
                maxLength={config.presentationMaxLength}
                onChange={(value) => updateDraft("sobreMi", value)}
                minHeight="min-h-44"
              />
            </Field>

            <UpgradeLock
              title="Contenido ampliado"
              description="Amplía tu biografía con enfoque, diferenciador y formación en el plan Profesional."
              requiredPlan="Profesional"
              isLocked={!config.isProfessional}
            >
              <div className="grid gap-6">
                <Field label="Mi enfoque">
                  <CharacterLimitedTextarea
                    value={draft.approachText}
                    maxLength={2000}
                    onChange={(value) => updateDraft("approachText", value)}
                    minHeight="min-h-40"
                  />
                </Field>
                <Field label="Qué me diferencia (opcional)">
                  <CharacterLimitedTextarea
                    value={draft.differentiatorText}
                    maxLength={1000}
                    onChange={(value) => updateDraft("differentiatorText", value)}
                    minHeight="min-h-32"
                  />
                </Field>
                <Field label="Formación principal">
                  <Textarea
                    value={draft.formacion}
                    onChange={(event) => updateDraft("formacion", event.target.value)}
                    className="min-h-44"
                  />
                </Field>
                <Field label="Idiomas">
                  <CheckboxGrid
                    title="Idiomas"
                    description="Selecciona los idiomas en los que puedes atender."
                    items={professionalLanguages}
                    values={draft.languages}
                    onChange={(values) => updateDraft("languages", values)}
                    columns="md:grid-cols-2 lg:grid-cols-3"
                  />
                </Field>
              </div>
            </UpgradeLock>
          </div>
        )}
      </section>

      <section id="redes" className="rounded-[1.6rem] border border-[#eadfce] bg-white p-6 md:p-8">
        <SectionHeading
          icon={ShieldCheck}
          title="Redes y Verificación"
          description="Contactos, visibilidad y compromisos finales."
        />

        <div className="grid gap-6">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Página web">
              <Input
                value={draft.website}
                onChange={(e) => updateDraft("website", e.target.value)}
              />
            </Field>
            <Field label="Instagram">
              <Input
                value={draft.instagramUrl}
                onChange={(e) => updateDraft("instagramUrl", e.target.value)}
              />
            </Field>
          </div>

          <UpgradeLock
            title="Redes y enlaces ampliados"
            description="Facebook, LinkedIn, YouTube, Calendly, Fresha y otras plataformas están disponibles en los planes superiores."
            requiredPlan="Profesional"
            isLocked={!config.socialLinksEnabled}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Facebook">
                <Input
                  value={draft.facebookUrl}
                  onChange={(e) => updateDraft("facebookUrl", e.target.value)}
                />
              </Field>
              <Field label="LinkedIn">
                <Input
                  value={draft.linkedinUrl}
                  onChange={(e) => updateDraft("linkedinUrl", e.target.value)}
                />
              </Field>
              <Field label="YouTube">
                <Input
                  value={draft.youtubeUrl}
                  onChange={(e) => updateDraft("youtubeUrl", e.target.value)}
                />
              </Field>
              <Field label="Calendly">
                <Input
                  value={draft.calendlyUrl}
                  onChange={(e) => updateDraft("calendlyUrl", e.target.value)}
                />
              </Field>
              {config.isProfessional && (
                <>
                  <Field label="Fresha">
                    <Input
                      value={draft.freshaUrl}
                      onChange={(e) => updateDraft("freshaUrl", e.target.value)}
                    />
                  </Field>
                  <Field label="WhatsApp Business">
                    <Input
                      value={draft.whatsappBusinessUrl}
                      onChange={(e) => updateDraft("whatsappBusinessUrl", e.target.value)}
                    />
                  </Field>
                </>
              )}
              <Field label="Otra plataforma">
                <Input
                  value={draft.otherBookingUrl}
                  onChange={(e) => updateDraft("otherBookingUrl", e.target.value)}
                />
              </Field>
            </div>
          </UpgradeLock>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="WhatsApp visible en el perfil">
              <BinaryToggle
                value={draft.showWhatsappPublic}
                onChange={(value) => updateDraft("showWhatsappPublic", value)}
              />
            </Field>
            <Field label="Correo visible en el perfil">
              <BinaryToggle
                value={draft.showEmailPublic}
                onChange={(value) => updateDraft("showEmailPublic", value)}
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
                onChange={(value) => updateDraft("hasLiabilityInsurance", value)}
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
                <MultiUploadBox files={extraDocuments} onChange={setExtraDocuments} maxFiles={5} />
              </Field>
            </div>
          )}

          {config.isOrganisation && (
            <div className="grid gap-5 rounded-2xl border border-[#eadfce] bg-[#fffaf4] p-5 md:grid-cols-2">
              <Field label="Responsable de la organización — Nombre *">
                <Input
                  value={draft.responsibleFirstName}
                  onChange={(e) => updateDraft("responsibleFirstName", e.target.value)}
                />
              </Field>
              <Field label="Apellidos *">
                <Input
                  value={draft.responsibleLastName}
                  onChange={(e) => updateDraft("responsibleLastName", e.target.value)}
                />
              </Field>
              <Field label="Cargo *">
                <Input
                  value={draft.responsibleRole}
                  onChange={(e) => updateDraft("responsibleRole", e.target.value)}
                />
              </Field>
              <Field label="Email *">
                <Input
                  type="email"
                  value={draft.responsibleEmail}
                  onChange={(e) => updateDraft("responsibleEmail", e.target.value)}
                />
              </Field>
              <Field label="Teléfono *">
                <Input
                  value={draft.responsiblePhone}
                  onChange={(e) => updateDraft("responsiblePhone", e.target.value)}
                />
              </Field>
              <Field label="Nombre legal *">
                <Input
                  value={draft.legalEntityName}
                  onChange={(e) => updateDraft("legalEntityName", e.target.value)}
                />
              </Field>
              <Field label="CIF/NIF *">
                <Input
                  value={draft.legalEntityTaxId}
                  onChange={(e) => updateDraft("legalEntityTaxId", e.target.value)}
                />
              </Field>
              <Field label="Nombre completo del firmante *">
                <Input
                  value={draft.signatureName}
                  onChange={(e) => updateDraft("signatureName", e.target.value)}
                />
              </Field>
              <div className="md:col-span-2 space-y-3">
                <ConsentCheckbox
                  checked={draft.declaresLegalAuthority}
                  onChange={(value) => updateDraft("declaresLegalAuthority", value)}
                >
                  Declaro representar legalmente o contar con autorización para actuar en nombre de
                  esta organización.
                </ConsentCheckbox>
                <ConsentCheckbox
                  checked={draft.acceptedTruthfulness}
                  onChange={(value) => updateDraft("acceptedTruthfulness", value)}
                >
                  Declaro que la información aportada es veraz.
                </ConsentCheckbox>
                <ConsentCheckbox
                  checked={draft.acceptedDeontologicalCode}
                  onChange={(value) => updateDraft("acceptedDeontologicalCode", value)}
                >
                  He leído y acepto el Código Deontológico de Mallorca Holística.
                </ConsentCheckbox>
                <ConsentCheckbox
                  checked={draft.acceptedPrivacyPolicy}
                  onChange={(value) => updateDraft("acceptedPrivacyPolicy", value)}
                >
                  Acepto la Política de Privacidad.
                </ConsentCheckbox>
                <ConsentCheckbox
                  checked={draft.acceptedTermsOfUse}
                  onChange={(value) => updateDraft("acceptedTermsOfUse", value)}
                >
                  Acepto las Condiciones de Uso.
                </ConsentCheckbox>
                <ConsentCheckbox
                  checked={draft.acceptedPublication}
                  onChange={(value) => updateDraft("acceptedPublication", value)}
                >
                  Autorizo la publicación de mi perfil en Mallorca Holística.
                </ConsentCheckbox>
              </div>
              <div className="md:col-span-2 rounded-2xl border border-[#eadfce] bg-[#f7efe7] p-5 text-sm leading-7 text-[#5d5144]">
                <p className="font-medium text-[#342b22]">Firma</p>
                <p>
                  Nombre completo del firmante: <strong>{draft.signatureName || "—"}</strong>
                </p>
                <p>(Fecha, hora e IP registradas automáticamente)</p>
              </div>
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <ConsentCheckbox
              checked={draft.acceptedDeontologicalCode}
              onChange={(value) => updateDraft("acceptedDeontologicalCode", value)}
            >
              He leído y acepto el Código Deontológico de Mallorca Holística.
            </ConsentCheckbox>
            <ConsentCheckbox
              checked={draft.acceptedTruthfulness}
              onChange={(value) => updateDraft("acceptedTruthfulness", value)}
            >
              Declaro que toda la información aportada es veraz y está actualizada.
            </ConsentCheckbox>
            <ConsentCheckbox
              checked={draft.acceptedPrivacyPolicy}
              onChange={(value) => updateDraft("acceptedPrivacyPolicy", value)}
            >
              Acepto la Política de Privacidad.
            </ConsentCheckbox>
            <ConsentCheckbox
              checked={draft.acceptedTermsOfUse}
              onChange={(value) => updateDraft("acceptedTermsOfUse", value)}
            >
              Acepto las Condiciones de Uso.
            </ConsentCheckbox>
            <ConsentCheckbox
              checked={draft.acceptedPublication}
              onChange={(value) => updateDraft("acceptedPublication", value)}
            >
              Autorizo la publicación de mi perfil en Mallorca Holística.
            </ConsentCheckbox>
          </div>
        </div>
      </section>

      <footer className="flex flex-col gap-4 border-t border-[#eadfce] pt-6 md:flex-row md:items-center md:justify-between">
        <span className="text-xs text-[#5d5144]">
          <Lock className="mr-2 inline h-4 w-4" />
          Guardamos tu perfil cuando finalices los cambios.
        </span>
        <Button
          type="submit"
          size="lg"
          disabled={saving}
          className="rounded-full bg-[#526046] px-8 text-white hover:bg-[#435039]"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </footer>
    </form>
  );
}

function AsideCards({ config }: { config: ReturnType<typeof getOnboardingPlanConfig> }) {
  return (
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
  );
}

function AnchorButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="rounded-full border border-[#eadfce] bg-white px-4 py-2 hover:bg-[#fffaf4]"
    >
      {label}
    </a>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center gap-2 text-[#526046]">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-[0.14em]">{title}</span>
      </div>
      <p className="text-sm text-[#6d5b43]">{description}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm text-[#342b22]">{label}</Label>
      {children}
    </div>
  );
}

function ReadOnlyPill({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-[#d8c6b0] bg-[#fffaf4] px-3 py-2 text-sm text-[#5d5144]">
      {children}
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
  items: { id: string; name: string }[];
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

function CheckboxGrid({
  title,
  description,
  items,
  values,
  onChange,
  helperByItem,
  columns = "md:grid-cols-2 lg:grid-cols-3",
}: {
  title: string;
  description: string;
  items: string[];
  values: string[];
  onChange: (values: string[]) => void;
  helperByItem?: Record<string, string>;
  columns?: string;
}) {
  return (
    <div className="space-y-4 rounded-3xl border border-[#eadfce] bg-[#fffaf4] p-5">
      <div>
        <h4 className="font-display text-lg text-[#11100e]">{title}</h4>
        <p className="mt-1 text-sm text-[#6d5b43]">{description}</p>
      </div>
      <div className={`grid gap-3 ${columns}`}>
        {items.map((item) => (
          <label
            key={item}
            className="rounded-2xl border border-[#eadfce] bg-white px-4 py-3 text-sm text-[#342b22]"
          >
            <div className="flex items-start gap-2">
              <Checkbox
                checked={values.includes(item)}
                onCheckedChange={() => onChange(toggleValue(values, item))}
              />
              <div className="space-y-1">
                <span className="block leading-6">{item}</span>
                {helperByItem?.[item] && (
                  <span className="block text-xs text-[#8c7a66]">{helperByItem[item]}</span>
                )}
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

function UploadBox({
  file,
  label,
  accept,
  onChange,
  previewUrl,
  helper,
}: {
  file: File | null;
  label: string;
  accept: string;
  onChange: (file: File | null) => void;
  previewUrl?: string;
  helper?: string;
}) {
  const inputId = `${label}-${Math.random().toString(36).slice(2)}`;
  return (
    <div className="space-y-3">
      <label
        htmlFor={inputId}
        className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-dashed border-[#d8c6b0] bg-white px-4 py-5 text-sm text-[#5d5144]"
      >
        <div className="flex items-center gap-2 text-[#342b22]">
          <Upload className="h-4 w-4" />
          <span>{label}</span>
        </div>
        <input
          id={inputId}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        />
        <span>{file?.name || previewUrl || "Ningún archivo seleccionado"}</span>
      </label>
      {helper && <p className="text-xs text-[#8c7a66]">{helper}</p>}
      {previewUrl && !file && (
        <img src={previewUrl} alt="" className="h-40 w-full rounded-2xl object-cover" />
      )}
    </div>
  );
}

function MultiUploadBox({
  files,
  onChange,
  maxFiles,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles: number;
}) {
  const inputId = `multi-upload-${Math.random().toString(36).slice(2)}`;
  return (
    <div className="space-y-3">
      <label
        htmlFor={inputId}
        className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-dashed border-[#d8c6b0] bg-white px-4 py-5 text-sm text-[#5d5144]"
      >
        <div className="flex items-center gap-2 text-[#342b22]">
          <Upload className="h-4 w-4" />
          <span>Subir archivos</span>
        </div>
        <input
          id={inputId}
          type="file"
          accept="image/*,.pdf"
          multiple
          className="hidden"
          onChange={(event) => {
            const next = Array.from(event.target.files ?? []).slice(0, maxFiles);
            onChange(next);
          }}
        />
        <span>{files.length ? `${files.length} archivo(s)` : "Ningún archivo seleccionado"}</span>
      </label>
      {files.length > 0 && (
        <div className="grid gap-2">
          {files.map((file) => (
            <div
              key={`${file.name}-${file.size}`}
              className="rounded-xl border border-[#eadfce] bg-white px-3 py-2 text-xs text-[#5d5144]"
            >
              {file.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CharacterLimitedInput({
  value,
  maxLength,
  onChange,
}: {
  value: string;
  maxLength: number;
  onChange: (value: string) => void;
}) {
  const safeValue = value || "";
  const limit = maxLength || 120;
  return (
    <div className="space-y-2">
      <Input
        value={safeValue}
        maxLength={limit}
        onChange={(event) => onChange(event.target.value.slice(0, limit))}
      />
      <div className="text-right text-xs text-[#6d5b43]">
        {safeValue.length}/{limit}
      </div>
    </div>
  );
}

function CharacterLimitedTextarea({
  value,
  maxLength,
  onChange,
  minHeight,
}: {
  value: string;
  maxLength: number;
  onChange: (value: string) => void;
  minHeight: string;
}) {
  const safeValue = value || "";
  const limit = maxLength || 3000;
  return (
    <div className="space-y-2">
      <Textarea
        value={safeValue}
        maxLength={limit}
        onChange={(event) => onChange(event.target.value.slice(0, limit))}
        className={minHeight}
      />
      <div className="text-right text-xs text-[#6d5b43]">
        {safeValue.length}/{limit}
      </div>
    </div>
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
    <Select value={value || "none"} onValueChange={(next) => onChange(next === "none" ? "" : next)}>
      <SelectTrigger>
        <SelectValue placeholder="Selecciona municipio" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Sin municipio</SelectItem>
        {municipalities.map((municipality) => (
          <SelectItem key={municipality.id} value={municipality.id}>
            {municipality.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function TeamEditor({
  members,
  onAdd,
  onChange,
  onRemove,
}: {
  members: TeamMemberDraft[];
  onAdd: () => void;
  onChange: (index: number, patch: Partial<TeamMemberDraft>) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="space-y-4 rounded-3xl border border-[#eadfce] bg-[#fffaf4] p-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h4 className="font-display text-lg text-[#11100e]">Equipo</h4>
          <p className="mt-1 text-sm text-[#6d5b43]">
            Añade a las personas clave del centro si quieres mostrar el equipo.
          </p>
        </div>
        <Button type="button" variant="outline" className="rounded-full" onClick={onAdd}>
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
                  onClick={() => onRemove(index)}
                >
                  Eliminar
                </button>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Nombre">
                <Input
                  value={member.name}
                  onChange={(event) => onChange(index, { name: event.target.value })}
                />
              </Field>
              <Field label="Especialidad / Cargo">
                <Input
                  value={member.role}
                  onChange={(event) => onChange(index, { role: event.target.value })}
                />
              </Field>
              <Field label="Foto">
                <UploadBox
                  file={member.photoFile}
                  previewUrl={member.photoUrl ?? undefined}
                  label="Subir foto"
                  accept="image/*"
                  onChange={(file) => onChange(index, { photoFile: file })}
                />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildDraft(
  therapist: TherapistEditorData,
  centers: CenterRow[],
  isOrganisation: boolean,
): ProfileDraft {
  return {
    fullName: therapist.full_name ?? "",
    professionalName: therapist.professional_name ?? "",
    organizationName: therapist.professional_name ?? "",
    organizationType: therapist.organisation_type ?? "",
    municipalityId: therapist.municipality_id ?? "",
    city: therapist.city ?? "",
    address: therapist.address ?? "",
    lat: therapist.lat?.toString() ?? "",
    lng: therapist.lng?.toString() ?? "",
    email: therapist.email ?? "",
    phone: therapist.phone ?? "",
    whatsapp: therapist.whatsapp ?? "",
    photoUrl: therapist.photo_url ?? "",
    logoUrl: therapist.logo_url ?? "",
    headline: therapist.headline ?? "",
    sobreMi: therapist.sobre_mi ?? "",
    approachText: therapist.approach_text ?? "",
    differentiatorText: therapist.differentiator_text ?? "",
    missionText: therapist.mission_text ?? "",
    tagline: therapist.tagline ?? therapist.frase_clave ?? "",
    formacion: therapist.formacion ?? "",
    experiencia: therapist.experiencia ?? "",
    website: therapist.website ?? "",
    instagramUrl: therapist.instagram_url ?? "",
    facebookUrl: therapist.facebook_url ?? "",
    linkedinUrl: therapist.linkedin_url ?? "",
    youtubeUrl: therapist.youtube_url ?? "",
    calendlyUrl: therapist.calendly_url ?? "",
    freshaUrl: therapist.fresha_url ?? "",
    whatsappBusinessUrl: therapist.whatsapp_business_url ?? "",
    otherBookingUrl: therapist.other_booking_url ?? "",
    showWhatsappPublic: therapist.show_whatsapp_public ?? false,
    showEmailPublic: therapist.show_email_public ?? false,
    hasLiabilityInsurance: therapist.has_liability_insurance ?? false,
    acceptedDeontologicalCode: therapist.accepted_deontological_code ?? false,
    acceptedTruthfulness: therapist.accepted_truthfulness ?? false,
    acceptedPrivacyPolicy: therapist.accepted_privacy_policy ?? false,
    acceptedTermsOfUse: therapist.accepted_terms_of_use ?? false,
    acceptedPublication: therapist.accepted_publication ?? false,
    declaresLegalAuthority: therapist.declares_legal_authority ?? false,
    legalEntityName: therapist.legal_entity_name ?? "",
    legalEntityTaxId: therapist.legal_entity_tax_id ?? "",
    responsibleFirstName: therapist.responsible_first_name ?? "",
    responsibleLastName: therapist.responsible_last_name ?? "",
    responsibleRole: therapist.responsible_role ?? "",
    responsibleEmail: therapist.responsible_email ?? "",
    responsiblePhone: therapist.responsible_phone ?? "",
    signatureName: therapist.organization_signature_name ?? "",
    targetAudience: therapist.target_audience ?? [],
    accompanimentModalities: therapist.accompaniment_modalities ?? [],
    sessionModalities: therapist.session_modalities ?? [],
    homeVisitRadius: therapist.home_visit_radius ?? "",
    languages: therapist.languages ?? [],
    facilities: therapist.facilities ?? [],
    galleryUrls: Array.isArray(therapist.gallery_urls) ? therapist.gallery_urls : [],
    organizationPublicAudience: therapist.target_audience ?? [],
    organizationActivities: therapist.accompaniment_modalities ?? [],
    therapyIds: (therapist.therapist_therapies ?? [])
      .map((row) => row.therapy_id)
      .filter((id): id is string => Boolean(id)),
    helpAreaIds: (therapist.therapist_help_areas ?? [])
      .map((row) => row.help_area_id)
      .filter((id): id is string => Boolean(id)),
  };
}

function buildLocations(
  therapist: TherapistEditorData,
  centers: CenterRow[],
  isOrganisation: boolean,
): LocationDraft[] {
  const mapped = centers.map((center) => ({
    id: center.id,
    centerName: center.name ?? "",
    address: center.address ?? "",
    municipalityId: center.municipality_id ?? "",
  }));

  if (mapped.length > 0) return mapped;

  return [
    {
      id: therapist.center_id ?? null,
      centerName: therapist.center_name ?? "",
      address: therapist.address ?? "",
      municipalityId: therapist.municipality_id ?? "",
    },
  ];
}

function buildTeamMembers(
  teamMembers: Database["public"]["Tables"]["therapists"]["Row"]["team_members"],
) {
  if (!Array.isArray(teamMembers) || teamMembers.length === 0) {
    return [{ name: "", role: "", photoUrl: null, photoFile: null }];
  }

  return teamMembers.map((member) => ({
    name:
      typeof (member as { name?: unknown }).name === "string"
        ? ((member as { name?: string }).name ?? "")
        : "",
    role:
      typeof (member as { role?: unknown }).role === "string"
        ? ((member as { role?: string }).role ?? "")
        : "",
    photoUrl:
      typeof (member as { photo_url?: unknown }).photo_url === "string"
        ? ((member as { photo_url?: string }).photo_url ?? null)
        : null,
    photoFile: null,
  }));
}

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function deriveModalities(modalities: string[]) {
  const values: Array<"presencial" | "online" | "domicilio"> = [];
  if (modalities.includes("Presencial en consulta")) values.push("presencial");
  if (modalities.includes("Online (videollamada)")) values.push("online");
  if (modalities.includes("Presencial a domicilio")) values.push("domicilio");
  return values.length ? values : ["presencial"];
}

function buildBookingLink(draft: ProfileDraft) {
  return draft.calendlyUrl.trim() || draft.freshaUrl.trim() || draft.otherBookingUrl.trim() || null;
}

function parseOptionalNumber(value: string) {
  const trimmed = value.trim().replace(",", ".");
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function parsePriceCents(value: string) {
  const trimmed = value.trim().replace(",", ".");
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : null;
}

function validateForm(
  draft: ProfileDraft,
  config: ReturnType<typeof getOnboardingPlanConfig>,
  therapyIds: string[],
  helpAreaIds: string[],
  locations: LocationDraft[],
  logoFile: File | null,
  diplomaFile: File | null,
) {
  if (!draft.fullName.trim()) return "Completa el nombre.";
  if (!draft.municipalityId) return "Selecciona un municipio.";
  if (!draft.email.trim()) return "Añade el correo electrónico.";
  if (!draft.whatsapp.trim()) return "Añade el WhatsApp.";
  if (therapyIds.length === 0) return "Selecciona al menos una terapia.";
  if (helpAreaIds.length === 0) return "Selecciona al menos un área de ayuda.";
  if (locations.length === 0) return "Añade al menos una ubicación.";
  if (!locations[0].centerName.trim()) return "Añade el nombre de la ubicación principal.";
  if (!locations[0].address.trim()) return "Añade la dirección de la ubicación principal.";
  if (!locations[0].municipalityId) return "Selecciona el municipio de la ubicación principal.";
  if (!draft.tagline.trim()) return "Añade una frase de presentación.";
  if (!draft.sobreMi.trim()) return "Añade tu presentación.";
  if (!draft.acceptedDeontologicalCode) return "Debes aceptar el Código Deontológico.";
  if (!draft.acceptedTruthfulness) return "Debes declarar que la información es veraz.";
  if (!draft.acceptedPrivacyPolicy) return "Debes aceptar la Política de Privacidad.";
  if (!draft.acceptedTermsOfUse) return "Debes aceptar las Condiciones de Uso.";
  if (!draft.acceptedPublication) return "Debes autorizar la publicación del perfil.";
  if (config.logoRequired && !logoFile && !draft.logoUrl.trim())
    return "Añade el logo de la organización.";

  if (config.isProfessional) {
    if (!draft.hasLiabilityInsurance) return "Debes confirmar tu seguro de responsabilidad civil.";
    if (!diplomaFile) return "Debes subir al menos un diploma o certificado.";
  }

  if (config.isOrganisation) {
    if (!draft.fullName.trim()) return "Completa el nombre de la organización.";
    if (!draft.organizationType.trim()) return "Selecciona el tipo de organización.";
    if (!draft.responsibleFirstName.trim()) return "Añade el nombre de la persona responsable.";
    if (!draft.responsibleLastName.trim()) return "Añade los apellidos de la persona responsable.";
    if (!draft.responsibleRole.trim()) return "Añade el cargo de la persona responsable.";
    if (!draft.responsibleEmail.trim()) return "Añade el email de la persona responsable.";
    if (!draft.responsiblePhone.trim()) return "Añade el teléfono de la persona responsable.";
    if (!draft.legalEntityName.trim()) return "Añade el nombre legal de la entidad.";
    if (!draft.legalEntityTaxId.trim()) return "Añade el CIF/NIF de la entidad.";
    if (!draft.signatureName.trim()) return "Añade el nombre completo del firmante.";
    if (!draft.declaresLegalAuthority) {
      return "Debes declarar autorización para actuar en nombre de la organización.";
    }
  }

  if (config.therapyCap && therapyIds.length > config.therapyCap)
    return "Has superado el límite de terapias.";
  if (config.helpAreaCap && helpAreaIds.length > config.helpAreaCap)
    return "Has superado el límite de áreas.";
  if (config.locationLimit && locations.length > config.locationLimit)
    return "Has superado el límite de ubicaciones.";

  return null;
}

async function uploadPublicFile(file: File, bucket: string) {
  const path = await uploadFile(file, bucket);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

async function uploadPrivateFile(file: File, bucket: string) {
  const path = await uploadFile(file, bucket);
  return {
    path,
    name: file.name,
  };
}

async function uploadFile(file: File, bucket: string) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const { error } = await supabase.storage.from(bucket).upload(fileName, file, { upsert: true });
  if (error) throw error;
  return fileName;
}

async function uploadGallery(
  existingUrls: string[],
  files: File[],
  maxFiles: number | null,
  isOrganisation: boolean,
) {
  if (!isOrganisation && !maxFiles) return [];
  const uploads = await Promise.all(
    files
      .slice(0, maxFiles ?? files.length)
      .map((file) => uploadPublicFile(file, "therapist-photos")),
  );
  return [...existingUrls, ...uploads].slice(0, maxFiles ?? existingUrls.length + uploads.length);
}

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("No active session found.");
  return session.access_token;
}
