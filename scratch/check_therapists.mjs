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

async function checkTherapist() {
  const email = "hello@predsea.com";
  
  // 1. Get user details from auth.users
  const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
  if (usersError) {
    console.error("Error listing users:", usersError);
    return;
  }
  
  const user = users.find(u => u.email === email);
  if (!user) {
    console.log(`❌ User with email ${email} not found in auth.users.`);
    return;
  }
  
  console.log(`✅ Found Auth User:`);
  console.log(`   ID: ${user.id}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Created At: ${user.created_at}`);
  console.log(`   User Metadata:`, user.user_metadata);
  
  // 2. Query public.therapists
  const { data: therapists, error: therapistError } = await supabaseAdmin
    .from("therapists")
    .select("*")
    .eq("user_id", user.id);
    
  if (therapistError) {
    console.log(`\n❌ Error querying therapists table for user_id ${user.id}:`, therapistError.message);
  } else if (!therapists || therapists.length === 0) {
    console.log(`\n❌ No record found in public.therapists table for user_id ${user.id}`);
  } else {
    console.log(`\n✅ Found public.therapists record(s):`);
    console.log(therapists);
  }
  
  // 3. Query public.centers
  const { data: centers, error: centersError } = await supabaseAdmin
    .from("centers")
    .select("*")
    .eq("owner_user_id", user.id);
    
  if (centersError) {
    console.log(`\n❌ Error querying centers table:`, centersError.message);
  } else {
    console.log(`\n✅ Found ${centers.length} center records:`, centers);
  }
}

checkTherapist();
