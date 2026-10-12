ALTER POLICY "view own saloes" ON public.salao
TO authenticated
USING (
  has_salao_access(id)
  OR (
    auth.uid() IS NOT NULL
    AND owner_email = (auth.jwt() ->> 'email')
  )
);
COMMENT ON POLICY "view own saloes" ON public.salao IS 'Allows the authenticated owner to read the salon returned by INSERT before salon membership is created; other reads require salon access.';