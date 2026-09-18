# CLOUDFLARE MIGRATION MASTER PLAN

Data: 2026-09-18 · Status: **PLANO — NÃO EXECUTAR**
Pré-condição: só iniciar após `CODE_PRODUCT_COMPLETE = YES` (ATINGIDO — ver
docs/PLATFORM_COMPLETION_REPORT.md e docs/MVP_COMMERCIAL_READINESS.md) e
autorização explícita do owner (readiness: docs/CLOUDFLARE_MIGRATION_READINESS.md
= YES). **Mesmo com SYSTEM_COMPLETE = YES, NÃO migrar automaticamente — parar
em CLOUDFLARE_MIGRATION_READY = YES e aguardar a wave dedicada.**
Estratégia do owner: Vercel permanece SOMENTE preview/dev/validação do central;
projetos dedicados por vertical NÃO serão criados no Vercel — o publishing
comercial definitivo acontece aqui, na Cloudflare.

## 1. Princípios

- Migração por app, nunca big-bang: cada vertical tem cutover independente.
- Vercel permanece origem de verdade até o cutover de cada app ser validado;
  rollback a Vercel deve permanecer possível durante toda a janela.
- Zero mudança de código de aplicação: os apps são estáticos (Vite +
  HashRouter) — nenhum rewrite de SPA necessário; assets imutáveis
  (content-hash) permitem cache agressivo.
- Supabase permanece o backend canônico (mmykyzzkcugxunmekwew) — a migração é
  de ENTREGA DE FRONTEND, não de backend.

## 2. Project mapping (Vercel → Cloudflare)

| Vercel Project | Alvo Cloudflare | Build | Output |
|---|---|---|---|
| sistema-saa-s-geral | Pages project `sistema-saas-geral` | `npm ci && npm run build:platform` | `apps/platform/dist` |
| saas-bakery | Pages project `saas-bakery` | `npm ci && npm run build:bakery` | `apps/bakery/dist` |
| saas-pet | Pages project `saas-pet` | `npm ci && npm run build:pet` | `apps/pet/dist` |
| saas-restaurant | Pages project `saas-restaurant` | `npm ci && npm run build:restaurant` | `apps/restaurant/dist` |
| saas-metalart | Pages project `saas-metalart` | `npm ci && npm run build --workspace=apps/metalart` | `apps/metalart/dist` |
| saas-heavy-machinery | Pages project `saas-heavy-machinery` | `npm ci && npm run build:heavy-machinery` | `apps/heavy-machinery/dist` |

Workers "when technically necessary": apenas se surgir requisito server-side no
edge (ex.: proxy de revogação de mídia pública — ver FUTURE HARDENING do
storage). Não previsto no MVP da migração.

## 3. Build / CI

- Connect do repo via Cloudflare Pages (Git integration), produção manual
  (clone do padrão Vercel: promoção explícita, sem auto-deploy de main).
- Preview deployments por branch (equivalente aos previews Vercel).
- Node version pinada (>=22) via `.nvmrc`/env `NODE_VERSION`.
- Instalação via npm ci (lockfile commitado).

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

- Nenhuma conta/project Cloudflare criado.
- Nenhum DNS movido, nenhum domínio comprado.
- Vercel permanece DESENVOLVIMENTO/PREVIEW/VALIDAÇÃO.
