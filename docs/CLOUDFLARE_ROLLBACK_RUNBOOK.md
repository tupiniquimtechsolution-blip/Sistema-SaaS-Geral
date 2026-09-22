# CLOUDFLARE ROLLBACK RUNBOOK

Data: 2026-09-18 · Princípio: migrate → validate → cutover → deprecate.
Nesta wave NENHUM DNS/domínio foi alterado — "cutover" de tráfego ainda não
existe; rollback = continuar usando a origem alternativa (Vercel) ou reverter
a versão do Worker.

## Estado de rollback por app

| App | Cloudflare (novo) | Vercel (rollback source) | Last known good | Rollback |
|---|---|---|---|---|
| Platform | tupiniquim-saas · bce46574 · https://tupiniquim-saas.dramatic-condition.workers.dev | projeto central `sistema-saa-s-geral` — deployment do commit 657fb86 VALIDADO (GET / = 200, title plataforma; URL do deployment registrada pelo owner: sistema-saa-s-geral-pd4osf8ql.vercel.app) | 657fb86 | Manter público em Vercel (já ativo) — nenhuma ação |
| Bakery | tupiniquim-bakery · cab8d1ae | projeto central publicou a Bakery até o cutover (HTTP 200 provado pelo owner no deployment b8babe9) | 657fb86 | idem |
| Pet / Restaurant / Heavy Machinery | workers.dev URLs na WORKER MATRIX | sem projeto Vercel dedicado (DECISÃO: OPTIONAL/NOT REQUIRED) — rollback = redeploy da versão anterior do Worker | commit ed91895 | `npx wrangler versions rollback` (após login) ou redeploy do commit anterior |
| MetalArt | sem deploy (blocker temporary-path) | n/a | — | sem tráfego migrado — nada a reverter |

## Procedimento padrão de rollback

1. **Tráfego** (quando existir cutover de domínio — hoje NÃO existe): reverter
   DNS/CNAME para a origem anterior. TTL baixo (60s) na janela de cutover.
2. **Versão Cloudflare** (com login do owner):
   `npx wrangler versions list --config apps/<app>/wrangler.jsonc` →
   `npx wrangler versions rollback <version-id> --config apps/<app>/wrangler.jsonc`.
3. **Rebuild de emergência**: `npm ci && npm run build:<app>` no
   last-known-good commit → `npx wrangler deploy --config apps/<app>/wrangler.jsonc`.
4. **Vercel intacto**: nenhum projeto/deployment Vercel foi alterado ou removido
   nesta wave (vercel.json preservado no repo).

## Regras

- NUNCA remover/desativar o Vercel antes da aceitação final do owner.
- Nenhum rollback requer contato com Supabase (backend nunca foi tocado).
- Após qualquer rollback: re-executar `bun scripts/cloudflare-gate.ts <app> <url>`
  e registrar resultado no WORKER MATRIX.
