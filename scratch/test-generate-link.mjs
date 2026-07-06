import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Supabase URL:", SUPABASE_URL);
console.log("Service Role Key is defined:", !!SUPABASE_SERVICE_ROLE_KEY);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing environment variables!");
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    storage: undefined,
    persistSession: false,
    autoRefreshToken: false,
  }
});

const email = "kultripofficial2@gmail.com";
const password = "TemporaryPassword123!";
const name = "KultripOfficial";
const selectedPlan = "presencia";
const isFounder = false;
const redirectToUrl = `http://localhost:3000/onboarding?plan=${selectedPlan}`;

console.log(`\nAttempting generateLink for signup with email: ${email}...`);

try {
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: {
      data: {
        display_name: name,
        selected_plan: selectedPlan,
        is_founder: isFounder,
      },
      redirectTo: redirectToUrl,
    },
  });

  if (error) {
    console.error("Error from Supabase generateLink:", error);
  } else {
    console.log("SUCCESS! Link generated successfully.");
    console.log("Generated Link Properties:", data.properties);
    console.log("User details:", data.user);
  }
} catch (err) {
  console.error("Unexpected error occurred:", err);
}
