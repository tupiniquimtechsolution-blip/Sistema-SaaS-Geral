# BIG MASTER WAVE 01 — HANDOFF

## PROJETO
tupiniquimtechsolution-blip/Sistema-SaaS-Geral

## BRANCH
freebuff/big-master-wave-01-monorepo

## HEAD
51d1f0f + commits desta fase (ver COMMITS)

## FASE/STATUS
PARTIAL — monorepo + 6/7 verticais importados + SaaS Core contracts testados + ALINHAMENTO CANÔNICO concluído + **WAVE DE INTEGRAÇÃO REAL 01 EXECUTADA** (packages database/auth/tenancy + bakery LIVE READ CAPABLE + harness cross-tenant; ZERO writes remotos); blocos externos classificados

## ÚLTIMA ALTERAÇÃO
Wave de Integração Real 01 (2026-09-16): criados `packages/database` (client Supabase com config explícita + rejeição service_role + row contracts + read helpers RLS-backed; peer @supabase/supabase-js, zero deps novas), `packages/auth` (getSession/onAuthStateChange/signInWithPassword/signOut/projeção de usuário, sem mock), `packages/tenancy` (resolver membership-scoped puro + orquestração `resolveTenantContext` + `resolveDemoFallback` como regra de plataforma). Bakery: `mapLiveTenantToBakery` + `loadBakeryLiveConfig` (READ CONTRACT → LIVE READ CAPABLE) com política de fallback demo explícita (DEMO_MODE=true → demo-fallback sinalizado; false → erro, nunca demo como real). Harness `scripts/cross-tenant-smoke.ts` (read-only, env-driven, TEST = NOT RUN sem identidades A/B). Lockfile root regenerado (npm --package-lock-only --legacy-peer-deps; bun install ok). Supabase CLI ausente no sandbox → BLOCKED_REMOTE_SNAPSHOT_CLI_ACCESS (não bloqueia a integração). DATABASE MUTATIONS = NONE. Docs: docs/LIVE_SUPABASE_INTEGRATION.md.

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
ALIGNED (LIVE) — 14 feature keys canônicas live; orders/projects/loyalty/inventory .enabled REMOVIDAS (não-canônicas no live, registradas em PROPOSED_FUTURE_FEATURES); religious.sensitive.enabled ADICIONADA (boolean, default false, NÃO autoriza sozinha — exige entitlement + religious.sensitive.read/write RBAC + membership/RLS corretos); Plan/Feature/PlanEntitlement/TenantEntitlement/TenantFeatureOverride/EffectiveEntitlement; precedência plan < tenant_entitlements < tenant_features; autoridade final = banco (entitlement_security_gate_v1 remoto)

## PERMISSIONS
ALIGNED 42/42 (LIVE) — docs/PERMISSION_ALIGNMENT.md §0 registra o drift: HISTORICAL BRANCH SNAPSHOT 28/17 vs REMOTE LIVE 42/14, REMOTE WINS. Role matrix live aplicada: owner 42, admin 40 (sem religious.sensitive.*, intencional), manager 32, editor 9, catalog_manager 5, orders_manager 5, support 7, viewer 19

## STORAGE
PATH: ALIGNED → <tenant-uuid>/<folder>/<file> (UUID no primeiro segmento, lowercase, traversal estruturalmente impossível; isCanonicalMediaPath como defesa adicional) · BUCKETS: tenant-public / tenant-private (canônicos remotamente confirmados); policies remotas NÃO alteradas

## SUPABASE RECONCILIATION
DOCUMENTED + §21 RATIFIED (2026-09-15) — §20.1 CONFIRMED REMOTE STATE; §20.2 RESOLVED (tenant-public/tenant-private); §20.7 RESOLVED (booking.read/write EXISTEM) — ver docs/SUPABASE_RECONCILIATION_FREEBUFF_VS_CHATGPT.md

## REMOTE MIGRATION EXECUTION
BLOCKED_PENDING_CANONICAL_DECISION — §21 ratificado; faltam as 4 migrations REMOTE_ONLY (NEEDS_EXPORT) antes de escrever novas migrations locais; db push continua proibido nesta fase

## BAKERY READ CONTRACT
LIVE READ CAPABLE — apps/bakery/src/business/saas-adapter.ts: `mapLiveTenantToBakery` mapeia rows canônicas (tenants/tenant_brands/tenant_themes/tenant_settings + effective entitlements) → shape legado; `loadBakeryLiveConfig` orquestra resolveTenantContext com política de fallback demo explícita (source: live | demo-fallback | error). Mantidos: mapRemoteTenantToBakery, resolveBakeryEntitlements, canReadFeature, media helpers, fallback legado. SEM writes remotos; layout e fallback intocados

## LIVE SUPABASE INTEGRATION (WAVE INTEGRAÇÃO REAL 01)
DOCUMENTED + IMPLEMENTED — ver docs/LIVE_SUPABASE_INTEGRATION.md. packages/database (client explícito, service_role rejeitado em runtime), packages/auth (sessão real, sem mock), packages/tenancy (seleção de tenant restrita às memberships ativas do usuário autenticado — browser selection é UX, RLS é enforcement), política demo fallback como regra de plataforma, harness cross-tenant read-only pronto. Env contract: VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY / VITE_DEMO_MODE (guard de plataforma bloqueia criação de .env.example no sandbox — contrato documentado no doc de integração)

## VERCEL TOPOLOGY (BIG RUN MASTER — 2026-09-18)
DOCUMENTED + PREPARED — ver docs/VERCEL_MASTER_TOPOLOGY.md / VERCEL_TOPOLOGY_AUDIT.md / VERCEL_ENV_MATRIX.md / TENANT_DOMAIN_ARCHITECTURE.md / DEPLOYMENT_RELEASE_MATRIX.md. Modelo: projeto central = PLATAFORMA (nova shell mínima apps/platform — build/typecheck PASS, sem copiar visual de vertical), cada vertical = projeto Vercel dedicado (saas-bakery/pet/restaurant/metalart/heavy-machinery), Project ≠ Tenant (sem fork por cliente), Supabase único mmykyzzkcugxunmekwew, Preview/Production separados (custom environments = FUTURE). Auditoria de builds locais: platform/bakery/pet/restaurant/metalart/heavy-machinery BUILD+TYPECHECK PASS; religious-house/salon/led = MISSING_APP (nada inventado). HashRouter em todos os apps → nenhum rewrite SPA necessário. Secret scan dos dists: PASS. Team rename = BLOCKED_VERCEL_TEAM_RENAME_PERMISSION. Criação dos projetos dedicados + redeploys = ação do owner (sem credencial Vercel no sandbox); Bakery permanece servida pelo projeto central até cutover A→B→C→D.

## REMOTE SNAPSHOT
BLOCKED_REMOTE_SNAPSHOT_CLI_ACCESS — Supabase CLI ausente/sem credencial read-only no sandbox; integração da aplicação NÃO bloqueada; ledger mantém as 4 migrations REMOTE_ONLY/NEEDS_EXPORT; use REMOTE_STATE_SNAPSHOTTED (não SOURCE_FILE_MATCHED) quando o dump for obtido

## CROSS-TENANT DATABASE TEST
**PASS — 2026-09-17 (LIVE, publishable key, projeto mmykyzzkcugxunmekwew).** Identidades A/B provisionadas via RPC canônica `create_tenant_with_owner(p_name, p_slug, p_vertical_id)` (assinatura real descoberta por introspecção — a versão de branch com p_demo NÃO existe no remoto). Gate completo 58/58: matriz de leitura A→A/A→B/B→B/B→A negada cross-tenant em 11 tabelas (tenants, brands, themes, settings, memberships, subscriptions, entitlements, features, contacts, products, bookings); write isolation (QA_RLS_ em contacts): create own ALLOW, create cross DENY por RLS, update cross 0 rows affected; membership isolation e entitlement isolation provadas do banco real. Evidência completa: docs/CROSS_TENANT_RLS_EVIDENCE.md. Storage cross-tenant: PARTIAL (harness pendente, não mascara DB). RELEASE BLOCKER: NO. DATABASE MUTATIONS: apenas dados QA prefixados QA_RLS_ (removidos pelo próprio dono no fim do gate) + tenants/memberships QA via RPC canônica

## TESTES/GATES
- packages/tenancy: **13/13** PASS (membership filtering, seleção/deny, multi-membership, default-deny, precedência, demo fallback policy); typecheck PASS
- packages/database: **3/3** PASS (service_role rejection, client build, config validation); typecheck PASS
- packages/auth: **3/3** PASS (projeção, null user, metadata leak); typecheck PASS
- scripts typecheck PASS; **cross-tenant LIVE: PASS 58/58 (2026-09-17)**; smoke A/B PASS; bakery live read PASS (VITE_DEMO_MODE=false, tenant QA e63de944, brand/theme/settings/entitlements live, sem fallback Fornalha) — reconfirmado 2026-09-18 (RLS gate 58/58 + bakery live read PASS pós-apply)
- **storage harness: PASS 42/42 (2026-09-18, pós-apply)** — PRIVATE 12/12, PUBLIC upsert own ALLOW (A/B), insert-only ALLOW, cross-write DENY, anon GET ALLOW, auth-list governed PASS, residual=0 via varredura da pasta qa/ dedicada
- bakery: typecheck PASS + **build PASS** (vite; warning chunk three.js preexistente)
- metalart typecheck PASS (packages compartilhados não quebram)
- saas-core: **86/86** unit tests PASS (vitest); typecheck PASS (68→86 após correção live)
  - authorization: PERMISSIONS=42, contagens live de role (42/40/32/9/5/5/7/19), default deny, cross-tenant assert, portão religious.sensitive (owner tem, admin não tem, mesmo no próprio tenant)
  - entitlement: FEATURES=14, chaves não-canônicas rejeitadas (orders/projects/loyalty/inventory .enabled), religious.sensitive.enabled presente e default-off, validação jsonb, precedência de override
  - media: buckets canônicos + path <uuid>/<folder>/<file> + UUID primeiro segmento + traversal/cross-tenant
  - audit: metadata sanitization (4)
  - billing: webhook idempotency (3)
  - observability: PII minimization (4)
  - integrations: anti-SSRF (5)
  - cms (2), entitlement (7), tenant (2)
- MetalArt: typecheck PASS (bun tsc --noEmit); bakery: typecheck PASS com adapter READ CONTRACT READY
- bakery/pet/restaurant/heavy-machinery: typecheck + build PASS (sessões anteriores)
- Install raiz: npm arborist quebra com edge case vitest-peer (erro edgesOut); bun install funciona (191 pacotes) — usar bun para tooling do saas-core
- RLS/cross-tenant em banco real: **PASS (2026-09-17, live)** — ver CROSS-TENANT DATABASE TEST acima
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
- RESOLVIDO (2026-09-18): PUBLIC STORAGE FUNCTIONALITY — root cause CONFIRMED e CORRIGIDO via migration 20260918132842_fix_tenant_public_read_policy aplicada pelo owner no Supabase canônico (validação read-only externa: expressão antiga storage_tenant_id(t.name) eliminada; live usa storage_tenant_id(storage.objects.name)/storage_tenant_id(name); tenant_media_insert/update/delete e tenant_private_read UNCHANGED, 5 policies antes/depois, nenhuma duplicada). AFTER empírico: upsert own ALLOW (A/B), insert-only ALLOW, cross DENY, anon GET ALLOW, auth-list governed vê objeto próprio; anon-list = EMPTY registrado como observação honesta (rota pública é RLS-independent; nem EMPTY nem VISIBLE é leak). MIGRATION REAPPLIED: NO — arquivo local renomeado de 20260917120000 para 20260918132842 (SQL byte-idêntico) para alinhar com o ledger remoto. SEMÂNTICA DA ROTA PÚBLICA: /object/public/ de bucket public=true não avalia RLS; revogação imediata p/ tenant suspended/disabled = FUTURE HARDENING NON-BLOCKING (private bucket + signed URL ou authenticated/proxy delivery). Evidência: docs/STORAGE_CROSS_TENANT_EVIDENCE.md + docs/PUBLIC_STORAGE_POLICY_FIX.md (REMOTE APPLY STATUS: APPLIED)

## PRÓXIMA AÇÃO EXATA
1. RESOLVIDO 2026-09-17: cross-tenant DB real = PASS (58/58) + storage isolation = PASS (12/12 private, cross-write 4/4 negado) + bakery live read = PASS com VITE_DEMO_MODE=false. Evidência: docs/CROSS_TENANT_RLS_EVIDENCE.md + docs/STORAGE_CROSS_TENANT_EVIDENCE.md.
2. RESOLVIDO 2026-09-18: migration 20260918132842_fix_tenant_public_read_policy APLICADA pelo owner e validada empiricamente pós-apply (storage harness 42/42: upsert own ALLOW, isolamento intacto, residual=0). Tabela before/after completa em docs/PUBLIC_STORAGE_POLICY_FIX.md (REMOTE APPLY STATUS: APPLIED).
3. (OWNER, Vercel dashboard) Acionar o deployment da branch para o commit do cutover no projeto central `sistema-saa-s-geral` e informar a URL de deployment — eu valido com `bun scripts/preview-http-gate.ts deployment:<url>` (critério: GET / = 200, title "Tupiniquim SaaS — Plataforma", assets 200; BAKERY REMOVED FROM CENTRAL = YES). Em paralelo, criar o projeto dedicado `saas-bakery` conforme docs/VERCEL_OWNER_ACTIONS.md (instruções exatas) e me passar a URL para validação. Depois: demais verticais (matriz de configs em VERCEL_OWNER_ACTIONS.md) — sempre validar HTTP por app.
4. PRODUCTION: NOT PROMOTED — o alias `sistema-saa-s-geral.vercel.app` permanece 404 até promoção explícita pelo owner (comportamento esperado; nunca usar o alias como evidência de branch preview).
5. Export read-only das 4 migrations REMOTE_ONLY (supabase db dump / migration list) contra mmykyzzkcugxunmekwew → commit em supabase/remote-snapshot/ + atualizar docs/REMOTE_MIGRATION_LEDGER.md de NEEDS_EXPORT para REMOTE_STATE_SNAPSHOTTED (a migration local de storage já está alinhada ao ledger remoto: 20260918132842 fix_tenant_public_read_policy).
6. Quando acesso ao Templo for liberado: subtree import para apps/religious-house seguindo docs/migrations/religious-house.md.
7. Media strategy MetalArt: inventário vídeo/foto (site vs source material), plano Supabase Storage/CDN — preservação visual primeiro (requer public storage funcional resolvido).
8. CRM horizontal: definir contrato de consumo do SaaS Core (packages/saas-core já exporta tudo via index.ts).

## BIG RUN MASTER WAVE — FECHAMENTO REAL DO PRODUTO (2026-09-18, terceira rodada)
- **FATO EXTERNO VERIFICADO PELO OWNER:** deployment do commit 657fb86
  (sistema-saa-s-geral-pd4osf8ql.vercel.app) READY, GET / = 200, title
  "Tupiniquim SaaS — Plataforma" → PLATFORM REMOTE PREVIEW = PASS · CENTRAL
  CONTENT = PLATFORM · BAKERY REMOVED FROM CENTRAL = PASS. Blocker anterior
  (acionamento do central) RESOLVIDO.
- **Estratégia de hosting (decisão do owner):** NÃO criar projetos Vercel
  dedicados por vertical — Vercel = apenas preview/dev/validação do central;
  publishing comercial definitivo na wave Cloudflare. Nova semântica:
  CODE_PRODUCT_COMPLETE ≠ FINAL_HOSTING_COMPLETE.
- **Salon auditado:** branch chatgpt/integrate-salon-vanessa NÃO existe no
  remote (git fetch --prune + listagem); nenhum material importável no
  monorepo → blocker concreto registrado; Vanessa Braz permanece TENANT/template
  do vertical salon (nunca vertical separado). Nada inventado.
- **Religious House:** nenhum material local → EXTERNAL_BLOCKED / POST-MVP
  IMPORT. **LED:** DEFERRED_EXTERNAL_SOURCE. Nenhum bloqueia o MVP.
- **Vendor lock-in auditado:** 0 referências Vercel-specific no código →
  HOSTING PORTABILITY = PASS (docs/HOSTING_PORTABILITY_AUDIT.md).
- **Tenant commercial flow classificado** etapa a etapa (docs/
  MVP_COMMERCIAL_READINESS.md): IMPLEMENTED p/ tenant/vertical/plano/usuários/
  permissões/entitlements/isolamento; MVP_PASS p/ branding + domínio manual;
  BILLING ENGINE = POST-MVP (modelo plan/entitlement já suporta).
- **Painel atualizado:** HOSTING_POLICY + clients reais por vertical + blocker
  concreto do Salon + decisions de hosting; typecheck/build/secret scan PASS.
- **VEREDITO: CODE_PRODUCT_COMPLETE = YES · MVP_COMMERCIAL_READY = YES ·
  CLOUDFLARE_MIGRATION_READY = YES (NÃO migrar — aguardar autorização;
  FINAL_HOSTING_COMPLETE = by design na wave Cloudflare).**

## BIG RUN MASTER WAVE — CONCLUSÃO INTEGRAL (2026-09-18, segunda rodada)
- apps/platform evoluído de shell mínima para **CONTROL PLANE** (feat(platform)): navegação hash com 6 views — Dashboard (contadores reais), Verticais + dossiê por vertical (SOURCE/APP/BUILD/TYPECHECK/TEST/ROUTER/ENV/SUPABASE/TENANT/BRANDING/DEMO/COMMERCIAL/PROJETO), Core (maturidade IMPLEMENTED/FOUNDATION/COMING_SOON com evidência), Tenants, Deployments (matriz real), Status (gates). Sem backend falso, sem métricas inventadas; identidade "Tupiniquim SaaS — Plataforma"; typecheck + build PASS; HTTP local 200 (vite preview) + assets 200.
- Matriz por vertical revalidada: bakery/pet/restaurant/metalart/heavy-machinery typecheck + build PASS (re-executados); testes de pacote sem regressão (86/3/3/13).
- Gates de segurança re-executados LIVE: RLS 58/58 · Storage 42/42 · bakery live read PASS.
- NOVO gate durável: scripts/bundle-secret-scan.ts (markers + fingerprints de env nos 6 dists; valores nunca impressos) — PASS.
- Novos docs: PLATFORM_COMPLETION_REPORT · SAAS_RELEASE_READINESS · FINAL_SECURITY_GATE · CLOUDFLARE_MIGRATION_MASTER_PLAN (PLANO — não executar; Cloudflare só após SYSTEM_COMPLETE).
- SYSTEM_COMPLETE = PARTIAL: restante = ações do owner no dashboard Vercel (deployment do central pós-cutover + projetos dedicados) e blockers externos (LED/Templo/Salon).

## VERCEL PREVIEW GATE
CENTRAL PROJECT: **CUTOVER EXECUTADO (2026-09-18)** — vercel.json agora configura npm ci → `npm run build:platform` → `apps/platform/dist` (antes: build:bakery/apps/bakery/dist). DIAGNÓSTICO CORRIGIDO: o deployment do commit b8babe9 ficou **READY com GET / = 200** (owner-confirmed, URL `sistema-saa-s-geral-h0ktuxbaf.vercel.app`) — a leitura anterior "redeploy não publicado/404" referia-se ao alias de produção e está OBSOLETA; o problema real era o **conteúdo**: o projeto central ainda servia Fornalha/Bakery porque o vercel.json apontava para `build:bakery`. Com o cutover, o próximo deployment publica a PLATAFORMA (title "Tupiniquim SaaS — Plataforma"; build + typecheck locais PASS). Harness `scripts/preview-http-gate.ts` atualizado com target kinds distintos: PRODUCTION_ALIAS (não representa a branch preview), BRANCH_PREVIEW e DEPLOYMENT_URL — MASTER PASS desta branch usa somente deployment/preview URLs; PRODUCTION = NOT PROMOTED. VERCEL_TEAM: legado "Caboclo Tupinambá e Flecha Dourada" (rename BLOCKED_VERCEL_TEAM_RENAME_PERMISSION; alvo conceitual Tupiniquim Tech Solution). Owner actions para projetos dedicados: docs/VERCEL_OWNER_ACTIONS.md (saas-bakery + matriz por vertical; nada de projeto fake p/ religious-house/salon/led).

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
- f894df6 fix(qa): align tenant provisioner with live RPC signature (p_plan_id DEFAULT 'starter')
- b03763c test(security): full live RLS gate and bakery live-read gates
- 15331dc docs(qa): record live cross-tenant RLS evidence and Vercel preview readiness
- 1f04835 test(security): add QA cleanup verification for RLS gate
- (storage wave: cross-tenant-storage-smoke + evidence — commit desta rodada)
