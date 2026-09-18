# CLOUDFLARE OWNER ACTIONS

Data: 2026-09-18 · Contexto: o sandbox NÃO possui login Cloudflare durável —
os deploys desta wave usaram `wrangler deploy --temporary` (preview path
autorizado). Ações abaixo exigem a conta real do owner.

## AÇÃO 1 — Login durável + deploys definitivos (PRIORITÁRIA)

No diretório do monorepo (terminal do owner):

```bash
npx wrangler login          # abre o browser; NÃO compartilhe o token no chat
npx wrangler whoami         # confirmar conta/plan (esperado: Free)
```

Re-deploy durável de cada app (config já commitada; build primeiro):

```bash
npm ci
npm run build:bakery && npx wrangler deploy --config apps/bakery/wrangler.jsonc
npm run build:pet && npx wrangler deploy --config apps/pet/wrangler.jsonc
npm run build:restaurant && npx wrangler deploy --config apps/restaurant/wrangler.jsonc
npm run build --workspace=apps/metalart && npx wrangler deploy --config apps/metalart/wrangler.jsonc
npm run build:heavy-machinery && npx wrangler deploy --config apps/heavy-machinery/wrangler.jsonc
# PLATFORM por último, com as URLs definitivas dos verticais:
VITE_VERTICAL_PREVIEW_URLS="bakery=https://tupiniquim-bakery.<subdomain>.workers.dev,pet=...,restaurant=...,metalart=...,heavy-machinery=..." \
npm run build:platform && npx wrangler deploy --config apps/platform/wrangler.jsonc
```

Depois de cada deploy: `bun scripts/cloudflare-gate.ts <app> <url>` e me passe
as URLs — eu valido e atualizo a WORKER MATRIX (§47). **MetalArt**: no deploy
real o limite é 25 MiB/arquivo — o vídeo de 22 MiB passa; nenhum corte de mídia
foi feito.

## AÇÃO 2 — Workers Builds (GitHub integration), opcional

Dashboard → Workers & Pages → por Worker → Settings → Build → Connect:
repo `tupiniquimtechsolution-blip/Sistema-SaaS-Geral`, branch
`freebuff/big-master-wave-01-monorepo` (até decisão de merge main).

| Setting | Valor |
|---|---|
| Root Directory | `/` (raiz — monorepo npm workspaces) |
| Install | `npm ci` |
| Build (verticais) | `npm run build:<app>` (metalart: `npm run build --workspace=apps/metalart`) |
| Deploy command | `npx wrangler deploy --config apps/<app>/wrangler.jsonc` |
| Non-production | `npx wrangler versions upload --config apps/<app>/wrangler.jsonc` |
| Build watch paths (se suportado) | `apps/<app>/**` + `packages/**` + `package-lock.json` + `package.json` |

Production branch: manter a branch de trabalho; NUNCA apontar produção para
main automaticamente antes da decisão de merge (release policy atual).

## AÇÃO 3 — Aceitação e cutover (EXIGE NOVA AUTORIZAÇÃO)

- Após AÇÃO 1 + gates: owner acceptance dos demos.
- DNS/custom domains/nameservers: **NOT AUTHORIZED nesta wave** — decisão
  separada do owner (DOMAIN_CUTOVER = PENDING_OWNER_AUTHORIZATION).
- Vercel permanece rollback até aceitação formal; deprecação do Vercel é
  decisão separada.

## Zero-cost

Nenhuma feature paga foi habilitada. Se algum passo do dashboard oferecer
upgrade (Workers Paid etc.): NÃO aceitar sem decisão explícita de custo.
