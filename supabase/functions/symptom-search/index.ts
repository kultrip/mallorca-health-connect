// Conversational symptom search — maps a free-text query to help areas + therapies
// using Lovable AI Gateway, then ranks matching therapists.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return json({ error: "query required" }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Load catalogs
    const [{ data: helpAreas }, { data: therapies }] = await Promise.all([
      supabase.from("help_areas").select("slug,name,description,keywords"),
      supabase.from("therapies").select("slug,name,short_description"),
    ]);

    // Ask the AI to match
    const systemPrompt = `Eres un asistente cálido y empático de Mallorca Holística, un directorio de terapeutas holísticos. Recibes lo que siente o necesita una persona y debes responder con:
1. una breve introducción empática en español (máx 2 frases, tono cálido, sin diagnosticar, sin promesas médicas)
2. los slugs de help_areas que mejor encajan (1-4)
3. los slugs de therapies sugeridas (2-5)

Responde SOLO con JSON válido en este formato:
{"intro": "...", "matched_help_areas": ["slug1","slug2"], "suggested_therapies": ["slug1","slug2"]}

help_areas disponibles:
${helpAreas?.map((h) => `- ${h.slug}: ${h.name} (${h.description})`).join("\n")}

therapies disponibles:
${therapies?.map((t) => `- ${t.slug}: ${t.name}`).join("\n")}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI error:", aiRes.status, errText);
      if (aiRes.status === 429) return json({ error: "Demasiadas búsquedas. Inténtalo en un momento." }, 429);
      if (aiRes.status === 402) return json({ error: "Servicio de IA temporalmente no disponible." }, 402);
      return json({ error: "AI request failed" }, 500);
    }

    const aiData = await aiRes.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    let parsed: { intro?: string; matched_help_areas?: string[]; suggested_therapies?: string[] };
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { intro: "Aquí tienes algunas opciones que podrían acompañarte." };
    }

    const matchedHelpAreas = parsed.matched_help_areas ?? [];
    const suggestedTherapies = parsed.suggested_therapies ?? [];

    // Fetch matching therapists
    let therapistIds: string[] = [];
    if (matchedHelpAreas.length > 0) {
      const { data: areas } = await supabase
        .from("help_areas")
        .select("id")
        .in("slug", matchedHelpAreas);
      const areaIds = (areas ?? []).map((a) => a.id);
      if (areaIds.length > 0) {
        const { data: links } = await supabase
          .from("therapist_help_areas")
          .select("therapist_id")
          .in("help_area_id", areaIds);
        therapistIds = [...new Set((links ?? []).map((l) => l.therapist_id))];
      }
    }

    let therapists: any[] = [];
    if (therapistIds.length > 0) {
      const { data } = await supabase
        .from("therapists")
        .select("id, slug, full_name, headline, frase_clave, photo_url, especialidad, modalities, verified, municipality_id, plan_id, municipalities(name,slug)")
        .in("id", therapistIds)
        .eq("status", "published")
        .limit(20);
      therapists = data ?? [];
      // rank: verified first
      therapists.sort((a, b) => Number(b.verified) - Number(a.verified));
    }

    // Log query (best effort)
    await supabase.from("ai_search_queries").insert({
      query,
      ai_intro: parsed.intro,
      matched_help_areas: matchedHelpAreas,
      suggested_therapies: suggestedTherapies,
    });

    return json({
      intro: parsed.intro ?? "",
      matched_help_areas: matchedHelpAreas,
      suggested_therapies: suggestedTherapies,
      therapists,
    });
  } catch (err) {
    console.error(err);
    return json({ error: String(err) }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
