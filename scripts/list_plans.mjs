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
  }
});

async function listPlans() {
  const { data: plans, error } = await supabaseAdmin.from("plans").select("*");
  if (error) {
    console.error("❌ Error fetching plans:", error);
    process.exit(1);
  }
  console.log("Plans in database:");
  plans.forEach(p => {
    console.log(`- Slug: ${p.slug} | Name: ${p.name} | ID: ${p.id} | Price: ${p.price_monthly_cents} | Founder Price: ${p.founder_price_monthly_cents}`);
  });
}

listPlans();
