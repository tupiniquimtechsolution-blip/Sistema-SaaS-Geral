# CLIENT_REPLACEMENT_GUIDE — Metal & Art Serralheria

Guia de substituição de conteúdo do protótipo pelos materiais oficiais.
Caminhos exatos para cada item:

## ⚡ ATIVAÇÃO DAS MÍDIAS DA PASTA DO DRIVE (1 passo)

Fonte oficial de mídia (logo + 36 fotos + 14 vídeos):
`https://drive.google.com/drive/folders/1kdx8AvTpfgRugHaptm32c5k3GpL0W6Xi`

O site já está 100% ligado a essa pasta e **não usa nenhuma imagem gerada**.
Para as mídias reais aparecerem:

1. Abra a pasta no Drive → selecione tudo → **Fazer download** (gera um .zip).
2. Descompacte e copie os arquivos para `public/client-assets/media/`,
   renomeando conforme o mapa em `src/config/assets.ts` (prefixo → slot).
3. Pronto — fotos, vídeos e logo reais surgem em todo o site.

Enquanto isso, os slots vazios exibem o fundo da marca (navy/blueprint) —
nunca imagem quebrada, nunca imagem gerada.

## LOGO
- **Onde está:** reprodução tipográfica em `src/components/ui.tsx` → componente `Logo`
  (variações `badge` e inline) + `SparkMark` (símbolo da faísca).
- **Substituir por:** arquivo vetorial oficial em `public/client-assets/logo/`
  (`logo-original.svg`, `logo-light.svg`, `logo-dark.svg`, `logo-symbol.svg`).
- Trocar o retorno do componente por `<img src="/client-assets/logo/...">`.

## INSTAGRAM
- **Catálogo de posts:** `src/components/Social.tsx` → constante `IG_POSTS`
  (URLs reais já apontam para as publicações oficiais).
- **Imagens dos cards:** `assets.instagram.*` em `src/config/assets.ts` →
  trocar pelas fotos/vídeos originais em HD (salvar em `public/client-assets/social/`).
- **Link do perfil:** `business.instagram` em `src/config/business.ts`.

## GOOGLE MAPS / FICHA
- **Endereço, rotas e embed:** `src/config/business.ts` → `address`,
  `mapsEmbedUrl`, `mapsDirectionsUrl`, `mapsReviewsUrl`.
- **Mapa na página:** `src/components/Social.tsx` → seção `Location` (iframe).
- **Nota/avaliações:** `business.google` + `business.googleReviews`
  (recoletar e atualizar `lastUpdated`).

## FOTOS
- **Arquivo central:** `src/config/assets.ts` — todas as chaves
  (`hero`, `gates`, `automation`, `railings`, `grids`, `rollingDoors`,
  `beforeAfter`, `workshop`). Salvar originais em `public/client-assets/`
  seguindo as subpastas `hero/ gates/ automation/ railings/ grids/
  rolling-doors/ before-after/ workshop/` e trocar as URLs.

## VÍDEOS
- `assets.video.hero` em `src/config/assets.ts` (salvar em
  `public/client-assets/video/` com poster em `posters/`).
- Reels para cases: adicionar em `src/data/projects.ts` (`videos`).

## PORTFÓLIO
- `src/data/projects.ts` — substituir `images`, `beforeImage/afterImage`,
  descrição e `source` de cada projeto pelos trabalhos reais
  (nunca inventar cliente, local ou escopo).

## CONTATOS
- `src/config/business.ts` — `phoneDisplay`, `whatsappDigits`, `email`,
  `website`, `instagram`, `facebook`, `hours`, `serviceAreas`.

## SERVIÇOS
- `src/data/services.ts` — textos, benefícios, aplicações e
  `whatsappMessage` de cada serviço; imagens via `assets`.

## SEO
- Meta tags + Schema.org: `index.html` (JSON-LD LocalBusiness com
  AggregateRating — recoletar nota antes de publicar).
- `public/robots.txt`; URLs semânticas via rotas (`#/servicos/[slug]`,
  `#/projetos/[slug]`).

## ANALYTICS
- Eventos prontos via `track()` em `src/lib/motion.ts`
  (whatsapp, orçamento, projeto aberto, rota, instagram etc.).
  Conectar o provider real (ex.: GA4) dentro dessa função.

## TEXTOS
- Slogan oficial e dados institucionais: `src/config/business.ts`.
- Conteúdo das páginas: `src/pages/*` e `src/components/*`.

## ASSETS TEMPORÁRIOS (remover/trocar antes de publicar)
- Todas as URLs `image.qwenlm.ai` em `src/config/assets.ts` (referências
  ilustrativas) — ver inventário completo em `ASSET_SOURCES.md` e
  checklist em `ASSET_AUDIT.md`.
