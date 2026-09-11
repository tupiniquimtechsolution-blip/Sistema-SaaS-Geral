# Deployment — Supabase + Vercel

## Estado

Este documento prepara a hospedagem; produção só deve ser ativada após a Big Master Wave importar os apps, concluir os gates e conectar as variáveis reais.

## Vercel: estratégia de monorepo

Use **um Vercel Project por aplicação/vertical**, todos apontando para o mesmo repositório GitHub `Sistema-SaaS-Geral`, com Root Directory independente:

| Vercel Project sugerido | Root Directory |
| --- | --- |
| `tupiniquim-saas-bakery` | `apps/bakery` |
| `tupiniquim-saas-pet` | `apps/pet` |
| `tupiniquim-saas-restaurant` | `apps/restaurant` |
| `tupiniquim-saas-led` | `apps/led` |
| `tupiniquim-saas-heavy-machinery` | `apps/heavy-machinery` |
| `tupiniquim-saas-religious-house` | `apps/religious-house` |

Se a Big Master Wave criar um app administrativo/super-admin separado, criar projeto Vercel próprio para ele.

Não criar seis cópias do repositório.

## Ambientes

### Preview

- branch/PR deployment;
- usar Supabase development branch ou ambiente de teste quando disponível;
- nunca usar dados reais de produção para E2E destrutivo;
- variáveis específicas de Preview.

### Production

- deploy somente a partir da branch/release canônica aprovada;
- Supabase production project;
- custom domains verificados;
- secrets somente em environment/secret management.

## Variáveis browser-safe

Para apps Vite:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_APP_BASE_DOMAIN
```

Tudo que começa com `VITE_` pode acabar no bundle do navegador. Nunca colocar service role, API secret ou webhook secret sob prefixo `VITE_`.

## Variáveis server-only

Para Edge Functions, APIs ou outro runtime server-side:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
BILLING_PROVIDER
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
WHATSAPP_ACCESS_TOKEN
WHATSAPP_PHONE_NUMBER_ID
EMAIL_API_KEY
```

Preferência arquitetural: operações que usam `SUPABASE_SERVICE_ROLE_KEY` ficam em Supabase Edge Functions ou outro backend seguro, não em um frontend Vite estático.

## Build

Após a importação, cada app deve possuir scripts consistentes:

```text
npm run lint
npm run typecheck
npm test
npm run build
```

O Root Directory do Vercel deve executar o build do app específico. Em monorepo npm workspaces, o comando poderá ser promovido à raiz se a Big Master Wave padronizar os workspaces.

## SPA routing

Apps Vite/React Router que usam client-side routes precisam de rewrite para `index.html`. Use o template em `infra/vercel/vercel.vite.template.json` e adapte por app após validar que não há rotas server-side conflitantes.

## Headers

Aplicar baseline:

- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy` restritiva;
- `Permissions-Policy` mínima;
- proteção de framing via CSP `frame-ancestors` quando CSP final estiver definida.

Não copie uma CSP rígida genérica antes de mapear Supabase, mídias, analytics e providers reais, pois isso pode quebrar o site. A CSP deve ser criada por app e testada em Preview.

## Custom domains / tenancy

A aplicação deve resolver tenant por hostname. Dois cenários:

1. subdomínios da plataforma, idealmente com wildcard DNS/domínio;
2. domínio customizado por tenant, registrado em `tenant_domains` e verificado antes de ativar.

Nunca confiar somente no hostname enviado pelo cliente sem validar contra `tenant_domains` ativos.

A automação de custom domains no Vercel deve ser implementada server-side usando API/provider adapter e audit log. Não colocar Vercel token no browser.

## Supabase

### Production

Projeto dedicado ao `Sistema-SaaS-Geral`; nunca reutilizar banco de outro produto como `GlicoControl-MVP`.

### Development/Preview

Preferir Supabase Branching ou projeto separado quando custo/plano permitir. Preview deve receber migrations automaticamente de forma controlada.

### Migrations

Aplicar na ordem versionada em `supabase/migrations/`.

Após DDL:

1. executar security advisors;
2. executar performance advisors;
3. gerar TypeScript types;
4. rodar cross-tenant tests;
5. registrar resultado.

## Deploy gate

Production deploy só é permitido quando:

- app específico compila;
- lint/typecheck/tests relevantes passam;
- migrations aplicadas e validadas;
- RLS/cross-tenant tests passam;
- env vars configuradas;
- dados demo separados;
- private storage testado;
- custom-domain resolver seguro;
- Preview aprovado visualmente;
- rollback conhecido.

## Rollback

Frontend: promover deployment anterior no Vercel quando necessário.

Banco: migrations não devem depender de rollback destrutivo implícito. Para alterações críticas, documentar migration corretiva/reversal e backup/restore antes da produção.
