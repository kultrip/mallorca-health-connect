import { CheckCircle, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

import { getErrorMessage } from "./admin-utils";
import type { AdminTherapist, ProfessionalReviewRow } from "./admin-types";

type AdminReviewsPanelProps = {
  reviews: ProfessionalReviewRow[];
  therapists: AdminTherapist[];
  onReload: () => Promise<void>;
};

export function AdminReviewsPanel({ reviews, therapists, onReload }: AdminReviewsPanelProps) {
  const [busyId, setBusyId] = useState<string | null>(null);

  const therapistNameById = useMemo(() => {
    return new Map(therapists.map((therapist) => [therapist.id, therapist.full_name]));
  }, [therapists]);

  const handleApprove = async (reviewId: string) => {
    setBusyId(reviewId);
    const { error } = await supabase
      .from("professional_reviews")
      .update({ is_published: true })
      .eq("id", reviewId);
    setBusyId(null);

    if (error) {
      toast.error(`No se pudo aprobar: ${getErrorMessage(error)}`);
      return;
    }

    toast.success("Opinión aprobada y publicada.");
    await onReload();
  };

  const handleReject = async (reviewId: string) => {
    setBusyId(reviewId);
    const { error } = await supabase.from("professional_reviews").delete().eq("id", reviewId);
    setBusyId(null);

    if (error) {
      toast.error(`No se pudo rechazar: ${getErrorMessage(error)}`);
      return;
    }

    toast.success("Opinión descartada.");
    await onReload();
  };

  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        No hay opiniones pendientes de revisión.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {reviews.map((review) => (
        <div key={review.id} className="grid gap-5 rounded-xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Pendiente</p>
              <h3 className="mt-1 text-lg font-semibold">
                {therapistNameById.get(review.therapist_id) ?? "Profesional sin nombre"}
              </h3>
              <p className="text-sm text-muted-foreground">{review.reviewer_name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(review.created_at).toLocaleString("es-ES")}
              </p>
            </div>
            <div className="rounded-full border border-border bg-muted px-3 py-1 text-sm">
              {review.rating} / 5
            </div>
          </div>

          {review.comment && (
            <p className="text-sm leading-7 text-foreground/80">{review.comment}</p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => void handleApprove(review.id)}
              disabled={busyId === review.id}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Aprobar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleReject(review.id)}
              disabled={busyId === review.id}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Rechazar
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
