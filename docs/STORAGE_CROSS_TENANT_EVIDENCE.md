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

```
POLICY (documentada live): tenant_media_insert · tenant_media_update ·
  tenant_media_delete · tenant_private_read · tenant_public_read
EXPECTED: owner autenticado com media.write consegue gravar own-path em
  tenant-public; objeto público legível anonimamente para tenant em status
  permitido pela policy.
ACTUAL: upload own-path em tenant-public NEGADO ("new row violates row-level
  security policy") para os MESMOS atores/permission que gravam com sucesso em
  tenant-private. Anonymous read consequentemente DENY (objeto inexistente).
SUSPECTED EXPRESSION: a policy de insert de tenant-public provavelmente exige
  tenant status em um conjunto que exclui 'trialing' (ex.: status = 'active'),
  enquanto a policy do bucket privado não filtra status — hipótese consistente
  com os dois tenants QA estarem em status live = 'trialing'.
ROOT CAUSE: SUSPECTED (não confirmado — nenhuma consulta a pg_policies nesta
  rodada; nenhuma policy foi alterada).
```

Contexto capturado pelo harness: `tenant-status — A=trialing B=trialing (live read — policy-finding context)`.

Próximo passo diagnóstico (sem mutação): confirmar a expressão real da policy
(`pg_policies`) quando o owner autorizar a inspeção, e decidir entre
(a) ativar status `active` nos tenants QA para re-teste empírico ou
(b) revisão de policy pelo dono do schema. **Nenhuma alteração de policy foi
feita ou será feita automaticamente.**

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
