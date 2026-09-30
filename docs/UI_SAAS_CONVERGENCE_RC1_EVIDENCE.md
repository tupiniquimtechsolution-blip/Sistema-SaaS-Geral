# UI SaaS Convergence RC1 — Evidence Ledger

RC: `UI-SAAS-CONVERGENCE-RC1`

RC branch: `rc/ui-saas-convergence-01`

Accepted Wave 0 source head:

`692a17503a89bebc4d2acae435daeae587ab9612`

## Entry gate

- UI-G0: **PASS / ACCEPTED** (historical accepted baseline; not repeated in this execution).
- RC execution HEAD at start: `0ce28a7ca2a8c70fa8ed4c9f2557fdc339bd8aba`.
- Session branch: `arena/01a0f263-sistema-saas-geral`; verified descendant of `origin/rc/ui-saas-convergence-01` before changes.
- RC implementation and corrective commits are being pushed only to the RC lineage; no merge to `main`, no PR #18 change, and no production deploy occurred.
- External release gates remain independent.

## Phase matrix

| Phase | Status | Evidence |
|---|---|---|
| UI-G1 Design foundations | PASS | Shared `packages/ui` semantic token package consumed by Platform and Builder; both production builds and all workspace typechecks PASS. Commit `f5da56a` |
| UI-G2 Application shell | PASS | Inspected shared Platform shell: route-aware side navigation, mobile drawer with Escape/focus handling, skip link, responsive CSS; Platform production build and typecheck PASS. Manual responsive review remains a G9 gate. |
| UI-G3 Control Plane | PASS | Inspected data-driven dashboard/tenant/vertical/core/deployment/status views and explicit capability states for unsupported billing/automation/integration contracts; Platform production build and typecheck PASS. |
| UI-G4 Builder | PASS | Added tenant/vertical context bar, page/status workspace bar, Sections/Layers summary, preview/AI columns and revision-workflow jump while preserving existing revision actions. Builder build, typecheck and unit suite PASS (8 tests). Commit `9e07ba8`. |
| UI-G5 AI Tenant Studio | PASS | Replaced raw proposal JSON with typed proposal summary and contract-derived operation/capability/permission/risk/protected-fields/confirmation/arguments. Fail-closed parser; explicit non-execution and retryable failure states. 3 new proposal contract tests PASS; Builder build/typecheck PASS. Execution/completion controls intentionally absent (no execution endpoint). Commit `9e07ba8`. |
| UI-G6 Account/settings/onboarding | PASS | Existing Supabase Auth and `create_tenant_with_owner` onboarding preserved. Read-only Account/session, Brand, Theme, Tenant settings and effective entitlements reformatted into labelled fields; no unsupported identity/billing writes added. Builder typecheck/build PASS. Commit `9e07ba8`. |
| UI-G7 Billing Center | PARTIAL | Added tenant Billing view gated by exact `has_tenant_permission(..., billing.read) === true` and RLS-protected latest 10 `ai_usage_events`; no invoice/monetary totals implied. Subscription/facturation/checkout/portal remain unavailable; see Backend follow-ups. Permission gate unit test PASS. Commit `455bb0a`. |
| UI-G8 Automations/Integrations | PARTIAL | Control Plane retains honest capability states. No automation/connection persistence, tenant-scoped management API or provider-health contract found; n8n remains private. See Backend follow-ups. |
| UI-G9 Hardening | PARTIAL | GitHub Actions now provides Chromium, Playwright, axe and Lighthouse. Automated desktop/tablet/mobile viewport coverage with screenshots and horizontal-overflow assertions was added to the Builder browser contract; same-SHA rerun pending. No unsupported WCAG conformance claim. |
| UI-G10 RC validation | PARTIAL | Locked install, lint, typecheck, unit tests, full workspace build and Cloudflare hosting policy have passed on prior RC heads. CI now emits a moderate+ production dependency report while keeping high/critical advisories release-blocking. Final Quality + Builder Release Gates rerun on one common SHA is pending. |

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
| Hosting policy gate | PASS | `npm run hosting:policy`: `HOSTING_POLICY_GATE=PASS`; canonical Cloudflare Workers / Static Assets; no active Vercel deployment configuration |
| Locked install | PASS | `npm ci` completed after package wiring (345 packages added). npm install summary reported 6 vulnerabilities (5 moderate, 1 high). |
| Lint | PASS | `npm run lint` |
| Typecheck | PASS | `npm run typecheck` across workspaces |
| Unit tests | PASS | `npm test`: 159 tests passed across Builder/Auth/Database/SaaS Core/Tenancy |
| Build | PASS | Full `npm run build` across workspaces, including Builder + Platform; existing warnings: 500k+ chunk and unresolved inline noise SVG reference in an unrelated app |
| Builder E2E | PARTIAL | GitHub Actions run 36733009578 proved browser contract + accessibility + Lighthouse PASS. Live canonical smoke then exposed stale test selectors/headings rather than an RLS/Auth failure. The tenant locator and semantic Builder heading contracts are now corrected; final same-SHA rerun pending. |
| axe | PARTIAL | axe-backed contract suite passed in GitHub Actions on the prior corrected Builder head. Final same-SHA rerun pending after responsive viewport automation. No blanket WCAG conformance claim. |
| Lighthouse | PARTIAL | Lighthouse thresholds passed in GitHub Actions on the prior corrected Builder head. Final same-SHA rerun pending. |
| Production dependency audit | PARTIAL | CI blocks high/critical production advisories with `npm audit --omit=dev --audit-level=high`. A moderate+ JSON report and job summary are now generated automatically as non-bypassing evidence. Final same-SHA run pending; moderate findings require disposition but are not silently hidden. |
| Responsive viewport automation | PARTIAL | Playwright now validates desktop 1440×1000, tablet 900×1100 and mobile 390×844, checks for horizontal overflow, runs axe for each viewport and stores full-page screenshots in test artifacts. Final same-SHA run pending. |
| Security regression review | PARTIAL | Existing cross-tenant/auth/RLS/Billing/AI unit suites passed. Live smoke reaches canonical Supabase with configured QA secrets; the test now uses exact tenant selectors and a semantic Builder heading before exercising default-deny for an unowned tenant. Final same-SHA rerun pending. |

## Backend follow-ups

1. **Billing — subscription and invoices:** `packages/database/src/read.ts` can query an active subscription, but the inspected migrations do not provide a tenant-scoped `billing.read` RLS policy for `subscriptions`; do not surface that result as authorized Billing Center data. No invoice/payment-method query or portal contract was found.
2. **Billing — mutations:** `StripeBillingProvider` exists in `packages/saas-core/src/stripe-billing.ts`, but no authenticated Edge Function/action wires checkout, plan change or customer portal in this repo. Keep Price resolution server-owned and webhook authoritative; implement a tenant authorization boundary before exposing actions.
3. **Usage:** `ai_usage_events` has `billing.read` RLS and supports a truthful recent-events view only. No aggregate/period usage-summary contract found; current view deliberately limits to 10 events and makes no total or monetary claim.
4. **Automations/integrations:** no tenant-scoped persistence/RLS/API for automation definitions, connections, provider health, execution history or retries found. Define secret-isolated server contracts and audit before adding tenant actions. n8n remains private orchestration and must not be exposed.

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


## Post-Arena GitHub Actions audit

- RC implementation head `009dd97b2161b50e17a58cd1960b88a06f0e5ea6` was fast-forwarded into the canonical RC branch before browser validation.
- `Builder Release Gates` was enabled for `rc/ui-saas-convergence-01` only; this adds validation, not deployment.
- GitHub Actions run `36731923764` successfully installed Playwright Chromium and built/served the Builder.
- Browser result on that run: **2/3 tests PASS**. The remaining failure was a strict-locator ambiguity introduced by the redesigned accessible labels, not an authorization assertion failure.
- The tenant selector now uses explicit `label for` / `id` association, and the E2E uses the exact tenant combobox. This preserves the functional assertion rather than weakening it.
- A new GitHub Actions rerun is required before promoting Builder E2E/axe/Lighthouse status.


## Automation convergence update

- The previous Arena-only browser limitation is superseded by GitHub Actions Chromium execution.
- `DraftStudio` now has a real `h2#draft-studio-title` matching its `aria-labelledby`, and live smoke asserts that stable semantic landmark.
- Live smoke tenant selection uses the exact tenant combobox both before and after the default-deny navigation.
- Responsive evidence is automated for desktop/tablet/mobile and uploaded with Playwright artifacts.
- `Builder Release Gates` now watches `packages/ui/**` and this RC evidence ledger, so shared-UI/evidence changes cannot advance the RC without a browser-gate rerun.
- Production dependency advisory reporting is automated: moderate+ findings are captured as JSON/job summary; high/critical remain blocking.
- Final acceptance still requires Monorepo Quality Gates and Builder Release Gates to complete successfully on the same final SHA.
