# Tupiniquim Site Builder / Preview Studio

Workspace React 18 + Vite + TypeScript para edição multi-tenant controlada.

## Implementado

- sessão real via `tupiniquim-auth`;
- memberships, tenant selection, brand, theme, settings e entitlements via `tupiniquim-tenancy`;
- cliente Supabase browser via `tupiniquim-database` e somente publishable key;
- vertical key validada pelo contrato `assertBuilderScope` de `tupiniquim-saas-core`;
- estados explícitos: loading, unauthorized, forbidden, empty e selected;
- `private_settings` não são renderizadas no painel;
- Draft Studio usando as tabelas canônicas `pages` e `page_sections`;
- workflow versionado `draft → in_review → approved → published` com retorno seguro a draft;
- snapshots de revisão separados da projeção pública;
- uma única revisão aberta e uma única revisão publicada por página;
- publicação projeta o snapshot aprovado em `pages/page_sections` dentro da mesma transação PostgreSQL;
- publicação anterior vira histórico `rolled_back`, sem apagar snapshot;
- rollback restaura um snapshot histórico como **novo draft**, exigindo novo review/approval antes de republicar;
- RLS e `cms.write` permanecem autoridade de enforcement;
- renderização de preview sem `dangerouslySetInnerHTML`;
- cliente não usa `service_role`.

## Contrato de revisão

`page_revisions` é um ledger tenant-scoped. Identidade, número da revisão e snapshots fora de `draft` são imutáveis. O banco rejeita transições que pulem o lifecycle. A projeção pública só acontece na transição `approved → published`.

A migration forward-only `builder_revision_workflow_v1` foi aplicada ao Supabase canônico como versão `20260922235641`, a partir do SQL validado no staging. O arquivo canônico é `supabase/migrations/20260922235641_builder_revision_workflow_v1.sql`; a migration histórica `0001_multi_tenant_schema.sql` continua obsoleta e não deve ser reaplicada.

Validação remota pós-migration confirmou RLS + FORCE RLS, policies tenant-aware, `cms.write` para INSERT/UPDATE, ausência de grant para `anon`, índices que limitam uma revisão aberta e uma publicada por página, e funções de trigger `SECURITY INVOKER`.

## Variáveis de ambiente

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Nunca usar `service_role` no browser.

## Gates

```bash
npm run lint --workspace=apps/builder
npm run typecheck --workspace=apps/builder
npm test --workspace=apps/builder
npm run build --workspace=apps/builder
npm test --workspace=packages/database
```

Próximo slice: auditoria UX do workflow, edição/reordenação completa das seções versionadas e resolução do alerta HIGH preexistente do GitHub Advanced Security antes de merge/release.
