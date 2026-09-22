# Tupiniquim Site Builder / Preview Studio

Workspace React 18 + Vite + TypeScript para edição multi-tenant controlada.

## Slice atual

- sessão real via `tupiniquim-auth`;
- memberships, tenant selection, brand, theme, settings e entitlements via `tupiniquim-tenancy`;
- cliente Supabase browser via `tupiniquim-database` e somente publishable key;
- vertical key validada pelo contrato `assertBuilderScope` de `tupiniquim-saas-core`;
- estados explícitos: loading, unauthorized, forbidden, empty e selected;
- snapshot read-only; nenhuma mutation de tenant neste slice;
- private_settings não são renderizadas no painel;
- RLS permanece autoridade de enforcement.

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

Persistência de drafts, RLS específico do Builder e preview privado pertencem ao slice seguinte e só devem avançar após estes gates ficarem verdes.
