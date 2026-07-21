import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminActivitiesPanel } from "@/components/admin/AdminActivitiesPanel";
import { AdminDiscoveryPanel } from "@/components/admin/AdminDiscoveryPanel";
import { AdminEmailCenterPanel } from "@/components/admin/AdminEmailCenterPanel";
import { AdminHelpAreasPanel } from "@/components/admin/AdminHelpAreasPanel";
import { AdminPlansPanel } from "@/components/admin/AdminPlansPanel";
import { AdminProfessionalsPanel } from "@/components/admin/AdminProfessionalsPanel";
import { AdminRequestsPanel } from "@/components/admin/AdminRequestsPanel";
import { AdminReviewsPanel } from "@/components/admin/AdminReviewsPanel";
import { AdminTherapiesPanel } from "@/components/admin/AdminTherapiesPanel";
import type {
  ActivityRow,
  AdminTherapist,
  HelpAreaRow,
  MunicipalityRow,
  PlanRow,
  ProfessionalReviewRow,
  TherapyRow,
} from "@/components/admin/admin-types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/admin")({
  component: AdminPanel,
});

function AdminPanel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [therapists, setTherapists] = useState<AdminTherapist[]>([]);
  const [therapies, setTherapies] = useState<TherapyRow[]>([]);
  const [helpAreas, setHelpAreas] = useState<HelpAreaRow[]>([]);
  const [municipalities, setMunicipalities] = useState<MunicipalityRow[]>([]);
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [reviews, setReviews] = useState<ProfessionalReviewRow[]>([]);
  const [activeTab, setActiveTab] = useState("requests");
  const [emailInitialTherapistId, setEmailInitialTherapistId] = useState<string | null>(null);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate({ to: "/login" });
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleData?.role !== "admin") {
      toast.error("Acceso denegado. No eres administrador.");
      navigate({ to: "/dashboard" });
      return;
    }

    const therapistSelect =
      "*, plans!therapists_plan_id_fkey(name,slug,price_monthly_cents), municipalities(name,slug,lat,lng), therapist_therapies(therapy_id), therapist_help_areas(help_area_id)";

    const [
      therapistsResult,
      therapiesResult,
      helpAreasResult,
      municipalitiesResult,
      activitiesResult,
      plansResult,
      reviewsResult,
    ] = await Promise.all([
      supabase.from("therapists").select(therapistSelect).order("created_at", { ascending: false }),
      supabase.from("therapies").select("*").order("name"),
      supabase.from("help_areas").select("*").order("name"),
      supabase.from("municipalities").select("*").order("name"),
      supabase.from("activities").select("*").order("created_at", { ascending: false }),
      supabase.from("plans").select("*").order("rank", { ascending: true }),
      supabase.from("professional_reviews").select("*").order("created_at", { ascending: false }),
    ]);

    if (therapistsResult.error) toast.error(therapistsResult.error.message);
    if (therapiesResult.error) toast.error(therapiesResult.error.message);
    if (helpAreasResult.error) toast.error(helpAreasResult.error.message);
    if (municipalitiesResult.error) toast.error(municipalitiesResult.error.message);
    if (activitiesResult.error) toast.error(activitiesResult.error.message);
    if (plansResult.error) toast.error(plansResult.error.message);
    if (reviewsResult.error) toast.error(reviewsResult.error.message);

    setTherapists((therapistsResult.data ?? []) as unknown as AdminTherapist[]);
    setTherapies((therapiesResult.data ?? []) as TherapyRow[]);
    setHelpAreas((helpAreasResult.data ?? []) as HelpAreaRow[]);
    setMunicipalities((municipalitiesResult.data ?? []) as MunicipalityRow[]);
    setActivities((activitiesResult.data ?? []) as ActivityRow[]);
    setPlans((plansResult.data ?? []) as PlanRow[]);
    setReviews((reviewsResult.data ?? []) as ProfessionalReviewRow[]);
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    void loadAdminData();
  }, [loadAdminData]);

  const pendingTherapists = therapists.filter((therapist) => therapist.status === "pending");
  const pendingReviews = reviews.filter((review) => !review.is_published);

  const handleEmailOne = (therapistId: string) => {
    setEmailInitialTherapistId(therapistId);
    setActiveTab("emails");
  };

  if (loading) return <div>Cargando panel de administracion...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <ShieldCheck className="h-6 w-6" />
          Administracion
        </h1>
        <p className="text-muted-foreground">
          Gestiona profesionales, contenido, actividades, planes y comunicaciones.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="requests">Solicitudes ({pendingTherapists.length})</TabsTrigger>
          <TabsTrigger value="professionals">Profesionales</TabsTrigger>
          <TabsTrigger value="therapies">Terapias</TabsTrigger>
          <TabsTrigger value="help-areas">Necesidades</TabsTrigger>
          <TabsTrigger value="activities">Actividades</TabsTrigger>
          <TabsTrigger value="plans">Planes</TabsTrigger>
          <TabsTrigger value="opiniones">Opiniones ({pendingReviews.length})</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
          <TabsTrigger value="discovery" className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-amber-600 animate-pulse" />Descubrimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <AdminRequestsPanel pendingTherapists={pendingTherapists} onReload={loadAdminData} />
        </TabsContent>
        <TabsContent value="professionals">
          <AdminProfessionalsPanel
            therapists={therapists}
            therapies={therapies}
            helpAreas={helpAreas}
            municipalities={municipalities}
            plans={plans}
            onReload={loadAdminData}
            onEmailOne={handleEmailOne}
          />
        </TabsContent>
        <TabsContent value="therapies">
          <AdminTherapiesPanel therapies={therapies} onReload={loadAdminData} />
        </TabsContent>
        <TabsContent value="help-areas">
          <AdminHelpAreasPanel helpAreas={helpAreas} onReload={loadAdminData} />
        </TabsContent>
        <TabsContent value="activities">
          <AdminActivitiesPanel
            activities={activities}
            municipalities={municipalities}
            therapists={therapists}
            onReload={loadAdminData}
          />
        </TabsContent>
        <TabsContent value="plans">
          <AdminPlansPanel plans={plans} therapists={therapists} />
        </TabsContent>
        <TabsContent value="opiniones">
          <AdminReviewsPanel
            reviews={pendingReviews}
            therapists={therapists}
            onReload={loadAdminData}
          />
        </TabsContent>
        <TabsContent value="emails">
          <AdminEmailCenterPanel
            therapists={therapists}
            municipalities={municipalities}
            initialTherapistId={emailInitialTherapistId}
            onInitialTherapistHandled={() => setEmailInitialTherapistId(null)}
          />
        </TabsContent>
        <TabsContent value="discovery">
          <AdminDiscoveryPanel
            therapists={therapists}
            municipalities={municipalities}
            onReload={loadAdminData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
