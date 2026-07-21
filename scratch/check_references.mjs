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

async function checkReferences() {
  const filenames = [
    "0dd75d8a-4329-4469-ad61-e4e054174149.png",
    "3b5e69fc-36a4-4e4a-9fd6-e014cbce8ed4.png",
    "4ce4cbcc-2795-4232-b809-9b0d5126074f.png",
    "7c28ea5b-a229-4bb0-acfb-cbfaa2d5192a.png",
    "8b93ef53-761d-48cb-aae8-20aaf4904940.png",
    "b9b7933a-fd3c-4bda-a686-f95588187c00.png",
    "c76ce68d-5769-4b80-8704-aa4f40985a03.png",
    "cba003db-1f8b-435f-885d-5fec31b25c07.png",
  ];

  console.log("Checking activities image_url...");
  const { data: acts, error: err1 } = await supabase
    .from("activities")
    .select("id, title, image_url");
  if (err1) {
    console.error("Error fetching activities:", err1);
  } else {
    for (const act of acts) {
      if (act.image_url) {
        console.log(`Activity [ID: ${act.id}, Title: ${act.title}] -> Image URL: ${act.image_url}`);
      }
    }
  }

  console.log("\nChecking therapists photo_url / logo_url...");
  const { data: ths, error: err2 } = await supabase
    .from("therapists")
    .select("id, full_name, photo_url, logo_url");
  if (err2) {
    console.error("Error fetching therapists:", err2);
  } else {
    for (const th of ths) {
      if (th.photo_url || th.logo_url) {
        console.log(
          `Therapist [ID: ${th.id}, Name: ${th.full_name}] -> Photo: ${th.photo_url}, Logo: ${th.logo_url}`,
        );
      }
    }
  }
}

checkReferences();
