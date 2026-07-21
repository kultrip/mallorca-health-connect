import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// Load Environment variables
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
const supabaseServiceKey = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function run() {
  console.log("--- Querying Therapists with name like Elodie or slug jose-silva ---");
  const { data: tByName, error: err1 } = await supabaseAdmin
    .from("therapists")
    .select("id, full_name, slug, email, photo_url, status, user_id")
    .ilike("full_name", "%elodie%");

  if (err1) {
    console.error("Error fetching Elodie:", err1);
  } else {
    console.log("By Name (Elodie):", tByName);
  }

  const { data: tBySlug, error: err2 } = await supabaseAdmin
    .from("therapists")
    .select("id, full_name, slug, email, photo_url, status, user_id")
    .eq("slug", "jose-silva");

  if (err2) {
    console.error("Error fetching slug jose-silva:", err2);
  } else {
    console.log("By Slug (jose-silva):", tBySlug);
  }
}

run();
