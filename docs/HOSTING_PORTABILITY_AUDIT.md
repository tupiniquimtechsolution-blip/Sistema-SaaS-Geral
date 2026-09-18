# HOSTING PORTABILITY AUDIT

Data: 2026-09-18 · Objetivo: garantir que a futura migração Vercel → Cloudflare
não exija reescrita. Veredito por componente, com evidência do código.

## Metodologia

Varredura de referências Vercel-specific em `apps/*/src` e `packages/*/src`:
`VERCEL_URL`, `@vercel/*`, `vercel.com/api` — **0 ocorrências** (auditado em
2026-09-18). Config de deploy isolada em `vercel.json` (infra, não código).

## Classificação por componente

| Componente | Estado | Evidência / Nota |
|---|---|---|
| apps/platform | **PORTABLE** | Vite estático; env própria `VITE_VERTICAL_PREVIEW_URLS`; zero runtime Vercel |
| apps/bakery | **PORTABLE** | Vite estático + HashRouter; consome apenas `VITE_*` (SUPABASE_URL/PUBLISHABLE_KEY/DEMO_MODE) |
| apps/pet · restaurant · metalart · heavy-machinery | **PORTABLE** | Vite estático + HashRouter; nenhuma `VITE_*` consumida |
| packages/saas-core · database · auth · tenancy | **PORTABLE** | Contratos puros + Supabase JS; zero acoplamento de hosting |
| Supabase backend | **PORTABLE (N/A)** | Backend gerenciado externo — independe do hosting do frontend |
| scripts/preview-http-gate.ts | **PORTABLE** | HTTP puro (fetch) — funciona contra qualquer host (Pages/Workers incluídos) |
| vercel.json | **NEEDS_ABSTRACTION (infra-only)** | Config de deploy Vercel; equivalente Cloudflare já mapeado no master plan — nenhuma mudança de código |
| Edge functions / middleware | **NENHUM EXISTE** | Não há código server-side acoplado — nada a portar |

## Riscos de lock-in

| Risco | Estado |
|---|---|
| Runtime API Vercel usada em app | NENHUM (0 referências) |
| Redirects/rewrites essenciais | NENHUM — HashRouter em todos os apps; `/` é a única entrada |
| Image/edge optimization propietária | NENHUMA usada |
| Variáveis de ambiente não-portáveis | NENHUMA — todas `VITE_*` padrão Vite |

## Veredito

**HOSTING PORTABILITY = PASS.** Todos os frontends são estáticos portáveis;
a migração Cloudflare (docs/CLOUDFLARE_MIGRATION_MASTER_PLAN.md) é operacional
(config de deploy + DNS), não de engenharia.
