# BIG MASTER WAVE 01 — HANDOFF

## PROJETO
tupiniquimtechsolution-blip/Sistema-SaaS-Geral

## BRANCH
freebuff/big-master-wave-01-monorepo

## HEAD
7d0927b chore(tooling): add bun lockfile for saas-core test tooling

## FASE/STATUS
PARTIAL — monorepo + 6/7 verticais importados + SaaS Core contracts testados; blocos externos classificados

## ÚLTIMA ALTERAÇÃO
Reconciliação documental Supabase concluída: docs/SUPABASE_RECONCILIATION_FREEBUFF_VS_CHATGPT.md (Freebuff 10 tabelas vs ChatGPT 81 vs remoto documentado 86; 3 write-policy holes na migration Freebuff registrados; proposta canônica KEEP CHATGPT + ADAPT APPLICATION saas-core, nada executado). Branch pushed (3434068..7d0927b). Anteriormente: SaaS Core com 47 testes, 2 vulnerabilidades corrigidas (SSRF ::1, api_key leak); MetalArt premium importado e typechecked.

## ESCOPO CANÔNICO
- SaaS Core único alimenta verticais e apps horizontais.
- CRM Tupiniquim = APP HORIZONTAL comercializável (repo tupiniquimtechsolution-blip/CRM_Tupiniquim); consumirá Tenant/Auth/Membership/RBAC/Entitlements/Billing/Audit/RLS como qualquer tenant-app. Não é vertical.
- MetalArt = VERTICAL PRINCIPAL. Implementação executável = branch premium do PR #1, não main (main = governança/mídia/histórico).
- Templo = VERTICAL PRINCIPAL. Bloqueio corrigido: BLOCKED_FREEBUFF_REPOSITORY_ACCESS_TEMPLO (escopo de acesso do app, NÃO repo inexistente).
- LED = BLOCKED_SOURCE_REPOSITORY_LED até identificação do repo canônico. NÃO inventar.
- Quantidade de verticais é expansível; não tratar como lista fechada.

## DECISÕES CONFIRMADAS
- Estrutura monorepo: apps/*, packages/*, supabase/*, scripts/*, infra/*, docs/*
- Importação via git subtree add --squash preferencial, preservando origem
- PDFs preservados (pet, restaurant) — não apagar mídia por tamanho; estratégia de mídia fica para wave futura
- SaaS Core conecta bakery via adapter sem quebrar layout
- node_modules e dist fora do git pelo .gitignore raiz
- Reconciliação com branch chatgpt/supabase-vercel-foundation (head a3b2b1f) é trabalho futuro obrigatório: NÃO merge automático, NÃO cherry-pick em massa, NÃO schema concorrente no banco remoto

## IMPORTAÇÕES (apps/*)
| App | Origem | Método | Provenance |
|---|---|---|---|
| apps/bakery | PadocaAppPremium | subtree | docs/migrations/bakery.md |
| apps/pet | SitePetPremium | subtree | docs/migrations/pet.md |
| apps/restaurant | RestauranteSite | subtree | docs/migrations/restaurant.md |
| apps/heavy-machinery | BigMachines | subtree | docs/migrations/heavy-machinery.md |
| apps/metalart | MetalArt @ website-premium-metal---art-b31ef (c746c31, PR #1 aberto) | subtree squash | docs/migrations/metalart.md |
| apps/religious-house | — | — | BLOCKED_FREEBUFF_REPOSITORY_ACCESS_TEMPLO (placeholder mínimo) |
| apps/led | — | — | BLOCKED_SOURCE_REPOSITORY_LED (placeholder mínimo) |

## NÃO ALTERAR
- Repositórios de origem (intactos; nunca delete/move destrutivo)
- Layouts premium dos apps importados (sem redesign)
- PDFs importados e mídias legítimas do MetalArt
- Documentos canônicos (AGENTS.md, SECURITY.md, docs/*) — só atualização consistente com decisões novas

## MIGRATIONS
- supabase/migrations/0001_multi_tenant_schema.sql: 10 tabelas, RLS default deny (4 policies) — OBSOLETE_CANDIDATE (ver reconciliação)
- supabase/seed.sql: planos + tenant demo Fornalha (status demo explícito)
- NÃO executado contra o Supabase real — projeto remoto é gerido externamente (ChatGPT)

## SUPABASE RECONCILIATION
DOCUMENTED — ver docs/SUPABASE_RECONCILIATION_FREEBUFF_VS_CHATGPT.md (25 seções, documental only, nenhuma decisão executada)

## REMOTE MIGRATION EXECUTION
BLOCKED_PENDING_CANONICAL_DECISION — propostas §21 aguardam ratificação owner + ChatGPT; proibido db push/dump de escrita/merge de branches

## CROSS-TENANT DATABASE TEST
NOT RUN — sem identidades controladas A/B provisionadas (release blocker documentado nas duas linhas)

## TESTES/GATES
- saas-core: 47/47 unit tests PASS (vitest); typecheck PASS
  - authorization: default deny, cross-tenant assert (13 testes)
  - media: upload policy, tenant path isolation (7)
  - audit: metadata sanitization (4)
  - billing: webhook idempotency (3)
  - observability: PII minimization (4)
  - integrations: anti-SSRF (5)
  - cms (2), entitlement (7), tenant (2)
- MetalArt: typecheck PASS (bun tsc --noEmit)
- bakery/pet/restaurant/heavy-machinery: typecheck + build PASS (sessões anteriores)
- Install raiz: npm arborist quebra com edge case vitest-peer (erro edgesOut); bun install funciona (191 pacotes) — usar bun para tooling do saas-core
- RLS/cross-tenant em banco real: NOT RUN (sem execução remota nesta wave, por decisão)
- E2E: NOT RUN
- Lint: NOT RUN

## SEGURANÇA
- Sanitizers de audit e log normalizam separadores (API_KEY, api_key não vazam)
- Guard anti-SSRF cobre localhost, .local, 0.0.0.0, ::1 (IPv6 bracket-literal), ranges privados IPv4 e cloud metadata 169.254.169.254
- Media paths sempre sob tenants/{tenantId}/ — traversal estruturalmente impossível
- Webhook billing idempotente por eventId (anti double-charge)
- Sem secrets no repositório; .env fora do git
- RLS default deny no schema; memberships com UNIQUE(tenant_id, user_id)

## BLOQUEIOS
- BLOCKED_SOURCE_REPOSITORY_LED — repo canônico não identificado
- BLOCKED_FREEBUFF_REPOSITORY_ACCESS_TEMPLO — repo existe; acesso Freebuff pendente
- BLOCKED_REMOTE_SCHEMA_SNAPSHOT — dump remoto (read-only) exige acesso Supabase não exercido nesta sessão documental
- BLOCKED_CANONICAL_DECISION — decisões §21 da reconciliação pendentes de ratificação
- BLOCKED billing provider — sem credencial

## PRÓXIMA AÇÃO EXATA
1. Snapshot remoto read-only: supabase db dump --schema public + supabase migration list contra mmykyzzkcugxunmekwew; commit em supabase/remote-snapshot/; resolver drift §20.1/20.2/20.7 da reconciliação; depois ratificar §21 com owner + ChatGPT.
2. Quando acesso ao Templo for liberado: subtree import para apps/religious-house seguindo docs/migrations/religious-house.md.
3. Wire backend: conectar 1 vertical (bakery) ao Supabase dev real APÓS ratificação §21; rodar cross-tenant tests A/B contra banco.
4. Media strategy MetalArt: inventário vídeo/foto (site vs source material), plano Supabase Storage/CDN — preservação visual primeiro.
5. CRM horizontal: definir contrato de consumo do SaaS Core (packages/saas-core já exporta tudo via index.ts).

## COMMITS
- a7c2bbb docs: update canonical scope to include MetalArt, Templo, CRM horizontal
- 3e0313f chore(metalart): retire governance snapshot to make room for premium implementation
- 297cfa6 feat(metalart): import premium implementation and join npm workspace
- a77a33e chore(monorepo): lock MetalArt workspace dependency resolution
- a3a7191 docs(metalart): correct provenance to premium implementation branch
- af3eb0b docs(crm): add horizontal app integration strategy for CRM Tupiniquim
- e09b077 docs(religious-house): classify Templo blocker as Freebuff access scope, not missing repo
- 7013cac feat(saas-core): add authorization, cms, media, audit, billing, observability and integrations contracts
- cdb2733 fix(saas-core): close IPv6 loopback SSRF bypass and api_key log leak; add security contract tests
- 7d0927b chore(tooling): add bun lockfile for saas-core test tooling
- (docs push: branch sincronizada com remote em 7d0927b; push inicial 3434068..7d0927b executado)
- (reconciliação: docs/SUPABASE_RECONCILIATION_FREEBUFF_VS_CHATGPT.md criada — commit desta wave)
- (commits anteriores: workspace root, core contracts, gitignore+led placeholder, db schema+seed, imports subtree bakery/pet/restaurant/heavy-machinery)
