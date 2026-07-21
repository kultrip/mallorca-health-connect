import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  CloudUpload,
  Globe,
  Instagram,
  Leaf,
  Lock,
  Mail,
  MapPin,
  Phone,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { notifyAdminOfNewActivity } from "@/lib/professional-verification";

export const Route = createFileRoute("/activities_/new")({
  component: PublishActivityPage,
});

const categories = ["Yoga", "Retiros", "Sonido", "Reiki", "Formación", "Talleres", "Online"];

function PublishActivityPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [therapistId, setTherapistId] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Yoga");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [facilitator, setFacilitator] = useState("");
  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [website, setWebsite] = useState("");
  const [linkReserva, setLinkReserva] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    void loadUser();
  }, []);

  const previewUrl = useMemo(() => {
    if (!imageFile) return "";
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Inicia sesión para poder publicar una actividad.");
      void navigate({ to: "/login", search: { redirect: "/activities/new" } });
      return;
    }
    setUserId(user.id);
    setEmail(user.email ?? "");

    const { data } = await supabase
      .from("therapists")
      .select("id, full_name")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data?.id) {
      setTherapistId(data.id);
      setFacilitator(data.full_name ?? "");
    } else {
      toast.error("Necesitas completar tu perfil profesional antes de publicar actividades.");
      void navigate({ to: "/onboarding" });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId) {
      toast.error("Inicia sesión como profesional para publicar una actividad.");
      void navigate({ to: "/login" });
      return;
    }
    if (!therapistId) {
      toast.error("Necesitas completar tu perfil profesional antes de publicar actividades.");
      void navigate({ to: "/onboarding" });
      return;
    }

    setSaving(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${userId}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("activity-images").upload(path, imageFile, {
          upsert: true,
        });
        if (error) throw error;
        imageUrl = supabase.storage.from("activity-images").getPublicUrl(path).data.publicUrl;
      }

      const startsAtISO =
        eventDate && startTime ? new Date(`${eventDate}T${startTime}`).toISOString() : null;
      const endsAtISO =
        eventDate && endTime ? new Date(`${eventDate}T${endTime}`).toISOString() : null;

      const { data: newActivity, error } = await supabase
        .from("activities")
        .insert({
          title,
          slug: `${slugify(title)}-${Math.floor(Math.random() * 1000)}`,
          category,
          starts_at: startsAtISO,
          ends_at: endsAtISO,
          location,
          price_cents: parsePrice(price),
          facilitator_name: facilitator || null,
          description: description || null,
          image_url: imageUrl || null,
          whatsapp: whatsapp || null,
          instagram: instagram || null,
          website: website || null,
          link_reserva: linkReserva || null,
          email: email || null,
          therapist_id: therapistId,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      if (newActivity) {
        try {
          await notifyAdminOfNewActivity({
            activityId: newActivity.id,
            activityTitle: newActivity.title,
            category: newActivity.category,
            startsAt: newActivity.starts_at
              ? new Date(newActivity.starts_at).toLocaleString("es-ES")
              : null,
            location: newActivity.location,
            facilitatorName: newActivity.facilitator_name,
            price: price || "Gratuito / No especificado",
            therapistId: therapistId,
            origin: window.location.origin,
          });
        } catch (emailErr) {
          console.error("Error triggering admin email notification:", emailErr);
          // Don't interrupt user redirection or success feedback if email fails (important for Resend sandboxing)
        }
      }

      toast.success("Actividad enviada. La revisaremos antes de publicarla.");
      navigate({ to: "/activities" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No pudimos publicar la actividad.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell>
      <main className="bg-[#fff9f1]">
        <section className="mx-auto max-w-[1060px] px-6 pb-24 pt-14 md:px-10 md:pt-20">
          <div className="text-center">
            <h1 className="font-display text-[clamp(3rem,6vw,5rem)] leading-none text-[#11100e]">
              Publicar actividad
            </h1>
            <p className="mt-5 text-lg text-[#342b22]">
              Comparte tu evento con la comunidad de Mallorca Holística ✨
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-10 overflow-hidden rounded-[1.5rem] border border-[#eadfce] bg-white/78 shadow-[0_24px_90px_rgba(96,68,31,0.12)]"
          >
            <FormSection number={1} title="Imagen del evento">
              <div className="grid gap-8 md:grid-cols-2 md:items-start">
                <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#d6c4ad] bg-[#fffaf4] p-6 text-center">
                  <CloudUpload className="h-12 w-12 text-[#7a5730]" />
                  <span className="mt-4 text-xl font-semibold">Subir imagen</span>
                  <span className="mt-2 text-sm text-[#5d5144]">JPG, PNG · Máx. 10MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                  />
                </label>
                <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-xl bg-[#f4ede6]">
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageFile(null)}
                        className="absolute right-3 top-3 rounded-full bg-white p-2 shadow"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center p-8 text-center text-[#7a5730]">
                      <Leaf className="h-12 w-12" />
                      <p className="mt-4 font-display text-3xl">Tu imagen aparecerá aquí</p>
                    </div>
                  )}
                </div>
              </div>
            </FormSection>

            <FormSection number={2} title="Información principal">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Nombre de la actividad *">
                  <Input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                  />
                </Field>
                <Field label="Categoría *">
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Fecha *">
                  <Input
                    type="date"
                    value={eventDate}
                    onChange={(event) => setEventDate(event.target.value)}
                    required
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Hora de inicio *">
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(event) => setStartTime(event.target.value)}
                      required
                    />
                  </Field>
                  <Field label="Hora de fin">
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(event) => setEndTime(event.target.value)}
                    />
                  </Field>
                </div>
                <Field label="Lugar *">
                  <Input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    required
                  />
                </Field>
                <Field label="Precio">
                  <Input
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    placeholder="250 €"
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection number={3} title="Más información">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Facilitador">
                  <Input
                    value={facilitator}
                    onChange={(event) => setFacilitator(event.target.value)}
                  />
                </Field>
                <Field label="Descripción">
                  <Textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className="min-h-32"
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection number={4} title="Contacto">
              <div className="grid gap-5 md:grid-cols-4">
                <IconField icon={Phone} label="WhatsApp" value={whatsapp} onChange={setWhatsapp} />
                <IconField
                  icon={Instagram}
                  label="Instagram"
                  value={instagram}
                  onChange={setInstagram}
                />
                <IconField icon={Globe} label="Web" value={website} onChange={setWebsite} />
                <IconField icon={Mail} label="Email" value={email} onChange={setEmail} />
              </div>
              <div className="mt-5">
                <IconField
                  icon={CalendarDays}
                  label="Enlace de reserva"
                  value={linkReserva}
                  onChange={setLinkReserva}
                />
              </div>
              <p className="mt-5 text-sm text-[#5d5144]">
                <Lock className="mr-1 inline h-4 w-4" />
                Solo mostraremos los datos que completes.
              </p>
              <div className="mt-8 text-center">
                <Button
                  type="submit"
                  disabled={saving}
                  className="min-w-[340px] rounded-md bg-[#68754d] py-6 text-base font-bold uppercase tracking-[0.08em] text-white hover:bg-[#526046]"
                >
                  <Send className="h-4 w-4" /> {saving ? "Publicando..." : "Publicar actividad"}
                </Button>
                <p className="mt-4 text-sm text-[#7a5730]">
                  <Sparkles className="mr-1 inline h-4 w-4" />
                  Tu evento será revisado y publicado pronto.
                </p>
              </div>
            </FormSection>
          </form>
        </section>
      </main>
    </PageShell>
  );
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
    <section className="grid gap-6 border-b border-[#eadfce] p-7 last:border-b-0 md:grid-cols-[56px_1fr] md:p-9">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d9a27d] text-lg font-bold text-white">
        {number}
      </div>
      <div>
        <h2 className="mb-6 text-xl font-medium text-[#1f1c18]">{title}</h2>
        {children}
      </div>
    </section>
  );
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function IconField({
  icon: Icon,
  label,
  value,
  onChange,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field
      label={
        <span className="inline-flex items-center gap-2">
          <Icon className="h-4 w-4" /> {label}
        </span>
      }
    >
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </Field>
  );
}

function parsePrice(value: string) {
  if (!value || !/[0-9]/.test(value)) {
    return null;
  }
  const normalized = value.replace(/[^0-9,.-]/g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : null;
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "actividad"
  );
}
