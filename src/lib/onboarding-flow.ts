export type OnboardingPlan = "presencia" | "profesional" | "centro";

export type OnboardingPlanConfig = {
  slug: OnboardingPlan;
  label: string;
  title: string;
  isProfessional: boolean;
  isOrganisation: boolean;
  therapyCap: number | null;
  helpAreaCap: number | null;
  locationLimit: number | null;
  presentationMaxLength: number;
  approachMaxLength: number;
  differentiatorMaxLength: number;
  formationMaxItems: number | null;
  logoEnabled: boolean;
  logoRequired: boolean;
  socialLinksEnabled: boolean;
  extraLocationEnabled: boolean;
  verificationUploadsEnabled: boolean;
  galleryMaxFiles: number | null;
};

export type OnboardingPlanSource = {
  searchPlan?: string | null;
  metadataPlan?: string | null;
  profilePlanSlug?: string | null;
  pendingPlanSlug?: string | null;
};

const presenciaPlanSlugs = new Set<string>(["presencia"]);
const professionalPlanSlugs = new Set<string>(["profesional"]);
const organisationPlanSlugs = new Set<string>(["centros-organizadores"]);

export function resolveOnboardingPlan(source: OnboardingPlanSource): OnboardingPlan {
  const candidate =
    source.searchPlan ?? source.metadataPlan ?? source.profilePlanSlug ?? source.pendingPlanSlug;
  if (candidate && organisationPlanSlugs.has(candidate)) return "centro";
  if (candidate && presenciaPlanSlugs.has(candidate)) return "presencia";
  return "profesional";
}

export function resolveOnboardingPlanSlug(source: OnboardingPlanSource): string {
  const candidate =
    source.searchPlan ?? source.metadataPlan ?? source.profilePlanSlug ?? source.pendingPlanSlug;
  if (candidate && organisationPlanSlugs.has(candidate)) return "centros-organizadores";
  if (candidate && presenciaPlanSlugs.has(candidate)) return "presencia";
  return "profesional";
}

export function getOnboardingPlanConfig(plan: OnboardingPlan): OnboardingPlanConfig {
  if (plan === "profesional") {
    return {
      slug: plan,
      label: "Profesional",
      title: "Plan Profesional",
      isProfessional: true,
      isOrganisation: false,
      therapyCap: null,
      helpAreaCap: null,
      locationLimit: 5,
      presentationMaxLength: 3000,
      approachMaxLength: 2000,
      differentiatorMaxLength: 1000,
      formationMaxItems: 12,
      logoEnabled: true,
      logoRequired: false,
      socialLinksEnabled: true,
      extraLocationEnabled: true,
      verificationUploadsEnabled: true,
      galleryMaxFiles: null,
    };
  }

  if (plan === "centro") {
    return {
      slug: plan,
      label: "Centros / Organizadores",
      title: "Plan Centros / Organizadores",
      isProfessional: false,
      isOrganisation: true,
      therapyCap: null,
      helpAreaCap: null,
      locationLimit: null,
      presentationMaxLength: 3000,
      approachMaxLength: 2000,
      differentiatorMaxLength: 1000,
      formationMaxItems: null,
      logoEnabled: true,
      logoRequired: true,
      socialLinksEnabled: true,
      extraLocationEnabled: true,
      verificationUploadsEnabled: false,
      galleryMaxFiles: 15,
    };
  }

  return {
    slug: plan,
    label: "Presencia",
    title: "Plan Presencia",
    isProfessional: false,
    isOrganisation: false,
    therapyCap: 3,
    helpAreaCap: 5,
    locationLimit: 1,
    presentationMaxLength: 3000,
    approachMaxLength: 2000,
    differentiatorMaxLength: 1000,
    formationMaxItems: 0,
    logoEnabled: false,
    logoRequired: false,
    socialLinksEnabled: false,
    extraLocationEnabled: false,
    verificationUploadsEnabled: false,
    galleryMaxFiles: null,
  };
}

export function normalizeOnboardingPlanSlug(value: string | null | undefined): OnboardingPlan {
  return resolveOnboardingPlan({ searchPlan: value ?? undefined });
}
