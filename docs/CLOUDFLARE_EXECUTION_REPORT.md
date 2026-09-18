# CLOUDFLARE EXECUTION REPORT

Data: 2026-09-18 · Branch `freebuff/big-master-wave-01-monorepo` · base `ed91895`
Wave: MIGRAÇÃO FINAL VERCEL → CLOUDFLARE (autorização expressa do owner).
Alvo revisado: **Workers Static Assets** (Pages descartado — ver MASTER PLAN).
Autenticação: **sem login durável no sandbox** → deploys executados via
`wrangler deploy --temporary` (preview/version path autorizado pela wave).

## Arquitetura executada

- 6 configs `apps/<app>/wrangler.jsonc` — `name`, `compatibility_date`,
  `assets.directory`, `not_found_handling: single-page-application`.
- **WORKER_MAIN: NONE em todos** · RUN_WORKER_FIRST: não usado · zero código
  server-side · zero KV/D1/R2/Durable Objects → STATIC ASSETS DIRECT = PASS.
- `_headers` por app (noscript/referrer/frame + cache immutable p/ hashed assets).
- `.wrangler/` no .gitignore; wrangler fixado como devDependency raiz
  (4.135.0, `--save-exact`, npm ci revalidado).

## Matriz de execução (ordem §16 — platform por último)

| App | Worker | Version ID | URL (workers.dev) | HTTP gate | Status |
|---|---|---|---|---|---|
| Bakery | tupiniquim-bakery | cab8d1ae-4a80-4464-bb62-70de2875e771 | https://tupiniquim-bakery.dramatic-condition.workers.dev | **PASS 6/6** | ✅ |
| Pet | tupiniquim-pet | c5e7dd3b-e166-4fcb-b67c-1a25e70206c6 | https://tupiniquim-pet.dramatic-condition.workers.dev | **PASS** | ✅ |
| Restaurant | tupiniquim-restaurant | 61fd4383-b4e1-4695-8a00-340dd3dc7969 | https://tupiniquim-restaurant.dramatic-condition.workers.dev | **PASS** | ✅ |
| MetalArt | tupiniquim-metalart | — (upload abortado) | — | NOT RUN | ❌ **BLOCKED_STATIC_ASSET_LIMIT** |
| Heavy Machinery | tupiniquim-heavy-machinery | c2e855a5-6789-4ab1-b6b9-c0b6b311c9a9 | https://tupiniquim-heavy-machinery.dramatic-condition.workers.dev | **PASS 6/6** | ✅ |
| Platform (ÚLTIMO, com URLs reais) | tupiniquim-saas | bce46574-f0e7-404e-9c40-20a6c4f72453 | https://tupiniquim-saas.dramatic-condition.workers.dev | **PASS 6/6** | ✅ |

## Platform final gate (§27/§28)

- GET / = 200 · title "Tupiniquim SaaS — Plataforma" · assets 2/2 · SPA
  fallback OK (`scripts/cloudflare-gate.ts platform` = PASS 6/6).
- **Vertical links no bundle (build com VITE_VERTICAL_PREVIEW_URLS reais):**
  bakery/pet/restaurant/metalart/heavy-machinery = 5/5 URLs workers.dev
  presentes. Cards bloqueados (salon/religious-house/led): ZERO URLs fake.
- Propagação final dos cards validada pelo owner no browser (cards → demos).

## MetalArt — blocker técnico (não mascarado)

- Causa: o vídeo maior do dist (10,9 MiB, `serralheriametaleart_1774786200...mp4`)
  excede **5 MiB/arquivo — limite do preview API do caminho `--temporary`**
  (erro CF 10304 "Invalid manifest"). Experimentado
  `experimental_serve_directly_from_worker_cpp: true` → mesmo erro.
- O arquivo **passa** no limite de Static Assets (25 MiB/arquivo) — o caminho
  temporary é que é mais restrito. `npm ci` inicial estimou 92 MiB total do
  dist (49 MB real compactado — a estimativa do npm arredonda alto).
- **DECISÃO (regra AGENTS — preservar assets legítimos):** nenhum vídeo foi
  cortado/comprimido. Metalart aguarda login durável do owner (deploy real
  usa limite de 25 MiB/arquivo). Config já está no repo; deploy =
  `npx wrangler deploy --config apps/metalart/wrangler.jsonc`.

## Gates de segurança (pós-builds)

- `bun scripts/bundle-secret-scan.ts` = **PASS** (0 markers, 0 fingerprints)
  sobre os 6 dists recém-compilados.
- Nenhum token/credential commitado; `.wrangler/` ignorado.

## Supabase (§20)

- Nenhuma alteração. Revalidação live read-only da Bakery (gate já existente):
  **BAKERY LIVE READ = PASS** (tenant/brand/theme/settings/entitlements reais).
- DATABASE MUTATIONS: NONE.

## Nota sobre `--temporary` (transparência)

Deploys via temporary preview account: sem login do owner, os workers ficam
em modo preview com janela de claim (~59 min) no dashboard. URLs workers.dev
respondem e passaram nos gates. Para deploys DURÁVEIS (conta do owner,
versions/rollouts gerenciáveis): `npx wrangler login` + re-deploy sem
`--temporary` (docs/CLOUDFLARE_OWNER_ACTIONS.md).
