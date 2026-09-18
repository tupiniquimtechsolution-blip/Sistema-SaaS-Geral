# Guia de Substituição — Porto Baa'R Black (site demonstrativo)

Este projeto foi construído para que **toda a personalização de um cliente real aconteça em poucos arquivos de configuração**, sem tocar nos componentes. Conteúdos atuais são **demonstrativos** (textos, avaliações, preços e fotos).

---

## 1. Identidade visual (cores, fontes, raios, sombras)

**Arquivo:** `src/config/theme.ts`

- `colors.*` → paleta completa (fundo, painéis, texto, primária, acentos, semânticas)
- `radius` → raio padrão dos cards/inputs
- `shadows.*` → brilho dos CTAs e elevação de cards

As variáveis `--t-*` são injetadas no `<head>` pelo `App.tsx` e consumidas pelo Tailwind v4 via `src/index.css` (`@theme inline`). Trocar a identidade = editar **somente** este arquivo.

**Fontes:** carregadas em `index.html` (bloco Google Fonts). O mapeamento `--font-display/--font-body/--font-mono` vive em `src/index.css`.

**Logo:** o componente `Logo()` em `src/components/ui.tsx` reconstrói fielmente o wordmark "CHEZ Amis" (lettering + script
Parisienne + cloche), porque o download do arquivo oficial é bloqueado pelo Instagram. Para usar o logo oficial: salve em
`public/client-assets/logo/logo.svg` (ou `.png`) e troque o corpo do `Logo()` por um `<img src="/client-assets/logo/logo.svg" />`.
**Favicon:** `public/favicon.svg` (cloche verde-garrafa/latão — trocar pelo oficial mantendo o formato SVG).

---

## 2. Dados do estabelecimento

**Arquivo:** `src/config/business.ts`

| O que trocar | Onde |
|---|---|
| Nome, slogan, descrição | `name`, `slogan`, `description` |
| Telefone / WhatsApp | `contact.*` — o WhatsApp usa **apenas dígitos com DDI** (`55…`) |
| Instagram/Facebook/TikTok | `social.*` |
| Endereço completo + coordenadas | `address.*` |
| Mapa | `address.mapEmbedUrl` (hoje: OpenStreetMap; troque pelo embed do Google Maps) e `address.directionsUrl` |
| Horários | `hours[]` |
| Regiões de delivery, taxas e tempos | `delivery.areas[]`, `delivery.minOrder` |
| Contadores (anos, burgers/mês…) | `stats[]` |
| Mensagem padrão do WhatsApp | `whatsappGreeting` |

---

## 3. Imagens (hero, produtos, equipe, galeria…)

**Arquivo:** `src/config/images.ts` — única fonte de imagens do site.

Hoje aponta para fotografias demonstrativas hospedadas. Para usar assets oficiais:

1. Crie `public/client-assets/` com as pastas: `hero/`, `produtos/`, `estabelecimento/`, `equipe/`, `galeria/`, `banners/`.
2. Substitua as URLs em `src/config/images.ts` pelos caminhos locais, ex.:
   `heroBurger: "/client-assets/hero/burger-oficial.png"`.

Nenhum componente referencia imagem diretamente — tudo passa por este arquivo.

---

## 4. Cardápio, preços e adicionais

**Arquivo:** `src/config/menu.ts`

- `menuCategories[]` → categorias e textos de apoio
- `menuItems[]` → cada item: `name`, `description`, `ingredients[]`, `price`, `image`, `tags[]`, `extras[]`, `featured`
- Itens com `featured: true` aparecem na aba "Destaques" da home
- Tags disponíveis: `mais-pedido`, `novo`, `vegetariano`, `picante`, `da-casa`

---

## 5. Conteúdo editorial

**Arquivo:** `src/config/content.ts`

- `promos[]` → carrossel de promoções/combos/cupons (com campo `code` opcional)
- `storySteps[]` → storytelling sticky em 4 capítulos (título, texto, imagem, stat)
- `testimonials[]` → avaliações (**demonstrativas** — substitua por reais e remova o aviso no componente)
- `team[]` → equipe (nome, cargo, bio, foto)
- `instagramTiles[]` → grade do Instagram (hoje estática; conecte um widget oficial depois)
- `faqs[]` → accordion da página de contato
- `philosophy[]` → manifesto da página Sobre

---

## 6. SEO e metadados

**Arquivo:** `index.html`

- `<title>`, `meta description`, `keywords`, `canonical`
- Open Graph e Twitter Card (`og:*`, `twitter:*`)
- Dados estruturados **Schema.org** (`Restaurant`/`BarOrPub`) no bloco `<script type="application/ld+json">` — atualize endereço, `geo`, `openingHoursSpecification`, `telephone` e `sameAs`
- `public/robots.txt` e `public/sitemap.xml` → troque o domínio `portobaarblack.com.br` pelo definitivo

---

## 7. WhatsApp

**Arquivo:** `src/lib/whatsapp.ts`

- `createWhatsAppUrl(message?)` → gera o link `wa.me` com o número de `business.ts`
- `buildOrderMessage(...)` → formato da mensagem do pedido (itens, adicionais, observações, subtotal, taxa, total, cliente, endereço, pagamento)

Nunca adicione links `wa.me` manualmente nos componentes.

---

## 8. Analytics / Pixels

Não incluído (demonstrativo). Para adicionar:

- Insira o snippet (GA4/Meta Pixel) no `<head>` de `index.html`, ou
- Crie `src/lib/analytics.ts` e inicialize no `App.tsx`.

---

## 9. Checklist final antes de publicar

- [ ] `theme.ts` com a paleta real
- [ ] `business.ts` com contatos, endereço, horários e delivery reais
- [ ] `images.ts` apontando para `public/client-assets/`
- [ ] `menu.ts` com cardápio e preços reais
- [ ] `content.ts` com promos/FAQ/equipe reais (+ remover avisos de "demonstrativo")
- [ ] `index.html` com title/description/canonical/JSON-LD reais
- [ ] `robots.txt` / `sitemap.xml` com domínio final
- [ ] Testar fluxo completo: adicionar item → personalizar → carrinho → checkout → WhatsApp
