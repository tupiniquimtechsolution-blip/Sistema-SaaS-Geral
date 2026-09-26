# CLOUDFLARE — AÇÕES EXTERNAS PARA RELEASE

Estado canônico: Cloudflare Workers / Static Assets é o único hosting do produto.
Não existe dependência de Vercel.

## 1. Deploy durável

O Release GREEN exige deployments autenticados na conta Cloudflare; previews
`wrangler deploy --temporary` não contam como evidência durável.

Workers/configs preparados no repositório:
- platform → `apps/platform/wrangler.jsonc`
- bakery → `apps/bakery/wrangler.jsonc`
- pet → `apps/pet/wrangler.jsonc`
- restaurant → `apps/restaurant/wrangler.jsonc`
- metalart → `apps/metalart/wrangler.jsonc`
- heavy-machinery → `apps/heavy-machinery/wrangler.jsonc`
- religious-house → `apps/religious-house/wrangler.jsonc`
- salon → configuração/release gate próprio já validado

GitHub/Cloudflare Workers Builds pode executar os deploys sem PC. Production
branch permanece `freebuff/big-master-wave-01-monorepo` até o cutover aprovado.

## 2. Smoke remoto

Após obter URLs duráveis HTTPS, executar manualmente o workflow
`Durable Cloudflare Smoke Matrix` preenchendo as sete URLs. O workflow rejeita
explicitamente hostnames temporários antigos e prova HTTPS, assets, SPA refresh,
console e falhas de rede.

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
