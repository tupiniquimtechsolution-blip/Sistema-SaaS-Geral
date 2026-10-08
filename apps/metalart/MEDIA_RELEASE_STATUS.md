# MetalArt — inventário e estado de mídia para RC Cloudflare

Atualizado em **08/10/2026**, a partir dos arquivos **já versionados** sob
`apps/metalart/public/client-assets/media/` e do `ASSET_AUDIT.md`.
Esta atualização **não altera os arquivos binários** nem cria imagens.

## Referências verificadas por família de arquivo

| Uso / família documental | Prefixo oficial do cliente | Estado |
| --- | --- | --- |
| Portão preto residencial | `1784984255` | JPG já versionado em `media/photos/`; exibido |
| Conjunto residencial (inclui portão social) | `1771640508` | JPG já versionado em `media/photos/`; exibido |
| Grades de proteção | `1771634656` | JPG já versionado em `media/photos/`; exibido |
| Corrimão/rampa | `1771634800` | JPG já versionado em `media/photos/`; exibido |
| Fechamento metálico | `1771634799` | JPG já versionado em `media/photos/`; exibido |
| Automação | `1774786200` | MP4 recebido, **sem poster JPG validado**; imagem omitida |
| Instalação/fabricação | `1775044474` | MP4 recebido, **sem poster JPG validado**; imagem omitida |
| Comparação antes/depois | `1774112432` | MP4 recebido, **sem dois frames pareados validados**; comparador oculto |
| Cards de publicações Instagram | identificadores de posts em `Social.tsx` | Links oficiais preservados; **miniaturas originais não comprovadas**, cards ocultos |

As cinco imagens usadas são referências de famílias de mídias identificadas no
inventário; a seleção final de enquadramento, narrativa e **atribuição de cada
case específico** depende de revisão visual pelo proprietário. Nenhuma foto
foi associada a um post específico sem prova. Cases sem imagem verificada
ficam fora do catálogo temporário; os serviços permanecem disponíveis em
formato textual, com fundos neutros da marca quando necessário.

## Contrato técnico

- `src/config/assets.ts` aponta diretamente para JPGs reais já versionados;
  sem caminhos `/media/fotos/` ou `/media/social/` inexistentes.
- `VerifiedImage.tsx` **não produz requisições** quando o asset é desconhecido
  (string vazia). Ele não interfere em requisições válidas nem nos testes.
- Não alterar `durable-deploy-smoke.spec.ts`: qualquer 404, erro de rede ou
  resposta same-origin anômala continua falhando o gate.
- Sem imagens geradas, substituições enganosas, fallback remoto, renomeação de
  material de terceiros, bypass de segurança, alteração RLS ou publicação.
- Não confundir aprovação do RC Preview com aprovação comercial/produção.

## Pendências de aceite

1. Revisão visual pelo cliente dos 5 arquivos selecionados, com confirmação de
   que o texto/alt descreve fielmente a foto real.
2. Validar poster de vídeo de automação e fabricação, se o cliente autorizar
   extração; até lá, essas imagens permanecem ausentes.
3. Confirmar par antes/depois do **mesmo vão**, da **mesma perspectiva**,
   documentando arquivo e quadro exatos antes de reativar o comparador.
4. Receber thumbnails oficiais das publicações ou manter somente o link para
   o Instagram.
5. Revisar títulos, escopo e localização de cada case do catálogo que ainda
   esteja marcado como conteúdo temporário de protótipo.

Evidência de bloqueio: Cloudflare RC Stage
[37788364144](https://github.com/tupiniquimtechsolution-blip/Sistema-SaaS-Geral/actions/runs/37788364144)
(MetalArt 404 em fotos/social). O novo commit deve passar pelos seis gates
do mesmo SHA antes de atualizar o Release GREEN.
