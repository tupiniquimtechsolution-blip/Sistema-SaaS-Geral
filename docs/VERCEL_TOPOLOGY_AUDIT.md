# VERCEL TOPOLOGY AUDIT

Data: 2026-09-18 · Branch `freebuff/big-master-wave-01-monorepo` · HEAD 95fb0a6
Fontes: repositório auditado diretamente (package.json/vite/router/env de cada
app); estado do dashboard Vercel relatado pelo owner externamente (não
manipulável por este agente — nenhuma credencial Vercel no sandbox).

## TEAM

| ITEM | ESTADO |
|---|---|
| Nome atual (legado/organizacional) | Caboclo Tupinambá e Flecha Dourada (relatado) |
| Alvo conceitual | Tupiniquim Tech Solution / Tupiniquim SaaS |
| Rename pelo agente | **BLOCKED_VERCEL_TEAM_RENAME_PERMISSION** — sem credencial/permissão Vercel no sandbox; NÃO criar team duplicado |

## PROJETO EXISTENTE (relatado pelo owner)

| PROJECT | REPOSITORY | BRANCH | ROOT | BUILD | OUTPUT | PREVIEW | PRODUCTION | DOMAIN | STATUS | ACTION |
|---|---|---|---|---|---|---|---|---|---|---|
| sistema-saa-s-geral | tupiniquimtechsolution-blip/Sistema-SaaS-Geral | freebuff/big-master-wave-01-monorepo | repo root (framework=null) | `npm run build:platform` (vercel.json, commit cutover) | `apps/platform/dist` | Deployment b8babe9 **READY + GET / = 200** (owner-confirmed, URL `sistema-saa-s-geral-h0ktuxbaf.vercel.app`) — mas servia **Bakery** pois o vercel.json ainda apontava para `build:bakery` | n/a (NOT PROMOTED) | vercel.app default | **CUTOVER EXECUTADO NO REPO** — vercel.json repontado para platform; validar o NOVO deployment (branch preview) com `preview-http-gate.ts deployment:<url>`; produção só depois de promoção explícita | Novo deployment do commit do cutover deve ser validado por URL de deployment (não pelo production alias); criação do `saas-bakery` dedicado em docs/VERCEL_OWNER_ACTIONS.md |

## PROJETOS ALVO (a criar pelo owner — comandos/valores reais auditados no repo)

| PROJECT | REPOSITORY | BRANCH | ROOT | BUILD | OUTPUT | PREVIEW | PRODUCTION | DOMAIN | STATUS | ACTION |
|---|---|---|---|---|---|---|---|---|---|---|
| saas-bakery | Sistema-SaaS-Geral | freebuff/big-master-wave-01-monorepo | repo root | `npm run build:bakery` | `apps/bakery/dist` | alvo | NOT READY (gates exigidos) | vercel.app → futuro domínio do tenant | BUILD PASS local | Criar projeto; validar HTTP 200 + render; depois Fase D do cutover |
| saas-pet | Sistema-SaaS-Geral | idem | repo root | `npm run build:pet` | `apps/pet/dist` | alvo | NOT READY | — | BUILD PASS local | Criar projeto; validar HTTP |
| saas-restaurant | Sistema-SaaS-Geral | idem | repo root | `npm run build:restaurant` | `apps/restaurant/dist` | alvo | NOT READY | — | BUILD PASS local | Criar projeto; validar HTTP |
| saas-metalart | Sistema-SaaS-Geral | idem | repo root | `npm run build --workspace=apps/metalart` | `apps/metalart/dist` | alvo | NOT READY | — | BUILD PASS local | Criar projeto; validar HTTP |
| saas-heavy-machinery | Sistema-SaaS-Geral | idem | repo root | `npm run build:heavy-machinery` | `apps/heavy-machinery/dist` | alvo | NOT READY | — | BUILD PASS local | Criar projeto; validar HTTP |
| saas-religious-house | — | — | — | — | — | — | — | — | **MISSING_APP** | Nada a criar (BLOCKED_FREEBUFF_REPOSITORY_ACCESS_TEMPLO) |
| saas-salon | — | — | — | — | — | — | — | — | **MISSING_APP** | Nada a criar (sem implementação) |
| saas-led | — | — | — | — | — | — | — | — | **MISSING_APP** | Nada a criar (BLOCKED_SOURCE_REPOSITORY_LED) — NÃO inventar |

## APPS AUDITADOS NO MONOREPO (evidência local)

| APP | package.json | BUILD (local) | TYPECHECK | ROUTER | SPA REWRITES? | ENV VITE_* consumida |
|---|---|---|---|---|---|---|
| apps/platform | tupiniquim-platform | PASS (vite, 162 kB — control plane completo) | PASS | hash routing interno (6 views; rotas após /#/) | NÃO | `VITE_VERTICAL_PREVIEW_URLS` (não-secret) |
| apps/bakery | tupiniquim-bakery | PASS (vite) | PASS | HashRouter | NÃO | `VITE_DEMO_MODE` (adapter; live path via packages/tenancy) |
| apps/pet | tupiniquim-pet | PASS (vite) | PASS | HashRouter | NÃO | nenhuma |
| apps/restaurant | tupiniquim-restaurant | PASS (vite) | PASS | HashRouter | NÃO | nenhuma |
| apps/metalart | tupiniquim-metalart | PASS (vite) | PASS | HashRouter | NÃO | nenhuma |
| apps/heavy-machinery | tupiniquim-heavy-machinery | PASS (vite) | PASS | HashRouter | NÃO | nenhuma |
| apps/religious-house | AUSENTE | — | — | — | — | — |
| apps/led | AUSENTE (só README) | — | — | — | — | — |

**Nota SPA:** todos os apps usam HashRouter → rotas client-side vivem após `/#/`
e são servidas de `/`; nenhum rewrite/fallback é necessário (auditado antes de
configurar — nenhum catch-all cego adicionado).

## Deployment protection / domains / aliases

Nenhum domínio custom registrado nesta Wave (§16 do prompt: preparação apenas).
Proteção de deployment e aliases ficam registrados como FUTURE no release
matrix. Nenhuma promoção de Production executada.

## HTTP VALIDATION GATE (evidência §29)

Harness durável: `scripts/preview-http-gate.ts` (sem secrets; alvos por CLI ou
aliases padrão). **DIAGNÓSTICO CORRIGIDO (2026-09-18):** a leitura anterior de
0/10 (404 nos aliases) era válida para AQUELE momento, mas a interpretação
"redeploy não publicado" ficou OBSOLETA — o owner confirmou externamente que
o deployment do commit b8babe9 ficou **READY com GET / = 200**
(URL `sistema-saa-s-geral-h0ktuxbaf.vercel.app`), porém servia
**Fornalha/Bakery** porque o `vercel.json` do commit anterior ainda apontava
para `npm run build:bakery` / `apps/bakery/dist`. Evidência Bakery pré-cutover
preservada: HTTP 200 + assets 200 provados pelo owner nessa URL.

**Cutover executado no repo:** `vercel.json` → `npm run build:platform` /
`apps/platform/dist` (build + typecheck locais PASS; title da dist:
"Tupiniquim SaaS — Plataforma", zero markers de vertical como identidade).

**Regras do harness (target kinds distintos):** `PRODUCTION_ALIAS` (não
representa a branch preview; plataforma exige promoção), `BRANCH_PREVIEW` e
`DEPLOYMENT_URL`. O MASTER PASS desta branch usa somente
BRANCH_PREVIEW/DEPLOYMENT_URL — validar o próximo deployment do commit do
cutover via `bun scripts/preview-http-gate.ts deployment:<url>` (GET / = 200,
title plataforma, assets 200). PRODUCTION permanece NOT PROMOTED.
