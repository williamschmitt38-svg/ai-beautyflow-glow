# Architecture rules

- Salon ownership RLS validates the authenticated email with `auth.jwt()` rather than querying `auth.users` as the caller, because managed authentication tables are not accessible through application roles.
- Salon SELECT policies must allow the authenticated owner to read a newly inserted salon before membership exists, because onboarding requests the inserted row before creating `salao_user` membership.
- Customer registration uses `public.cliente` with salon-scoped authenticated RLS; do not expose managed auth tables or add anonymous profile inserts as a workaround for ownership-policy errors.