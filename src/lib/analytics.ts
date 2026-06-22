import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

const visitorStorageKey = "mh_visitor_id";

export type AnalyticsEventType =
  | "conversational_search"
  | "search_result_impression"
  | "professional_profile_view"
  | "professional_contact_click"
  | "activity_view"
  | "activity_contact_click";

type TrackEventInput = {
  eventType: AnalyticsEventType;
  therapistId?: string | null;
  activityId?: string | null;
  searchQueryId?: string | null;
  metadata?: Json;
};

export function getVisitorId() {
  if (typeof window === "undefined") return null;

  const existing = window.localStorage.getItem(visitorStorageKey);
  if (existing) return existing;

  const next =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(visitorStorageKey, next);
  return next;
}

export async function trackAnalyticsEvent(input: TrackEventInput) {
  const visitorId = getVisitorId();

  const { error } = await supabase.rpc("track_analytics_event", {
    _event_type: input.eventType,
    _visitor_id: visitorId ?? undefined,
    _therapist_id: input.therapistId ?? undefined,
    _activity_id: input.activityId ?? undefined,
    _search_query_id: input.searchQueryId ?? undefined,
    _metadata: input.metadata ?? {},
  });

  if (error) {
    console.warn("[analytics] event failed", error);
  }
}

export function trackAnalyticsEventSoon(input: TrackEventInput) {
  void trackAnalyticsEvent(input);
}
