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

async function listFiles() {
  console.log("Listing files in 'therapist-photos' bucket...");
  const { data: folders, error: err1 } = await supabase.storage.from("therapist-photos").list();
  if (err1) {
    console.error("Error listing root:", err1);
    return;
  }
  console.log("Root files/folders:", folders);

  for (const item of folders || []) {
    if (!item.id) {
      // It's a folder, list its contents
      console.log(`\nListing contents of folder: ${item.name}`);
      const { data: files, error: err2 } = await supabase.storage
        .from("therapist-photos")
        .list(item.name);
      if (err2) {
        console.error(`Error listing folder ${item.name}:`, err2);
      } else {
        console.log(`Files in ${item.name}:`, files);
      }
    }
  }
}

listFiles();
