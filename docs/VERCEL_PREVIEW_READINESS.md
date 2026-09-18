# VERCEL PREVIEW READINESS

Data: 2026-09-17 · **ATUALIZADO 2026-09-18 (pós-apply storage)** · Branch `freebuff/big-master-wave-01-monorepo`

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
| Storage security | READY (isolamento + funcionalidade) | Storage gate live pós-apply (2026-09-18): 42/42 PASS — PRIVATE ISOLATION 12/12, cross-write DENY, zero leaks; **PUBLIC FUNCTIONALITY agora PASS** (upsert own ALLOW A/B; anon GET ALLOW). Migration `20260918132842_fix_tenant_public_read_policy` APLICADA pelo owner (arquivo local renomeado, SQL byte-idêntico, REAPPLIED: NO). Root cause anterior CONFIRMADO e CORRIGIDO (docs/PUBLIC_STORAGE_POLICY_FIX.md) |
| Build | READY | bakery build PASS (vite); typechecks PASS |
| Typecheck | READY | saas-core/database/auth/tenancy/bakery PASS |
| Unit/security tests | READY | saas-core 86/86, database 3/3, auth 3/3, tenancy 13/13 |
| Env validation | READY | env-doctor + key-probe metadata-only; key publishable aceita |
| Remote migration snapshot | BLOCKED | CLI/credencial read-only ausente (BLOCKED_REMOTE_SNAPSHOT_CLI_ACCESS) — não impede preview de leitura |

## Veredito

**READY** para o primeiro preview SaaS integrado (postura de leitura, com
`VITE_DEMO_MODE=false`), com uma ressalva explícita não-bloqueante:

1. **Storage isolation = PASS e PUBLIC FUNCTIONALITY = PASS** (2026-09-18, live
   pós-apply da migration `20260918132842`): 12/12 checks privados A/B
   own/cross, cross-write negado, upsert público own ALLOW, anon GET ALLOW —
   42/42 no harness. O blocker funcional anterior foi RESOLVIDO. Nota
   semântica permanente (FUTURE HARDENING, non-blocking): a rota
   `/object/public/` de bucket `public=true` não avalia RLS — a policy não
   revoga a URL pública direta de tenants suspended/disabled; se esse
   requisito existir, avaliar private bucket + signed URL ou
   authenticated/proxy delivery.
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
