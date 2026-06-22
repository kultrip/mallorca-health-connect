import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { saveAdminTherapy } from "@/lib/admin-data-management";

import {
  getAccessTokenFromSupabase,
  getErrorMessage,
  joinLines,
  slugify,
  splitLines,
} from "./admin-utils";
import type { TherapyRow } from "./admin-types";

type TherapySection = { title: string; body: string };

type TherapyForm = {
  id: string | null;
  name: string;
  slug: string;
  category: string;
  short_description: string;
  description: string;
  benefits: string;
  session_description: string;
  medical_disclaimer: string;
  empty_professionals_message: string;
  detail_sections: string;
};

export function AdminTherapiesPanel({
  therapies,
  onReload,
}: {
  therapies: TherapyRow[];
  onReload: () => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(therapies[0]?.id ?? "");
  const [form, setForm] = useState<TherapyForm>(emptyForm());
  const [saving, setSaving] = useState(false);

  const selected = therapies.find((therapy) => therapy.id === selectedId) ?? null;

  useEffect(() => {
    if (selected) setForm(toForm(selected));
  }, [selected]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return therapies.filter((therapy) =>
      [therapy.name, therapy.slug, therapy.category].join(" ").toLowerCase().includes(normalized),
    );
  }, [query, therapies]);

  const handleNew = () => {
    setSelectedId("");
    setForm(emptyForm());
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const detailSections = parseSections(form.detail_sections);
      await saveAdminTherapy({
        data: {
          id: form.id,
          name: form.name,
          slug: form.slug,
          category: form.category || null,
          short_description: form.short_description || null,
          description: form.description || null,
          benefits: splitLines(form.benefits),
          session_description: form.session_description || null,
          medical_disclaimer: form.medical_disclaimer || null,
          empty_professionals_message: form.empty_professionals_message || null,
          detail_sections: detailSections,
        },
        headers: {
          Authorization: `Bearer ${await getAccessTokenFromSupabase(supabase)}`,
        },
      });
      toast.success("Terapia guardada.");
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
            placeholder="Buscar terapia"
          />
          <Button type="button" variant="outline" onClick={handleNew}>
            Nueva
          </Button>
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {filtered.map((therapy) => (
            <button
              key={therapy.id}
              type="button"
              onClick={() => setSelectedId(therapy.id)}
              className={`block w-full border-b border-border p-3 text-left text-sm last:border-0 hover:bg-muted/50 ${
                selectedId === therapy.id ? "bg-muted" : ""
              }`}
            >
              <span className="font-medium">{therapy.name}</span>
              <span className="block text-xs text-muted-foreground">{therapy.slug}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nombre" value={form.name} onChange={(name) => setForm({ ...form, name })} />
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
                onClick={() => setForm({ ...form, slug: slugify(form.name) })}
              >
                Generar
              </Button>
            </div>
          </div>
          <Field
            label="Categoria"
            value={form.category}
            onChange={(category) => setForm({ ...form, category })}
          />
          <Field
            label="Descripcion corta"
            value={form.short_description}
            onChange={(short_description) => setForm({ ...form, short_description })}
          />
        </div>
        <TextAreaField
          label="Descripcion"
          value={form.description}
          onChange={(description) => setForm({ ...form, description })}
        />
        <TextAreaField
          label="Beneficios"
          value={form.benefits}
          onChange={(benefits) => setForm({ ...form, benefits })}
        />
        <TextAreaField
          label="Como es una sesion"
          value={form.session_description}
          onChange={(session_description) => setForm({ ...form, session_description })}
        />
        <TextAreaField
          label="Nota medica"
          value={form.medical_disclaimer}
          onChange={(medical_disclaimer) => setForm({ ...form, medical_disclaimer })}
        />
        <TextAreaField
          label="Mensaje si no hay profesionales"
          value={form.empty_professionals_message}
          onChange={(empty_professionals_message) =>
            setForm({ ...form, empty_professionals_message })
          }
        />
        <TextAreaField
          label='Secciones JSON [{"title":"...","body":"..."}]'
          value={form.detail_sections}
          onChange={(detail_sections) => setForm({ ...form, detail_sections })}
        />
        <Button type="button" onClick={() => void handleSave()} disabled={saving}>
          {saving ? "Guardando..." : "Guardar terapia"}
        </Button>
      </section>
    </div>
  );
}

function emptyForm(): TherapyForm {
  return {
    id: null,
    name: "",
    slug: "",
    category: "",
    short_description: "",
    description: "",
    benefits: "",
    session_description: "",
    medical_disclaimer: "",
    empty_professionals_message: "",
    detail_sections: "[]",
  };
}

function toForm(therapy: TherapyRow): TherapyForm {
  return {
    id: therapy.id,
    name: therapy.name,
    slug: therapy.slug,
    category: therapy.category ?? "",
    short_description: therapy.short_description ?? "",
    description: therapy.description ?? "",
    benefits: joinLines(therapy.benefits),
    session_description: therapy.session_description ?? "",
    medical_disclaimer: therapy.medical_disclaimer ?? "",
    empty_professionals_message: therapy.empty_professionals_message ?? "",
    detail_sections: JSON.stringify(therapy.detail_sections ?? [], null, 2),
  };
}

function parseSections(value: string): TherapySection[] {
  const parsed = JSON.parse(value || "[]") as unknown;
  if (!Array.isArray(parsed)) throw new Error("Las secciones deben ser un array JSON.");
  return parsed.map((section) => {
    if (
      !section ||
      typeof section !== "object" ||
      Array.isArray(section) ||
      typeof section.title !== "string" ||
      typeof section.body !== "string"
    ) {
      throw new Error("Cada seccion debe tener title y body.");
    }
    return { title: section.title, body: section.body };
  });
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
