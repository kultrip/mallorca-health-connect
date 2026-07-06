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
      .from("therapist_therapies")
      .select("therapy_id, therapies(name, slug), therapists!inner(status)")
      .eq("therapists.status", "published");
    
    if (error) {
      console.log("Error status:", error.status, "Message:", error.message);
    } else {
      console.log(`Successfully fetched ${data.length} active professional associations:`);
      const counts = {};
      for (const row of data) {
        if (row.therapies) {
          const slug = row.therapies.slug;
          const name = row.therapies.name;
          counts[slug] = counts[slug] || { name, count: 0 };
          counts[slug].count++;
        }
      }
      
      const sorted = Object.entries(counts).sort((a, b) => b[1].count - a[1].count);
      for (const [slug, info] of sorted) {
        console.log(`- Slug: ${slug}, Name: ${info.name}, Active Professionals: ${info.count}`);
      }
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

run();
