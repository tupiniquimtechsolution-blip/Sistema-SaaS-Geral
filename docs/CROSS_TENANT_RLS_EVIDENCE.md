# CROSS-TENANT RLS EVIDENCE

Data: 2026-09-17 · Branch `freebuff/big-master-wave-01-monorepo` · Projeto canônico: `mmykyzzkcugxunmekwew`

Toda a evidência abaixo foi coletada **live** contra o Supabase canônico, com a
**publishable key apenas** (`sb_publishable_*`). Nenhum service_role, nenhuma
alteração de schema/policy, nenhum acesso direto a `auth.users`.

## 0. Credencial

| Check | Resultado |
|---|---|
| KEY TYPE | `sb_publishable_` (novo formato, não-JWT) |
| KEY ACCEPTED | **YES** — probe diferencial: com key → HTTP 200; sem key/garbage → HTTP 401 |
| PROJECT REF | `mmykyzzkcugxunmekwew` (URL + domínio conferidos) |
| Pares server/browser | idênticos (`SUPABASE_*` ≡ `VITE_SUPABASE_*`) |
| Contaminação de paste | nenhuma (sem aspas/espaços/CR) |

> Histórico: a primeira key configurada (len 34) foi rejeitada (401 em todos os
> endpoints). Substituída pelo proprietário — este gate só PASSOU após a correção.

## 1. Provisionamento (RPC canônica)

| Item | Resultado |
|---|---|
| Método | `create_tenant_with_owner(p_name, p_slug, p_vertical_id)` — assinatura REAL descoberta por probe de schema-cache (a versão histórica de branch tinha `p_demo`; remoto prevalece) |
| User A auth | PASS |
| User B auth | PASS |
| Tenant A (`qa-tenant-a`) | **PROVISIONED** → `e63de944…` |
| Tenant B (`qa-tenant-b`) | **PROVISIONED** → `53444d8a…` |
| Distintos | PASS (A ≠ B) |
| Idempotência | reuso de membership ativa antes de qualquer RPC; slug duplicado tratado como "já existe", nunca destrutivo |

## 2. Matriz de leitura RLS (resultado do `scripts/rls-gate.ts` — 58/58 PASS)

| Tabela | A→A | A→B | B→B | B→A |
|---|---|---|---|---|
| tenants | 1 row ✅ | 0 ✅ | 1 row ✅ | 0 ✅ |
| tenant_brands | 1 ✅ | 0 ✅ | 1 ✅ | 0 ✅ |
| tenant_themes | 1 ✅ | 0 ✅ | 1 ✅ | 0 ✅ |
| tenant_settings | 1 ✅ | 0 ✅ | 1 ✅ | 0 ✅ |
| memberships | 1 ✅ | 0 ✅ | 1 ✅ | 0 ✅ |
| subscriptions | 1 ✅ | 0 ✅ | 1 ✅ | 0 ✅ |
| tenant_entitlements | 0 (catálogo vazio → default-deny) ✅ | 0 ✅ | 0 ✅ | 0 ✅ |
| tenant_features | 0 ✅ | 0 ✅ | 0 ✅ | 0 ✅ |
| contacts | legível ✅ | 0 ✅ | legível ✅ | 0 ✅ |
| products | legível ✅ | 0 ✅ | legível ✅ | 0 ✅ |
| bookings | legível ✅ | 0 ✅ | legível ✅ | 0 ✅ |

## 3. Write isolation (contacts, prefixo `QA_RLS_`)

| Operação | Resultado |
|---|---|
| A create own | **ALLOW** (insert OK) |
| A create B | **DENY** — `new row violates row-level security policy for table "contacts"` |
| B create own | **ALLOW** (insert OK) |
| B create A | **DENY** — violação RLS |
| A update B | **DENY** — 0 rows affected (UPDATE invisível via RLS) |
| B update A | **DENY** — 0 rows affected |
| Cleanup | rows QA removidas pelo próprio dono ao final do gate |

## 4. Membership isolation

- A vê exatamente 1 membership (a própria); consulta sem filtro retorna somente o seu tenant.
- B vê exatamente 1 membership (a própria).
- A→B e B→A em `memberships` = 0 rows (matriz acima).
- Evidência 100% do Supabase real com RLS — nenhum mirror TypeScript usado como prova.

## 5. Entitlement isolation

- A lê somente entitlements do tenant A; passando `tenant_id` de B explicitamente → **0 rows** (e vice-versa).
- Catálogo de features dos tenants QA vazio → conjunto efetivo default-deny (comportamento seguro esperado).

## 6. Storage

**PARTIAL** — harness de storage cross-tenant (upload assinado nas buckets
`tenant-public`/`tenant-private` com path `<uuid>/<folder>/<file>`) ainda não
implementado nos scripts. Não mascara o resultado do DB RLS (seções 2–5).

## 7. Bakery live read (`scripts/bakery-live-read.ts`)

`VITE_DEMO_MODE=false` (confirmado no env do run):

| Check | Resultado |
|---|---|
| demo-flag false | PASS |
| auth A / session | PASS |
| tenant context (tenancy package, RLS-backed) | PASS — `e63de944 / qa-tenant-a` |
| identidade live (NÃO fornalha/demo) | PASS |
| brand row live (`display_name`) | PASS |
| theme row live (`tokens`) | PASS |
| settings row live (`public_settings`) | PASS |
| entitlements efetivos montados live | PASS — 14 valores |
| fallback silencioso para Fornalha | **NENHUM** (fonte = live) |

## 8. Veredito

```
CROSS-TENANT DB  = PASS (A→B e B→A negados em todas as tabelas críticas, leitura e escrita)
RELEASE BLOCKER  = NO
STORAGE          = PARTIAL
BAKERY LIVE READ = PASS
```

## 9. Ferramentas desta evidência (commitadas)

- `scripts/key-probe.ts` — aceitação da key (metadata-only)
- `scripts/env-doctor.ts` — diagnóstico não-secret do env (fingerprints/claims)
- `scripts/rpc-introspect.ts` — descoberta da assinatura real da RPC
- `scripts/provision-cross-tenant-qa.ts` — provisionamento idempotente via RPC canônica
- `scripts/cross-tenant-smoke.ts` — smoke A/B read-only
- `scripts/rls-gate.ts` — gate completo 58 checks (read/write/membership/entitlement)
- `scripts/bakery-live-read.ts` — live read do vertical bakery

Nenhum e-mail completo, senha, token, JWT ou valor de key foi impresso em
qualquer execução; e-mails aparecem mascarados (`x***@d***`).
