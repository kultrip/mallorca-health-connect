import { createFileRoute } from "@tanstack/react-router";
import { Eye, MousePointerClick, Search, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/analytics")({
  component: AnalyticsPage,
});

type ChannelCount = {
  channel: string | null;
  clicks: number;
};

type DayCount = {
  day: string;
  profile_views: number;
  search_impressions: number;
  contact_clicks: number;
};

type TherapistSummary = {
  profile_views_period: number;
  search_impressions_period: number;
  contact_clicks_period: number;
  contact_clicks_by_channel: ChannelCount[];
  daily_counts: DayCount[];
};

const emptySummary: TherapistSummary = {
  profile_views_period: 0,
  search_impressions_period: 0,
  contact_clicks_period: 0,
  contact_clicks_by_channel: [],
  daily_counts: [],
};

function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<TherapistSummary>(emptySummary);

  useEffect(() => {
    void loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const { data, error } = await supabase.rpc("therapist_analytics_summary", {
      _since: since.toISOString(),
    });

    if (!error && data) {
      setSummary(data as unknown as TherapistSummary);
    }

    setLoading(false);
  };

  if (loading) return <div>Cargando estadísticas...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Estadísticas</h1>
        <p className="text-muted-foreground">
          Analiza el rendimiento de tu perfil durante los últimos 30 días.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={<Eye className="h-4 w-4" />}
          label="Visitas al perfil"
          value={summary.profile_views_period}
        />
        <MetricCard
          icon={<Search className="h-4 w-4" />}
          label="Apariciones en búsquedas"
          value={summary.search_impressions_period}
        />
        <MetricCard
          icon={<MousePointerClick className="h-4 w-4" />}
          label="Contactos solicitados"
          value={summary.contact_clicks_period}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            Contactos por canal
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary.contact_clicks_by_channel.length > 0 ? (
            <div className="space-y-3">
              {summary.contact_clicks_by_channel.map((item) => (
                <div key={item.channel ?? "unknown"} className="flex justify-between text-sm">
                  <span className="capitalize">{labelForChannel(item.channel)}</span>
                  <span className="font-medium">{item.clicks}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aún no hay contactos registrados en este periodo.
            </p>
          )}
        </CardContent>
      </Card>
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
        <span className="text-4xl font-semibold">{value}</span>
      </CardContent>
    </Card>
  );
}

function labelForChannel(channel: string | null) {
  if (channel === "whatsapp") return "WhatsApp";
  if (channel === "reservation") return "Reserva";
  if (channel === "website") return "Web";
  return "Otro";
}
