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

async function checkUsers() {
  console.log(`Connecting to database: ${supabaseUrl}`);

  const {
    data: { users },
    error,
  } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    console.error("❌ Error fetching users:", error);
    process.exit(1);
  }

  console.log(`\n✅ Connected successfully!`);
  console.log(`Total users in database: ${users.length}`);

  if (users.length > 0) {
    console.log("\nRegistered Users:");
    users.forEach((user, index) => {
      console.log(
        `${index + 1}. Email: ${user.email} | ID: ${user.id} | Created At: ${user.created_at}`,
      );
    });
  } else {
    console.log("\nNo users found in this new database yet.");
  }
}

checkUsers();
