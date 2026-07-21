import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
loadEnv(resolve(root, ".env"));
loadEnv(resolve(root, ".env.local"));

const supabaseUrl =
  process.env.SECRET_SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey =
  process.env.SECRET_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const demoAdminEmail = process.env.MH_DEMO_ADMIN_EMAIL || "admin-demo@mallorcaholistica.com";
const demoAdminPassword = process.env.MH_DEMO_ADMIN_PASSWORD || "MallorcaDemoAdmin!2026";

if (!supabaseUrl || !serviceRoleKey) {
  fail(
    "Missing Supabase service credentials. Set SECRET_SUPABASE_URL and SECRET_SUPABASE_SERVICE_ROLE_KEY, or SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const reference = {
  municipalities: [
    { slug: "alaro", name: "Alaró", lat: 39.7028, lng: 2.7906 },
    { slug: "alcudia", name: "Alcúdia", lat: 39.8517, lng: 3.1231 },
    { slug: "algaida", name: "Algaida", lat: 39.5597, lng: 2.8944 },
    { slug: "andratx", name: "Andratx", lat: 39.5761, lng: 2.4278 },
    { slug: "ariany", name: "Ariany", lat: 39.6514, lng: 3.1114 },
    { slug: "arta", name: "Artà", lat: 39.6917, lng: 3.3556 },
    { slug: "banyalbufar", name: "Banyalbufar", lat: 39.6875, lng: 2.5131 },
    { slug: "binissalem", name: "Binissalem", lat: 39.6831, lng: 2.8331 },
    { slug: "buger", name: "Búger", lat: 39.7592, lng: 2.9839 },
    { slug: "bunyola", name: "Bunyola", lat: 39.6961, lng: 2.6994 },
    { slug: "calvia", name: "Calvià", lat: 39.5658, lng: 2.5061 },
    { slug: "campanet", name: "Campanet", lat: 39.7744, lng: 2.9658 },
    { slug: "campos", name: "Campos", lat: 39.4311, lng: 3.0189 },
    { slug: "capdepera", name: "Capdepera", lat: 39.7083, lng: 3.4333 },
    { slug: "consell", name: "Consell", lat: 39.6739, lng: 2.8122 },
    { slug: "costitx", name: "Costitx", lat: 39.6936, lng: 2.9494 },
    { slug: "deia", name: "Deià", lat: 39.7492, lng: 2.6481 },
    { slug: "escorca", name: "Escorca", lat: 39.8228, lng: 2.8469 },
    { slug: "esporles", name: "Esporles", lat: 39.6669, lng: 2.5786 },
    { slug: "estellencs", name: "Estellencs", lat: 39.6542, lng: 2.4819 },
    { slug: "felanitx", name: "Felanitx", lat: 39.4697, lng: 3.1478 },
    { slug: "fornalutx", name: "Fornalutx", lat: 39.7825, lng: 2.7411 },
    { slug: "inca", name: "Inca", lat: 39.7214, lng: 2.9111 },
    { slug: "lloret-de-vistalegre", name: "Lloret de Vistalegre", lat: 39.6178, lng: 2.9739 },
    { slug: "lloseta", name: "Lloseta", lat: 39.7175, lng: 2.8664 },
    { slug: "llubi", name: "Llubí", lat: 39.7997, lng: 3.0039 },
    { slug: "llucmajor", name: "Llucmajor", lat: 39.4897, lng: 2.8889 },
    { slug: "manacor", name: "Manacor", lat: 39.5694, lng: 3.2097 },
    { slug: "mancor-de-la-vall", name: "Mancor de la Vall", lat: 39.7503, lng: 2.8717 },
    { slug: "maria-de-la-salut", name: "Maria de la Salut", lat: 39.6853, lng: 3.0728 },
    { slug: "marratxi", name: "Marratxí", lat: 39.6212, lng: 2.7256 },
    { slug: "montuiri", name: "Montuïri", lat: 39.5672, lng: 2.9819 },
    { slug: "muro", name: "Muro", lat: 39.7675, lng: 3.1114 },
    { slug: "palma", name: "Palma de Mallorca", lat: 39.5696, lng: 2.6502 },
    { slug: "petra", name: "Petra", lat: 39.6136, lng: 3.1125 },
    { slug: "pollenca", name: "Pollença", lat: 39.8789, lng: 3.0139 },
    { slug: "porreres", name: "Porreres", lat: 39.5186, lng: 3.0233 },
    { slug: "puigpunyent", name: "Puigpunyent", lat: 39.6225, lng: 2.5275 },
    { slug: "sa-pobla", name: "Sa Pobla", lat: 39.7711, lng: 3.0236 },
    { slug: "sant-joan", name: "Sant Joan", lat: 39.5936, lng: 3.0406 },
    {
      slug: "sant-llorenc-des-cardassar",
      name: "Sant Llorenç des Cardassar",
      lat: 39.6111,
      lng: 3.2842,
    },
    { slug: "santa-eugenia", name: "Santa Eugènia", lat: 39.6247, lng: 2.8389 },
    { slug: "santa-margalida", name: "Santa Margalida", lat: 39.7011, lng: 3.1036 },
    { slug: "santa-maria-del-cami", name: "Santa Maria del Camí", lat: 39.6517, lng: 2.7956 },
    { slug: "santanyi", name: "Santanyí", lat: 39.3528, lng: 3.1306 },
    { slug: "selva", name: "Selva", lat: 39.7533, lng: 2.9069 },
    { slug: "sencelles", name: "Sencelles", lat: 39.6456, lng: 2.8986 },
    { slug: "ses-salines", name: "Ses Salines", lat: 39.3392, lng: 3.0561 },
    { slug: "sineu", name: "Sineu", lat: 39.6511, lng: 3.0175 },
    { slug: "soller", name: "Sóller", lat: 39.7667, lng: 2.7167 },
    { slug: "son-servera", name: "Son Servera", lat: 39.6211, lng: 3.3603 },
    { slug: "valldemossa", name: "Valldemossa", lat: 39.7125, lng: 2.6214 },
    { slug: "vilafranca-de-bonany", name: "Vilafranca de Bonany", lat: 39.5694, lng: 3.0886 },
  ],
  therapies: [
    {
      slug: "reiki",
      name: "Reiki",
      category: "Energetica",
      short_description: "Acompanamiento energetico para recuperar equilibrio y calma.",
    },
    {
      slug: "acupuntura",
      name: "Acupuntura",
      category: "Medicina tradicional china",
      short_description: "Tecnica corporal para dolor, estres y regulacion energetica.",
    },
    {
      slug: "naturopatia",
      name: "Naturopatia",
      category: "Salud integrativa",
      short_description: "Habitos, alimentacion y recursos naturales para el bienestar.",
    },
    {
      slug: "osteopatia",
      name: "Osteopatia",
      category: "Terapia corporal",
      short_description: "Trabajo manual para movilidad, postura y dolor fisico.",
    },
    {
      slug: "meditacion",
      name: "Meditacion",
      category: "Mindfulness",
      short_description: "Practicas de presencia para reducir ruido mental y ansiedad.",
    },
    {
      slug: "terapia-emocional",
      name: "Terapia emocional",
      category: "Acompanamiento emocional",
      short_description: "Espacio terapeutico para gestionar emociones y etapas vitales.",
    },
    {
      slug: "masaje-terapeutico",
      name: "Masaje terapeutico",
      category: "Terapia corporal",
      short_description: "Masaje para relajar tension y aliviar molestias musculares.",
    },
    {
      slug: "yoga-terapeutico",
      name: "Yoga terapeutico",
      category: "Movimiento consciente",
      short_description: "Movimiento, respiracion y conciencia corporal adaptada.",
    },
  ],
  helpAreas: [
    {
      slug: "ansiedad",
      name: "Ansiedad",
      description: "Acompanamiento para nerviosismo, preocupacion y tension interna.",
      keywords: ["ansiedad", "estres", "nervios", "preocupacion"],
    },
    {
      slug: "estres",
      name: "Estres",
      description: "Apoyo para sobrecarga, agotamiento y dificultad para parar.",
      keywords: ["estres", "sobrecarga", "agotamiento", "tension"],
    },
    {
      slug: "insomnio",
      name: "Insomnio",
      description: "Recursos para descanso, conciliacion del sueno y calma nocturna.",
      keywords: ["insomnio", "dormir", "sueno", "descanso"],
    },
    {
      slug: "dolor-cronico",
      name: "Dolor cronico",
      description: "Acompanamiento para molestias persistentes y dolor recurrente.",
      keywords: ["dolor", "cronico", "espalda", "cervical"],
    },
    {
      slug: "duelo",
      name: "Duelo",
      description: "Apoyo emocional en procesos de perdida y cambio.",
      keywords: ["duelo", "perdida", "tristeza", "separacion"],
    },
    {
      slug: "equilibrio-emocional",
      name: "Equilibrio emocional",
      description: "Acompanamiento para claridad, autoestima y regulacion emocional.",
      keywords: ["emociones", "autoestima", "bloqueo", "equilibrio"],
    },
    {
      slug: "fatiga",
      name: "Fatiga",
      description: "Apoyo para cansancio, baja energia y recuperacion vital.",
      keywords: ["fatiga", "cansancio", "energia", "vitalidad"],
    },
  ],
};

const therapists = [
  {
    slug: "demo-lucia-gelabert",
    full_name: "Demo - Lucia Gelabert",
    headline: "Terapeuta energetica · Maestra ChiKung · Reiki",
    frase_clave: "Te acompano a recuperar el equilibrio y sentirte mejor.",
    sobre_mi:
      "Soy terapeuta especializada en Reiki y sanacion energetica. Acompano procesos emocionales desde la calma, la escucha y la presencia.",
    formacion: "Maestra Reiki Usui Tibetano\nMaestra ChiKung Internacional\nTerapeuta energetica",
    experiencia: "10 anos acompanando procesos individuales y espacios de bienestar.",
    especialidad: "Reiki y terapia energetica",
    subespecialidades: ["Reiki", "ChiKung", "Sanacion energetica"],
    modalities: ["presencial", "online"],
    years_experience: 10,
    municipality: "marratxi",
    city: "Marratxi",
    address: "Carrer Major 18, Marratxi",
    lat: 39.6219,
    lng: 2.728,
    whatsapp: "+34600111222",
    phone: "+34600111222",
    email: "demo.lucia@mallorcaholistica.com",
    link_reserva: "https://calendly.com/demo-mallorca-holistica/lucia",
    website: "https://mallorcaholistica.com",
    languages: ["es", "ca"],
    verified: true,
    status: "published",
    plan: "profesional",
    subscription_status: "active",
    therapies: ["reiki", "meditacion", "terapia-emocional"],
    helpAreas: ["ansiedad", "estres", "equilibrio-emocional"],
    sessions: [
      { name: "Sesion individual", duration: "60 min", price_cents: 7500, position: 1 },
      { name: "Sesion profunda", duration: "90 min", price_cents: 9500, position: 2 },
    ],
  },
  {
    slug: "demo-sarah-molina",
    full_name: "Demo - Sarah Molina",
    headline: "Naturopata · Masajista",
    frase_clave: "Cuidado natural para digestion, energia y equilibrio hormonal.",
    sobre_mi:
      "Acompano a personas que buscan mejorar sus habitos, aliviar tension y escuchar mejor las necesidades de su cuerpo.",
    formacion: "Naturopatia integrativa\nQuiromasaje terapeutico\nFlores de Bach",
    experiencia: "8 anos en consulta individual y talleres de salud natural.",
    especialidad: "Naturopatia",
    subespecialidades: ["Digestion", "Sistema inmunologico", "Equilibrio hormonal"],
    modalities: ["presencial", "domicilio"],
    years_experience: 8,
    municipality: "palma",
    city: "Palma de Mallorca",
    address: "Carrer de la Missio 12, Palma",
    lat: 39.5732,
    lng: 2.6509,
    whatsapp: "+34600222333",
    phone: "+34600222333",
    email: "demo.sarah@mallorcaholistica.com",
    link_reserva: "https://calendly.com/demo-mallorca-holistica/sarah",
    website: "https://mallorcaholistica.com",
    languages: ["es", "en"],
    verified: true,
    status: "published",
    plan: "profesional",
    subscription_status: "active",
    therapies: ["naturopatia", "masaje-terapeutico"],
    helpAreas: ["fatiga", "estres", "equilibrio-emocional"],
    sessions: [{ name: "Consulta inicial", duration: "75 min", price_cents: 8500, position: 1 }],
  },
  {
    slug: "demo-pau-clenco",
    full_name: "Demo - Pau Clenco",
    headline: "Psicoterapeuta · Biodescodificacion",
    frase_clave: "Un espacio para comprender lo que sientes y abrir caminos nuevos.",
    sobre_mi:
      "Trabajo con procesos emocionales, ansiedad, duelos y bloqueos vitales desde una mirada integrativa y humana.",
    formacion: "Psicoterapia integrativa\nBiodescodificacion\nAcompanamiento en duelo",
    experiencia: "12 anos de experiencia en consulta y grupos terapeuticos.",
    especialidad: "Terapia emocional",
    subespecialidades: ["Duelo", "Ansiedad", "Relaciones"],
    modalities: ["presencial", "online"],
    years_experience: 12,
    municipality: "palma",
    city: "Palma de Mallorca",
    address: "Carrer de Sant Miquel 42, Palma",
    lat: 39.5761,
    lng: 2.6518,
    whatsapp: "+34600333444",
    phone: "+34600333444",
    email: "demo.pau@mallorcaholistica.com",
    link_reserva: "https://calendly.com/demo-mallorca-holistica/pau",
    website: "https://mallorcaholistica.com",
    languages: ["es", "ca", "en"],
    verified: true,
    status: "published",
    plan: "profesional",
    subscription_status: "active",
    therapies: ["terapia-emocional", "meditacion"],
    helpAreas: ["duelo", "ansiedad", "equilibrio-emocional"],
    sessions: [{ name: "Sesion terapeutica", duration: "60 min", price_cents: 7000, position: 1 }],
  },
  {
    slug: "demo-marta-ribas",
    full_name: "Demo - Marta Ribas",
    headline: "Osteopata · Masaje terapeutico",
    frase_clave: "Alivia tension corporal y recupera movilidad con escucha y precision.",
    sobre_mi:
      "Acompano dolores fisicos, contracturas y molestias cronicas con trabajo manual respetuoso y adaptado.",
    formacion: "Osteopatia estructural\nMasaje terapeutico\nAnatomia aplicada",
    experiencia: "9 anos en terapia manual y acompanamiento corporal.",
    especialidad: "Osteopatia",
    subespecialidades: ["Dolor de espalda", "Cervicales", "Movilidad"],
    modalities: ["presencial"],
    years_experience: 9,
    municipality: "inca",
    city: "Inca",
    address: "Avinguda del General Luque 21, Inca",
    lat: 39.7203,
    lng: 2.9109,
    whatsapp: "+34600444555",
    phone: "+34600444555",
    email: "demo.marta@mallorcaholistica.com",
    link_reserva: "https://calendly.com/demo-mallorca-holistica/marta",
    website: "https://mallorcaholistica.com",
    languages: ["es", "ca"],
    verified: true,
    status: "published",
    plan: "centros-organizadores",
    subscription_status: "active",
    therapies: ["osteopatia", "masaje-terapeutico"],
    helpAreas: ["dolor-cronico", "estres"],
    sessions: [{ name: "Sesion corporal", duration: "60 min", price_cents: 6500, position: 1 }],
  },
  {
    slug: "demo-ana-ferrer",
    full_name: "Demo - Ana Ferrer",
    headline: "Profesora de yoga terapeutico",
    frase_clave: "Movimiento suave para respirar mejor, parar y volver al cuerpo.",
    sobre_mi:
      "Guio sesiones de yoga adaptado para personas con estres, cansancio o necesidad de reconectar con su cuerpo.",
    formacion: "Yoga terapeutico\nRespiracion consciente\nMeditacion guiada",
    experiencia: "6 anos guiando grupos y sesiones individuales.",
    especialidad: "Yoga terapeutico",
    subespecialidades: ["Respiracion", "Movimiento consciente", "Relajacion"],
    modalities: ["presencial", "online"],
    years_experience: 6,
    municipality: "soller",
    city: "Soller",
    address: "Carrer de la Lluna 9, Soller",
    lat: 39.7668,
    lng: 2.7148,
    whatsapp: "+34600555666",
    phone: "+34600555666",
    email: "demo.ana@mallorcaholistica.com",
    link_reserva: "https://calendly.com/demo-mallorca-holistica/ana",
    website: "https://mallorcaholistica.com",
    languages: ["es", "en"],
    verified: true,
    status: "published",
    plan: "centros-organizadores",
    subscription_status: "active",
    therapies: ["yoga-terapeutico", "meditacion"],
    helpAreas: ["estres", "insomnio", "fatiga"],
    sessions: [{ name: "Yoga individual", duration: "60 min", price_cents: 5500, position: 1 }],
  },
  {
    slug: "demo-joan-costa",
    full_name: "Demo - Joan Costa",
    headline: "Acupuntor · Medicina tradicional china",
    frase_clave: "Equilibrio energetico para dolor, descanso y vitalidad.",
    sobre_mi:
      "Trabajo con acupuntura y pautas de medicina china para aliviar dolor, regular energia y mejorar descanso.",
    formacion: "Medicina tradicional china\nAcupuntura clasica\nAuriculoterapia",
    experiencia: "11 anos de practica clinica.",
    especialidad: "Acupuntura",
    subespecialidades: ["Dolor cronico", "Insomnio", "Vitalidad"],
    modalities: ["presencial"],
    years_experience: 11,
    municipality: "manacor",
    city: "Manacor",
    address: "Carrer Major 34, Manacor",
    lat: 39.5704,
    lng: 3.2104,
    whatsapp: "+34600666777",
    phone: "+34600666777",
    email: "demo.joan@mallorcaholistica.com",
    link_reserva: "https://calendly.com/demo-mallorca-holistica/joan",
    website: "https://mallorcaholistica.com",
    languages: ["es", "ca"],
    verified: true,
    status: "published",
    plan: "profesional",
    subscription_status: "active",
    therapies: ["acupuntura"],
    helpAreas: ["dolor-cronico", "insomnio", "fatiga"],
    sessions: [
      { name: "Sesion de acupuntura", duration: "60 min", price_cents: 7000, position: 1 },
    ],
  },
  {
    slug: "demo-elena-vives",
    full_name: "Demo - Elena Vives",
    headline: "Meditacion · Mindfulness",
    frase_clave: "Aprende a parar y escucharte sin exigencia.",
    sobre_mi:
      "Ofrezco acompanamiento de mindfulness y meditacion para personas que necesitan bajar revoluciones.",
    formacion: "Mindfulness MBSR\nMeditacion compasiva\nGestion del estres",
    experiencia: "5 anos en sesiones individuales y pequenos grupos.",
    especialidad: "Meditacion",
    subespecialidades: ["Mindfulness", "Estres", "Insomnio"],
    modalities: ["online"],
    years_experience: 5,
    municipality: "calvia",
    city: "Calvia",
    address: "Calvia",
    lat: 39.5657,
    lng: 2.5062,
    whatsapp: "+34600777888",
    phone: "+34600777888",
    email: "demo.elena@mallorcaholistica.com",
    link_reserva: "https://calendly.com/demo-mallorca-holistica/elena",
    website: "https://mallorcaholistica.com",
    languages: ["es", "en", "de"],
    verified: true,
    status: "published",
    plan: "presencia",
    subscription_status: null,
    therapies: ["meditacion"],
    helpAreas: ["estres", "insomnio", "ansiedad"],
    sessions: [{ name: "Sesion online", duration: "45 min", price_cents: 4500, position: 1 }],
  },
  {
    slug: "demo-nuria-sola",
    full_name: "Demo - Nuria Sola",
    headline: "Terapeuta floral · Acompanamiento emocional",
    frase_clave: "Proceso pendiente de revision por Mallorca Holistica.",
    sobre_mi:
      "Perfil demo en estado pendiente para probar el flujo de verificacion desde administracion.",
    formacion: "Flores de Bach\nAcompanamiento emocional",
    experiencia: "4 anos de practica.",
    especialidad: "Terapia emocional",
    subespecialidades: ["Flores de Bach", "Ansiedad", "Duelo"],
    modalities: ["presencial", "online"],
    years_experience: 4,
    municipality: "palma",
    city: "Palma de Mallorca",
    address: "Palma",
    lat: 39.5705,
    lng: 2.648,
    whatsapp: "+34600888999",
    phone: "+34600888999",
    email: "demo.nuria@mallorcaholistica.com",
    link_reserva: null,
    website: null,
    languages: ["es"],
    verified: false,
    status: "pending",
    plan: "presencia",
    subscription_status: null,
    verification_submitted_at: new Date().toISOString(),
    verification_document_name: "demo-diploma-nuria.pdf",
    verification_document_path: "demo/nuria/demo-diploma-nuria.pdf",
    therapies: ["terapia-emocional"],
    helpAreas: ["ansiedad", "duelo"],
    sessions: [{ name: "Sesion floral", duration: "60 min", price_cents: 5000, position: 1 }],
  },
  {
    slug: "demo-carlos-marin",
    full_name: "Demo - Carlos Marin",
    headline: "Masaje y bienestar corporal",
    frase_clave: "Perfil demo en borrador para revisar en administracion.",
    sobre_mi: "Perfil demo en borrador, no visible publicamente.",
    formacion: "Quiromasaje\nMasaje deportivo",
    experiencia: "3 anos de experiencia.",
    especialidad: "Masaje terapeutico",
    subespecialidades: ["Masaje", "Dolor muscular"],
    modalities: ["presencial", "domicilio"],
    years_experience: 3,
    municipality: "palma",
    city: "Palma de Mallorca",
    address: "Palma",
    lat: 39.575,
    lng: 2.66,
    whatsapp: "+34600999000",
    phone: "+34600999000",
    email: "demo.carlos@mallorcaholistica.com",
    link_reserva: null,
    website: null,
    languages: ["es"],
    verified: false,
    status: "draft",
    plan: "presencia",
    subscription_status: null,
    therapies: ["masaje-terapeutico"],
    helpAreas: ["dolor-cronico"],
    sessions: [{ name: "Masaje terapeutico", duration: "60 min", price_cents: 5500, position: 1 }],
  },
  {
    slug: "demo-andreu-bosch",
    full_name: "Demo - Andreu Bosch",
    headline: "Osteópata y Fisioterapeuta deportivo",
    frase_clave: "Recupera el movimiento natural de tu cuerpo libre de dolor.",
    sobre_mi:
      "Soy Andreu, apasionado de la salud corporal y el movimiento. Trabajo combinando técnicas de osteopatía estructural, visceral y craneosacral con masaje terapéutico profundo para aliviar contracturas, dolores de espalda y recuperar lesiones deportivas en Sóller.",
    formacion:
      "Graduado en Fisioterapia por la UIB\nMáster en Osteopatía Estructural\nEspecialista en Masaje Deportivo",
    experiencia: "7 años de práctica clínica en centros deportivos y consulta privada.",
    especialidad: "Osteopatía",
    subespecialidades: ["Osteopatía estructural", "Masaje deportivo", "Molestias de espalda"],
    modalities: ["presencial"],
    years_experience: 7,
    municipality: "soller",
    city: "Sóller",
    address: "Carrer de Sa Mar 24, Sóller",
    lat: 39.7655,
    lng: 2.7161,
    whatsapp: "+34611111222",
    phone: "+34611111222",
    email: "demo.andreu@mallorcaholistica.com",
    link_reserva: "https://calendly.com/demo-mallorca-holistica/andreu",
    website: "https://mallorcaholistica.com",
    languages: ["es", "ca", "en"],
    verified: true,
    status: "published",
    plan: "profesional",
    subscription_status: "active",
    is_founder: false,
    therapies: ["osteopatia", "masaje-terapeutico"],
    helpAreas: ["dolor-cronico", "estres"],
    sessions: [
      { name: "Sesión de Osteopatía", duration: "60 min", price_cents: 7000, position: 1 },
      {
        name: "Masaje Terapéutico / Deportivo",
        duration: "45 min",
        price_cents: 5500,
        position: 2,
      },
    ],
  },
  {
    slug: "demo-clara-sastre",
    full_name: "Demo - Clara Sastre",
    headline: "Naturópata y Acupuntora especialista en salud femenina",
    frase_clave: "Equilibra tus hormonas y recupera tu vitalidad de forma natural.",
    sobre_mi:
      "Acompaño a mujeres en procesos de desajustes hormonales, fatiga, estrés e insomnio, utilizando la acupuntura y la naturopatía como herramientas integrales para restaurar el ritmo natural del organismo.",
    formacion:
      "Diplomada en Medicina Tradicional China\nTítulo Superior en Naturopatía y Nutrición Celular\nEspecialización en Ginecología Natural",
    experiencia: "9 años guiando consultas de salud integrativa.",
    especialidad: "Acupuntura",
    subespecialidades: ["Acupuntura ginecológica", "Fitoterapia y nutrición", "Insomnio"],
    modalities: ["presencial", "online"],
    years_experience: 9,
    municipality: "inca",
    city: "Inca",
    address: "Carrer de Mallorca 45, Inca",
    lat: 39.7222,
    lng: 2.9125,
    whatsapp: "+34622222333",
    phone: "+34622222333",
    email: "demo.clara@mallorcaholistica.com",
    link_reserva: "https://calendly.com/demo-mallorca-holistica/clara",
    website: "https://mallorcaholistica.com",
    languages: ["es", "ca"],
    verified: true,
    status: "published",
    plan: "profesional",
    subscription_status: "active",
    is_founder: true,
    therapies: ["acupuntura", "naturopatia"],
    helpAreas: ["fatiga", "insomnio", "estres"],
    sessions: [
      {
        name: "Primera consulta con acupuntura",
        duration: "90 min",
        price_cents: 8000,
        position: 1,
      },
      { name: "Sesión de seguimiento", duration: "60 min", price_cents: 6000, position: 2 },
    ],
  },
  {
    slug: "demo-centro-equilibrio",
    full_name: "Demo - Centro de Bienestar Equilibrio",
    headline: "Centro de Yoga, Meditación y Terapias Integrativas",
    frase_clave: "Un oasis de paz y autoconocimiento en el corazón de la Tramuntana.",
    sobre_mi:
      "Somos un espacio dedicado al bienestar integral. Ofrecemos clases diarias de Yoga Terapéutico, talleres de Meditación y Mindfulness, así como sesiones individuales de Terapia Emocional y acompañamiento holístico.",
    formacion: "Equipo multidisciplinar de terapeutas certificados y profesores senior.",
    experiencia: "Abiertos desde 2018 facilitando retiros, clases y consultas.",
    especialidad: "Yoga terapéutico",
    subespecialidades: [
      "Yoga grupal e individual",
      "Clases de meditación",
      "Acompañamiento integrativo",
    ],
    modalities: ["presencial"],
    years_experience: 8,
    municipality: "soller",
    city: "Sóller",
    address: "Gran Via 12, Sóller",
    lat: 39.767,
    lng: 2.7155,
    whatsapp: "+34633333444",
    phone: "+34633333444",
    email: "demo.equilibrio@mallorcaholistica.com",
    link_reserva: "https://calendly.com/demo-mallorca-holistica/equilibrio",
    website: "https://mallorcaholistica.com",
    languages: ["es", "en", "de"],
    verified: true,
    status: "published",
    plan: "centros-organizadores",
    subscription_status: "active",
    is_founder: true,
    therapies: ["yoga-terapeutico", "meditacion", "terapia-emocional"],
    helpAreas: ["ansiedad", "estres", "equilibrio-emocional"],
    sessions: [
      { name: "Clase de Yoga Individual", duration: "60 min", price_cents: 6500, position: 1 },
      {
        name: "Bono de 4 clases de yoga grupal",
        duration: "Mensual",
        price_cents: 5000,
        position: 2,
      },
      {
        name: "Sesión Terapia de Pareja / Familiar",
        duration: "75 min",
        price_cents: 9000,
        position: 3,
      },
    ],
  },
  {
    slug: "demo-isabel-oliver",
    full_name: "Demo - Isabel Oliver",
    headline: "Terapeuta de Reiki y Acompañamiento Holístico",
    frase_clave: "Libera bloqueos energéticos y encuentra tu centro.",
    sobre_mi:
      "Ofrezco sesiones de Reiki y terapia emocional en un entorno tranquilo en Marratxí. Mi enfoque combina la canalización de energía con herramientas de escucha consciente para apoyarte en periodos de estrés o cambios de vida.",
    formacion: "Federada en Reiki Usui (Nivel Maestría)\nTaller de Psicología Gestalt aplicada",
    experiencia: "5 años facilitando sesiones individuales de equilibrio energético.",
    especialidad: "Reiki",
    subespecialidades: ["Reiki Usui", "Gestión emocional", "Liberación del estrés"],
    modalities: ["presencial", "online"],
    years_experience: 5,
    municipality: "marratxi",
    city: "Marratxí",
    address: "Carrer de n'Alber 5, Marratxí",
    lat: 39.6225,
    lng: 2.7268,
    whatsapp: "+34644444555",
    phone: "+34644444555",
    email: "demo.isabel@mallorcaholistica.com",
    link_reserva: null,
    website: null,
    languages: ["es", "ca"],
    verified: true,
    status: "published",
    plan: "presencia",
    subscription_status: null,
    is_founder: false,
    show_whatsapp_public: true,
    therapies: ["reiki", "terapia-emocional"],
    helpAreas: ["equilibrio-emocional", "ansiedad", "estres"],
    sessions: [
      {
        name: "Sesión de Reiki y Armonización",
        duration: "60 min",
        price_cents: 5000,
        position: 1,
      },
    ],
  },
  {
    slug: "demo-mateu-coll",
    full_name: "Demo - Mateu Coll",
    headline: "Profesor de Yoga y Quiromasajista",
    frase_clave: "Salud para tu espalda y calma para tu mente.",
    sobre_mi:
      "Combino la práctica del Yoga Terapéutico para tonificar y flexibilizar el cuerpo con técnicas de quiromasaje para aliviar contracturas y tensiones acumuladas en la zona cervical y lumbar.",
    formacion:
      "Profesor de Hatha Yoga (Yoga Alliance RYT-500)\nQuiromasajista Profesional Certificado",
    experiencia: "6 años impartiendo clases individuales y realizando terapias de masaje.",
    especialidad: "Yoga terapéutico",
    subespecialidades: ["Yoga para la espalda", "Quiromasaje terapéutico", "Tensión muscular"],
    modalities: ["presencial", "domicilio"],
    years_experience: 6,
    municipality: "manacor",
    city: "Manacor",
    address: "Avinguda del Parc 8, Manacor",
    lat: 39.5692,
    lng: 3.2088,
    whatsapp: "+34655555666",
    phone: "+34655555666",
    email: "demo.mateu@mallorcaholistica.com",
    link_reserva: "https://calendly.com/demo-mallorca-holistica/mateu",
    website: "https://mallorcaholistica.com",
    languages: ["es", "ca", "en"],
    verified: true,
    status: "published",
    plan: "profesional",
    subscription_status: "active",
    is_founder: false,
    therapies: ["yoga-terapeutico", "masaje-terapeutico"],
    helpAreas: ["dolor-cronico", "insomnio"],
    sessions: [
      {
        name: "Clase privada de Yoga en Manacor",
        duration: "60 min",
        price_cents: 4500,
        position: 1,
      },
      {
        name: "Masaje Descontracturante / Relajante",
        duration: "60 min",
        price_cents: 6000,
        position: 2,
      },
    ],
  },
];

const searchQueries = [
  { query: "[DEMO] Tengo ansiedad y me cuesta dormir", areas: ["ansiedad", "insomnio"] },
  { query: "[DEMO] Me duele la espalda desde hace meses", areas: ["dolor-cronico"] },
  { query: "[DEMO] Estoy agotada y sin energia", areas: ["fatiga", "estres"] },
  { query: "[DEMO] Estoy pasando por un duelo", areas: ["duelo", "equilibrio-emocional"] },
  { query: "[DEMO] Necesito parar un poco", areas: ["estres", "ansiedad"] },
];

await main();

async function main() {
  console.log("Seeding Mallorca Holistica demo data...");

  const adminUser = await upsertDemoAdmin();
  const refs = await upsertReferenceData();
  await cleanupDemoData();
  const insertedTherapists = await upsertTherapists(refs);
  await seedAnalytics(insertedTherapists);

  console.log("");
  console.log("Demo data ready.");
  console.log(`Admin email: ${demoAdminEmail}`);
  console.log(`Admin password: ${demoAdminPassword}`);
  console.log("Admin dashboard: /dashboard/admin");
  console.log(`Admin user id: ${adminUser.id}`);
  console.log(`Therapists seeded: ${insertedTherapists.length}`);
}

async function upsertDemoAdmin() {
  const existingUser = await findAuthUserByEmail(demoAdminEmail);
  let user = existingUser;

  if (user) {
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      password: demoAdminPassword,
      email_confirm: true,
      user_metadata: { display_name: "Demo Admin Mallorca Holistica" },
    });
    if (error) throw error;
    user = data.user;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: demoAdminEmail,
      password: demoAdminPassword,
      email_confirm: true,
      user_metadata: { display_name: "Demo Admin Mallorca Holistica" },
    });
    if (error) throw error;
    user = data.user;
  }

  await upsert("profiles", {
    user_id: user.id,
    display_name: "Demo Admin Mallorca Holistica",
    locale: "es",
  });

  await upsert("user_roles", { user_id: user.id, role: "admin" }, "user_id,role");
  return user;
}

async function upsertReferenceData() {
  await supabase
    .from("municipalities")
    .upsert(reference.municipalities, { onConflict: "slug" })
    .throwOnError();
  await supabase
    .from("therapies")
    .upsert(reference.therapies, { onConflict: "slug" })
    .throwOnError();
  await supabase
    .from("help_areas")
    .upsert(reference.helpAreas, { onConflict: "slug" })
    .throwOnError();

  const [{ data: plans }, { data: municipalities }, { data: therapies }, { data: helpAreas }] =
    await Promise.all([
      supabase.from("plans").select("id,slug").throwOnError(),
      supabase.from("municipalities").select("id,slug").throwOnError(),
      supabase.from("therapies").select("id,slug").throwOnError(),
      supabase.from("help_areas").select("id,slug").throwOnError(),
    ]);

  return {
    plans: bySlug(plans),
    municipalities: bySlug(municipalities),
    therapies: bySlug(therapies),
    helpAreas: bySlug(helpAreas),
  };
}

async function cleanupDemoData() {
  await supabase
    .from("analytics_events")
    .delete()
    .eq("metadata->>demo_seed", "true")
    .throwOnError();
  await supabase.from("ai_search_queries").delete().like("query", "[DEMO]%").throwOnError();
}

async function upsertTherapists(refs) {
  const rows = therapists.map((therapist) => {
    const { municipality, plan, therapies, helpAreas, sessions, ...row } = therapist;
    return {
      ...row,
      is_founder: therapist.is_founder ?? false,
      show_whatsapp_public: therapist.show_whatsapp_public ?? false,
      municipality_id: refs.municipalities[municipality]?.id ?? null,
      plan_id: refs.plans[plan]?.id ?? null,
      updated_at: new Date().toISOString(),
    };
  });

  const { data, error } = await supabase
    .from("therapists")
    .upsert(rows, { onConflict: "slug" })
    .select("id,slug,full_name")
    .throwOnError();
  if (error) throw error;

  const therapistBySlug = Object.fromEntries(data.map((therapist) => [therapist.slug, therapist]));

  for (const therapist of therapists) {
    const therapistId = therapistBySlug[therapist.slug]?.id;
    if (!therapistId) continue;

    await supabase
      .from("therapist_therapies")
      .delete()
      .eq("therapist_id", therapistId)
      .throwOnError();
    await supabase
      .from("therapist_help_areas")
      .delete()
      .eq("therapist_id", therapistId)
      .throwOnError();
    await supabase
      .from("therapist_sessions")
      .delete()
      .eq("therapist_id", therapistId)
      .throwOnError();

    const therapyRows = therapist.therapies
      .map((slug) => refs.therapies[slug]?.id)
      .filter(Boolean)
      .map((therapy_id) => ({ therapist_id: therapistId, therapy_id }));
    const helpAreaRows = therapist.helpAreas
      .map((slug) => refs.helpAreas[slug]?.id)
      .filter(Boolean)
      .map((help_area_id) => ({ therapist_id: therapistId, help_area_id }));
    const sessionRows = therapist.sessions.map((session) => ({
      ...session,
      therapist_id: therapistId,
    }));

    if (therapyRows.length) {
      await supabase.from("therapist_therapies").insert(therapyRows).throwOnError();
    }
    if (helpAreaRows.length) {
      await supabase.from("therapist_help_areas").insert(helpAreaRows).throwOnError();
    }
    if (sessionRows.length) {
      await supabase.from("therapist_sessions").insert(sessionRows).throwOnError();
    }
  }

  return data;
}

async function seedAnalytics(insertedTherapists) {
  const publishedTherapists = insertedTherapists.filter((therapist) => {
    const source = therapists.find((item) => item.slug === therapist.slug);
    return source?.status === "published";
  });

  const aiRows = searchQueries.map((item, index) => ({
    query: item.query,
    matched_help_areas: item.areas,
    suggested_therapies: [],
    ai_intro: "Demo: hemos encontrado profesionales que pueden acompanarte.",
    created_at: daysAgo(index + 1),
  }));

  const { data: queryRows } = await supabase
    .from("ai_search_queries")
    .insert(aiRows)
    .select("id")
    .throwOnError();

  const events = [];
  for (let i = 0; i < 90; i += 1) {
    const therapist = publishedTherapists[i % publishedTherapists.length];
    const searchQuery = queryRows?.[i % queryRows.length];
    events.push({
      event_type: "professional_profile_view",
      visitor_id: `demo-visitor-${i % 18}`,
      therapist_id: therapist.id,
      search_query_id: searchQuery?.id ?? null,
      metadata: { demo_seed: true },
      created_at: hoursAgo(i * 3),
    });
  }

  for (let i = 0; i < 48; i += 1) {
    const therapist = publishedTherapists[i % publishedTherapists.length];
    const searchQuery = queryRows?.[i % queryRows.length];
    events.push({
      event_type: "search_result_impression",
      visitor_id: `demo-visitor-${i % 18}`,
      therapist_id: therapist.id,
      search_query_id: searchQuery?.id ?? null,
      metadata: { demo_seed: true },
      created_at: hoursAgo(i * 5),
    });
  }

  for (let i = 0; i < 24; i += 1) {
    const therapist = publishedTherapists[i % Math.min(5, publishedTherapists.length)];
    events.push({
      event_type: "professional_contact_click",
      visitor_id: `demo-visitor-${i % 14}`,
      therapist_id: therapist.id,
      metadata: { demo_seed: true, channel: i % 2 === 0 ? "whatsapp" : "booking" },
      created_at: hoursAgo(i * 7),
    });
  }

  for (let i = 0; i < queryRows.length; i += 1) {
    events.push({
      event_type: "conversational_search",
      visitor_id: `demo-visitor-${i}`,
      search_query_id: queryRows[i].id,
      metadata: { demo_seed: true, query: searchQueries[i].query },
      created_at: daysAgo(i),
    });
  }

  if (events.length) {
    await supabase.from("analytics_events").insert(events).throwOnError();
  }
}

async function findAuthUserByEmail(email) {
  let page = 1;
  while (page < 20) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    const user = data.users.find((item) => item.email?.toLowerCase() === email.toLowerCase());
    if (user) return user;
    if (data.users.length < 100) return null;
    page += 1;
  }
  return null;
}

async function upsert(table, row, onConflict = "user_id") {
  const { error } = await supabase.from(table).upsert(row, { onConflict });
  if (error) throw error;
}

function bySlug(rows = []) {
  return Object.fromEntries(rows.map((row) => [row.slug, row]));
}

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function hoursAgo(hours) {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
}

function loadEnv(path) {
  if (!existsSync(path)) return;
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
