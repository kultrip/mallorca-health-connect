import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { sendAdminProfessionalEmail } from "@/lib/admin-data-management";

import { getAccessTokenFromSupabase, getErrorMessage } from "./admin-utils";
import type { AdminTherapist, MunicipalityRow } from "./admin-types";
import { firstRelation } from "./admin-types";

type AdminEmailCenterPanelProps = {
  therapists: AdminTherapist[];
  municipalities: MunicipalityRow[];
  initialTherapistId?: string | null;
  onInitialTherapistHandled: () => void;
};

export function AdminEmailCenterPanel({
  therapists,
  municipalities,
  initialTherapistId,
  onInitialTherapistHandled,
}: AdminEmailCenterPanelProps) {
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [municipalityFilter, setMunicipalityFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<{ sent: number; failed: number } | null>(null);

  useEffect(() => {
    if (initialTherapistId) {
      setSelectedIds([initialTherapistId]);
      onInitialTherapistHandled();
    }
  }, [initialTherapistId, onInitialTherapistHandled]);

  const recipients = useMemo(() => {
    return therapists.filter((therapist) => {
      const plan = firstRelation(therapist.plans);
      return (
        Boolean(therapist.email) &&
        (!statusFilter || therapist.status === statusFilter) &&
        (!planFilter || plan?.slug === planFilter) &&
        (!municipalityFilter || therapist.municipality_id === municipalityFilter)
      );
    });
  }, [municipalityFilter, planFilter, statusFilter, therapists]);

  const selectedRecipients = recipients.filter((therapist) => selectedIds.includes(therapist.id));
  const canSend = selectedRecipients.length > 0 && subject.trim() && message.trim() && confirmed;

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? recipients.map((therapist) => therapist.id) : []);
  };

  const handleSend = async () => {
    if (!canSend) return;

    try {
      setSending(true);
      const result = await sendAdminProfessionalEmail({
        data: {
          therapistIds: selectedRecipients.map((therapist) => therapist.id),
          subject,
          message,
        },
        headers: {
          Authorization: `Bearer ${await getAccessTokenFromSupabase(supabase)}`,
        },
      });
      setLastResult({ sent: result.sent, failed: result.failed });
      setConfirmed(false);
      toast.success(`Emails enviados: ${result.sent}. Fallidos: ${result.failed}.`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1fr)]">
      <section className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Select
            label="Estado"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "", label: "Todos" },
              { value: "pending", label: "Pendientes" },
              { value: "published", label: "Publicados" },
              { value: "suspended", label: "Suspendidos" },
            ]}
          />
          <Select
            label="Plan"
            value={planFilter}
            onChange={setPlanFilter}
            options={[
              { value: "", label: "Todos" },
              { value: "profesional", label: "Profesional" },
              { value: "centros-organizadores", label: "Centros" },
            ]}
          />
          <Select
            label="Municipio"
            value={municipalityFilter}
            onChange={setMunicipalityFilter}
            options={[
              { value: "", label: "Todos" },
              ...municipalities.map((municipality) => ({
                value: municipality.id,
                label: municipality.name,
              })),
            ]}
          />
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-3 text-sm">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={recipients.length > 0 && selectedRecipients.length === recipients.length}
                onCheckedChange={(checked) => toggleAll(checked === true)}
              />
              Seleccionar visibles
            </label>
            <span className="text-muted-foreground">
              {selectedRecipients.length} de {recipients.length}
            </span>
          </div>
          <div className="max-h-[520px] overflow-auto">
            {recipients.map((therapist) => {
              const plan = firstRelation(therapist.plans);
              return (
                <label
                  key={therapist.id}
                  className="flex items-start gap-3 border-b border-border p-3 text-sm last:border-0"
                >
                  <Checkbox
                    checked={selectedIds.includes(therapist.id)}
                    onCheckedChange={(checked) => {
                      if (checked === true) setSelectedIds([...selectedIds, therapist.id]);
                      else setSelectedIds(selectedIds.filter((id) => id !== therapist.id));
                    }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{therapist.full_name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {therapist.email}
                    </span>
                  </span>
                  <Badge variant="outline">{plan?.slug || therapist.status}</Badge>
                </label>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div>
          <h2 className="text-lg font-semibold">Enviar email</h2>
          <p className="text-sm text-muted-foreground">
            Se enviara un email por profesional seleccionado y se guardara un log por destinatario.
          </p>
        </div>
        <div className="space-y-2">
          <Label>Asunto</Label>
          <Input value={subject} onChange={(event) => setSubject(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Mensaje</Label>
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="min-h-56"
          />
        </div>
        <div className="rounded-md border border-border bg-background p-3 text-sm">
          <p className="font-medium">Destinatarios: {selectedRecipients.length}</p>
          <p className="mt-1 text-muted-foreground">
            {selectedRecipients
              .slice(0, 5)
              .map((therapist) => therapist.email)
              .join(", ")}
            {selectedRecipients.length > 5 ? "..." : ""}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={confirmed}
            onCheckedChange={(checked) => setConfirmed(checked === true)}
          />
          Confirmo el envio a estos destinatarios.
        </label>
        <Button type="button" onClick={() => void handleSend()} disabled={!canSend || sending}>
          {sending ? "Enviando..." : "Enviar email"}
        </Button>
        {lastResult && (
          <p className="text-sm text-muted-foreground">
            Ultimo envio: {lastResult.sent} enviados, {lastResult.failed} fallidos.
          </p>
        )}
      </section>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
