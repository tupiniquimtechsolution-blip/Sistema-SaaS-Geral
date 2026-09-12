# CRM Tupiniquim — SaaS Integration Strategy

> Auditoria de compatibilidade controlada. Nenhuma linha do CRM original foi alterada. Nenhum big-bang rewrite. Documento gerado na Big Master Wave 01 (2026-09-12) a partir do snapshot `main` SHA `7bc089a2018a6c6c38c85cb8c8a7e5ab0711150a`.

## CURRENT STATE

- Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, NextAuth 5 (beta.32), Prisma 7 (client provider `prisma-client`, datasource PostgreSQL), Zod 4, pnpm 11, Vitest 4, Playwright.
- App Next.js completo com módulos: leads, pipeline, companies, customers, catalog, proposals, activities, automations, integrations, privacy/LGPD, AI assist, imports/exports, tickets, renewals, upsells.
- Testes existentes: unit (Vitest), integration (seed + tenant isolation check), E2E (Playwright, incluindo accessibility e privacy), load smoke, ops scripts (backup, restore drill, production check, index check).
- `.env.example` existe no repo de origem (não lido nesta sessão por política do ambiente — a auditoria não dependia dele).
- Governança própria: AGENTS.md, SECURITY.md, 8 ADRs, runbooks (backup, incidentes LGPD, migração/rollback, produção), checkpoints de fases 0–8, auditorias toolbox.

## TARGET STATE

CRM Tupiniquim como **APP HORIZONTAL** dentro do Sistema-SaaS-Geral:

- consome o SaaS Core (Tenant, Auth, Membership, RBAC, Permissions, Entitlements, Billing, Audit, Integrations, Observability, RLS/tenant isolation);
- permanece comercializável de forma independente para tenants de qualquer vertical;
- sem fork por cliente; cada cliente = novo tenant no SaaS Core.

## STACK

| Camada | CRM atual | SaaS Core monorepo |
| --- | --- | --- |
| Frontend | Next.js 16 / React 19 | Vite + React 18 (verticais) |
| Auth | NextAuth 5 beta (credentials + sessions versionadas) | Supabase Auth (planejado) |
| DB | PostgreSQL via Prisma 7 | PostgreSQL via Supabase (migrations SQL) |
| RBAC | permission matrix em código (`src/modules/shared/tenant.ts`) | contracts em `packages/saas-core` + RLS |
| Tenant | `Organization` + `Membership` (Prisma) | `tenants` + `memberships` (Supabase/RLS) |
| PM | pnpm 11 | npm workspaces |

## CURRENT TENANCY MODEL

- `Organization` (id cuid, slug único, active) é o tenant.
- `Membership` (organizationId, userId, teamId, role enum OWNER/ADMIN/MANAGER/SALES/SUPPORT/VIEWER, status INVITED/ACTIVE/SUSPENDED) liga User↔Organization, com unique(organizationId, userId).
- Todas as entidades comerciais carregam `organizationId` com FK e índices.
- `resolveCurrentActor()` / `getCurrentActor()` resolvem sessão → membership ATIVA → organização ativa → usuário ativo → sessionVersion consistente, retornando `TenantActor` ou redirect para login.
- `assertTenant(actor, organizationId)` bloqueia acesso fora da organização ativa.
- `tenantWhere(actor)` padroniza filtros Prisma por organização.
- DEMO_MODE devolve ator demo em dev (nunca em produção).

## SAAS TENANCY MAPPING

| CRM | SaaS Core |
| --- | --- |
| `Organization` | `Tenant` (vertical = `horizontal-crm`) |
| `Organization.slug` | `Tenant.slug` / `tenant_domains` |
| `Organization.active` | `Tenant.status` |
| `Membership` | `memberships` |
| `Team` | sem equivalente obrigatório no MVP core (opcional futuro) |
| `organizationId` nas tabelas | `tenant_id` |

Estratégia: **manter `organizationId` como nome de coluna dentro do CRM é aceitável a princípio**; a integração pode mapear `organizationId === tenantId` sem renomear 60+ tabelas, desde que o valor do id seja compartilhado/provisionado pelo SaaS Core.

## AUTH CURRENT STATE

- NextAuth 5 beta com credentials + password hash (bcryptjs), sessions em tabela com `sessionVersion` para invalidação global.
- PasswordResetToken com expiração/uso único, vínculo opcional de organização.
- Demo mode flag segura (bloqueada em produção).

## AUTH INTEGRATION STRATEGY

Fase 1 (recomendada): manter NextAuth no CRM, mas validar membership contra o SaaS Core (single source of truth para tenants/memberships). O CRM passa a aceitar apenas usuários com membership ativa criada no SaaS Core.

Fase 2 (futura): migrar para Supabase Auth e eliminar password store próprio; CRM consome sessão Supabase. Requer gate de paridade (recuperação de senha, invalidação, MFA-ready) antes do switch.

## RBAC CURRENT STATE

- Roles: OWNER, ADMIN, MANAGER, SALES, SUPPORT, VIEWER.
- Permission matrix em código com wildcard `*` para OWNER/ADMIN; `can()`, `assertPermission()`, `assertTenant()` server-side.
- OWNER/ADMIN com `*` é mais amplo que o modelo granular do SaaS Core (permissions explícitas).

## RBAC MAPPING

| CRM Role | SaaS Core sugerido |
| --- | --- |
| OWNER | owner |
| ADMIN | admin |
| MANAGER | manager |
| SALES | orders_manager (equivalente comercial: novo role CRM `sales` no core) |
| SUPPORT | support |
| VIEWER | viewer |

Regra de integração: adicionar no SaaS Core permissões CRM-granulares (ex.: `crm.leads.read`, `crm.pipeline.write`, `crm.proposal.approve`) em vez de herdar o wildcard `*`; o CRM mantém sua matrix local como *consumer* das permissions do core durante a transição (strangler).

## DATABASE STRATEGY

- Hoje: Prisma migrations próprias (`prisma/migrations`, 4+ versões) contra PostgreSQL dedicado.
- Alvo: o CRM não deve ter schema concorrente no mesmo banco do SaaS sem coordenação. Duas opções:
  1. **Banco lógico compartilhado**: schema separado no mesmo PostgreSQL do Supabase, com `tenant_id` sincronizado e RLS própria para as tabelas do CRM.
  2. **Banco dedicado por fase**: manter DB próprio do CRM até reconciliação Supabase completa, com tenant id externalizado no SaaS Core.

Recomendação: opção 1 após reconciliação; opção 2 durante transição. **Nunca rodar migrations Prisma diretamente no banco remoto do SaaS sem revisão** (mesma regra do item Supabase da wave).

## PRISMA ↔ SUPABASE/POSTGRES STRATEGY

- Prisma `datasource db` já é PostgreSQL — compatível com Supabase (connection string pooler).
- Usar `@prisma/adapter-pg` (já presente) para serverless-friendly connections.
- RLS do Supabase só se aplica a conexões com JWT de usuário; o CRM usa conexão server-side Prisma — portanto **a camada de autorização do CRM continua sendo a permission matrix + tenantWhere** até adoção de Supabase Auth. Registrar isso como decisão explícita de segurança.
- `supabase db` migrations (SQL) e `prisma migrate` (SQL) nunca devem escrever no mesmo schema sem dono definido.

## ENTITLEMENTS

- CRM atual: sem cobrança/planos (produto próprio interno).
- Alvo: CRM como app horizontal contratável por tenants de qualquer vertical → entitlements do core: `crm.enabled`, limites `crm.users.max`, `crm.seats`, `crm.ai.requests` etc.
- Feature gating server-side via `assertEntitlement` do core antes das services do CRM.

## BILLING

- CRM atual: nenhum billing.
- Alvo: BillingProvider abstraction do core; CRM é item de catálogo/plano, não tem provider próprio.

## AUDIT

- CRM atual: `AuditLog` próprio (organizationId, actorId, action, entityType, entityId, before/after JSON, requestId) — muito bom.
- Alvo: manter AuditLog do CRM para domínio comercial; sincronizar eventos privilegiados relevantes para o `audit_logs` do core (ou unificar via adapter), sem duplicar PII.

## OBSERVABILITY

- CRM atual: logger próprio (`src/lib/logger.ts`), health endpoint (`/api/health`), requestId no audit.
- Alvo: contrato de observability do core com tenant context; error provider abstraction. Baixo risco.

## DATA MIGRATION

- Schemas Prisma já normalizados com organizationId; migração de dados não precisa remapear ids se Organization.id virar Tenant.id.
- Seeds/ops scripts do CRM (backup, restore, production-check, tenant isolation) são reutilizáveis e devem entrar nos gates CI do monorepo quando o CRM for importado.

## WHAT CAN BE REUSED

- Todo o modelo Prisma e services (organization-scoped desde a origem).
- current-actor/tenant helpers (mapa direto para TenantActor do core).
- Permission matrix como consumer de permissions.
- AuditLog, runbooks, testes E2E/unit/integration, CI (dependabot, codeql), PWA, LGPD/privacy modules (consent, correction, retention, incidents).

## WHAT MUST CHANGE

- Origem de verdade de Tenant/Membership passa a ser o SaaS Core (ou adapter sincronizado) — evitar dual-writes inconsistentes.
- Roles: adicionar mapeamento/permissions CRM no core; remover wildcard `*` para ADMIN na integração final.
- Package name/manifest para entrar no workspace do monorepo sem conflito (pnpm dentro de npm workspaces precisa de decisão: converter para npm ou manter pnpm isolado — ver BLOCKERS).
- README/docs do CRM passam a referenciar o monorepo canônico.

## SECURITY RISKS

1. **Dual-writes de membership/tenant** durante transição → definir single source of truth antes de qualquer sincronização.
2. **Wildcard RBAC (`*`)** para ADMIN/OWNER amplia blast radius; mitigar com permissions explícitas no core.
3. **RLS não aplicável à conexão Prisma server-side** → isolamento depende do código (`assertTenant`/`tenantWhere`); manter testes negativos (`scripts/check-tenant-isolation.ts`) como gate obrigatório.
4. **Secrets**: `.env.example` não lido por política; ao importar, validar que nenhum secret real vem junto (CI hygiene já rejeita dotenv).
5. **xlsx via CDN (sheetjs tarball)** no package.json — supply chain: avaliar pin/registry próprio na importação.

## COUPLING RISKS

- Next.js 16 + React 19 no mesmo monorepo que apps Vite/React 18: OK se isolados por workspace, mas ferramentas de root (typecheck/lint/test) precisam respeitar tsconfig por pacote.
- pnpm vs npm: dois gerenciadores no mesmo repo causam double-lockfiles e hoisting inconsistente. Decidir conversão npm ou sub-workspace pnpm dedicado.
- Prisma migrations vs supabase migrations no mesmo Postgres: risco de corrida/colisão — separar por schema/dono.

## PROPOSED APP LOCATION

- `apps/crm-tupiniquim` (app horizontal executável no monorepo), consumindo `packages/saas-core`.
- Alternativa temporária: permanecer em repo próprio até reconciliação Supabase, com integração por adapter. **A wave atual NÃO importou o CRM** — apenas auditou.

## MIGRATION PHASES

1. **Fase A (preparação)**: manter CRM em repo original; definir mapeamento Organization↔Tenant e permissions CRM no core; nenhum código alterado.
2. **Fase B (import controlado)**: subtree/snapshot para `apps/crm-tupiniquim`, package name normalizado, gates locais (lint/typecheck/test/build) verdes no monorepo.
3. **Fase C (tenant integration)**: membership do CRM lida do SaaS Core (read-only); CRM continua com auth próprio.
4. **Fase D (entitlements/billing)**: `crm.enabled` e limites via core; gating nas services.
5. **Fase E (auth consolidation)**: Supabase Auth substitui NextAuth após paridade comprovada; RLS habilitada nas tabelas do CRM com JWT.
6. **Fase F (hardening)**: cross-tenant negative tests no DB real, audit unificado, observability do core.

## BLOCKERS

- Reconciliação pendente entre `freebuff/big-master-wave-01-monorepo` (migrations SQL locais) e `chatgpt/supabase-vercel-foundation` (fundação já aplicada no Supabase real) — fora do escopo desta wave.
- Decisão pnpm↔npm para o workspace do monorepo.
- Credenciais/ambiente do Supabase real não disponíveis nesta sessão.

## NEXT EXACT ACTION

Após reconciliação do banco e decisão de package manager: executar Fase B (import controlado para `apps/crm-tupiniquim`) com gates completos, sem alterar o repo original do CRM.
