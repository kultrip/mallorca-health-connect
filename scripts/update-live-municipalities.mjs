import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
loadEnv(resolve(root, ".env"));
loadEnv(resolve(root, ".env.local"));

const supabaseUrl = process.env.SECRET_SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SECRET_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase service credentials.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const municipalities = [
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
  { slug: "sant-llorenc-des-cardassar", name: "Sant Llorenç des Cardassar", lat: 39.6111, lng: 3.2842 },
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
];

async function main() {
  console.log("Updating live municipalities with coordinates in Supabase...");

  const { data, error } = await supabase
    .from("municipalities")
    .upsert(municipalities, { onConflict: "slug" });

  if (error) {
    console.error("Error updating municipalities:", error);
    process.exit(1);
  }

  console.log("Successfully updated all municipalities in the live database!");
}

main().catch(console.error);

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
