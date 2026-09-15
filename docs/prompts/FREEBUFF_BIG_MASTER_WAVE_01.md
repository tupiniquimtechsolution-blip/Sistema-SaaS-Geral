# FREEBUFF — BIG MASTER WAVE 01
## TUPINIQUIM VERTICAL SaaS — MONOREPO + CORE + PRIMEIRA MIGRAÇÃO QUASE COMPLETA

> Copie este documento integralmente para o Freebuff com o repositório `tupiniquimtechsolution-blip/Sistema-SaaS-Geral` aberto.

---

# 0. PAPEL E MODO DE OPERAÇÃO

Atue como **Principal SaaS Architect + Staff Full-Stack Engineer + DevSecOps + QA Lead + Migration Engineer + Product Engineer**.

MODO: **EXECUÇÃO REAL E AUTÔNOMA**.

Você NÃO deve apenas:

- auditar;
- sugerir;
- desenhar arquitetura em Markdown;
- listar próximos passos;
- criar TODOs para tarefas que consegue executar.

Você deve:

1. reconhecer o estado real;
2. importar os projetos legados;
3. preservar os layouts;
4. construir a engrenagem SaaS;
5. migrar vertical slices funcionais;
6. testar;
7. corrigir;
8. documentar;
9. fazer commits lógicos;
10. deixar handoff exato se o tempo acabar.

Não peça aprovação para decisões técnicas reversíveis e de baixo risco. Pare apenas diante de operação destrutiva, segredo/credencial ausente que seja realmente indispensável, ou conflito de requisitos sem solução segura.

---

# 1. REPOSITÓRIO CANÔNICO

Repo:

`tupiniquimtechsolution-blip/Sistema-SaaS-Geral`

Branch de execução:

`freebuff/big-master-wave-01-monorepo`

Se já existir, CONTINUE nela.

Não crie nova branch sem necessidade.

Antes de qualquer alteração, registre:

```text
BRANCH:
HEAD:
WORKING TREE:
NODE:
NPM:
LOCKFILE:
ARQUIVOS CANÔNICOS ENCONTRADOS:
```

Leia obrigatoriamente:

- `AGENTS.md`
- `.agents/skills/tupiniquim-toolbox/SKILL.md`
- `SECURITY.md`
- `docs/MIGRATION_MANIFEST.md`
- `docs/PLANEJAMENTO_MESTRE_TUPINIQUIM_VERTICAL_SAAS.md`
- `docs/PRESENTATIONS_INDEX.md`
- README
- workflows GitHub existentes

Esses documentos são guardrails. Código executável, migrations e testes continuam sendo a prova final do estado real.

---

# 2. MISSÃO DA WAVE

Esta wave deve aproximar o projeto o máximo possível de um **SaaS multi-tenant comercializável**, não apenas de um monorepo organizado.

Resultado pretendido:

- monorepo com todos os verticais disponíveis importados;
- layouts e experiências atuais preservados;
- SaaS Core funcional;
- Supabase/Postgres real para desenvolvimento;
- autenticação;
- tenancy;
- memberships;
- RBAC/permissions;
- RLS;
- Brand Studio;
- Theme Engine;
- CMS;
- Media Manager;
- plans/entitlements;
- billing abstraction;
- audit log;
- observabilidade base;
- Padaria migrada end-to-end para o backend SaaS;
- contratos compartilhados prontos para Pet, Restaurante, LED, Máquinas e Templo;
- testes unitários, integração, cross-tenant e E2E críticos;
- CI e segurança endurecidos;
- README premium consolidando o produto e as apresentações PDF.

A Wave só deve parar por limite de execução depois de concluir o maior número possível de **vertical slices completos**, não dezenas de estruturas vazias.

---

# 3. REPOSITÓRIOS DE ORIGEM E IMPORTAÇÃO

Importe os seguintes repositórios PARA DENTRO do monorepo, preservando os originais:

```text
Padaria
source: tupiniquimtechsolution-blip/PadocaAppPremium
branch: main
destination: apps/bakery

Pet Shop
source: tupiniquimtechsolution-blip/SitePetPremium
branch: main
destination: apps/pet

Restaurante
source: tupiniquimtechsolution-blip/RestauranteSite
branch: main
destination: apps/restaurant

Máquinas Pesadas
source: tupiniquimtechsolution-blip/BigMachines
branch: main
destination: apps/heavy-machinery

Templo/Casa Religiosa
source: tupiniquimtechsolution-blip/TemploCabocloTupinamba-FlechaDourada
branch: main
destination: apps/religious-house
```

LED:

`apps/led`

O repositório canônico de LED ainda NÃO foi identificado no GitHub conectado.

Não invente nem clone um repo parecido.

Marque:

`BLOCKED_SOURCE_REPOSITORY_LED`

mas crie apenas os CONTRATOS genéricos necessários para o vertical futuro.

## Método preferencial

Preserve proveniência/histórico quando o ambiente permitir:

```bash
git subtree add --prefix=apps/bakery <repo-url> main
git subtree add --prefix=apps/pet <repo-url> main
git subtree add --prefix=apps/restaurant <repo-url> main
git subtree add --prefix=apps/heavy-machinery <repo-url> main
git subtree add --prefix=apps/religious-house <repo-url> main
```

Você pode usar remotes nomeados se for mais seguro.

Se `git subtree` não estiver disponível ou houver bloqueio de autenticação:

1. clone temporariamente fora do monorepo;
2. copie a árvore versionada sem `.git`, `node_modules`, builds e secrets;
3. registre source HEAD SHA;
4. registre que foi snapshot import.

NUNCA delete os repositórios de origem nesta Wave.

## Gate de importação

Para cada vertical criar:

`docs/migrations/<vertical>.md`

com:

- source repo;
- source branch;
- source HEAD;
- método de importação;
- arquivos omitidos;
- apresentações PDF encontradas;
- stack;
- scripts;
- build baseline;
- divergências;
- status visual;
- status SaaS.

---

# 4. PRESERVAÇÃO OBRIGATÓRIA DOS LAYOUTS

Esta é uma regra crítica.

NÃO converta os sites em um único template genérico.

Cada vertical deve continuar visualmente reconhecível como o site atual.

Preserve:

- estrutura e ordem principal das páginas;
- heros;
- grids;
- componentes exclusivos;
- motion/parallax/3D que passe performance/reduced motion;
- tipografia default;
- paleta default;
- assets legítimos;
- responsive behavior;
- linguagem visual;
- jornadas de conversão;
- SEO/copy verificados.

## O que deve mudar

O layout deve deixar de depender de valores hard-coded de cliente.

Substitua hard-code de:

- logo;
- cores;
- fontes;
- mídia;
- telefones;
- WhatsApp;
- redes sociais;
- endereço;
- horários;
- textos editáveis;
- catálogo;
- serviços;
- módulos;
- integrações

por dados tenant-aware.

## Proibição

Não use:

```ts
if (tenant.slug === 'cliente-x') { ... }
```

para branding rotineiro.

Use tokens, config, CMS e vertical contracts.

## Visual regression

Antes de grandes migrações de UI:

- capture screenshots de páginas chave quando possível;
- após migração compare desktop e mobile;
- registre diferenças intencionais;
- corrija regressões não justificadas.

---

# 5. MONOREPO E WORKSPACES

Crie uma raiz de workspace coerente.

Preferência, por compatibilidade com os projetos atuais:

- Node 22;
- npm workspaces;
- TypeScript;
- Vite apps preservados quando já forem Vite.

Estrutura alvo:

```text
apps/
  bakery/
  pet/
  restaurant/
  led/
  heavy-machinery/
  religious-house/

packages/
  saas-core/
  auth/
  tenancy/
  authorization/
  database/
  brand/
  theme/
  cms/
  media/
  entitlements/
  billing/
  integrations/
  audit/
  observability/
  analytics/
  ui-foundation/
  vertical-contracts/

supabase/
  migrations/
  functions/
  seed.sql

scripts/
infra/
docs/
```

Não extraia componentes para packages só por estética. Shared package precisa ter contrato estável e reutilização real.

## Root scripts esperados

Quando implementáveis:

```text
npm run lint
npm run typecheck
npm test
npm run test:integration
npm run test:security
npm run test:e2e
npm run build
npm run dev:bakery
npm run dev:pet
npm run dev:restaurant
npm run dev:heavy-machinery
npm run dev:religious-house
```

Use scripts workspace-aware.

---

# 6. BACKEND E BANCO

Se nenhuma solução backend equivalente já estiver funcional, use:

- Supabase;
- PostgreSQL;
- Supabase Auth;
- Row Level Security;
- Supabase Storage;
- Edge Functions/RPC somente quando necessário para segredo/operação privilegiada.

Não coloque `service_role` no browser.

## Migrations mínimas

Crie schema versionado para:

### Platform

- tenants
- tenant_domains
- tenant_brands
- tenant_themes
- tenant_settings
- features
- tenant_features
- plans
- subscriptions
- plan_entitlements
- tenant_entitlements

### Identity

- profiles
- memberships
- roles
- permissions
- role_permissions
- membership_roles ou equivalente
- invitations quando necessário

### Content

- pages
- page_sections
- media_assets

### Integrations/ops

- integration_connections
- webhook_endpoints
- webhook_deliveries
- notifications
- audit_logs
- usage_metrics

### CRM base

- contacts
- leads

### Commerce base

- product_categories
- products
- product_variants quando necessário
- product_options/modifiers
- product_media
- carts apenas se servidor realmente precisar
- orders
- order_items
- order_status_history
- coupons
- fulfillment/delivery settings quando necessário

As tabelas específicas de outros módulos podem ser adicionadas por vertical contract sem contaminar o core.

## Regras de schema

Toda entidade tenant-owned deve possuir `tenant_id` ou relação inequivocamente tenant-scoped.

Adicionar timestamps consistentes.

`created_by`/`updated_by` em mutações administrativas relevantes.

Não use soft-delete universal sem motivo.

---

# 7. TENANCY E RESOLUÇÃO DE TENANT

Implementar Tenant real.

Um tenant representa uma empresa/casa/estabelecimento.

Campos mínimos coerentes:

- id;
- slug;
- vertical;
- status;
- created_at;
- owner/membership via relação;
- configuração base.

## Resolução

Suportar arquitetura para:

- `tenant.plataforma.com`;
- custom domain;
- desenvolvimento local.

Hostname → tenant.

Não aceite seleção arbitrária de tenant por query param em produção.

Tenant atual deve ficar disponível por um provider/context seguro no frontend e por contexto validado no backend.

---

# 8. AUTHENTICATION

Implementar autenticação real:

- signup quando habilitado;
- login;
- logout;
- session restore;
- password reset;
- loading;
- session expired;
- unauthorized;
- forbidden;
- proteção de admin.

Use Supabase Auth caso adotado.

Não chame esconder menu de segurança.

Toda operação privilegiada precisa ser autorizada server-side/RLS.

---

# 9. MEMBERSHIP, RBAC E PERMISSIONS

Membership liga User ↔ Tenant.

Papéis iniciais sugeridos:

- owner
- admin
- manager
- editor
- catalog_manager
- orders_manager
- support
- viewer

Mas autorização deve usar PERMISSIONS, não apenas nomes hard-coded.

Permissions iniciais:

```text
tenant.read
tenant.settings.read
tenant.settings.write
brand.read
brand.write
cms.read
cms.write
media.read
media.write
catalog.read
catalog.write
orders.read
orders.create
orders.status.write
members.read
members.invite
members.roles.write
integrations.read
integrations.write
billing.read
billing.write
audit.read
```

Crie matriz inicial documentada e seedada.

Owner continua submetido a tenant scope.

---

# 10. RLS E TESTES DE ISOLAMENTO

RLS é obrigatório para o backend Supabase/Postgres.

Princípio:

`DEFAULT DENY`.

Usuário só acessa tenant onde membership válida + permission compatível.

Helpers de banco podem existir, mas funções privilegiadas precisam:

- finalidade clara;
- menor privilégio;
- `search_path` seguro;
- testes.

## Teste cross-tenant obrigatório

Crie:

- Tenant A;
- Tenant B;
- User A;
- User B.

Prove automaticamente que A NÃO consegue ler/escrever/excluir dados B em:

- settings;
- brand/theme;
- pages;
- media metadata;
- products;
- orders;
- memberships;
- integrations;
- audit logs.

E vice-versa.

Qualquer vazamento = RELEASE BLOCKER.

---

# 11. ONBOARDING

Fluxo funcional alvo:

```text
Criar conta
→ criar tenant
→ owner membership
→ escolher vertical
→ nome/slug
→ branding básico
→ módulos iniciais
→ tenant provisionado
→ admin
→ storefront
```

Não exigir edição de código.

Demo tenants devem ser explicitamente `demo`.

A Padaria `Fornalha` deve permanecer demonstração, nunca fato comercial implícito.

---

# 12. BRAND STUDIO E THEME ENGINE

Implementar painel que altere em runtime:

- nome;
- logo;
- logo alternativa;
- favicon;
- primary/secondary/accent;
- background/surface/foreground;
- success/warning/danger;
- font heading/body;
- radius;
- shadows/density quando suportados;
- hero media;
- contatos;
- endereços;
- horários;
- social links;
- CTAs.

Use CSS variables/tokens semânticos.

Cada vertical mantém seu tema default.

Alterar brand no admin deve refletir no storefront sem fork/rebuild específico do cliente, salvo assets processados pelo pipeline normal.

---

# 13. CMS

Implementar CMS estruturado, seguro e tenant-aware.

Entidades:

- Page
- PageSection

Status:

- draft
- published

Section types iniciais:

- hero
- richText sanitizado
- image
- video
- gallery
- products
- services
- CTA
- FAQ
- reviews
- map/location
- team
- events
- booking
- contact
- social links

Admin pode:

- criar/editar página;
- ativar/desativar;
- ordenar sections;
- editar propriedades;
- preview quando viável;
- publicar.

Não permita HTML arbitrário sem sanitização forte.

---

# 14. MEDIA MANAGER

Implementar storage real tenant-aware.

Campos:

- tenant_id
- bucket/path
- filename
- mime_type
- size
- visibility
- alt_text
- tags
- created_by
- timestamps.

Fluxos:

- upload;
- preview;
- progress;
- erro/retry;
- alt text;
- visibility;
- replace;
- delete seguro;
- seleção dentro do CMS/Brand/Catalog.

Segurança:

- validar MIME/extensão/tamanho;
- magic bytes quando tecnicamente possível;
- nomes seguros;
- executáveis bloqueados;
- private → signed URL;
- ownership/RLS;
- rate limit;
- quota por entitlement.

Não quebre referência quando substituir asset.

---

# 15. PLANS, FEATURES E ENTITLEMENTS

Criar planos sem assumir preço real:

- demo
- starter
- pro
- business

Capacidades por entitlement, não por conditional scattered.

Exemplos:

```text
commerce.enabled
booking.enabled
crm.enabled
quotes.enabled
events.enabled
customDomain.enabled
locations.max
users.max
storage.bytes
products.max
media.maxFileSize
audit.retentionDays
```

Serviço central:

- `canUseFeature()`
- `getLimit()`
- `assertEntitlement()`

Frontend usa para UX; backend valida para segurança/regra comercial.

Effective entitlement = plan + subscription state + overrides controlados.

---

# 16. BILLING

Implementar abstração real:

`BillingProvider`.

Métodos equivalentes:

- createCustomer
- createCheckoutSession
- createPortalSession
- getSubscription
- cancelSubscription
- syncSubscription
- verifyWebhook
- handleWebhook

Estados coerentes:

- trialing
- active
- past_due
- canceled
- incomplete/unpaid quando provider exigir.

Sem credencial:

- implemente contrato;
- mock/dev provider;
- webhook types;
- state machine;
- env validation;
- testes.

Não invente Stripe funcionando.

Webhook:

- assinatura;
- idempotência;
- replay protection quando aplicável;
- audit.

---

# 17. ADMIN DO TENANT

Transformar admins demo em verdadeiro Tenant Admin.

Menu mínimo:

- Dashboard
- Marca
- Conteúdo
- Mídia
- Catálogo/Serviços
- Pedidos/Reservas conforme módulo
- Clientes/Leads conforme módulo
- Equipe e permissões
- Integrações
- Plano
- Auditoria
- Configurações

Dashboard é tenant-scoped.

Admin precisa funcionar em desktop e mobile suficiente para operações essenciais.

---

# 18. SUPER ADMIN

Separado das roles de tenant.

Implementar base segura para:

- listar tenants;
- status;
- vertical;
- plan;
- subscription state;
- created_at;
- usage;
- integration failures;
- audit.

Suspensão/reativação deve ser auditada.

Não implementar impersonation silenciosa.

Se impersonation existir futuramente, deve ser explícita, temporária e auditada.

---

# 19. INTEGRATIONS E WEBHOOKS

Adapters compartilhados para:

- WhatsApp
- e-mail
- analytics
- maps
- payments
- marketplaces/delivery
- CRM/export
- webhooks.

Secrets server-side.

Não chame `wa.me` de automação de envio de mídia.

Webhook outbound:

- allowlist/validação URL;
- impedir SSRF para ranges privados/local;
- HMAC quando aplicável;
- retries com backoff;
- status/attempt/error armazenado;
- payload mínimo.

---

# 20. AUDIT LOG

Append-oriented.

Registrar:

- tenant lifecycle;
- brand/theme update;
- CMS publish;
- media mutation;
- member invite;
- role/permission change;
- catalog mutation;
- order/reservation status;
- integration mutation;
- billing mutation;
- Super Admin action.

Não registrar:

- senha;
- token;
- secret;
- payment sensitive data;
- PII excessiva.

---

# 21. OBSERVABILIDADE

Criar abstrações para:

- structured logs;
- correlation/request ID;
- tenant context;
- error reporting;
- webhook failures;
- integration failures;
- billing failures;
- usage metrics.

Nunca logar secrets.

Criar health checks úteis quando houver backend próprio/edge functions.

---

# 22. PADARIA — MIGRAÇÃO END-TO-END PRIORITÁRIA

A Padaria é a primeira referência completa.

Preservar o layout atual do PadocaAppPremium.

Migrar de hard-code/local-only para SaaS:

- BusinessConfig → TenantBrand/Settings;
- theme → tenant theme;
- products → catalog tables;
- categories;
- variants/extras;
- disponibilidade;
- promo/coupon;
- checkout;
- order persistence;
- delivery/pickup;
- customer/contact quando necessário;
- WhatsApp adapter;
- canais externos;
- admin.

Carrinho pode continuar no browser como UX temporária.

Order NÃO pode ter browser como source of truth.

## Checkout security

Servidor recalcula:

- preço;
- variante;
- extra;
- coupon;
- delivery fee;
- subtotal;
- total.

Produto precisa estar ativo/disponível.

Use idempotency key para criação de pedido.

## Order lifecycle

Estados consistentes, por exemplo:

- pending
- confirmed
- preparing
- ready
- out_for_delivery
- completed
- canceled

Adaptar ao negócio real.

Registrar status history.

---

# 23. PET SHOP — PREPARAÇÃO PROFUNDA

Importar e preservar layout.

Criar contracts/DB design pronto para:

- Customer/Tutor
- Pet
- Service
- Professional
- Booking
- Product
- Order
- Loyalty
- Location.

Migrar pelo menos branding/theme/CMS/auth tenant-aware nesta wave se houver tempo após Padaria Core.

Não criar prontuário veterinário como escopo automático.

---

# 24. RESTAURANTE — PREPARAÇÃO PROFUNDA

Preservar layout e cardápio visual.

Contracts:

- Menu
- MenuSection
- MenuItem
- Modifier/Extra
- AvailabilityWindow
- AllergenTag
- Reservation
- CapacityRule
- WaitlistEntry
- Order
- Location
- Event.

Evitar reimplementar POS/KDS/fiscal nesta fase. Criar adapters futuros.

---

# 25. MÁQUINAS PESADAS — PREPARAÇÃO PROFUNDA

Preservar showroom premium.

Contracts:

- Company
- Contact
- Seller
- Branch
- EquipmentCategory
- Equipment
- Part
- InventoryItem
- Lead
- LeadAssignment
- Quote
- QuoteLine
- ProposalVersion
- TradeInRequest
- FinancingRequest
- Document
- ServiceTicket
- WarrantyRecord.

B2B documents privados por padrão.

---

# 26. TEMPLO/CASA RELIGIOSA — PREPARAÇÃO PROFUNDA

Preservar identidade cultural e visual.

Contracts:

- ReligiousHouse profile
- PublicService
- Event/Gira
- RecurrenceRule
- AvailabilityRule
- DateOverride
- BookingRequest
- Gallery
- Announcement
- ContributionConfig opcional.

Módulos sensíveis OFF por padrão:

- Member
- Medium/Volunteer
- Attendance
- Private service records.

Dados que revelem participação religiosa exigem gate reforçado de RBAC, retenção, audit e LGPD.

Não armazenar narrativa de consulta espiritual por padrão.

---

# 27. LED — CONTRATOS SEM INVENTAR CONTEÚDO

Enquanto source repo estiver bloqueado, apenas preparar contratos genéricos:

- SolutionCategory
- LEDProduct/Solution
- TechnicalSpecification
- ConfigurationRequest
- SiteSurvey
- Lead
- Quote
- Proposal
- Project
- Installation
- Warranty
- SupportTicket.

Nada de branding, catálogo ou especificações reais inventadas.

---

# 28. APRESENTAÇÕES PDF E README PREMIUM

Preservar todos os PDFs importados.

Após importação:

```bash
find apps -type f \( -iname '*.pdf' -o -iname '*.PDF' \) | sort
```

Comparar com `docs/PRESENTATIONS_INDEX.md`.

README raiz deve ter seção **Verticais e Apresentações**, com link relativo para cada PDF real encontrado.

Não converter/remover PDF original.

README final deve apresentar:

1. proposta do SaaS;
2. arquitetura;
3. screenshots/previews legítimos quando existentes;
4. verticals;
5. módulos;
6. white-label;
7. segurança;
8. stack;
9. quick start;
10. status dos gates;
11. apresentações PDF;
12. roadmap;
13. documentação técnica.

Não use claims de produção antes dos gates estarem completos.

---

# 29. TESTES UNITÁRIOS

Use Vitest ou solução equivalente adequada ao stack.

Cobrir no mínimo:

- tenant resolution;
- permission resolution;
- entitlements;
- schema validation;
- theme resolution;
- price calculation;
- coupon validation;
- order totals;
- vertical registry;
- legacy adapters.

---

# 30. TESTES DE INTEGRAÇÃO

Cobrir:

- tenant creation;
- membership;
- RBAC;
- RLS;
- brand update;
- CMS CRUD;
- media metadata/access;
- catalog CRUD;
- order creation;
- server total validation;
- audit log;
- entitlement enforcement;
- webhook idempotency onde implementado.

---

# 31. E2E

Use Playwright se compatível.

Fluxos mínimos quando infraestrutura permitir:

1. login admin;
2. onboarding tenant;
3. alterar logo/cor;
4. storefront refletir tema;
5. criar produto;
6. produto aparecer;
7. carrinho;
8. checkout;
9. pedido persistido;
10. admin visualizar pedido;
11. status permissionado;
12. forbidden sem permission;
13. CMS update;
14. upload válido;
15. upload inválido rejeitado;
16. cross-tenant denied.

Não marque E2E PASS se só escreveu o arquivo e não executou.

---

# 32. SEGURANÇA APLICADA

Executar threat review para:

- Broken Access Control;
- IDOR/BOLA;
- tenant escape;
- privilege escalation;
- session issues;
- token/secret leakage;
- XSS;
- CSRF quando aplicável;
- SQL/injection;
- unsafe RPC;
- mass assignment;
- unsafe upload;
- SSRF;
- open redirect;
- webhook spoof/replay;
- rate limit bypass;
- dependency/supply-chain risk.

Aplicar correções, não apenas listar achados.

---

# 33. HEADERS E BROWSER SECURITY

Quando compatível com hospedagem:

- CSP;
- X-Content-Type-Options;
- Referrer-Policy;
- Permissions-Policy;
- frame-ancestors;
- HSTS somente em produção HTTPS correta.

Testar para não quebrar mídia/CDNs legítimos.

---

# 34. LGPD

Criar fundação técnica para:

- inventory de dados;
- minimização;
- purpose mapping;
- retention;
- export;
- correction;
- deletion quando aplicável;
- consent records quando necessários;
- privacy defaults.

Não escreva uma base legal fictícia para um tenant específico.

---

# 35. RATE LIMIT E ANTI-ABUSE

Aplicar onde disponível:

- login;
- reset de senha;
- public forms;
- checkout/order;
- booking;
- invitations;
- uploads;
- webhooks;
- endpoints caros.

Evitar CAPTCHA em toda interação por padrão. Usar progressivamente quando houver sinal de abuso.

---

# 36. DEPENDÊNCIAS E SUPPLY CHAIN

Executar:

```bash
npm audit --omit=dev
```

Não usar `npm audit fix --force` automaticamente.

Atualizar apenas com compatibilidade/testes.

Usar lockfile root estável.

Dependabot deve continuar configurado.

CodeQL deve usar action v4 quando disponível.

Repo privado sem GitHub Code Security: registrar capability blocker, não falso PASS.

---

# 37. CI/CD

Aprimorar `.github/workflows/quality.yml` após importação.

Gates desejados:

- repository hygiene;
- locked install;
- lint;
- typecheck;
- unit;
- integration;
- security/cross-tenant;
- build;
- dependency audit;
- E2E quando possível sem secrets de produção.

Adicionar CodeQL v4 quando código JS/TS estiver importado.

Workflows de deploy devem depender de gates e nunca usar secrets em PR de fork/contexto inseguro.

---

# 38. PERFORMANCE

Não deixe o SaaS Core destruir o desempenho dos sites públicos.

- admin code split;
- lazy load;
- não incluir SDKs administrativos em páginas públicas sem necessidade;
- imagens responsivas;
- cache correto;
- PWA sem cache de dados privados;
- preservar reduced motion;
- monitorar bundle size.

Meta operacional:

- evitar regressão significativa de LCP/INP/CLS em relação ao baseline;
- registrar limitações quando não puder medir Lighthouse nesta sessão.

---

# 39. ACESSIBILIDADE

Meta: WCAG 2.2 AA.

Validar:

- keyboard;
- focus visibility;
- headings;
- labels;
- contrast;
- error messaging;
- target size;
- alt text;
- reduced motion;
- modal focus trap;
- forms.

Layouts preservados não justificam manter erro de acessibilidade.

---

# 40. PWA

Nos verticais que já possuem PWA:

- preservar manifest;
- preservar installability;
- validar service worker;
- não cachear tokens, admin, PII ou respostas privadas;
- versionar cache corretamente;
- garantir update strategy.

---

# 41. ENVIRONMENT E LOCAL DEV

Criar `.env.example` sem secrets.

Variáveis devem ser realmente usadas e documentadas.

Preparar fluxo local simples, idealmente:

```bash
npm ci
supabase start
supabase db reset
npm run dev:bakery
```

ou equivalente funcional.

Criar scripts para:

- db:start
- db:stop
- db:reset
- db:seed

somente se funcionarem no ambiente adotado.

---

# 42. SEED

Seed deve ser previsível e seguro.

Criar:

- plans/features/permissions;
- Demo Tenant Fornalha;
- catálogo demo da padaria;
- roles;
- entitlements.

Não commitar senha real.

Se criar usuário local de teste, usar mecanismo/documentação de desenvolvimento segura e facilmente descartável.

---

# 43. MIGRAÇÃO LEGACY SEGURA

Use padrão strangler/adapters.

Para cada vertical:

1. preserve config legacy;
2. crie adapter para novo contract;
3. conecte reads ao backend gradualmente;
4. conecte writes;
5. teste equivalência;
6. remova legacy apenas quando não houver consumidor.

Não faça big-bang rewrite de todos os frontends.

---

# 44. DOCUMENTAÇÃO OBRIGATÓRIA

Ao final, devem existir ou estar atualizados:

- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/DATA_MODEL.md`
- `docs/TENANCY.md`
- `docs/RBAC.md`
- `docs/SECURITY_ARCHITECTURE.md`
- `docs/THREAT_MODEL.md`
- `docs/LOCAL_DEVELOPMENT.md`
- `docs/DEPLOYMENT.md`
- `docs/VERTICAL_PACKS.md`
- `docs/MIGRATION_LEGACY.md`
- `docs/PRESENTATIONS_INDEX.md`
- `docs/runbooks/INCIDENTS.md`
- `docs/runbooks/BACKUP_RESTORE.md`
- `docs/BIG_MASTER_WAVE_01_HANDOFF.md`

Evite documentação duplicada. Linke para fonte canônica.

---

# 45. GIT E COMMITS

Proibido:

- force push;
- reset --hard destrutivo;
- clean -fd;
- apagar source repos;
- reescrever histórico;
- commit de secret.

Commits sugeridos por vertical slice:

1. `chore(monorepo): import premium vertical applications`
2. `feat(core): establish tenant and identity contracts`
3. `feat(db): add multi-tenant schema rls and seeds`
4. `feat(auth): implement memberships rbac and protected administration`
5. `feat(platform): add brand cms and media management`
6. `feat(commerce): migrate bakery catalog checkout and orders`
7. `feat(platform): add plans entitlements billing and audit`
8. `test(security): prove tenant isolation and privileged boundaries`
9. `ci: harden monorepo quality and security gates`
10. `docs: complete architecture presentations and wave handoff`

Não faça commit vazio.

---

# 46. PRIORIZAÇÃO SE O TEMPO ACABAR

Finalize slices nesta ordem:

P0 — imports + builds baseline + layouts preservados

P1 — root workspace

P2 — database/migrations

P3 — Tenant

P4 — Auth/Membership/RBAC

P5 — RLS + cross-tenant tests

P6 — Brand/Theme

P7 — Padaria catalog/orders backend

P8 — Tenant Admin

P9 — CMS

P10 — Media Manager

P11 — Plans/Entitlements

P12 — Audit

P13 — Billing abstraction

P14 — integration/webhook infrastructure

P15 — tests/CI/security

P16 — contracts dos outros verticais

P17 — README/PDFs/docs/handoff

Não termine migration SQL pela metade.

---

# 47. GATES DE VALIDAÇÃO

Antes de declarar conclusão:

```bash
git status
npm ci
npm run lint
npm run typecheck
npm test
npm run test:integration
npm run test:security
npm run build
npm audit --omit=dev
```

Executar E2E disponível.

Executar Supabase tests/local reset quando configurado.

Registrar cada gate como:

- PASS
- FAIL
- BLOCKED
- NOT RUN
- MISSING

Nunca inventar PASS.

---

# 48. DEFINITION OF DONE DA WAVE

A Wave é forte somente se houver evidência para a maior parte destes itens:

- [ ] apps importados para o monorepo;
- [ ] source SHAs documentados;
- [ ] PDFs preservados;
- [ ] layouts continuam equivalentes;
- [ ] workspace root funciona;
- [ ] SaaS contracts existem;
- [ ] Supabase/migrations existem;
- [ ] tenant é entidade real;
- [ ] auth funciona;
- [ ] memberships existem;
- [ ] permissions/RBAC existem;
- [ ] RLS existe;
- [ ] cross-tenant denial testado;
- [ ] Brand Studio funciona;
- [ ] tenant theme muda storefront;
- [ ] CMS CRUD funciona;
- [ ] Media Manager funciona;
- [ ] admin protegido funciona;
- [ ] Padaria lê catálogo do backend;
- [ ] checkout recalcula server-side;
- [ ] order persiste;
- [ ] order status permissionado;
- [ ] audit log registra mutações;
- [ ] plans/features/entitlements existem;
- [ ] billing abstraction existe;
- [ ] webhook infrastructure existe;
- [ ] observability base existe;
- [ ] vertical registry existe;
- [ ] contracts dos demais verticais existem;
- [ ] lint existe;
- [ ] unit tests existem;
- [ ] integration tests existem;
- [ ] security tests existem;
- [ ] E2E crítico existe/executou quando possível;
- [ ] build passa;
- [ ] dependency audit foi analisado;
- [ ] CI está funcional;
- [ ] README premium está atualizado;
- [ ] handoff está completo;
- [ ] nenhum secret foi commitado.

---

# 49. BLOCKERS EXTERNOS

Aceitáveis somente quando reais:

- repo LED não identificado;
- credencial de billing provider;
- WhatsApp/BSP;
- custom domain/DNS;
- e-mail provider;
- production Supabase/project credentials;
- GitHub Code Security em repo privado.

Mesmo quando bloqueado externamente, implemente interfaces, env validation, mocks dev, schemas e testes locais possíveis.

---

# 50. FORMATO DO RELATÓRIO FINAL

Responder exatamente:

```text
# BIG MASTER WAVE 01 — RESULTADO

## STATUS
COMPLETE | PARTIAL | BLOCKED

## REPOSITÓRIOS IMPORTADOS
repo | source SHA | destino | método | baseline build

## LAYOUT PRESERVATION
vertical | páginas validadas | regressões | correções

## MONOREPO
...

## DATABASE / MIGRATIONS
...

## TENANCY
...

## AUTH
...

## RBAC
...

## RLS / CROSS-TENANT
incluir evidência dos testes

## BRAND / THEME
...

## CMS
...

## MEDIA
...

## PADARIA END-TO-END
...

## DEMAIS VERTICAIS
...

## PLANS / ENTITLEMENTS
...

## BILLING
separar código funcional de configuração externa

## AUDIT / OBSERVABILITY
...

## SECURITY
achados + correções

## TESTES
comandos e PASS/FAIL/BLOCKED/NOT RUN/MISSING

## CI
...

## DEPENDÊNCIAS
...

## PDFs / README
...

## COMMITS
SHA | mensagem

## BLOCKERS EXTERNOS
...

## PENDÊNCIAS REAIS
somente o que ainda falta

## PRÓXIMA AÇÃO EXATA
uma ação objetiva

## HANDOFF
PROJETO:
BRANCH:
HEAD:
FASE/STATUS:
ÚLTIMA ALTERAÇÃO:
DECISÕES CONFIRMADAS:
NÃO ALTERAR:
MIGRATIONS:
TESTES/GATES:
SEGURANÇA:
BLOQUEIOS:
PRÓXIMA AÇÃO EXATA:
```

---

# 51. COMANDO FINAL

COMECE AGORA.

Não devolva um novo planejamento para aprovação.

Primeiro leia os arquivos canônicos, confirme branch/HEAD e inicie a importação dos verticais.

Depois continue sequencialmente:

**IMPORTAR → VALIDAR BASELINE → MONOREPO → DATABASE → TENANT → AUTH → RBAC → RLS → BRAND → ADMIN → PADARIA BACKEND → CMS → MEDIA → ENTITLEMENTS → BILLING → AUDIT → TESTES → CI → README/PDFs → HANDOFF.**

Se encontrar uma falha, diagnostique e corrija.

Se um item depender de configuração externa, implemente todo o restante e marque apenas a ativação externa como bloqueada.

Não reinicie o projeto.

Não redesenhe os sites.

Não apague os repositórios de origem.

Não invente resultados.

Execute até o limite técnico da sessão.
