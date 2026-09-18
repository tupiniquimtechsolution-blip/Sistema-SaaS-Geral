# DEPLOYMENT RELEASE MATRIX

Data: 2026-09-18 · **ATUALIZADA (fechamento do produto — nova semântica)** ·
Branch `freebuff/big-master-wave-01-monorepo`
Estados: PASS · FAIL · BLOCKED · NOT RUN · MISSING · NOT READY · OPTIONAL ·
NOT DEPLOYED (honestos — nenhum PASS sem execução).

## Semântica (decisão do owner)

| Coluna | Significado |
|---|---|
| CODE_READY | build/typecheck/segredos/contratos OK — independe de hosting |
| LOCAL_PREVIEW | preview local HTTP provado |
| TEMP_REMOTE_PREVIEW | deployment Vercel temporário — OPCIONAL (não é requisito) |
| CLOUDFLARE_READY | pronto para o mapping do migration plan |
| COMMERCIAL_READY | pronto para receber tenants (branding/plano/domínio manual) |
| FINAL_HOSTING | publishing definitivo — wave Cloudflare futura |

Projetos Vercel dedicados por vertical: **NOT REQUIRED**. Remote preview do
central verificado pelo owner: commit 657fb86 → READY, HTTP 200, title
"Tupiniquim SaaS — Plataforma".

**CLOUDFLARE (workers.dev, 2026-09-18):** bakery/pet/restaurant/heavy-machinery
+ platform deployados e validados (gates HTTP+identidade PASS; URLs e versions
em docs/CLOUDFLARE_WORKER_MATRIX.md). MetalArt: BLOCKED_STATIC_ASSET_LIMIT no
caminho temporary (deploy durável do owner cobre). Platform build final com
VITE_VERTICAL_PREVIEW_URLS reais → 5/5 cards apontando demos Cloudflare;
cards bloqueados sem link fake. DNS/custom domains: NOT EXECUTED. Vercel:
preservado (rollback).

| APP | SOURCE | CODE_READY | LOCAL_PREVIEW | TEMP_REMOTE_PREVIEW | CLOUDFLARE_READY | COMMERCIAL_READY | FINAL_HOSTING | BLOCKER |
|---|---|---|---|---|---|---|---|---|
| **Platform** | apps/platform (control plane completo) | PASS (build+typecheck+secret scan) | PASS (vite preview: GET / = 200, title plataforma, assets 200) | **PASS** — deployment do commit 657fb86: READY, GET / = 200, title "Tupiniquim SaaS — Plataforma" (owner-verified) | PASS | PASS | NOT DEPLOYED | — |
| **Bakery** | apps/bakery (subtree PadocaAppPremium) | PASS | PASS | OPTIONAL (central já a publicou com HTTP 200 até o cutover) | PASS | PASS (integração e2e: live read + tenants QA) | NOT DEPLOYED | — |
| **Pet** | apps/pet | PASS | PASS | OPTIONAL | PASS | PASS (integração SaaS incremental, padrão bakery) | NOT DEPLOYED | — |
| **Restaurant** | apps/restaurant | PASS | PASS | OPTIONAL | PASS | PASS (idem) | NOT DEPLOYED | — |
| **MetalArt** | apps/metalart (premium PR#1) | PASS | PASS | OPTIONAL | PASS | PASS (idem — vertical principal) | NOT DEPLOYED | — |
| **Heavy Machinery** | apps/heavy-machinery | PASS | PASS | OPTIONAL | PASS | PASS (idem) | NOT DEPLOYED | — |
| **Salon** | — (sem material importável) | BLOCKED | — | — | — | NOT READY | — | branch chatgpt/integrate-salon-vanessa NÃO existe no remote (auditado via fetch --prune); nenhum código Salon no monorepo — Vanessa Braz = futuro TENANT/template do vertical salon, nunca vertical separado |
| **Religious House** | — | EXTERNAL_BLOCKED / POST-MVP IMPORT | — | — | — | — | — | BLOCKED_FREEBUFF_REPOSITORY_ACCESS_TEMPLO (nenhum material local) |
| **LED** | — (só README) | DEFERRED_EXTERNAL_SOURCE | — | — | — | — | — | BLOCKED_SOURCE_REPOSITORY_LED |

## Testes da plataforma (preservados — 2026-09-18)

saas-core 86/86 · database 3/3 · auth 3/3 · tenancy 13/13 — PASS.
Cross-tenant DB 58/58 PASS · Storage 42/42 PASS · PUBLIC UPSERT PASS ·
Bakery live read PASS — NENHUMA regressão (nenhuma alteração de backend nesta
wave; DATABASE MUTATIONS: NONE).

## Secret scan

0 marcadores proibidos em todos os dists (ver docs/VERCEL_ENV_MATRIX.md).

## Regras de promoção

Production promotion EXIGE: preview HTTP PASS (prova real) + gates do vertical
+ env matrix aplicada + aprovação do owner. Nenhuma promoção executada nesta
wave (PRODUCTION DEPLOYS: NONE).
