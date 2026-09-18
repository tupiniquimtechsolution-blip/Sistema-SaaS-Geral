# DEPLOYMENT RELEASE MATRIX

Data: 2026-09-18 · Branch `freebuff/big-master-wave-01-monorepo` · HEAD 95fb0a6
Estados: PASS · FAIL · BLOCKED · NOT RUN · MISSING · NOT READY (honestos —
nenhum PASS sem execução; HTTP de preview só é PASS com prova real).

| APP | SOURCE | BUILD | TYPECHECK | PREVIEW (Vercel) | HTTP REAL | SUPABASE | PRODUCTION READY | BLOCKER |
|---|---|---|---|---|---|---|---|---|
| **Platform** (apps/platform — NOVO) | apps/platform (shell mínima) | PASS (vite, 147 kB) | PASS | projeto central `sistema-saa-s-geral` a repontuar (Fase D) | NOT RUN (depende de redeploy pelo owner) | n/a (sem backend na shell) | NOT READY | Aguardando owner: redeploy do projeto central e validação HTTP 200 com conteúdo plataforma |
| **Bakery** | apps/bakery (subtree PadocaAppPremium) | PASS | PASS | projeto central TEMPORÁRIO (vercel.json 95fb0a6); dedicado `saas-bakery` a criar | NOT RUN nesta rodada (última prova 404 pré-fix; pós-95fb0a6 depende de redeploy) | LIVE READ PASS · gates 58/58 + 42/42 preservados | NOT READY | Cutover Fase B/C (projeto dedicado) pendente de criação pelo owner |
| **Pet** | apps/pet (subtree SitePetPremium) | PASS | PASS | `saas-pet` a criar | NOT RUN | não integrado (legado demo) | NOT READY | Criação do projeto + validação HTTP |
| **Restaurant** | apps/restaurant (subtree RestauranteSite) | PASS | PASS | `saas-restaurant` a criar | NOT RUN | não integrado | NOT READY | Criação do projeto + validação HTTP |
| **MetalArt** | apps/metalart (subtree premium PR#1) | PASS | PASS | `saas-metalart` a criar | NOT RUN | não integrado | NOT READY | Criação do projeto + validação HTTP |
| **Heavy Machinery** | apps/heavy-machinery (subtree BigMachines) | PASS | PASS | `saas-heavy-machinery` a criar | NOT RUN | não integrado | NOT READY | Criação do projeto + validação HTTP |
| **Religious House** | MISSING_APP (placeholder) | MISSING | MISSING | — | — | — | BLOCKED | BLOCKED_FREEBUFF_REPOSITORY_ACCESS_TEMPLO |
| **Salon** | MISSING_APP | MISSING | MISSING | — | — | — | NOT READY | Sem implementação no monorepo (não inventar) |
| **LED** | MISSING_APP (só README) | MISSING | MISSING | — | — | — | BLOCKED | BLOCKED_SOURCE_REPOSITORY_LED |

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
