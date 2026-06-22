-- ============ ANALYTICS EVENTS ============
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'conversational_search',
      'search_result_impression',
      'professional_profile_view',
      'professional_contact_click',
      'activity_view',
      'activity_contact_click'
    )
  ),
  visitor_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  therapist_id UUID REFERENCES public.therapists(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  search_query_id UUID REFERENCES public.ai_search_queries(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created
ON public.analytics_events (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_therapist_created
ON public.analytics_events (therapist_id, created_at DESC)
WHERE therapist_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_analytics_events_activity_created
ON public.analytics_events (activity_id, created_at DESC)
WHERE activity_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_analytics_events_search_query
ON public.analytics_events (search_query_id)
WHERE search_query_id IS NOT NULL;

CREATE POLICY "analytics_events_insert_anyone"
ON public.analytics_events
FOR INSERT
WITH CHECK (true);

CREATE POLICY "analytics_events_admin_read"
ON public.analytics_events
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "analytics_events_therapist_owner_read"
ON public.analytics_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.therapists t
    WHERE t.id = analytics_events.therapist_id
      AND t.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM public.activities a
    JOIN public.therapists t ON t.id = a.therapist_id
    WHERE a.id = analytics_events.activity_id
      AND t.user_id = auth.uid()
  )
);

CREATE OR REPLACE FUNCTION public.track_analytics_event(
  _event_type TEXT,
  _visitor_id TEXT DEFAULT NULL,
  _therapist_id UUID DEFAULT NULL,
  _activity_id UUID DEFAULT NULL,
  _search_query_id UUID DEFAULT NULL,
  _metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _event_id UUID;
BEGIN
  INSERT INTO public.analytics_events (
    event_type,
    visitor_id,
    user_id,
    therapist_id,
    activity_id,
    search_query_id,
    metadata
  )
  VALUES (
    _event_type,
    _visitor_id,
    auth.uid(),
    _therapist_id,
    _activity_id,
    _search_query_id,
    COALESCE(_metadata, '{}'::jsonb)
  )
  RETURNING id INTO _event_id;

  RETURN _event_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_analytics_summary(_since TIMESTAMPTZ DEFAULT now() - interval '30 days')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _result JSONB;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT jsonb_build_object(
    'searches_today', (
      SELECT COUNT(*)
      FROM public.analytics_events
      WHERE event_type = 'conversational_search'
        AND created_at >= date_trunc('day', now())
    ),
    'searches_period', (
      SELECT COUNT(*)
      FROM public.analytics_events
      WHERE event_type = 'conversational_search'
        AND created_at >= _since
    ),
    'profile_views_period', (
      SELECT COUNT(*)
      FROM public.analytics_events
      WHERE event_type = 'professional_profile_view'
        AND created_at >= _since
    ),
    'contact_clicks_period', (
      SELECT COUNT(*)
      FROM public.analytics_events
      WHERE event_type = 'professional_contact_click'
        AND created_at >= _since
    ),
    'top_professionals', COALESCE((
      SELECT jsonb_agg(row_to_json(x))
      FROM (
        SELECT t.id, t.full_name, t.slug, COUNT(e.id) AS views
        FROM public.analytics_events e
        JOIN public.therapists t ON t.id = e.therapist_id
        WHERE e.event_type = 'professional_profile_view'
          AND e.created_at >= _since
        GROUP BY t.id, t.full_name, t.slug
        ORDER BY views DESC
        LIMIT 10
      ) x
    ), '[]'::jsonb),
    'top_help_areas', COALESCE((
      SELECT jsonb_agg(row_to_json(x))
      FROM (
        SELECT area_slug, COUNT(*) AS searches
        FROM public.ai_search_queries q
        CROSS JOIN LATERAL jsonb_array_elements_text(q.matched_help_areas) AS area_slug
        WHERE q.created_at >= _since
        GROUP BY area_slug
        ORDER BY searches DESC
        LIMIT 10
      ) x
    ), '[]'::jsonb)
  ) INTO _result;

  RETURN _result;
END;
$$;

CREATE OR REPLACE FUNCTION public.therapist_analytics_summary(_since TIMESTAMPTZ DEFAULT now() - interval '30 days')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _therapist_id UUID;
  _result JSONB;
BEGIN
  SELECT id INTO _therapist_id
  FROM public.therapists
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF _therapist_id IS NULL THEN
    RETURN jsonb_build_object(
      'profile_views_period', 0,
      'search_impressions_period', 0,
      'contact_clicks_period', 0,
      'contact_clicks_by_channel', '[]'::jsonb,
      'daily_counts', '[]'::jsonb
    );
  END IF;

  SELECT jsonb_build_object(
    'profile_views_period', (
      SELECT COUNT(*)
      FROM public.analytics_events
      WHERE therapist_id = _therapist_id
        AND event_type = 'professional_profile_view'
        AND created_at >= _since
    ),
    'search_impressions_period', (
      SELECT COUNT(*)
      FROM public.analytics_events
      WHERE therapist_id = _therapist_id
        AND event_type = 'search_result_impression'
        AND created_at >= _since
    ),
    'contact_clicks_period', (
      SELECT COUNT(*)
      FROM public.analytics_events
      WHERE therapist_id = _therapist_id
        AND event_type = 'professional_contact_click'
        AND created_at >= _since
    ),
    'contact_clicks_by_channel', COALESCE((
      SELECT jsonb_agg(row_to_json(x))
      FROM (
        SELECT metadata->>'channel' AS channel, COUNT(*) AS clicks
        FROM public.analytics_events
        WHERE therapist_id = _therapist_id
          AND event_type = 'professional_contact_click'
          AND created_at >= _since
        GROUP BY metadata->>'channel'
        ORDER BY clicks DESC
      ) x
    ), '[]'::jsonb),
    'daily_counts', COALESCE((
      SELECT jsonb_agg(row_to_json(x))
      FROM (
        SELECT
          date_trunc('day', created_at)::date AS day,
          COUNT(*) FILTER (WHERE event_type = 'professional_profile_view') AS profile_views,
          COUNT(*) FILTER (WHERE event_type = 'search_result_impression') AS search_impressions,
          COUNT(*) FILTER (WHERE event_type = 'professional_contact_click') AS contact_clicks
        FROM public.analytics_events
        WHERE therapist_id = _therapist_id
          AND created_at >= _since
        GROUP BY date_trunc('day', created_at)::date
        ORDER BY day ASC
      ) x
    ), '[]'::jsonb)
  ) INTO _result;

  RETURN _result;
END;
$$;
