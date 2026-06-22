type PlanLike =
  | {
      slug?: string | null;
      name?: string | null;
      price_monthly_cents?: number | null;
    }
  | null
  | undefined;

type TherapistAccessLike = {
  verified?: boolean | null;
  status?: string | null;
  subscription_status?: string | null;
};

export const premiumPlanSlugs = new Set(["profesional", "centros-organizadores"]);

export function isActivePaidSubscription(status: string | null | undefined): boolean {
  return status === "active";
}

export function planSupportsDirectContact(plan: PlanLike): boolean {
  const slug = plan?.slug?.toLowerCase();
  return Boolean(slug && premiumPlanSlugs.has(slug));
}

export function planSupportsPaidPriority(plan: PlanLike): boolean {
  return planSupportsDirectContact(plan);
}

export function planSupportsPremiumPublicProfile(plan: PlanLike): boolean {
  return planSupportsDirectContact(plan);
}

export function therapistHasPremiumPublicAccess(
  therapist: TherapistAccessLike,
  plan: PlanLike,
): boolean {
  return (
    therapist.status === "published" &&
    isActivePaidSubscription(therapist.subscription_status) &&
    planSupportsPremiumPublicProfile(plan)
  );
}

export function therapistHasPaidPriorityAccess(
  therapist: TherapistAccessLike,
  plan: PlanLike,
): boolean {
  return (
    therapist.status === "published" &&
    isActivePaidSubscription(therapist.subscription_status) &&
    planSupportsPaidPriority(plan)
  );
}

export function therapistCanShowDirectContact(
  therapist: TherapistAccessLike,
  plan: PlanLike,
): boolean {
  return therapistHasPremiumPublicAccess(therapist, plan);
}

export function therapistCanShowVerificationBadge(
  therapist: TherapistAccessLike,
  plan: PlanLike,
): boolean {
  return therapistHasPremiumPublicAccess(therapist, plan);
}

export function therapistCanShowReviews(therapist: TherapistAccessLike, plan: PlanLike): boolean {
  return therapistHasPremiumPublicAccess(therapist, plan);
}
