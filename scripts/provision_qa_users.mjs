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
  }
});

async function main() {
  console.log("=================================================");
  console.log("🌿 MALLORCA HOLÍSTICA — PROVISIONING QA TEST USERS");
  console.log("=================================================");

  // 1. Fetch plans, municipalities, therapies, help areas from database to map slugs to IDs
  console.log("Fetching reference taxonomies from database...");
  const { data: plansList, error: planErr } = await supabase.from("plans").select("*");
  if (planErr) throw planErr;
  const plans = Object.fromEntries(plansList.map(p => [p.slug, p]));

  const { data: munisList, error: muniErr } = await supabase.from("municipalities").select("*");
  if (muniErr) throw muniErr;
  const munis = Object.fromEntries(munisList.map(m => [m.slug, m]));

  const { data: therapiesList, error: thErr } = await supabase.from("therapies").select("*");
  if (thErr) throw thErr;
  const therapies = Object.fromEntries(therapiesList.map(t => [t.slug, t]));

  const { data: helpAreasList, error: haErr } = await supabase.from("help_areas").select("*");
  if (haErr) throw haErr;
  const helpAreas = Object.fromEntries(helpAreasList.map(h => [h.slug, h]));

  console.log(`✅ Loaded ${plansList.length} plans, ${munisList.length} municipalities, ${therapiesList.length} therapies, and ${helpAreasList.length} help areas.`);

  // 2. Teardown any existing test users ending with @test.mh
  console.log("\n🧹 Cleaning up any existing @test.mh users...");
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) throw listErr;

  const testUsers = users.filter(u => u.email && u.email.endsWith("@test.mh"));
  console.log(`Found ${testUsers.length} existing @test.mh user accounts to delete.`);
  for (const user of testUsers) {
    const { error: delErr } = await supabase.auth.admin.deleteUser(user.id);
    if (delErr) {
      console.warn(`⚠️ Failed to delete user ${user.email}:`, delErr.message);
    } else {
      console.log(`Deleted existing user: ${user.email}`);
    }
  }

  // 3. Define the 7 test users
  const testPassword = "MallorcaTest2026!";
  const userConfigs = [
    {
      email: "admin@test.mh",
      role: "admin",
      isTherapist: false
    },
    {
      email: "presencia-active@test.mh",
      role: "user", // trigger handles syncing, or we set to professional
      isTherapist: true,
      therapistConfig: {
        slug: "presencia-active",
        full_name: "Test Presencia Activo",
        plan_slug: "presencia",
        status: "published",
        is_founder: false,
        municipality_slug: "palma",
        especialidad: "Reiki",
        subespecialidades: ["Reiki"],
        modalities: ["presencial"],
        whatsapp: "+34600112233",
        phone: "+34600112233",
        sobre_mi: "Soy un terapeuta de Reiki en Palma de Mallorca ofreciendo un espacio de calma y sanación.",
        therapy_slugs: ["reiki"],
        help_area_slugs: ["ansiedad"]
      }
    },
    {
      email: "presencia-onboarding@test.mh",
      role: "user",
      isTherapist: true,
      therapistConfig: {
        slug: "presencia-onboarding",
        full_name: "Test Presencia Onboarding",
        plan_slug: "presencia",
        status: "draft",
        is_founder: false,
        municipality_slug: "palma",
        especialidad: "Reiki",
        subespecialidades: ["Reiki"],
        modalities: ["presencial"],
        whatsapp: "+34600112234",
        phone: "+34600112234",
        sobre_mi: "Perfil de prueba en estado de borrador/onboarding.",
        therapy_slugs: [],
        help_area_slugs: []
      }
    },
    {
      email: "profesional-standard@test.mh",
      role: "user",
      isTherapist: true,
      therapistConfig: {
        slug: "profesional-standard",
        full_name: "Test Profesional Estándar",
        plan_slug: "profesional",
        status: "published",
        is_founder: false,
        municipality_slug: "palma",
        especialidad: "Acupuntura",
        subespecialidades: ["Acupuntura"],
        modalities: ["presencial", "online"],
        whatsapp: "+34600223344",
        phone: "+34600223344",
        website: "https://standardtherapist.com",
        sobre_mi: "Especialista en acupuntura con amplia experiencia clínica en el tratamiento del dolor y del estrés.",
        therapy_slugs: ["acupuntura"],
        help_area_slugs: ["estres", "dolor-cronico"]
      }
    },
    {
      email: "profesional-founder@test.mh",
      role: "user",
      isTherapist: true,
      therapistConfig: {
        slug: "profesional-founder",
        full_name: "Test Profesional Fundador",
        plan_slug: "profesional",
        status: "published",
        is_founder: true,
        municipality_slug: "inca",
        especialidad: "Osteopatía",
        subespecialidades: ["Osteopatía", "Reiki"],
        modalities: ["presencial"],
        whatsapp: "+34600334455",
        phone: "+34600334455",
        website: "https://foundertherapist.com",
        sobre_mi: "Osteópata y terapeuta de Reiki en Inca. Formo parte de la Comunidad Fundadora de Mallorca Holística.",
        therapy_slugs: ["osteopatia", "reiki"],
        help_area_slugs: ["dolor-cronico", "ansiedad"]
      }
    },
    {
      email: "profesional-pending@test.mh",
      role: "user",
      isTherapist: true,
      therapistConfig: {
        slug: "profesional-pending",
        full_name: "Test Profesional Pendiente",
        plan_slug: "profesional",
        status: "pending",
        is_founder: true,
        municipality_slug: "palma",
        especialidad: "Naturopatía",
        subespecialidades: ["Naturopatía"],
        modalities: ["presencial"],
        whatsapp: "+34600445566",
        phone: "+34600445566",
        sobre_mi: "Naturópata en Palma, perfil pendiente de validación administrativa.",
        therapy_slugs: ["naturopatia"],
        help_area_slugs: ["fatiga"]
      }
    },
    {
      email: "centro-active@test.mh",
      role: "user",
      isTherapist: true,
      therapistConfig: {
        slug: "centro-active",
        full_name: "Test Centro Activo",
        plan_slug: "centros-organizadores",
        status: "published",
        is_founder: true,
        municipality_slug: "palma",
        especialidad: "Meditación",
        subespecialidades: ["Meditación", "Terapia emocional"],
        modalities: ["presencial"],
        whatsapp: "+34600556677",
        phone: "+34600556677",
        website: "https://centroholisticoactive.com",
        sobre_mi: "Centro de bienestar y meditación en el corazón de Palma de Mallorca.",
        therapy_slugs: ["meditacion", "terapia-emocional"],
        help_area_slugs: ["equilibrio-emocional", "insomnio"]
      }
    }
  ];

  console.log(`\n👥 Creating ${userConfigs.length} test users in Auth...`);
  for (const config of userConfigs) {
    console.log(`Creating user: ${config.email}...`);
    const { data: userData, error: createErr } = await supabase.auth.admin.createUser({
      email: config.email,
      password: testPassword,
      email_confirm: true
    });
    if (createErr) throw createErr;
    const user = userData.user;
    console.log(`✅ Created Auth User: ${user.email} | ID: ${user.id}`);

    // If role is admin, assign it
    if (config.role === "admin") {
      const { error: roleErr } = await supabase.from("user_roles").insert({
        user_id: user.id,
        role: "admin"
      });
      if (roleErr) throw roleErr;
      console.log(`   └─ Assigned admin role successfully.`);
    }

    // If therapist, create their therapist profile row
    if (config.isTherapist && config.therapistConfig) {
      const tc = config.therapistConfig;
      const plan = plans[tc.plan_slug];
      const muni = munis[tc.municipality_slug];

      if (!plan) throw new Error(`Plan slug '${tc.plan_slug}' not found in DB!`);
      const muniId = muni ? muni.id : null;

      const therapistRow = {
        user_id: user.id,
        slug: tc.slug,
        full_name: tc.full_name,
        plan_id: plan.id,
        status: tc.status,
        is_founder: tc.is_founder,
        municipality_id: muniId,
        especialidad: tc.especialidad,
        subespecialidades: tc.subespecialidades,
        modalities: tc.modalities,
        whatsapp: tc.whatsapp,
        phone: tc.phone,
        email: config.email,
        website: tc.website || null,
        sobre_mi: tc.sobre_mi,
        verified: tc.status === "published",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: thData, error: thErr } = await supabase
        .from("therapists")
        .insert(therapistRow)
        .select("id")
        .single();

      if (thErr) {
        console.error(`❌ Error inserting therapist row for ${tc.slug}:`, thErr);
        throw thErr;
      }
      const therapistId = thData.id;
      console.log(`   ├─ Created public.therapists profile. ID: ${therapistId}`);

      // Seed therapist therapies relation
      if (tc.therapy_slugs && tc.therapy_slugs.length > 0) {
        const tRows = tc.therapy_slugs
          .map(slug => therapies[slug]?.id)
          .filter(Boolean)
          .map(therapy_id => ({ therapist_id: therapistId, therapy_id }));
        if (tRows.length > 0) {
          const { error: relErr } = await supabase.from("therapist_therapies").insert(tRows);
          if (relErr) throw relErr;
        }
      }

      // Seed therapist help areas relation
      if (tc.help_area_slugs && tc.help_area_slugs.length > 0) {
        const hRows = tc.help_area_slugs
          .map(slug => helpAreas[slug]?.id)
          .filter(Boolean)
          .map(help_area_id => ({ therapist_id: therapistId, help_area_id }));
        if (hRows.length > 0) {
          const { error: relErr } = await supabase.from("therapist_help_areas").insert(hRows);
          if (relErr) throw relErr;
        }
      }

      console.log(`   └─ Associated ${tc.therapy_slugs.length} therapies and ${tc.help_area_slugs.length} help areas.`);
    }
  }

  console.log("\n=================================================");
  console.log("🎉 PROVISIONING COMPLETED SUCCESSFULLY!");
  console.log("=================================================");
}

main().catch(err => {
  console.error("❌ Fatal error in main:", err);
  process.exit(1);
});
