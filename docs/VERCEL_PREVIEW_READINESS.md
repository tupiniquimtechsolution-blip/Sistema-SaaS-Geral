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
| Storage security | READY (isolamento) | Storage gate live: PRIVATE ISOLATION PASS 12/12, cross-write DENY 4/4, zero leaks (docs/STORAGE_CROSS_TENANT_EVIDENCE.md). Blocker funcional diagnóstico COMPLETO: root cause `tenant_public_read` CONFIRMED (`storage_tenant_id(t.name)` aplica a fn ao nome do tenant, não ao path) — migration forward-only preparada localmente, REMOTE APPLY STATUS = NOT APPLIED (docs/PUBLIC_STORAGE_POLICY_FIX.md). INSERT público puro = PASS; falha específica = upsert + SELECT RLS-governed. Preview de leitura não depende |
| Build | READY | bakery build PASS (vite); typechecks PASS |
| Typecheck | READY | saas-core/database/auth/tenancy/bakery PASS |
| Unit/security tests | READY | saas-core 86/86, database 3/3, auth 3/3, tenancy 13/13 |
| Env validation | READY | env-doctor + key-probe metadata-only; key publishable aceita |
| Remote migration snapshot | BLOCKED | CLI/credencial read-only ausente (BLOCKED_REMOTE_SNAPSHOT_CLI_ACCESS) — não impede preview de leitura |

## Veredito

**READY** para o primeiro preview SaaS integrado (postura de leitura, com
`VITE_DEMO_MODE=false`), com duas ressalvas explícitas e não-bloqueantes:

1. **Storage isolation = PASS** (2026-09-17, live): 12/12 checks privados
   A/B own/cross (upload/read/update/delete) e cross-write público negado.
   **Blocker funcional DIAGNOSTICADO (não-bloqueante p/ preview de leitura):**
   root cause CONFIRMED — `tenant_public_read` aplica `storage_tenant_id(t.name)`
   ao nome do tenant em vez de `storage.objects.name`; hipótese do "trialing"
   REJEITADA (insert policy não verifica status). INSERT público puro PASS;
   upsert falha por interferência da SELECT quebrada. Migration forward-only
   `20260917120000_fix_tenant_public_read_policy.sql` preparada localmente,
   **NOT APPLIED** (docs/PUBLIC_STORAGE_POLICY_FIX.md). Qualquer preview com
   upload real requer apply autorizado + re-teste ANTES.
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
