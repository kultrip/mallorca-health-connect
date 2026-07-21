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

async function testTherapistsQuery() {
  console.log("Testing exact ProfessionalsPage query...");
  try {
    const { data, error } = await supabase
      .from("therapists")
      .select(
        "id, slug, full_name, headline, frase_clave, photo_url, especialidad, modalities, verified, city, address, lat, lng, subscription_status, municipalities(name,slug,lat,lng), plans!therapists_plan_id_fkey(slug)"
      )
      .eq("status", "published")
      .limit(200);

    if (error) {
      console.error("Exact query failed with Supabase Error:", error);
    } else {
      console.log("Success! Query returned", data?.length, "records");
      console.log("Sample records:", JSON.stringify(data.slice(0, 2), null, 2));
    }
  } catch (e) {
    console.error("Catch Error:", e);
  }
}

testTherapistsQuery();
