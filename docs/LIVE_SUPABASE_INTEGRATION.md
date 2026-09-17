# LIVE SUPABASE INTEGRATION

Wave: **INTEGRAÇÃO REAL 01** — remote evidence + shared database/auth/tenancy + Bakery live read. Branch `freebuff/big-master-wave-01-monorepo`.

## ARCHITECTURE

```
SUPABASE REAL (mmykyzzkcugxunmekwew — fonte de verdade, RLS = autoridade)
      ↓
packages/database   (client + read helpers, config explícita, sem import.meta.env)
      ↓
packages/auth       (session: getSession/onAuthStateChange/signIn/signOut/projection)
      ↓
packages/tenancy    (memberships → tenant selection → context → entitlements)
      ↓
packages/saas-core  (tipos, validação, precedência canônica — inalterado)
      ↓
apps/bakery adapter (mapLiveTenantToBakery → shape legado → UI EXISTENTE)
```

Layout do bakery NÃO foi redesenhado; o adapter converte dados canônicos para o formato que a UI já consome.

## ENVIRONMENT CONTRACT

Variáveis PÚBLICAS do browser (por app Vite; exemplo para bakery):

| Variável | Valor esperado | Regra |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://mmykyzzkcugxunmekwew.supabase.co` | URL pública do projeto |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | chave publishable (anon) | ÚNICO tipo de chave aceito |
| `VITE_DEMO_MODE` | `true` \| `false` | política de fallback demo |

RESTRIÇÃO DE PLATAFORMA: o guard de secrets do Freebuff bloqueia a criação/edição de qualquer arquivo `.env*` neste ambiente — inclusive `.env.example`. O contrato acima é a fonte canônica; o arquivo `.env.example` deve ser criado fora do sandbox (CI/local) com exatamente estas chaves. Nenhum valor privado é commitado; `SERVICE_ROLE` é PROIBIDO no Vite/browser/bundle/Git (a factory rejeita chaves com marcador `service_role`/`sb_secret_` em runtime).

O pacote `database` NÃO lê `import.meta.env`: recebe `{ url, publishableKey }` explicitamente (apps leem o env e chamam `createSupabaseBrowserClient`).

## DATABASE CLIENT

`packages/database` (`tupiniquim-database`):

- `createSupabaseBrowserClient({ url, publishableKey, authStorageKey? })` — valida URL + chave, rejeita service_role, sessão persistida no browser (`persistSession`, `autoRefreshToken`, `detectSessionInUrl: false`).
- `assertPublishableKey()` — guard reutilizável contra service_role.
- Row contracts em `src/rows.ts` (tenants, tenant_brands, tenant_themes, tenant_settings, memberships, profiles, subscriptions, plans, plan_entitlements, tenant_entitlements, tenant_features — espelho do schema canônico).
- Read helpers RLS-backed em `src/read.ts`: `fetchMemberships` (join `tenants!inner`, status `active`), `fetchTenantBrand/Theme/Settings`, `fetchProfile`, `fetchActiveSubscription`, `fetchPlan`, `fetchPlanEntitlements`, `fetchTenantEntitlements`, `fetchTenantFeatures`.
- READ-ONLY nesta Wave: nenhum insert/update/delete/upsert.

Dependências: peer `@supabase/supabase-js >=2.0.0` (workspace já usa `^2.98.0`) — **zero dependências novas**; npm CI segue com lockfile root regenerado (`--legacy-peer-deps` documentado).

## AUTH FLOW

`packages/auth` (`tupiniquim-auth`):

- `getSession(client)` → `Session | null` (erro mapeado, nunca engolido).
- `onAuthStateChange(client, listener)` → função de unsubscribe.
- `signInWithPassword(client, email, password)` → `Session` (erro tipado).
- `signOut(client)`.
- `projectUser/projectSession` → `AuthUserProjection { id, email, emailConfirmed, displayName }` — projeção mínima; nenhum metadata bruto vaza (testado).

Fora de escopo nesta Wave (não implementado): password recovery, OAuth/SSO, magic links, MFA. NÃO existe auth mock — a sessão real do Supabase é a única fonte; o fallback demo vive no adapter, gated por `DEMO_MODE`.

## TENANT RESOLUTION

`packages/tenancy` (`tupiniquim-tenancy`):

```
Authenticated User → memberships (RLS, status=active) → seleção de tenant
→ tenant_brands/tenant_themes/tenant_settings → subscriptions (active-ish)
→ plan_entitlements + tenant_entitlements + tenant_features
→ assembleEffectiveEntitlements (precedência canônica)
```

Regras de segurança (puras, testadas):
- `selectTenant()`: o tenantId requisitado PRECISA estar nas memberships ativas do usuário autenticado; senão `TENANT_NOT_IN_MEMBERSHIPS` (deny). Seleção no browser é UX; enforcement é RLS.
- `filterActiveMemberships()`: apenas status `active` do próprio user_id; multi-membership suportado.
- Missing/revoked/suspended membership → deny. `resolveTenantContext()` não lê nenhum dado tenant-owned quando a seleção falha (fail-closed).
- `tenantFeatureRowsToOverrides()`: rows de `tenant_features` (shape canônico `enabled` + `configuration`) decodificadas com validação; keys desconhecidas e valores inválidos são descartados (default deny).

## READ MODEL

Somente leitura, tabelas: `tenants`, `memberships`, `tenant_brands`, `tenant_themes`, `tenant_settings`, `subscriptions`, `plans`, `plan_entitlements`, `tenant_entitlements`, `tenant_features` (+ `profiles` para projeção do usuário). Effective entitlement: precedência `plan_entitlements < tenant_entitlements < tenant_features` (igual ao remote `entitlement_security_gate_v1`, que permanece a autoridade para operações privilegiadas). Resultado desconhecido → DENY/default-off no frontend (`canUseEntitlement` sem match = false).

## BAKERY ADAPTER

`apps/bakery/src/business/saas-adapter.ts` (READ CONTRACT → **LIVE READ CAPABLE**):

- `mapLiveTenantToBakery({ tenant, brand, theme, settings, effectiveEntitlements })` — rows canônicas → `Tenant` legado. Identidade/status/entitlements sempre LIVE; brand/theme/settings ausentes preservam os defaults visuais demo (preservação visual; tenant meio-provisionado não renderiza shell vazio).
- `loadBakeryLiveConfig({ client, session, requestedTenantId? })` — orquestra `resolveTenantContext` (import dinâmico de `tupiniquim-tenancy`) e retorna `BakeryLiveConfig` com `source: "live" | "demo-fallback" | "error"`.
- Mantidos intactos: `mapRemoteTenantToBakery`, `resolveBakeryEntitlements`, `canReadFeature`, `bakeryMediaPath/bakeryBucketFor/canUploadBakeryMedia`, fallback legado.
- Status `trialing` do remote mapeia fail-closed para `disabled` no shape legado (status demo/active/else), sem mascarar estado.

## DEMO FALLBACK POLICY

Implementada como regra de plataforma em `packages/tenancy/src/demo-fallback.ts` (`resolveDemoFallback`) e aplicada no adapter:

- `DEMO_MODE=true` → falhas caem no fallback demo EXPLÍCITO, com `source: "demo-fallback"` (nunca apresentado como live).
- `DEMO_MODE=false` → postura de produção: qualquer falha produz estado de erro (`source: "error"` + reason opaca); dados demo NUNCA renderizam como se reais.
- Sem flag definida → demo ON (default histórico), documentado; produção deve definir `VITE_DEMO_MODE=false` explicitamente.

## SECURITY BOUNDARIES

- RLS permanece a autoridade; reads do browser usam apenas a publishable key.
- service_role rejeitado em runtime pela factory (marcadores `service_role`, `sb_secret_`).
- Sem `import.meta.env` em packages; apps injetam config explícita.
- Nenhuma regressão: SSRF IPv4/IPv6, sanitizers PII/API_KEY/audit, path traversal (`<uuid>/<folder>/<file>`), billing idempotency, permission mirror 42, feature mirror 14, religious sensitive triple gate — 86/86 testes saas-core continuam PASS.
- Harness e scripts não aceitam credenciais hardcoded; env-only.

## CROSS-TENANT HARNESS

`scripts/cross-tenant-smoke.ts` — read-only, env-driven (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `TEST_A_EMAIL/PASSWORD`, `TEST_B_EMAIL/PASSWORD`, opcionais `TEST_A/B_TENANT_ID` / `TEST_A/B_TENANT_SLUG`). Fluxo previsto: auth A → tenants A; auth B → tenants B; A→A allow; A→B deny/empty (probes em tenants, tenant_brands, tenant_settings, tenant_entitlements); B→B allow; B→A deny/empty. Sem credenciais → `TEST = NOT RUN` (não mocka PASS).

**EXECUTADO (2026-09-17): smoke PASS + gate completo 58/58 PASS + provisionamento live via RPC canônica + bakery live read PASS. Evidência completa: `docs/CROSS_TENANT_RLS_EVIDENCE.md`. Tooling adicional: `key-probe.ts`, `env-doctor.ts`, `rpc-introspect.ts`, `provision-cross-tenant-qa.ts` (RPC real: `create_tenant_with_owner(p_name, p_slug, p_vertical_id)` — sem p_demo), `rls-gate.ts`, `bakery-live-read.ts`.**

## TEST STATUS

| Gate | Estado |
|---|---|
| Remote snapshot (supabase CLI/credencial) | BLOCKED — `BLOCKED_REMOTE_SNAPSHOT_CLI_ACCESS`; CLI ausente no sandbox; integração NÃO bloqueada |
| saas-core tests | PASS — 86/86 (sem regressão) |
| saas-core typecheck | PASS |
| database tests | PASS — 3/3 (service_role rejection, client build, config validation) |
| auth tests | PASS — 3/3 (projection, null, metadata leak) |
| tenancy tests | PASS — 13/13 (membership filtering, selection/deny, multi-membership, default-deny, precedência, demo policy) |
| scripts typecheck | PASS |
| cross-tenant real A/B | **PASS — 2026-09-17** (smoke PASS; gate 58/58; evidência: CROSS_TENANT_RLS_EVIDENCE.md) |
| bakery typecheck | PASS |
| bakery build | PASS (`vite build`, warning de chunk preexistente three.js) |
| metalart typecheck | PASS (packages compartilhados não quebram) |
| RLS / auth real / cross-tenant DB | **PASS — 2026-09-17** (live, publishable key; DATABASE MUTATIONS = dados QA prefixados `QA_RLS_`, removidos ao final) |
| Storage cross-tenant | PARTIAL (harness de storage ainda não implementado; não mascara DB RLS) |

## BLOCKERS

- `BLOCKED_REMOTE_SNAPSHOT_CLI_ACCESS` — Supabase CLI não disponível/autenticado no sandbox; snapshot read-only (`db dump`, `migration list`) permanece pendente; ledger mantém 4 migrations REMOTE_ONLY/NEEDS_EXPORT.
- `.env.example` não pode ser criado por guard de plataforma (contrato documentado acima).
- ~~Identidades A/B controladas não provisionadas~~ RESOLVIDO 2026-09-17 (provisionadas via RPC canônica; gate PASS).
- `BLOCKED_SOURCE_REPOSITORY_LED` · `BLOCKED_FREEBUFF_REPOSITORY_ACCESS_TEMPLO` · billing provider (unchanged).

## NEXT EXACT ACTION

Exportar o snapshot read-only do remoto (`supabase db dump --schema public` + `supabase migration list`) quando houver CLI/credencial — o gate cross-tenant já está PASS; o próximo passo canônico é fechar o STORAGE cross-tenant (PARTIAL) com um harness de storage e, depois, o snapshot das 4 migrations REMOTE_ONLY.
