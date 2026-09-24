# REMOTE MIGRATION LEDGER

Canonical remote database: **Supabase project `mmykyzzkcugxunmekwew`** (validated directly by the owner/ChatGPT on 2026-09-15; migration list revalidated 2026-09-24).

Rule enforced by this ledger: **remote state prevails over historical/local migrations**. Remote migration SQL is NOT reconstructed by guessing; entries below record evidence only.

> **LIVE CATALOG NOTE (2026-09-15):** the live database holds **42 permissions** and **14 features**. Historical branch migrations seed older catalogs; later remote migrations evolved them. See `docs/PERMISSION_ALIGNMENT.md` §0.

## Remote migrations (17 observed applied — confirmed via remote migration list)

| VERSION | NAME | REMOTE STATUS | LOCAL SOURCE FILE | RECONCILIATION STATUS |
|---|---|---|---|---|
| 20260911215335 | platform_core_v1 | REMOTE_APPLIED | `supabase/migrations/20260911000100_platform_core.sql` | SOURCE_FILE_PARTIAL — later hardening changed policies/RPCs |
| 20260911215427 | business_modules_v1 | REMOTE_APPLIED | `supabase/migrations/20260911000200_commerce.sql` | SOURCE_FILE_PARTIAL |
| 20260911215526 | vertical_modules_v1 | REMOTE_APPLIED | `supabase/migrations/20260911000300_booking_events.sql` + vertical migrations | SOURCE_FILE_PARTIAL |
| 20260911215546 | storage_security_v1 | REMOTE_APPLIED | `supabase/migrations/20260911000800_storage_policies.sql` | SOURCE_FILE_PARTIAL |
| 20260911215727 | security_helpers_hardening_v1 | REMOTE_APPLIED | none | REMOTE_ONLY / NEEDS_EXPORT |
| 20260911215831 | performance_hardening_v1 | REMOTE_APPLIED | none | REMOTE_ONLY / NEEDS_EXPORT |
| 20260911220412 | entitlement_security_gate_v1 | REMOTE_APPLIED | none | REMOTE_ONLY / NEEDS_EXPORT — canonical entitlement authority |
| 20260911220750 | religious_public_details_v1 | REMOTE_APPLIED | none | REMOTE_ONLY / NEEDS_EXPORT — religious sensitive structures gated DORMANT |
| 20260917173751 | noop_test | REMOTE_APPLIED | none | REMOTE_ONLY / EVIDENCE ONLY |
| 20260918132842 | fix_tenant_public_read_policy | REMOTE_APPLIED | `supabase/migrations/20260918132842_fix_tenant_public_read_policy.sql` | LOCAL_SOURCE_PRESENT |
| 20260922212427 | add_storefront_bootstrap_rpc | REMOTE_APPLIED | none | REMOTE_ONLY / NEEDS_EXPORT |
| 20260922235641 | builder_revision_workflow_v1 | REMOTE_APPLIED | `supabase/migrations/20260922235641_builder_revision_workflow_v1.sql` | SOURCE_FILE_MATCHED / APPLIED_FROM_THIS_FILE |
| 20260924125451 | bakery_storefront_checkout_v1 | REMOTE_APPLIED | `supabase/migrations/20260924125451_bakery_storefront_checkout_v1.sql` | SOURCE_FILE_MATCHED / APPLIED_FROM_THIS_FILE |
| 20260924125633 | bakery_storefront_checkout_identity_fix | REMOTE_APPLIED | `supabase/migrations/20260924125633_bakery_storefront_checkout_identity_fix.sql` | SOURCE_FILE_MATCHED / APPLIED_FROM_THIS_FILE |
| 20260924131525 | bakery_coupon_enforcement_v1 | REMOTE_APPLIED | `supabase/migrations/20260924131525_bakery_coupon_enforcement_v1.sql` | SOURCE_FILE_MATCHED / APPLIED_FROM_THIS_FILE |
| 20260924161226 | bakery_coupon_enforcement_v1 | REMOTE_APPLIED | same payload as `20260924131525_bakery_coupon_enforcement_v1.sql` | DUPLICATE_IDEMPOTENT_REPLAY — reapplied during continuation on 2026-09-24; no logical schema/data divergence observed |
| 20260924162424 | onboarding_tenant_v1 | REMOTE_APPLIED | `supabase/migrations/20260924162424_onboarding_tenant_v1.sql` | SOURCE_FILE_MATCHED / APPLIED_FROM_THIS_FILE — authenticated no-fork provisioning contract |

## Local-only migration files

| FILE | STATUS |
|---|---|
| `supabase/migrations/0001_multi_tenant_schema.sql` | OBSOLETE_SUPERSEDED_NOT_REMOTE — never apply to production |

## Policy

1. Do not fabricate SQL for `REMOTE_ONLY / NEEDS_EXPORT` entries. Export read-only when credential/CLI access is available.
2. New local migrations must be written **forward** from remote state, never re-stating `0001`.
3. Remote state prevails wherever drift is proven.
4. `SOURCE_FILE_MATCHED / APPLIED_FROM_THIS_FILE` requires evidence that the local/staged SQL was the payload applied to the migration API.
5. Duplicate migration history is recorded explicitly; do not rewrite remote history to make it appear absent.

## Builder revision workflow evidence (2026-09-22)

- `builder_revision_workflow_v1` passed hygiene, locked install, lint, typecheck, unit/integration, build and production dependency audit before remote DDL.
- Post-apply verification confirmed `page_revisions` RLS + FORCE RLS, tenant-aware policies, `cms.write`, partial unique indexes and SECURITY INVOKER triggers.
- No commercial page/revision rows were created during schema validation.

## Bakery storefront checkout evidence (2026-09-24)

- `fornalha-demo` resolved by slug; no generated tenant UUID hardcoded.
- 7 product categories and 16 active products confirmed.
- Direct anonymous commerce writes revoked; storefront RPC recalculates base prices, options, extras, delivery fee and coupon server-side and writes `orders + order_items` atomically.
- Idempotency replay, R$74 price composition, `BEMVINDO10`, `FORNOFRETE` and invalid-coupon rejection were validated; synthetic QA orders were deleted.
- Version `20260924161226` is an idempotent replay of the coupon migration and is retained in this ledger as historical truth.

## Tenant onboarding evidence (2026-09-24)

- `create_tenant_with_owner` was preserved as the canonical provisioning entry point rather than creating a parallel onboarding authority.
- Version `20260924162424` requires `auth.uid()`, enabled vertical, active plan, bounded name and canonical slug; `EXECUTE` is limited to `authenticated` and `service_role`.
- The transaction creates tenant, brand, theme, settings, active owner membership/role, manual trial subscription and audit record.
- `vertical_registry.default_theme` initializes `tenant_themes.component_style`; `default_modules` is stored in `tenant_settings.public_settings.vertical_modules`. Plan entitlements remain a separate authority.
- A remote authenticated transactional test created a Bakery/Starter tenant, proved owner role, theme preset, module defaults, subscription and audit, then rolled back. Final check returned `qa_tenants_remaining = 0`.
- Supabase Security Advisor reports the onboarding RPC under the generic `authenticated_security_definer_function_executable` WARN. This is an intentional elevation for first-tenant provisioning, with mandatory `auth.uid()`, fixed search path and canonical vertical/plan validation. The warning remains documented; no claim of zero advisor warnings is made.
