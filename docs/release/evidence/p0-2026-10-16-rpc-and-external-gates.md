# P0 privileged RPC review and external completion plan — 2026-10-16

**Scope:** this checkpoint captures verified read-only canonical inspection, disposable SQL-model testing, and external prerequisites. **Not a production security signoff or Commercial Ready approval.**

## ESTADO ATUAL

- Release SHA (unchanged): `e49598f73f9d4f5df43ce272d002d4bbf2c1154b` on `feature/ui-saas-convergence-wave-01`.
- QA PR #23: `qa/tenant-isolation-staging-20261010` (draft, no merge). Code QA tests pass at `78b64133ccfa4d4ed9d9e524bd352126532dcf56`.
- [PostgreSQL negative RPC boundary run 38882462614](https://github.com/tupiniquimtechsolution-blip/Sistema-SaaS-Geral/actions/runs/38882462614): **PASS on that QA code SHA**, covering modeled anon/identity/cross-tenant/invalid-credit checks. **Does not prove trusted event origin**, only modeled guard semantics.
- [Monorepo Quality Gates 38882462582](https://github.com/tupiniquimtechsolution-blip/Sistema-SaaS-Geral/actions/runs/38882462582): **PASS 3/3 on the same QA code SHA**, including high+ production dependency audit.
- Canonical project `mmykyzzkcugxunmekwew`: **read-only** SQL audit. Both `consume_ai_credit` and `write_audit_log` are `public.SECURITY DEFINER`, callable by `authenticated`, not `anon`. Both check the caller belongs to the requested tenant; `consume_ai_credit` also verifies consumption bounds/quota. `ai_usage_events` and `audit_logs` have RLS enabled, with read-only policies for tenant-authorized roles.
- Stripe Test Mode account `acct_1UJupYRtfyNk1GR1`: as of 2026-10-16 **0 products, 0 prices, 0 webhook endpoints, 0 subscriptions** (read-only full list).
- No newly billable Supabase branch, production writes, Stripe objects/charges, Cloudflare deployments, DNS/route changes or customer data access.

## Security review — risks not closed by modeled PASS

1. **Consumption provenance / quota integrity:** the inspected `consume_ai_credit` function checks membership, numeric bounds and monthly entitlement, but the invocation surface itself accepts caller-supplied usage metadata. An authenticated member can call the RPC without a provider-backed operation receipt visible to that function. This creates a potential same-tenant quota-abuse risk; **live exploitation was not performed**. Verify that only a trusted backend can post server-verified usage, with idempotency and a real operation ID.
2. **Audit event provenance:** `write_audit_log` records `auth.uid()` and enforces membership, but caller-supplied action/resource/metadata must **not** be accepted as authoritative security/system events. Require trusted source/allowlisted event types or separate client-declared activity from server-generated security audit records. **No live forgery attempt was made**.
3. Do not immediately REVOKE `EXECUTE` in production: the deployed `tenant-ai-gateway` currently calls `consume_ai_credit` using the bearer user's JWT. A revoke without a reviewed server-owned replacement could break AI usage. Implement server-side provenance, transition the caller, test staging, then tighten grants via separately approved migration.
4. Other Security Advisor warnings (public SECURITY DEFINER RPCs, leaked-password protection disabled, `billing_webhook_events` without policies) still require deliberate triage and acceptance, not gate suppression.

## Completion runbook: hosted Supabase low-privilege A↔B

**Owner decision currently prohibits paid branches and all production mutations.** Under those constraints, a complete remote-hosted write E2E **cannot run yet**; only safe read-only inventory or existing approved non-admin identities are possible.

1. Choose an **existing isolated, authorized free QA project** with capacity (confirm actual zero incremental cost), or request explicit authorization for a separate disposable QA project. Do **not** use unrelated Pausa AI; do not create a billable branch.
2. Reconcile the isolated project's schema against canonical migrations **read-only**. Never replay obsolete `0001_multi_tenant_schema.sql` or copy production customer records.
3. In **QA project only**, provision fictitious tenant A and B and two distinct QA Auth identities with strong credentials. Give each exactly one active tenant membership and minimal roles, **no Platform Master**. Configure allowed test plan/entitlements without real billing or customer data.
4. Keep test credentials in an approved secret manager/GitHub Actions `qa-isolation` environment, not in issues, chat, client bundles or committed files. Record project ref and account owner. Environment needs required reviewer approval.
5. Verify Auth/password sessions, tenant membership and `is_platform_admin()=false`. Run `scripts/cross-tenant-smoke.ts` (read-only) and then `scripts/rls-gate.ts` (writes only after explicit isolated QA acknowledgement). The draft staging workflow `.github/workflows/qa-tenant-isolation-stage.yml` requires approval for the QA project ref and write mode; `workflow_dispatch` workflows may require an approved default-branch registration before being manually selectable. No premature merge into release.
6. Test A→A/B→B allow and A→B/B→A deny for SELECT/INSERT/UPDATE/DELETE, memberships, role elevation, entitlements, billing, storage and Builder/AI URL access. Compare database and API outcomes. No skip as PASS.
7. Capture SHA, QA project ref, sanitized run IDs, operator, expected/observed results, cleanup and rollback. Decommission isolated data/resources when authorized.
8. **Canonical-hosted evidence is a separate gate:** a disposable separate project's PASS shows deployed-policy equivalence only if schema parity was proven; a genuine test *on the canonical hosted project* needs existing pre-authorized ordinary tenant accounts or a separately approved change. Do not silently add users to production.

## Completion runbook: Stripe Test Mode E2E (TASK-76/79/80)

1. Approve commercial plan names, BRL or other currency, monthly/yearly interval, setup, entitlement limits, tax/cancellation and owner of billing. TASK-80 requires 3–5 **real** pilot/lead feedback sessions; no fabricated responses.
2. Confirm exact **Test Mode** Stripe account (currently `acct_1UJupYRtfyNk1GR1`), test backend project/tenant and explicitly authorize creating sandbox products/prices and test sessions. Do not switch to live mode.
3. Create Stripe **Test Mode** products/prices based **only** on approved commercial terms. Store canonical `plan_id -> price_id` server-side, never from browser-provided amounts. Keep secret/test API keys server-side.
4. Configure a Test Mode webhook endpoint **on an isolated authorized backend**, never point test events at production without explicit authorization. Use the `stripe-webhook` function with disabled JWT **only when verifying raw Stripe-Signature cryptographically** using a server-only `whsec_` secret.
5. Checkout→signed event→idempotent `billing_webhook_events` ledger→subscription/entitlements→UI activation. The success URL must not itself grant entitlements. Verify correct tenant binding.
6. Send duplicate, out-of-order and invalid-signature events; verify no double grants, no cross-tenant writes. Test payment failure, renewal, upgrade, downgrade, cancellation and delayed webhook recovery with provider test scenarios.
7. Capture redacted checkout/session/event/tenant IDs and evidence of the expected state, cancel sandbox objects as needed and recheck ledger; do not expose keys or PII.
8. Do not mark billing PASS until a real provider sandbox lifecycle completed on the **correct authorized isolated backend**, including negative tests.

## Completion runbook: Cloudflare durable QA (TASK-74/77)

1. Choose QA **Worker names and durable hostnames** belonging to a controlled Cloudflare account. Confirm no routes/custom hostnames or deployment commands target production. Use Cloudflare Workers / Static Assets only, not Vercel.
2. Authorize a QA deployment and verify that GitHub Actions has scoped Cloudflare credentials; do not paste tokens into chat. Deploy a durable **separately named staging Worker** per relevant vertical; record SHA, Worker version and URL.
3. First smoke a stable `workers.dev` host where permitted; custom QA hostname/TLS needs a separate explicit DNS/routing approval. Configure DNS/certificate on a controlled QA hostname only; verify `tenant_domains` maps the verified hostname to the correct tenant. Unknown, unverified and foreign hostnames must deny.
4. Execute the existing `Durable Cloudflare Smoke Matrix` workflow `.github/workflows/durable-cloudflare-smoke.yml`, supplying **all nine** validated HTTPS URLs, with browser/asset/SPA deep-link/console/network smoke. Preview Version URLs alone are insufficient.
5. Capture the last-known-good Worker version and perform an **authorized staging-only rollback drill** per `docs/CLOUDFLARE_ROLLBACK_RUNBOOK.md`; repeat HTTPS/tenant smoke and preserve version/sha/operator/timestamps.
6. Attach the nine results and rollback proof to Issue #20, TASK-74/77 and the SHA-specific release manifest. Production promotion remains separately authorized and must re-run current release gates.

## DECISÃO

**QA contract workstream GO. Commercial Ready NO-GO.** Open: same-tenant AI consumption provenance, trusted audit origin, remote low-privilege Auth, backed-up hosted restore proof, Stripe provider E2E, durable QA Cloudflare/TLS/rollback, pilot/compliance approvals. Any future product/database/CI SHA must be revalidated independently; never inherit same-SHA GREEN across SHAs.
