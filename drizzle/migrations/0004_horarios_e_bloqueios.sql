ALTER TABLE public.salao ADD COLUMN IF NOT EXISTS horarios_funcionamento jsonb;
ALTER TABLE public.profissional ADD COLUMN IF NOT EXISTS usa_horario_salao boolean NOT NULL DEFAULT true;

CREATE TABLE public.agenda_bloqueio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.salao(id) ON DELETE CASCADE,
  profissional_id uuid REFERENCES public.profissional(id) ON DELETE CASCADE,
  data date NOT NULL,
  motivo text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX agenda_bloqueio_company_data ON public.agenda_bloqueio(company_id, data);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agenda_bloqueio TO authenticated;
GRANT ALL ON public.agenda_bloqueio TO service_role;
ALTER TABLE public.agenda_bloqueio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bloqueio_select" ON public.agenda_bloqueio FOR SELECT TO authenticated USING (public.has_salao_access(company_id));
CREATE POLICY "bloqueio_insert" ON public.agenda_bloqueio FOR INSERT TO authenticated WITH CHECK (public.has_salao_access(company_id));
CREATE POLICY "bloqueio_update" ON public.agenda_bloqueio FOR UPDATE TO authenticated USING (public.has_salao_access(company_id)) WITH CHECK (public.has_salao_access(company_id));
CREATE POLICY "bloqueio_delete" ON public.agenda_bloqueio FOR DELETE TO authenticated USING (public.has_salao_access(company_id));