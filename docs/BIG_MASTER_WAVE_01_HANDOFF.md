# BIG MASTER WAVE 01 — HANDOFF

## PROJETO
tupiniquimtechsolution-blip/Sistema-SaaS-Geral

## BRANCH
freebuff/big-master-wave-01-monorepo

## HEAD
51d1f0f + commits desta fase (ver COMMITS)

## FASE/STATUS
PARTIAL — monorepo + 6/7 verticais importados + SaaS Core contracts testados + ALINHAMENTO CANÔNICO saas-core→Supabase remoto CONCLUÍDO; blocos externos classificados

## ÚLTIMA ALTERAÇÃO
Ratificação canônica executada (2026-09-15): §21 RATIFIED (KEEP CHATGPT/REMOTE em todos os grupos), §20.1/20.2/20.7 resolvidos como CONFIRMED REMOTE STATE (8 migrations *_v1 aplicadas, 86 tabelas/86 RLS, buckets tenant-public/tenant-private, booking.read/write existem). Migration Freebuff 0001 marcada OBSOLETE_SUPERSEDED_NOT_REMOTE (header, sem alterar SQL). saas-core realinhado: 28 permissions + role matrix remota exata, 17 feature keys com Plan/PlanEntitlement/TenantEntitlement/TenantFeatureOverride/EffectiveEntitlement + precedência, tenantMediaPath → <uuid>/<folder>/<file> com buckets canônicos. Gates: saas-core 68/68 + typecheck PASS; bakery typecheck PASS (adapter READ CONTRACT READY com fallback legado preservado). DB não tocado (DATABASE MUTATIONS = NONE).

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
- supabase/migrations/0001_multi_tenant_schema.sql: **OBSOLETE_SUPERSEDED_NOT_REMOTE** — header de aviso adicionado (NEVER APPLIED REMOTELY / SUPERSEDED / DO NOT PUSH TO PRODUCTION); SQL intacto como evidência histórica
- supabase/seed.sql: planos + tenant demo Fornalha (status demo explícito) — legado, mantido
- docs/REMOTE_MIGRATION_LEDGER.md criado: 8 migrations remotas *_v1 mapeadas; 4 REMOTE_ONLY/NEEDS_EXPORT (security_helpers_hardening, performance_hardening, entitlement_security_gate, religious_public_details)
- NADA executado contra o Supabase real nesta fase (DATABASE MUTATIONS = NONE)

## CANONICAL SCHEMA
RATIFIED (2026-09-15) — doc §21: KEEP CHATGPT/REMOTE (core, RBAC, plans/entitlements, CMS, media, CRM, commerce, bookings/events, B2B, pet, restaurant, religious com sensíveis DORMANT, storage); Freebuff saas-core = KEEP FREEBUFF + ADAPT APPLICATION (executado)

## ENTITLEMENTS
ALIGNED — 17 feature keys canônicas (incluindo orders/projects/loyalty/inventory/support.enabled adicionadas); Plan/Feature/PlanEntitlement/TenantEntitlement/TenantFeatureOverride/EffectiveEntitlement; precedência plan < tenant_entitlements < tenant_features; RBAC separado de product entitlement; autoridade final = banco (entitlement_security_gate_v1 remoto)

## PERMISSIONS
ALIGNED 28/28 — docs/PERMISSION_ALIGNMENT.md (catalogo remoto espelhado em member.ts; role matrix remota aplicada: owner/admin 28, manager 20, editor 8, catalog_manager 5, orders_manager 7, support 7, viewer 14)

## STORAGE
PATH: ALIGNED → <tenant-uuid>/<folder>/<file> (UUID no primeiro segmento, lowercase, traversal estruturalmente impossível; isCanonicalMediaPath como defesa adicional) · BUCKETS: tenant-public / tenant-private (canônicos remotamente confirmados); policies remotas NÃO alteradas

## SUPABASE RECONCILIATION
DOCUMENTED + §21 RATIFIED (2026-09-15) — §20.1 CONFIRMED REMOTE STATE; §20.2 RESOLVED (tenant-public/tenant-private); §20.7 RESOLVED (booking.read/write EXISTEM) — ver docs/SUPABASE_RECONCILIATION_FREEBUFF_VS_CHATGPT.md

## REMOTE MIGRATION EXECUTION
BLOCKED_PENDING_CANONICAL_DECISION — §21 ratificado; faltam as 4 migrations REMOTE_ONLY (NEEDS_EXPORT) antes de escrever novas migrations locais; db push continua proibido nesta fase

## BAKERY READ CONTRACT
READY — apps/bakery/src/business/saas-adapter.ts: mapeia tenant/brand/theme/settings remotos → shape legado com fallback demo preservado; resolveBakeryEntitlements (precedência canônica); canReadFeature (leitura only); bakeryMediaPath/bakeryBucketFor/canUploadBakeryMedia (contratos de mídia canônicos). SEM writes remotos; layout e fallback legado intocados

## CROSS-TENANT DATABASE TEST
NOT RUN — sem identidades controladas A/B provisionadas (release blocker documentado nas duas linhas)

## TESTES/GATES
- saas-core: **68/68** unit tests PASS (vitest); typecheck PASS
  - authorization: catalogo 28 permissions + role matrix remota exata + default deny + cross-tenant assert
  - entitlement: catalogo 17 features + validação jsonb + precedência de override + separação RBAC×entitlement
  - media: buckets canônicos + path <uuid>/<folder>/<file> + UUID primeiro segmento + traversal/cross-tenant
  - audit: metadata sanitization (4)
  - billing: webhook idempotency (3)
  - observability: PII minimization (4)
  - integrations: anti-SSRF (5)
  - cms (2), entitlement (7), tenant (2)
- MetalArt: typecheck PASS (bun tsc --noEmit); bakery: typecheck PASS com adapter READ CONTRACT READY
- bakery/pet/restaurant/heavy-machinery: typecheck + build PASS (sessões anteriores)
- Install raiz: npm arborist quebra com edge case vitest-peer (erro edgesOut); bun install funciona (191 pacotes) — usar bun para tooling do saas-core
- RLS/cross-tenant em banco real: NOT RUN (sem execução remota nesta wave, por decisão)
- E2E: NOT RUN
- Lint: NOT RUN

## SEGURANÇA
- Sanitizers de audit e log normalizam separadores (API_KEY, api_key não vazam)
- Guard anti-SSRF cobre localhost, .local, 0.0.0.0, ::1 (IPv6 bracket-literal), ranges privados IPv4 e cloud metadata 169.254.169.254
- Media paths sempre em <tenant-uuid>/<folder>/<file> — traversal estruturalmente impossível; UUID validado antes de virar segmento
- Webhook billing idempotente por eventId (anti double-charge)
- Sem secrets no repositório; .env fora do git
- RLS default deny no schema; memberships com UNIQUE(tenant_id, user_id)

## BLOQUEIOS
- BLOCKED_SOURCE_REPOSITORY_LED — repo canônico não identificado
- BLOCKED_FREEBUFF_REPOSITORY_ACCESS_TEMPLO — repo existe; acesso Freebuff pendente
- BLOCKED_REMOTE_SCHEMA_SNAPSHOT — dump remoto (read-only) exige acesso Supabase não exercido nesta sessão (4 migrations NEEDS_EXPORT no ledger)
- RESOLVIDO: BLOCKED_CANONICAL_DECISION — §21 RATIFICADO em 2026-09-15
- BLOCKED billing provider — sem credencial

## PRÓXIMA AÇÃO EXATA
1. Export read-only das 4 migrations REMOTE_ONLY (supabase db dump / migration list) contra mmykyzzkcugxunmekwew → commit em supabase/remote-snapshot/ + atualizar docs/REMOTE_MIGRATION_LEDGER.md de NEEDS_EXPORT para exportado.
2. Quando acesso ao Templo for liberado: subtree import para apps/religious-house seguindo docs/migrations/religious-house.md.
3. Wire backend bakery: conectar o adapter READ CONTRACT READY ao Supabase real (leitura) + cross-tenant tests A/B contra banco.
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
