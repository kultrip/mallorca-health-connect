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
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Error status:", error.status, "Message:", error.message);
    } else {
      console.log(`Successfully fetched ${data.length} activities:`);
      for (const a of data) {
        console.log(
          `- ID: ${a.id}\n  Title: "${a.title}"\n  Slug: "${a.slug}"\n  Status: "${a.status}"\n  Starts At: ${a.starts_at}\n  Therapist ID: ${a.therapist_id}\n  Center ID: ${a.center_id}\n  Created At: ${a.created_at}\n`
        );
      }
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

run();
