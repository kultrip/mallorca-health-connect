import {
  Building,
  CheckCircle2,
  Clock,
  Edit2,
  ExternalLink,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

import { runAIPipeline, publishProfessionalLead } from "@/lib/discovery-ai";
import { slugify } from "./admin-utils";
import type { AdminTherapist, MunicipalityRow } from "./admin-types";

type AdminDiscoveryPanelProps = {
  therapists: AdminTherapist[];
  municipalities: MunicipalityRow[];
  onReload: () => Promise<void>;
};

// Realistic mock profiles to simulate pipeline output during Phase 2
const MOCK_PROFILES = [
  {
    name: "Aina Beltrán - Palma Breathwork & Zen",
    businessName: "Palma Breathwork & Zen",
    profession: "Facilitadora de Respiración Consciente y Mindfulness",
    extractedTherapies: ["Breathwork", "Mindfulness", "Meditación"],
    extractedMunicipality: "Palma",
    address: "Carrer de San Miguel, 42, 07002 Palma, Illes Balears",
    phone: "+34 687 112 233",
    whatsapp: "+34 687 112 233",
    email: "aina@palmabreathwork.com",
    website: "https://palmabreathwork.com",
    openingHours: "Lunes a Viernes: 08:30 - 20:30, Sábados: 09:00 - 13:00",
    description: "Espacio holístico dedicado al equilibrio integral a través de la respiración activa y la meditación zen. Ofrecemos talleres grupales e individuales diseñados para reducir el estrés crónico y expandir la conciencia corporal en el corazón de Mallorca.",
    profileImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600",
    metadata: [
      { field: "full_name", confidence: 99 },
      { field: "business_name", confidence: 98 },
      { field: "profession", confidence: 95 },
      { field: "extracted_therapies", confidence: 94 },
      { field: "phone", confidence: 97 },
      { field: "email", confidence: 92 },
      { field: "address", confidence: 99 },
      { field: "website", confidence: 95 },
    ],
  },
  {
    name: "Marc Sastre - Sóller Acupuntura & Reiki",
    businessName: "Sóller Acupuntura & Reiki",
    profession: "Acupuntor Licenciado y Maestro de Reiki Usui",
    extractedTherapies: ["Acupuntura", "Reiki", "Medicina Tradicional China"],
    extractedMunicipality: "Sóller",
    address: "Carrer d'en Bach, 5, 07100 Sóller, Illes Balears",
    phone: "+34 645 889 900",
    whatsapp: "+34 645 889 900",
    email: "contacto@solleraer.es",
    website: "https://solleracupunturareiki.es",
    openingHours: "Lunes a Jueves: 09:00 - 19:00, Viernes: 09:00 - 15:00",
    description: "Especialista en Medicina Tradicional China y acupuntura clínica con más de 12 años de experiencia. Armonización energética Reiki y fitoterapia para el tratamiento de dolor de espalda, problemas digestivos e insomnio.",
    profileImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600",
    metadata: [
      { field: "full_name", confidence: 95 },
      { field: "business_name", confidence: 96 },
      { field: "profession", confidence: 88 },
      { field: "extracted_therapies", confidence: 91 },
      { field: "phone", confidence: 99 },
      { field: "email", confidence: 85 },
      { field: "address", confidence: 94 },
      { field: "website", confidence: 92 },
    ],
  },
  {
    name: "Dra. Elena Ruiz - Calvià Psicología Holística",
    businessName: "Calvià Psicología Holística",
    profession: "Psicóloga Clínica y Terapeuta Gestalt",
    extractedTherapies: ["Psicología", "Terapia Gestalt", "Terapia de Pareja"],
    extractedMunicipality: "Calvià",
    address: "Avinguda del Cas Saboners, 14, 07181 Calvià, Illes Balears",
    phone: "+34 633 445 566",
    whatsapp: "",
    email: "elena.ruiz@calviapsicologiaholistica.com",
    website: "https://calviapsicologiaholistica.com",
    openingHours: "Lunes a Viernes: 10:00 - 14:00 y 16:00 - 20:00",
    description: "Sesiones de psicoterapia integrativa que combinan la psicología clínica tradicional con corrientes existenciales y corporales como la Terapia Gestalt. Un acompañamiento compasivo orientado a superar crisis vitales, ansiedad y procesos de duelo.",
    profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600",
    metadata: [
      { field: "full_name", confidence: 99 },
      { field: "business_name", confidence: 99 },
      { field: "profession", confidence: 96 },
      { field: "extracted_therapies", confidence: 95 },
      { field: "phone", confidence: 98 },
      { field: "email", confidence: 99 },
      { field: "address", confidence: 96 },
      { field: "website", confidence: 97 },
    ],
  },
  {
    name: "Inca Wellness & Sound Healing",
    businessName: "Inca Wellness & Sound Healing",
    profession: "Terapeuta de Sonido y Cuencos Tibetanos",
    extractedTherapies: ["Sonoterapia", "Sonido", "Medicina Vibracional"],
    extractedMunicipality: "Inca",
    address: "Gran Via de Colom, 110, 07300 Inca, Illes Balears",
    phone: "+34 601 223 344",
    whatsapp: "+34 601 223 344",
    email: "info@incasoundwellness.es",
    website: "https://incasoundwellness.es",
    openingHours: "Martes, Jueves y Sábados: 09:30 - 18:30",
    description: "Tratamientos de sonoterapia y baños de gongs para la relajación profunda y la liberación emocional. Cuencos tibetanos de cuarzo y diapasón clínico para reajustar las vibraciones naturales de las células del organismo.",
    profileImage: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=600",
    metadata: [
      { field: "full_name", confidence: 84 },
      { field: "business_name", confidence: 98 },
      { field: "profession", confidence: 89 },
      { field: "extracted_therapies", confidence: 90 },
      { field: "phone", confidence: 95 },
      { field: "email", confidence: 81 },
      { field: "address", confidence: 92 },
      { field: "website", confidence: 96 },
    ],
  },
];

export function AdminDiscoveryPanel({
  therapists,
  municipalities,
  onReload,
}: AdminDiscoveryPanelProps) {
  const [url, setUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importStep, setImportStep] = useState(0);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Review Dialog state
  const [reviewLead, setReviewLead] = useState<AdminTherapist | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedBusiness, setEditedBusiness] = useState("");
  const [editedProfession, setEditedProfession] = useState("");
  const [editedMunicipality, setEditedMunicipality] = useState("");
  const [editedAddress, setEditedAddress] = useState("");
  const [editedPhone, setEditedPhone] = useState("");
  const [editedWhatsapp, setEditedWhatsapp] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedWebsite, setEditedWebsite] = useState("");
  const [editedHours, setEditedOpeningHours] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedStatus, setEditedStatus] = useState("DRAFT");
  const [editedNotes, setEditedNotes] = useState("");
  const [savingLead, setSavingLead] = useState(false);

  // Outreach Dialog state (Phase 7)
  const [outreachLead, setOutreachLead] = useState<AdminTherapist | null>(null);
  const [outreachMedium, setOutreachMedium] = useState<"whatsapp" | "email">("whatsapp");
  const [outreachMessage, setOutreachMessage] = useState("");
  const [outreachSubject, setOutreachSubject] = useState("");

  // Filter leads to show only those imported via AI Discovery
  const discoveredLeads = useMemo(() => {
    return therapists.filter((t) => t.imported_by_ai === true);
  }, [therapists]);

  // Apply search query and status filtering
  const filteredLeads = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return discoveredLeads.filter((lead) => {
      const nameMatch = lead.full_name.toLowerCase().includes(query);
      const bizMatch = (lead.business_name ?? "").toLowerCase().includes(query);
      const profMatch = (lead.profession ?? "").toLowerCase().includes(query);
      const cityMatch = (lead.extracted_municipality ?? "").toLowerCase().includes(query);
      const matchesSearch = !query || nameMatch || bizMatch || profMatch || cityMatch;

      const matchesStatus = statusFilter === "ALL" || lead.crm_status === statusFilter;

      return matchesSearch && matchesStatus;
    }) as AdminTherapist[];
  }, [discoveredLeads, searchQuery, statusFilter]);

  // Pipeline simulation stages
  const pipelineStages = [
    "Validando enlace ingresado...",
    "Conectando con el sitio y extrayendo código fuente...",
    "Analizando estructura de datos con Gemini AI...",
    "Verificando duplicados y generando borrador de perfil...",
  ];

  const handleImport = async () => {
    if (!url) {
      toast.error("Por favor ingresa una URL válida.");
      return;
    }

    try {
      setImporting(true);
      setImportStep(0);

      // Step-by-step dynamic UI indicators for optimal feedback
      setImportStep(0);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setImportStep(1);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setImportStep(2);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setImportStep(3);

      // Call live backend scraping and AI pipeline
      const createdRecord = await runAIPipeline({ data: url });

      toast.success(`¡"${createdRecord.business_name || createdRecord.full_name}" importado con éxito por la IA!`);
      setUrl("");
      await onReload();
    } catch (err: any) {
      toast.error(`Error al importar: ${err.message || "Error desconocido"}`);
    } finally {
      setImporting(false);
    }
  };

  const handleClear = () => {
    setUrl("");
  };

  // Outreach templates interpolation (Phase 7)
  const generateOutreachTemplate = (lead: AdminTherapist, medium: "whatsapp" | "email") => {
    const name = lead.full_name.split(" ")[0] || lead.full_name;
    const business = lead.business_name || lead.full_name;
    const profileUrl = `https://mallorcaholistica.com/professionals/${lead.slug || slugify(lead.full_name)}`;
    const claimUrl = `https://mallorcaholistica.com/register?claim=${lead.id}`;

    if (medium === "whatsapp") {
      return `¡Hola ${name}! Te escribo de Mallorca Holística 🌿\n\nHemos creado un borrador de tu perfil profesional en nuestro directorio de terapeutas para ayudarte a ganar visibilidad en la isla de forma gratuita:\n\n👉 ${profileUrl}\n\nPuedes reclamar tu perfil gratis en menos de 2 minutos para completar tu biografía, subir fotos y publicar tus terapias, talleres y eventos:\n\n🔗 ${claimUrl}\n\n¿Te animas a echarle un vistazo? Un fuerte abrazo.`;
    } else {
      return `Hola ${name},\n\nEspero que estés teniendo un buen día.\n\nTe escribo de Mallorca Holística (https://mallorcaholistica.com), la plataforma de encuentro de terapeutas, centros y eventos de salud y bienestar en Mallorca.\n\nHemos seleccionado tu trabajo y creado un borrador de tu perfil profesional en nuestro directorio para ayudarte a ganar más visibilidad de forma 100% gratuita:\n\n👉 Tu perfil borrador: ${profileUrl}\n\nPara reclamar la propiedad del perfil, editar tus datos, subir fotos de tus sesiones y publicar tus terapias o próximos eventos, puedes usar el siguiente enlace gratuito:\n\n🔗 Reclamar perfil ahora: ${claimUrl}\n\nSi tienes cualquier duda, estaré encantada de ayudarte. ¡Esperamos tenerte en la comunidad!\n\nUn abrazo,\nEquipo de Mallorca Holística`;
    }
  };

  const openOutreach = (lead: AdminTherapist) => {
    setOutreachLead(lead);
    setOutreachMedium("whatsapp");
    setOutreachSubject(`Te hemos creado un perfil gratuito en Mallorca Holística 🌿`);
    setOutreachMessage(generateOutreachTemplate(lead, "whatsapp"));
  };

  const handleMediumChange = (medium: "whatsapp" | "email") => {
    if (!outreachLead) return;
    setOutreachMedium(medium);
    setOutreachMessage(generateOutreachTemplate(outreachLead, medium));
  };

  const sendOutreach = async () => {
    if (!outreachLead) return;

    try {
      const destination = outreachMedium === "whatsapp" 
        ? outreachLead.whatsapp || outreachLead.phone 
        : outreachLead.email;

      if (!destination) {
        toast.error(`El prospecto no tiene un ${outreachMedium === "whatsapp" ? "teléfono/WhatsApp" : "correo electrónico"} registrado.`);
        return;
      }

      if (outreachMedium === "whatsapp") {
        const cleanPhone = destination.replace(/[^\d+]/g, "");
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(cleanPhone)}&text=${encodeURIComponent(outreachMessage)}`;
        window.open(whatsappUrl, "_blank");
      } else {
        const mailtoUrl = `mailto:${encodeURIComponent(destination)}?subject=${encodeURIComponent(outreachSubject)}&body=${encodeURIComponent(outreachMessage)}`;
        window.open(mailtoUrl, "_blank");
      }

      // Automatically promote CRM status to CONTACTED
      const { error } = await supabase
        .from("therapists")
        .update({
          crm_status: "CONTACTED",
        })
        .eq("id", outreachLead.id);

      if (error) throw error;

      toast.success(`¡Se abrió el canal de ${outreachMedium === "whatsapp" ? "WhatsApp" : "Email"}! Estado promovido a CONTACTADO.`);
      setOutreachLead(null);
      await onReload();
    } catch (err: any) {
      toast.error(`Error al promover estado CRM: ${err.message}`);
    }
  };

  // Open lead review modal
  const openReview = (lead: AdminTherapist) => {
    setReviewLead(lead);
    setEditedName(lead.full_name);
    setEditedBusiness(lead.business_name ?? "");
    setEditedProfession(lead.profession ?? "");
    setEditedMunicipality(lead.extracted_municipality ?? "");
    setEditedAddress(lead.address ?? "");
    setEditedPhone(lead.phone ?? "");
    setEditedWhatsapp(lead.whatsapp ?? "");
    setEditedEmail(lead.email ?? "");
    setEditedWebsite(lead.website ?? "");
    setEditedOpeningHours(lead.opening_hours ?? "");
    setEditedDescription(lead.description ?? lead.sobre_mi ?? "");
    setEditedStatus(lead.crm_status ?? "DRAFT");
    setEditedNotes(lead.internal_notes ?? "");
  };

  // Save changes from review modal
  const saveLeadChanges = async (publishImmediate = false) => {
    if (!reviewLead) return;

    try {
      setSavingLead(true);

      // Find the corresponding municipality UUID in our database if it was edited
      const matchMun = municipalities.find(
        (m) => m.name.toLowerCase() === editedMunicipality.toLowerCase()
      );

      // 1. First save all edited fields to the database
      const { error } = await supabase
        .from("therapists")
        .update({
          full_name: editedName,
          business_name: editedBusiness,
          profession: editedProfession,
          extracted_municipality: editedMunicipality,
          municipality_id: matchMun?.id ?? reviewLead.municipality_id,
          address: editedAddress,
          phone: editedPhone,
          whatsapp: editedWhatsapp,
          email: editedEmail,
          website: editedWebsite,
          opening_hours: editedHours,
          description: editedDescription,
          sobre_mi: editedDescription, // sync legacy
          crm_status: publishImmediate ? "PUBLISHED" : editedStatus,
          status: publishImmediate ? "published" : (reviewLead.status as any),
          internal_notes: editedNotes,
        })
        .eq("id", reviewLead.id);

      if (error) throw error;

      // 2. If publishing immediately, call server-side function to auto-generate beautiful SEO slug
      if (publishImmediate) {
        await publishProfessionalLead({ data: reviewLead.id });
      }

      toast.success(
        publishImmediate
          ? "¡Perfil publicado con slug SEO optimizado con éxito!"
          : "Cambios guardados correctamente."
      );
      setReviewLead(null);
      await onReload();
    } catch (err: any) {
      toast.error(`Error al guardar/publicar: ${err.message}`);
    } finally {
      setSavingLead(false);
    }
  };

  // Publish a lead directly from the table with auto-generated clean SEO slugs
  const publishDirect = async (lead: AdminTherapist) => {
    try {
      await publishProfessionalLead({ data: lead.id });
      toast.success(`¡"${lead.business_name || lead.full_name}" publicado con slug SEO optimizado!`);
      await onReload();
    } catch (err: any) {
      toast.error(`Error al publicar: ${err.message}`);
    }
  };

  // Delete/discard a draft lead
  const discardLead = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas descartar y eliminar el prospecto "${name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase.from("therapists").delete().eq("id", id);
      if (error) throw error;
      toast.success("Prospecto descartado.");
      await onReload();
    } catch (err: any) {
      toast.error(`Error al descartar: ${err.message}`);
    }
  };

  // Get field confidence input highlights (Phase 4 review styling)
  const getFieldClass = (field: string) => {
    if (!reviewLead?.import_metadata) return "border-stone-200";
    const metadata = reviewLead.import_metadata as Array<{ field: string; confidence: number }>;
    const item = metadata.find((m) => m.field === field);
    if (!item) return "border-stone-200";

    const score = item.confidence;
    if (score >= 95) {
      return "border-emerald-300 focus-visible:ring-emerald-500 bg-emerald-50/5";
    } else if (score >= 85) {
      return "border-amber-300 focus-visible:ring-amber-500 bg-amber-50/5";
    } else {
      return "border-rose-300 focus-visible:ring-rose-500 bg-rose-50/5";
    }
  };

  // Get field confidence badge style
  const getConfidenceBadge = (field: string) => {
    if (!reviewLead?.import_metadata) return null;
    const metadata = reviewLead.import_metadata as Array<{ field: string; confidence: number }>;
    const item = metadata.find((m) => m.field === field);
    if (!item) return null;

    const score = item.confidence;
    if (score >= 95) {
      return <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-800 border-none text-[10px] py-0 px-1.5 ml-2 font-normal">Alta ({score}%)</Badge>;
    } else if (score >= 85) {
      return <Badge className="bg-amber-100 hover:bg-amber-100 text-amber-800 border-none text-[10px] py-0 px-1.5 ml-2 font-normal">Media ({score}%)</Badge>;
    } else {
      return <Badge className="bg-rose-100 hover:bg-rose-100 text-rose-800 border-none text-[10px] py-0 px-1.5 ml-2 font-normal">Revisar ({score}%)</Badge>;
    }
  };

  // Status badging for listing
  const getCrmStatusBadge = (status: string) => {
    const classes: Record<string, string> = {
      DRAFT: "bg-stone-100 text-stone-800 border-stone-200",
      PUBLISHED: "bg-emerald-100 text-emerald-800 border-emerald-200",
      CONTACTED: "bg-blue-100 text-blue-800 border-blue-200",
      WAITING_RESPONSE: "bg-amber-100 text-amber-800 border-amber-200",
      CLAIMED: "bg-purple-100 text-purple-800 border-purple-200",
      VERIFIED: "bg-teal-100 text-teal-800 border-teal-200",
      REJECTED: "bg-rose-100 text-rose-800 border-rose-200",
    };

    return (
      <Badge variant="outline" className={`font-semibold rounded-full px-2.5 py-0.5 ${classes[status] || "bg-stone-100"}`}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Ingestion Dashboard Layout */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* URL Input Form */}
        <Card className="md:col-span-2 border-stone-200 shadow-sm bg-stone-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-stone-800 font-semibold">
              <Sparkles className="h-5 w-5 text-amber-600 animate-pulse" />
              Descubrimiento con Inteligencia Artificial
            </CardTitle>
            <CardDescription className="text-stone-600">
              Ingresa el enlace de Google Maps o el sitio web corporativo de un profesional para extraer sus datos estructurados y crear un perfil borrador.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maps-url" className="text-stone-700 font-medium">Enlace de Extracción</Label>
              <div className="flex gap-2">
                <Input
                  id="maps-url"
                  placeholder="https://google.com/maps/place/... o https://sitio-web-profesional.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={importing}
                  className="bg-white border-stone-200 shadow-inner h-11 focus-visible:ring-amber-500 text-stone-800"
                />
                <Button
                  onClick={handleClear}
                  variant="outline"
                  disabled={importing || !url}
                  className="h-11 border-stone-200 text-stone-600 hover:bg-stone-100"
                >
                  Limpiar
                </Button>
              </div>
            </div>

            {/* Ingest Button */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleImport}
                disabled={importing || !url}
                className="bg-gradient-to-r from-amber-600 to-amber-700 text-white h-11 px-6 hover:from-amber-700 hover:to-amber-800 shadow-md font-medium transition-all"
              >
                {importing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ejecutando Pipeline...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Iniciar Importación
                  </>
                )}
              </Button>
            </div>

            {/* Beautiful pipeline steps progress tracker */}
            {importing && (
              <Card className="bg-white border-amber-100 p-4 shadow-sm animate-fade-in">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs text-amber-800 font-medium">
                    <span>Procesando Extracción de Datos</span>
                    <span>Paso {importStep + 1} de 4</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-600 h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${((importStep + 1) / 4) * 100}%` }}
                    />
                  </div>
                  {/* Pipeline current text */}
                  <div className="flex items-center gap-3 text-stone-700 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                    <span className="font-medium animate-pulse">
                      {pipelineStages[importStep]}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Stats card */}
        <Card className="border-stone-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg text-stone-800 font-semibold">Resumen de Campaña</CardTitle>
            <CardDescription className="text-stone-500">Métricas clave de prospección</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-stone-50 p-3 rounded-lg border border-stone-100 text-center">
                <span className="block text-xs text-stone-500 uppercase font-bold tracking-wider">Prospectos</span>
                <span className="text-2xl font-bold text-stone-800">{discoveredLeads.length}</span>
              </div>
              <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100/50 text-center">
                <span className="block text-xs text-amber-700 uppercase font-bold tracking-wider">Borradores</span>
                <span className="text-2xl font-bold text-amber-700">
                  {discoveredLeads.filter((l) => l.crm_status === "DRAFT").length}
                </span>
              </div>
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-center">
                <span className="block text-xs text-emerald-800 uppercase font-bold tracking-wider">Publicados</span>
                <span className="text-2xl font-bold text-emerald-800">
                  {discoveredLeads.filter((l) => l.crm_status === "PUBLISHED").length}
                </span>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 text-center">
                <span className="block text-xs text-purple-800 uppercase font-bold tracking-wider">Reclamados</span>
                <span className="text-2xl font-bold text-purple-800">
                  {discoveredLeads.filter((l) => l.crm_status === "CLAIMED" || l.crm_status === "VERIFIED").length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discovery List Section */}
      <Card className="border-stone-200 shadow-sm bg-white">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stone-100">
          <div>
            <CardTitle className="text-lg text-stone-800 font-semibold">Borradores y Prospectos AI ({filteredLeads.length})</CardTitle>
            <CardDescription className="text-stone-500">
              Registros descubiertos y extraídos automáticamente. Revisa, edita campos de confianza y publica perfiles directamente.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Buscar prospectos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 border-stone-200 focus-visible:ring-amber-500"
              />
            </div>
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44 h-10 border-stone-200">
                <SelectValue placeholder="Filtrar por Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los Estados</SelectItem>
                <SelectItem value="DRAFT">DRAFT (Borrador)</SelectItem>
                <SelectItem value="PUBLISHED">PUBLISHED (Publicado)</SelectItem>
                <SelectItem value="CONTACTED">CONTACTED (Contactado)</SelectItem>
                <SelectItem value="WAITING_RESPONSE">WAITING_RESPONSE</SelectItem>
                <SelectItem value="CLAIMED">CLAIMED (Reclamado)</SelectItem>
                <SelectItem value="VERIFIED">VERIFIED (Verificado)</SelectItem>
                <SelectItem value="REJECTED">REJECTED (Rechazado)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredLeads.length === 0 ? (
            <div className="p-12 text-center text-stone-500">
              <Sparkles className="h-10 w-10 text-stone-300 mx-auto mb-4" />
              <p className="font-medium">No se encontraron prospectos de descubrimiento.</p>
              <p className="text-sm text-stone-400 mt-1">Ingresa un enlace en la barra superior para importar el primero.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-stone-50/70">
                  <TableRow className="border-stone-100 hover:bg-stone-50/70">
                    <TableHead className="font-semibold text-stone-700 py-3.5">Estado</TableHead>
                    <TableHead className="font-semibold text-stone-700 py-3.5">Fecha</TableHead>
                    <TableHead className="font-semibold text-stone-700 py-3.5">Profesional / Negocio</TableHead>
                    <TableHead className="font-semibold text-stone-700 py-3.5">Municipio Extrapolado</TableHead>
                    <TableHead className="font-semibold text-stone-700 py-3.5 text-right pr-6">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id} className="border-stone-100 hover:bg-stone-50/40 transition-colors">
                      <TableCell className="align-middle">{getCrmStatusBadge(lead.crm_status)}</TableCell>
                      <TableCell className="text-stone-500 font-medium text-xs align-middle">
                        {new Date(lead.created_at).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="align-middle">
                        <div className="font-semibold text-stone-800 text-sm">{lead.full_name}</div>
                        {lead.business_name && (
                          <div className="text-stone-500 text-xs flex items-center gap-1 mt-0.5">
                            <Building className="h-3 w-3 text-stone-400" />
                            {lead.business_name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="align-middle">
                        <span className="inline-flex items-center gap-1 text-stone-700 text-sm font-medium">
                          <MapPin className="h-3.5 w-3.5 text-amber-600" />
                          {lead.extracted_municipality || lead.city || "Pendiente de mapeo"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6 align-middle space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openReview(lead)}
                          className="border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-semibold"
                        >
                          <Edit2 className="mr-1 h-3.5 w-3.5 text-stone-500" />
                          Revisar
                        </Button>
                        {lead.crm_status === "DRAFT" && (
                          <Button
                            size="sm"
                            onClick={() => publishDirect(lead)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                          >
                            Publicar
                          </Button>
                        )}
                        {(lead.crm_status === "PUBLISHED" || lead.crm_status === "CONTACTED") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openOutreach(lead)}
                            className="border-purple-200 text-purple-700 bg-purple-50/50 hover:bg-purple-100/80 text-xs font-semibold"
                          >
                            <Sparkles className="mr-1 h-3.5 w-3.5 text-purple-600 animate-pulse" />
                            Invitar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => discardLead(lead.id, lead.full_name)}
                          className="text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog Modal (Phase 4 Foundation) */}
      <Dialog open={reviewLead !== null} onOpenChange={(open) => !open && setReviewLead(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-stone-200 rounded-xl bg-white shadow-2xl p-6">
          <DialogHeader className="border-b border-stone-100 pb-4">
            <DialogTitle className="text-xl flex items-center gap-2 text-stone-800 font-semibold">
              <Sparkles className="h-5 w-5 text-amber-600" />
              Revisar Datos del Prospecto
            </DialogTitle>
            <DialogDescription className="text-stone-500">
              Verifica y corrige la información extraída por la IA. Valida los indicadores de confianza antes de publicar el perfil.
            </DialogDescription>
          </DialogHeader>

          {/* Form details */}
          <div className="grid gap-6 md:grid-cols-2 py-4">
            {/* Left Column: Basic Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider border-b border-stone-100 pb-1">
                Información Básica
              </h3>

              <div className="space-y-1.5">
                <div className="flex items-center">
                  <Label htmlFor="lead-name" className="text-stone-700 font-medium text-sm">Nombre del Profesional</Label>
                  {getConfidenceBadge("full_name")}
                </div>
                <Input
                  id="lead-name"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className={`focus-visible:ring-amber-500 text-stone-800 ${getFieldClass("full_name")}`}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center">
                  <Label htmlFor="lead-business" className="text-stone-700 font-medium text-sm">Nombre Comercial / Centro</Label>
                  {getConfidenceBadge("business_name")}
                </div>
                <Input
                  id="lead-business"
                  value={editedBusiness}
                  onChange={(e) => setEditedBusiness(e.target.value)}
                  className={`focus-visible:ring-amber-500 text-stone-800 ${getFieldClass("business_name")}`}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center">
                  <Label htmlFor="lead-profession" className="text-stone-700 font-medium text-sm">Disciplina / Profesión</Label>
                  {getConfidenceBadge("profession")}
                </div>
                <Input
                  id="lead-profession"
                  value={editedProfession}
                  onChange={(e) => setEditedProfession(e.target.value)}
                  className={`focus-visible:ring-amber-500 text-stone-800 ${getFieldClass("profession")}`}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center">
                  <Label htmlFor="lead-municipality" className="text-stone-700 font-medium text-sm">Municipio Extraído</Label>
                  {getConfidenceBadge("extracted_municipality")}
                </div>
                <Input
                  id="lead-municipality"
                  value={editedMunicipality}
                  onChange={(e) => setEditedMunicipality(e.target.value)}
                  placeholder="Ej. Palma, Sóller, Inca..."
                  className={`focus-visible:ring-amber-500 text-stone-800 ${getFieldClass("extracted_municipality")}`}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center">
                  <Label htmlFor="lead-address" className="text-stone-700 font-medium text-sm">Dirección Completa</Label>
                  {getConfidenceBadge("address")}
                </div>
                <Input
                  id="lead-address"
                  value={editedAddress}
                  onChange={(e) => setEditedAddress(e.target.value)}
                  className={`focus-visible:ring-amber-500 text-stone-800 ${getFieldClass("address")}`}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lead-opening" className="text-stone-700 font-medium text-sm">Horario de Apertura</Label>
                <Input
                  id="lead-opening"
                  value={editedHours}
                  onChange={(e) => setEditedOpeningHours(e.target.value)}
                  className="border-stone-200 focus-visible:ring-amber-500 text-stone-800"
                />
              </div>
            </div>

            {/* Right Column: Contacts, Source and CRM */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider border-b border-stone-100 pb-1">
                Contacto, Medios y CRM
              </h3>

              <div className="space-y-1.5">
                <div className="flex items-center">
                  <Label htmlFor="lead-phone" className="text-stone-700 font-medium text-sm">Teléfono Fijo / Móvil</Label>
                  {getConfidenceBadge("phone")}
                </div>
                <Input
                  id="lead-phone"
                  value={editedPhone}
                  onChange={(e) => setEditedPhone(e.target.value)}
                  className={`focus-visible:ring-amber-500 text-stone-800 ${getFieldClass("phone")}`}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lead-whatsapp" className="text-stone-700 font-medium text-sm">WhatsApp Business</Label>
                <Input
                  id="lead-whatsapp"
                  value={editedWhatsapp}
                  onChange={(e) => setEditedWhatsapp(e.target.value)}
                  className="border-stone-200 focus-visible:ring-amber-500 text-stone-800"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center">
                  <Label htmlFor="lead-email" className="text-stone-700 font-medium text-sm">Correo Electrónico</Label>
                  {getConfidenceBadge("email")}
                </div>
                <Input
                  id="lead-email"
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  className={`focus-visible:ring-amber-500 text-stone-800 ${getFieldClass("email")}`}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center">
                  <Label htmlFor="lead-website" className="text-stone-700 font-medium text-sm">Sitio Web Oficial</Label>
                  {getConfidenceBadge("website")}
                </div>
                <Input
                  id="lead-website"
                  value={editedWebsite}
                  onChange={(e) => setEditedWebsite(e.target.value)}
                  className={`focus-visible:ring-amber-500 text-stone-800 ${getFieldClass("website")}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-stone-700 font-medium text-sm">Pipeline CRM</Label>
                  <Select value={editedStatus} onValueChange={setEditedStatus}>
                    <SelectTrigger className="border-stone-200 text-stone-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">DRAFT (Borrador)</SelectItem>
                      <SelectItem value="CONTACTED">CONTACTED (Contactado)</SelectItem>
                      <SelectItem value="WAITING_RESPONSE">WAITING_RESPONSE</SelectItem>
                      <SelectItem value="CLAIMED">CLAIMED (Reclamado)</SelectItem>
                      <SelectItem value="VERIFIED">VERIFIED (Verificado)</SelectItem>
                      <SelectItem value="REJECTED">REJECTED (Rechazado)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-stone-700 font-medium text-sm">Origen / Canal</Label>
                  <Input
                    value={reviewLead?.source || "Google Maps"}
                    disabled
                    className="bg-stone-50 border-stone-200 text-stone-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lead-notes" className="text-stone-700 font-medium text-sm">Notas Internas Administrativas</Label>
                <Textarea
                  id="lead-notes"
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  rows={2}
                  className="border-stone-200 focus-visible:ring-amber-500 text-stone-800 text-sm"
                  placeholder="Agrega anotaciones sobre la comunicación o validación del lead..."
                />
              </div>
            </div>

            {/* Bottom Row: Full Extracted Description */}
            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="lead-desc" className="text-stone-700 font-medium text-sm">Descripción del Negocio / Bio Extrapolada</Label>
              <Textarea
                id="lead-desc"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                rows={3}
                className="border-stone-200 focus-visible:ring-amber-500 text-stone-800 text-sm leading-relaxed"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-stone-100 pt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={() => setReviewLead(null)}
              disabled={savingLead}
              className="border-stone-200 text-stone-700 hover:bg-stone-100"
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              onClick={() => saveLeadChanges(false)}
              disabled={savingLead}
              className="border-stone-200 text-stone-800 hover:bg-stone-50"
            >
              {savingLead ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
              Guardar Cambios
            </Button>
            <Button
              onClick={() => saveLeadChanges(true)}
              disabled={savingLead}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 shadow-md font-medium"
            >
              {savingLead ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
              Aprobar y Publicar Perfil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Outreach / Invite Dialog Modal (Phase 7) */}
      <Dialog open={outreachLead !== null} onOpenChange={(open) => !open && setOutreachLead(null)}>
        <DialogContent className="max-w-xl border border-stone-200 bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl">
          <DialogHeader className="border-b border-stone-100 pb-4">
            <DialogTitle className="font-display text-lg text-stone-800 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
              Enviar Invitación de Reclamación
            </DialogTitle>
            <DialogDescription className="text-stone-500 text-xs mt-1">
              Genera mensajes y enlaces de acceso para que el profesional reclame su perfil en Mallorca Holística.
            </DialogDescription>
          </DialogHeader>

          {outreachLead && (
            <div className="space-y-4 py-4">
              <div className="rounded-2xl bg-stone-50 p-4 border border-stone-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-stone-800">{outreachLead.full_name}</h4>
                  <p className="text-xs text-stone-500 mt-0.5">{outreachLead.business_name || outreachLead.profession}</p>
                </div>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  {outreachLead.crm_status}
                </Badge>
              </div>

              {/* Selector de Canal */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-stone-700">Canal de Comunicación</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleMediumChange("whatsapp")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all ${
                      outreachMedium === "whatsapp"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm animate-pulse-subtle"
                        : "border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <Phone className="h-4 w-4 text-emerald-600" />
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMediumChange("email")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all ${
                      outreachMedium === "email"
                        ? "bg-blue-50 border-blue-300 text-blue-800 shadow-sm animate-pulse-subtle"
                        : "border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <Mail className="h-4 w-4 text-blue-600" />
                    Correo Electrónico
                  </button>
                </div>
              </div>

              {/* Información de Contacto Destino */}
              <div className="rounded-xl border border-stone-100 bg-stone-50/50 p-3 flex items-center justify-between text-xs">
                <span className="text-stone-500">Destinatario registrado:</span>
                <span className="font-bold text-stone-800">
                  {outreachMedium === "whatsapp"
                    ? outreachLead.whatsapp || outreachLead.phone || "Sin teléfono"
                    : outreachLead.email || "Sin email"}
                </span>
              </div>

              {/* Asunto (Solo Email) */}
              {outreachMedium === "email" && (
                <div className="space-y-1.5">
                  <Label htmlFor="outreach-subject" className="text-xs font-semibold text-stone-700">Asunto del Correo</Label>
                  <Input
                    id="outreach-subject"
                    value={outreachSubject}
                    onChange={(e) => setOutreachSubject(e.target.value)}
                    className="border-stone-200 focus-visible:ring-amber-500 text-stone-800 text-xs"
                  />
                </div>
              )}

              {/* Cuerpo del Mensaje */}
              <div className="space-y-1.5">
                <Label htmlFor="outreach-message" className="text-xs font-semibold text-stone-700">Mensaje a Enviar</Label>
                <Textarea
                  id="outreach-message"
                  value={outreachMessage}
                  onChange={(e) => setOutreachMessage(e.target.value)}
                  rows={8}
                  className="border-stone-200 focus-visible:ring-amber-500 text-stone-800 text-xs leading-relaxed font-mono whitespace-pre-wrap"
                />
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-stone-100 pt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={() => setOutreachLead(null)}
              className="border-stone-200 text-stone-700 hover:bg-stone-100"
            >
              Cancelar
            </Button>
            <Button
              onClick={sendOutreach}
              className={`text-white font-semibold flex items-center gap-1.5 ${
                outreachMedium === "whatsapp"
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                  : "bg-blue-600 hover:bg-blue-700 shadow-sm"
              }`}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {outreachMedium === "whatsapp" ? "Abrir WhatsApp y Marcar Contactado" : "Enviar Email y Marcar Contactado"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
