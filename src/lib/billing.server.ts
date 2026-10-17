import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { billingPlans, planForPrice } from "./billing-plans";

export async function authorizeBilling(db: SupabaseClient<Database>, id: string, userId: string) {
  const { data: allowed, error } = await db.from('salao_user').select('id').eq('salao_id', id).eq('user_id', userId).eq('role', 'owner').eq('ativo', true).limit(1);
  const { data: master } = await db.rpc('is_super_admin');
  if (error || (!allowed?.length && !master)) throw new Error('Somente o dono do salão pode gerenciar a assinatura.');
  const { data: salon, error: readError } = await db.from('salao').select('*').eq('id', id).single();
  if (readError || !salon) throw new Error('Salão não encontrado.');
  return salon;
}
export async function stripeRequest(key: string, path: string, params?: Record<string, string>, idempotency?: string): Promise<any> {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: params ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${key}`, 'Stripe-Version': '2025-08-27.basil', ...(params ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}), ...(idempotency ? { 'Idempotency-Key': idempotency } : {}) },
    body: params ? new URLSearchParams(params).toString() : undefined,
  });
  const result = await response.json() as any;
  if (!response.ok) {
    console.error('Stripe billing failed', response.status, result.error?.code, result.error?.type);
    throw new Error('Não foi possível acessar a cobrança na Stripe. Tente novamente ou contate o suporte.');
  }
  return result;
}
export async function billingCustomer(key: string, salon: Database['public']['Tables']['salao']['Row']) {
  const { supabaseAdmin: admin } = await import('@/integrations/supabase/client.server');
  const { data: existing, error } = await admin.from('salao_billing').select('*').eq('salao_id', salon.id).maybeSingle();
  if (error) throw new Error('Não foi possível consultar a assinatura.');
  if (existing) return existing;
  const customer = await stripeRequest(key, 'customers', { email: salon.owner_email || salon.admin_email, name: salon.nome_salao, 'metadata[salao_id]': salon.id }, `beautyflow-customer-${salon.id}`);
  const { error: saveError } = await admin.from('salao_billing').upsert({ salao_id: salon.id, stripe_customer_id: customer.id }, { onConflict: 'salao_id', ignoreDuplicates: true });
  if (saveError) throw new Error('Não foi possível salvar o cadastro de cobrança.');
  const { data: saved } = await admin.from('salao_billing').select('*').eq('salao_id', salon.id).single();
  if (!saved) throw new Error('Cadastro de cobrança indisponível.');
  return saved;
}
export async function syncBilling(key: string, salon: Database['public']['Tables']['salao']['Row']) {
  const { supabaseAdmin: admin } = await import('@/integrations/supabase/client.server');
  const { data: billing, error } = await admin.from('salao_billing').select('*').eq('salao_id', salon.id).maybeSingle();
  if (error) throw new Error('Não foi possível consultar a assinatura.');
  if (!billing) return { subscribed: false, status: 'not_started', plan: salon.plano, interval: 'month' as const, periodEnd: null, cancelAtPeriodEnd: false, canManage: false };
  const result = await stripeRequest(key, `subscriptions?customer=${encodeURIComponent(billing.stripe_customer_id)}&status=all&limit=100`);
  const candidates = result.data.filter((s: any) => s.metadata?.salao_id === salon.id && s.items.data.some((i: any) => planForPrice(i.price.id)));
  const sub = candidates.find((s: any) => ['active', 'trialing', 'past_due', 'unpaid'].includes(s.status)) || candidates[0];
  if (!sub) return { subscribed: false, status: 'not_started', plan: salon.plano, interval: 'month' as const, periodEnd: null, cancelAtPeriodEnd: false, canManage: false };
  const item = sub.items.data.find((i: any) => planForPrice(i.price.id));
  const found = planForPrice(item.price.id);
  if (!found) throw new Error('Plano de assinatura não reconhecido.');
  const { plan, interval } = found;
  const subscribed = ['active', 'trialing'].includes(sub.status);
  const status = subscribed ? 'ativo' : ['canceled', 'incomplete_expired'].includes(sub.status) ? 'cancelado' : 'inadimplente';
  const { error: saveError } = await admin.from('salao_billing').update({ stripe_subscription_id: sub.id, stripe_status: sub.status, synced_at: new Date().toISOString() }).eq('salao_id', salon.id);
  const { error: salonError } = await admin.from('salao').update({ plano: plan, valor_plano: interval === 'year' ? billingPlans[plan].annualAmount : billingPlans[plan].amount, status_cobranca: salon.status_cobranca === 'suspenso' ? 'suspenso' : status, ...(subscribed ? { trial_ate: null } : {}) }).eq('id', salon.id);
  if (saveError || salonError) throw new Error('Não foi possível atualizar o status da assinatura.');
  const end = item.current_period_end || sub.current_period_end;
  return { subscribed, status: sub.status as string, plan, interval, periodEnd: end ? new Date(end * 1000).toISOString() : null, cancelAtPeriodEnd: !!sub.cancel_at_period_end, canManage: true };
}
