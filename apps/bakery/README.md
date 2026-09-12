# Plataforma White-Label para Negócios Locais

Produto comercializável: **core white-label** (carrinho, checkout, hub de canais, encomendas, PWA, SEO,
analytics) + **tenant de demonstração**: *Fornalha — Padaria Artesanal*.

> Troque um arquivo de configuração e o mesmo código vira outra padaria — ou outro negócio.

---

## Arquitetura

```
src/
  business/          ← DADOS DO TENANT (o que muda por cliente)
    config.ts          identidade, contatos, horários, delivery, integrações, CTAs, seções da home
    products.ts        catálogo e categorias (puro dado)
    types.ts           contratos de todo o sistema
  core/              ← MOTOR (não muda por cliente)
    store.tsx          estado global: carrinho, pedidos, overrides do admin, toasts (persistido por tenant_id)
    theme.ts           design system dinâmico: presets por segmento aplicados via CSS vars
    utils.ts           moeda, horários, slots, WhatsApp, analytics, hooks
  components/        ← UI agnóstica (lê tudo da config)
  scenes/            ← experiência 3D (pão + migalhas) com fallback p/ reduced-motion e sem WebGL
  pages/             ← rotas (HashRouter): /, /produtos, /produto/:slug, /categoria/:slug,
                       /checkout, /encomendas, /sobre, /contato, /meus-pedidos, /pedido/:code, /admin
```

Separação real: **CORE · THEME · BUSINESS DATA · PRODUCT DATA · INTEGRATIONS · CONTENT**.
Multi-tenant ready: toda persistência usa `${tenantId}.*` no storage; `tenant_id`/`business_id` já existem na config.

---

## Como criar NOVA PADARIA (sem tocar no core)

Edite apenas `src/business/config.ts` + `src/business/products.ts`:

1. **Nome e identidade** — `name`, `tagline`, `slogan`, `branding.logoText`, `announcement`.
2. **Fotos** — substitua as URLs do objeto `IMG` (hero, produtos, forno, balcão) e `media.scenes`.
3. **Produtos e preços** — edite o array em `products.ts` (ou o painel em `/#/admin` para testes).
4. **Endereço e horários** — `address.*` (com `mapsUrl`, `lat`, `lng`) e `openingHours` (0 = domingo).
5. **WhatsApp** — `contact.whatsapp` e `integrations.whatsapp.number`.
6. **Links de delivery** — `integrations.ifood/keeta/food99` (`enabled` + `url` oficial).
7. **Textos e promoções** — `description`, `stats`, `reviews` (use avaliações REAIS do Google), `coupons`.
8. **Home** — reordene/remova blocos em `homeSections`.

## Como adaptar para OUTRO SEGMENTO

1. `businessType: "barbershop" | "restaurant" | "clinic" | "petshop" | …`
2. `branding.palette` — escolha o preset em `core/theme.ts` (ou crie um novo); o site inteiro re-tematiza.
3. `features` — ligue/desligue módulos: `ecommerce`, `delivery`, `pickup`, `customOrders`, `booking`, `loyalty`…
4. `cta` — "Agendar horário" (barbearia), "Reservar mesa" (restaurante), "Ver disponibilidade" (hotel)…
5. **Mídia e experiência** — substitua `media.*`; a experiência 3D é por segmento (padaria: pão gira;
   hamburgueria: burger se monta; cafeteria: xícara se enche — a cena em `scenes/` é um módulo trocável).
6. Copy — `tagline`, títulos de seção e textos vivem na config/páginas, nunca hardcoded nos componentes
   (componentes só leem tokens de tema e textos da config).

Teste ao vivo: abra `/#/admin` → **Identidade & tema** → troque o preset (Barbearia, Clínica, Sushi…)
e veja cores, raios e contraste se adaptarem em tempo real.

## Como cadastrar produtos

Em `src/business/products.ts` — cada item aceita:

```ts
{ id, slug, name, description, shortDescription, category, images[], price, promotionalPrice?,
  available, featured?, bestseller?, isNew?, ingredients[], allergens[],
  variations[{ name, options[{label, delta}] }], extras[{name, price}],
  preparationTime, tags[], unit?, comboItems[]?, pairsWith[]? /* cross-sell */ }
```

Categorias em `categories[]` no mesmo arquivo. Preços/promoções/disponibilidade também editáveis pelo painel demo.

## Como alterar delivery e WhatsApp

- **Delivery**: `delivery: { enabled, fee, freeAbove, time }` — o carrinho calcula frete grátis e a barra de progresso sozinha.
- **Retirada**: `pickup.units[]` — unidades aparecem no checkout e no contato.
- **WhatsApp**: número em `integrations.whatsapp.number` — as mensagens (carrinho, encomenda, acompanhamento)
  são montadas automaticamente com itens, variações, total e URL encoding.
- **Apps de delivery**: só aparecem no hub quando `enabled: true` + `url` oficial preenchida.

## Como publicar

1. `npm run build` → pasta `dist/` (estática, qualquer CDN/hospedagem).
2. Ajuste os domínios em `public/robots.txt`, `public/sitemap.xml`, `index.html` (canonical/OG) e no JSON-LD.
3. PWA pronto: `manifest.webmanifest` + `sw.js` + ícones — "Adicionar à tela inicial" aparece automaticamente.
4. Substitua avaliações de exemplo pelas reais e configure a chave Pix/gateway de pagamento no backend.
5. Backend futuro: `core/store.tsx` isola todas as mutações — troque `localStorage` por chamadas de API
   sem tocar em componentes. Eventos de analytics já são emitidos (`view_product`, `add_to_cart`,
   `begin_checkout`, `purchase`, `click_whatsapp/ifood/keeta/99food`, `request_order`, `search`, `view_location`…).

## Decisões de produto

- **Sem dark patterns**: sem urgência falsa, estoque falso ou pop-up agressivo.
- **Estados completos**: vazio, erro (404 de produto/pedido/rota), sucesso, esgotado, offline (SW).
- **Acessibilidade**: HTML semântico, ARIA, foco visível, navegação por teclado, `prefers-reduced-motion`
  (o 3D vira composição estática elegante), touch targets ≥ 44px.
- **Performance**: three.js em chunk separado carregado só na home, DPR limitado, menos partículas no
  mobile, loop 3D pausado fora da viewport, lazy loading de imagens.
