import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { CreditCard, ExternalLink, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import { billingPlans, type BillingPlan } from '@/lib/billing-plans';
import { createSalonCheckout, createSalonPortal } from '@/lib/billing.functions';
import { useSalonBilling } from '@/hooks/useSalonBilling';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const labels: Record<string, string> = { trial: 'Período gratuito', ativo: 'Ativa', active: 'Ativa', trialing: 'Período gratuito', past_due: 'Pagamento pendente', inadimplente: 'Pagamento pendente', unpaid: 'Pagamento pendente', incomplete: 'Pagamento pendente', canceled: 'Cancelada', cancelado: 'Cancelada', incomplete_expired: 'Pagamento não concluído', suspenso: 'Suspensa' };
export function SalonBilling({ salao }: { salao: Database['public']['Tables']['salao']['Row'] }) {
  const billing = useSalonBilling(salao.id);
  const checkout = useServerFn(createSalonCheckout);
  const portal = useServerFn(createSalonPortal);
  const [busy, setBusy] = useState<string | null>(null);
  async function open(action: BillingPlan | 'portal') {
    setBusy(action);
    const popup = window.open('about:blank', '_blank');
    if (popup) popup.opener = null;
    try {
      const result = action === 'portal' ? await portal({ data: { salaoId: salao.id } }) : await checkout({ data: { salaoId: salao.id, plan: action } });
      if (popup) popup.location.href = result.url;
      else window.location.assign(result.url);
    } catch (error) {
      popup?.close();
      toast.error(error instanceof Error ? error.message : 'Não foi possível abrir a cobrança.');
    } finally { setBusy(null); }
  }
  const current = billing.data;
  const state = salao.status_cobranca === 'suspenso' ? 'suspenso' : current?.status && current.status !== 'not_started' ? current.status : salao.status_cobranca;
  const plan = current?.plan || salao.plano;
  const hasSubscription = current?.canManage && !['canceled', 'incomplete_expired'].includes(current.status);
  return <div className="space-y-6 py-4">
    <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-6">
      <div className="space-y-2"><h2 className="flex items-center gap-2 text-xl font-semibold"><CreditCard className="h-5 w-5 text-primary" /> Assinatura BeautyFlow</h2>
        <div className="flex flex-wrap items-center gap-2 text-sm"><span>{billingPlans[plan].name} · R$ {billingPlans[plan].amount}/mês</span><Badge variant={current?.subscribed ? 'default' : 'secondary'}>{labels[state] || state}</Badge></div>
        {salao.trial_ate && !current?.subscribed && <p className="text-sm text-muted-foreground">Período gratuito até {format(parseISO(salao.trial_ate), 'dd/MM/yyyy')}</p>}
        {current?.periodEnd && <p className="text-sm text-muted-foreground">{current.cancelAtPeriodEnd ? 'Acesso até' : 'Próxima renovação'}: {format(parseISO(current.periodEnd), 'dd/MM/yyyy')}</p>}
      </div>
      {billing.canBill && <div className="flex flex-wrap gap-2"><Button variant="outline" disabled={billing.isFetching || !!busy} onClick={() => void billing.refetch()}><RefreshCw className={`mr-2 h-4 w-4 ${billing.isFetching ? 'animate-spin' : ''}`} />Atualizar status</Button>
      {current?.canManage && <Button variant="outline" disabled={!!busy} onClick={() => void open('portal')}><ExternalLink className="mr-2 h-4 w-4" />{busy === 'portal' ? 'Abrindo…' : 'Gerenciar assinatura'}</Button>}</div>}
    </div>
    {billing.error && <p role="alert" className="text-sm text-destructive">{billing.error.message}</p>}
    {!billing.canBill && !billing.permissionLoading && <p className="text-sm text-muted-foreground">A assinatura é gerenciada pelo dono do salão.</p>}
    <div className="grid gap-4 md:grid-cols-3">{(Object.keys(billingPlans) as BillingPlan[]).map(key => <Card key={key} className={current?.subscribed && plan === key ? 'border-primary' : ''}>
      <CardHeader><CardTitle className="flex items-center justify-between gap-2">{billingPlans[key].name}{current?.subscribed && plan === key && <CheckCircle2 className="h-5 w-5 text-primary" />}</CardTitle></CardHeader>
      <CardContent className="space-y-5"><div><span className="text-3xl font-semibold">R$ {billingPlans[key].amount}</span><span className="text-sm text-muted-foreground">/mês</span></div>
      <Button className="w-full" variant={key === 'pro' ? 'default' : 'outline'} disabled={!billing.canBill || !!busy || billing.isPending || !!billing.error || !!hasSubscription} onClick={() => void open(key)}>{busy === key ? 'Abrindo…' : current?.subscribed && plan === key ? 'Plano atual' : 'Assinar ' + billingPlans[key].name}</Button></CardContent>
    </Card>)}</div>
    <p className="flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="h-4 w-4 shrink-0" />Pagamento seguro pela Stripe. Cobrança mensal em reais.</p>
    {hasSubscription && <p className="text-sm text-muted-foreground">Gerencie seu cartão, suas faturas, a troca de plano ou o cancelamento em Gerenciar assinatura.</p>}
  </div>;
}
