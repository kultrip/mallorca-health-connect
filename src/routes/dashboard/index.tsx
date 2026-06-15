import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { DashboardProfileEditor } from "@/components/dashboard/ProfileEditor";
import { AlertCircle } from "lucide-react";
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

  return (
    <DashboardProfileEditor
      therapist={therapist}
      therapies={therapies}
      helpAreas={helpAreas}
      municipalities={municipalities}
      centers={centers}
    />
  );
}
