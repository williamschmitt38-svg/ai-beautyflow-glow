ALTER TABLE public.salao ADD COLUMN IF NOT EXISTS remover_marca boolean NOT NULL DEFAULT false;
ALTER TABLE public.salao ADD COLUMN IF NOT EXISTS webhook_url text;

CREATE OR REPLACE FUNCTION public.protect_salao_enterprise_features()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.plano <> 'enterprise' THEN
    IF NEW.remover_marca AND (TG_OP = 'INSERT' OR NOT OLD.remover_marca) THEN
      RAISE EXCEPTION 'Remover a marca é exclusivo do plano Enterprise';
    END IF;
    IF NEW.webhook_url IS NOT NULL AND (TG_OP = 'INSERT' OR OLD.webhook_url IS DISTINCT FROM NEW.webhook_url) THEN
      RAISE EXCEPTION 'Integrações são exclusivas do plano Enterprise';
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_protect_salao_enterprise ON public.salao;
CREATE TRIGGER trg_protect_salao_enterprise BEFORE INSERT OR UPDATE ON public.salao
FOR EACH ROW EXECUTE FUNCTION public.protect_salao_enterprise_features();

CREATE POLICY "salon logos public read" ON storage.objects FOR SELECT USING (bucket_id = 'salon-logos');
CREATE POLICY "salon logos member insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'salon-logos' AND public.has_salao_access(((storage.foldername(name))[1])::uuid));
CREATE POLICY "salon logos member update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'salon-logos' AND public.has_salao_access(((storage.foldername(name))[1])::uuid));
CREATE POLICY "salon logos member delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'salon-logos' AND public.has_salao_access(((storage.foldername(name))[1])::uuid));