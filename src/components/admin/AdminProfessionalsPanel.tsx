import { Mail, Upload, ImageIcon, ArrowLeft, ShieldCheck, Check, Trash2, Plus, Search, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import {
  saveAdminTherapist,
  deleteAdminTherapist,
  createAdminTherapist,
} from "@/lib/admin-data-management";

import {
  getAccessTokenFromSupabase,
  getErrorMessage,
  slugify,
} from "./admin-utils";
import type { AdminTherapist, HelpAreaRow, MunicipalityRow, TherapyRow, PlanRow } from "./admin-types";
import { firstRelation } from "./admin-types";
import { DashboardProfileEditor } from "../dashboard/ProfileEditor";

type AdminProfessionalsPanelProps = {
  therapists: AdminTherapist[];
  therapies: TherapyRow[];
  helpAreas: HelpAreaRow[];
  municipalities: MunicipalityRow[];
  plans: PlanRow[];
  onReload: () => Promise<void>;
  onEmailOne: (therapistId: string) => void;
};

export function AdminProfessionalsPanel({
  therapists,
  therapies,
  helpAreas,
  municipalities,
  plans,
  onReload,
  onEmailOne,
}: AdminProfessionalsPanelProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Lazy loading detailed therapist states
  const [detailedTherapist, setDetailedTherapist] = useState<any | null>(null);
  const [centers, setCenters] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Administrative setting overrides
  const [adminStatus, setAdminStatus] = useState<"draft" | "pending" | "published" | "suspended">("draft");
  const [adminVerified, setAdminVerified] = useState(false);
  const [adminPlanId, setAdminPlanId] = useState("");
  const [savingAdminSettings, setSavingAdminSettings] = useState(false);
  const [saving, setSaving] = useState(false);

  // New professional registration state
  const [newProfName, setNewProfName] = useState("");
  const [newProfEmail, setNewProfEmail] = useState("");
  const [newProfPassword, setNewProfPassword] = useState("");
  const [newProfPhotoUrl, setNewProfPhotoUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const selectedBasic = therapists.find((t) => t.id === selectedId) ?? null;

  // Filter professionals
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

  // Handle selected professional detailed loading
  useEffect(() => {
    async function loadDetails() {
      if (!selectedId) {
        setDetailedTherapist(null);
        setCenters([]);
        return;
      }

      try {
        setLoadingDetails(true);

        let basicObj = therapists.find((t) => t.id === selectedId);

        // Fallback: if not in the local array yet (e.g. during a slow reload transition), fetch directly from database
        if (!basicObj) {
          const { data: dbTherapist, error: dbErr } = await supabase
            .from("therapists")
            .select("*")
            .eq("id", selectedId)
            .maybeSingle();

          if (dbErr) throw dbErr;
          if (!dbTherapist) {
            toast.error("No se encontró el perfil del profesional.");
            setSelectedId("");
            return;
          }
          basicObj = dbTherapist as any;
        }

        // Fetch detailed therapist sessions
        const { data: sessionsData, error: sessionsErr } = await supabase
          .from("therapist_sessions")
          .select("*")
          .eq("therapist_id", selectedId)
          .order("position");

        if (sessionsErr) throw sessionsErr;

        // Fetch centers owned by this therapist
        const { data: centersData, error: centersErr } = await supabase
          .from("centers")
          .select("*")
          .eq("owner_user_id", basicObj.user_id)
          .order("created_at");

        if (centersErr) throw centersErr;

        setCenters(centersData || []);
        setDetailedTherapist({
          ...basicObj,
          therapist_sessions: sessionsData || [],
        });

        // Initialize admin override inputs
        setAdminStatus(basicObj.status || "draft");
        setAdminVerified(!!basicObj.verified);
        setAdminPlanId(basicObj.plan_id || "");
      } catch (err) {
        console.error("Error loading professional details:", err);
        toast.error("Error al cargar la información detallada.");
      } finally {
        setLoadingDetails(false);
      }
    }

    void loadDetails();
  }, [selectedId, therapists]);

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

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const url = await uploadPublicFile(file, "therapist-photos");
      setNewProfPhotoUrl(url);
      toast.success("Foto de perfil subida exitosamente.");
    } catch (error) {
      toast.error("Error al subir la foto.");
      console.error(error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveAdminSettings = async () => {
    if (!selectedId) return;
    try {
      setSavingAdminSettings(true);
      const { error } = await supabase
        .from("therapists")
        .update({
          status: adminStatus,
          verified: adminVerified,
          plan_id: adminPlanId || null,
        })
        .eq("id", selectedId);

      if (error) throw error;
      toast.success("Ajustes administrativos guardados exitosamente.");
      await onReload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingAdminSettings(false);
    }
  };

  const handleCreate = async () => {
    if (!newProfName.trim() || !newProfEmail.trim() || !newProfPassword.trim()) {
      toast.error("Por favor completa todos los campos.");
      return;
    }

    if (newProfPassword.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    try {
      setSaving(true);
      const res = await createAdminTherapist({
        data: {
          full_name: newProfName,
          email: newProfEmail,
          password: newProfPassword,
          photo_url: newProfPhotoUrl || null,
        },
        headers: {
          Authorization: `Bearer ${await getAccessTokenFromSupabase(supabase)}`,
        },
      });

      await onReload();
      toast.success("Profesional registrado exitosamente.");
      setIsRegistering(false);
      setSelectedId(res.therapistId);
      setNewProfName("");
      setNewProfEmail("");
      setNewProfPassword("");
      setNewProfPhotoUrl("");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBasic) return;
    const confirmMessage = `¿Estás completamente seguro de que deseas eliminar a ${selectedBasic.full_name}? \n\n¡ATENCIÓN!: Esto eliminará PERMANENTEMENTE su cuenta de usuario de Supabase Auth, su perfil de profesional, y TODAS sus actividades asociadas. Esta acción no se puede deshacer.`;
    if (!window.confirm(confirmMessage)) return;

    try {
      setSaving(true);
      await deleteAdminTherapist({
        data: { id: selectedBasic.id },
        headers: {
          Authorization: `Bearer ${await getAccessTokenFromSupabase(supabase)}`,
        },
      });
      toast.success("Profesional eliminado correctamente.");
      setSelectedId("");
      setIsRegistering(false);
      await onReload();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const showWorkspace = selectedId || isRegistering;

  return (
    <div className="w-full space-y-6">
      {!showWorkspace ? (
        /* View 1: Premium Full-Width Grid Listing */
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-[#fffcf7] p-5 rounded-2xl border border-[#eadfce]/60 shadow-sm">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">Fichas de Profesionales</h2>
              <p className="text-xs text-muted-foreground leading-none">
                Busca, filtra y edita a los terapeutas de la plataforma.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar profesional..."
                  className="pl-8 h-9 text-xs bg-white"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-9 rounded-md border border-input bg-white px-3 py-1.5 text-xs text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Todos los estados</option>
                <option value="draft">Borrador</option>
                <option value="pending">Pendientes</option>
                <option value="published">Publicados</option>
                <option value="suspended">Suspendidos</option>
              </select>

              <Button
                type="button"
                onClick={() => {
                  setIsRegistering(true);
                  setSelectedId("");
                  setNewProfName("");
                  setNewProfEmail("");
                  setNewProfPassword("");
                  setNewProfPhotoUrl("");
                }}
                className="h-9 gap-1 text-xs bg-[#68754d] text-white hover:bg-[#526046]"
              >
                <Plus className="h-4 w-4" />
                Registrar Profesional
              </Button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center p-20 border-2 border-dashed border-border rounded-3xl bg-[#fffcf7]/40 space-y-3">
              <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">No se encontraron profesionales con los criterios de búsqueda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((therapist) => {
                const plan = firstRelation(therapist.plans);
                const municipality = firstRelation(therapist.municipalities);

                return (
                  <button
                    key={therapist.id}
                    onClick={() => setSelectedId(therapist.id)}
                    className="group relative flex flex-col text-left rounded-3xl border border-border bg-card p-5 hover:shadow-md hover:border-primary/40 transition-all duration-300"
                  >
                    <div className="flex gap-4 items-start w-full">
                      {therapist.photo_url ? (
                        <img
                          src={therapist.photo_url}
                          alt={therapist.full_name}
                          className="h-14 w-14 rounded-full object-cover border border-[#eadfce] shrink-0"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center border border-dashed text-muted-foreground shrink-0">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-sm font-bold leading-snug text-foreground truncate group-hover:text-primary transition-colors">
                          {therapist.full_name}
                        </h4>
                        <p className="text-[11px] text-muted-foreground truncate leading-none">
                          {therapist.email}
                        </p>
                        {therapist.especialidad && (
                          <p className="text-[11px] font-medium text-primary/80 truncate pt-1">
                            {therapist.especialidad}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-4 mt-auto border-t border-dashed border-border/80 w-full">
                      <Badge
                        variant={
                          therapist.status === "published"
                            ? "default"
                            : therapist.status === "pending"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-[10px] px-2 py-0.5"
                      >
                        {therapist.status === "published"
                          ? "Publicado"
                          : therapist.status === "pending"
                          ? "Pendiente"
                          : therapist.status === "suspended"
                          ? "Suspendido"
                          : "Borrador"}
                      </Badge>
                      {therapist.verified && (
                        <Badge variant="default" className="bg-amber-100 hover:bg-amber-100 text-amber-800 text-[10px] border-none px-2 py-0.5">
                          Verificado
                        </Badge>
                      )}
                      {plan && (
                        <Badge variant="outline" className="text-[10px] text-primary border-primary/20 bg-primary/5 px-2 py-0.5">
                          {plan.name}
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* View 2: High-Fidelity Workspace occupying 100% width of the screen */
        <div className="space-y-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setSelectedId("");
              setIsRegistering(false);
            }}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:bg-muted/80 rounded-xl px-4 py-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al listado de profesionales
          </Button>

          {isRegistering ? (
            /* New Account Creation Card */
            <div className="max-w-xl mx-auto rounded-3xl border border-[#eadfce] bg-[#fff9f1] p-6 md:p-10 shadow-sm space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
                  <Sparkles className="h-3.5 w-3.5" />
                  Registrar nuevo profesional
                </div>
                <h2 className="text-2xl font-semibold text-foreground">Crear cuenta</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Completa los datos esenciales para crear el usuario en Supabase Auth y su registro de terapeuta. Después de crearlo, podrás rellenar todo su perfil con el editor.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="new-name" className="text-xs font-medium">Nombre completo *</Label>
                  <Input
                    id="new-name"
                    value={newProfName}
                    onChange={(e) => setNewProfName(e.target.value)}
                    placeholder="Ej: María García"
                    className="bg-background h-10"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="new-email" className="text-xs font-medium">Correo electrónico *</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newProfEmail}
                    onChange={(e) => setNewProfEmail(e.target.value)}
                    placeholder="maria@ejemplo.com"
                    className="bg-background h-10"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="new-password" className="text-xs font-medium">Contraseña (Mínimo 8 caracteres) *</Label>
                  <Input
                    id="new-password"
                    type="text"
                    value={newProfPassword}
                    onChange={(e) => setNewProfPassword(e.target.value)}
                    placeholder="Escribe una contraseña segura"
                    className="bg-background h-10"
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs font-medium">Foto de Perfil (Opcional)</Label>
                  <div className="flex items-center gap-4 pt-1">
                    {newProfPhotoUrl ? (
                      <img
                        src={newProfPhotoUrl}
                        alt="Preview"
                        className="h-16 w-16 rounded-full object-cover border border-border shadow-inner"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center border border-dashed border-border/80 text-muted-foreground shrink-0">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="new-photo-upload"
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground shadow-sm transition-colors"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        {uploadingPhoto ? "Subiendo..." : "Subir Foto"}
                      </label>
                      <input
                        id="new-photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                        disabled={uploadingPhoto}
                      />
                      {newProfPhotoUrl && (
                        <button
                          type="button"
                          onClick={() => setNewProfPhotoUrl("")}
                          className="block text-[10px] text-destructive hover:underline text-left font-medium"
                        >
                          Eliminar foto
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => void handleCreate()}
                  disabled={saving || uploadingPhoto}
                  className="flex-1 bg-primary text-primary-foreground h-11 text-sm font-semibold rounded-xl hover:bg-primary/95 shadow-sm transition-all"
                >
                  {saving ? "Registrando..." : "Crear Profesional"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRegistering(false)}
                  disabled={saving}
                  className="px-5 h-11 text-sm font-semibold rounded-xl border-input"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : loadingDetails ? (
            <div className="flex flex-col items-center justify-center p-20 text-sm text-muted-foreground gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              Cargando perfil completo del profesional...
            </div>
          ) : detailedTherapist ? (
            <div className="space-y-8">
              {/* Sticky/Top Premium Admin Override Banner */}
              <section className="rounded-3xl border border-[#dfcfbd] bg-gradient-to-r from-[#fffbf5] to-[#fcf5ec] p-5 md:p-6 shadow-sm border-l-4 border-l-[#d9a27d] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7a5730]">
                      <ShieldCheck className="h-4 w-4 text-[#d9a27d]" />
                      Panel Administrativo de Control
                    </div>
                    <h3 className="text-lg font-bold text-foreground leading-tight">
                      Ajustes Administrativos para: <span className="font-extrabold text-primary">{detailedTherapist.full_name}</span>
                    </h3>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onEmailOne(selectedId)}
                      className="h-9 text-xs gap-1.5 rounded-lg border-input hover:bg-muted"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Enviar email
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void handleDelete()}
                      disabled={saving}
                      className="h-9 text-xs gap-1.5 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive border-input"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar Cuenta
                    </Button>
                  </div>
                </div>

                <hr className="border-t border-[#eadfce]/70" />

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground uppercase font-semibold">Estado del Profesional</Label>
                    <select
                      value={adminStatus}
                      onChange={(e) => setAdminStatus(e.target.value as any)}
                      className="w-full h-9 rounded-lg border border-[#dfcfbd] bg-white px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                    >
                      <option value="draft">Borrador</option>
                      <option value="pending">Pendiente de revisión</option>
                      <option value="published">Publicado</option>
                      <option value="suspended">Suspendido</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground uppercase font-semibold">Inscripción / Plan</Label>
                    <select
                      value={adminPlanId}
                      onChange={(e) => setAdminPlanId(e.target.value)}
                      className="w-full h-9 rounded-lg border border-[#dfcfbd] bg-white px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                    >
                      <option value="">Sin plan asignado</option>
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.billing_enabled ? "De pago" : "Gratuito"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground uppercase font-semibold">Verificación de Identidad</Label>
                    <div className="flex h-9 items-center rounded-lg border border-[#dfcfbd] bg-white px-3 shadow-sm gap-2">
                      <input
                        id="admin-verify"
                        type="checkbox"
                        checked={adminVerified}
                        onChange={(e) => setAdminVerified(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor="admin-verify" className="text-xs text-muted-foreground cursor-pointer select-none font-medium">
                        Marcar como Verificado
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    onClick={() => void handleSaveAdminSettings()}
                    disabled={savingAdminSettings}
                    className="h-9 text-xs font-semibold px-5 rounded-lg bg-[#68754d] text-white hover:bg-[#526046]"
                  >
                    {savingAdminSettings ? "Guardando..." : "Guardar ajustes de administrador"}
                  </Button>
                </div>
              </section>

              {/* High-Fidelity Public Editor Wrapper */}
              <div className="border border-border/70 rounded-3xl p-1 bg-background/50 shadow-inner">
                <DashboardProfileEditor
                  therapist={detailedTherapist}
                  therapies={therapies}
                  helpAreas={helpAreas}
                  municipalities={municipalities}
                  centers={centers}
                  onSaveSuccess={async () => {
                    await onReload();
                    toast.success("Perfil público guardado exitosamente.");
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="text-center p-12 text-sm text-muted-foreground">
              Error al renderizar el profesional
            </div>
          )}
        </div>
      )}
    </div>
  );
}
