import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkRoles() {
  const { data, error } = await supabaseAdmin.from("user_roles").select("*").limit(20);

  if (error) {
    console.error("Error fetching user roles:", error);
    process.exit(1);
  }

  console.log("Current user roles in DB:", data);
}

checkRoles();
