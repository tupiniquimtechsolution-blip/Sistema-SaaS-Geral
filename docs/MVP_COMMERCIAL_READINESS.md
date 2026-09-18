# MVP COMMERCIAL READINESS

Data: 2026-09-18 · Definição: o que o produto precisa para **MVP SELLABLE** —
sem infra definitiva, sem billing automático, sem automação excessiva de
domínios. Vercel dedicado por vertical NÃO é requisito.

## Tenant commercial flow — classificação por etapa

| Etapa | Estado | Evidência / Nota |
|---|---|---|
| Cliente compra | NOT REQUIRED FOR MVP (MVP) | Venda manual do owner; nenhum checkout no produto |
| Criar tenant | **IMPLEMENTED** | RPC canônica `create_tenant_with_owner` (idempotente; usada nos QA A/B) |
| Escolher vertical | **IMPLEMENTED** | `vertical_id` na RPC; catálogo de verticais no control plane |
| Atribuir plano | **IMPLEMENTED (modelo)** | `p_plan_id` na RPC; subscriptions/plans no schema; BILLING ENGINE = POST-MVP |
| Branding | **MVP_PASS** | tenant_brands/tenant_themes por tenant — leitura live provada (bakery adapter); edição por configuração, sem fork |
| Domínio | **MVP_PASS (manual)** | Onboarding manual aceitável; mapping tenant↔hostname definido em docs/TENANT_DOMAIN_ARCHITECTURE.md; hostname sempre validado server-side; zero automação antes da Cloudflare wave |
| Usuários | **IMPLEMENTED** | Supabase Auth real; memberships por tenant |
| Permissões | **IMPLEMENTED** | RBAC server-side; mirror 42; RLS = autoridade |
| Entitlements | **IMPLEMENTED** | features=14; plan/tenant entitlements; effective set default-deny |
| Dados isolados | **IMPLEMENTED** | RLS 58/58 + storage 42/42 — isolamento provado live |
| Site publicado | **DEPLOYED (workers.dev)** | 5/6 apps publicados no Cloudflare Workers Static Assets (bakery/pet/restaurant/heavy-machinery/platform — docs/CLOUDFLARE_WORKER_MATRIX.md); MetalArt pending owner login (blocker temporary-path); domínios definitivos = wave de cutover |

## Decisões de escopo MVP (registradas)

| Item | Decisão |
|---|---|
| BILLING ENGINE (Stripe/cobrança) | **POST-MVP** — sem decisão do owner de pagamento, nada implementado; modelo plan/entitlement já suporta |
| Automação de domínios | **POST-MVP** — manual onboarding suficiente p/ MVP (segurança documentada) |
| Projetos Vercel dedicados por vertical | **NOT REQUIRED** — decisão do owner; publishing comercial na Cloudflare wave |
| Editor de branding (UI) | POST-MVP — configuração via dados hoje; modelo já resolve |
| Gestão UI de tenants no central | POST-MVP — infra e RPC já existem |

## Verticais MVP

| Vertical | MVP | Justificativa |
|---|---|---|
| Bakery | SIM — CODE_READY + integração e2e provada | referência end-to-end |
| MetalArt | SIM — CODE_READY | vertical principal (premium) |
| Pet | SIM — CODE_READY | pronto p/ integração |
| Restaurant | SIM — CODE_READY | pronto p/ integração |
| Heavy Machinery | SIM — CODE_READY | pronto p/ integração |
| Salon | NÃO — blocker concreto (ver §7 da wave) | nenhum material importável |
| Religious House | NÃO — EXTERNAL_BLOCKED / POST-MVP IMPORT | source inacessível |
| LED | NÃO — DEFERRED_EXTERNAL_SOURCE | source inexistente |

## Veredito

**MVP_COMMERCIAL_READY = YES** (5 verticais MVP CODE_READY + tenant flow
MVP_PASS + branding/domínio no modelo correto + security gates PASS).
O que falta é **FINAL_HOSTING_COMPLETE** (wave Cloudflare), não produto.
