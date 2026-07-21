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

async function fix() {
  const draftUserId = "77707d91-dcdd-47dc-95d3-d4cb281c27d3";
  const realTherapistId = "2174ce35-7f9f-4068-896c-e4948bd0f4a2";

  console.log("1. Deleting duplicate draft Auth user and cascading therapist record...");
  const { error: deleteUserErr } = await supabase.auth.admin.deleteUser(draftUserId);
  if (deleteUserErr) {
    console.error("Error deleting draft auth user:", deleteUserErr.message);
  } else {
    console.log("Draft Auth user and therapist record deleted successfully.");
  }

  console.log("\n2. Updating real therapist profile with the correct slug and photo/logo URLs...");
  const photoUrl =
    "https://osqicmdiacxcmvsjuksk.supabase.co/storage/v1/object/public/therapist-photos/527cbf39-07da-4f65-b48b-a6982d6c1620/4ce4cbcc-2795-4232-b809-9b0d5126074f.png";
  const logoUrl =
    "https://osqicmdiacxcmvsjuksk.supabase.co/storage/v1/object/public/therapist-photos/527cbf39-07da-4f65-b48b-a6982d6c1620/0dd75d8a-4329-4469-ad61-e4e054174149.png";

  const { data: updated, error: updateErr } = await supabase
    .from("therapists")
    .update({
      slug: "elodie-lagarrigue",
      photo_url: photoUrl,
      logo_url: logoUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", realTherapistId)
    .select();

  if (updateErr) {
    console.error("Error updating therapist profile:", updateErr.message);
  } else {
    console.log("Successfully updated therapist profile! New details:");
    console.log(updated);
  }
}

fix();
