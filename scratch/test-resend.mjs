import { readFileSync, existsSync } from "node:fs";
import { createServer } from "node:http";

const envPaths = [".env", ".env.local", ".dev.vars"];
console.log("Checking environment files...");
for (const path of envPaths) {
  if (existsSync(path)) {
    console.log(`✅ File found: ${path}`);
    try {
      const content = readFileSync(path, "utf-8");
      const keys = [];
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const key = trimmed.split("=")[0].trim();
          keys.push(key);
        }
      }
      console.log(`   Keys in ${path}:`, keys);
    } catch (err) {
      console.error(`   Error reading ${path}:`, err.message);
    }
  } else {
    console.log(`❌ File not found: ${path}`);
  }
}

// Check process.env variables as well
console.log("\nChecking process.env for RESEND variables:");
console.log("RESEND_API_KEY defined:", !!process.env.RESEND_API_KEY);
console.log("RESEND_FROM_EMAIL:", process.env.RESEND_FROM_EMAIL);
console.log("ADMIN_EMAIL:", process.env.ADMIN_EMAIL);
