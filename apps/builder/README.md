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
- edição de conteúdo, reordenação, enable/disable e adição de seções sobre snapshot draft;
- preview simultâneo do snapshot privado;
- transições de workflow bloqueadas enquanto existirem mudanças locais não persistidas;
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

## Variáveis de ambiente do app

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Nunca usar `service_role` no browser.

## Gates locais e unitários

```bash
npm run lint --workspace tupiniquim-builder
npm run typecheck --workspace tupiniquim-builder
npm test --workspace tupiniquim-builder
npm run build --workspace tupiniquim-builder
npm test --workspace tupiniquim-database
```

Os testes Vitest ficam restritos a `src/`. Os testes de navegador ficam em `e2e/` e são executados exclusivamente pelo Playwright.

## Gates de browser, acessibilidade e Lighthouse

O workflow `.github/workflows/builder-release-gates.yml` executa um bundle de produção local e valida:

- Playwright no estado não autenticado e no shell autenticado;
- resolução canônica de membership/tenant;
- default-deny para tenant fora das memberships;
- axe com regras WCAG 2 A/AA e 2.1 A/AA, bloqueando violações `serious` e `critical`;
- Lighthouse com mínimos de Performance `0.80`, Accessibility `0.95` e Best Practices `0.90`.

O primeiro gate qualificado registrou 3/3 cenários Playwright aprovados e Lighthouse com Performance `0.99`, Accessibility `1.00` e Best Practices `0.96`.

## Smoke autenticado live — fail closed

O mesmo workflow possui o job `live-authenticated-readonly-smoke`. Ele usa somente uma sessão QA real e operações de leitura para provar login, memberships, tenant selecionado e rejeição de tenant não pertencente ao usuário. Não cria página, revisão nem publicação.

O job exige quatro GitHub Actions secrets:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `TEST_A_EMAIL`
- `TEST_A_PASSWORD`

A ausência de qualquer um deles encerra o job com falha explícita. Nunca colocar os valores no repositório, em arquivos `.env` versionados, comentários de PR ou documentação.

## Estado de release

Os gates de browser/a11y/Lighthouse e os gates gerais do monorepo estão implementados. O release/merge permanece bloqueado enquanto o smoke autenticado live não puder executar com as quatro Actions secrets QA e concluir verde.
