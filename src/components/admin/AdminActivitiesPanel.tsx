import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Upload,
  ImageIcon,
  ArrowLeft,
  ShieldCheck,
  Check,
  Trash2,
  Plus,
  Search,
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  Phone,
  Instagram,
  Globe,
  Mail,
  Lock,
  Send
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { saveAdminActivity, deleteAdminActivity } from "@/lib/admin-data-management";

import { getAccessTokenFromSupabase, getErrorMessage, slugify } from "./admin-utils";
import type { ActivityRow, AdminTherapist, MunicipalityRow } from "./admin-types";
import { Badge } from "@/components/ui/badge";

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

const categories = ["Yoga", "Retiros", "Sonido", "Reiki", "Formación", "Talleres", "Online"];

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
  const [selectedId, setSelectedId] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ActivityForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const selectedBasic = activities.find((activity) => activity.id === selectedId) ?? null;

  useEffect(() => {
    if (selectedBasic) {
      setForm(toForm(selectedBasic));
    } else if (selectedId === "") {
      setForm(emptyForm());
    }
  }, [selectedBasic, selectedId]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return activities.filter((activity) =>
      [activity.title, activity.slug, activity.status, activity.location]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [activities, query]);

  const uploadPublicFile = async (file: File, bucket: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = user?.id ?? "anonymous";
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`;
    const { error } = await supabase.storage.from(bucket).upload(fileName, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    try {
      setUploadingImage(true);
      const url = await uploadPublicFile(file, "activity-images");
      setForm((prev) => ({ ...prev, image_url: url }));
      toast.success("Imagen de actividad subida exitosamente.");
    } catch (error) {
      toast.error("Error al subir la imagen.");
      console.error(error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    const title = form.title.trim();
    if (!title) {
      toast.error("El título es obligatorio.");
      return;
    }

    const generatedSlug = form.slug.trim() || slugify(title);
    if (!generatedSlug) {
      toast.error("No se pudo generar un slug para esta actividad.");
      return;
    }

    try {
      setSaving(true);
      await saveAdminActivity({
        data: {
          id: form.id,
          title: form.title,
          slug: generatedSlug,
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
      toast.success("Actividad guardada exitosamente.");
      setIsEditing(false);
      setSelectedId("");
      await onReload();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    if (
      !window.confirm(
        "¿Estás completamente seguro de que deseas eliminar esta actividad? Esta acción es irreversible."
      )
    )
      return;

    try {
      setSaving(true);
      await deleteAdminActivity({
        data: { id: form.id },
        headers: {
          Authorization: `Bearer ${await getAccessTokenFromSupabase(supabase)}`,
        },
      });
      toast.success("Actividad eliminada correctamente.");
      setIsEditing(false);
      setSelectedId("");
      setForm(emptyForm());
      await onReload();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {!isEditing ? (
        /* View 1: Premium Full-Width Grid Listing */
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-[#fffcf7] p-5 rounded-2xl border border-[#eadfce]/60 shadow-sm">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">Fichas de Actividades</h2>
              <p className="text-xs text-muted-foreground leading-none">
                Busca, gestiona y crea talleres, retiros y sesiones holísticas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar actividad..."
                  className="pl-8 h-9 text-xs bg-white"
                />
              </div>

              <Button
                type="button"
                onClick={() => {
                  setSelectedId("");
                  setForm(emptyForm());
                  setIsEditing(true);
                }}
                className="h-9 gap-1 text-xs bg-[#68754d] text-white hover:bg-[#526046]"
              >
                <Plus className="h-4 w-4" />
                Nueva Actividad
              </Button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center p-20 border-2 border-dashed border-border rounded-3xl bg-[#fffcf7]/40 space-y-3">
              <Calendar className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">No se encontraron actividades.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((activity) => {
                const owner = therapists.find((t) => t.id === activity.therapist_id);

                return (
                  <button
                    key={activity.id}
                    onClick={() => {
                      setSelectedId(activity.id);
                      setIsEditing(true);
                    }}
                    className="group relative flex flex-col text-left rounded-3xl border border-border bg-card overflow-hidden hover:shadow-md hover:border-primary/40 transition-all duration-300"
                  >
                    {activity.image_url ? (
                      <div className="aspect-[16/10] w-full overflow-hidden border-b border-border bg-muted">
                        <img
                          src={activity.image_url}
                          alt={activity.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[16/10] w-full bg-muted flex items-center justify-center border-b border-dashed text-muted-foreground">
                        <ImageIcon className="h-8 w-8 text-[#eadfce]" />
                      </div>
                    )}

                    <div className="p-5 flex-1 flex flex-col space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-primary/80 leading-none">
                          {activity.category}
                        </span>
                        <Badge
                          variant={
                            activity.status === "published"
                              ? "default"
                              : activity.status === "pending"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-[9px] px-1.5 py-0 h-4 leading-none"
                        >
                          {activity.status === "published"
                            ? "Publicado"
                            : activity.status === "pending"
                            ? "Pendiente"
                            : activity.status === "suspended"
                            ? "Suspendido"
                            : "Borrador"}
                        </Badge>
                      </div>

                      <h4 className="text-sm font-bold leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {activity.title}
                      </h4>

                      {owner && (
                        <p className="text-[11px] text-muted-foreground leading-none pt-1">
                          Por: <span className="font-semibold text-foreground/80">{owner.full_name}</span>
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* View 2: High-Fidelity Form occupying 100% width of the screen */
        <div className="space-y-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setIsEditing(false);
              setSelectedId("");
            }}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:bg-muted/80 rounded-xl px-4 py-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al listado de actividades
          </Button>

          <div className="space-y-8">
            {/* Top Premium Admin Action Overrides */}
            <section className="rounded-3xl border border-[#dfcfbd] bg-gradient-to-r from-[#fffbf5] to-[#fcf5ec] p-5 md:p-6 shadow-sm border-l-4 border-l-[#d9a27d] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7a5730]">
                    <ShieldCheck className="h-4 w-4 text-[#d9a27d]" />
                    Control Administrativo de Actividad
                  </div>
                  <h3 className="text-lg font-bold text-foreground leading-tight">
                    {form.id ? "Modificar Ajustes de Control" : "Crear Nueva Actividad como Administrador"}
                  </h3>
                </div>

                {form.id && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void handleDelete()}
                    disabled={saving}
                    className="h-9 text-xs gap-1.5 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive border-input"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar Actividad
                  </Button>
                )}
              </div>

              <hr className="border-t border-[#eadfce]/70" />

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground uppercase font-semibold">Estado de Publicación</Label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as any }))}
                    className="w-full h-9 rounded-lg border border-[#dfcfbd] bg-white px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  >
                    <option value="draft">Borrador</option>
                    <option value="pending">Pendiente</option>
                    <option value="published">Publicado</option>
                    <option value="suspended">Suspendido</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground uppercase font-semibold">Profesional Responsable</Label>
                  <select
                    value={form.therapist_id}
                    onChange={(e) => setForm((prev) => ({ ...prev, therapist_id: e.target.value }))}
                    className="w-full h-9 rounded-lg border border-[#dfcfbd] bg-white px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  >
                    <option value="">Sin profesional asignado</option>
                    {therapists.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.full_name} ({t.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground uppercase font-semibold">Municipio de Actividad</Label>
                  <select
                    value={form.municipality_id}
                    onChange={(e) => setForm((prev) => ({ ...prev, municipality_id: e.target.value }))}
                    className="w-full h-9 rounded-lg border border-[#dfcfbd] bg-white px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  >
                    <option value="">Sin municipio</option>
                    {municipalities.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* High-Fidelity 4-Step Professional Activity Editor Form */}
            <div className="rounded-[2rem] border border-[#eadfce] bg-white overflow-hidden shadow-sm">
              {/* Form Section 1: Información General */}
              <FormSection number={1} title="Información general">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Título de la actividad *</Label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Ej: Retiro de Yoga Kundalini en la Tramuntana"
                      className="bg-background h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Categoría *</Label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Selecciona categoría</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2 space-y-4 pt-2">
                    <Label className="text-xs font-semibold">Imagen de portada</Label>
                    <div className="flex flex-col sm:flex-row gap-5 items-start bg-[#fffbf6] p-4 rounded-2xl border border-dashed border-[#dfcfbd]/80">
                      {form.image_url ? (
                        <img
                          src={form.image_url}
                          alt="Cover"
                          className="h-24 w-36 rounded-xl object-cover border border-[#eadfce] shadow-sm shrink-0"
                        />
                      ) : (
                        <div className="h-24 w-36 rounded-xl bg-white border border-dashed border-[#dfcfbd] flex flex-col items-center justify-center text-muted-foreground shrink-0 gap-1.5 p-2">
                          <ImageIcon className="h-5 w-5 text-[#d9a27d]" />
                          <span className="text-[10px] font-medium leading-none">Sin portada</span>
                        </div>
                      )}

                      <div className="space-y-3 flex-1 w-full min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <label
                            htmlFor="act-image-upload"
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-input bg-white px-3 py-1.5 text-xs font-medium hover:bg-accent hover:text-accent-foreground shadow-sm transition-colors"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            {uploadingImage ? "Subiendo..." : "Subir Imagen"}
                          </label>
                          <input
                            id="act-image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                            disabled={uploadingImage}
                          />
                          {form.image_url && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setForm((prev) => ({ ...prev, image_url: "" }))}
                              className="h-8 text-xs text-destructive hover:bg-destructive/10 border-input hover:text-destructive"
                            >
                              Eliminar imagen
                            </Button>
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="act-url" className="text-[10px] text-muted-foreground">O introduce/edita el enlace directo de la imagen:</Label>
                          <Input
                            id="act-url"
                            value={form.image_url}
                            onChange={(e) => setForm((prev) => ({ ...prev, image_url: e.target.value }))}
                            placeholder="https://ejemplo.com/imagen.jpg"
                            className="bg-white h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </FormSection>

              {/* Form Section 2: Fecha y Lugar */}
              <FormSection number={2} title="Fecha y lugar">
                <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Fecha y Hora de Inicio *</Label>
                    <Input
                      type="datetime-local"
                      value={form.starts_at}
                      onChange={(e) => setForm((prev) => ({ ...prev, starts_at: e.target.value }))}
                      className="bg-background h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Fecha y Hora de Fin *</Label>
                    <Input
                      type="datetime-local"
                      value={form.ends_at}
                      onChange={(e) => setForm((prev) => ({ ...prev, ends_at: e.target.value }))}
                      className="bg-background h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Precio (Euros)</Label>
                    <Input
                      type="number"
                      value={form.price_euros}
                      onChange={(e) => setForm((prev) => ({ ...prev, price_euros: e.target.value }))}
                      placeholder="Consultar / Gratis"
                      className="bg-background h-10"
                    />
                  </div>

                  <div className="sm:col-span-2 md:col-span-3 space-y-2">
                    <Label className="text-xs font-semibold">Lugar o Dirección *</Label>
                    <Input
                      value={form.location}
                      onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="Ej: Sala Mandalas, Calle Sindicato 24, Palma"
                      className="bg-background h-10"
                    />
                  </div>
                </div>
              </FormSection>

              {/* Form Section 3: Más Información */}
              <FormSection number={3} title="Más información">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-semibold">Facilitador / Profesor</Label>
                    <Input
                      value={form.facilitator_name}
                      onChange={(e) => setForm((prev) => ({ ...prev, facilitator_name: e.target.value }))}
                      placeholder="Ej: Clara Soler (Opcional)"
                      className="bg-background h-10"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-semibold">Descripción del evento</Label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe qué haréis en la sesión, qué traer, etc."
                      className="bg-background min-h-32 focus:ring-primary"
                    />
                  </div>
                </div>
              </FormSection>

              {/* Form Section 4: Contacto */}
              <FormSection number={4} title="Contacto">
                <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" /> WhatsApp
                    </Label>
                    <Input
                      value={form.whatsapp}
                      onChange={(e) => setForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
                      placeholder="600123456"
                      className="bg-background h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                      <Instagram className="h-3.5 w-3.5 text-muted-foreground" /> Instagram
                    </Label>
                    <Input
                      value={form.instagram}
                      onChange={(e) => setForm((prev) => ({ ...prev, instagram: e.target.value }))}
                      placeholder="@usuario"
                      className="bg-background h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" /> Web de reserva
                    </Label>
                    <Input
                      value={form.website}
                      onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
                      placeholder="https://miweb.com"
                      className="bg-background h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Correo electrónico
                    </Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="contacto@ejemplo.com"
                      className="bg-background h-10 text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2 md:col-span-4 space-y-2 pt-2">
                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Enlace de reserva directa
                    </Label>
                    <Input
                      value={form.link_reserva}
                      onChange={(e) => setForm((prev) => ({ ...prev, link_reserva: e.target.value }))}
                      placeholder="https://ejemplo.com/evento-reserva"
                      className="bg-background h-10"
                    />
                  </div>
                </div>

                <p className="mt-6 text-xs text-muted-foreground flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5 shrink-0 text-[#eadfce]" />
                  Solo se mostrarán en la ficha pública los datos de contacto que completes.
                </p>

                <div className="mt-8 text-center border-t border-dashed border-[#eadfce] pt-8">
                  <Button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={saving || uploadingImage}
                    className="min-w-[280px] md:min-w-[340px] rounded-xl bg-[#68754d] py-6 text-sm font-bold uppercase tracking-wider text-white hover:bg-[#526046] shadow-sm transition-all"
                  >
                    <Send className="mr-1.5 h-4 w-4" />
                    {saving ? "Guardando Actividad..." : "Guardar Actividad"}
                  </Button>
                </div>
              </FormSection>
            </div>
          </div>
        </div>
      )}
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
    status: "published",
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
  const d = new Date(value);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function localToIso(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function FormSection({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-6 border-b border-[#eadfce] p-6 last:border-b-0 md:grid-cols-[56px_1fr] md:p-8">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d9a27d] text-base font-bold text-white shrink-0 shadow-sm">
        {number}
      </div>
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#1f1c18]">{title}</h2>
        {children}
      </div>
    </section>
  );
}
