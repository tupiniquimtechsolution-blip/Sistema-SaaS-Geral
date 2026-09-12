# Migração — MetalArt

## Source repository

- repo: `tupiniquimtechsolution-blip/MetalArt`
- branch: `main`
- source HEAD SHA: `fa3616bd81005fc79565c0f953ca26ad34f61f88`
- destination: `apps/metalart`
- data da importação: 2026-09-12

## Método

`git subtree add --squash --prefix=apps/metalart <url> main`

Princípio: preservar proveniência e não apagar o repositório de origem.

## Tipo do projeto

O MetalArt não é um workspace Node/Vite. É um site estático com:

- `.agents/` e `.claude/` com skills
- `AGENTS.md`, `SECURITY.md`
- README e documentação
- `docs/APRESENTACAO_PROJETO.pdf`
- vídeos `.mp4` grandes (não commitados aqui)

Isso é diferente dos outros apps e não entra no npm workspace. Será servido pelo pipeline de static deployment configurado por vertical.

## Arquivos omitidos e motivo

- `.git/` aninhado
- vídeos `.mp4` em apps/metalart raiz — omitidos desta importação inicial para não inflar o monorepo com assets externos pesados. Estão preservados no repositório de origem.
- `node_modules/` (não existia)
- builds/caches (não existia)

## PDFs encontrados

- `apps/metalart/docs/APRESENTACAO_PROJETO.pdf` — preservado

Executar descoberta real:

```bash
find apps/metalart -type f \( -iname '*.pdf' -o -iname '*.PDF' \) | sort
```

## Stack

Não há package.json nem scripts de build Vite. Projeto estático com documentação própria e mídias.

## Build baseline

Para ser definido conforme configuração de deploy estático por vertical. O conteúdo é servido como está. Não há build npm nesta vertical.

## Divergências conhecidas

- Não há `package.json` nem workspace npm. O MetalArt entra como app estático.
- Vídeos `.mp4` removidos desta importação inicial para controle de tamanho do repo.

## Equivalência visual

Preservar layout estático e mídias do MetalArt. O SaaS Core entra por baixo onde aplicável, sem redesign.

## Vertical principal

Sim. MetalArt é um dos principais verticais do SaaS.

## Status de migração SaaS

- importação: PASS
- layout preservado: NOT RUN
- SaaS Core conectado: NOT RUN
- RLS/cross-tenant: MISSING
- backend SaaS end-to-end: NOT RUN
