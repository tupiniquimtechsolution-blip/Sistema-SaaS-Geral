# UI Convergence Wave 01

## Goal and execution status

Create a unified, premium SaaS design language for administrative surfaces while preserving multi-tenant architecture and the identities of public vertical experiences.

Execution lane: `arena/01a0f263-sistema-saas-geral` (authorized Arena session branch). Start HEAD: `6ce5ac2b7185aaf698ff8c97264c06ab9a68372d`. No merge or PR creation is part of this execution.

## Scope / non-goals

In scope: semantic tokens; Control Plane shell; Builder/AI accessibility and responsive polish; account/onboarding continuity; explicit empty states for backend-dependent Billing, Automations and Integrations; tests and handoff.

Out of scope: replacing Supabase/Auth/RLS/RBAC/entitlements/Stripe/Cloudflare, installing n8n, destructive database changes, production DNS, merging Release GREEN, or redesigning public verticals as a generic template.

## Phase record

- [x] **UI-G0 — Audit.** Inspected mandatory architecture/security/product documents, workspace manifests and current platform/builder/shared domain structure. Audited the five reference listings; see `docs/UI_REFERENCE_ADOPTION.md`. No reference code reused; REF-02/05 code licenses not proven and are reference-only.
- [x] **UI-G1 — Design foundations.** Added semantic design tokens within the existing Platform app stylesheet; no duplicate UI package or dependency introduced.
- [x] **UI-G2 — Application shell.** Reworked Control Plane into a desktop sidebar + contextual topbar + keyboard-operable mobile drawer/scrim using existing hash routes. Added Escape handling and removes closed drawer from mobile visibility/accessibility tree.
- [x] **UI-G3 — Control Plane.** Existing data-driven views retained; no fabricated metrics/data added. Visual treatment converged via semantic surface, card, table and status primitives. Existing capability gaps stay explicitly described by source data.
- [x] **UI-G4 — Builder.** Preserved login, tenant membership validation, onboarding RPC path, Draft Studio/revision workflow, preview and controls. AI composer field has explicit association and async form indicates busy state. Existing responsive editor CSS remains; no Builder domain or RLS changes.
- [x] **UI-G5 — AI Tenant Studio.** Existing AI gateway remains proposal-only; no authorization/tool policy changes. UI continues to explain proposal and non-execution boundaries.
- [x] **UI-G6 — Auth/account/onboarding.** Supabase Auth and `create_tenant_with_owner` flow unchanged. No unsupported OAuth/recovery/MFA claims added.
- [~] **UI-G7 — Billing Center.** Added navigable Stripe-oriented empty state only. It explicitly reports that tenant-scoped billing data/actions are not connected; no fake subscription, invoices, prices or checkout controls.
- [~] **UI-G8 — Automations/Integrations.** Added explicit empty-state routes only. No fake integration health/runs or controls; n8n remains private/future and credentials stay server-side.
- [x] **UI-G9 — Hardening.** Responsive navigation, focus, skip link, semantic landmarks, reduced motion and small-screen table overflow treatment included. Playwright/axe execution blocked by missing browser binary and failed network download; see gates below.
- [~] **UI-G10 — Gates/handoff.** Locked install, lint, typecheck, unit tests and workspace build executed. Production dependency audit has existing findings; Playwright browser could not be installed. Results recorded below. External Cloudflare, live Stripe, AI provider, DNS/TLS and live smoke gates remain independent and are not claimed.

## Invariants

RLS, tenant isolation, RBAC, entitlements, service-role confinement, server-owned Stripe mapping, AI typed proposal/confirmation policy, Builder revision/audit workflow and Cloudflare-compatible builds were not changed. No migrations or runtime dependencies added.

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
blocking UI? yes, for truthful live data/actions; no, for static empty-state shell
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

- Baseline branch/HEAD: clean at `6ce5ac2b7185aaf698ff8c97264c06ab9a68372d`.
- `npm ci`: PASS (locked install; 344 packages added). Install reports 6 advisories in full tree.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS before final small UI route additions; final affected `tupiniquim-platform` typecheck PASS.
- `npm test`: PASS — 155 tests across Builder, Auth, Database, SaaS Core, Tenancy workspaces.
- `npm run build`: PASS for workspaces with build scripts. Output includes existing >500 kB chunk warning and an unresolved inline SVG texture warning from another app. Final affected Platform build PASS (166.26 kB JS / 53.19 kB gzip).
- `npm audit --omit=dev --audit-level=moderate`: FAIL due to existing transitive React Router and uuid moderate advisories. Full audit reports six vulnerabilities (five moderate, one high), including Wrangler/undici. No forced dependency upgrade performed because it would change major versions / exceed this UI-only scope.
- `npm run test:e2e` in `apps/builder`: BLOCKED (all 3 test cases unable to launch; Playwright Chromium executable absent). `npx playwright install chromium`: BLOCKED by TLS/ECONNRESET downloading browser. No test assertion failed; tests did not execute in a browser.
- Accessibility axe checks are present in Builder E2E contract tests, but BLOCKED with Playwright browser install. No WCAG AA pass is claimed.
- Local HTTP smoke: Platform and Builder dev servers returned HTTP 200. Vite preview-host allowlist configured for `.e2b.app`.
- No screenshots committed. Control Plane preview exposed at the running Arena preview; manual viewport/accessibility audit remains required.
- No migrations, dependencies, secrets, production data, PR creation, merge, Stripe E2E, Cloudflare, or release claims.

## Definition of done

This execution implements the safe UI slices and records explicit blockers. Full wave acceptance remains pending live Billing/Automation/Integration contracts, successful browser-based E2E/axe, resolution/review of existing dependency findings, manual screenshot review, and external release gates. Items not executed remain NOT RUN/BLOCKED, not PASS.
