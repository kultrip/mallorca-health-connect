import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { saveAdminHelpArea } from "@/lib/admin-data-management";

import {
  getAccessTokenFromSupabase,
  getErrorMessage,
  joinLines,
  slugify,
  splitLines,
} from "./admin-utils";
import type { HelpAreaRow } from "./admin-types";

type HelpAreaForm = {
  id: string | null;
  name: string;
  slug: string;
  description: string;
  keywords: string;
};

export function AdminHelpAreasPanel({
  helpAreas,
  onReload,
}: {
  helpAreas: HelpAreaRow[];
  onReload: () => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(helpAreas[0]?.id ?? "");
  const [form, setForm] = useState<HelpAreaForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const selected = helpAreas.find((area) => area.id === selectedId) ?? null;

  useEffect(() => {
    if (selected) setForm(toForm(selected));
  }, [selected]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return helpAreas.filter((area) =>
      [area.name, area.slug, ...(area.keywords ?? [])].join(" ").toLowerCase().includes(normalized),
    );
  }, [helpAreas, query]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveAdminHelpArea({
        data: {
          id: form.id,
          name: form.name,
          slug: form.slug,
          description: form.description || null,
          keywords: splitLines(form.keywords),
        },
        headers: {
          Authorization: `Bearer ${await getAccessTokenFromSupabase(supabase)}`,
        },
      });
      toast.success("Necesidad guardada.");
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
            placeholder="Buscar necesidad"
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
          {filtered.map((area) => (
            <button
              key={area.id}
              type="button"
              onClick={() => setSelectedId(area.id)}
              className={`block w-full border-b border-border p-3 text-left text-sm last:border-0 hover:bg-muted/50 ${
                selectedId === area.id ? "bg-muted" : ""
              }`}
            >
              <span className="font-medium">{area.name}</span>
              <span className="block text-xs text-muted-foreground">{area.slug}</span>
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
        </div>
        <TextAreaField
          label="Descripcion"
          value={form.description}
          onChange={(description) => setForm({ ...form, description })}
        />
        <TextAreaField
          label="Keywords"
          value={form.keywords}
          onChange={(keywords) => setForm({ ...form, keywords })}
        />
        <Button type="button" onClick={() => void handleSave()} disabled={saving}>
          {saving ? "Guardando..." : "Guardar necesidad"}
        </Button>
      </section>
    </div>
  );
}

function emptyForm(): HelpAreaForm {
  return { id: null, name: "", slug: "", description: "", keywords: "" };
}

function toForm(area: HelpAreaRow): HelpAreaForm {
  return {
    id: area.id,
    name: area.name,
    slug: area.slug,
    description: area.description ?? "",
    keywords: joinLines(area.keywords),
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
