# Migration Manifest — Sistema SaaS Geral

## Objetivo

Consolidar os sites premium e toda documentação SaaS em um monorepo canônico sem destruir os repositórios de origem e sem redesenhar os layouts existentes.

## Estratégia

A primeira migração é **non-destructive**:

1. importar cada repositório de origem para `apps/<vertical>`;
2. preservar o repositório original intacto;
3. validar equivalência visual/funcional no monorepo;
4. aplicar SaaS Core por contratos/adapters;
5. somente após validação decidir se o repositório de origem será arquivado.

Quando tecnicamente possível, preferir `git subtree` para preservar proveniência/histórico. Se o ambiente não permitir, copiar snapshot da `main` e registrar SHA de origem em `docs/migrations/<vertical>.md`.

## Repositórios confirmados

| Vertical | Repositório de origem | Destino | Estado |
| --- | --- | --- | --- |
| Padaria | `tupiniquimtechsolution-blip/PadocaAppPremium` | `apps/bakery` | confirmado |
| Pet Shop | `tupiniquimtechsolution-blip/SitePetPremium` | `apps/pet` | confirmado |
| Restaurante | `tupiniquimtechsolution-blip/RestauranteSite` | `apps/restaurant` | confirmado |
| Painéis de LED | **não localizado no GitHub conectado** | `apps/led` | BLOCKED_SOURCE_REPOSITORY |
| Máquinas Pesadas | `tupiniquimtechsolution-blip/BigMachines` | `apps/heavy-machinery` | confirmado |
| Templo/Casa Religiosa | `tupiniquimtechsolution-blip/TemploCabocloTupinamba-FlechaDourada` | `apps/religious-house` | confirmado |

## Estrutura alvo

```text
Sistema-SaaS-Geral/
├── apps/
│   ├── bakery/
│   ├── pet/
│   ├── restaurant/
│   ├── led/
│   ├── heavy-machinery/
│   └── religious-house/
├── packages/
│   ├── saas-core/
│   ├── auth/
│   ├── tenancy/
│   ├── authorization/
│   ├── database/
│   ├── brand/
│   ├── theme/
│   ├── cms/
│   ├── media/
│   ├── billing/
│   ├── entitlements/
│   ├── integrations/
│   ├── audit/
│   ├── observability/
│   ├── analytics/
│   ├── ui-foundation/
│   └── vertical-contracts/
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── seed.sql
├── docs/
│   ├── presentations/
│   ├── migrations/
│   ├── architecture/
│   ├── security/
│   ├── runbooks/
│   └── prompts/
├── .agents/
├── .github/
├── AGENTS.md
├── SECURITY.md
└── README.md
```

A estrutura pode ser adaptada se o código provar que outra divisão reduz acoplamento sem perder os objetivos.

## Layouts — REGRA DE PRESERVAÇÃO

A importação NÃO autoriza redesign global.

Preservar:

- home e demais páginas atuais;
- grids/composição;
- componentes visuais diferenciadores;
- tipografia atual quando utilizável;
- paleta atual como tema default do tenant demo daquele vertical;
- animações, parallax e cenas 3D compatíveis com performance/reduced motion;
- responsive behavior;
- imagens/vídeos legítimos;
- SEO/copy verificados;
- fluxos comerciais existentes.

A engrenagem SaaS deve entrar por baixo/ao redor do layout existente através de providers, contracts, adapters e APIs tenant-aware.

Redesign é permitido somente para corrigir bug, acessibilidade, performance, responsividade, segurança ou requisito explícito.

## Arquivos a importar

Importar todo arquivo fonte útil, inclusive:

- `src/`, `public/`, assets;
- configs;
- docs;
- package manifests/lockfiles durante a fase de migração;
- PWA;
- testes;
- scripts;
- apresentações PDF;
- documentação de cliente/asset replacement;
- auditorias e planos úteis;
- histórico de decisões canônico.

Não importar para o monorepo final:

- `.git/` aninhado;
- `node_modules/`;
- `dist/`, `.next/`, builds/caches;
- `.env` reais;
- secrets;
- arquivos temporários;
- binários sem finalidade de produto/documentação.

## Apresentações PDF confirmadas

Atualmente confirmadas nas árvores dos repositórios:

- Pet: `SitePetPremium/docs/AMORA_PET_PROPOSTA_COMERCIAL.pdf`;
- Restaurante: `RestauranteSite/docs/CHEZ_AMIS_BISTRO_PROPOSTA_COMERCIAL.pdf`;
- Templo: `TemploCabocloTupinamba-FlechaDourada/docs/APRESENTACAO_PROJETO.pdf`.

Padoca e BigMachines não apresentaram PDF na árvore `main` verificada nesta migração inicial. O importador deve executar `find apps -iname '*.pdf'` após a consolidação para descobrir qualquer apresentação adicional sem depender deste inventário manual.

Nenhum PDF deve ser apagado ou convertido destrutivamente. O README raiz deve fornecer links para todas as apresentações encontradas.

## Documentação SaaS a consolidar

Do Padoca, preservar e promover para documentação canônica quando aplicável:

- `docs/PLANEJAMENTO_MESTRE_TUPINIQUIM_VERTICAL_SAAS.md`;
- `docs/TOOLBOX_AUDIT_2026-09-10.md`.

Dos demais verticais, preservar:

- `docs/SAAS_VERTICAL_PLAN.md`;
- `docs/TOOLBOX_AUDIT_*.md`;
- `SECURITY.md`;
- `CLIENT_REPLACEMENT_GUIDE.md`;
- `ASSET_SOURCES.md`;
- demais documentos específicos úteis.

O monorepo deve possuir documentos canônicos compartilhados e manter documentação específica dentro de cada app quando ela for do vertical.

## Proveniência obrigatória

Para cada app importado criar `docs/migrations/<vertical>.md` contendo:

- source repo;
- source branch;
- source HEAD SHA;
- data da importação;
- método (`git subtree`/snapshot);
- arquivos omitidos e motivo;
- PDFs encontrados;
- gates executados antes/depois;
- divergências conhecidas;
- equivalência visual;
- status de migração SaaS.

## Repositório LED

Não criar um site LED fictício. `apps/led` só deve receber código quando o repositório canônico for identificado. Enquanto isso, apenas os contratos genéricos B2B/LED podem ser implementados em `packages/vertical-contracts` sem inventar catálogo, branding, clientes ou especificações comerciais reais.
