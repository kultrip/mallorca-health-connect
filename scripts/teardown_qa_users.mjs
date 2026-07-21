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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function main() {
  console.log("=================================================");
  console.log("🧹 MALLORCA HOLÍSTICA — TEARDOWN QA TEST USERS");
  console.log("=================================================");

  const {
    data: { users },
    error: listErr,
  } = await supabase.auth.admin.listUsers();
  if (listErr) throw listErr;

  const testUsers = users.filter((u) => u.email && u.email.endsWith("@test.mh"));
  console.log(`Found ${testUsers.length} test @test.mh user accounts to delete.`);

  for (const user of testUsers) {
    const { error: delErr } = await supabase.auth.admin.deleteUser(user.id);
    if (delErr) {
      console.warn(`⚠️ Failed to delete user ${user.email}:`, delErr.message);
    } else {
      console.log(`Successfully deleted user: ${user.email}`);
    }
  }

  console.log("\n=================================================");
  console.log("🧹 TEARDOWN COMPLETED SUCCESSFULLY!");
  console.log("=================================================");
}

main().catch((err) => {
  console.error("❌ Fatal error in teardown:", err);
  process.exit(1);
});
