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

A automação `Cloudflare RC Stage` roda no branch
`freebuff/big-master-wave-01-monorepo` somente depois dos gates internos do
mesmo SHA. Ela usa `wrangler versions upload` para enviar versões autenticadas
sem promover tráfego de produção, captura as Version URLs e executa smoke
HTTPS/browser/assets/SPA/console/network automaticamente. Production branch
permanece `freebuff/big-master-wave-01-monorepo` até o cutover aprovado.

Secrets exigidos no GitHub Actions:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

Nenhum `service_role` é necessário para build ou smoke de frontend.

## 2. Smoke remoto

O fluxo principal é automático:

1. `Cloudflare RC Stage` aguarda Quality, CodeQL, Salon e Builder Gates no mesmo SHA;
2. faz upload de versões Cloudflare sem mudar tráfego;
3. captura as Version URLs;
4. executa o smoke Playwright em todas as superfícies;
5. publica manifest/logs como artifacts;
6. `Release GREEN Same-SHA Evidence` agrega os resultados.

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
