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
