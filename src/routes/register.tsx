import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader, PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { signUpUser } from "@/lib/registration-emails";
import { onboardingSearchSchema } from "@/lib/route-schemas";

import { MailOpen } from "lucide-react";

export const Route = createFileRoute("/register")({
  validateSearch: onboardingSearchSchema,
  head: () => ({
    meta: [{ title: "Crear perfil — Mallorca Holística" }],
  }),
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [confirmationLink, setConfirmationLink] = useState("");
  const [emailError, setEmailError] = useState("");
  const [founderWhatsapp, setFounderWhatsapp] = useState("");
  const [claimedTherapistName, setClaimedTherapistName] = useState<string | null>(null);
  const track = search.track;
  const founderInviteToken = search.founderInvite?.trim() || "";
  const isFounderQuery = search.founder === "true" || search.founder === "true";

  let selectedPlan: "presencia" | "profesional" | "centros-organizadores" = "presencia";
  let isFounder = isFounderQuery;

  if (search.plan) {
    selectedPlan = search.plan;
  }

  if (track) {
    if (track === "presencia") {
      selectedPlan = "presencia";
      isFounder = false;
    } else if (track === "verificado") {
      selectedPlan = "profesional";
      isFounder = false;
    } else if (track === "organizacion") {
      selectedPlan = "centros-organizadores";
      isFounder = false;
    } else if (track === "verificadoFundador") {
      selectedPlan = "profesional";
      isFounder = true;
    } else if (track === "organizacionFundadora") {
      selectedPlan = "centros-organizadores";
      isFounder = true;
    }
  }

  if (isFounder && !founderInviteToken) {
    isFounder = false;
  }

  useEffect(() => {
    if (!founderInviteToken || typeof window === "undefined") return;

    const storedToken = window.sessionStorage.getItem("founderInviteToken");
    if (storedToken !== founderInviteToken) return;

    const storedWhatsapp = window.sessionStorage.getItem("founderInviteWhatsapp");
    if (storedWhatsapp) setFounderWhatsapp(storedWhatsapp);
  }, [founderInviteToken]);

  useEffect(() => {
    if (!search.claim) return;

    const fetchClaimedName = async () => {
      try {
        const { data, error } = await supabase
          .from("therapists")
          .select("full_name, business_name")
          .eq("id", search.claim)
          .maybeSingle();
        if (data) {
          setClaimedTherapistName(data.business_name || data.full_name);
          // Auto-prepopulate the name field with the claimed profile name
          setName(data.full_name || data.business_name || "");
        }
      } catch (err) {
        console.error("Error loading claimed therapist profile info:", err);
      }
    };

    fetchClaimedName();
  }, [search.claim]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) return toast.error("Por favor, rellena todos los campos");
    if (isFounder && !founderWhatsapp.trim()) {
      return toast.error("Confirma el WhatsApp asociado a tu invitación fundadora");
    }

    setLoading(true);
    try {
      const res = await signUpUser({
        data: {
          name,
          email,
          password,
          selectedPlan,
          isFounder,
          founderInviteToken,
          founderWhatsapp,
          origin: window.location.origin,
          claimTherapistId: search.claim || null,
        },
      });

      setLoading(false);
      setRegisteredEmail(email);
      if (res.actionLink) {
        setConfirmationLink(res.actionLink);
      }
      if (res.emailError) {
        setEmailError(res.emailError);
      }
      if (res.emailSent) {
        toast.success(
          res.isFounder
            ? "Cuenta fundadora creada. ¡Te hemos enviado el email de confirmación!"
            : "Cuenta creada. ¡Te hemos enviado el email de confirmación!",
        );
      } else {
        const errorDetail = res.emailError ? `: ${res.emailError}` : "";
        toast.warning(
          `Cuenta creada. No pudimos enviar el email de confirmación inmediatamente${errorDetail ? " (" + errorDetail + ")" : ""}, pero puedes continuar abajo.`,
          { duration: 6000 },
        );
      }
    } catch (err) {
      setLoading(false);
      const message = err instanceof Error ? err.message : "Error al registrar la cuenta";
      toast.error(message);
    }
  };

  if (registeredEmail) {
    return (
      <PageShell>
        <PageHeader eyebrow="Registro" title="¡Casi listo!" />
        <div className="mx-auto max-w-md px-6 pb-24">
          <div className="rounded-3xl border border-border bg-card p-8 text-center flex flex-col items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MailOpen className="h-8 w-8 animate-bounce-subtle" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Revisa tu correo electrónico
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Hemos enviado un enlace de confirmación a{" "}
              <span className="font-semibold text-primary">{registeredEmail}</span>.
            </p>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 text-xs text-muted-foreground text-left space-y-3 leading-relaxed w-full">
              <p className="font-semibold text-primary text-sm">¿Qué debes hacer ahora?</p>
              <p className="flex gap-2">
                <span className="font-bold text-primary">1.</span>
                <span>
                  Abre tu bandeja de entrada y busca el email de <strong>Mallorca Holística</strong>
                  .
                </span>
              </p>
              <p className="flex gap-2">
                <span className="font-bold text-primary">2.</span>
                <span>
                  Haz clic en el botón de <strong>"Confirmar correo"</strong>.
                </span>
              </p>
              <p className="flex gap-2">
                <span className="font-bold text-primary">3.</span>
                <span>
                  <strong>¡Eso es todo!</strong> Serás redirigido automáticamente al formulario paso
                  a paso para completar los datos de tu perfil.
                </span>
              </p>
            </div>

            {confirmationLink && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-4 text-xs text-amber-800 dark:text-amber-300 text-left space-y-2.5 w-full mt-2">
                {typeof window !== "undefined" &&
                (window.location.hostname === "localhost" ||
                  window.location.hostname === "127.0.0.1") ? (
                  <>
                    <p className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <span>🔧</span> Entorno de desarrollo local / Simulación:
                    </p>
                    <p>
                      El correo no se envió (o estamos en modo desarrollo). Puedes activar tu cuenta
                      directamente haciendo clic abajo:
                    </p>
                    <div className="pt-1.5 text-center">
                      <a
                        href={confirmationLink}
                        className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-medium px-4 py-2 rounded-xl text-xs transition-colors shadow-sm"
                      >
                        Activar cuenta localmente
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <span>⚠️</span> Aviso de Entrega de Correo:
                    </p>
                    <p className="leading-relaxed text-muted-foreground">
                      No se pudo entregar el correo de confirmación de forma inmediata
                      {emailError ? ` (Detalle: ${emailError})` : ""}. Esto suele suceder si el
                      dominio del remitente no está verificado en Resend o si hay demoras de red.
                    </p>
                    <p className="font-semibold text-foreground">
                      Para garantizar que puedas comenzar sin esperas, activa tu cuenta y accede de
                      inmediato haciendo clic aquí abajo:
                    </p>
                    <div className="pt-2 text-center">
                      <a
                        href={confirmationLink}
                        className="inline-block bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Activar mi cuenta y comenzar ahora
                      </a>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 w-full mt-2">
              <p className="text-xs text-muted-foreground">
                ¿No recibiste el email? Comprueba tu carpeta de correo no deseado o spam.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate({ to: "/login" })}
                className="w-full"
              >
                Ir a Iniciar Sesión
              </Button>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader eyebrow="Profesionales" title="Crear perfil" />
      <div className="mx-auto max-w-md px-6 pb-24">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-8">
          <div className="flex flex-col gap-5">
            {claimedTherapistName ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 px-4 py-3 text-sm text-amber-900 flex flex-col gap-1">
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                  🤝 Reclamación de Perfil
                </span>
                <p className="font-medium text-stone-800">
                  Estás reclamando el perfil de:{" "}
                  <span className="text-amber-700 font-bold">{claimedTherapistName}</span>
                </p>
                <p className="text-xs text-stone-500 leading-relaxed mt-0.5">
                  Una vez que confirmes tu cuenta de correo, este perfil se vinculará automáticamente a tu usuario para que puedas gestionarlo y completarlo.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-secondary/30 px-4 py-3 text-sm text-muted-foreground">
                Estás creando un perfil para el plan{" "}
                <span className="font-medium text-foreground">{getPlanLabel(selectedPlan)}</span>
                {isFounder ? " con invitación fundadora confirmada." : "."}
              </div>
            )}
            {isFounder && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                <p className="font-medium">Invitación fundadora verificada</p>
                <p className="mt-1 text-xs leading-relaxed">
                  Pagarás 0 EUR hoy. Tras la aprobación, tendrás 180 días con ventajas premium
                  activas y después Stripe cargará automáticamente la tarifa fundadora especial.
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre o Centro</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre completo"
                autoComplete="name"
                required
              />
            </div>
            {isFounder && (
              <div className="space-y-2">
                <Label htmlFor="founder-whatsapp">WhatsApp de invitación</Label>
                <Input
                  id="founder-whatsapp"
                  value={founderWhatsapp}
                  onChange={(e) => setFounderWhatsapp(e.target.value)}
                  placeholder="+34 612 345 678"
                  autoComplete="tel"
                  required
                />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Debe coincidir con el número pre-registrado para consumir tu invitación.
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hola@ejemplo.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full font-medium">
              {loading ? "Creando..." : "Crear perfil"}
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Acceder
            </Link>
          </div>
        </form>
      </div>
    </PageShell>
  );
}

function getPlanLabel(plan: string) {
  if (plan === "profesional") return "Profesional";
  if (plan === "centros-organizadores") return "Centros & Organizadores";
  return "Presencia";
}
