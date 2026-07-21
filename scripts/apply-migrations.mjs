import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

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

const token = env.SUPABASE_ACCESS_TOKEN;
const ref = env.VITE_SUPABASE_PROJECT_ID;

if (!token || !ref) {
  console.error("❌ Missing SUPABASE_ACCESS_TOKEN or VITE_SUPABASE_PROJECT_ID in env");
  process.exit(1);
}

const migrationsDir =
  "/Users/charles.santana/Kultrip/gemini-dev/mallorca-health-connect/supabase/migrations";
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort(); // Sorting alphabetically ensures they run in correct chronological order!

console.log(`🚀 Found ${files.length} migrations to apply in chronological order...\n`);

const url = `https://api.supabase.com/v1/projects/${ref}/database/query`;

async function applyMigration(file) {
  const filePath = resolve(migrationsDir, file);
  const sql = readFileSync(filePath, "utf-8");

  console.log(`⚙️  Applying: ${file}...`);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: sql,
      }),
    });

    const status = res.status;
    const bodyText = await res.text();

    if (status === 201 || status === 200) {
      console.log(`✅ Success! status ${status}`);
    } else {
      console.error(`❌ Error status ${status}:`);
      console.error(bodyText);
      process.exit(1);
    }
  } catch (err) {
    console.error(`❌ Unexpected network error for ${file}:`, err);
    process.exit(1);
  }
}

async function run() {
  for (const file of files) {
    await applyMigration(file);
    console.log("----------------------------------------");
  }
  console.log("\n🎉 All migrations applied successfully!");
}

run();
