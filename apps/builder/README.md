# Site Builder / Preview Studio

Status: **EM ANDAMENTO — domínio executável iniciado; app React/Vite ainda não criado**.

## Objetivo

App separado do Control Plane para configurar sites por tenant sem fork. Deve permitir selecionar tenant/vertical, editar branding/conteúdo/mídia/contatos/integrações, gerar preview privado, aprovar uma revisão e solicitar publicação.

## Estado técnico verificado em 2026-09-22

O diretório continua sem `package.json` deliberadamente: o monorepo exige `npm ci` com `package-lock.json` sincronizado, então o app React/Vite só deve nascer junto da atualização válida do workspace/lockfile.

A implementação real da Task/Wave do Builder foi iniciada no SaaS Core, sem criar uma arquitetura paralela:

- `packages/saas-core/src/builder.ts` define escopo `tenantId + verticalKey`, lifecycle de revisão e criação imutável da próxima revisão;
- o boundary de autorização reutiliza `assertTenantPermission` e aceita somente permissões já existentes no catálogo canônico;
- `packages/saas-core/src/builder.test.ts` cobre isolamento cross-tenant, default deny por permissão, revisão → aprovação → publicação e rollback;
- nenhuma permissão `builder.*` foi inventada;
- nenhuma migration, DNS, Cloudflare ou Supabase de produção foi alterado.

## Arquitetura

- UI: React/Vite alinhado ao monorepo.
- Auth: reutilizar `packages/auth`.
- Tenant context: reutilizar `packages/tenancy`.
- Banco/config: `packages/database` + contratos do SaaS Core.
- Persistência: Supabase com RLS; nenhuma service role no browser.
- Drafts: revisionados por tenant.
- Preview: read-only, privado/revogável.
- Publish: autorização server-side baseada no catálogo canônico + audit log + deploy adapter Cloudflare; não inventar permission key local.
- Rollback: preservar revisão publicada anterior como âncora de retorno.

## Módulos previstos

```text
src/
  app/
  features/
    tenant-selector/
    brand-studio/
    content-studio/
    media-manager/
    integrations/
    preview/
    publishing/
  domain/
    site-draft.ts
    revision.ts
  adapters/
    saas-core/
    cloudflare/
  components/
  styles/
```

## Gates antes de marcar MVP_PASS

- auth/membership reais;
- draft tenant-aware com RLS;
- schema validation;
- audit trail;
- upload ownership/MIME/tamanho;
- preview cross-tenant DENY;
- autorização de publish validada server-side;
- rollback de revision;
- typecheck/unit/integration/build;
- E2E de criar draft → preview → aprovar → publicar em ambiente seguro;
- a11y e responsive.

## Próxima fatia executável

Criar `apps/builder` como workspace React/Vite usando o lockfile reconciliado na mesma alteração. O primeiro fluxo de UI deve consumir `packages/auth` + `packages/tenancy`, bloquear acesso sem sessão/membership válida e começar por tenant selector + leitura de brand/theme/settings. Persistência de draft e publicação entram somente após contrato de banco/RLS validado.

Ver `docs/project-bible/ARCHITECTURE_AND_STRUCTURE.md` e `docs/project-bible/ROADMAP_AND_TASKS.md`.
