# Tupiniquim Site Builder / Preview Studio

Workspace React 18 + Vite + TypeScript para edição e onboarding multi-tenant controlados.

## Implementado

- sessão real via `tupiniquim-auth`;
- memberships, tenant selection, brand, theme, settings e entitlements via `tupiniquim-tenancy`;
- cliente Supabase browser via `tupiniquim-database` e somente publishable key;
- vertical key validada pelo contrato `assertBuilderScope` de `tupiniquim-saas-core`;
- estados explícitos: loading, unauthorized, forbidden, empty e selected;
- onboarding autenticado sem fork quando a sessão válida ainda não possui memberships;
- provisionamento atômico de tenant + owner membership + brand + theme + settings + subscription + audit;
- defaults de tema/módulos derivados do `vertical_registry`; entitlements continuam derivados do plano, sem confundir configuração com autorização comercial;
- após criar o primeiro tenant, o Builder seleciona o novo contexto sem copiar repositório;
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

## Onboarding sem fork

`create_tenant_with_owner(name, slug, vertical_id, plan_id)` é o contrato canônico de provisionamento. A migration `20260924162424_onboarding_tenant_v1.sql` preserva o RPC existente e o endurece para:

- exigir sessão (`auth.uid()`);
- aceitar apenas vertical habilitada e plano ativo;
- validar nome e slug;
- criar tenant, brand, theme, settings, owner membership, subscription `trialing` e audit na mesma transação;
- aplicar `vertical_registry.default_theme` em `tenant_themes.component_style`;
- registrar `vertical_registry.default_modules` em `tenant_settings.public_settings.vertical_modules`;
- conceder `EXECUTE` somente a `authenticated` e `service_role`, sem `PUBLIC`/`anon`.

O Security Advisor classifica este RPC como WARN por ser `SECURITY DEFINER` executável por usuários autenticados. A elevação é intencional porque o usuário ainda não possui membership no instante do primeiro provisionamento. O contrato exige `auth.uid()`, usa `search_path` fixo e limita vertical/plano a registros canônicos ativos. Este WARN deve permanecer documentado e revisado; não deve ser descrito como “zero warnings”.

Domínio customizado e provider de billing real continuam em gates separados; onboarding apenas cria a subscription manual/trial canônica e prepara o tenant para Builder/preview.

## Contrato de revisão

`page_revisions` é um ledger tenant-scoped. Identidade, número da revisão e snapshots fora de `draft` são imutáveis. O banco rejeita transições que pulem o lifecycle. A projeção pública só acontece na transição `approved → published`.

A migration forward-only `builder_revision_workflow_v1` foi aplicada ao Supabase canônico como versão `20260922235641`. O arquivo canônico é `supabase/migrations/20260922235641_builder_revision_workflow_v1.sql`; a migration histórica `0001_multi_tenant_schema.sql` continua obsoleta e não deve ser reaplicada.

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

O workflow `.github/workflows/builder-release-gates.yml` executa um bundle de produção local e valida Playwright, axe e Lighthouse. O primeiro gate qualificado registrou 3/3 cenários Playwright aprovados e Lighthouse com Performance `0.99`, Accessibility `1.00` e Best Practices `0.96`.

## Smoke autenticado live — fail closed

O mesmo workflow possui o job `live-authenticated-readonly-smoke`. Ele usa uma sessão QA real e operações de leitura para provar login, memberships, tenant selecionado e rejeição de tenant não pertencente ao usuário. Não cria página, revisão nem publicação.

O job exige quatro GitHub Actions secrets: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `TEST_A_EMAIL`, `TEST_A_PASSWORD`. A ausência de qualquer um encerra o job com falha explícita. Nunca colocar valores no repositório, em `.env` versionado, comentários de PR ou documentação.

## Estado de release

Em 24/09/2026, os gates do Builder anteriores ao onboarding estavam GREEN: browser E2E, axe/a11y, Lighthouse, smoke autenticado live, Monorepo Quality Gates, CodeQL e GitHub Advanced Security. O onboarding foi validado primeiro em staging com lint/typecheck/test/build/audit e depois contra o Supabase remoto numa transação autenticada que confirmou tenant, owner role, brand, theme default, settings/default modules, subscription e audit; a transação foi revertida e deixou zero tenants QA.

O merge do PR da Wave 01 continua condicionado à Definition of Done global e aos gates finais do monorepo/verticais.
