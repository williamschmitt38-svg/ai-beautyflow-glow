CREATE OR REPLACE FUNCTION public.protect_salao_billing()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $function$
BEGIN
 IF current_user IN ('postgres', 'service_role', 'supabase_admin') OR COALESCE(auth.role(), '') = 'service_role' OR public.is_super_admin() THEN RETURN NEW; END IF;
 IF TG_OP = 'INSERT' THEN
   NEW.status_cobranca := 'trial';
   NEW.trial_ate := CURRENT_DATE + 14;
   NEW.valor_plano := CASE NEW.plano WHEN 'pro' THEN 79 WHEN 'enterprise' THEN 129.90 ELSE 39 END;
 ELSIF NEW.plano IS DISTINCT FROM OLD.plano OR NEW.valor_plano IS DISTINCT FROM OLD.valor_plano OR NEW.status_cobranca IS DISTINCT FROM OLD.status_cobranca OR NEW.trial_ate IS DISTINCT FROM OLD.trial_ate THEN
   RAISE EXCEPTION 'A cobrança deve ser alterada pela Stripe.' USING ERRCODE = '42501';
 END IF;
 RETURN NEW;
END;
$function$;
UPDATE public.salao SET valor_plano = 129.90 WHERE plano = 'enterprise' AND status_cobranca = 'trial';
CREATE INDEX IF NOT EXISTS agendamento_cliente_id_idx ON public.agendamento(cliente_id);