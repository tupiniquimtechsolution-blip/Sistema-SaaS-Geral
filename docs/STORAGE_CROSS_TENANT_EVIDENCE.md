# STORAGE CROSS-TENANT EVIDENCE

Data: 2026-09-17 · Branch `freebuff/big-master-wave-01-monorepo`
Execução: `scripts/cross-tenant-storage-smoke.ts` (live, publishable key, PII mascarada)
Projeto: `mmykyzzkcugxunmekwew` (estado remoto = fonte de verdade)

## Convenção testada

- Buckets: `tenant-public` (20 MiB, public=true) · `tenant-private` (50 MiB, private)
- Path: `<tenant-uuid>/<folder>/<file>` — primeiro segmento = tenant UUID
- Atores: User A (owner qa-tenant-a `e63de944…`, status live `trialing`) · User B (owner qa-tenant-b `53444d8a…`, status live `trialing`)
- Payload: PNG real de 1×1 (67 bytes). MIME text/plain é rejeitado pelos buckets (controle positivo confirmado: `mime type text/plain is not supported`).

## Evidência — PRIVATE (`tenant-private`)

| BUCKET | PATH | ACTOR | TARGET TENANT | OPERATION | EXPECTED | ACTUAL | RESULT |
|---|---|---|---|---|---|---|---|
| tenant-private | `<A>/qa/storage-a.png` | A | A | upload own | ALLOW | uploaded | PASS |
| tenant-private | `<B>/qa/storage-b.png` | A | B | upload cross | DENY | RLS violation | PASS |
| tenant-private | `<B>/qa/storage-b.png` | B | B | upload own | ALLOW | uploaded | PASS |
| tenant-private | `<A>/qa/storage-a.png` | B | A | upload cross | DENY | RLS violation | PASS |
| tenant-private | `<A>/qa/storage-a.png` | A | A | read own | ALLOW | downloaded | PASS |
| tenant-private | `<B>/qa/storage-b.png` | A | B | read cross | DENY | Object not found | PASS |
| tenant-private | `<B>/qa/storage-b.png` | B | B | read own | ALLOW | downloaded | PASS |
| tenant-private | `<A>/qa/storage-a.png` | B | A | read cross | DENY | Object not found | PASS |
| tenant-private | `<B>/qa/storage-b.png` | A | B | update cross | DENY | RLS violation | PASS |
| tenant-private | `<A>/qa/storage-a.png` | B | A | update cross | DENY | RLS violation | PASS |
| tenant-private | `<B>/qa/storage-b.png` | A | B | delete cross | DENY | no object removed | PASS |
| tenant-private | `<A>/qa/storage-a.png` | B | A | delete cross | DENY | no object removed | PASS |

## Evidência — PUBLIC (`tenant-public`)

| BUCKET | PATH | ACTOR | TARGET TENANT | OPERATION | EXPECTED | ACTUAL | RESULT |
|---|---|---|---|---|---|---|---|
| tenant-public | `<A>/qa/public-a.png` | A | A | upload own | ALLOW | **RLS violation** | **FAIL (funcional)** |
| tenant-public | `<B>/qa/public-b.png` | B | B | upload own | ALLOW | **RLS violation** | **FAIL (funcional)** |
| tenant-public | `<B>/qa/public-b.png` | A | B | upload cross | DENY | RLS violation | PASS |
| tenant-public | `<A>/qa/public-a.png` | B | A | upload cross | DENY | RLS violation | PASS |
| tenant-public | `<A>/qa/public-a.png` | A | A | read own (auth) | ALLOW | NOT RUN — objeto não existe (upload negado) | n/a |
| tenant-public | `<B>/qa/public-b.png` | B | B | read own (auth) | ALLOW | NOT RUN — objeto não existe (upload negado) | n/a |
| tenant-public | `<A>/qa/public-a.png` | anônimo | A | public GET | ALLOW (se status permitido) | **DENY (404/403)** | **FAIL (funcional)** |
| tenant-public | `<B>/qa/public-b.png` | anônimo | B | B | public GET | ALLOW (se status permitido) | **DENY (404/403)** | **FAIL (funcional)** |

## Classificação oficial (zero leak standard)

```
PRIVATE ISOLATION:          PASS  (12/12 — zero vazamentos)
WRITE ISOLATION (2 buckets): PASS  (todo write/update/delete cruzado negado)
PUBLIC READ FUNCTIONALITY:  FAIL  (uploads own-path negados para owners autenticados)
STORAGE ISOLATION (security): PASS — nenhum leak: NÃO é release blocker
QA_STORAGE_RESIDUAL:        0 (verificação via list() em storage.objects — determinística)
```

Leak em qualquer um destes seria release blocker: A lê private B · B lê private A · A escreve path B · B escreve path A · A altera/deleta objeto B · B altera/deleta objeto A. **Nenhum ocorreu.**

Indisponibilidade ≠ vazamento: o FAIL de public é funcionalidade, registrado como blocker funcional separado.

## POLICY FINDINGS — `tenant_public_read` / insert público

**ATUALIZADO 2026-09-17 (2ª rodada): hipótese do trialing REJEITADA; root cause CONFIRMED.**

```
POLICY (documentada live): tenant_media_insert · tenant_media_update ·
  tenant_media_delete · tenant_private_read · tenant_public_read

HISTORICAL ASSUMPTION (RODADA 1):
  "tenant-public falha porque tenant status = trialing"
  → REJEITADA (NOT SUPPORTED BY LIVE INSERT POLICY): tenant_media_insert é
  genérica para ambos os buckets (bucket_id permitido + storage_tenant_id(name)
  válido + has_tenant_permission('media.write')) e NÃO verifica tenant.status.

BUG CONFIRMED (tenant_public_read):
  A expressão live contém storage_tenant_id(t.name) onde t é a tabela tenants —
  aplica storage_tenant_id() ao NOME DO TENANT em vez de storage.objects.name
  (o path do objeto). SELECT público estruturalmente incorreto.
  ROOT CAUSE PUBLIC READ: CONFIRMED (pg_policies + evidência empírica abaixo).

EMPIRICAL PROOF (harness, rodada 2):
  public:insert-only A/B own (upsert=false, filename único) → ALLOW
  public:insert-only A→B / B→A                            → DENY (isolamento OK)
  public:upload A/B own (upsert=true)                     → DENY
  → PUBLIC INSERT POLICY: PASS · PUBLIC UPSERT: FAIL
  → ROOT CAUSE UPSERT: CONFIRMED — a policy SELECT quebrada interfere no fluxo
    de upsert (INSERT + SELECT/UPDATE internos). Mesmo ator/bucket, única
    variável = upsert.
  public:anon-list governed (RLS SELECT) sobre pasta com objeto existente
    → EMPTY (0 rows) — policy SELECT quebrada nega
  mesma objeto via rota /object/public/ (bypass de RLS) → ALLOW

MIGRATION CANDIDATA (LOCAL, NÃO APLICADA):
  supabase/migrations/20260917120000_fix_tenant_public_read_policy.sql
  substitui SOMENTE tenant_public_read. Ver docs/PUBLIC_STORAGE_POLICY_FIX.md
  (REMOTE APPLY STATUS: NOT APPLIED).
```

Contexto capturado pelo harness: `tenant-status — A=trialing B=trialing (live read — policy-finding context)`.

**Nenhuma policy foi alterada remotamente nesta Wave.**

## Impacto no preview

O adapter do Bakery (live read) consome apenas tabelas DB (tenant, brand, theme,
settings, entitlements) — NÃO depende de leitura pública de `tenant-public`
nesta fase. Portanto o preview permanece READY; o blocker funcional de public
storage fica registrado para a fase de mídia real (uploads de logo/galeria).

## Metodologia

- Execução idempotente; mesma matriz em 2 rodadas (antes/depois do fix de residual).
- Residual verificado via `list()` (metadata de `storage.objects`), não `download()`,
  que pode servir resposta de CDN em cache para objeto recém-removido — fonte de
  um falso-positivo corrigido nesta rodada.
- Cleanup remove todos os objetos QA criados; verificação final confirma 0 residuais.
- Nenhuma secret impressa; e-mails mascarados; somente publishable key.
- DATABASE MUTATIONS: exclusivamente objetos QA de storage (criados e removidos).
