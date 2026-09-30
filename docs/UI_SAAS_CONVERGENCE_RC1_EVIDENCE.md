# UI SaaS Convergence RC1 — Evidence Ledger

RC: `UI-SAAS-CONVERGENCE-RC1`

RC branch: `rc/ui-saas-convergence-01`

Accepted Wave 0 source head:

`692a17503a89bebc4d2acae435daeae587ab9612`

## Entry gate

- UI-G0: **PASS / ACCEPTED**
- Corrective pass audited before RC creation.
- Feature branch fast-forwarded to accepted Wave 0 head.
- No merge into Release GREEN or main.
- PR #19 remains the tracking/integration PR.
- External release gates remain independent.

## Phase matrix

| Phase | Status | Evidence |
|---|---|---|
| UI-G1 Design foundations | NOT RUN | RC execution pending |
| UI-G2 Application shell | NOT RUN | RC execution pending |
| UI-G3 Control Plane | NOT RUN | RC execution pending |
| UI-G4 Builder | NOT RUN | RC execution pending |
| UI-G5 AI Tenant Studio | NOT RUN | RC execution pending |
| UI-G6 Account/settings/onboarding | NOT RUN | RC execution pending |
| UI-G7 Billing Center | NOT RUN | RC execution pending |
| UI-G8 Automations/Integrations | NOT RUN | RC execution pending |
| UI-G9 Hardening | NOT RUN | RC execution pending |
| UI-G10 RC validation | NOT RUN | RC execution pending |

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
| Hosting policy gate | NOT RUN | `npm run hosting:policy` — must prove active Vercel deployment config is absent |
| Locked install | NOT RUN | |
| Lint | NOT RUN | |
| Typecheck | NOT RUN | |
| Unit tests | NOT RUN | |
| Build | NOT RUN | |
| Builder E2E | NOT RUN | |
| axe | NOT RUN | |
| npm audit | NOT RUN | |
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
