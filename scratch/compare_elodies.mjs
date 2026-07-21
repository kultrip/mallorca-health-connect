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

async function inspect() {
  const ids = [
    "2174ce35-7f9f-4068-896c-e4948bd0f4a2", // jose-silva
    "c33a3f5d-ae34-44a2-a55c-dcee5512697e", // elodie-lagarrigue (draft)
  ];

  for (const id of ids) {
    console.log(`\n=================== Inspecting Therapist ID: ${id} ===================`);
    const { data: t, error: err1 } = await supabase
      .from("therapists")
      .select("*")
      .eq("id", id)
      .single();

    if (err1) {
      console.error("Error fetching:", err1);
      continue;
    }

    console.log("Full Name:", t.full_name);
    console.log("Slug     :", t.slug);
    console.log("Email    :", t.email);
    console.log("Status   :", t.status);
    console.log("Photo URL:", t.photo_url);
    console.log("Headline :", t.headline);
    console.log("Verified :", t.verified);
    console.log("Sobre Mi :", t.sobre_mi ? t.sobre_mi.substring(0, 100) + "..." : "null");

    // Check activities
    const { data: acts, error: err2 } = await supabase
      .from("activities")
      .select("id, title, slug, status")
      .eq("therapist_id", id);

    if (err2) {
      console.error("Error fetching activities:", err2);
    } else {
      console.log(`Activities (${acts.length}):`, acts);
    }

    // Check therapist_therapies
    const { data: therapies, error: err3 } = await supabase
      .from("therapist_therapies")
      .select("therapy_id")
      .eq("therapist_id", id);
    console.log(`Therapies count: ${therapies?.length ?? 0}`);
  }
}

inspect();
