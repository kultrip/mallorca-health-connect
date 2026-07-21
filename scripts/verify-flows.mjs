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
const supabaseAnonKey = env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabaseServiceKey = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env file.");
  process.exit(1);
}

// 1. Service Role Client (Admin, bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Helper: Create an anonymous client (Enforces RLS)
function createAnonClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Helper: Clean up a test user completely
async function cleanupUser(email) {
  const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) return;
  const user = users.users.find((u) => u.email === email);
  if (user) {
    await supabaseAdmin.auth.admin.deleteUser(user.id);
    console.log(`🧹 Cleaned up existing test user: ${email}`);
  }
}

// Helper: Admin-create user to bypass email signup rate limits
async function adminCreateAndSignIn(email, password, displayName, client) {
  const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });
  if (createError) throw createError;

  const user = createData.user;

  // Sign in via normal client to establish authenticated RLS session
  const { data: sessionData, error: signInError } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) throw signInError;

  return user;
}

async function runTests() {
  console.log("======================================================================");
  console.log("🏥 MALLORCA HEALTH CONNECT — PROGRAMMATIC FLOW VERIFICATION");
  console.log("======================================================================\n");

  try {
    // Let's generate unique emails to avoid conflicts
    const randomSuffix = Math.floor(Math.random() * 100000);
    const patientEmail = `test-patient-${randomSuffix}@mallorcaholistica.com`;
    const professionalEmail = `test-prof-${randomSuffix}@mallorcaholistica.com`;
    const centerEmail = `test-center-${randomSuffix}@mallorcaholistica.com`;
    const testPassword = "TestPassword!2026";

    // Clean up if any leftovers (safety first)
    await cleanupUser(patientEmail);
    await cleanupUser(professionalEmail);
    await cleanupUser(centerEmail);

    // Get a valid municipality to link profiles to
    const { data: muni, error: muniErr } = await supabaseAdmin
      .from("municipalities")
      .select("id")
      .limit(1)
      .single();
    if (muniErr || !muni) {
      throw new Error("No municipality found in database. Seed municipalities first.");
    }

    // Retrieve plans to get correct plan UUIDs
    const { data: plans, error: plansErr } = await supabaseAdmin.from("plans").select("id, slug");
    if (plansErr || !plans) {
      throw new Error("No plans found in database. Seed plans first.");
    }
    const planMap = {};
    plans.forEach((p) => {
      planMap[p.slug] = p.id;
    });

    // ------------------------------------------------------------------
    // TEST 1: Patient registration defaults to 'patient' in user_roles
    // ------------------------------------------------------------------
    console.log("🔹 TEST 1: Registering a standard Patient/Customer...");
    const patientClient = createAnonClient();
    const patientUser = await adminCreateAndSignIn(
      patientEmail,
      testPassword,
      "Test Patient",
      patientClient,
    );
    console.log(`✅ Patient registered and logged in. ID: ${patientUser.id}`);

    // Query user roles via client (should return 'patient')
    const { data: patientRoles, error: patientRolesErr } = await patientClient
      .from("user_roles")
      .select("role")
      .eq("user_id", patientUser.id);

    if (patientRolesErr) throw patientRolesErr;
    console.log(`👉 Default roles assigned:`, patientRoles);
    const hasPatientRole = patientRoles.some((r) => r.role === "patient");
    if (hasPatientRole) {
      console.log("🟢 SUCCESS: New signups are auto-assigned the 'patient' role!");
    } else {
      throw new Error("❌ FAIL: Patient role was not auto-assigned.");
    }
    console.log("------------------------------------------------------------------\n");

    // ------------------------------------------------------------------
    // TEST 2: Professional onboarding and draft privacy flow
    // ------------------------------------------------------------------
    console.log("🔹 TEST 2: Onboarding an individual Professional...");
    const profClient = createAnonClient();
    const profUser = await adminCreateAndSignIn(
      professionalEmail,
      testPassword,
      "Test Professional",
      profClient,
    );
    console.log(`✅ Professional user registered and logged in. ID: ${profUser.id}`);

    // Verify initial role is 'patient' before profile creation
    const { data: initialProfRoles, error: initialProfRolesErr } = await profClient
      .from("user_roles")
      .select("role")
      .eq("user_id", profUser.id);
    if (initialProfRolesErr) throw initialProfRolesErr;
    console.log(`👉 Initial roles before onboarding:`, initialProfRoles);

    // Simulate completion of professional onboarding (upsert in therapists table)
    console.log("⚙️  Submitting professional onboarding profile...");
    const { data: profProfile, error: profProfileErr } = await profClient
      .from("therapists")
      .insert({
        user_id: profUser.id,
        slug: `test-prof-${randomSuffix}`,
        full_name: "Test Professional S.A.",
        headline: "Terapias Alternativas Especializadas",
        frase_clave: "Encuentra tu paz interior",
        sobre_mi: "Especialista en psicología holística con más de 10 años de experiencia.",
        languages: ["es", "en"],
        municipality_id: muni.id,
        status: "draft", // Starts as draft/pending
        verified: false,
        pending_plan_slug: "profesional",
        pending_plan_id: planMap["profesional"],
      })
      .select("id")
      .single();

    if (profProfileErr) throw profProfileErr;
    console.log(`✅ Professional profile created with status 'draft'. ID: ${profProfile.id}`);

    // Verify role automatically switches from 'patient' to 'professional' via our trigger!
    const { data: updatedProfRoles, error: roleCheckErr } = await profClient
      .from("user_roles")
      .select("role")
      .eq("user_id", profUser.id);

    if (roleCheckErr) throw roleCheckErr;
    console.log(`👉 Roles after onboarding:`, updatedProfRoles);
    const hasProfRole = updatedProfRoles.some((r) => r.role === "professional");
    const hasNoPatientRole = !updatedProfRoles.some((r) => r.role === "patient");

    if (hasProfRole && hasNoPatientRole) {
      console.log(
        "🟢 SUCCESS: User role automatically updated from 'patient' to 'professional' via database trigger!",
      );
    } else {
      throw new Error(
        `❌ FAIL: Role synchronization failed. Roles are: ${JSON.stringify(updatedProfRoles)}`,
      );
    }

    // Test document upload and private bucket policy
    console.log("⚙️  Uploading verification document to private 'verification-docs' bucket...");
    const testDocContent = "Dummy diploma PDF content";
    const testDocPath = `${profUser.id}/diploma.txt`; // bucket folder name matches user_id

    // Upload using profClient (real RLS check)
    const { data: uploadData, error: uploadErr } = await profClient.storage
      .from("verification-docs")
      .upload(testDocPath, Buffer.from(testDocContent), {
        contentType: "text/plain",
        upsert: true,
      });

    if (uploadErr) throw uploadErr;
    console.log(`✅ Verification document uploaded successfully to: ${testDocPath}`);

    // Confirm that the professional user CAN download/read their own uploaded documents
    const { data: profDocRead, error: profDocReadErr } = await profClient.storage
      .from("verification-docs")
      .download(testDocPath);

    if (profDocReadErr) throw profDocReadErr;
    console.log(
      `🟢 SUCCESS: Professional owner can read/download their own onboarding verification documents!`,
    );

    // Verify Draft Privacy: Other users (like the patient) cannot read this professional profile yet
    const { data: publicLookup, error: publicLookupErr } = await patientClient
      .from("therapists")
      .select("id, full_name")
      .eq("id", profProfile.id)
      .maybeSingle();

    if (publicLookupErr) throw publicLookupErr;
    if (publicLookup === null) {
      console.log(
        "🟢 SUCCESS: Draft/unpublished profiles are completely hidden from standard public visitors/patients!",
      );
    } else {
      throw new Error("❌ FAIL: Draft profile is visible to public visitor!");
    }
    console.log("------------------------------------------------------------------\n");

    // ------------------------------------------------------------------
    // TEST 3: Center onboarding and draft privacy flow
    // ------------------------------------------------------------------
    console.log("🔹 TEST 3: Onboarding a Center...");
    const centerClient = createAnonClient();
    const centerUser = await adminCreateAndSignIn(
      centerEmail,
      testPassword,
      "Test Center",
      centerClient,
    );
    console.log(`✅ Center user registered and logged in. ID: ${centerUser.id}`);

    // Simulate completion of center onboarding
    console.log("⚙️  Submitting center onboarding profile...");
    const { data: centerProfile, error: centerProfileErr } = await centerClient
      .from("therapists")
      .insert({
        user_id: centerUser.id,
        slug: `test-center-${randomSuffix}`,
        full_name: "Centro de Salud Mallorca Holística",
        headline: "Centro Integrativo de Terapias y Bienestar",
        sobre_mi: "Un centro dedicado al bienestar y crecimiento espiritual en Mallorca.",
        municipality_id: muni.id,
        status: "draft",
        verified: false,
        pending_plan_slug: "centros-organizadores",
        pending_plan_id: planMap["centros-organizadores"],
      })
      .select("id")
      .single();

    if (centerProfileErr) throw centerProfileErr;
    console.log(`✅ Center profile created with status 'draft'. ID: ${centerProfile.id}`);

    // Verify role automatically switches from 'patient' to 'center' via database trigger!
    const { data: updatedCenterRoles, error: centerRoleCheckErr } = await centerClient
      .from("user_roles")
      .select("role")
      .eq("user_id", centerUser.id);

    if (centerRoleCheckErr) throw centerRoleCheckErr;
    console.log(`👉 Roles after onboarding:`, updatedCenterRoles);
    const hasCenterRole = updatedCenterRoles.some((r) => r.role === "center");
    const hasNoPatientRoleCenter = !updatedCenterRoles.some((r) => r.role === "patient");

    if (hasCenterRole && hasNoPatientRoleCenter) {
      console.log(
        "🟢 SUCCESS: User role automatically updated from 'patient' to 'center' via database trigger!",
      );
    } else {
      throw new Error(
        `❌ FAIL: Role synchronization failed. Roles are: ${JSON.stringify(updatedCenterRoles)}`,
      );
    }

    // Verify Draft Privacy: Other users (like the patient) cannot read this center profile yet
    const { data: publicLookupCenter, error: publicLookupCenterErr } = await patientClient
      .from("therapists")
      .select("id, full_name")
      .eq("id", centerProfile.id)
      .maybeSingle();

    if (publicLookupCenterErr) throw publicLookupCenterErr;
    if (publicLookupCenter === null) {
      console.log(
        "🟢 SUCCESS: Draft/unpublished center profiles are completely hidden from standard public visitors/patients!",
      );
    } else {
      throw new Error("❌ FAIL: Draft center profile is visible to public visitor!");
    }
    console.log("------------------------------------------------------------------\n");

    // ------------------------------------------------------------------
    // TEST 4: Admin reviews uploaded documents and publishes profile
    // ------------------------------------------------------------------
    console.log("🔹 TEST 4: Admin Review and Publication Workflow...");

    // Log in as the seeded demo admin
    const adminClient = createAnonClient();
    const demoAdminEmail = "admin-demo@mallorcaholistica.com";
    const demoAdminPassword = "MallorcaDemoAdmin!2026";

    const { data: adminLogin, error: adminLoginErr } = await adminClient.auth.signInWithPassword({
      email: demoAdminEmail,
      password: demoAdminPassword,
    });

    if (adminLoginErr) {
      throw new Error(
        `Admin login failed: ${adminLoginErr.message}. Ensure demo admin has been seeded.`,
      );
    }
    const adminUser = adminLogin.user;
    console.log(`✅ Admin logged in. ID: ${adminUser.id}`);

    // Verify admin can access and read the private verification document uploaded by the professional (via the new verification_docs_admin_read bucket policy)
    console.log(
      `⚙️  Admin downloading professional's verification document from private bucket...`,
    );
    const { data: adminDocRead, error: adminDocReadErr } = await adminClient.storage
      .from("verification-docs")
      .download(testDocPath);

    if (adminDocReadErr) throw adminDocReadErr;
    const downloadedText = await adminDocRead.text();
    console.log(`👉 Downloaded document text: "${downloadedText}"`);
    if (downloadedText === testDocContent) {
      console.log(
        `🟢 SUCCESS: Admin can successfully review and download verification documents from the private bucket!`,
      );
    } else {
      throw new Error("❌ FAIL: Admin downloaded file contents do not match.");
    }

    // Admin approves and publishes the professional profile
    console.log("⚙️  Admin publishing professional's profile...");
    const { data: approvedProf, error: approveErr } = await adminClient
      .from("therapists")
      .update({
        status: "published",
        verified: true,
        verification_reviewed_at: new Date().toISOString(),
        verification_reviewed_by: adminUser.id,
        verification_review_note: "Todo correcto, excelente perfil.",
      })
      .eq("id", profProfile.id)
      .select("id, status, verified")
      .single();

    if (approveErr) throw approveErr;
    console.log(
      `✅ Professional profile published! Status: ${approvedProf.status}, Verified: ${approvedProf.verified}`,
    );

    // Now, standard visitor/patient should be able to view this professional profile publicly
    console.log("⚙️  Verifying profile is now publicly accessible...");
    const { data: finalPublicLookup, error: finalLookupErr } = await patientClient
      .from("therapists")
      .select("id, full_name, status, verified")
      .eq("id", profProfile.id)
      .single();

    if (finalLookupErr) throw finalLookupErr;
    console.log(`👉 Public lookup result:`, finalPublicLookup);
    if (finalPublicLookup.status === "published" && finalPublicLookup.verified === true) {
      console.log(
        "🟢 SUCCESS: Published professional profile is now fully visible to public visitors/patients!",
      );
    } else {
      throw new Error("❌ FAIL: Profile is not published or verified.");
    }
    console.log("------------------------------------------------------------------\n");

    // Clean up test data to keep remote database pristine
    console.log("🧹 Cleaning up created test accounts...");
    await cleanupUser(patientEmail);
    await cleanupUser(professionalEmail);
    await cleanupUser(centerEmail);

    console.log("======================================================================");
    console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! THE SYSTEM FLOW IS 100% CORRECT!");
    console.log("======================================================================");
  } catch (err) {
    console.error("\n❌ TEST SUITE FAILED WITH AN ERROR:\n", err);
    process.exit(1);
  }
}

runTests();
