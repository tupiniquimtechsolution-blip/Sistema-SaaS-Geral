# BAKERY RC1 RELEASE PLAN

Target: **v1.0.0-rc.1**

Branch: `chatgpt/bakery-saas-core-e2e`
Base: `freebuff/big-master-wave-01-monorepo`

Status: **IN PROGRESS**

> RC1 means feature-complete for the agreed Bakery scope and deployable for release-candidate validation. It is not a claim of GA/production sign-off. `main` must not be merged until the RC gates below are evidenced.

## Product scope frozen for RC1

The existing Bakery visual direction and layout are preserved. RC1 is about completing the real SaaS/runtime path, security, checkout, admin persistence, quality and deployability — not redesigning the frontend.

Included:

- white-label Bakery storefront using the shared SaaS Core;
- live tenant resolution with explicit demo/live modes;
- live brand/theme/settings/entitlements;
- live catalog and server-authoritative prices/availability;
- cart and checkout UX;
- real canonical order persistence;
- authenticated admin writes for the supported Bakery controls;
- cross-tenant RLS/RBAC proof;
- CI, CodeQL, dependency audit, build and deployed smoke;
- release documentation and rollback notes.

Excluded unless already available and fully configured:

- new visual redesign;
- speculative business content;
- fake reviews, fake commercial claims or fake payment confirmations;
- unrestricted anonymous table writes;
- service-role credentials in browser/client;
- replay of historical REMOTE_ONLY migrations;
- merge to `main` before RC evidence is complete.

## RC1 gates

### Gate A — Repository / CI

- [x] Monorepo root scripts execute real workspace lint/typecheck/test/build.
- [x] Locked install and production dependency audit are fail-closed.
- [ ] Current RC HEAD has Monorepo Quality Gates GREEN.
- [ ] Current RC HEAD has CodeQL GREEN.
- [ ] No committed dotenv/private key/service-role secret.

### Gate B — Live runtime

- [ ] `VITE_DEMO_MODE=false` never silently falls back to local/demo data.
- [ ] Storefront runtime resolves the selected live tenant through Supabase/Auth/Tenancy.
- [ ] Brand/theme/settings/entitlements feed the existing UI without redesign.
- [ ] Tenant loading failures produce an explicit safe error state.

### Gate C — Live catalog

- [ ] Bakery categories/products/options are provisioned in a QA/demo Bakery tenant through normal authenticated RLS (`catalog.write`).
- [ ] Storefront reads the remote catalog in live mode.
- [ ] Price used by checkout comes from the remote commerce model, not from local browser data.
- [ ] Availability/status is enforced from the remote model.
- [ ] Local catalog remains demo-only compatibility data.

### Gate D — Canonical order creation

- [ ] Add one reviewed forward migration/API/RPC for atomic storefront order creation based on the observed remote schema.
- [ ] Server-side logic validates tenant, product/option IDs, availability, prices, quantities, fulfillment, discounts and final total.
- [ ] Idempotency is enforced with the existing `(tenant_id, idempotency_key)` uniqueness contract.
- [ ] Order + items are committed atomically or fully rolled back.
- [ ] No anonymous direct INSERT policy is opened on `orders`/`order_items`.
- [ ] Duplicate request proof does not create duplicate orders.

### Gate E — Persistence split

- [ ] Demo mode may persist cart/demo orders/admin overrides locally.
- [ ] Live mode does not treat localStorage orders/admin overrides as canonical state.
- [ ] Live order history reads from the remote commerce model.
- [ ] Admin writes use authenticated Supabase/RLS/RBAC contracts.

### Gate F — Admin

- [ ] Brand/theme/settings writes are tenant-scoped and permission-gated.
- [ ] Catalog create/update/availability paths are tenant-scoped and permission-gated.
- [ ] Order status updates are tenant-scoped and permission-gated.
- [ ] Unauthorized/cross-tenant writes fail closed.

### Gate G — Checkout truthfulness

- [ ] Checkout creates a real remote order before showing a confirmed order state in live mode.
- [ ] Payment methods shown in live mode reflect only configured/available channels.
- [ ] Illustrative/demo Pix or gateway content cannot be presented as a successful live payment.
- [ ] WhatsApp/external-delivery actions remain optional integrations, not persistence authority.

### Gate H — Security / tenancy proof

- [ ] Cross-tenant A→B and B→A reads/writes fail for catalog/admin/order data.
- [ ] Same-tenant authorized operations succeed.
- [ ] RLS remains enabled on critical tables.
- [ ] Publishable key only in browser; service role absent from browser bundle/Git.
- [ ] Dependency audit and secret scan pass.

### Gate I — UX / accessibility / performance

- [ ] Existing responsive visual design is preserved.
- [ ] Checkout, cart, product pages, navigation and admin have no blocking runtime errors.
- [ ] Keyboard/focus/labels are usable on critical flows.
- [ ] No known critical CLS/LCP regression from the current baseline.
- [ ] Images/media used by the RC have explicit safe fallbacks and no broken critical asset.

### Gate J — Deployed RC smoke

- [ ] RC preview/deployment is reachable over HTTPS.
- [ ] Home → catalog → product → cart → checkout completes against the intended RC mode.
- [ ] Live tenant/config/catalog requests succeed without critical console/network errors.
- [ ] Admin authentication + one permitted write are verified.
- [ ] Negative unauthorized/cross-tenant operation is verified on deployed/hosted QA where applicable.

### Gate K — Release evidence

- [ ] `docs/BAKERY_RC1_EVIDENCE.md` records commit SHA, deployment URL, remote project/ref, migrations applied, CI/CodeQL runs, smoke results and known issues.
- [ ] `CHANGELOG` / status documentation is updated.
- [ ] Rollback path is documented.
- [ ] PR is converted from draft only after all blocking RC gates pass.
- [ ] Only then create/tag `v1.0.0-rc.1` (or equivalent approved RC tag).

## Current blockers at the start of RC1

1. Storefront runtime is not yet fully wired to the proven live adapter/catalog path.
2. Bakery remote catalog must be provisioned and proven in QA/demo.
3. The remote database currently has no observed canonical storefront order-creation RPC and no direct INSERT policy suitable for live checkout.
4. Live order/admin persistence must replace localStorage authority while retaining explicit demo mode.
5. Final hosted smoke and RC evidence are still pending.

## Execution order

1. Finish and test live catalog integration.
2. Provision QA/demo Bakery catalog through authenticated RLS and verify server-authoritative prices.
3. Implement/review/apply the atomic storefront order migration/API.
4. Integrate live order history and admin writes; isolate localStorage to demo UX only.
5. Add negative cross-tenant/order-idempotency tests.
6. Run all repository/security gates.
7. Deploy RC preview and execute end-to-end smoke.
8. Produce `BAKERY_RC1_EVIDENCE.md`, update status/changelog, then mark the PR ready for review.

## Stop conditions

Stop RC promotion if any of the following is true:

- current HEAD CI or CodeQL is red/pending;
- a live flow still depends on demo/localStorage authority;
- checkout trusts browser-submitted price/total;
- any cross-tenant critical read/write succeeds unexpectedly;
- live checkout can confirm without remote order persistence;
- required deployment/environment configuration is missing;
- secrets or service-role material appears in client/Git.
