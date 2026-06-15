export type OnboardingPlan = "presencia" | "profesional";

export type OnboardingPlanConfig = {
  slug: OnboardingPlan;
  label: string;
  isProfessional: boolean;
  therapyCap: number | null;
  helpAreaCap: number | null;
  locationLimit: number;
  presentationMaxLength: number;
  approachMaxLength: number;
  differentiatorMaxLength: number;
  formationMaxItems: number | null;
  logoEnabled: boolean;
  socialLinksEnabled: boolean;
  extraLocationEnabled: boolean;
  verificationUploadsEnabled: boolean;
};

export type OnboardingPlanSource = {
  searchPlan?: string | null;
  metadataPlan?: string | null;
  profilePlanSlug?: string | null;
  pendingPlanSlug?: string | null;
};

const professionalPlanSlugs = new Set<string>(["profesional", "centros-organizadores"]);

export function resolveOnboardingPlan(source: OnboardingPlanSource): OnboardingPlan {
  const candidate =
    source.searchPlan ?? source.metadataPlan ?? source.profilePlanSlug ?? source.pendingPlanSlug;
  if (candidate && professionalPlanSlugs.has(candidate)) return "profesional";
  return "presencia";
}

export function resolveOnboardingPlanSlug(source: OnboardingPlanSource): string {
  const candidate =
    source.searchPlan ?? source.metadataPlan ?? source.profilePlanSlug ?? source.pendingPlanSlug;
  if (candidate === "profesional" || candidate === "centros-organizadores") return candidate;
  return "presencia";
}

export function getOnboardingPlanConfig(plan: OnboardingPlan): OnboardingPlanConfig {
  if (plan === "profesional") {
    return {
      slug: plan,
      label: "Profesional",
      isProfessional: true,
      therapyCap: null,
      helpAreaCap: null,
      locationLimit: 5,
      presentationMaxLength: 3000,
      approachMaxLength: 2000,
      differentiatorMaxLength: 1000,
      formationMaxItems: 12,
      logoEnabled: true,
      socialLinksEnabled: true,
      extraLocationEnabled: true,
      verificationUploadsEnabled: true,
    };
  }

  return {
    slug: plan,
    label: "Presencia",
    isProfessional: false,
    therapyCap: 3,
    helpAreaCap: 5,
    locationLimit: 1,
    presentationMaxLength: 500,
    approachMaxLength: 500,
    differentiatorMaxLength: 0,
    formationMaxItems: 0,
    logoEnabled: false,
    socialLinksEnabled: false,
    extraLocationEnabled: false,
    verificationUploadsEnabled: false,
  };
}

export function normalizeOnboardingPlanSlug(value: string | null | undefined): OnboardingPlan {
  return resolveOnboardingPlan({ searchPlan: value ?? undefined });
}
