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
const supabaseSecret = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseSecret);

async function run() {
  const { data: therapists, error } = await supabase
    .from("therapists")
    .select("id, full_name, slug, photo_url");

  if (error) {
    console.error(error);
    return;
  }

  console.log("--- All Therapists ---");
  for (const t of therapists) {
    console.log(`- Name: ${t.full_name}, Slug: ${t.slug}, Photo: ${t.photo_url}`);
  }
}

run();
