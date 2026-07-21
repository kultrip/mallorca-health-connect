import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { PageShell, PageHeader } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { REMEMBER_SESSION_STORAGE_KEY, getRememberSessionPreference } from "@/lib/session-timeout";
import { loginSearchSchema } from "@/lib/route-schemas";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  validateSearch: loginSearchSchema,
  head: () => ({
    meta: [{ title: "Acceder — Mallorca Holística" }],
  }),
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberSession, setRememberSession] = useState(() => {
    if (typeof window === "undefined") return false;
    return getRememberSessionPreference(window.localStorage.getItem(REMEMBER_SESSION_STORAGE_KEY));
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<"no_user" | "wrong_password" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Por favor, rellena todos los campos");

    setLoading(true);
    setLoginError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.toLowerCase().includes("invalid login credentials")) {
        // Check if the user exists in auth.users via our RPC function
        const { data: userExists, error: rpcError } = await supabase.rpc(
          "check_user_exists_by_email",
          {
            check_email: email,
          },
        );
        setLoading(false);

        if (!rpcError && userExists === false) {
          setLoginError("no_user");
          toast.error(
            "No tienes un usuario registrado con este correo. Te redirigiremos para crear tu cuenta...",
            {
              duration: 4000,
            },
          );
          setTimeout(() => {
            navigate({ to: "/register" });
          }, 3000);
        } else {
          setLoginError("wrong_password");
          toast.error("Contraseña incorrecta. Por favor, compruébala e inténtalo de nuevo.");
        }
      } else {
        setLoading(false);
        toast.error(getLoginErrorMessage(error.message));
      }
    } else {
      setLoading(false);
      window.localStorage.setItem(REMEMBER_SESSION_STORAGE_KEY, rememberSession ? "true" : "false");
      toast.success("Has accedido correctamente");
      if (search.redirect) {
        navigate({ to: search.redirect });
      } else {
        navigate({ to: "/dashboard" });
      }
    }
  };

  return (
    <PageShell>
      <PageHeader eyebrow="Cuenta" title="Acceder" />
      <div className="mx-auto max-w-md px-6 pb-24">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-8">
          <div className="flex flex-col gap-5">
            {search.reason === "inactive" && (
              <div className="rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
                Tu sesión se ha cerrado por inactividad.
              </div>
            )}
            {loginError === "no_user" && (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                <span className="font-semibold text-destructive">
                  No tienes una cuenta de usuario
                </span>
                <span className="text-xs text-muted-foreground leading-normal">
                  No hemos encontrado ningún perfil con el correo{" "}
                  <strong className="text-destructive">{email}</strong>. Te estamos redirigiendo
                  para crear tu cuenta...
                </span>
              </div>
            )}
            {loginError === "wrong_password" && (
              <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-sm text-amber-700 flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                <span className="font-semibold text-amber-800">Contraseña incorrecta</span>
                <span className="text-xs text-muted-foreground leading-normal">
                  La contraseña ingresada no coincide. Si has olvidado tu contraseña o quieres
                  registrar una nueva cuenta, haz clic en{" "}
                  <Link to="/register" className="font-semibold text-primary underline">
                    Crea tu perfil
                  </Link>
                  .
                </span>
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
                  autoComplete="current-password"
                  required
                  className="pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <label className="flex items-start gap-3 rounded-2xl border border-border bg-secondary/20 px-4 py-3 text-sm text-muted-foreground">
              <Checkbox
                checked={rememberSession}
                onCheckedChange={(checked) => setRememberSession(checked === true)}
              />
              <span>
                Mantener la sesión iniciada en este dispositivo.
                <span className="mt-1 block text-xs text-muted-foreground/80">
                  Si no lo marcas, la sesión se cerrará al salir del navegador o tras un periodo de
                  inactividad.
                </span>
              </span>
            </label>
            <Button type="submit" disabled={loading} className="w-full font-medium">
              {loading ? "Accediendo..." : "Acceder"}
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Crea tu perfil
            </Link>
          </div>
        </form>
      </div>
    </PageShell>
  );
}

function getLoginErrorMessage(message: string) {
  if (message.toLowerCase().includes("email not confirmed")) {
    return "Confirma tu email antes de acceder. Revisa tu bandeja de entrada.";
  }

  if (message.toLowerCase().includes("invalid login credentials")) {
    return "Email o contraseña incorrectos.";
  }

  return message;
}
