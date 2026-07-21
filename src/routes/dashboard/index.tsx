import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { DashboardProfileEditor } from "@/components/dashboard/ProfileEditor";
import { AlertCircle, User, Calendar, ShieldCheck, Leaf, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
});

type TherapistRow = Database["public"]["Tables"]["therapists"]["Row"];
type TherapyRow = Database["public"]["Tables"]["therapies"]["Row"];
type HelpAreaRow = Database["public"]["Tables"]["help_areas"]["Row"];
type MunicipalityRow = Database["public"]["Tables"]["municipalities"]["Row"];
type CenterRow = Database["public"]["Tables"]["centers"]["Row"];
type TherapistSessionRow = Database["public"]["Tables"]["therapist_sessions"]["Row"];

type TherapistEditorData = TherapistRow & {
  therapist_therapies?: Array<{ therapy_id: string | null }> | null;
  therapist_help_areas?: Array<{ help_area_id: string | null }> | null;
  therapist_sessions?: TherapistSessionRow[] | null;
  plans?: { slug: string | null; name: string | null } | null;
};

function DashboardIndex() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [therapist, setTherapist] = useState<TherapistEditorData | null>(null);
  const [therapies, setTherapies] = useState<TherapyRow[]>([]);
  const [helpAreas, setHelpAreas] = useState<HelpAreaRow[]>([]);
  const [municipalities, setMunicipalities] = useState<MunicipalityRow[]>([]);
  const [centers, setCenters] = useState<CenterRow[]>([]);

  // Dashboard views: "hub" | "profile"
  const [view, setView] = useState<"hub" | "profile">("hub");

  const loadProfile = useCallback(async () => {
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
      navigate({ to: "/login" });
      return;
    }

    const [therapistResult, therapiesResult, helpAreasResult, municipalitiesResult, centersResult] =
      await Promise.all([
        supabase
          .from("therapists")
          .select(
            "*, therapist_therapies(therapy_id), therapist_help_areas(help_area_id), therapist_sessions(id,name,duration,price_cents,position,created_at,updated_at,therapist_id), plans!therapists_plan_id_fkey(slug,name)",
          )
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase.from("therapies").select("*").order("name"),
        supabase.from("help_areas").select("*").order("name"),
        supabase.from("municipalities").select("*").order("name"),
        supabase.from("centers").select("*").eq("owner_user_id", user.id).order("created_at"),
      ]);

    if (therapistResult.error) toast.error(therapistResult.error.message);
    if (therapiesResult.error) toast.error(therapiesResult.error.message);
    if (helpAreasResult.error) toast.error(helpAreasResult.error.message);
    if (municipalitiesResult.error) toast.error(municipalitiesResult.error.message);
    if (centersResult.error) toast.error(centersResult.error.message);

    setTherapist((therapistResult.data as TherapistEditorData | null) ?? null);
    setTherapies((therapiesResult.data ?? []) as TherapyRow[]);
    setHelpAreas((helpAreasResult.data ?? []) as HelpAreaRow[]);
    setMunicipalities((municipalitiesResult.data ?? []) as MunicipalityRow[]);
    setCenters((centersResult.data ?? []) as CenterRow[]);

    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  if (loading) {
    return <div className="flex h-64 items-center justify-center">Cargando perfil...</div>;
  }

  if (!therapist) {
    return (
      <div className="mx-auto mt-12 max-w-md rounded-xl border border-border bg-card p-8 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
        <h2 className="text-xl font-semibold">No tienes un perfil profesional</h2>
        <p className="mt-2 text-muted-foreground">
          Debes completar el proceso de alta para aparecer en el directorio.
        </p>
        <Button asChild className="mt-6">
          <a href="/onboarding">Completar alta profesional</a>
        </Button>
      </div>
    );
  }

  // Task 4: Post-submission Screen for Pending profiles
  if (therapist.status === "pending" && view === "hub") {
    return (
      <div className="space-y-6">
        <PostSubmissionTracker therapist={therapist} />
        <div className="text-center pt-2">
          <Button
            variant="outline"
            onClick={() => setView("profile")}
            className="border-dashed border-[#526046]/40 hover:bg-[#526046]/5 text-[#526046]"
          >
            ✏️ Modificar datos de mi perfil
          </Button>
        </div>
      </div>
    );
  }

  // Render active editor view
  if (view === "profile") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView("hub")}
            className="hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a Mi Espacio</span>
          </Button>
        </div>
        <DashboardProfileEditor
          therapist={therapist}
          therapies={therapies}
          helpAreas={helpAreas}
          municipalities={municipalities}
          centers={centers}
        />
      </div>
    );
  }

  // Task 5: Published / Default Hub View
  return <MiEspacioHub therapist={therapist} onEditProfile={() => setView("profile")} />;
}

function PostSubmissionTracker({ therapist }: { therapist: TherapistEditorData }) {
  const planName = therapist.plans?.name || "Plan Profesional";
  const isPresencia = therapist.plans?.slug === "presencia";
  const hasPayment = Boolean(therapist.stripe_payment_method_id);

  return (
    <div className="space-y-8 rounded-3xl border border-[#eadfce] bg-[#fffaf4] p-6 md:p-10 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#dfcfbd]/60 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-800">
            ⏳ Perfil en revisión
          </span>
          <h2 className="font-display mt-2 text-2xl md:text-3xl text-[#11100e] font-bold">
            Tu solicitud está siendo revisada
          </h2>
          <p className="mt-1.5 text-sm text-[#6d5b43]">
            Plan seleccionado: <strong className="text-[#1f1c18]">{planName}</strong>
          </p>
        </div>
        <div className="text-left md:text-right">
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
            ID Profesional
          </span>
          <span className="block font-mono text-xs font-semibold text-foreground">
            {therapist.id.substring(0, 8)}...
          </span>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="font-display text-lg font-bold text-foreground">Estado de activación</h3>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Track 1: Verification */}
          <div className="rounded-2xl border border-[#dfcfbd] bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold tracking-wide text-foreground uppercase">
                Paso 1: Verificación de Perfil
              </span>
              <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-800 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" /> En revisión
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-sans">
              Nuestro equipo está verificando tu titulación o la identificación de tu entidad y que
              toda la información aportada cumpla con nuestro código ético y estándares de calidad.
            </p>
            <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 px-4 py-3 text-xs text-amber-800 font-sans">
              📌 Suele tardar entre 24 y 48 horas hábiles. Te avisaremos por email.
            </div>
          </div>

          {/* Track 2: Payment */}
          <div className="rounded-2xl border border-[#dfcfbd] bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold tracking-wide text-foreground uppercase">
                Paso 2: Registro de Pago
              </span>
              {isPresencia ? (
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                  No requerido
                </span>
              ) : hasPayment ? (
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-800 flex items-center gap-1">
                  Metodo registrado en Stripe
                </span>
              ) : (
                <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-800">
                  Pendiente de registro
                </span>
              )}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-sans">
              {isPresencia
                ? "El Plan Presencia es 100% gratuito y no requiere un método de pago."
                : hasPayment
                  ? "Método de pago registrado de forma segura en Stripe. La suscripción no se activará ni se realizarán cobros hasta que el perfil sea verificado y aprobado."
                  : "Completa Stripe para guardar el método de pago antes de la revisión. La suscripción no se activará ni se realizarán cobros hasta que el perfil sea verificado y aprobado."}
            </p>
            {!isPresencia && !hasPayment && (
              <Button
                asChild
                size="sm"
                className="w-full bg-[#526046] hover:bg-[#434f3a] text-white"
              >
                <Link to="/dashboard/billing">Completar registro de pago</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#fffaf4] border border-[#eadfce] p-6 space-y-3">
        <h4 className="font-display font-bold text-[#1f1c18] flex items-center gap-2">
          <span>💡</span> ¿Qué puedes hacer mientras esperas?
        </h4>
        <ul className="text-sm text-[#5a4c3e] space-y-2.5 list-disc pl-5 leading-relaxed font-sans">
          <li>
            <strong>Revisa tus datos:</strong> Asegúrate de que tu ficha tenga una ortografía
            cuidada y fotos de calidad profesional.
          </li>
          <li>
            <strong>Prepara tus actividades:</strong> Si planeas organizar talleres o retiros,
            puedes comenzar a redactar sus contenidos para publicarlos tan pronto como se apruebe tu
            perfil.
          </li>
          <li>
            <strong>Soporte:</strong> Si necesitas realizar algún cambio urgente o tienes preguntas,
            escríbenos a{" "}
            <a
              href="mailto:hola@mallorcaholistica.org"
              className="underline font-medium hover:text-[#526046]"
            >
              hola@mallorcaholistica.org
            </a>
            .
          </li>
        </ul>
      </div>
    </div>
  );
}

function MiEspacioHub({
  therapist,
  onEditProfile,
}: {
  therapist: TherapistEditorData;
  onEditProfile: () => void;
}) {
  const planName = therapist.plans?.name || "Plan Presencia";

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-[#eadfce] bg-[#fffaf4] p-8 md:p-10 shadow-sm relative overflow-hidden">
        <div className="max-w-xl">
          <span className="text-xs font-bold tracking-widest text-[#526046] uppercase block mb-3">
            Mi Espacio 🌿 Mallorca Holística
          </span>
          <h2 className="font-display text-3xl text-[#11100e] font-bold">
            Hola, {therapist.full_name || "Profesional"}
          </h2>
          <p className="mt-3 text-sm md:text-base text-[#6d5b43] leading-relaxed font-sans">
            Te damos la bienvenida a tu centro de control en Mallorca Holística. Desde aquí puedes
            gestionar tu presencia pública, dar de alta tus actividades grupales y revisar tu
            suscripción.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/80 border border-[#dfcfbd] px-4 py-1.5 text-xs text-[#526046]">
            <span>
              Membresía activa: <strong>{planName}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Navigation Cards */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Card 1: Mi Perfil */}
        <button
          onClick={onEditProfile}
          className="group rounded-3xl border border-[#eadfce] bg-white p-6 text-left shadow-sm hover:shadow-md hover:border-[#526046]/40 hover:scale-[1.01] transition-all duration-300"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4ede6] text-[#7f6046] group-hover:bg-[#526046] group-hover:text-white transition-colors duration-300">
            <User className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-foreground group-hover:text-[#526046] transition-colors">
            Mi Perfil
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-sans">
            Completa o actualiza los datos de tu ficha pública (descripción, especialidades,
            ubicación, fotos y formas de contacto).
          </p>
        </button>

        {/* Card 2: Mis Actividades */}
        <Link
          to="/activities"
          className="group rounded-3xl border border-[#eadfce] bg-white p-6 text-left shadow-sm hover:shadow-md hover:border-[#526046]/40 hover:scale-[1.01] transition-all duration-300"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4ede6] text-[#7f6046] group-hover:bg-[#526046] group-hover:text-white transition-colors duration-300">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-foreground group-hover:text-[#526046] transition-colors">
            Mis Actividades
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-sans">
            Publica y programa tus próximos talleres, charlas, cursos o retiros para que aparezcan
            en la agenda pública de Mallorca.
          </p>
        </Link>

        {/* Card 3: Mi Suscripción */}
        <Link
          to="/dashboard/billing"
          className="group rounded-3xl border border-[#eadfce] bg-white p-6 text-left shadow-sm hover:shadow-md hover:border-[#526046]/40 hover:scale-[1.01] transition-all duration-300"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4ede6] text-[#7f6046] group-hover:bg-[#526046] group-hover:text-white transition-colors duration-300">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-foreground group-hover:text-[#526046] transition-colors">
            Mi Suscripción
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-sans">
            Revisa los detalles de tu plan de facturación, descarga facturas o gestiona tus datos de
            pago de forma segura a través de Stripe.
          </p>
        </Link>

        {/* Card 4: Ayuda */}
        <div className="rounded-3xl border border-[#eadfce] bg-white p-6 text-left shadow-sm space-y-4">
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4ede6] text-[#7f6046]">
              <Leaf className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">Ayuda y Soporte</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-sans">
              ¿Tienes dudas sobre cómo usar la plataforma o necesitas soporte técnico? Estamos aquí
              para ayudarte en tu camino.
            </p>
          </div>
          <div className="pt-2">
            <a
              href="mailto:hola@mallorcaholistica.org"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#526046]/10 px-4 py-2 text-xs font-semibold text-[#526046] hover:bg-[#526046]/20 transition-all duration-300"
            >
              ✉️ Contactar soporte
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
