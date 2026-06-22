import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader, PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { sendRegistrationConfirmationEmail } from "@/lib/registration-emails";
import { onboardingSearchSchema } from "@/lib/route-schemas";

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
  const selectedPlan = search.plan ?? "presencia";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) return toast.error("Por favor, rellena todos los campos");

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
          selected_plan: selectedPlan,
        },
        emailRedirectTo: `${window.location.origin}/onboarding?plan=${encodeURIComponent(selectedPlan)}`,
      },
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    void sendRegistrationConfirmationEmail({
      email,
      name,
      planLabel: getPlanLabel(selectedPlan),
    }).catch((emailError) => {
      console.error(emailError);
      toast.warning("La cuenta se creó, pero no pudimos enviar el email de confirmación.");
    });

    if (!data.session) {
      toast.success("Cuenta creada. Revisa tu email para confirmar la cuenta antes de acceder.");
      navigate({ to: "/login" });
      return;
    }

    toast.success("Cuenta creada. ¡Bienvenido!");
    navigate({ to: "/onboarding", search: { plan: selectedPlan } });
  };

  return (
    <PageShell>
      <PageHeader eyebrow="Profesionales" title="Crear perfil" />
      <div className="mx-auto max-w-md px-6 pb-24">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-8">
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl border border-border bg-secondary/30 px-4 py-3 text-sm text-muted-foreground">
              Estás creando un perfil para el plan{" "}
              <span className="font-medium text-foreground">{getPlanLabel(selectedPlan)}</span>.
            </div>
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
