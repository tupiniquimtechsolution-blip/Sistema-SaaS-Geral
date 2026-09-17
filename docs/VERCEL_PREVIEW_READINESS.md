# VERCEL PREVIEW READINESS

Data: 2026-09-17 · Branch `freebuff/big-master-wave-01-monorepo`

Avaliação de prontidão para um primeiro preview integrado (Vercel ou hosting
equivalente de build estático). **Sem nenhum secret** — o preview consome
apenas valores publishable/browser.

## Critérios

| Critério | Estado | Evidência |
|---|---|---|
| Schema canônico ratificado | READY | §21 RATIFIED — docs/SUPABASE_RECONCILIATION_FREEBUFF_VS_CHATGPT.md |
| Catálogos alinhados ao live | READY | PERMISSION_ALIGNMENT.md (42/42), FEATURES=14 (drift live corrigido) |
| Client Supabase compartilhado | READY | packages/database (config explícita, service_role rejeitado) |
| Auth foundation | READY | packages/auth (sessão real, sem mock) |
| Tenant resolution | READY | packages/tenancy (membership-scoped, fail-closed) |
| Auth real + tenant live | READY | Autenticação A/B real provada (2026-09-17) |
| RLS validada em banco real | READY | Cross-tenant gate 58/58 PASS (docs/CROSS_TENANT_RLS_EVIDENCE.md) |
| Usuários controlados A/B | READY | Provisionados via RPC canônica; isolamento provado |
| Cross-tenant negative tests | READY | A→B e B→A negados (leitura e escrita) |
| Bakery live read | READY | scripts/bakery-live-read.ts PASS — brand/theme/settings/entitlements live, sem fallback Fornalha |
| Storage security | READY (isolamento) | Storage gate live: PRIVATE ISOLATION PASS 12/12, cross-write DENY 4/4, zero leaks (docs/STORAGE_CROSS_TENANT_EVIDENCE.md). Ressalva funcional não-bloqueante: uploads own-path em `tenant-public` negados por RLS p/ owners autenticados (PUBLIC READ FUNCTIONALITY = FAIL) — preview de leitura não depende disso |
| Build | READY | bakery build PASS (vite); typechecks PASS |
| Typecheck | READY | saas-core/database/auth/tenancy/bakery PASS |
| Unit/security tests | READY | saas-core 86/86, database 3/3, auth 3/3, tenancy 13/13 |
| Env validation | READY | env-doctor + key-probe metadata-only; key publishable aceita |
| Remote migration snapshot | BLOCKED | CLI/credencial read-only ausente (BLOCKED_REMOTE_SNAPSHOT_CLI_ACCESS) — não impede preview de leitura |

## Veredito

**READY** para o primeiro preview SaaS integrado (postura de leitura, com
`VITE_DEMO_MODE=false`), com duas ressalvas explícitas e não-bloqueantes:

1. **Storage isolation = PASS** (2026-09-17, live): 12/12 checks privados
   A/B own/cross (upload/read/update/delete) e 4/4 cross-write públicos negados.
   **Blocker funcional registrado (não-bloqueante p/ preview de leitura):**
   uploads own-path em `tenant-public` são negados por RLS para owners
   autenticados (suspeita: policy filtra tenant status `trialing`; root cause
   SUSPECTED — ver POLICY FINDINGS em docs/STORAGE_CROSS_TENANT_EVIDENCE.md).
   Qualquer preview com funcionalidade de upload real requer resolução ANTES.
2. **Remote migration snapshot = BLOCKED** — pendente de CLI/credencial
   read-only; não afeta o preview, mas precede qualquer decisão de migration.

## Regras do preview

- Nenhum secret no bundle: apenas `VITE_SUPABASE_URL`,
  `VITE_SUPABASE_PUBLISHABLE_KEY` (publishable) e `VITE_DEMO_MODE=false`.
- `service_role`/`sb_secret_*` PROIBIDOS em Vite/browser/bundle/Git.
- Falha de Supabase em produção NÃO renderiza dados demo como reais
  (política de demo fallback — packages/tenancy + bakery adapter).
- Dados religiosos sensíveis permanecem DORMANT (entitlement default-off,
  RBAC restrito ao owner, triple gate).
