
# Plano: BeautyFlow AI (reconstrução completa)

Escopo enorme. Vou propor uma estrutura clara e executar em **fases sequenciais**, validando cada uma antes da próxima. Por favor confirme antes de eu começar — quero alinhar prioridades e evitar retrabalho.

## Decisões importantes (preciso de confirmação)

1. **Estado atual da base**: já existem tabelas `salao`, `cliente`, `servico`, `profissional`, `agendamento`, `pacote`, `pacote_cliente`, `salao_user`, `user_roles` (com enum `app_role` = admin/etc) e funções `has_salao_access`, `is_admin`, etc. **Posso reaproveitar** (recomendado — evita migrar dados) ou **dropar tudo** e recriar conforme MIGRATION.md do repo. Reaproveitar exige:
   - Adicionar tabela `app_config` (singleton).
   - Estender enum `app_role` com `super_admin`, `operacional`, `profissional`, `recepcao`.
   - Adicionar colunas: `salao.trial_ate`, `salao.status_cobranca`, `salao.valor_plano`, `salao.ultimo_acesso`, `salao.slug` (já existe), `salao.cor_primaria` (já existe).
   - Criar funções `is_super_admin()`, `current_salao_id()`.
   - Renomear `user_roles.role` para usar enum estendido + adicionar `salao_id` nullable.
   - **Vou reaproveitar** salvo objeção sua.

2. **Categorias de serviço**: enum já existe (`servico_categoria_enum`). Vou confirmar valores e estender se faltar Cabelo/Unhas/Estética/Maquiagem/Massagem.

3. **Pagamentos**: spec diz "mock — cria pacote_cliente + cobranca futura". Vou **mockar** (sem Stripe/Paddle). Banner suspenso bloqueia rotas exceto `/app/configuracoes` aba Cobrança.

4. **Acesso ao repo `luisbedinot/beautyflow-ai`**: não tenho acesso direto ao GitHub do repo via tool (só posso buscar arquivos públicos via fetch_website / cross_project). Vou **buscar páginas-chave do repo via fetch_website** durante a Fase 0 para entender layouts exatos. Se algo for ambíguo, vou inferir do spec e seguir.

## Fases

### Fase 0 — Inspeção do repo + decisões de schema
- Buscar README.md e MIGRATION.md do repo via fetch_website.
- Listar `src/routes/` e `src/pages/` do repo para mapear layouts.
- Apresentar diff de schema (o que adicionar) antes de migrar.

### Fase 1 — Schema + RLS + helpers
- Migration única adicionando: `app_config`, colunas billing em `salao`, enum estendido em `app_role`, `user_roles.salao_id`, funções `is_super_admin()` e `current_salao_id()`.
- Seed: `app_config` com `super_admin_emails: ["luis.bedinot@gmail.com"]`.
- Atualizar RLS de todas as tabelas para incluir `is_super_admin() OR has_salao_access(...)`.

### Fase 2 — Design system + componentes base
- `src/styles.css`: tokens `--brand` (#f43f5e), `--brand-master`, `--surface`, `--sidebar-bg` em oklch.
- Componentes: `PageHeader`, `KpiCard`, `DataTable`, `FormDialog`, `TrialBanner`, `SuperAdminGuard`, `TenantGuard`.
- Sidebars: `SidebarTenant`, `SidebarMaster` (vermelha), `SidebarDemo`.

### Fase 3 — Auth + landing pública
- `/` — LandingPage (hero, features saloes, pricing R$39/79/149).
- `/entrar`, `/esqueci-senha`, `/reset-senha`, `/trocar-senha` (Lovable Cloud Auth + Google).
- Após signup → `/app/onboarding`.

### Fase 4 — Layouts protegidos
- `_app.tsx` (TenantLayout + TenantGuard + TrialBanner).
- `_master.tsx` (SuperAdminGuard + sidebar vermelha).
- `_demo.tsx` (sem auth, com seed mockado e banner).

### Fase 5 — Onboarding multi-step
- 5 steps em `/app/onboarding`: Dados → Branding → Equipe → Serviços por categoria + primeiro pacote → Confirma trial 14d.

### Fase 6 — Tenant `/app/*`
- Dashboard, Agendamentos (calendário), Clientes (+ficha c/ histórico), Serviços, Profissionais, Pacotes, Financeiro, Relatórios, AIGrowth (shell chatbot mockado), Equipe, Configurações (Tabs: Salão/Equipe/Aparência/Cobrança).

### Fase 7 — Master `/master/*`
- listaSaloes, novoSalao, painel (MRR/churn/cadastros).
- Ações: suspender/reativar/cancelar/login_as.

### Fase 8 — Demo `/demo/*`
- Seed em `src/lib/demo-seed.ts` (nomes BR, serviços realistas, dados últimos 30 dias).
- Páginas: Dashboard, Agendamentos, Clientes, Serviços, Pacotes — leem do seed, não do DB.

### Fase 9 — Páginas públicas por salão
- `/agendar/:slug` — cliente escolhe serviço + profissional + horário.
- `/pacotes/:slug` — vitrine de pacotes com botão Comprar (mock).
- Server functions públicas (`createServerFn`) usando `supabaseAdmin` filtrado por slug.

### Fase 10 — Polish + pendências
- Listagem do que ficou faltando (pagamento real, email transacional, etc).

## Detalhes técnicos

- **Roteamento**: file-based em `src/routes/` (`_master.tsx`, `_app.tsx`, `_demo.tsx`, `agendar.$slug.tsx`, `pacotes.$slug.tsx`).
- **Dados**: server functions (`createServerFn` + `requireSupabaseAuth`) para tudo autenticado; admin client para rotas públicas e `/master/*`.
- **Estado**: TanStack Query com `ensureQueryData` em loaders + `useSuspenseQuery` em componentes.
- **Forms**: react-hook-form + zod.
- **Auth**: email/senha + Google (broker Lovable).
- **Multi-tenant**: hook `useSalao` já existente, estendido para super_admin (pode trocar salão).

## Tamanho realista

Isso é **20-40 arquivos novos** e várias horas de trabalho mesmo em batch paralelo. Sugiro:

- **Opção A** (recomendada): você aprova o plano, eu executo Fases 0-3 nesta rodada, paro e mostro funcionando. Você revisa e pede para continuar com 4-6, depois 7-10.
- **Opção B**: eu faço tudo de uma vez, mas com maior risco de bugs e sem chance de você corrigir rumo no meio.

**Qual opção prefere?** E confirma reaproveitar o schema existente?
