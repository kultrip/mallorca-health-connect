const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const envFile = fs.readFileSync(".env", "utf8");
const env = {};
envFile.split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : "";
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

console.log("URL:", supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  try {
    const { data, error } = await supabase
      .from("therapists")
      .select(
        "id, slug, full_name, headline, photo_url, especialidad, modalities, verified, city, address, lat, lng, subscription_status, municipalities(name,slug,lat,lng), plans!therapists_plan_id_fkey(slug)",
      )
      .eq("status", "published")
      .limit(5);

    if (error) {
      console.error("Query Error:", error);
    } else {
      console.log("Query Success! Results:", data);
    }
  } catch (e) {
    console.error("Catch Exception:", e);
  }
}

test();
