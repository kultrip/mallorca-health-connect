import { createFileRoute } from "@tanstack/react-router";
import { Check, CreditCard, LockKeyhole, Settings } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { saveBillingProfile } from "@/lib/billing-profile";
import { createCheckoutSession, createCustomerPortalSession } from "@/lib/stripe-functions";

export const Route = createFileRoute("/dashboard/billing")({
  component: BillingPage,
});

type TherapistRow = Database["public"]["Tables"]["therapists"]["Row"];
type PlanRow = Database["public"]["Tables"]["plans"]["Row"];
type BillingProfileRow = Database["public"]["Tables"]["billing_profiles"]["Row"];

type CurrentPlan = Pick<PlanRow, "name" | "slug">;
type TherapistProfile = TherapistRow & {
  plans?: CurrentPlan | CurrentPlan[] | null;
};

type BillingPlan = Pick<
  PlanRow,
  | "id"
  | "slug"
  | "name"
  | "description"
  | "price_monthly_cents"
  | "features"
  | "rank"
  | "billing_enabled"
>;

type BillingProfileForm = {
  legal_name: string;
  tax_id_type: "nif" | "nie" | "cif" | "other" | "";
  tax_id_value: string;
  address_line1: string;
  address_line2: string;
  city: string;
  postal_code: string;
  country: string;
};

function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<TherapistProfile | null>(null);
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [billingProfile, setBillingProfile] = useState<BillingProfileRow | null>(null);
  const [billingForm, setBillingForm] = useState<BillingProfileForm>(emptyBillingProfileForm());
  const [billingSaving, setBillingSaving] = useState(false);
  const [pendingPlanSlug, setPendingPlanSlug] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const loadBillingData = useCallback(async () => {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      toast.error(userError.message);
      setLoading(false);
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    const [profileResult, plansResult, billingProfileResult] = await Promise.all([
      supabase
        .from("therapists")
        .select("*, plans!therapists_plan_id_fkey(name, slug)")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("plans")
        .select("id, slug, name, description, price_monthly_cents, features, rank, billing_enabled")
        .eq("billing_enabled", true)
        .order("rank", { ascending: true }),
      supabase.from("billing_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    ]);

    if (profileResult.error) {
      toast.error(profileResult.error.message);
    } else {
      setProfile(profileResult.data as TherapistProfile | null);
    }

    if (plansResult.error) {
      toast.error(plansResult.error.message);
    } else {
      setPlans((plansResult.data ?? []) as BillingPlan[]);
    }

    if (billingProfileResult.error) {
      toast.error(billingProfileResult.error.message);
    } else {
      setBillingProfile(billingProfileResult.data as BillingProfileRow | null);
      setBillingForm(toBillingProfileForm(billingProfileResult.data as BillingProfileRow | null));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadBillingData();
  }, [loadBillingData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    if (checkout === "success") {
      toast.success("Pago recibido. Estamos actualizando tu suscripcion.");
    }
    if (checkout === "setup_success") {
      toast.success("Metodo de pago guardado. Tu plan se activara cuando aprobemos tu perfil.");
    }
    if (checkout === "cancelled") {
      toast.info("Checkout cancelado. Puedes elegir un plan cuando quieras.");
    }
  }, []);

  const currentPlan = firstRelation(profile?.plans);
  const isActive = profile?.subscription_status === "active";
  const isVerified = profile?.verified === true && profile.status === "published";
  const hasPendingPaidPlan = Boolean(profile?.pending_plan_id || profile?.pending_plan_slug);
  const hasSavedPaymentMethod = Boolean(profile?.stripe_payment_method_id);
  const currentPlanName = currentPlan?.name ?? "Presencia";
  const canCheckout = Boolean(profile && !isActive);
  const hasSavedBillingDetails = Boolean(billingProfile && hasBillingDetails(billingForm));

  const sortedPlans = useMemo(() => [...plans].sort((a, b) => a.rank - b.rank), [plans]);

  const handleSubscribe = async (planSlug: string) => {
    if (!canCheckout) return;

    try {
      setPendingPlanSlug(planSlug);
      const accessToken = await getAccessToken();
      const { url } = await createCheckoutSession({
        data: {
          planSlug,
          origin: window.location.origin,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (url) window.location.href = url;
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setPendingPlanSlug(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      setPortalLoading(true);
      const accessToken = await getAccessToken();
      const { url } = await createCustomerPortalSession({
        data: {
          origin: window.location.origin,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (url) window.location.href = url;
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setPortalLoading(false);
    }
  };

  const handleSaveBillingProfile = async () => {
    try {
      setBillingSaving(true);
      const accessToken = await getAccessToken();
      const saved = await saveBillingProfile({
        data: {
          therapistId: profile?.id ?? null,
          legal_name: billingForm.legal_name || null,
          tax_id_type: billingForm.tax_id_type || null,
          tax_id_value: billingForm.tax_id_value || null,
          address_line1: billingForm.address_line1 || null,
          address_line2: billingForm.address_line2 || null,
          city: billingForm.city || null,
          postal_code: billingForm.postal_code || null,
          country: billingForm.country || "ES",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setBillingProfile(saved as BillingProfileRow);
      setBillingForm(toBillingProfileForm(saved as BillingProfileRow));
      toast.success("Datos fiscales guardados.");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setBillingSaving(false);
    }
  };

  if (loading) return <div>Cargando planes...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <CreditCard className="h-6 w-6" />
          Suscripcion y Pagos
        </h1>
        <p className="text-muted-foreground">
          Gestiona tu plan para desbloquear mas funciones en Mallorca Holistica.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>Plan actual: {currentPlanName}</CardTitle>
              <CardDescription className="mt-2">
                {isActive
                  ? "Tu suscripcion esta activa."
                  : "Actualmente estas en el plan Presencia o sin suscripcion activa."}
              </CardDescription>
            </div>
            <Badge variant={isActive ? "default" : "outline"}>
              {isActive ? "Activa" : "Gratis / inactiva"}
            </Badge>
          </div>
        </CardHeader>
        {isActive && (
          <CardContent>
            <Button onClick={handleManageBilling} variant="outline" disabled={portalLoading}>
              <Settings className="h-4 w-4" />
              {portalLoading ? "Abriendo portal..." : "Gestionar facturacion"}
            </Button>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>Datos fiscales para facturas</CardTitle>
              <CardDescription className="mt-2">
                Opcional. Estos datos se usan si necesitas facturas con NIF/CIF/NIE. No se muestran
                en tu perfil publico.
              </CardDescription>
            </div>
            <Badge variant={hasSavedBillingDetails ? "default" : "outline"}>
              {hasSavedBillingDetails ? "Guardados" : "Opcional"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasBillingDetails(billingForm) && (
            <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
              Puedes añadir datos fiscales si necesitas facturas con NIF/CIF/NIE.
            </p>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              id="legal_name"
              label="Nombre fiscal"
              value={billingForm.legal_name}
              onChange={(value) => setBillingForm((current) => ({ ...current, legal_name: value }))}
            />
            <div className="space-y-2">
              <Label>Tipo fiscal</Label>
              <Select
                value={billingForm.tax_id_type || "none"}
                onValueChange={(value) =>
                  setBillingForm((current) => ({
                    ...current,
                    tax_id_type:
                      value === "none" ? "" : (value as BillingProfileForm["tax_id_type"]),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin datos fiscales</SelectItem>
                  <SelectItem value="nif">NIF</SelectItem>
                  <SelectItem value="nie">NIE</SelectItem>
                  <SelectItem value="cif">CIF</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Field
              id="tax_id_value"
              label="Numero fiscal"
              value={billingForm.tax_id_value}
              onChange={(value) =>
                setBillingForm((current) => ({ ...current, tax_id_value: value }))
              }
            />
            <Field
              id="address_line1"
              label="Direccion fiscal"
              value={billingForm.address_line1}
              onChange={(value) =>
                setBillingForm((current) => ({ ...current, address_line1: value }))
              }
            />
            <Field
              id="address_line2"
              label="Direccion fiscal 2"
              value={billingForm.address_line2}
              onChange={(value) =>
                setBillingForm((current) => ({ ...current, address_line2: value }))
              }
            />
            <Field
              id="city"
              label="Ciudad"
              value={billingForm.city}
              onChange={(value) => setBillingForm((current) => ({ ...current, city: value }))}
            />
            <Field
              id="postal_code"
              label="Codigo postal"
              value={billingForm.postal_code}
              onChange={(value) =>
                setBillingForm((current) => ({ ...current, postal_code: value }))
              }
            />
            <Field
              id="country"
              label="Pais"
              value={billingForm.country}
              onChange={(value) =>
                setBillingForm((current) => ({ ...current, country: value.toUpperCase() }))
              }
            />
          </div>
          <Button type="button" onClick={handleSaveBillingProfile} disabled={billingSaving}>
            {billingSaving ? "Guardando..." : "Guardar datos fiscales"}
          </Button>
        </CardContent>
      </Card>

      {profile && !isActive && hasPendingPaidPlan && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle>Plan pendiente de aprobacion</CardTitle>
            <CardDescription>
              Has elegido {formatPlanSlug(profile.pending_plan_slug)}.{" "}
              {hasSavedPaymentMethod
                ? "El metodo de pago esta guardado y se cobrara cuando aprobemos tu perfil."
                : "Falta completar Stripe para guardar el metodo de pago."}
            </CardDescription>
            {profile.subscription_activation_error && (
              <p className="text-sm text-destructive">{profile.subscription_activation_error}</p>
            )}
          </CardHeader>
        </Card>
      )}

      {!profile && (
        <Card>
          <CardHeader>
            <CardTitle>Completa tu perfil profesional</CardTitle>
            <CardDescription>
              Completa tu perfil profesional antes de elegir un plan.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {profile && !isVerified && (
        <Card className="border-amber-300 bg-amber-50/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-950">
              <LockKeyhole className="h-5 w-5" />
              Verificacion pendiente
            </CardTitle>
            <CardDescription className="text-amber-900">
              Puedes elegir un plan de pago ahora. Guardaremos el metodo de pago y la suscripcion
              empezara solo si Mallorca Holistica aprueba tu perfil.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {!isActive && (
        <div className="grid gap-6 md:grid-cols-2">
          {sortedPlans.map((plan) => (
            <Card
              key={plan.id}
              className={plan.slug === "centros-organizadores" ? "border-primary" : undefined}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>{plan.name}</CardTitle>
                    {plan.description && (
                      <CardDescription className="mt-2">{plan.description}</CardDescription>
                    )}
                  </div>
                  {plan.slug === "centros-organizadores" && <Badge>Centros</Badge>}
                </div>
                <p className="pt-4 text-3xl font-bold">
                  {formatMonthlyPrice(plan.price_monthly_cents)}
                  <span className="text-sm font-normal text-muted-foreground">/mes</span>
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {planHighlights(plan.slug).map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => void handleSubscribe(plan.slug)}
                  disabled={!canCheckout || pendingPlanSlug === plan.slug}
                  className="w-full"
                >
                  {pendingPlanSlug === plan.slug
                    ? "Abriendo Stripe..."
                    : isVerified
                      ? `Seleccionar ${plan.name}`
                      : `Elegir ${plan.name}`}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

async function getAccessToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const token = data.session?.access_token;
  if (!token) throw new Error("Tu sesion ha caducado. Vuelve a iniciar sesion.");
  return token;
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function formatMonthlyPrice(cents: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatPlanSlug(slug: string | null | undefined) {
  if (slug === "profesional") return "Profesional";
  if (slug === "centros-organizadores") return "Centros";
  return "un plan de pago";
}

function Field({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function emptyBillingProfileForm(): BillingProfileForm {
  return {
    legal_name: "",
    tax_id_type: "",
    tax_id_value: "",
    address_line1: "",
    address_line2: "",
    city: "",
    postal_code: "",
    country: "ES",
  };
}

function toBillingProfileForm(row: BillingProfileRow | null): BillingProfileForm {
  return {
    legal_name: row?.legal_name ?? "",
    tax_id_type: (row?.tax_id_type as BillingProfileForm["tax_id_type"]) ?? "",
    tax_id_value: row?.tax_id_value ?? "",
    address_line1: row?.address_line1 ?? "",
    address_line2: row?.address_line2 ?? "",
    city: row?.city ?? "",
    postal_code: row?.postal_code ?? "",
    country: row?.country ?? "ES",
  };
}

function hasBillingDetails(form: BillingProfileForm) {
  return [
    form.legal_name,
    form.tax_id_type,
    form.tax_id_value,
    form.address_line1,
    form.address_line2,
    form.city,
    form.postal_code,
  ].some((value) => value.trim().length > 0);
}

function planHighlights(slug: string) {
  if (slug === "centros-organizadores") {
    return [
      "Todo lo del plan Profesional",
      "Permiso para publicar actividades proximamente",
      "Visibilidad para centros y organizadores",
    ];
  }

  return [
    "Contacto directo visible en tu perfil",
    "Enlaces de WhatsApp, web y reserva",
    "Perfil profesional verificado con mas conversion",
  ];
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "No se pudo completar la accion.";
}
