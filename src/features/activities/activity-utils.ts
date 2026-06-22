import type { Database } from "@/integrations/supabase/types";

type ActivityRow = Database["public"]["Tables"]["activities"]["Row"];

export function inferCategory(activity: Pick<ActivityRow, "category" | "title" | "description">) {
  if (activity.category) return activity.category;
  const text = `${activity.title} ${activity.description ?? ""}`.toLowerCase();
  if (text.includes("yoga")) return "Yoga";
  if (text.includes("retiro")) return "Retiros";
  if (text.includes("gong") || text.includes("sonido")) return "Sonido";
  if (text.includes("reiki")) return "Reiki";
  if (text.includes("curso") || text.includes("formación")) return "Formación";
  return "Talleres";
}

export function formatPrice(priceCents: number | null) {
  if (priceCents === null) return "Precio por confirmar";
  if (priceCents === 0) return "Gratuito";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(priceCents / 100);
}

export function formatTimeRange(activity: Pick<ActivityRow, "starts_at" | "ends_at">) {
  if (!activity.starts_at) return "Horario por confirmar";
  const start = new Date(activity.starts_at);
  const startText = start.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  if (!activity.ends_at) return startText;
  const end = new Date(activity.ends_at);
  const endText = end.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  return `${startText} - ${endText}`;
}

export function formatDateLong(value: string | null) {
  if (!value) return "Fecha por confirmar";
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}
