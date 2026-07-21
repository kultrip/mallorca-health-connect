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

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env file.");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function createManualUser() {
  const email = "charles-test@mallorcaholistica.com";
  const password = "MallorcaTest2026!";

  console.log(`Connecting to: ${supabaseUrl}`);
  console.log(`Creating manual confirmed user: ${email}...`);

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true, // Automatically confirm email so it is instantly active!
  });

  if (error) {
    console.error("❌ Error creating user:", error.message);
    process.exit(1);
  }

  console.log(`\n✅ User successfully created in new database!`);
  console.log(`ID: ${data.user.id}`);
  console.log(`Email: ${data.user.email}`);
  console.log(`Password: ${password}`);
  console.log(`Status: Confirmed and Active`);
}

createManualUser();
