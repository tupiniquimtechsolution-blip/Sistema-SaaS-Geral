# CLOUDFLARE — AÇÕES EXTERNAS PARA RELEASE

Estado canônico: Cloudflare Workers / Static Assets é o único hosting do produto.
Não existe dependência de Vercel.

## 1. Deploy durável

O Release GREEN exige deployments autenticados na conta Cloudflare; previews
`wrangler deploy --temporary` não contam como evidência durável.

Workers/configs preparados no repositório:
- platform → `apps/platform/wrangler.jsonc`
- builder → `apps/builder/wrangler.jsonc`
- bakery → `apps/bakery/wrangler.jsonc`
- pet → `apps/pet/wrangler.jsonc`
- restaurant → `apps/restaurant/wrangler.jsonc`
- metalart → `apps/metalart/wrangler.jsonc`
- heavy-machinery → `apps/heavy-machinery/wrangler.jsonc`
- religious-house → `apps/religious-house/wrangler.jsonc`
- salon → `apps/salon/wrangler.jsonc`

A automação `Cloudflare RC Stage` roda nos branches de convergência/release
somente depois dos gates internos do mesmo SHA. O estágio de RC usa
`wrangler preview` para criar **Worker Previews isolados**, inclusive quando o
Worker de produção ainda não existe. O workflow captura a URL estável do
Preview e a URL imutável do deployment associado, aguarda propagação e executa
smoke HTTPS/browser/assets/SPA/console/network na URL imutável.

Esse estágio **não cria nem promove deployment de produção**, não aplica routes,
custom domains ou DNS e não satisfaz sozinho o gate de deploy durável.
O primeiro `wrangler deploy`/promoção de produção continua uma etapa separada,
explicitamente autorizada, posterior aos gates de release.

Secrets exigidos no GitHub Actions:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

Nenhum `service_role` é necessário para build ou smoke de frontend.

## 2. Smoke remoto

O fluxo principal é automático:

1. `Cloudflare RC Stage` aguarda Quality, CodeQL, Salon e Builder Gates no mesmo SHA;
2. cria Worker Previews isolados sem mudar tráfego de produção;
3. captura a URL estável do Preview e a URL imutável do deployment;
4. aguarda readiness e executa o smoke Playwright em todas as superfícies usando a URL imutável;
5. publica manifest/logs como artifacts;
6. `Release GREEN Same-SHA Evidence` agrega os resultados.

Worker Preview é evidência de **staging de RC**, não evidência de deployment
durável/produção. Os gates de deployment durável, hostname/TLS e rollback
continuam independentes.

O workflow `Durable Cloudflare Smoke Matrix` permanece apenas como fallback
operacional/reteste e agora cobre Platform, Builder, Salon e todas as verticais
de release. Não é mais a etapa principal do processo.

## 3. Domínio customizado

Somente após autorização explícita do owner para um hostname real:
1. associar o hostname ao Worker correto;
2. registrar/confirmar `tenant_domains.hostname` e `verified=true`;
3. provar hostname desconhecido = deny e tenant A não resolve tenant B;
4. confirmar TLS ativo;
5. registrar rollback removendo a rota/domínio ou retornando à versão anterior.

Nenhuma troca de nameserver ou DNS real deve ocorrer implicitamente.

## 4. Stripe

Stripe/ChatGPT OAuth não é requisito. Runtime usa integração server-side.
Secrets de Test Mode ficam apenas no ambiente:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY` (já server-only)

Nunca colocar valores em GitHub, VITE_*, browser ou chat.
