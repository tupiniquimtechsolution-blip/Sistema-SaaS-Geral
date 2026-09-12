# Rastreabilidade de Assets — LUSOMAQ

Registro de origem de cada asset visual do site, conforme prioridade:
**P1** conteúdo oficial da empresa · **P2** Instagram oficial · **P3** Google Maps · **P4** site oficial · **P5** placeholder.

> Todas as imagens oficiais são servidas por hotlink direto do site da empresa
> (`https://www.lusomaq.com.br/assets/...`). Antes de publicar, baixe os
> arquivos e hospede em `public/client-assets/` (ver CLIENT_REPLACEMENT_GUIDE.md).

## Identidade

| Asset | Origem | Link | Uso |
|---|---|---|---|
| logo-Ck6vucEm.png | P4 — site oficial | https://www.lusomaq.com.br/assets/logo-Ck6vucEm.png | Navbar, footer, favicon |
| road-background-Bob74QJe.jpg | P4 — site oficial (fundo do hero original) | https://www.lusomaq.com.br/assets/road-background-Bob74QJe.jpg | Hero, storytelling, CTA final |

## Hero & storytelling (PNGs oficiais do carrossel do site)

| Asset | Uso no site |
|---|---|
| hero-1-DvT7Ydhf.png ("Peças para rolos compactadores") | Sobreposição do hero |
| hero-2-BZlGxdRH.png ("Entrega rápida e eficiente") | Painel AGILIDADE |
| hero-3-cxJApPb9.png ("Variedade e disponibilidade") | Painel ESTOQUE |
| hero-5-PtPh9hy2.png ("Qualidade e confiabilidade") | Painel QUALIDADE |
| hero-6-C_OXp637.png ("Peças originais e principais marcas") | Painel PREÇO JUSTO |

## Fotos de produtos (carrossel "Nossos Produtos" do site oficial — reais)

| Asset | Uso |
|---|---|
| 1-C58fN39r.jpg … 24-AvaEqN2H.png (24 fotos) | Cards do catálogo, famílias de peças, faixa de produtos, rolo por marca |

⚠ **IMPORTANTE:** os 24 itens de peças em `src/data/machines.ts` usam estas fotos reais,
mas nomes, códigos (LM-XXXX) e preços são um **catálogo-exemplo**. Substitua pelos
itens reais do estoque antes de publicar.

## Instalações

| Asset | Origem | Uso |
|---|---|---|
| predio-Dm1lldnl.jpg | P4 — site oficial (seção "Nossa Sede") | Página de contato e empresa |

## Mapa

| Asset | Origem | Uso |
|---|---|---|
| Embed Google Maps (lat -23.548194, lng -46.596889) | P3 — coordenadas do embed oficial do site | Página de contato |

## Placeholder gerado (P5)

| Asset | Origem | Uso | Substituição |
|---|---|---|---|
| rolo (seção "Anatomia do rolo") | Imagem gerada por IA — nenhum rolo real disponível | Hotspots interativos | Trocar por foto real de rolo em vista lateral do pátio/Instagram |

## Pendências de conteúdo real (prioridade P2 — Instagram @lusomaq.tratores)

- [ ] Foto lateral real de rolo compactador → substituir placeholder da Anatomia
- [ ] Fotos de entregas e clientes (reels) → seção de prova social
- [ ] Vídeo institucional para o hero (reel oficial)
- [ ] Fotos individuais de cada peça do estoque real (substituir catálogo-exemplo)
