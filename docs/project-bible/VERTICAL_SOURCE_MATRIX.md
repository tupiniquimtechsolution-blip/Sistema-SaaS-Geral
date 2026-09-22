# Matriz de Verticais, Fontes e Proveniência

**Regra estrutural:** vertical é produto reutilizável; cliente é `tenant/configuração`. Não criar fork por cliente.

| Vertical/App | Fonte | Estado da fonte | Estado no monorepo | Próximo gate |
|---|---|---|---|---|
| Platform / Control Plane | `apps/platform` | CANÔNICO | implementado | manter como painel interno; não virar editor de cliente |
| Site Builder / Preview Studio | `apps/builder` | CANÔNICO | scaffold/contrato documental | implementar editor tenant-aware + draft/preview/publish |
| Bakery | `PadocaAppPremium` | importada por subtree | implementado | fechar fluxo comercial ponta a ponta |
| Pet | `SitePetPremium` | importada | implementado | smoke durável + white-label completo |
| Restaurant | `RestauranteSite` | importada | implementado | smoke durável + white-label completo |
| Heavy Machinery | `BigMachines` | importada | implementado | smoke durável + white-label completo |
| MetalArt | branch premium do projeto MetalArt | importada | implementado | smoke durável, mídia, tenant config |
| Salon | `Vanessa-Braz` | fonte real disponível | placeholder/incompleto | REUSE/ADAPT/NEW/DROP + tenant Vanessa |
| Religious House | `TemploCabocloTupinamba-FlechaDourada` | site standalone real | placeholder/incompleto | importar sem interromper site já publicado |
| LED | `https://github.com/tupiniquimtechsolution-blip/LED` | REPO IDENTIFICADO; conteúdo executável ausente | placeholder/incompleto | recuperar fonte real antes de importar |
| CRM Tupiniquim | repo próprio | app horizontal | fora de `apps/<vertical>` | consumir SaaS Core como app comercial horizontal |

## LED — decisão canônica

`https://github.com/tupiniquimtechsolution-blip/LED` é a fonte oficial informada pelo owner em 22/09/2026.

Estado auditado:
- repositório acessível;
- default branch `main`;
- conteúdo versionado visível: apenas `README.md`;
- **não há fonte suficiente para criar um vertical executável sem inventar código**.

Status:
- `SOURCE_REPOSITORY_IDENTIFIED = PASS`
- `SOURCE_IMPLEMENTATION_AVAILABLE = MISSING`
- `IMPORT_TO_APPS_LED = BLOCKED`

## Salon / Vanessa

Vanessa é **tenant/template de referência do vertical `salon`**, nunca SaaS separado.

Dados comerciais confirmados pelo owner:
- Instagram: `@vanessabraz_belezaeautoestima`;
- WhatsApp: `(11) 98814-9152`;
- Endereço informado: `Rua Redenção 88`.

Não inferir cidade/UF/CEP. Não duplicar schema/backends do projeto Vanessa no Supabase compartilhado. Reutilizar tenancy, memberships, RBAC/RLS, bookings, CRM, media e storage canônicos sempre que existirem.

## Religious House

O site standalone permanece preservado como produção/rollback. A importação deve ser incremental e sem redesign obrigatório. Dados religiosos/sensíveis recebem gates reforçados conforme Toolbox/LGPD.

## Política de provenance

Cada importação deve registrar:
1. repositório e ref de origem;
2. SHA importado;
3. método (subtree/squash/manual reconciliado);
4. arquivos preservados;
5. divergências/adaptações;
6. teste de equivalência visual/funcional;
7. autorização de publicação de mídia quando aplicável.
