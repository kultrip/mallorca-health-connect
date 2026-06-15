// Conversational symptom search: maps free text to help areas + therapies,
// then ranks matching therapists and logs analytics.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") || "";
const SUPABASE_URL = Deno.env.get("SECRET_SUPABASE_URL") || Deno.env.get("SUPABASE_URL") || "";
const SERVICE_KEY =
  Deno.env.get("SECRET_SUPABASE_SERVICE_ROLE_KEY") ||
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  "";

type HelpArea = {
  id?: string;
  slug: string;
  name: string;
  description?: string | null;
  keywords?: string[] | null;
};

type Therapy = {
  slug: string;
  name: string;
  short_description?: string | null;
};

type RankedTherapist = {
  id: string;
  full_name?: string | null;
  subscription_status?: string | null;
  plans?: { slug?: string | null } | null;
  verified?: boolean;
};

type ParsedSearch = {
  intro?: string;
  matched_help_areas?: string[];
  suggested_therapies?: string[];
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, visitorId } = await req.json();
    const cleanVisitorId = typeof visitorId === "string" ? visitorId : null;

    if (!query || typeof query !== "string") {
      return json({ error: "query required" }, 400);
    }

    if (!SUPABASE_URL || !SERVICE_KEY) {
      return json({ error: "Supabase function secrets are missing" }, 500);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const [{ data: helpAreas }, { data: therapies }] = await Promise.all([
      supabase.from("help_areas").select("id,slug,name,description,keywords"),
      supabase.from("therapies").select("slug,name,short_description"),
    ]);

    const parsed = await inferSearch(query, helpAreas ?? [], therapies ?? []);
    const matchedHelpAreas =
      parsed.matched_help_areas && parsed.matched_help_areas.length > 0
        ? parsed.matched_help_areas
        : keywordMatchHelpAreas(query, helpAreas);
    const suggestedTherapies = parsed.suggested_therapies ?? [];

    const therapistMatchCounts = new Map<string, number>();
    if (matchedHelpAreas.length > 0) {
      const { data: areas } = await supabase
        .from("help_areas")
        .select("id")
        .in("slug", matchedHelpAreas);
      const areaIds = (areas ?? []).map((area) => area.id);

      if (areaIds.length > 0) {
        const { data: links } = await supabase
          .from("therapist_help_areas")
          .select("therapist_id")
          .in("help_area_id", areaIds);

        for (const link of links ?? []) {
          therapistMatchCounts.set(
            link.therapist_id,
            (therapistMatchCounts.get(link.therapist_id) ?? 0) + 1,
          );
        }
      }
    }

    const therapistIds = [...therapistMatchCounts.keys()];
    let therapists: RankedTherapist[] = [];

    if (therapistIds.length > 0) {
      const { data } = await supabase
        .from("therapists")
        .select(
          "id, slug, full_name, headline, frase_clave, photo_url, especialidad, modalities, verified, city, address, lat, lng, municipality_id, plan_id, subscription_status, municipalities(name,slug,lat,lng), plans!therapists_plan_id_fkey(slug)",
        )
        .in("id", therapistIds)
        .eq("status", "published");

      therapists = data ?? [];
      therapists.sort((a, b) => {
        const paidDelta =
          Number(isPaidPriorityProfessional(b)) - Number(isPaidPriorityProfessional(a));
        if (paidDelta !== 0) return paidDelta;

        const matchDelta =
          (therapistMatchCounts.get(b.id) ?? 0) - (therapistMatchCounts.get(a.id) ?? 0);
        if (matchDelta !== 0) return matchDelta;

        return compareNames(a.full_name, b.full_name);
      });
    }

    const { data: searchLog } = await supabase
      .from("ai_search_queries")
      .insert({
        query,
        ai_intro: parsed.intro,
        matched_help_areas: matchedHelpAreas,
        suggested_therapies: suggestedTherapies,
      })
      .select("id")
      .single();

    const searchQueryId = searchLog?.id ?? null;

    await supabase.from("analytics_events").insert({
      event_type: "conversational_search",
      visitor_id: cleanVisitorId,
      search_query_id: searchQueryId,
      metadata: {
        query_length: query.length,
        matched_help_areas: matchedHelpAreas,
        suggested_therapies: suggestedTherapies,
      },
    });

    if (therapists.length > 0) {
      await supabase.from("analytics_events").insert(
        therapists.map((therapist) => ({
          event_type: "search_result_impression",
          visitor_id: cleanVisitorId,
          therapist_id: therapist.id,
          search_query_id: searchQueryId,
          metadata: {
            matched_help_areas: matchedHelpAreas,
          },
        })),
      );
    }

    return json({
      intro: parsed.intro ?? "",
      matched_help_areas: matchedHelpAreas,
      suggested_therapies: suggestedTherapies,
      search_query_id: searchQueryId,
      therapists,
    });
  } catch (err) {
    console.error(err);
    return json({ error: String(err) }, 500);
  }
});

async function inferSearch(query: string, helpAreas: HelpArea[], therapies: Therapy[]) {
  const fallback = {
    intro: "Aquí tienes algunas opciones que podrían acompañarte.",
    matched_help_areas: keywordMatchHelpAreas(query, helpAreas),
    suggested_therapies: [] as string[],
  };

  if (!LOVABLE_API_KEY) return fallback;

  const systemPrompt = `Eres un asistente cálido y empático de Mallorca Holística, un directorio de terapeutas holísticos. Recibes lo que siente o necesita una persona y debes responder con:
1. una breve introducción empática en español (máx 2 frases, tono cálido, sin diagnosticar, sin promesas médicas)
2. los slugs de help_areas que mejor encajan (1-4)
3. los slugs de therapies sugeridas (2-5)

Responde SOLO con JSON válido en este formato:
{"intro": "...", "matched_help_areas": ["slug1","slug2"], "suggested_therapies": ["slug1","slug2"]}

help_areas disponibles:
${helpAreas.map((h) => `- ${h.slug}: ${h.name} (${h.description})`).join("\n")}

therapies disponibles:
${therapies.map((t) => `- ${t.slug}: ${t.name}`).join("\n")}`;

  const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
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
    return fallback;
  }

  const aiData = await aiRes.json();
  const content = aiData.choices?.[0]?.message?.content || "{}";

  try {
    return JSON.parse(content) as ParsedSearch;
  } catch {
    return fallback;
  }
}

function keywordMatchHelpAreas(
  query: string,
  helpAreas: Array<{ slug: string; name: string; keywords?: string[] | null }> | null | undefined,
) {
  const normalized = query.toLowerCase();

  return (helpAreas ?? [])
    .filter((area) => {
      const candidates = [area.slug, area.name, ...(area.keywords ?? [])].map((item) =>
        item.toLowerCase(),
      );
      return candidates.some((candidate) => normalized.includes(candidate));
    })
    .map((area) => area.slug)
    .slice(0, 4);
}

function isPaidPriorityProfessional(therapist: RankedTherapist) {
  return (
    therapist.subscription_status === "active" &&
    therapist.plans?.slug &&
    ["profesional", "centros-organizadores"].includes(therapist.plans.slug)
  );
}

function compareNames(a: string | null | undefined, b: string | null | undefined) {
  return (a ?? "").localeCompare(b ?? "", "es", { sensitivity: "base", numeric: true });
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
