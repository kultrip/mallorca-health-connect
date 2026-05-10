type PlanLike = {
  slug?: string | null;
  name?: string | null;
  price_monthly_cents?: number | null;
} | null | undefined;

const paidPlanSlugs = new Set([
  "profesional",
  "professional",
  "pro",
  "premium",
  "centros",
  "centros-organizadores",
  "centers",
]);

export function planSupportsDirectContact(plan: PlanLike): boolean {
  if (!plan) return false;
  const slug = plan.slug?.toLowerCase();
  if (slug && paidPlanSlugs.has(slug)) return true;
  if (typeof plan.price_monthly_cents === "number" && plan.price_monthly_cents > 0) {
    return true;
  }
  return false;
}
