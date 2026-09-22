# Site Builder / Preview Studio

Status: **EM ANDAMENTO — scaffold arquitetural**.

## Objetivo

App separado do Control Plane para configurar sites por tenant sem fork. Deve permitir selecionar tenant/vertical, editar branding/conteúdo/mídia/contatos/integrações, gerar preview privado, aprovar uma revisão e solicitar publicação.

## Primeira entrega técnica

Este diretório é criado como marcador de produto deliberado, sem `package.json` fictício, para não quebrar o lockfile/CI antes da implementação executável. A próxima alteração deve criar o app React/Vite somente junto da atualização válida do workspace/lockfile e dos testes correspondentes.

## Arquitetura

- UI: React/Vite alinhado ao monorepo.
- Auth: reutilizar `packages/auth`.
- Tenant context: reutilizar `packages/tenancy`.
- Banco/config: `packages/database` + contratos do SaaS Core.
- Persistência: Supabase com RLS; nenhuma service role no browser.
- Drafts: revisionados por tenant.
- Preview: read-only, privado/revogável.
- Publish: permissão específica + audit log + deploy adapter Cloudflare.

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
- publish permission;
- rollback de revision;
- typecheck/unit/integration/build;
- E2E de criar draft→preview→aprovar→publicar em ambiente seguro;
- a11y e responsive.

Ver `docs/project-bible/ARCHITECTURE_AND_STRUCTURE.md` e `docs/project-bible/ROADMAP_AND_TASKS.md`.
