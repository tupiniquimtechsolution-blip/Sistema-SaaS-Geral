# UI Convergence Wave 01

> **Historical corrective-pass snapshot:** the execution below predates the active RC1 continuation and is not its final status. Current authoritative execution evidence is maintained in `docs/UI_SAAS_CONVERGENCE_RC1_EVIDENCE.md`.

## RC1 continuation (2026-09-30)

- Starting HEAD `0ce28a7ca2a8c70fa8ed4c9f2557fdc339bd8aba` was verified as a descendant of `origin/rc/ui-saas-convergence-01`; work remains on `arena/01a0f263-sistema-saas-geral`.
- This continuation completed the shared semantic token package, Builder workspace/AI proposal redesign, read-only settings/account polish, permission-gated recent AI usage surface, and reduced-motion/responsive CSS.
- G1–G6 PASS; G7–G10 remain PARTIAL because subscription/invoice/automation backend contracts are missing and Chromium-dependent browser/a11y/Lighthouse gates are blocked. Production npm audit has three moderate findings. Full evidence, tests, blockers and backend follow-ups are in the RC1 ledger.
- Commits: `f5da56a`, `9e07ba8`, `455bb0a`, `7c3fe41`.

## Historical execution identity and status

Execution lane: `arena/01a0f263-sistema-saas-geral`. Corrective-pass start HEAD: `10dcb5c4ca09215b3e595b37777df90ccac2797b`. The UI work is **PARTIAL**, not release-complete. No merge or PR creation is part of this execution.

## Phase record (evidence-based)

- [x] **UI-G0 — Audit.** Inspected mandatory architecture/security/product docs, current app/package structure and five 21st.dev reference listings. No reference code/assets copied. REF-02/05 code licenses/source are unresolved and remain reference-only. Full ledger: `docs/UI_REFERENCE_ADOPTION.md`.
- [~] **UI-G1 — Design foundations.** Semantic tokens and local primitives were added in Platform CSS. No shared package was justified; a design system shared across Builder and Platform is not complete.
- [x] **UI-G2 — Application shell.** Platform shell has sidebar, contextual topbar and responsive drawer. The mobile drawer has dialog semantics, focus entry/return, Tab containment, Escape and scrim behavior. Browser verification remains pending under UI-G9.
- [~] **UI-G3 — Control Plane.** Shell, data-driven views, honest empty states and status evidence were improved/reconciled. Full admin surfaces for user management, activity/audit, tenant operations and settings are not implemented; some historical live evidence is explicitly marked as historical/not revalidated.
- [~] **UI-G4 — Builder.** Structural Builder redesign is **PENDING/PARTIAL**. Existing auth, tenancy, onboarding, Draft Studio, revision/preview/publish/rollback paths were preserved; only AI composer label/busy accessibility polish was made. No Builder architecture or workflow redesign occurred.
- [~] **UI-G5 — AI Tenant Studio.** **PARTIAL.** Proposal-only flow and authorization were preserved; composer semantics were lightly polished. A substantial Morphic-inspired history, streaming, risk/capability/diff/result experience has not been implemented.
- [~] **UI-G6 — Account/settings/onboarding.** **PARTIAL.** Supabase Auth and atomic `create_tenant_with_owner` path were preserved; the planned full account/settings/onboarding polish was not delivered.
- [~] **UI-G7 — Billing Center.** Only a truthful Stripe-oriented empty state is present. Backend read/action contract and functional billing experience remain pending. Server-side Stripe foundation exists; Stripe Test Mode lifecycle E2E remains pending.
- [~] **UI-G8 — Automations/Integrations.** Only honest empty states are present. Management API/read models, connection health, run history and controls remain pending. n8n stays private/future.
- [~] **UI-G9 — Responsive/accessibility/security hardening.** CSS and drawer keyboard behaviors are implemented, but Playwright, axe and manual desktop/tablet/mobile testing are not complete. No WCAG 2.2 AA pass is claimed.
- [~] **UI-G10 — Gates/handoff.** Locked install, root checks/builds, browser E2E attempt and audit were/are executed and recorded, but browser E2E/axe remain blocked, dependency audit has findings, and manual/external release evidence is outstanding.

## Architecture and Control Plane reconciliation

- Vite configuration has been restored to product configuration; no Arena/E2B `allowedHosts` entry remains. The former setting applied to Vite's dev server, not Vite preview, and was removed as sandbox-specific.
- The Control Plane uses PT-BR navigation and labels, retaining established technical identifiers such as SaaS Core, RBAC and E2E where useful.
- Core catalog display distinguishes RBAC (user action authorization; 42 permission mirror documented) from entitlements (tenant/product capabilities). Code/tests contain 24 feature keys (14 base + 10 AI); this pass does not claim a fresh remote count query.
- Billing maturity now reflects existing server-side Stripe provider/webhook/event-ledger foundation; Stripe Test Mode E2E is still pending and not marked GREEN.
- Domains are FOUNDATION: architecture and fail-closed resolver are implemented; real QA hostname, TLS and durable smoke proof remain pending.
- Religious House is shown as an existing imported app with local build/typecheck support and SaaS Core provisioning/wiring reported in Release GREEN. Durable Cloudflare smoke remains pending; no release PASS is inferred.
- Builder Playwright specs exist in `apps/builder/e2e`; current Arena browser execution is BLOCKED because the browser binary is unavailable and download failed. It is not described as “E2E not implemented.”
- Control Plane production hosting labels use Cloudflare Workers / Static Assets. No Vercel production destination is presented.

## Security invariants

No RLS, tenant isolation, RBAC, entitlement enforcement, service-role boundary, Stripe Price mapping, AI policy, Builder revision/audit, database schema or migration was changed. No runtime dependency was added or removed. No live remote data was queried by this corrective pass; unverified state remains identified as such.

## Backend follow-ups

```text
BACKEND_FOLLOWUP:
surface: Billing Center
capability: tenant-scoped billing read model and permission-checked billing.write operations (invoice/payment method/cancel/upgrade portal contracts)
current evidence: StripeBillingProvider, stripe-webhook, billing_webhook_events and process_stripe_subscription_event exist server-side; Control Plane UI data/action contract and Stripe Test Mode lifecycle proof are pending
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

## Corrective-pass test/evidence log

- Starting working tree: clean; branch HEAD matched the audited `10dcb5c4ca09215b3e595b37777df90ccac2797b`.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS across configured workspaces; focused `npm run typecheck --workspace=@tupiniquim/religious-house`: PASS.
- `npm test`: PASS — 155 tests (Builder 5, Auth 3, Database 20, SaaS Core 114, Tenancy 13).
- `npm run build`: PASS across workspaces with build scripts; focused religious-house build: PASS. Existing warnings remain: >500 kB chunks in other vertical bundles and an unresolved inline SVG texture warning in another app.
- `npm run test:e2e` in apps/builder: BLOCKED — all 3 browser tests unable to launch because Chromium executable is absent. The previous browser install attempt failed with TLS `ECONNRESET`. No assertion ran, so this is not a test failure/pass.
- Axe: BLOCKED — axe checks are part of Playwright E2E and could not run without Chromium. No WCAG 2.2 AA pass is claimed.
- `npm audit --omit=dev --audit-level=moderate`: FAIL — 3 moderate vulnerabilities reported: React Router advisories via react-router-dom and uuid advisory. Fix suggestions require major upgrades; no `npm audit fix --force` or major upgrade was performed.
- No screenshot/manual viewport inspection evidence is attached. No WCAG AA pass is claimed.
- No migrations, remote DB mutations, runtime dependencies, secrets, PR creation, merge, live Stripe E2E or durable Cloudflare PASS.

## Remaining acceptance gaps

Structural Builder redesign; substantial AI Tenant Studio UX; complete account/settings/onboarding polish; functional Billing Center; functional Automations/Integrations; browser E2E/axe/manual responsive review; dependency finding triage; and independent external Cloudflare, live Stripe, AI provider, DNS/TLS and live smoke gates remain open. Items not executed remain NOT RUN/BLOCKED, not PASS.
