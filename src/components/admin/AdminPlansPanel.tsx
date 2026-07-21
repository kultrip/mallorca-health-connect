import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isActivePaidSubscription } from "@/lib/plan-access";

import type { AdminTherapist, PlanRow } from "./admin-types";

export function AdminPlansPanel({
  plans,
  therapists,
}: {
  plans: PlanRow[];
  therapists: AdminTherapist[];
}) {
  const subscriptionErrors = therapists.filter(
    (therapist) => therapist.subscription_activation_error,
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => {
          const onPlan = therapists.filter((therapist) => therapist.plan_id === plan.id);
          const active = onPlan.filter((therapist) =>
            isActivePaidSubscription(therapist.subscription_status),
          );
          const pending = therapists.filter(
            (therapist) => therapist.pending_plan_slug === plan.slug,
          );

          return (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle className="flex items-start justify-between gap-3 text-base">
                  {plan.name}
                  <Badge variant={plan.billing_enabled ? "default" : "outline"}>
                    {plan.billing_enabled ? "Billing" : "Oculto"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Slug: {plan.slug}</p>
                <p>Precio Estándar: {formatEuros(plan.price_monthly_cents)}</p>
                {plan.founder_price_monthly_cents !== null && (
                  <p className="text-amber-600 dark:text-amber-400 font-medium">
                    Precio Fundador: {formatEuros(plan.founder_price_monthly_cents)}
                  </p>
                )}
                <p>Profesionales en plan: {onPlan.length}</p>
                <p>Suscripciones activas: {active.length}</p>
                <p>Planes pendientes: {pending.length}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Errores de activacion</CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptionErrors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay errores de suscripcion.</p>
          ) : (
            <div className="space-y-3">
              {subscriptionErrors.map((therapist) => (
                <div key={therapist.id} className="rounded-md border border-border p-3 text-sm">
                  <p className="font-medium">{therapist.full_name}</p>
                  <p className="text-muted-foreground">{therapist.subscription_activation_error}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatEuros(cents: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
