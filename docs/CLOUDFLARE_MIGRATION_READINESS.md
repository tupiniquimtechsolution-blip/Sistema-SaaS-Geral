# CLOUDFLARE MIGRATION READINESS

Data: 2026-09-18 · **EXECUÇÃO REALIZADA (workers.dev)** — evidência viva em
docs/CLOUDFLARE_EXECUTION_REPORT.md + docs/CLOUDFLARE_WORKER_MATRIX.md.
Plano revisado (Workers Static Assets): docs/CLOUDFLARE_MIGRATION_MASTER_PLAN.md.

## Pré-condições

| Pré-condição | Estado |
|---|---|
| CODE_PRODUCT_COMPLETE | **YES** (ver docs/PLATFORM_COMPLETION_REPORT.md + docs/MVP_COMMERCIAL_READINESS.md) |
| HOSTING PORTABILITY | **PASS** (docs/HOSTING_PORTABILITY_AUDIT.md — zero lock-in) |
| Security gates | PASS (58/58 · 42/42 · secret scan) |
| Builds por app | PASS (6 apps) |
| Preview HTTP gate reutilizável | SIM (HTTP puro — funciona contra Pages) |

## Checklist de execução (futura wave, autorização do owner exigida)

1. Criar Pages projects (mapping no master plan §2) — **a fazer**
2. Env matrix por projeto (VITE_* apenas) — **a fazer**
3. Preview deploy + `preview-http-gate.ts deployment:<url>` por app — **a fazer**
4. Headers/cache (_headers) + not-found = index.html — **a fazer**
5. Domínios/DNS (fase 2/3 do plano; TTL baixo; rollback Vercel intacto) — **a fazer**
6. Cutover por app + observação + deprecação formal do Vercel — **a fazer**

## Veredito

**CLOUDFLARE_MIGRATION_READY = YES (consumido) → CLOUDFLARE_MIGRATION = PASS
parcial-durável:** 5/6 apps deployados e validados HTTP/identidade no
workers.dev (bakery/pet/restaurant/heavy-machinery/platform); MetalArt
**BLOCKED_STATIC_ASSET_LIMIT** apenas no caminho temporary-preview (limite
5 MiB/arquivo da API de preview; o deploy durável com login do owner usa o
limite de 25 MiB/arquivo e cobre o vídeo de 22M — config commitada, nenhum
corte de mídia). DNS/custom domains: NOT EXECUTED (PENDING_OWNER_AUTHORIZATION).
Vercel intacto como rollback.
