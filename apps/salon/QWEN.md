# Qwen Code — Vanessa Braz Beleza e Autoestima

Este arquivo é o briefing persistente do projeto. Leia-o antes de editar qualquer arquivo.

## Fonte de verdade

- Trabalhe exclusivamente a partir deste repositório e do estado real do código.
- Preserve a automação existente de importação do Google Drive e todo o acervo já versionado.
- As mídias reais do estabelecimento estão em `apps/web/public/media/source/`.
- Leia `@docs/MEDIA_USAGE.md` antes de selecionar imagens ou vídeos.
- Leia `@docs/DESIGN_DIRECTION.md` antes de alterar UI/UX.

## Regra de mídia

Priorize fotografias e vídeos reais do estabelecimento. Não substitua mídia real por imagens stock, ilustrações genéricas ou imagens geradas por IA. Não invente logotipo, equipe, espaço, procedimento, preço, depoimento, endereço, promoção ou resultado.

## Direção visual obrigatória

A interface deve parecer criada por um bom estúdio de design, não por um gerador de templates. Evite padrões visuais associados a páginas genéricas de IA: excesso de gradientes, glow, glassmorphism, cards idênticos em grade, ícones decorativos repetidos, textos superlativos sem prova, seções simétricas demais e animações gratuitas.

Prefira fotografia real, composição editorial, hierarquia tipográfica clara, bastante respiro, assimetria controlada, contraste elegante, detalhes inspirados na identidade Vanessa Braz e microinterações discretas. A experiência deve ser feminina e sofisticada sem ficar infantil ou excessivamente rosa.

## Execução

1. Audite a implementação existente antes de mudar arquitetura ou dependências.
2. Preserve comportamento funcional e responsividade ao fazer mudanças visuais.
3. Use componentes reutilizáveis sem transformar todas as seções em cards iguais.
4. Garanta navegação por teclado, foco visível, contraste legível, `alt` útil e respeito a `prefers-reduced-motion`.
5. Otimize imagens para a web sem apagar os originais de `media/source`.
6. Use carregamento responsivo/lazy quando apropriado e evite imagens gigantes fora da dobra.
7. Não invente informações comerciais. Quando um dado não estiver comprovado no repositório, marque-o como pendente em vez de criar conteúdo fictício.
8. Antes de concluir, rode os testes/build/lint existentes. Se ainda não existirem, não finja resultados.

## Critério de aceite visual

A página deve transmitir beleza, cuidado, confiança e atendimento humano. O visitante deve perceber fotos reais e identidade própria antes de perceber efeitos de interface. Se uma seção parece um template de SaaS reaproveitado, redesenhe-a.
