# BAKERY LIVE WRITES

Status: **IN PROGRESS — FAIL-CLOSED IMPLEMENTED, REMOTE WRITE PENDING**

Scope: Wave #1, Bakery vertical, PR #12. This document records the evidence-backed boundary between demo persistence and the canonical live SaaS backend.

## Current branch

- branch: `chatgpt/bakery-saas-core-e2e`
- base: `freebuff/big-master-wave-01-monorepo`
- do not merge `main` in this stage

## Remote evidence

The canonical Supabase project was inspected directly. Remote state prevails over obsolete/local historical SQL.

### Commerce

`public.orders` and `public.order_items` exist with RLS enabled.

At the time of this checkpoint:

- `orders` SELECT is gated by `has_tenant_permission(tenant_id, 'orders.read')`;
- `orders` UPDATE is gated by `has_tenant_permission(tenant_id, 'orders.status.write')`;
- there is **no INSERT policy for `orders`**;
- `order_items` exposes SELECT through `orders.read` and has **no INSERT/WRITE policy**;
- there is no public RPC dedicated to order creation;
- there are no deployed Supabase Edge Functions for order creation.

Conclusion: the browser must **not** be granted direct INSERT merely to make checkout work. A server-side order boundary is required.

### Catalog

The live `products` table exists and is RLS-enabled, but the inspected project currently has no product rows. The Bakery UI still uses its legacy/local catalog model. A live order API therefore cannot truthfully validate canonical product UUIDs/prices until catalog synchronization/provisioning is defined.

### Administrative writes

Remote policies already expose authenticated/RLS-controlled administrative write paths for relevant resources:

- `tenant_brands` / `tenant_themes`: `brand.write`;
- `tenant_settings`: `tenant.settings.write`;
- `products` / `coupons`: `catalog.write`.

These paths must use the authenticated publishable-key client. `service_role` is forbidden in the browser.

## Fail-closed checkpoint implemented

The Bakery frontend now has an explicit `demo | live` persistence mode derived from the existing `VITE_DEMO_MODE` contract.

### Allowed local state in live

- cart;
- coupon.

These remain browser-local because they are ephemeral UX state, not canonical business records.

### Forbidden canonical-local state in live

- orders;
- admin overrides;
- operational custom-order leads.

In live mode:

- stored demo orders/admin overrides are not loaded as canonical state;
- orders/admin overrides are not saved to localStorage;
- the admin demo editor is visibly locked instead of pretending to persist;
- custom-order leads are not stored locally as if received by the business;
- checkout cannot display a successful order confirmation until a real authorized write path exists.

Demo behavior remains available only when demo mode is explicitly active.

## Required server-side order contract

Before enabling live checkout, the order creation boundary must:

1. identify/resolve the tenant without trusting an arbitrary browser tenant claim;
2. enforce acceptable tenant/subscription state and required entitlements;
3. load canonical active catalog data server-side;
4. validate item/product/variant ownership by tenant;
5. recalculate subtotal, discounts, delivery fee and total server-side;
6. reject browser-forged prices/totals;
7. enforce an idempotency key;
8. insert order + items consistently/atomically;
9. return an opaque public-safe order result;
10. produce audit/observability evidence without leaking PII or secrets;
11. include negative tests for cross-tenant access, invalid tenant, invalid product and price forgery.

The public storefront authentication / anti-abuse model must be chosen explicitly before exposing anonymous order creation. Do not silently disable JWT verification or make database INSERT policies public.

## Next implementation gates

1. Keep current fail-closed changes green in CI.
2. Define canonical live catalog mapping/provisioning for Bakery.
3. Implement the authenticated QA version of the server-side order write contract without weakening RLS.
4. Prove authorized write and denied cross-tenant write against QA tenants.
5. Wire checkout to the server contract only after those tests pass.
6. Implement authenticated admin writes using existing RLS permissions.
7. Run Vercel smoke and update Issue #8 / #13 with evidence.

Refs: Issue #8, Issue #13, PR #12, `docs/LIVE_SUPABASE_INTEGRATION.md`, `docs/REMOTE_MIGRATION_LEDGER.md`.
