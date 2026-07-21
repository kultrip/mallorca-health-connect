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
            <div className="mt-3 space-y-2 text-xs text-muted-foreground">
              {therapist.verification_document_path && (
                <p className="flex items-center gap-1.5">
                  <span className="font-semibold text-foreground">Documento profesional:</span>
                  <a
                    href={supabase.storage.from("verification-docs").getPublicUrl(therapist.verification_document_path).data.publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#526046] hover:underline font-medium inline-flex items-center gap-1"
                  >
                    📄 {therapist.verification_document_name || "Descargar documento"}
                  </a>
                </p>
              )}
              
              {therapist.verification_extra_document_path && (
                <div className="space-y-1">
                  <span className="font-semibold text-foreground">Documentos adicionales:</span>
                  <div className="pl-4 space-y-1">
                    {therapist.verification_extra_document_path.split("\n").map((path, idx) => {
                      const name = therapist.verification_extra_document_name?.split("\n")[idx] || `Doc adicional ${idx + 1}`;
                      const url = supabase.storage.from("verification-docs").getPublicUrl(path).data.publicUrl;
                      return (
                        <div key={path}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#526046] hover:underline font-medium inline-flex items-center gap-1"
                          >
                            📄 {name}
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <p className="flex items-center gap-1.5 mt-1">
                <span className="font-semibold text-foreground">Seguro de Responsabilidad Civil:</span>
                {therapist.has_liability_insurance ? (
                  <span className="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-[10px] font-bold">
                    Sí, declarado
                  </span>
                ) : (
                  <span className="rounded bg-red-100 text-red-800 px-1.5 py-0.5 text-[10px] font-bold">
                    No declarado
                  </span>
                )}
              </p>

              {therapist.verification_submitted_at && (
                <p>
                  <span className="font-semibold text-foreground">Enviado:</span>{" "}
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
