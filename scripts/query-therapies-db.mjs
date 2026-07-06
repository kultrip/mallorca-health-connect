import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const envPath = "/Users/charles.santana/Kultrip/gemini-dev/mallorca-health-connect/.env";
const envContent = readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  if (line.includes("=")) {
    const [key, ...rest] = line.split("=");
    let val = rest.join("=").trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    env[key.trim()] = val;
  }
}

const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY in env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  try {
    const { data, error } = await supabase
      .from("therapies")
      .select("id, slug, name, category, short_description, description, detail_sections, benefits, session_description");
    
    if (error) {
      console.log("Error status:", error.status, "Message:", error.message);
    } else {
      console.log(`Successfully fetched ${data.length} therapies:`);
      for (const t of data) {
        const hasDetails = (t.detail_sections && t.detail_sections.length > 0) || (t.benefits && t.benefits.length > 0) || t.session_description;
        console.log(`- Slug: ${t.slug}, Name: ${t.name}, Description: ${t.description ? t.description.slice(0, 30) + '...' : 'null'}, HasDetails: ${!!hasDetails}`);
      }
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

run();
