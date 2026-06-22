import { readFileSync } from "node:fs";
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

console.log("Token prefix:", token ? token.substring(0, 15) : "undefined");
console.log("Project ref:", ref);

if (!token || !ref) {
  console.error("Missing SUPABASE_ACCESS_TOKEN or VITE_SUPABASE_PROJECT_ID");
  process.exit(1);
}

async function run() {
  const url = `https://api.supabase.com/v1/projects/${ref}/database/query`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        query: "SELECT version();"
      })
    });

    console.log("Status:", res.status);
    const body = await res.text();
    console.log("Response:", body);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

run();
