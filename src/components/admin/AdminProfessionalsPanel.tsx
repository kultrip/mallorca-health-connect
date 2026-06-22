import { Mail } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { saveAdminTherapist } from "@/lib/admin-data-management";

import { getAccessTokenFromSupabase, getErrorMessage, joinLines, splitLines } from "./admin-utils";
import type { AdminTherapist, HelpAreaRow, MunicipalityRow, TherapyRow } from "./admin-types";
import { firstRelation } from "./admin-types";

type AdminProfessionalsPanelProps = {
  therapists: AdminTherapist[];
  therapies: TherapyRow[];
  helpAreas: HelpAreaRow[];
  municipalities: MunicipalityRow[];
  onReload: () => Promise<void>;
  onEmailOne: (therapistId: string) => void;
};

type ProfessionalForm = {
  full_name: string;
  headline: string;
  frase_clave: string;
  especialidad: string;
  subespecialidades: string;
  sobre_mi: string;
  experiencia: string;
  formacion: string;
  languages: string;
  modalities: string[];
  email: string;
  phone: string;
  whatsapp: string;
  website: string;
  link_reserva: string;
  city: string;
  address: string;
  municipality_id: string;
  lat: string;
  lng: string;
  status: "draft" | "pending" | "published" | "suspended";
  verified: boolean;
  therapyIds: string[];
  helpAreaIds: string[];
};

export function AdminProfessionalsPanel({
  therapists,
  therapies,
  helpAreas,
  municipalities,
  onReload,
  onEmailOne,
}: AdminProfessionalsPanelProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedId, setSelectedId] = useState(therapists[0]?.id ?? "");
  const [form, setForm] = useState<ProfessionalForm | null>(null);
  const [saving, setSaving] = useState(false);

  const selected = therapists.find((therapist) => therapist.id === selectedId) ?? null;

  useEffect(() => {
    if (selected) setForm(toForm(selected));
  }, [selected]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return therapists.filter((therapist) => {
      const plan = firstRelation(therapist.plans);
      const municipality = firstRelation(therapist.municipalities);
      const searchable = [
        therapist.full_name,
        therapist.email,
        therapist.especialidad,
        therapist.headline,
        therapist.city,
        therapist.address,
        municipality?.name,
        plan?.slug,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!normalized || searchable.includes(normalized)) &&
        (!statusFilter || therapist.status === statusFilter)
      );
    });
  }, [query, statusFilter, therapists]);

  useEffect(() => {
    if (!selectedId && therapists[0]) setSelectedId(therapists[0].id);
  }, [selectedId, therapists]);

  const handleSave = async () => {
    if (!selected || !form) return;

    try {
      setSaving(true);
      await saveAdminTherapist({
        data: {
          id: selected.id,
          full_name: form.full_name,
          headline: form.headline || null,
          frase_clave: form.frase_clave || null,
          especialidad: form.especialidad || null,
          subespecialidades: splitLines(form.subespecialidades),
          sobre_mi: form.sobre_mi || null,
          experiencia: form.experiencia || null,
          formacion: form.formacion || null,
          languages: splitLines(form.languages),
          modalities: form.modalities as Array<"presencial" | "online" | "domicilio">,
          email: form.email || null,
          phone: form.phone || null,
          whatsapp: form.whatsapp || null,
          website: form.website || null,
          link_reserva: form.link_reserva || null,
          city: form.city || null,
          address: form.address || null,
          municipality_id: form.municipality_id || null,
          lat: form.lat ? Number(form.lat) : null,
          lng: form.lng ? Number(form.lng) : null,
          status: form.status,
          verified: form.verified,
          therapyIds: form.therapyIds,
          helpAreaIds: form.helpAreaIds,
        },
        headers: {
          Authorization: `Bearer ${await getAccessTokenFromSupabase(supabase)}`,
        },
      });
      toast.success("Profesional guardado.");
      await onReload();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.2fr)]">
      <section className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar profesional, email, especialidad..."
            className="max-w-sm"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="pending">Pendiente</option>
            <option value="published">Publicado</option>
            <option value="suspended">Suspendido</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {filtered.map((therapist) => {
            const plan = firstRelation(therapist.plans);
            const municipality = firstRelation(therapist.municipalities);
            return (
              <button
                key={therapist.id}
                type="button"
                onClick={() => setSelectedId(therapist.id)}
                className={`flex w-full flex-col gap-2 border-b border-border p-4 text-left text-sm last:border-0 hover:bg-muted/50 ${
                  selectedId === therapist.id ? "bg-muted" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{therapist.full_name}</p>
                    <p className="text-xs text-muted-foreground">{therapist.email}</p>
                  </div>
                  <Badge variant={therapist.verified ? "default" : "outline"}>
                    {therapist.verified ? "Verificado" : therapist.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {therapist.especialidad || "Sin especialidad"} ·{" "}
                  {therapist.city || municipality?.name || "Sin zona"} ·{" "}
                  {plan?.name || "Sin plan activo"}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        {!selected || !form ? (
          <p className="text-sm text-muted-foreground">Selecciona un profesional.</p>
        ) : (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{selected.full_name}</h2>
                <p className="text-xs text-muted-foreground">ID: {selected.id}</p>
              </div>
              <Button type="button" variant="outline" onClick={() => onEmailOne(selected.id)}>
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Nombre"
                value={form.full_name}
                onChange={(full_name) => setForm({ ...form, full_name })}
              />
              <Field
                label="Titular"
                value={form.headline}
                onChange={(headline) => setForm({ ...form, headline })}
              />
              <Field
                label="Frase clave"
                value={form.frase_clave}
                onChange={(frase_clave) => setForm({ ...form, frase_clave })}
              />
              <Field
                label="Especialidad"
                value={form.especialidad}
                onChange={(especialidad) => setForm({ ...form, especialidad })}
              />
              <Field
                label="Email publico"
                value={form.email}
                onChange={(email) => setForm({ ...form, email })}
              />
              <Field
                label="Telefono"
                value={form.phone}
                onChange={(phone) => setForm({ ...form, phone })}
              />
              <Field
                label="WhatsApp"
                value={form.whatsapp}
                onChange={(whatsapp) => setForm({ ...form, whatsapp })}
              />
              <Field
                label="Web"
                value={form.website}
                onChange={(website) => setForm({ ...form, website })}
              />
              <Field
                label="Reserva"
                value={form.link_reserva}
                onChange={(link_reserva) => setForm({ ...form, link_reserva })}
              />
              <Field
                label="Ciudad o zona"
                value={form.city}
                onChange={(city) => setForm({ ...form, city })}
              />
              <Field
                label="Direccion"
                value={form.address}
                onChange={(address) => setForm({ ...form, address })}
              />
              <Field
                label="Latitud"
                value={form.lat}
                onChange={(lat) => setForm({ ...form, lat })}
              />
              <Field
                label="Longitud"
                value={form.lng}
                onChange={(lng) => setForm({ ...form, lng })}
              />
              <div className="space-y-2">
                <Label>Zona de mapa</Label>
                <select
                  value={form.municipality_id}
                  onChange={(event) => setForm({ ...form, municipality_id: event.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Sin municipio</option>
                  {municipalities.map((municipality) => (
                    <option key={municipality.id} value={municipality.id}>
                      {municipality.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status: event.target.value as ProfessionalForm["status"],
                    })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="draft">Borrador</option>
                  <option value="pending">Pendiente</option>
                  <option value="published">Publicado</option>
                  <option value="suspended">Suspendido</option>
                </select>
              </div>
            </div>

            <TextAreaField
              label="Sobre mi"
              value={form.sobre_mi}
              onChange={(sobre_mi) => setForm({ ...form, sobre_mi })}
            />
            <TextAreaField
              label="Experiencia"
              value={form.experiencia}
              onChange={(experiencia) => setForm({ ...form, experiencia })}
            />
            <TextAreaField
              label="Formacion"
              value={form.formacion}
              onChange={(formacion) => setForm({ ...form, formacion })}
            />
            <TextAreaField
              label="Subespecialidades"
              value={form.subespecialidades}
              onChange={(subespecialidades) => setForm({ ...form, subespecialidades })}
            />
            <TextAreaField
              label="Idiomas"
              value={form.languages}
              onChange={(languages) => setForm({ ...form, languages })}
            />

            <div className="grid gap-5 md:grid-cols-2">
              <CheckGroup
                label="Modalidades"
                options={[
                  { id: "presencial", name: "Presencial" },
                  { id: "online", name: "Online" },
                  { id: "domicilio", name: "Domicilio" },
                ]}
                values={form.modalities}
                onChange={(modalities) => setForm({ ...form, modalities })}
              />
              <div className="flex items-center gap-2 pt-6">
                <Checkbox
                  checked={form.verified}
                  onCheckedChange={(checked) => setForm({ ...form, verified: checked === true })}
                />
                <Label>Perfil verificado</Label>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <CheckGroup
                label="Terapias"
                options={therapies.map((therapy) => ({ id: therapy.id, name: therapy.name }))}
                values={form.therapyIds}
                onChange={(therapyIds) => setForm({ ...form, therapyIds })}
              />
              <CheckGroup
                label="Necesidades"
                options={helpAreas.map((area) => ({ id: area.id, name: area.name }))}
                values={form.helpAreaIds}
                onChange={(helpAreaIds) => setForm({ ...form, helpAreaIds })}
              />
            </div>

            <Button type="button" onClick={() => void handleSave()} disabled={saving}>
              {saving ? "Guardando..." : "Guardar profesional"}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

function toForm(therapist: AdminTherapist): ProfessionalForm {
  return {
    full_name: therapist.full_name ?? "",
    headline: therapist.headline ?? "",
    frase_clave: therapist.frase_clave ?? "",
    especialidad: therapist.especialidad ?? "",
    subespecialidades: joinLines(therapist.subespecialidades),
    sobre_mi: therapist.sobre_mi ?? "",
    experiencia: therapist.experiencia ?? "",
    formacion: therapist.formacion ?? "",
    languages: joinLines(therapist.languages),
    modalities: therapist.modalities ?? [],
    email: therapist.email ?? "",
    phone: therapist.phone ?? "",
    whatsapp: therapist.whatsapp ?? "",
    website: therapist.website ?? "",
    link_reserva: therapist.link_reserva ?? "",
    city: therapist.city ?? "",
    address: therapist.address ?? "",
    municipality_id: therapist.municipality_id ?? "",
    lat: therapist.lat?.toString() ?? "",
    lng: therapist.lng?.toString() ?? "",
    status: therapist.status,
    verified: therapist.verified,
    therapyIds: (therapist.therapist_therapies ?? [])
      .map((link) => link.therapy_id)
      .filter((id): id is string => Boolean(id)),
    helpAreaIds: (therapist.therapist_help_areas ?? [])
      .map((link) => link.help_area_id)
      .filter((id): id is string => Boolean(id)),
  };
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Textarea value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function CheckGroup({
  label,
  options,
  values,
  onChange,
}: {
  label: string;
  options: Array<{ id: string; name: string }>;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="max-h-52 space-y-2 overflow-auto rounded-md border border-border p-3">
        {options.map((option) => (
          <label key={option.id} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={values.includes(option.id)}
              onCheckedChange={(checked) => {
                if (checked === true) onChange([...values, option.id]);
                else onChange(values.filter((value) => value !== option.id));
              }}
            />
            {option.name}
          </label>
        ))}
      </div>
    </div>
  );
}
