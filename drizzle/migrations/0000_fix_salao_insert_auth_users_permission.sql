ALTER POLICY "create salao" ON public.salao
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND owner_email = (auth.jwt() ->> 'email')
);
COMMENT ON POLICY "create salao" ON public.salao IS 'Validates owner email using the signed authentication token without reading the protected auth.users table.';