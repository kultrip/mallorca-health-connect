import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing Supabase credentials in process.env. Make sure to run with node --env-file=.env",
  );
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const email = "mallorcaholistica11@gmail.com";
const password = "YoSoyAmor11.";

async function run() {
  console.log(`Starting admin provisioning for: ${email}`);

  // 1. Check if user already exists
  const {
    data: { users },
    error: listError,
  } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error("Error listing users:", listError.message);
    process.exit(1);
  }

  let user = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  let userId;

  if (user) {
    console.log(`User already exists with ID: ${user.id}. Updating password and metadata...`);
    userId = user.id;
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        password: password,
        email_confirm: true,
        user_metadata: { ...user.user_metadata, role: "admin" },
        app_metadata: { ...user.app_metadata, user_role: "admin" },
      },
    );

    if (updateError) {
      console.error("Error updating user password/metadata:", updateError.message);
      process.exit(1);
    }
    console.log("User updated successfully!");
  } else {
    console.log("User does not exist. Creating new user...");
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "admin" },
      app_metadata: { user_role: "admin" },
    });

    if (createError) {
      console.error("Error creating user:", createError.message);
      process.exit(1);
    }
    userId = newUser.user.id;
    console.log(`New user created with ID: ${userId}`);
  }

  // 2. Ensure profile exists
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (profileError) {
    console.error("Error checking profile:", profileError.message);
  }

  if (!profile) {
    console.log("Creating public profile...");
    const { error: insertProfileError } = await supabaseAdmin.from("profiles").insert({
      user_id: userId,
      display_name: "Mallorca Holística Admin",
    });

    if (insertProfileError) {
      console.error("Error creating profile:", insertProfileError.message);
    } else {
      console.log("Profile created successfully.");
    }
  }

  // 3. Upsert user role inside user_roles
  console.log("Adding admin role in user_roles...");
  const { error: roleError } = await supabaseAdmin.from("user_roles").upsert(
    {
      user_id: userId,
      role: "admin",
    },
    { onConflict: "user_id, role" },
  );

  if (roleError) {
    console.error("Error setting user role to admin:", roleError.message);
    process.exit(1);
  }

  console.log("Admin role set successfully in user_roles!");
  console.log(
    `\n🎉 Success! Admin account is fully set up:\nEmail: ${email}\nPassword: ${password}\n`,
  );
}

run().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
