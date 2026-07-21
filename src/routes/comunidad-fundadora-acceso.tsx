import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Lock, ArrowRight, AlertCircle, MessageCircle } from "lucide-react";
import { checkFounderInviteByWhatsApp } from "@/lib/founder-invites";

export const Route = createFileRoute("/comunidad-fundadora-acceso")({
  head: () => ({
    meta: [
      { title: "Acceso Comunidad Fundadora — Mallorca Holística" },
      {
        name: "description",
        content:
          "Confirma tu invitación por WhatsApp para unirte como miembro de la Comunidad Fundadora.",
      },
    ],
  }),
  component: ComunidadFundadoraAccesoPage,
});

function ComunidadFundadoraAccesoPage() {
  const navigate = useNavigate();
  const [whatsapp, setWhatsapp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [standardSignupReady, setStandardSignupReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStandardSignupReady(false);
    const trimmedWhatsapp = whatsapp.trim();

    if (!trimmedWhatsapp) {
      setError("Introduce el número de WhatsApp con el que recibiste la invitación.");
      return;
    }

    setLoading(true);
    try {
      const result = await checkFounderInviteByWhatsApp({
        data: { whatsapp: trimmedWhatsapp },
      });
      setLoading(false);

      if (result.matched) {
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem("founderInviteToken", result.inviteToken);
          window.sessionStorage.setItem("founderInviteWhatsapp", trimmedWhatsapp);
        }

        navigate({
          to: "/comunidad-fundadora-bienvenida",
          search: { founderInvite: result.inviteToken },
        });
      } else {
        setStandardSignupReady(true);
      }
    } catch (err) {
      setLoading(false);
      console.error("Founder invite lookup failed:", err);
      setError("No pudimos comprobar la invitación ahora mismo. Inténtalo de nuevo.");
    }
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-[500px] px-6 py-16 md:py-24">
        <div className="rounded-3xl border border-primary/20 bg-[#fdf5eb]/50 p-8 shadow-md text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
            <Lock className="h-6 w-6" />
          </span>

          <h1 className="font-display text-2xl md:text-3xl text-foreground">Comunidad Fundadora</h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Este es un espacio exclusivo para profesionales del bienestar seleccionados por
            invitación directa de Mallorca Holística. Usamos tu WhatsApp para confirmar que la
            invitación es personal y de un solo uso.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 text-left space-y-4">
            <div>
              <label
                htmlFor="founder-whatsapp"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                WhatsApp de invitación
              </label>
              <Input
                id="founder-whatsapp"
                placeholder="Ej. +34 612 345 678"
                value={whatsapp}
                onChange={(e) => {
                  setWhatsapp(e.target.value);
                  if (error) setError(null);
                  if (standardSignupReady) setStandardSignupReady(false);
                }}
                className="mt-2 rounded-xl border border-border/80 bg-background py-6 text-foreground placeholder:text-muted-foreground/60 text-center text-lg"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl bg-destructive/10 p-3.5 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="leading-normal font-medium">{error}</span>
              </div>
            )}

            {standardSignupReady && (
              <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">
                  No hemos encontrado una invitación fundadora asociada a este número.
                </p>
                <p className="mt-1 leading-relaxed">
                  Puedes continuar con el registro profesional estándar.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() =>
                    navigate({
                      to: "/register",
                      search: { plan: "profesional", track: "verificado" },
                    })
                  }
                >
                  Continuar registro estándar
                </Button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#526046] hover:bg-[#434f3a] text-[#fffaf3] rounded-xl py-6 shadow-sm text-base flex items-center justify-center gap-2 mt-4"
              disabled={loading}
            >
              {loading ? (
                "Comprobando invitación..."
              ) : (
                <>
                  Continuar <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 border-t border-border/60 pt-6 text-xs text-muted-foreground leading-relaxed flex items-center justify-center gap-2">
            <MessageCircle className="h-4 w-4 text-emerald-700" />
            <span>La invitación fundadora queda vinculada al WhatsApp registrado.</span>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
