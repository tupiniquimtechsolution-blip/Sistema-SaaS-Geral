# PUBLIC STORAGE POLICY FIX

Data: 2026-09-17 · Branch `freebuff/big-master-wave-01-monorepo`
Projeto: `mmykyzzkcugxunmekwew` (estado remoto = fonte de verdade)
Migration candidata: `supabase/migrations/20260917120000_fix_tenant_public_read_policy.sql`

## CURRENT POLICY (live, confirmada por inspeção externa de pg_policies)

`tenant_public_read` em `storage.objects`, FOR SELECT, TO anon + authenticated, expressão conceitual:

```sql
t.id = storage_tenant_id(t.name)
```

onde `t` é o alias da tabela `tenants` no join da policy — ou seja,
`storage_tenant_id()` está sendo aplicado ao **NOME DO TENANT**, não a
`storage.objects.name` (o path do objeto).

## BUG

A expressão compara o id do tenant com `storage_tenant_id(<nome do tenant>)`.
Como `storage_tenant_id()` espera o PATH do objeto (`<tenant-uuid>/<folder>/<file>`)
e extrai o primeiro segmento como UUID, aplicá-la ao nome do tenant nunca produz
match com paths reais. Resultado observado (empírico, harness live):

| Probe | ACTUAL |
|---|---|
| `public:anon-list governed (RLS SELECT)` sobre pasta com objeto público existente | **EMPTY (0 rows)** — SELECT negado pela policy quebrada |
| Mesmo objeto via rota `/storage/v1/object/public/...` (bypass de RLS) | ALLOW — rota pública serve sem avaliar a policy |
| `upsert: true` own-path (INSERT interno precedido de SELECT/UPDATE) | **DENY** (`new row violates row-level security policy`) |
| `upsert: false` own-path (INSERT puro, filename único) | **ALLOW** (A e B) |
| Cross insert (A→B, B→A) upsert=false | **DENY** (isolamento intacto) |

## ROOT CAUSE

- **PUBLIC READ ROOT CAUSE: CONFIRMED** — `storage_tenant_id(t.name)` aplicado ao
  nome do tenant em vez de `storage.objects.name`. Confirmado por inspeção direta
  de pg_policies (ChatGPT) e coerente com 100% da evidência empírica.
- **UPSERT ROOT CAUSE: CONFIRMED** — upsert envolve SELECT/UPDATE além do INSERT;
  a policy SELECT quebrada faz o fluxo falhar mesmo com INSERT policy correta.
  Prova empírica: mesmo ator/bucket, única variável = `upsert`.
- **TRIALING HYPOTHESIS: REJECTED** — a policy `tenant_media_insert` live é
  genérica para ambos os buckets (bucket_id permitido + storage_tenant_id(name)
  válido + has_tenant_permission('media.write')) e **NÃO verifica tenant.status**.
  A hipótese anterior ("status trialing causa negação de upload público") não é
  suportada. Registrada como corrigida em todos os docs afetados.

## EMPIRICAL EVIDENCE

Execuções: `scripts/cross-tenant-storage-smoke.ts` (3 rodadas, idempotente,
 filenames únicos por run, residual=0 ao final). Resultado determinístico:

- PRIVATE ISOLATION: PASS (12/12 — upload/read/update/delete own ALLOW, cross DENY)
- WRITE ISOLATION: PASS (cross write negado nos 2 buckets)
- PUBLIC INSERT POLICY: PASS (insert-only own ALLOW; cross DENY)
- PUBLIC UPSERT: FAIL (SELECT quebrada interfere)
- PUBLIC READ (RLS-governed): FAIL (anon list = EMPTY para objeto existente)
- PUBLIC READ (rota pública): PASS funcional (ALLOW) — mascarava o bug
- QA_STORAGE_RESIDUAL: 0

## PROPOSED POLICY (migration local — NÃO aplicada)

```sql
DROP POLICY IF EXISTS tenant_public_read ON storage.objects;

CREATE POLICY tenant_public_read
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'tenant-public'
  AND public.storage_tenant_id(storage.objects.name) IS NOT NULL
  AND public.storage_tenant_id(storage.objects.name) IN (
    SELECT t.id
    FROM public.tenants t
    WHERE t.status IN ('demo', 'trialing', 'active')
  )
);
```

Escopo da mudança: **SOMENTE** `tenant_public_read`. Nenhuma outra policy é
tocada. `tenant_media_insert/update/delete` e `tenant_private_read` permanecem
intactas.

## SECURITY IMPACT

A nova policy preserva e corrige:

- public READ somente para objetos de bucket `tenant-public`;
- somente paths cujo primeiro segmento é um tenant UUID válido
  (`storage_tenant_id(name) IS NOT NULL` — rejeita paths malformados/traversal);
- somente tenants com status permitido (`demo`, `trialing`, `active`) —
  a policy restringe visibility em operações storage.objects governadas por
  RLS (SELECT/list e fluxos internos dependentes, como upsert). A rota
  pública direta de bucket `public=true` NÃO é revogada por essa policy
  (ver FUTURE HARDENING abaixo);
- NENHUM public write, cross-tenant write, private read ou acesso privado
  cross-tenant é introduzido (FOR SELECT exclusivo; write continua nas policies
  de mídia existentes; private continua em `tenant_private_read`).

Efeito esperado after: anon/authenticated `list()` passa a enxergar objetos
públicos de tenants ativos; `upsert own` passa a funcionar (SELECT interno
resolvido); cross-write permanece DENY.

## BEFORE / AFTER ESPERADO

| Probe | BEFORE (live) | AFTER (esperado) |
|---|---|---|
| public:upload own (upsert) | DENY | ALLOW |
| public:insert-only own | ALLOW | ALLOW (inalterado) |
| public:insert-only cross | DENY | DENY (inalterado) |
| public:anon-list governed | EMPTY | objeto visível |
| public:anonymous read (rota pública) | ALLOW | ALLOW (inalterado) |
| private:* (todos) | PASS | PASS (inalterado) |

## FUTURE HARDENING (NON-BLOCKING)

Fato empírico já provado no harness: `tenant-public` possui `public=true` e a
rota `/storage/v1/object/public/...` serve objetos **sem depender da policy
RLS SELECT** (mesmo objeto: anon list via storage.objects = EMPTY pela policy
quebrada, enquanto a rota pública o servia).

Consequência: esta migration **NÃO** garante revogação imediata de mídia
quando um tenant sair de demo/trialing/active (ex.: suspended/disabled) — a
URL pública direta continua servindo o objeto.

Se houver requisito de revogação imediata de mídia quando tenant for
suspended/disabled, avaliar (NÃO implementar nesta Wave):

- bucket privado + signed URL; ou
- authenticated/proxy delivery.

## NON-GOALS

- Não alterar `tenant_media_insert/update/delete`, `tenant_private_read` ou
  qualquer outra policy/tabela/função.
- Não migrar mídia para CDN, não alterar buckets, limites ou MIME allowlist.
- Não implementar revogação imediata de mídia pública por status de tenant
  (a rota /object/public/ de bucket public=true não é governada por RLS —
  ver FUTURE HARDENING).
- Não reprovisionar tenants QA nem alterar subscriptions/status.
- Não tocar em dados religiosos sensíveis.

## ROLLBACK

Recriar a policy anterior (evidência da expressão live registrada acima em
CURRENT POLICY). Comando conceitual de rollback (requer autorização do owner):

```sql
DROP POLICY IF EXISTS tenant_public_read ON storage.objects;
-- recrear a expressão live anterior (storage_tenant_id(t.name) — BUGGY)
-- a partir do dump pg_policies registrado antes do apply
```

O estado anterior é recriável integralmente a partir do `pg_policies` capturado
na inspeção externa; nenhum dado é destruído (operação DDL de policy, reversível).

## REMOTE APPLY STATUS

**NOT APPLIED** — migration existe apenas localmente. Nenhum comando de
aplicação foi executado contra o projeto remoto. Aplicação futura exige:
autorização explícita do owner → captura de pg_policies atual (backup) → apply
→ re-execução do harness storage → comparação before/after da tabela acima.
