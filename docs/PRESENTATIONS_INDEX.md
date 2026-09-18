# Apresentações dos Verticais

Este índice existe para garantir que apresentações comerciais e de portfólio sejam preservadas durante a consolidação do SaaS e incorporadas ao README raiz após a importação dos apps.

## Confirmadas

### Pet Shop

- Origem: `tupiniquimtechsolution-blip/SitePetPremium`
- Arquivo: `docs/AMORA_PET_PROPOSTA_COMERCIAL.pdf`
- Destino após importação: `apps/pet/docs/AMORA_PET_PROPOSTA_COMERCIAL.pdf`

### Restaurante

- Origem: `tupiniquimtechsolution-blip/RestauranteSite`
- Arquivo: `docs/CHEZ_AMIS_BISTRO_PROPOSTA_COMERCIAL.pdf`
- Destino após importação: `apps/restaurant/docs/CHEZ_AMIS_BISTRO_PROPOSTA_COMERCIAL.pdf`

### Templo/Casa Religiosa

- Origem: `tupiniquimtechsolution-blip/TemploCabocloTupinamba-FlechaDourada`
- Arquivo: `docs/APRESENTACAO_PROJETO.pdf`
- Destino após importação: `apps/religious-house/docs/APRESENTACAO_PROJETO.pdf`

## Sem PDF confirmado na árvore verificada

- PadocaAppPremium
- BigMachines

Isso não significa que uma apresentação nunca existiu; significa apenas que não foi encontrada na árvore `main` consultada na preparação do monorepo.

## LED

Aguardando identificação do repositório canônico.

## Gate pós-importação

Após importar todos os repositórios disponíveis, executar:

```bash
find apps -type f \( -iname '*.pdf' -o -iname '*.PDF' \) | sort
```

Comparar o resultado com este inventário e atualizar o README raiz com links relativos para **todos** os PDFs encontrados.

Não excluir apresentações antigas por duplicidade sem confirmar se o conteúdo é realmente idêntico.
