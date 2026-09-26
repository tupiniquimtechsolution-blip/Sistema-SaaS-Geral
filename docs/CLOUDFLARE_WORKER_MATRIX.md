# CLOUDFLARE WORKER MATRIX

Data: 2026-09-18 · Fonte: docs/CLOUDFLARE_EXECUTION_REPORT.md (evidência viva).

| APP | WORKER | VERSION | URL | HTTP | ASSETS | SUPABASE | STATUS |
|---|---|---|---|---|---|---|---|
| Platform | tupiniquim-saas | bce46574-f0e7-404e-9c40-20a6c4f72453 | https://tupiniquim-saas.dramatic-condition.workers.dev | 200 (gate 6/6) | 200 (2/2 + SPA fallback) | n/a | ✅ PASS |
| Bakery | tupiniquim-bakery | cab8d1ae-4a80-4464-bb62-70de2875e771 | https://tupiniquim-bakery.dramatic-condition.workers.dev | 200 (gate 6/6) | 200 (2/2 + SPA fallback) | LIVE READ PASS (revalidado) | ✅ PASS |
| Pet | tupiniquim-pet | c5e7dd3b-e166-4fcb-b67c-1a25e70206c6 | https://tupiniquim-pet.dramatic-condition.workers.dev | 200 (gate PASS) | 200 | n/a (não integrado) | ✅ PASS |
| Restaurant | tupiniquim-restaurant | 61fd4383-b4e1-4695-8a00-340dd3dc7969 | https://tupiniquim-restaurant.dramatic-condition.workers.dev | 200 (gate PASS) | 200 | n/a (não integrado) | ✅ PASS |
| MetalArt | tupiniquim-metalart | — | — | NOT RUN | NOT RUN | n/a (não integrado) | ❌ BLOCKED_STATIC_ASSET_LIMIT (caminho temporary; deploy real via login cobre 25 MiB/arquivo) |
| Heavy Machinery | tupiniquim-heavy-machinery | c2e855a5-6789-4ab1-b6b9-c0b6b311c9a9 | https://tupiniquim-heavy-machinery.dramatic-condition.workers.dev | 200 (gate 6/6) | 200 (2/2 + SPA fallback) | n/a (não integrado) | ✅ PASS |
| Salon | — | — | — | — | — | — | DEFERRED (sem source) |
| Religious House | — | — | — | — | — | — | DEFERRED (EXTERNAL_BLOCKED) |
| LED | — | — | — | — | — | — | DEFERRED (sem source) |

Zero-cost: nenhuma feature paga habilitada. WORKER_MAIN: NONE em todos.
Vercel permanece intacto como rollback.
