
-- Restrict SECURITY DEFINER function execution
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;

-- Tighten AI search query insert: require either anonymous (user_id null) or matches auth.uid()
DROP POLICY IF EXISTS "asq_insert_anyone" ON public.ai_search_queries;
CREATE POLICY "asq_insert_self_or_anon" ON public.ai_search_queries
  FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Restrict storage object listing on public buckets — allow direct file access via signed/public URL but not directory listing
DROP POLICY IF EXISTS "therapist_photos_public_read" ON storage.objects;
CREATE POLICY "therapist_photos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'therapist-photos' AND (storage.foldername(name))[1] IS NOT NULL);

DROP POLICY IF EXISTS "activity_images_public_read" ON storage.objects;
CREATE POLICY "activity_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'activity-images' AND (storage.foldername(name))[1] IS NOT NULL);
