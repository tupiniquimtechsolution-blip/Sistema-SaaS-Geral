# UI Convergence Wave 01

## Goal and execution status

Create a unified, premium SaaS design language for administrative surfaces while preserving multi-tenant architecture and the identities of public vertical experiences.

Execution lane: `arena/01a0f263-sistema-saas-geral` (authorized Arena session branch). Start HEAD: `6ce5ac2b7185aaf698ff8c97264c06ab9a68372d`. No merge or PR creation is part of this execution.

## Scope / non-goals

In scope: semantic tokens; Control Plane shell; Builder/AI accessibility and responsive polish; account/onboarding continuity; documented backend gaps for Billing, Automations and Integrations; tests and handoff.

Out of scope: replacing Supabase/Auth/RLS/RBAC/entitlements/Stripe/Cloudflare, installing n8n, destructive database changes, production DNS, merging Release GREEN, or redesigning public verticals as a generic template.

## Phase record

- [x] **UI-G0 — Audit.** Inspected mandatory architecture/security/product documents, workspace manifests and current platform/builder/shared domain structure. Audited the five reference listings; see `docs/UI_REFERENCE_ADOPTION.md`. No reference code reused; REF-02/05 code licenses not proven and are reference-only.
- [x] **UI-G1 — Design foundations.** Added semantic design tokens within the existing Platform app stylesheet; no duplicate UI package or dependency introduced.
- [x] **UI-G2 — Application shell.** Reworked Control Plane into a desktop sidebar + contextual topbar + keyboard-accessible mobile drawer/scrim using existing hash routes.
- [x] **UI-G3 — Control Plane.** Existing data-driven views retained; no fabricated metrics/data added. Visual treatment converged via semantic surface, card, table and status primitives. Existing capability gaps stay explicitly described by source data.
- [x] **UI-G4 — Builder.** Preserved login, tenant membership validation, onboarding RPC path, Draft Studio/revision workflow, preview and controls. Existing responsive editor CSS remains; no Builder domain or RLS changes.
- [x] **UI-G5 — AI Tenant Studio.** Existing AI gateway remains proposal-only; no authorization/tool policy changes. UI continues to explain proposal and non-execution boundaries.
- [x] **UI-G6 — Auth/account/onboarding.** Supabase Auth and `create_tenant_with_owner` flow unchanged. No unsupported OAuth/recovery/MFA claims added.
- [ ] **UI-G7 — Billing Center.** No supported platform billing-read/write UI contract was found during this wave audit; do not invent subscription/invoice state. Backend/UI follow-up recorded.
- [ ] **UI-G8 — Automations/Integrations.** No real management contracts/data found for a functional UI; avoid fake cards/statuses or tenant-facing n8n. Follow-ups recorded.
- [x] **UI-G9 — Hardening.** Responsive navigation, focus, skip link, semantic landmarks, reduced motion and small-screen table overflow treatment included. Automated axe/Playwright not yet executed unless recorded below.
- [ ] **UI-G10 — Gates/handoff.** Run applicable install/typecheck/test/build checks and record results. External Cloudflare, live Stripe, AI provider, DNS/TLS and live smoke gates remain independent and are not claimed.

## Invariants

RLS, tenant isolation, RBAC, entitlements, service-role confinement, server-owned Stripe mapping, AI typed proposal/confirmation policy, Builder revision/audit workflow and Cloudflare-compatible builds must not regress.

## Reference classifications

ADOPT: semantic navigation/status/accessibility patterns implemented locally. ADAPT: REF-01 account/form hierarchy, REF-03 admin shell, REF-04 billing information architecture and REF-05 proposal presentation ideas. REFERENCE_ONLY: Polar and Morphic code/source where license/provenance is unresolved; no copied template code. REJECT: framework/provider/auth/hosting migrations and fabricated backend functionality. Full record: `docs/UI_REFERENCE_ADOPTION.md`.

## Backend follow-ups

```text
BACKEND_FOLLOWUP:
surface: Billing Center
capability: tenant-scoped billing read model and permission-checked billing.write operations (invoice/payment method/cancel/upgrade portal contracts)
current evidence: shared Stripe provider and webhook/subscription/entitlement domain contracts exist; no verified platform UI data/action contract identified during this UI pass
required contract: server resolves approved planId -> Stripe Price; tenant/member permission checks; Stripe webhook remains subscription/entitlement authority; invoice/payment/portal actions modeled server-side
security impact: high; never trust browser tenant/Price ID or success redirect
proposed owner: SaaS Core/Billing backend
blocking UI? yes, for truthful live data/actions; no, for static architecture/preparatory design
```

```text
BACKEND_FOLLOWUP:
surface: Automations and Integrations
capability: tenant-scoped connection health/configuration/run history and approved automation lifecycle
current evidence: no verified integration/automation management API/read-model found for Control Plane
required contract: server-mediated provider adapters, permissions/entitlements, audit, secret isolation, run idempotency and tenant-aware health/errors
security impact: high; credentials must never be exposed to browser; n8n stays private orchestration
proposed owner: Integrations/Operations backend
blocking UI? yes, for functional controls; no, for future empty-state information architecture
```

## Test/evidence log

- Baseline branch: clean at `6ce5ac2b7185aaf698ff8c97264c06ab9a68372d`.
- Reference listing audit: completed 2026-09-30; see adoption ledger. No source code/assets copied.
- UI automated checks/builds: pending execution and must be recorded with actual command/result before handoff.
- Screenshots: none captured; local live preview may be used for manual review.
- No migrations, dependencies, secrets, production data, PR creation, merge, or release claims.

## Definition of done

Changed surfaces build and relevant tests pass; license decisions and gaps are recorded; accessibility has evidence; no security invariant is weakened; branch is pushed for human review without automatic merge. Items not executed remain NOT RUN/BLOCKED, not PASS.
