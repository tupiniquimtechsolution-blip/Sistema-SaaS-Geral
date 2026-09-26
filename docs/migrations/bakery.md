# Migration — Bakery

- Source repository: `tupiniquimtechsolution-blip/PadocaAppPremium`
- Source branch: `main`
- Source HEAD prepared for import: `65a074cfa8c48870aa0b08239ae2af9df0618eda`
- Destination: `apps/bakery`
- Import status: `IMPORTED_AND_CANONICAL_BACKEND_CONNECTED`
- Layout preservation: REQUIRED — preserved in `apps/bakery`
- Source repository deletion: PROHIBITED during Wave 01

## Canonical SaaS integration

The imported Bakery app now preserves its original premium storefront while using the canonical SaaS backend for confirmed checkout data.

- demo tenant: `fornalha-demo`;
- 7 canonical product categories and 16 active demo products seeded in tenant-owned commerce tables;
- cart remains ephemeral/local until confirmation;
- confirmed checkout uses `public.create_storefront_order(...)`;
- client submits product slug, quantity, selected option ids and extras only — unit prices are recalculated in PostgreSQL from the active tenant catalog;
- delivery fee and coupons are enforced server-side;
- `BEMVINDO10` and `FORNOFRETE` are canonical coupon records for the demo tenant;
- `orders` and `order_items` are written atomically;
- idempotency is enforced by `(tenant_id, idempotency_key)`;
- direct anonymous INSERT/UPDATE/DELETE on commerce tables is revoked; the storefront writes only through the constrained RPC;
- the browser uses only the publishable Supabase key through `tupiniquim-database`; no `service_role` key is bundled.

The local order copy remains only a presentation/history cache after the backend confirms the canonical order number and totals. The cart is not cleared when the backend request fails.

## Applied forward migrations

- `20260924125451_bakery_storefront_checkout_v1`
- `20260924125633_bakery_storefront_checkout_identity_fix`
- `20260924131525_bakery_coupon_enforcement_v1`

These migrations were applied through the Supabase migration API and reconciled into `supabase/migrations/` on the Wave 01 finalization branch.

## Validation evidence

Remote validation on 2026-09-24 confirmed:

- `fornalha-demo` contains 7 categories and 16 active products;
- anonymous table grants for the commerce tables are read-only after hardening;
- checkout with a 1 kg sourdough option and bacon extra was recalculated by the database to R$ 74.00;
- repeating the same idempotency key returned the existing order instead of duplicating it;
- `BEMVINDO10` reduced a R$ 28.00 subtotal by R$ 2.80;
- `FORNOFRETE` reduced an R$ 8.90 delivery fee by R$ 8.90;
- all synthetic QA orders created for migration verification were deleted after the tests.

## Known SaaS documents

- `docs/PLANEJAMENTO_MESTRE_TUPINIQUIM_VERTICAL_SAAS.md`
- `docs/TOOLBOX_AUDIT_2026-09-10.md`
- `docs/REMOTE_MIGRATION_LEDGER.md`
- `SECURITY.md`

## PDF inventory

No PDF presentation was found in the verified source `main` tree during preparation. No PDF was fabricated during import.

## Remaining release gates

- monorepo typecheck/tests/build/security gates must be green on the final canonical SHA;
- browser-level Bakery checkout E2E should be part of the later global E2E/release hardening wave;
- payment gateway/Pix production settlement is intentionally not implemented in Wave 01 and remains provider work for the billing/payment release phase.
