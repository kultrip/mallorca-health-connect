import { CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  approveProfessionalRequest,
  rejectProfessionalRequest,
} from "@/lib/professional-verification";

import { getAccessTokenFromSupabase, getErrorMessage } from "./admin-utils";
import type { TherapistRow } from "./admin-types";

type AdminRequestsPanelProps = {
  pendingTherapists: TherapistRow[];
  onReload: () => Promise<void>;
};

export function AdminRequestsPanel({ pendingTherapists, onReload }: AdminRequestsPanelProps) {
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const handleApprove = async (therapist: TherapistRow) => {
    try {
      await approveProfessionalRequest({
        data: {
          therapistId: therapist.id,
          professionalEmail: therapist.email ?? "",
          origin: window.location.origin,
          reviewNote: reviewNotes[therapist.id],
        },
        headers: {
          Authorization: `Bearer ${await getAccessTokenFromSupabase(supabase)}`,
        },
      });
      toast.success("Perfil aprobado, publicado y notificado.");
      await onReload();
    } catch (error) {
      toast.error(`Error al aprobar: ${getErrorMessage(error)}`);
    }
  };

  const handleReject = async (therapist: TherapistRow) => {
    const note = reviewNotes[therapist.id]?.trim();
    if (!note) {
      toast.error("Añade una nota para explicar que debe corregir el profesional.");
      return;
    }

    try {
      await rejectProfessionalRequest({
        data: {
          therapistId: therapist.id,
          professionalEmail: therapist.email ?? "",
          origin: window.location.origin,
          reviewNote: note,
        },
        headers: {
          Authorization: `Bearer ${await getAccessTokenFromSupabase(supabase)}`,
        },
      });
      toast.success("Solicitud devuelta con nota enviada al profesional.");
      await onReload();
    } catch (error) {
      toast.error(`Error al rechazar: ${getErrorMessage(error)}`);
    }
  };

  if (pendingTherapists.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        No hay profesionales pendientes de validacion.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {pendingTherapists.map((therapist) => (
        <div
          key={therapist.id}
          className="grid gap-5 rounded-xl border border-border bg-card p-6 lg:grid-cols-[1fr_320px]"
        >
          <div>
            <h3 className="text-lg font-semibold">{therapist.full_name}</h3>
            <p className="text-sm text-muted-foreground">{therapist.headline}</p>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span>Modalidades: {therapist.modalities?.join(", ")}</span>
              <span>Tel: {therapist.phone}</span>
              <span>Email: {therapist.email}</span>
            </div>
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              {therapist.verification_document_name && (
                <p>Documento profesional: {therapist.verification_document_name}</p>
              )}
              {therapist.verification_extra_document_name && (
                <p>Documento adicional: {therapist.verification_extra_document_name}</p>
              )}
              {therapist.verification_submitted_at && (
                <p>
                  Enviado:{" "}
                  {new Date(therapist.verification_submitted_at).toLocaleDateString("es-ES")}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor={`review-${therapist.id}`}>Nota de revision</Label>
              <Textarea
                id={`review-${therapist.id}`}
                value={reviewNotes[therapist.id] ?? ""}
                onChange={(event) =>
                  setReviewNotes((current) => ({
                    ...current,
                    [therapist.id]: event.target.value,
                  }))
                }
                placeholder="Escribe una nota si necesitas pedir cambios."
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => void handleReject(therapist)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Rechazar
              </Button>
              <Button
                className="bg-green-600 text-white hover:bg-green-700"
                onClick={() => void handleApprove(therapist)}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Aprobar
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
