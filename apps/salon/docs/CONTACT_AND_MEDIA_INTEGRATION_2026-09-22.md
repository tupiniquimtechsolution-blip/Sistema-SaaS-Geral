# Vanessa Braz — Contact & Media Integration — 2026-09-22

## Fonte de verdade

Branch operacional: `arena/01a0a695-vanessa-braz`.

## Dados confirmados pelo owner

- Instagram: `https://www.instagram.com/vanessabraz_belezaeautoestima/`
- Handle: `@vanessabraz_belezaeautoestima`
- Telefone: `(11) 98814-9152`
- WhatsApp técnico: `5511988149152`
- Endereço: `Rua Redenção 88`

Cidade, UF, e-mail e horários continuam `PENDENTE_DE_CONFIRMACAO`. Nenhum valor foi inferido.

## Integrações aplicadas

- CTA WhatsApp (`wa.me`) com mensagem inicial;
- telefone clicável (`tel:`);
- Instagram com URL canônica fornecida pelo owner;
- Google Maps por URL de busca gerada exclusivamente a partir do endereço informado;
- footer e página de contato usam a mesma fonte de configuração (`businessInfo`).

## Mídia

O acervo-fonte continua imutável em `apps/web/public/media/source/` e contém 185 mídias registradas no catálogo (157 imagens, 28 vídeos). O `vite.config.js` já usa `publicDir: "apps/web/public"`, portanto a pasta correta é copiada no build.

Nesta integração, oito derivados WebP auditados foram trazidos da branch `media/automated-image-pipeline-next4` e mesclados ao catálogo visual para hero/detalhes/galeria, preservando os originais como fonte de verdade.

### Importante: IA

A documentação do pipeline confirma que `optimized/enhanced` usa resize LANCZOS + sharpening determinístico e **não** super-resolução por IA. Não existe, nesta branch, um acervo verificável `optimized/ai-4k/`. Portanto, nenhuma imagem foi rotulada como “gerada por IA” sem proveniência. Se existiam artes geradas fora do repositório e elas desapareceram, o arquivo-fonte/branch precisa ser recuperado ou essas artes devem ser regeneradas e versionadas separadamente antes de publicação.

## Gate pós-commit

- `npm run typecheck`: NOT RUN neste conector
- `npm run build`: NOT RUN neste conector
- Cloudflare deploy: aguardando build automático da branch
- smoke visual: aguardando URL atualizada

Não marcar produção como validada sem esses gates.
