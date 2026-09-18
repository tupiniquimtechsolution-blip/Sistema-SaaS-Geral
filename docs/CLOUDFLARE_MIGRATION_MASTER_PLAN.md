# CLOUDFLARE MIGRATION MASTER PLAN

Data: 2026-09-18 · **REVISADO: alvo = WORKERS STATIC ASSETS (não Pages)** ·
Execução: docs/CLOUDFLARE_EXECUTION_REPORT.md · Matrix: docs/CLOUDFLARE_WORKER_MATRIX.md

## DECISÃO ARQUITETURAL REVISADA (Pages → Workers)

O alvo original (Cloudflare Pages por app) foi **DESCARTADO como estratégia
principal**: Pages em monorepo tem limite de projetos vinculados ao repositório
que não acomoda com segurança os 6 deployables atuais (platform, bakery, pet,
restaurant, metalart, heavy-machinery) + futuros (salon, religious-house, led).
**Alvo canônico: UM Cloudflare Worker Static Assets por aplicação** — sem
Worker server-side no MVP (sem main/fetch handler/KV/D1/R2/DO), Supabase
permanece o backend. Zero-cost: STATIC ASSETS DIRECT SERVING; nada pago
habilitado (BLOCKED_REQUIRES_PAID_CLOUDFLARE se surgir).

Mapping: tupiniquim-saas (platform) · tupiniquim-bakery · tupiniquim-pet ·
tupiniquim-restaurant · tupiniquim-metalart · tupiniquim-heavy-machinery —
NUNCA Worker fake para app inexistente; NUNCA Worker por tenant (cliente =
tenant no Supabase, não deploy).

Pré-condição de origem: `CODE_PRODUCT_COMPLETE = YES` (ATINGIDO) e autorização
expressa do owner — **DADA** (migration executada; ver execution report).
DNS/custom domains continuam NOT AUTHORIZED (DOMAIN_CUTOVER =
PENDING_OWNER_AUTHORIZATION). Vercel = rollback source intacto.

## 1. Princípios

- Migração por app, nunca big-bang: cada vertical tem cutover independente.
- Vercel permanece origem de verdade até o cutover de cada app ser validado;
  rollback a Vercel deve permanecer possível durante toda a janela.
- Zero mudança de código de aplicação: os apps são estáticos (Vite +
  HashRouter) — nenhum rewrite de SPA necessário; assets imutáveis
  (content-hash) permitem cache agressivo.
- Supabase permanece o backend canônico (mmykyzzkcugxunmekwew) — a migração é
  de ENTREGA DE FRONTEND, não de backend.

## 2. Worker mapping (executado)

| Vercel (rollback source) | Worker Static Assets | Build | Output | Config |
|---|---|---|---|---|
| sistema-saa-s-geral | `tupiniquim-saas` | `npm run build:platform` | `apps/platform/dist` | apps/platform/wrangler.jsonc |
| (central publicou a bakery até o cutover) | `tupiniquim-bakery` | `npm run build:bakery` | `apps/bakery/dist` | apps/bakery/wrangler.jsonc |
| — | `tupiniquim-pet` | `npm run build:pet` | `apps/pet/dist` | apps/pet/wrangler.jsonc |
| — | `tupiniquim-restaurant` | `npm run build:restaurant` | `apps/restaurant/dist` | apps/restaurant/wrangler.jsonc |
| — | `tupiniquim-metalart` | `npm run build --workspace=apps/metalart` | `apps/metalart/dist` | apps/metalart/wrangler.jsonc |
| — | `tupiniquim-heavy-machinery` | `npm run build:heavy-machinery` | `apps/heavy-machinery/dist` | apps/heavy-machinery/wrangler.jsonc |

Workers server-side "when technically necessary": apenas requisito comprovado
(ex.: proxy de revogação de mídia pública — FUTURE HARDENING do storage). Nada
no MVP.

## 3. Build / CI

- Direct deploy via Wrangler (executado — execution report) + Workers Builds
  (GitHub) opcional: docs/CLOUDFLARE_OWNER_ACTIONS.md (AÇÃO 2) — produção
  manual (promoção explícita, sem auto-deploy de main), watch paths por app.
- Node >=22; instalação via npm ci (lockfile commitado); wrangler fixado como
  devDependency raiz.

## 4. Domínios / DNS

- Fase 1: `*.pages.dev` para todos (validação).
- Fase 2 (opcional): domínio da plataforma apontando ao projeto central.
- Fase 3 (tenants): `cliente.com.br` → CNAME ao projeto do vertical do cliente;
  custom domains por projeto Pages; hostname SEMPRE validado contra o banco
  (docs/TENANT_DOMAIN_ARCHITECTURE.md) — nunca confiado diretamente.
- NÃO mover DNS antes do cutover validado; TTL baixo (60s) na janela.

## 5. Headers / cache / SPA routing

| Padrão | Cache |
|---|---|
| `/assets/*` (hash imutável) | `public, max-age=31536000, immutable` |
| `index.html` | `no-cache` (fallback único de todas as rotas) |
| Security headers | CSP básica, X-Content-Type-Options, Referrer-Policy, X-Frame-Options/SAMEORIGIN |

Routing: apps usam HashRouter (`/#/rota`) — sem need de rewrites; servir o
diretório estático com `index.html` como not-found default é suficiente e
provado (vercel.json atual funciona sem rewrites).

## 6. Variáveis de ambiente / secrets

- Somente as `VITE_*` browser-safe da docs/VERCEL_ENV_MATRIX.md por projeto
  (VITE_DEMO_MODE, VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY,
  VITE_VERTICAL_PREVIEW_URLS no central).
- NUNCA: service_role, senhas QA, DB passwords, JWT secrets.
- Definir por projeto em Pages Settings (Production e Preview separados) —
  mesma matriz do Vercel, mesmos valores públicos.

## 7. Cutover / rollback (por app)

1. Criar projeto Pages + primeiro deploy preview; validar com
   `scripts/preview-http-gate.ts deployment:<pages-preview-url>` (reutilizado
   sem mudança — é HTTP puro).
2. Comparar title/markers contra o deployment Vercel equivalente.
3. Apontar domínio (se houver) com TTL baixo.
4. Observar (erros, render, login em app integrado).
5. Rollback: reverter DNS/CNAME ao Vercel (que permanece intacto até
   deprecação formal, Fase "migrate → validate → cutover → deprecate").

## 8. Observability

- Cloudflare Analytics por projeto (baseline) + manter os gates HTTP
  (`preview-http-gate.ts`) como canário pós-cutover em CI agendado.
- Supabase logs permanecem a fonte de observabilidade de backend.

## 9. Não executado nesta wave (explicitamente)

- Nenhum DNS movido, nenhum domínio comprado, nenhum custom domain.
- Vercel preservado intacto (rollback source).
- DOMAIN_CUTOVER: PENDING_OWNER_AUTHORIZATION.
- Execução (workers.dev): docs/CLOUDFLARE_EXECUTION_REPORT.md.
