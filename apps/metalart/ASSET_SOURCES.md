# ASSET_SOURCES — Metal & Art Serralheria

Registro de origem de todos os assets e dados externos usados no site.
Coleta da pesquisa: **22/08/2026**.

---

## 1. LOGOTIPO

- **Arquivo:** nenhum arquivo oficial disponível publicamente em resolução adequada.
- **Origem pesquisada:** site oficial, Instagram e ficha do Google.
- **Situação:** o site usa **reprodução tipográfica fiel ao estilo da marca** (wordmark
  condensado em caixa alta, "&" em laranja de solda, "SERRALHERIA" espaçado),
  desenhada em código em `src/components/ui.tsx` (componente `Logo`).
- **Ação:** `>> SOLICITAR LOGOTIPO VETORIAL/ORIGINAL AO CLIENTE <<`
  Ao receber, salvar em `public/client-assets/logo/` nas variações
  `logo-original`, `logo-light`, `logo-dark`, `logo-symbol` e substituir o componente.

## 1.5 MÍDIAS OFICIAIS DO SITE DO CLIENTE (em uso)

Hotlink direto do servidor oficial (metaleartserralheria.com.br), coletadas
do HTML público em **22/08/2026**. Antes da publicação definitiva, baixar e
salvar em `public/client-assets/` (ver CLIENT_REPLACEMENT_GUIDE.md).

| Chave em `assets.ts` | Arquivo original | Uso no site |
|---|---|---|
| `official.heroSparks` | `/wp-content/uploads/2026/02/locksmith-...-angle-grinder-scaled-1.jpeg` | Hero (slideshow, slide 1) + card "Bastidores" |
| `official.heroWorkshop` | `/wp-content/uploads/2026/02/WhatsApp-Image-2026-02-22-at-21.05.02.jpeg` | Hero (slideshow, slide 2) |
| `official.aboutImage` | `/wp-content/uploads/2026/02/ChatGPT-Image-22-de-fev.-de-2026-21_44_59-683x1024.png` | Seção "Sob medida" (imagem principal) |
| `official.logoUrl` | a localizar na biblioteca de mídia do site | Logotipo (assim que identificado) |

## 2. IMAGENS DE REFERÊNCIA (protótipo)

As **demais** imagens do site são referências ilustrativas do tipo de trabalho
que a empresa publica — NÃO são fotos reais da Metal & Art.
Chaves centralizadas em `src/config/assets.ts`.

| Chave | Categoria | Uso | Situação |
|---|---|---|---|
| `hero.main` | Soldagem/faíscas | Hero, cards | Substituir por foto/vídeo real da oficina |
| `gates.sliding` | Portão deslizante | Portfólio, serviços | Substituir por foto real (Instagram) |
| `gates.social` | Portão social | Portfólio, serviços | Substituir por foto real (Instagram) |
| `automation.motor` | Motor/automação | Portfólio, serviços | Substituir por foto real (Instagram) |
| `railings.handrail` | Corrimão | Portfólio, serviços | Substituir por foto real (Instagram) |
| `grids.window` | Grade de proteção | Portfólio, serviços | Substituir por foto real (Instagram) |
| `rollingDoors.storefront` | Porta de enrolar | Portfólio, serviços | Substituir por foto real (Instagram) |
| `beforeAfter.before/after` | Reforma antes/depois | Slider "Veja a transformação" | Substituir por par real do mesmo ângulo (Instagram) |
| `workshop.fabrication` | Oficina/bastidores | Institucional, cards | Substituir por foto real da oficina |

## 3. INSTAGRAM (conteúdo público catalogado)

Fonte: perfil oficial **@serralheriametaleart** (legendas e datas verificadas
em busca pública). Os cards da seção "Metal & Art em ação"
(`src/components/Social.tsx`) **linkam para as publicações originais**:

| Publicação | Tipo | Data | Conteúdo |
|---|---|---|---|
| `instagram.com/reel/DWd8MePjoju/` | Reel | 29/03/2026 | Substituição rápida de portão de alumínio |
| `instagram.com/p/DbN3hOkDuTQ/` | Post | 25/07/2026 | Reforma de portão (antes × depois) |
| `instagram.com/p/DU_-_JTDqCL/` | Post | 20/02/2026 | Grades de proteção em metalon — centro de SP |
| `instagram.com/p/DbN25GGjosC/` | Post | 25/07/2026 | Serviço concluído — parceria @samsclubbrasil |
| `instagram.com/serralheriametaleart/` | Perfil | — | Bastidores e portfólio contínuo |

- **Uso:** Home > "Metal & Art em ação".
- **Situação:** conteúdo público; cards exibem imagens de referência e abrem o
  post original. **Nenhum arquivo foi baixado/reutilizado fora da plataforma.**
- **Ação:** `>> SOLICITAR ARQUIVOS ORIGINAIS EM HD AO CLIENTE <<` para exibir
  as fotos/vídeos reais diretamente no site, com autorização de uso.
- Não são exibidos comentários, curtidas ou elementos de interface do Instagram.

## 4. GOOGLE (avaliações e ficha)

- **Origem:** widget oficial de avaliações (Google/Trustindex) exibido **no site
  da própria empresa** (metaleartserralheria.com.br), coletado em **22/08/2026**.
- **Dados:** classificação **EXCELENTE · 5,0 · 41 avaliações**.
- **Avaliações exibidas (7):** Rosangela Fracaro, Juliana Menezes, Vinicius
  Lopss, Viviane Trudes, Caio Brandao, Jackeline Rocha, mii — textos conforme
  publicados no widget.
- **Uso:** Home > "Quem contrata, recomenda" + Schema.org AggregateRating.
- **Situação:** dados externos configuráveis em `src/config/business.ts`
  (`google.rating`, `google.reviewCount`, `google.lastUpdated`).
- **Ação:** recoletar a ficha do Google antes da publicação e periodicamente;
  nunca congelar nota/quantidade sem registrar a data.
- **Endereço validado pelo mapa incorporado no site oficial:**
  R. Serra do Ouro Branco, 267 — Vila Carmosina, São Paulo/SP, 08270-330
  (o rodapé do site abrevia para "Rua Serra do Ouro, 267").

## 5. SITE ANTERIOR (conteúdo institucional reaproveitado)

- Slogan oficial: "Cuidando da sua estrutura com precisão."
- Texto institucional ("Sobre Nós") e lista de serviços — preservados e
  reescritos em nível premium em `src/data/services.ts` e páginas.
- Serviços confirmados no site oficial: reformas e reparos em portões;
  automações e fechaduras elétricas; corrimão e guarda-corpo; grades de
  proteção para janelas e portas; portão social; troca de mola de porta de
  enrolar.

## 6. VÍDEOS

- **Situação:** nenhum vídeo real disponível no protótipo.
- **Ação:** `>> SOLICITAR VÍDEOS REAIS (fabricação, faíscas, automação,
  instalação) <<` para Hero e cases (`assets.video` em `src/config/assets.ts`).

---

**Direitos:** conteúdo publicamente visível não é tratado como liberado para
reutilização comercial. Antes da publicação definitiva, validar com o cliente
a autorização de uso de cada foto/vídeo/avaliação exibida diretamente no site.
