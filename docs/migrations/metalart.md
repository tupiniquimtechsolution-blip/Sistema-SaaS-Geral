# Migração — MetalArt

## SOURCE REPO

`tupiniquimtechsolution-blip/MetalArt`

## SOURCE IMPLEMENTATION BRANCH

`website-premium-metal---art-b31ef`

## SOURCE HEAD

`c746c318978ef9ed7e9bfa9fe166808b177949f0`

## SOURCE STATUS

Open PR #1 / unmerged implementation candidate no repo de origem.

## MAIN STATUS

Governance/media/history source. Não é a implementação executável atual.

## IMPORT METHOD

1. Primeira tentativa: `git subtree add --squash --prefix=apps/metalart <url> main` (snapshot de governança, preservado nos commits `4c6f9c6`, `e010e88`).
2. Correção canônica: remoção não-destrutiva do snapshot (commit `3e0313f`) + `git subtree add --squash --prefix=apps/metalart <url> website-premium-metal---art-b31ef` (commits `df2ca63` squash + `00cff2e` merge).
3. Normalizei `package.json` name para `tupiniquim-metalart` (commit `297cfa6`).

Nenhuma reescrita de histórico. Nenhum force push. Repositório de origem intacto.

## MEDIA STRATEGY

- Todos os vídeos (`.mp4`), fotos (`.jpg`) e logo do site premium foram importados e preservados.
- Total aproximado de mídia importada: ~75 MB (fotos + vídeos usados pelo site).
- Mídias de governança do `main` original permanecem no histórico do monorepo e no repo de origem.
- Migração futura para Supabase Storage/CDN será feita depois com estratégia explícita; nesta Wave a prioridade é preservação visual.
- Nenhuma mídia foi apagada nesta importação premium. Sem `filter-branch`/`filter-repo`.

## PDFS

Nenhum PDF na branch premium. `APRESENTACAO_PROJETO.pdf` existe apenas no `main` (snapshot de governança preservado no histórico do monorepo, commits `4c6f9c6`/`e010e88`).

## BUILD BASELINE

- Stack: Vite + React 18 + TypeScript + Tailwind 4 + GSAP + Lenis + Framer Motion.
- `npm run build --workspace apps/metalart`: PASS (vite build, 58 módulos).
- `npm run typecheck --workspace apps/metalart`: PASS.

## TYPECHECK

PASS (tsc --noEmit, zero erros).

## VISUAL PRESERVATION

- Layout, hero, parallax, motion, Lenis, GSAP, Framer Motion, imagens, vídeos, identidade, páginas, Quote Wizard, Services, Portfolio, CTAs, WhatsApp/contato e responsividade preservados sem redesign.
- Nenhum arquivo de src/ foi alterado além do package.json (apenas campo name).
