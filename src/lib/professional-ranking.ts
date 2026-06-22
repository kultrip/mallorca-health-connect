import { planSupportsPaidPriority, isActivePaidSubscription } from "./plan-access.ts";

export type ProfessionalRankingLike = {
  id: string;
  full_name?: string | null;
  subscription_status?: string | null;
  plans?: {
    slug?: string | null;
  } | null;
};

export type ProfessionalRankOptions = {
  matchCounts?: Map<string, number>;
};

export function isPaidPriorityProfessional(professional: ProfessionalRankingLike): boolean {
  return (
    isActivePaidSubscription(professional.subscription_status) &&
    planSupportsPaidPriority(professional.plans)
  );
}

export function sortProfessionalsByPriority<T extends ProfessionalRankingLike>(
  professionals: T[],
  options: ProfessionalRankOptions = {},
): T[] {
  const matchCounts = options.matchCounts;

  return [...professionals].sort((a, b) => {
    const tierDelta = Number(isPaidPriorityProfessional(b)) - Number(isPaidPriorityProfessional(a));
    if (tierDelta !== 0) return tierDelta;

    if (matchCounts) {
      const matchDelta = (matchCounts.get(b.id) ?? 0) - (matchCounts.get(a.id) ?? 0);
      if (matchDelta !== 0) return matchDelta;
    }

    return compareNames(a.full_name, b.full_name);
  });
}

function compareNames(a: string | null | undefined, b: string | null | undefined) {
  return (a ?? "").localeCompare(b ?? "", "es", {
    sensitivity: "base",
    numeric: true,
  });
}
