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
| sistema-saa-s-geral | tupiniquimtechsolution-blip/Sistema-SaaS-Geral | freebuff/big-master-wave-01-monorepo | repo root (framework=null) | — (nenhum antes de 95fb0a6) | — | READY mas **GET / = 404** (usário-facing FAIL) | n/a | vercel.app default | **MISCONFIGURED** | Após 95fb0a6 (`vercel.json` → bakery): redeploy Preview e validar HTTP; Fase C do cutover (§9 do MASTER TOPOLOGY); depois Fase D = repontuar este projeto para apps/platform |

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
| apps/platform | tupiniquim-platform | PASS (vite, 147 kB) | PASS | nenhuma (tela única) | NÃO | `VITE_VERTICAL_PREVIEW_URLS` (não-secret) |
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
