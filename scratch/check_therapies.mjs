import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

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
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY || env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTherapies() {
  console.log("Checking all therapies in the database...");
  try {
    const { data, error } = await supabase
      .from("therapies")
      .select("id, slug, name, short_description");

    if (error) {
      console.error("Supabase Error:", error);
    } else {
      console.log("Total therapies in database:", data?.length);
      const withContent = data.filter(t => t.short_description && t.short_description !== "Pronto incorporaremos más información sobre esta terapia.");
      console.log("Therapies with custom content:", withContent.length);
      console.log("Therapies with custom content list:");
      withContent.forEach(t => console.log(`- ${t.name} (${t.slug})`));
    }
  } catch (e) {
    console.error("Catch Error:", e);
  }
}

checkTherapies();
