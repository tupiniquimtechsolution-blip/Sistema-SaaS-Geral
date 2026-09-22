# apps/salon — Salão / Beleza & Estética

Vertical white-label do Tupiniquim Vertical SaaS.

## Tenant de referência

Vanessa Braz — Beleza & Autoestima é o tenant/template de referência, não um fork da plataforma.

Dados confirmados em 22/09/2026:

- Instagram: `@vanessabraz_belezaeautoestima`
- WhatsApp: `(11) 98814-9152` / `5511988149152`
- endereço informado: `Rua Redenção 88`

Cidade, UF, CEP, horários, e-mail, serviços e preços não são inferidos.

## Arquitetura

- UI pública: `src/App.tsx`;
- contrato white-label: `src/config/template.ts`;
- adaptação SaaS Core: `src/business/saas-adapter.ts`;
- deploy: Cloudflare Workers Static Assets via `wrangler.jsonc`;
- backend: Supabase compartilhado do Sistema-SaaS-Geral;
- tenancy/RBAC/RLS: reutilizados do SaaS Core;
- nenhum Supabase separado;
- nenhum `if tenant === 'vanessa'`.

## Modos

`VITE_DEMO_MODE=true`: preview explícito do template Vanessa, sem se passar por dados live.

`VITE_DEMO_MODE=false`: não deve cair silenciosamente para preview. O carregamento autenticado usa `resolveTenantContext`; resolução pública por hostname deve ser server-side antes do gate de produção.

## Mídia

O repo fonte Vanessa preserva a biblioteca otimizada. A mídia com pessoas identificáveis não deve ser publicada automaticamente no vertical compartilhado. Qualidade visual e autorização de publicação são gates independentes.

## Booking

O estado final deve reutilizar `services`, `staff_resources`, `service_resources`, `availability_rules`, `availability_overrides` e `bookings`. Produção depende de prova real de conflito de agenda no banco e testes cross-tenant A↔B.

## Gates antes de produção

- locked install;
- lint;
- typecheck;
- unit/integration/security;
- PostgreSQL/RLS real;
- cross-tenant;
- build;
- dependency audit;
- CodeQL;
- a11y/WCAG 2.2 AA;
- Lighthouse;
- preview visual;
- autorização de mídia/dados comerciais.

Ver `docs/salon/VANESSA_RECONCILIATION.md`.
