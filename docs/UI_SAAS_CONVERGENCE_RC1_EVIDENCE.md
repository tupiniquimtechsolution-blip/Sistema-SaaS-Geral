# UI SaaS Convergence RC1 — Evidence Ledger

RC: `UI-SAAS-CONVERGENCE-RC1`

RC branch: `rc/ui-saas-convergence-01`

Accepted Wave 0 source head:

`692a17503a89bebc4d2acae435daeae587ab9612`

## Entry gate

- UI-G0: **PASS / ACCEPTED** (historical accepted baseline; not repeated in this execution).
- RC execution HEAD at start: `0ce28a7ca2a8c70fa8ed4c9f2557fdc339bd8aba`.
- Session branch: `arena/01a0f263-sistema-saas-geral`; verified descendant of `origin/rc/ui-saas-convergence-01` before changes.
- No branch switch, merge, PR, or push performed.
- External release gates remain independent.

## Phase matrix

| Phase | Status | Evidence |
|---|---|---|
| UI-G1 Design foundations | PASS | Added shared `packages/ui` semantic token package and consumed by Platform and Builder; Builder and Platform production builds PASS; all workspace typechecks PASS. Commit: pending |
| UI-G2 Application shell | NOT RUN | Execution pending |
| UI-G3 Control Plane | NOT RUN | Execution pending |
| UI-G4 Builder | NOT RUN | Execution pending |
| UI-G5 AI Tenant Studio | NOT RUN | Execution pending |
| UI-G6 Account/settings/onboarding | NOT RUN | Execution pending |
| UI-G7 Billing Center | NOT RUN | Execution pending |
| UI-G8 Automations/Integrations | NOT RUN | Execution pending |
| UI-G9 Hardening | NOT RUN | Execution pending |
| UI-G10 RC validation | NOT RUN | Execution pending |

## RC invariants

Must remain true throughout the RC:

- Supabase/PostgreSQL is canonical data authority.
- Supabase Auth remains authentication.
- RLS remains tenant-isolation authority.
- RBAC and entitlements remain distinct.
- Stripe remains SaaS billing provider.
- Browser cannot choose arbitrary Stripe Price IDs.
- Service role never enters browser code.
- AI does not grant authorization.
- Builder revision/review/publish/rollback contracts remain intact.
- n8n stays private orchestration, not tenant-facing editor.
- Cloudflare Workers / Static Assets is the only canonical hosting target.
- Vercel is historical-only: no deploy, preview, production, fallback, rollback, CLI/action/config/secrets.
- No blind `supabase db push`.
- `0001_multi_tenant_schema.sql` must never be applied.

## Evidence rules

Use only:

- PASS
- PARTIAL
- BLOCKED
- NOT RUN
- MISSING

Never promote historical evidence into a current PASS unless the RC actually reruns or clearly cites the accepted baseline evidence and labels it historical.

## Test ledger

| Gate | Status | Evidence |
|---|---|---|
| Hosting policy gate | NOT RUN | Must run `npm run hosting:policy` |
| Locked install | PASS | `npm ci` after shared package wiring; 345 packages added; npm reported 6 vulnerabilities (5 moderate, 1 high) |
| Lint | NOT RUN | |
| Typecheck | PASS | `npm run typecheck --workspaces --if-present` |
| Unit tests | NOT RUN | |
| Build | PARTIAL | `npm run build --workspace=tupiniquim-builder` and `npm run build --workspace=tupiniquim-platform` PASS; full workspace build pending |
| Builder E2E | NOT RUN | |
| axe | NOT RUN | |
| npm audit | NOT RUN | Install reported 6 vulnerabilities; full audit review pending |
| Manual responsive review | NOT RUN | |
| Security regression review | NOT RUN | |

## Backend follow-ups

Carry forward and refine:

1. Tenant-scoped Stripe Billing read/write contracts for functional Billing Center.
2. Tenant-aware Integration/Automation contracts, secret isolation, audit and n8n-private orchestration.

Add new follow-ups only when evidence shows a real missing contract.

## External gates not owned by this UI RC

Do not claim these from UI code alone:

- durable Cloudflare deployment/smoke;
- Stripe Test Mode E2E;
- AI provider live configuration;
- custom hostname/TLS;
- external rollback proof;
- production smoke;
- Release GREEN merge/tag.

## Final acceptance

RC acceptance requires an evidence-based final matrix, test/build results, security review, documented blockers, and a deliberate integration decision. No automatic merge.
