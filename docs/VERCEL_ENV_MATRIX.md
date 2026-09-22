# VERCEL ENV MATRIX

Data: 2026-09-18 · Sem valores — apenas nomes, política e propósito.
Base de auditoria: `grep import.meta.env / VITE_` em cada app (nenhuma
variável inventada).

## Matriz por app

| APP | ENV NAME | DEVELOPMENT | PREVIEW | PRODUCTION | PUBLIC/SECRET | PURPOSE |
|---|---|---|---|---|---|---|
| Platform (apps/platform) | `VITE_VERTICAL_PREVIEW_URLS` | opcional (local) | opcional (lista pública `name=url`) | opcional | PUBLIC | Links do catálogo de verticais na shell central; sem valor = cards sem link |
| Bakery (apps/bakery) | `VITE_DEMO_MODE` | `.env.local` (false no gate live) | `false` | `false` (obrigatório) | PUBLIC | Gate do fallback demo; `false` = falha NUNCA renderiza demo como real |
| Bakery (live path, quando integrado à inicialização) | `VITE_SUPABASE_URL` | `.env.local` | URL do projeto canônico `mmykyzzkcugxunmekwew` | mesma URL canônica | PUBLIC | Endpoint do Supabase |
| Bakery (live path) | `VITE_SUPABASE_PUBLISHABLE_KEY` | `.env.local` | publishable key (anon/sb_publishable_) | mesma chave publishable | PUBLIC (por design — RLS é a autoridade) | Chave browser do Supabase |
| Pet / Restaurant / MetalArt / Heavy Machinery | — (nenhuma) | — | — | — | — | Código auditado: nenhum `import.meta.env` de config consumido (apenas flags internas DEV/PROD do Vite) |

## Regras

1. **Nunca** definir no Vercel (qualquer app): `TEST_A_EMAIL`, `TEST_A_PASSWORD`,
   `TEST_B_EMAIL`, `TEST_B_PASSWORD`, `SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY`
   sem prefixo (uso exclusivo dos harnesses locais), `SUPABASE_SERVICE_ROLE_KEY`,
   qualquer `service_role`/`sb_secret_*`, DB password, JWT secret, credenciais QA.
2. Nunca copiar o `.env.local` inteiro para o Vercel — apenas as chaves da matriz.
3. A publishable key é pública por design; a autorização real é RLS
   (default deny, provada 58/58) + entitlement gate no banco.
4. `VITE_DEMO_MODE=false` é OBRIGATÓRIO em Production de qualquer vertical
   integrado ao Supabase (política de fallback demo do packages/tenancy).
5. Novas variáveis: adicionar linha nesta matriz com propósito antes de usar.

## Verificação de bundle (2026-09-18)

Scan dos dists (platform/bakery/pet/restaurant/metalart/heavy-machinery):
0 ocorrências de `TEST_*_PASSWORD`, `sb_secret_`, `service_role`,
`SUPABASE_SERVICE_ROLE` — SECRET EXPOSURE CHECK: PASS.
