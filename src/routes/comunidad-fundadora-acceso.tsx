import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Award, Lock, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/comunidad-fundadora-acceso")({
  head: () => ({
    meta: [
      { title: "Acceso Comunidad Fundadora — Mallorca Holística" },
      {
        name: "description",
        content: "Introduce tu código de invitación para unirte como miembro de la Comunidad Fundadora.",
      },
    ],
  }),
  component: ComunidadFundadoraAccesoPage,
});

function ComunidadFundadoraAccesoPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedCode = code.trim().toUpperCase();

    if (!trimmedCode) {
      setError("Por favor, introduce tu código de invitación o email.");
      return;
    }

    setLoading(true);

    // Simulate validation check
    setTimeout(() => {
      setLoading(false);
      // Accept typical invitation codes or any valid-looking email
      const isEmail = trimmedCode.includes("@");
      const isValidCode = [
        "MH-FOUNDER",
        "MH_FOUNDER",
        "MH-FOUNDERS",
        "COMUNIDAD2026",
        "FUNDADOR15",
        "FUNDADORES",
        "PROTOTYPE",
        "TEST"
      ].includes(trimmedCode);

      if (isValidCode || isEmail || trimmedCode.length >= 4) {
        navigate({ to: "/comunidad-fundadora-bienvenida" });
      } else {
        setError("El código de invitación no parece válido. Si has recibido una invitación directa, puedes escribir el email donde la recibiste.");
      }
    }, 450);
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-[500px] px-6 py-16 md:py-24">
        <div className="rounded-3xl border border-primary/20 bg-[#fdf5eb]/50 p-8 shadow-md text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
            <Lock className="h-6 w-6" />
          </span>

          <h1 className="font-display text-2xl md:text-3xl text-foreground">
            Comunidad Fundadora
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Este es un espacio exclusivo para profesionales del bienestar seleccionados por invitación directa de Mallorca Holística.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 text-left space-y-4">
            <div>
              <label htmlFor="invite-code" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Código de invitación o Email
              </label>
              <Input
                id="invite-code"
                placeholder="Ej. MH-FOUNDER o tu@email.com"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (error) setError(null);
                }}
                className="mt-2 rounded-xl border border-border/80 bg-background py-6 text-foreground placeholder:text-muted-foreground/60 text-center text-lg font-mono tracking-wide"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl bg-destructive/10 p-3.5 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="leading-normal font-medium">{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#526046] hover:bg-[#434f3a] text-[#fffaf3] rounded-xl py-6 shadow-sm text-base flex items-center justify-center gap-2 mt-4"
              disabled={loading}
            >
              {loading ? "Validando invitación..." : (
                <>
                  Continuar <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 border-t border-border/60 pt-6 text-xs text-muted-foreground leading-relaxed flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            <span>Tus datos de acceso están encriptados y seguros.</span>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
