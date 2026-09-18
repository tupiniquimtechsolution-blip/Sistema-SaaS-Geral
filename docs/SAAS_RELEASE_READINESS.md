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

## ATUALIZAÇÃO (2026-09-18, fechamento do produto)

- **PLATFORM REMOTE PREVIEW = PASS** (fato verificado pelo owner: deployment
  do commit 657fb86 → READY, GET / = 200, title "Tupiniquim SaaS — Plataforma").
- **Estratégia de hosting (decisão do owner):** NÃO criar projetos Vercel
  dedicados por vertical — Vercel permanece apenas PREVIEW/DEV/VALIDAÇÃO do
  central; publishing comercial definitivo na wave Cloudflare. Projetos
  dedicados = OPTIONAL / NOT REQUIRED.
- **CODE_PRODUCT_COMPLETE = YES** · **MVP_COMMERCIAL_READY = YES**
  (docs/MVP_COMMERCIAL_READINESS.md) · **CLOUDFLARE_MIGRATION_READY = YES**
  (execução aguarda autorização — NÃO migrar automaticamente).
- Ações restantes de owner: NENHUMA obrigatória para completude do produto;
  opcionais: team rename (AÇÃO 2), `VITE_VERTICAL_PREVIEW_URLS` no central
  para links de demo nos cards, e a futura autorização da wave Cloudflare.

## Classificação por app (nova semântica)

| App | CODE_READY | LOCAL_PREVIEW | TEMP_REMOTE_PREVIEW | CLOUDFLARE_READY | COMMERCIAL_READY | FINAL_HOSTING |
|---|---|---|---|---|---|---|
| Platform | PASS | PASS | PASS (central 657fb86) | PASS | PASS | NOT DEPLOYED |
| Bakery | PASS | PASS | OPTIONAL | PASS | PASS (integração e2e) | NOT DEPLOYED |
| Pet/Restaurant/MetalArt/Heavy | PASS | PASS | OPTIONAL | PASS | PASS (integração SaaS incremental) | NOT DEPLOYED |
| Salon | BLOCKED (sem material) | — | — | — | NOT READY | — |
| Religious House | EXTERNAL_BLOCKED / POST-MVP IMPORT | — | — | — | — | — |
| LED | DEFERRED_EXTERNAL_SOURCE | — | — | — | — | — |
