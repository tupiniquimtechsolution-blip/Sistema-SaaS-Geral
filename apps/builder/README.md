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
- criação/edição de drafts e seções de texto sob RLS `cms.write`;
- preview privado limitado ao caminho de `status = draft` e tenant selecionado;
- renderização de preview sem `dangerouslySetInnerHTML`;
- RLS permanece autoridade de enforcement; o cliente não usa service role.

## RLS validada no schema remoto

No projeto canônico, `pages` e `page_sections` já possuem policies de escrita para `authenticated` condicionadas a `has_tenant_permission(tenant_id, 'cms.write')`. Leitura de drafts só ocorre para `is_tenant_member(tenant_id)`; conteúdo publicado mantém o caminho público já existente. Nenhuma migration paralela foi criada neste slice.

## Variáveis de ambiente

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Nunca usar `service_role` no browser. A factory compartilhada rejeita marcadores de chave privilegiada.

## Gates

```bash
npm run lint --workspace=apps/builder
npm run typecheck --workspace=apps/builder
npm test --workspace=apps/builder
npm run build --workspace=apps/builder
```

O próximo slice deve evoluir versionamento/rollback e publicação sem enfraquecer o isolamento tenant ou editar conteúdo publicado fora do workflow aprovado.
