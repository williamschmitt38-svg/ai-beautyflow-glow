import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { authorizeBilling, billingCustomer, stripeRequest, syncBilling } from './billing.server';
import { billingPlans } from './billing-plans';
const salonInput = z.object({ salaoId: z.string().uuid() });
export const checkSalonSubscription = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth]).inputValidator(salonInput)
  .handler(async ({ data, context }) => {
    const salon = await authorizeBilling(context.supabase, data.salaoId);
    const key = process.env['STRIPE_SECRET_KEY'];
    if (!key) throw new Error('A Stripe ainda não está configurada.');
    return syncBilling(key, salon);
  });
export const createSalonCheckout = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth]).inputValidator(salonInput.extend({ plan: z.enum(['starter', 'pro', 'enterprise']) }))
  .handler(async ({ data, context }) => {
    const salon = await authorizeBilling(context.supabase, data.salaoId);
    const key = process.env['STRIPE_SECRET_KEY'];
    if (!key) throw new Error('A Stripe ainda não está configurada.');
    const current = await syncBilling(key, salon);
    if (current.canManage && !['canceled', 'incomplete_expired'].includes(current.status)) throw new Error('Já existe uma assinatura. Use Gerenciar assinatura para alterá-la.');
    const customer = await billingCustomer(key, salon);
    const origin = new URL(getRequest().url).origin;
    const session = await stripeRequest(key, 'checkout/sessions', {
      mode: 'subscription', customer: customer.stripe_customer_id,
      'line_items[0][price]': billingPlans[data.plan].priceId, 'line_items[0][quantity]': '1',
      'subscription_data[metadata][salao_id]': salon.id, 'subscription_data[billing_mode][type]': 'flexible',
      'metadata[salao_id]': salon.id, client_reference_id: salon.id,
      success_url: `${origin}/app/configuracoes?tab=cobranca&payment=success`,
      cancel_url: `${origin}/app/configuracoes?tab=cobranca&payment=cancel`,
      locale: 'pt-BR',
    }, `bf-checkout-${salon.id}-${data.plan}-${Math.floor(Date.now() / 1800000)}`);
    return { url: session.url as string };
  });
export const createSalonPortal = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth]).inputValidator(salonInput)
  .handler(async ({ data, context }) => {
    const salon = await authorizeBilling(context.supabase, data.salaoId);
    const key = process.env['STRIPE_SECRET_KEY'];
    if (!key) throw new Error('A Stripe ainda não está configurada.');
    const customer = await billingCustomer(key, salon);
    const config = await stripeRequest(key, 'billing_portal/configurations', {
      'business_profile[headline]': 'Assinatura BeautyFlow',
      'features[payment_method_update][enabled]': 'true', 'features[invoice_history][enabled]': 'true',
      'features[subscription_cancel][enabled]': 'true', 'features[subscription_cancel][mode]': 'at_period_end',
    }, 'beautyflow-portal-v1');
    const session = await stripeRequest(key, 'billing_portal/sessions', { customer: customer.stripe_customer_id, configuration: config.id, return_url: `${new URL(getRequest().url).origin}/app/configuracoes?tab=cobranca`, locale: 'pt-BR' });
    return { url: session.url as string };
  });
