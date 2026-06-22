import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { saveAdminActivity } from "@/lib/admin-data-management";

import { getAccessTokenFromSupabase, getErrorMessage, slugify } from "./admin-utils";
import type { ActivityRow, AdminTherapist, MunicipalityRow } from "./admin-types";

type ActivityForm = {
  id: string | null;
  title: string;
  slug: string;
  category: string;
  description: string;
  facilitator_name: string;
  starts_at: string;
  ends_at: string;
  location: string;
  municipality_id: string;
  price_euros: string;
  link_reserva: string;
  image_url: string;
  whatsapp: string;
  instagram: string;
  email: string;
  website: string;
  status: "draft" | "pending" | "published" | "suspended";
  therapist_id: string;
  center_id: string;
};

export function AdminActivitiesPanel({
  activities,
  municipalities,
  therapists,
  onReload,
}: {
  activities: ActivityRow[];
  municipalities: MunicipalityRow[];
  therapists: AdminTherapist[];
  onReload: () => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(activities[0]?.id ?? "");
  const [form, setForm] = useState<ActivityForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const selected = activities.find((activity) => activity.id === selectedId) ?? null;

  useEffect(() => {
    if (selected) setForm(toForm(selected));
  }, [selected]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return activities.filter((activity) =>
      [activity.title, activity.slug, activity.status, activity.location]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [activities, query]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveAdminActivity({
        data: {
          id: form.id,
          title: form.title,
          slug: form.slug,
          category: form.category || null,
          description: form.description || null,
          facilitator_name: form.facilitator_name || null,
          starts_at: localToIso(form.starts_at),
          ends_at: localToIso(form.ends_at),
          location: form.location || null,
          municipality_id: form.municipality_id || null,
          price_cents: form.price_euros ? Math.round(Number(form.price_euros) * 100) : null,
          link_reserva: form.link_reserva || null,
          image_url: form.image_url || null,
          whatsapp: form.whatsapp || null,
          instagram: form.instagram || null,
          email: form.email || null,
          website: form.website || null,
          status: form.status,
          therapist_id: form.therapist_id || null,
          center_id: form.center_id || null,
        },
        headers: {
          Authorization: `Bearer ${await getAccessTokenFromSupabase(supabase)}`,
        },
      });
      toast.success("Actividad guardada.");
      await onReload();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <section className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar actividad"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSelectedId("");
              setForm(emptyForm());
            }}
          >
            Nueva
          </Button>
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {filtered.map((activity) => (
            <button
              key={activity.id}
              type="button"
              onClick={() => setSelectedId(activity.id)}
              className={`block w-full border-b border-border p-3 text-left text-sm last:border-0 hover:bg-muted/50 ${
                selectedId === activity.id ? "bg-muted" : ""
              }`}
            >
              <span className="font-medium">{activity.title}</span>
              <span className="block text-xs text-muted-foreground">
                {activity.status} · {activity.location || "Sin ubicacion"}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Titulo"
            value={form.title}
            onChange={(title) => setForm({ ...form, title })}
          />
          <Field
            label="Categoria"
            value={form.category}
            onChange={(category) => setForm({ ...form, category })}
          />
          <Field
            label="Facilitador"
            value={form.facilitator_name}
            onChange={(facilitator_name) => setForm({ ...form, facilitator_name })}
          />
          <div className="space-y-2">
            <Label>Slug</Label>
            <div className="flex gap-2">
              <Input
                value={form.slug}
                onChange={(event) => setForm({ ...form, slug: event.target.value })}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setForm({ ...form, slug: slugify(form.title) })}
              >
                Generar
              </Button>
            </div>
          </div>
          <Field
            label="Inicio"
            type="datetime-local"
            value={form.starts_at}
            onChange={(starts_at) => setForm({ ...form, starts_at })}
          />
          <Field
            label="Fin"
            type="datetime-local"
            value={form.ends_at}
            onChange={(ends_at) => setForm({ ...form, ends_at })}
          />
          <Field
            label="Ubicacion"
            value={form.location}
            onChange={(location) => setForm({ ...form, location })}
          />
          <Field
            label="Precio EUR"
            value={form.price_euros}
            onChange={(price_euros) => setForm({ ...form, price_euros })}
          />
          <Field
            label="Reserva"
            value={form.link_reserva}
            onChange={(link_reserva) => setForm({ ...form, link_reserva })}
          />
          <Field
            label="Imagen URL"
            value={form.image_url}
            onChange={(image_url) => setForm({ ...form, image_url })}
          />
          <Field
            label="WhatsApp"
            value={form.whatsapp}
            onChange={(whatsapp) => setForm({ ...form, whatsapp })}
          />
          <Field
            label="Instagram"
            value={form.instagram}
            onChange={(instagram) => setForm({ ...form, instagram })}
          />
          <Field
            label="Email"
            value={form.email}
            onChange={(email) => setForm({ ...form, email })}
          />
          <Field
            label="Web"
            value={form.website}
            onChange={(website) => setForm({ ...form, website })}
          />
          <SelectField
            label="Municipio"
            value={form.municipality_id}
            onChange={(municipality_id) => setForm({ ...form, municipality_id })}
            options={[
              { value: "", label: "Sin municipio" },
              ...municipalities.map((m) => ({ value: m.id, label: m.name })),
            ]}
          />
          <SelectField
            label="Profesional"
            value={form.therapist_id}
            onChange={(therapist_id) => setForm({ ...form, therapist_id })}
            options={[
              { value: "", label: "Sin profesional" },
              ...therapists.map((t) => ({ value: t.id, label: t.full_name })),
            ]}
          />
          <SelectField
            label="Estado"
            value={form.status}
            onChange={(status) => setForm({ ...form, status: status as ActivityForm["status"] })}
            options={[
              { value: "draft", label: "Borrador" },
              { value: "pending", label: "Pendiente" },
              { value: "published", label: "Publicado" },
              { value: "suspended", label: "Suspendido" },
            ]}
          />
        </div>
        <div className="space-y-2">
          <Label>Descripcion</Label>
          <Textarea
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
        </div>
        <Button type="button" onClick={() => void handleSave()} disabled={saving}>
          {saving ? "Guardando..." : "Guardar actividad"}
        </Button>
      </section>
    </div>
  );
}

function emptyForm(): ActivityForm {
  return {
    id: null,
    title: "",
    slug: "",
    category: "",
    description: "",
    facilitator_name: "",
    starts_at: "",
    ends_at: "",
    location: "",
    municipality_id: "",
    price_euros: "",
    link_reserva: "",
    image_url: "",
    whatsapp: "",
    instagram: "",
    email: "",
    website: "",
    status: "draft",
    therapist_id: "",
    center_id: "",
  };
}

function toForm(activity: ActivityRow): ActivityForm {
  return {
    id: activity.id,
    title: activity.title,
    slug: activity.slug,
    category: activity.category ?? "",
    description: activity.description ?? "",
    facilitator_name: activity.facilitator_name ?? "",
    starts_at: isoToLocal(activity.starts_at),
    ends_at: isoToLocal(activity.ends_at),
    location: activity.location ?? "",
    municipality_id: activity.municipality_id ?? "",
    price_euros: activity.price_cents ? String(activity.price_cents / 100) : "",
    link_reserva: activity.link_reserva ?? "",
    image_url: activity.image_url ?? "",
    whatsapp: activity.whatsapp ?? "",
    instagram: activity.instagram ?? "",
    email: activity.email ?? "",
    website: activity.website ?? "",
    status: activity.status,
    therapist_id: activity.therapist_id ?? "",
    center_id: activity.center_id ?? "",
  };
}

function isoToLocal(value: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 16);
}

function localToIso(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function SelectField({
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
