# SAAS RELEASE READINESS

Data: 2026-09-18 · Branch `freebuff/big-master-wave-01-monorepo`
Resposta direta a: "o que falta para o Sistema-SaaS-Geral ser comercializável?"

## Resumo

| Dimensão | Estado |
|---|---|
| Plataforma (control plane) | **PASS** — build/typecheck/HTTP/identidade provados |
| SaaS Core multi-tenant | **PASS** — 105 testes; RLS/storage/entitlements provados live |
| Verticais compiláveis (5) | **PASS** — bakery/pet/restaurant/metalart/heavy-machinery |
| Verticais bloqueados (3) | BLOCKED externo — religious-house / salon / led (nada inventado) |
| Previews Vercel | **PARCIAL** — deployment do central pendente; dedicados = owner action |
| Produção | NOT PROMOTED (por design — exige gates + aprovação) |

## Fluxo comercial (target, já suportado pela arquitetura)

CLIENTE COMPRA → tenant criado (RPC canônica) → branding/config → domínio →
plano/permissões → vertical ativado → cliente acessa o próprio SaaS.
O cliente NUNCA precisa de acesso ao Cloudflare/Supabase Dashboard.
Infra dedicada só para cliente que exigir ownership explícito.

## Ações restantes (todas do owner, nenhuma de código)

1. Acionar deployment da branch no projeto central (`sistema-saa-s-geral`) e
   fornecer a URL → eu valido com `bun scripts/preview-http-gate.ts deployment:<url>`.
2. Criar `saas-bakery` (docs/VERCEL_OWNER_ACTIONS.md — AÇÃO 1) e fornecer a URL.
3. Criar `saas-pet` / `saas-restaurant` / `saas-metalart` / `saas-heavy-machinery`
   (AÇÃO 3 do mesmo doc) e fornecer as URLs.
4. (Opcional) Team rename → Tupiniquim Tech Solution (AÇÃO 2).
5. (Opcional) Configurar `VITE_VERTICAL_PREVIEW_URLS` no central com as URLs
   dos previews para os cards do control plane virarem links clicáveis.

Depois de 1–3: eu executo o HTTP gate por app e atualizo a release matrix —
nesse momento o preview passará de PARCIAL para PASS.

## Classificação de produção por app

| App | PRODUCTION |
|---|---|
| Platform | PREVIEW_ONLY (pronto após validação HTTP do deployment) |
| Bakery | PREVIEW_ONLY (aguarda projeto dedicado + validação) |
| Pet/Restaurant/MetalArt/Heavy | PREVIEW_ONLY (aguarda projetos dedicados) |
| Religious House / Salon / LED | BLOCKED (blockers externos) |
