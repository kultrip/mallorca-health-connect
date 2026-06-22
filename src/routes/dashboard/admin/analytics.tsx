import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, MousePointerClick, Search, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/admin/analytics")({
  component: AdminAnalyticsPage,
});

type TopProfessional = {
  id: string;
  full_name: string;
  slug: string;
  views: number;
};

type TopHelpArea = {
  area_slug: string;
  searches: number;
};

type AdminSummary = {
  searches_today: number;
  searches_period: number;
  profile_views_period: number;
  contact_clicks_period: number;
  top_professionals: TopProfessional[];
  top_help_areas: TopHelpArea[];
};

const emptySummary: AdminSummary = {
  searches_today: 0,
  searches_period: 0,
  profile_views_period: 0,
  contact_clicks_period: 0,
  top_professionals: [],
  top_help_areas: [],
};

function AdminAnalyticsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AdminSummary>(emptySummary);

  const loadAnalytics = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate({ to: "/login" });
      return;
    }

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const { data, error } = await supabase.rpc("admin_analytics_summary", {
      _since: since.toISOString(),
    });

    if (error) {
      navigate({ to: "/dashboard" });
      return;
    }

    setSummary((data as unknown as AdminSummary) ?? emptySummary);
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  if (loading) return <div>Cargando estadísticas de administración...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <ShieldCheck className="h-6 w-6" />
          Estadísticas globales
        </h1>
        <p className="text-muted-foreground">
          Vista de actividad de la plataforma durante los últimos 30 días.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          icon={<Search className="h-4 w-4" />}
          label="Búsquedas hoy"
          value={summary.searches_today}
        />
        <MetricCard
          icon={<Search className="h-4 w-4" />}
          label="Búsquedas 30 días"
          value={summary.searches_period}
        />
        <MetricCard
          icon={<Eye className="h-4 w-4" />}
          label="Visitas a perfiles"
          value={summary.profile_views_period}
        />
        <MetricCard
          icon={<MousePointerClick className="h-4 w-4" />}
          label="Contactos"
          value={summary.contact_clicks_period}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profesionales más visitados</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.top_professionals.length > 0 ? (
              <div className="space-y-3">
                {summary.top_professionals.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4 text-sm">
                    <span>{item.full_name}</span>
                    <span className="font-medium">{item.views}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aún no hay visitas registradas.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Necesidades más buscadas</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.top_help_areas.length > 0 ? (
              <div className="space-y-3">
                {summary.top_help_areas.map((item) => (
                  <div key={item.area_slug} className="flex justify-between gap-4 text-sm">
                    <span>{item.area_slug}</span>
                    <span className="font-medium">{item.searches}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aún no hay búsquedas registradas.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
          {icon}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <span className="text-3xl font-semibold">{value}</span>
      </CardContent>
    </Card>
  );
}
