# BAKERY REMOTE COMMERCE EVIDENCE — 2026-09-22

Status: **READ-ONLY REMOTE INTROSPECTION**  
Project: `mmykyzzkcugxunmekwew` (`Sistema-SaaS-Geral`, `sa-east-1`)  
Purpose: establish the real remote contract before implementing Bakery live writes.

> No database mutation was executed while producing this evidence. No secret, password, service-role key, or customer PII is stored here.

## 1. Why this checkpoint exists

The historical branch SQL for commerce is not the database source of truth. `docs/REMOTE_MIGRATION_LEDGER.md` already states that the remote state prevails. Direct introspection on 2026-09-22 confirmed material drift in the commerce schema and RLS policies, so Bakery live-write work MUST target the remote contract below rather than copying historical migration shapes.

## 2. Remote migration state observed

The remote migration ledger currently contains 10 applied entries:

1. `20260911215335 platform_core_v1`
2. `20260911215427 business_modules_v1`
3. `20260911215526 vertical_modules_v1`
4. `20260911215546 storage_security_v1`
5. `20260911215727 security_helpers_hardening_v1`
6. `20260911215831 performance_hardening_v1`
7. `20260911220412 entitlement_security_gate_v1`
8. `20260911220750 religious_public_details_v1`
9. `20260917173751 noop_test`
10. `20260918132842 fix_tenant_public_read_policy`

This supersedes any document that still says the remote has only eight applied migrations.

## 3. Live commerce contract relevant to Bakery

### `public.orders`

Observed columns include:

- `id uuid`
- `tenant_id uuid`
- `contact_id uuid?`
- `order_number bigint` (required; no default observed)
- `status text` default `pending`
- `fulfillment_type text` default `pickup`
- `currency text` default `BRL`
- `subtotal numeric`
- `discount_total numeric`
- `delivery_fee numeric`
- `total numeric`
- `coupon_id uuid?`
- `customer_snapshot jsonb`
- `fulfillment_snapshot jsonb`
- `notes text?`
- `source text` default `web`
- `idempotency_key text?`
- `created_by uuid?`
- timestamps

Relevant constraints observed:

- status is restricted to `pending|confirmed|preparing|ready|out_for_delivery|completed|canceled`;
- fulfillment is restricted to `pickup|delivery|shipping|digital|service`;
- monetary totals must be non-negative;
- `(tenant_id, idempotency_key)` has a unique partial index when the key is present.

### `public.order_items`

Observed columns include:

- `tenant_id`, `order_id`, optional `product_id` / `variant_id`;
- `name_snapshot`, optional `sku_snapshot`;
- `quantity numeric`;
- `unit_price numeric`;
- `options_snapshot jsonb`;
- `line_total numeric`;
- timestamp.

This is materially different from the historical `*_cents`, `product_name`, `modifiers` shape visible in the older branch migration.

### Catalog

The live `products` contract uses `base_price numeric`, `status`, `availability jsonb`, `metadata jsonb`, and unique `(tenant_id, slug)`. `product_variants` uses `price_delta numeric`, optional `absolute_price`, `attributes`, and `is_active`.

## 4. RLS / authorization observed

RLS is enabled on the inspected commerce and tenant configuration tables.

For orders, the remote policies observed are intentionally restrictive:

- `orders_read`: authenticated + `orders.read`;
- `orders_status_update`: authenticated + `orders.status.write`;
- `order_items_read`: authenticated + `orders.read`;
- `order_history_read`: authenticated + `orders.read`.

**No INSERT policy was observed for `orders`. No write policy was observed for `order_items`.**

The permissions catalog still contains `orders.create`, currently assigned to global roles `owner` and `admin`, but direct table RLS does not expose an insert path. Therefore `orders.create` must not be interpreted as proof that the storefront can create an order today.

No public function whose name matches `order`, `storefront`, or `commerce` was found in `public` during this introspection. There is therefore no evidence of an existing atomic storefront-order RPC.

Relevant admin permissions observed:

- brand writes: owner/admin/manager/editor;
- catalog writes: owner/admin/manager/editor/catalog_manager;
- tenant settings writes: owner/admin;
- order status writes: owner/admin/manager/orders_manager.

RLS remains the authority for these authenticated admin paths.

## 5. Bakery data state observed

The remote Bakery tenants inspected were:

- `fornalha-demo` (`demo`)
- `qa-tenant-a` (`trialing`)
- `qa-tenant-b` (`trialing`)

At this checkpoint each had **0 products** and **0 orders**.

Therefore the visual Bakery catalog in `apps/bakery/src/business/products.ts` is still local-only. A secure live checkout cannot treat browser-submitted local prices as authoritative. The catalog must be provisioned/read from the remote commerce model before order totals can be validated server-side.

## 6. Storefront runtime gap

`apps/bakery/src/business/saas-adapter.ts` and the QA harness prove an authenticated live-read contract, but the actual Bakery runtime still wraps the UI in `AppProvider`, whose current source is `businessConfig` + local catalog. `store.tsx` persists orders/admin overrides in tenant-scoped `localStorage`.

Classification:

- live adapter/harness: **PROVED**;
- storefront runtime live config: **NOT YET INTEGRATED**;
- remote catalog: **NOT YET PROVISIONED**;
- live storefront order creation: **NO CANONICAL WRITE PATH OBSERVED**;
- localStorage order/admin state: **DEMO-ONLY CANDIDATE, NOT PRODUCTION AUTHORITY**.

## 7. Safe implementation order

1. Build the remote Bakery catalog adapter and a controlled provisioning/sync path using authenticated RLS (`catalog.write`) in QA/demo.
2. Make remote product/variant prices the source of truth for live mode.
3. Design an atomic storefront order API/RPC from the **observed live schema**, with server-side validation of tenant, items, price, fulfillment, totals and idempotency. Do not add an unrestricted anonymous INSERT policy to `orders`.
4. Apply any required DDL only as a new forward migration after review; never replay `0001_multi_tenant_schema.sql` or reconstruct `REMOTE_ONLY` migrations.
5. Split Bakery persistence explicitly: `demo` may use localStorage; `live` must use the remote service and must fail closed when unavailable.
6. Prove negative cross-tenant writes/reads in QA A/B, clean up QA fixtures, then run monorepo gates and deployed smoke.

## 8. Release gate

Do not claim Bakery live checkout complete until all of the following are evidenced together:

- remote catalog populated/read through canonical contracts;
- server-authoritative pricing;
- atomic/idempotent order creation;
- RLS/RBAC negative tests;
- no service-role key in browser/bundle/Git;
- live mode does not persist orders/admin as canonical localStorage state;
- CI + deployed smoke are green.
