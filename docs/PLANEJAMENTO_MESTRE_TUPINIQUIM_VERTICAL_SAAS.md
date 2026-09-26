# PLANEJAMENTO MESTRE — TUPINIQUIM VERTICAL SaaS

## 0. Objetivo

Transformar os sites premium existentes em uma única plataforma SaaS multi-tenant, modular, white-label e segura, sem apagar a identidade visual de cada vertical.

O produto final deve permitir que novos clientes sejam criados como **tenants configuráveis**, não como forks de código.

## 1. Verticais

- Padaria
- Pet Shop
- Restaurante
- MetalArt — **vertical principal**
- Painéis de LED / comunicação visual
- Máquinas pesadas / equipamentos industriais
- Templo / casa religiosa — **vertical principal**

App horizontal adicional: CRM Tupiniquim (aplicação comercializável dentro do SaaS, não vertical).

Cada vertical mantém sua experiência visual e seus workflows específicos, mas compartilha o mesmo SaaS Core.

## 2. Arquitetura macro

```text
                         TUPINIQUIM VERTICAL SaaS
                                   │
                           ┌───────▼────────┐
                           │   SaaS Core    │
                           └───────┬────────┘
                                   │
        ┌───────────────┬──────────┼──────────┬──────────────┐
        │               │          │          │              │
     Tenancy          Identity   Brand/CMS  Billing      Observability
        │               │          │          │              │
      RLS/RBAC         Users     Media/Theme Entitlements Audit/Usage
        │               │          │          │              │
        └───────────────┴──────────┴──────────┴──────────────┘
                                   │
                             Shared Modules
                                   │
          ┌──────────┬─────────┬────────┬──────────┬──────────┐
          │ Commerce │ Booking │ CRM    │ Quotes   │ Events   │ ...
          └──────────┴─────────┴────────┴──────────┴──────────┘
                                   │
                              Vertical Packs
```

## 3. Layout Preservation Layer

O frontend de cada vertical é patrimônio do projeto e deve ser preservado.

### Regra

A migração deve inserir a engrenagem SaaS **por baixo** dos layouts atuais, não substituir os sites por um dashboard genérico/template SaaS.

### Preservar

- estrutura de páginas;
- composição e hierarquia visual;
- motion/parallax/3D responsável;
- mobile behavior;
- componentes de marca;
- assets legítimos;
- narrativa comercial;
- SEO/copy verificados;
- CTAs e jornadas específicas.

### Tornar dinâmico

- logo;
- paleta;
- tipografia;
- mídia;
- contatos;
- horários;
- endereço;
- páginas/seções;
- catálogo/serviços;
- equipe;
- integrações;
- módulos habilitados.

## 4. SaaS Core obrigatório

### 4.1 Tenancy

Entidades mínimas:

- Tenant
- TenantDomain
- TenantBrand
- TenantTheme
- TenantSetting
- TenantFeature

Todos os registros de negócio pertencentes a cliente precisam de tenant ownership explícito e server-side.

### 4.2 Identity

- User/Profile
- Membership
- Role
- Permission
- invitations
- sessions
- password recovery
- optional MFA-ready architecture

### 4.3 Authorization

- RBAC real;
- permissions granulares;
- server-side checks;
- default deny;
- testes negativos.

### 4.4 Brand Studio

Cliente edita:

- nome;
- logos;
- favicon;
- cores semânticas;
- fontes;
- radius/shadows/density;
- hero;
- mídias;
- contatos;
- endereço;
- horários;
- sociais;
- CTAs.

### 4.5 CMS

Page + PageSection estruturado.

Seções seguras:

- hero;
- rich text sanitizado;
- media;
- gallery;
- catalog/products/services;
- CTA;
- FAQ;
- reviews;
- map;
- team;
- booking;
- events;
- contact;
- social.

### 4.6 Media Manager

- tenant ownership;
- public/private;
- signed URLs;
- metadata;
- alt text;
- tags/folders;
- limits/quotas;
- image optimization;
- lifecycle;
- safe deletion.

### 4.7 Plans e Entitlements

Planos não devem estar espalhados por condicionais de UI.

Resolver capabilities por entitlements, por exemplo:

- commerce.enabled
- booking.enabled
- crm.enabled
- quotes.enabled
- customDomain.enabled
- locations.max
- users.max
- storage.bytes

### 4.8 Billing

Provider abstraction.

Estados mínimos:

- trialing
- active
- past_due
- canceled
- unpaid/incomplete quando aplicável

Webhooks assinados e idempotentes.

### 4.9 Audit

Registrar ações privilegiadas sem secrets/PII excessiva.

### 4.10 Observability

- structured logs;
- tenant context;
- error provider abstraction;
- integration failures;
- webhook failures;
- billing state;
- usage metrics.

## 5. Banco e backend

Se não houver backend equivalente melhor já implantado, baseline preferencial:

- Supabase/PostgreSQL;
- Supabase Auth;
- RLS;
- Supabase Storage;
- Edge Functions/RPC para operações privilegiadas.

### Requisitos

- migrations versionadas;
- rollback quando razoável;
- seed demo;
- environment validation;
- service role apenas server-side;
- RLS para todas as tabelas tenant-owned;
- cross-tenant security tests.

## 6. Shared Modules

### Commerce

Produtos, categorias, variantes, extras, carrinho temporário, checkout server-validated, orders, coupons, fulfillment.

### Booking

Serviços, profissionais/recursos, availability, overrides, agendamento, cancelamento/remarcação e reminders.

### CRM

Contacts, leads, source, owner, status, notes sanitizadas e activity history.

### Quotes

Cotação, itens, versões, status, aprovação, documentos e audit.

### Events

Eventos, recorrência, capacity/availability, inscrição/agendamento quando aplicável.

### Documents

Tenant-aware, private by default quando contiver dados comerciais/pessoais.

## 7. Verticais

### 7.1 Padaria

Preservar a experiência premium e migrar:

- catálogo;
- produtos;
- variações/extras;
- carrinho;
- checkout;
- pedidos;
- retirada;
- delivery;
- encomendas;
- cupons;
- WhatsApp e canais externos;
- PWA.

### 7.2 Pet Shop

- tutores;
- pets;
- serviços;
- profissionais;
- booking;
- shop;
- orders;
- loyalty;
- histórico de serviços.

Prontuário veterinário não pertence ao MVP SaaS sem novo gate regulatório/técnico.

### 7.3 Restaurante

- menu;
- menu sections/items;
- opções/extras;
- disponibilidade;
- allergens;
- reservas;
- capacity/waitlist-ready model;
- orders;
- pickup/delivery;
- events;
- WhatsApp.

POS/KDS/fiscal devem ser integráveis, não reimplementados prematuramente.

### 7.4 LED

- catálogo B2B;
- especificações técnicas;
- configurador de solução;
- lead qualificado;
- vistoria;
- quote/proposal;
- project/install;
- warranty;
- support.

Não inventar conteúdo real enquanto o repositório canônico não estiver identificado.

### 7.5 Máquinas Pesadas

- equipment/parts catalog;
- filtros/comparador;
- inventory/branch;
- leads;
- seller routing;
- quotes/proposals;
- trade-in;
- financing adapters;
- documents;
- warranty/support.

### 7.6 Templo/Casa Religiosa

- public CMS;
- calendar/events/giras;
- recurrence/availability;
- booking requests;
- gallery;
- contact/WhatsApp;
- contributions opcional.

Módulos de membros, médiuns, presença e atendimento privado são opt-in e possuem gate reforçado de privacidade/LGPD.

## 8. Super Admin

Separado de roles do tenant.

Capacidades mínimas:

- tenants;
- status;
- vertical;
- plan/subscription;
- entitlements;
- usage;
- integration failures;
- billing state;
- audit;
- suspension/reactivation com controle e trilha.

Impersonation, se existir, deve ser explícita, limitada e auditada.

## 9. Onboarding

Fluxo alvo:

```text
Conta → Tenant → Vertical → Brand → Domínio/slug → Módulos → Conteúdo inicial → Admin → Publicação
```

Novo cliente deve ser provisionável sem editar código.

## 10. Domínios

Suportar:

- subdomínio da plataforma;
- domínio customizado;
- local/dev resolver.

Hostname resolve tenant. Não usar query-string tenant spoofing em produção.

## 11. Segurança

Threat model mínimo:

- tenant escape;
- IDOR/BOLA;
- privilege escalation;
- session/token leakage;
- unsafe upload;
- webhook spoof/replay;
- SSRF;
- XSS;
- CSRF quando aplicável;
- SQL/injection;
- mass assignment;
- open redirect;
- secret exposure;
- dependency compromise.

## 12. LGPD

- data inventory;
- minimização;
- finalidade;
- retention;
- export/correction/delete workflows;
- consentimento quando aplicável;
- privacy by default;
- dados sensíveis segregados;
- analytics sem PII desnecessária.

## 13. Qualidade

Gates alvo:

- locked install;
- lint;
- typecheck;
- unit;
- integration;
- RLS/cross-tenant;
- E2E;
- build;
- dependency audit;
- security scan quando disponível;
- accessibility;
- performance budget.

## 14. Monorepo

Objetivo:

```text
apps/*          layouts e vertical UX
packages/*      core/modules compartilhados
supabase/*      banco/backend
scripts/*       tooling/migration
infra/*         deploy/config quando necessário
docs/*          arquitetura, segurança, runbooks e apresentações
```

Não extrair componente para `packages` apenas para reduzir duplicação superficial. Extrair quando houver contrato estável e reutilização real.

## 15. Migração dos sites

Ordem:

1. importar snapshot/histórico;
2. registrar provenance;
3. executar baseline do site sem mudanças visuais;
4. criar adapter entre configuração legacy e novos contracts;
5. conectar auth/tenant/theme;
6. migrar dados operacionais;
7. migrar admin;
8. aplicar modules/entitlements;
9. testar visual/functional equivalence;
10. remover legacy somente depois da substituição comprovada.

## 16. PDFs e README

Todas as apresentações existentes devem permanecer no monorepo dentro dos verticais e ser indexadas no README raiz.

README final deve mostrar:

- visão do SaaS;
- arquitetura;
- verticals;
- screenshots/previews quando legítimos;
- funcionalidades;
- apresentações PDF;
- stack;
- segurança;
- quick start;
- estado dos gates;
- roadmap;
- links para docs.

## 17. Fases de entrega

### Wave 01 — Big Master Foundation

- importar verticais;
- workspace/monorepo;
- SaaS Core;
- Supabase/migrations;
- tenancy/auth/RBAC/RLS;
- Brand/Theme/CMS/Media;
- plans/entitlements/billing abstraction;
- audit/observability;
- Padaria migrada de ponta a ponta;
- contratos dos demais verticais;
- tests/CI/security.

### Wave 02

Pet + Restaurante em cima do Core.

### Wave 03

Máquinas + Templo + LED quando repositório estiver disponível.

### Wave 04

Hardening geral, billing/provider real, custom domains, E2E global, performance/a11y, deployment e release.

## 18. Definition of Done global

O projeto só é concluído quando:

- todos os verticais confirmados rodam no monorepo;
- layouts estão preservados;
- novo tenant não exige fork;
- logo/cores/mídia/textos/módulos são editáveis;
- tenant isolation possui teste negativo;
- RBAC é server-side;
- admin e Super Admin são protegidos;
- billing/entitlements funcionam;
- custom domains funcionam;
- media/storage são tenant-aware;
- workflows críticos de cada vertical funcionam E2E;
- CI e security gates possuem evidência;
- backup/restore e runbook existem;
- PDFs e documentação estão preservados;
- dados demo não são confundidos com produção;
- nenhum secret foi commitado.


## Infraestrutura canônica de release (2026-09-26)

- Cloudflare Workers/Static Assets é a infraestrutura canônica de publicação e smoke do produto.
- Vercel não faz parte do caminho de release, rollback, disponibilidade ou Definition of Done.
