# VERCEL OWNER ACTIONS

Data: 2026-09-18 · Branch `freebuff/big-master-wave-01-monorepo`
Contexto: o sandbox Freebuff NÃO possui Vercel CLI/credencial — toda criação
de projeto, promoção de Production e mudança de team é ação do owner no
dashboard. Este arquivo contém as configurações EXATAS (auditadas no
repositório, sem inventar) para cada projeto alvo.

## AÇÃO 1 — Criar projeto dedicado `saas-bakery` (PRIORITÁRIA)

Motivo: o projeto central foi repontado para a plataforma
(`vercel.json` → `build:platform`). A Bakery precisa de um projeto próprio
ANTES de qualquer expectativa de preview dela. Ordem do cutover preservada:
Fase B (criar) → Fase C (validar) — a Fase D (deprecar bakery no central)
já foi concluída no repo com o commit do cutover.

Dashboard → **Add New… → Project** → importar
`tupiniquimtechsolution-blip/Sistema-SaaS-Geral`:

| Setting | Valor |
|---|---|
| Project Name | `saas-bakery` |
| Git → Production Branch | `main` (NÃO promover ainda — deixar sem deploy de produção) |
| Framework Preset | Vite (ou Other — o buildCommand abaixo é explícito) |
| Root Directory | **repo root** (deixar vazio/`./`) |
| Install Command | `npm ci` |
| Build Command | `npm run build:bakery` |
| Output Directory | `apps/bakery/dist` |

Environment Variables (Preview e Production quando promovido) — **apenas nomes**:

| ENV | Valor esperado | Ámbito |
|---|---|---|
| `VITE_DEMO_MODE` | `false` | Preview (+ Production depois) |
| `VITE_SUPABASE_URL` | URL do Supabase canônico (browser-safe) | Preview (+ Production depois) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | publishable key (NUNCA service_role) | Preview (+ Production depois) |

Depois de criar: acionar um deploy da branch
`freebuff/big-master-wave-01-monorepo` (Preview) e me informar a URL de
deployment — eu executo `bun scripts/preview-http-gate.ts deployment:<url>`
e registro o resultado (§29: sem HTTP real não há PASS).

## AÇÃO 2 — (Opcional, quando autorizado) Team rename

| Item | Estado |
|---|---|
| Nome atual | `Caboclo Tupinambá e Flecha Dourada` (legado organizacional) |
| Alvo conceitual | `Tupiniquim Tech Solution` (ou `Tupiniquim SaaS`) |
| Status | BLOCKED_VERCEL_TEAM_RENAME_PERMISSION (agente sem acesso; NÃO criar team duplicado) |

## AÇÃO 3 — Demais verticais (somente após validação individual)

Criar apenas quando indicado na `docs/DEPLOYMENT_RELEASE_MATRIX.md` como
BUILD PASS. Configurações auditadas (Root = repo root; Install = `npm ci`
em todos):

| Project | Build Command | Output Directory | Env (nomes) | Estado do build |
|---|---|---|---|---|
| `saas-pet` | `npm run build:pet` | `apps/pet/dist` | nenhuma (não consome) | PASS local |
| `saas-restaurant` | `npm run build:restaurant` | `apps/restaurant/dist` | nenhuma | PASS local |
| `saas-metalart` | `npm run build --workspace=apps/metalart` | `apps/metalart/dist` | nenhuma | PASS local |
| `saas-heavy-machinery` | `npm run build:heavy-machinery` | `apps/heavy-machinery/dist` | nenhuma | PASS local |

Excluídos por blocker real (NÃO criar projeto fake):

| Project | Motivo |
|---|---|
| `saas-religious-house` | MISSING_APP — BLOCKED_FREEBUFF_REPOSITORY_ACCESS_TEMPLO |
| `saas-salon` | MISSING_APP — sem implementação no monorepo |
| `saas-led` | MISSING_APP — BLOCKED_SOURCE_REPOSITORY_LED |

## Regra permanente

- **Vercel Project ≠ Tenant.** Cada cliente = tenant (dados/config no Supabase
  `mmykyzzkcugxunmekwew`), nunca fork de código nem projeto por cliente.
- Production: NÃO promover nesta fase; promoção exige preview HTTP PASS +
  gates + aprovação do owner.
- Nunca copiar o `.env.local` para o Vercel; apenas as `VITE_*` listadas.
