CREATE TABLE public.salao_billing (
 salao_id uuid PRIMARY KEY REFERENCES public.salao(id) ON DELETE CASCADE,
 stripe_customer_id text NOT NULL UNIQUE,
 stripe_subscription_id text UNIQUE,
 stripe_status text,
 synced_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.salao_billing TO service_role;
ALTER TABLE public.salao_billing ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.protect_salao_billing() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF current_user IN ('postgres', 'service_role', 'supabase_admin') OR COALESCE(auth.role(), '') = 'service_role' OR public.is_super_admin() THEN RETURN NEW; END IF;
 IF TG_OP = 'INSERT' THEN
   NEW.status_cobranca := 'trial';
   NEW.trial_ate := CURRENT_DATE + 14;
   NEW.valor_plano := CASE NEW.plano WHEN 'pro' THEN 79 WHEN 'enterprise' THEN 149 ELSE 39 END;
 ELSIF NEW.plano IS DISTINCT FROM OLD.plano OR NEW.valor_plano IS DISTINCT FROM OLD.valor_plano OR NEW.status_cobranca IS DISTINCT FROM OLD.status_cobranca OR NEW.trial_ate IS DISTINCT FROM OLD.trial_ate THEN
   RAISE EXCEPTION 'A cobrança deve ser alterada pela Stripe.' USING ERRCODE = '42501';
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER protect_salao_billing BEFORE INSERT OR UPDATE ON public.salao FOR EACH ROW EXECUTE FUNCTION public.protect_salao_billing();