CREATE TABLE public.servico_categoria (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES public.salao(id) ON DELETE CASCADE,
 nome text NOT NULL CHECK (length(btrim(nome)) BETWEEN 1 AND 80 AND nome = btrim(nome)),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(company_id, id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.servico_categoria TO authenticated;
GRANT ALL ON public.servico_categoria TO service_role;
ALTER TABLE public.servico_categoria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read service categories" ON public.servico_categoria FOR SELECT TO authenticated USING (public.has_salao_access(company_id));
CREATE POLICY "Owners create service categories" ON public.servico_categoria FOR INSERT TO authenticated WITH CHECK (public.has_salao_role(company_id, ARRAY['owner','admin']::public.salao_user_role_enum[]) OR public.is_super_admin());
CREATE POLICY "Owners update service categories" ON public.servico_categoria FOR UPDATE TO authenticated USING (public.has_salao_role(company_id, ARRAY['owner','admin']::public.salao_user_role_enum[]) OR public.is_super_admin()) WITH CHECK (public.has_salao_role(company_id, ARRAY['owner','admin']::public.salao_user_role_enum[]) OR public.is_super_admin());
CREATE POLICY "Owners delete service categories" ON public.servico_categoria FOR DELETE TO authenticated USING (public.has_salao_role(company_id, ARRAY['owner','admin']::public.salao_user_role_enum[]) OR public.is_super_admin());
CREATE UNIQUE INDEX servico_categoria_unique_name ON public.servico_categoria(company_id, lower(nome));
ALTER TABLE public.servico ADD COLUMN category_id uuid;
INSERT INTO public.servico_categoria(company_id, nome) SELECT DISTINCT company_id, CASE WHEN categoria::text = 'Estetica' THEN 'Estética' ELSE categoria::text END FROM public.servico WHERE categoria IS NOT NULL;
UPDATE public.servico s SET category_id = c.id FROM public.servico_categoria c WHERE s.company_id = c.company_id AND c.nome = CASE WHEN s.categoria::text = 'Estetica' THEN 'Estética' ELSE s.categoria::text END;
ALTER TABLE public.servico ADD CONSTRAINT servico_category_salon_fkey FOREIGN KEY (company_id, category_id) REFERENCES public.servico_categoria(company_id, id) ON DELETE SET NULL (category_id);
CREATE INDEX servico_category_id_idx ON public.servico(category_id);
COMMENT ON COLUMN public.servico.categoria IS 'DEPRECATED: replaced by category_id referencing salon-managed servico_categoria';