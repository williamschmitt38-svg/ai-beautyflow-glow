# Architecture rules

- Subscription display names may differ from persisted plan keys; preserve database enums and Stripe price identifiers when renaming a plan to avoid disrupting existing billing.
- Landing brand and pricing colors use dedicated semantic CSS tokens so presentation updates do not change the authenticated app theme.
- App and demo flex content must use min-w-0 with local horizontal scrolling for wide tools so the page shell stays within mobile and tablet viewports.

- Service categories are salon-scoped rows linked through servico.category_id with a tenant-consistent foreign key; deleting a category clears the link, preserving services, and populated tabs derive from current service assignments rather than the legacy enum.

- Salon ownership RLS validates the authenticated email with `auth.jwt()` rather than querying `auth.users` as the caller, because managed authentication tables are not accessible through application roles.
- Salon SELECT policies must allow the authenticated owner to read a newly inserted salon before membership exists, because onboarding requests the inserted row before creating `salao_user` membership.
- Customer registration uses `public.cliente` with salon-scoped authenticated RLS; do not expose managed auth tables or add anonymous profile inserts as a workaround for ownership-policy errors.
- Salon billing uses a distinct Stripe customer per salon and server-only billing records; owner authorization precedes privileged reads and writes to prevent cross-salon subscription access.
- Billing status and plan updates must come from verified Stripe subscription state; a database trigger prevents tenant self-activation or trial extension, while preserving administrative suspension.
- Subscription state is reconciled on authenticated salon load, window focus and every minute without webhooks; offline renewal changes are discovered on the next reconciliation.
- Annual billing uses separate yearly Stripe prices on the same products; plan resolution maps both monthly and annual price IDs so existing subscriptions keep working.
- AI features call the AI Gateway only from authenticated server functions that verify the salon's paid plan, so prompts and salon data never run in the browser.
- AI Growth "contacted" marks are keyed by opportunity plus the client's last-visit (or year), so a new visit or new cycle surfaces the client again.
- Salon schedule rules live in src/lib/agenda.ts (resolverJanela) and are applied server-side in public booking; salon-wide closures are agenda_bloqueio rows with null profissional_id, so one table covers holidays and individual days off.
- Enterprise-only salon fields (white-label flag, webhook URL) are guarded by a database trigger on salao, and webhooks are dispatched only server-side, so tenants cannot enable them by editing rows or exposing URLs to the browser.
- Salon logos live in a private, salon-scoped storage bucket and are stored as long-lived signed URLs, because the workspace blocks public buckets.
