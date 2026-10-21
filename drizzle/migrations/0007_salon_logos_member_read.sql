DROP POLICY IF EXISTS "salon logos public read" ON storage.objects;
CREATE POLICY "salon logos member read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'salon-logos' AND public.has_salao_access(((storage.foldername(name))[1])::uuid));