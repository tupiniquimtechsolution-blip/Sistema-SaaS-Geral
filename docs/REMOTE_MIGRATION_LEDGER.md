# REMOTE MIGRATION LEDGER

Canonical remote database: **Supabase project `mmykyzzkcugxunmekwew`**.

Rule enforced by this ledger: **remote state prevails over historical/local migrations**. Remote migration SQL is NOT reconstructed by guessing; entries below record evidence only.

> **LIVE CATALOG NOTE:** the live database holds a permission/feature catalog that evolved beyond the historical branch migration files. This remains evidence that the 20260911xxxx branch files are SOURCE_FILE_PARTIAL and that REMOTE_ONLY migrations must never be reconstructed by assumption.

## Remote migrations (11 applied — confirmed directly on 2026-09-22)

| VERSION | NAME | REMOTE STATUS | LOCAL SOURCE FILE | RECONCILIATION STATUS |
|---|---|---|---|---|
| 20260911215335 | platform_core_v1 | REMOTE_APPLIED | `supabase/migrations/20260911000100_platform_core.sql` (historical branch) | SOURCE_FILE_PARTIAL — later hardening migrations changed policies/RPCs |
| 20260911215427 | business_modules_v1 | REMOTE_APPLIED | `supabase/migrations/20260911000200_commerce.sql` | SOURCE_FILE_PARTIAL — same caveat |
| 20260911215526 | vertical_modules_v1 | REMOTE_APPLIED | historical vertical migration set | SOURCE_FILE_PARTIAL — content correlates, no complete historical provenance |
| 20260911215546 | storage_security_v1 | REMOTE_APPLIED | historical storage migration | SOURCE_FILE_PARTIAL — canonical buckets confirmed: `tenant-public` / `tenant-private` |
| 20260911215727 | security_helpers_hardening_v1 | REMOTE_APPLIED | none | REMOTE_ONLY / NEEDS_EXPORT |
| 20260911215831 | performance_hardening_v1 | REMOTE_APPLIED | none | REMOTE_ONLY / NEEDS_EXPORT |
| 20260911220412 | entitlement_security_gate_v1 | REMOTE_APPLIED | none | REMOTE_ONLY / NEEDS_EXPORT — canonical entitlement authority |
| 20260911220750 | religious_public_details_v1 | REMOTE_APPLIED | none | REMOTE_ONLY / NEEDS_EXPORT — religious sensitive structures gated DORMANT |
| 20260917173751 | noop_test | REMOTE_APPLIED | none | REMOTE_ONLY / NOOP_LEDGER_ENTRY — do not reconstruct |
| 20260918132842 | fix_tenant_public_read_policy | REMOTE_APPLIED | `supabase/migrations/20260918132842_fix_tenant_public_read_policy.sql` | LOCAL_ALIGNED_WITH_REMOTE_LEDGER — policy repair already applied; do not re-apply |
| 20260922212427 | add_storefront_bootstrap_rpc | REMOTE_APPLIED | `supabase/migrations/20260922212427_add_storefront_bootstrap_rpc.sql` | LOCAL_ALIGNED_WITH_REMOTE_LEDGER — applied and post-validated 2026-09-22 |

## Local-only migration files

| FILE | STATUS |
|---|---|
| `supabase/migrations/0001_multi_tenant_schema.sql` | OBSOLETE_SUPERSEDED_NOT_REMOTE — never apply to the canonical project |

## Policy

1. Do not fabricate SQL for `REMOTE_ONLY / NEEDS_EXPORT` entries. A future read-only schema dump may prove final state, but must not be mislabeled as the original historical migration SQL.
2. New local migrations must be written **forward** from the observed remote state, never by replaying `0001_multi_tenant_schema.sql`.
3. When a new migration is applied through the canonical Supabase migration mechanism, immediately align the local filename to the exact remote migration version and record validation here.
4. Remote state prevails wherever drift is proven.

## Snapshot evidence log

### 2026-09-16 — Wave de Integração Real 01

- Supabase CLI was not available in that sandbox, so a full read-only `db dump` was not produced.
- No REMOTE_ONLY migration was reclassified.
- At that historical checkpoint, no database mutation was executed.

### 2026-09-22 — Bakery Wave #1

Read-only introspection confirmed the current remote commerce/RLS shape before any new DDL. The Bakery work then added one narrow forward migration after the branch quality gate passed:

`20260922212427_add_storefront_bootstrap_rpc`

Purpose: provide an anonymous/public storefront with a **curated, read-only bootstrap by tenant slug** without granting public table access to `tenants` or `tenant_settings`.

Post-apply validation:

- `public.get_storefront_bootstrap(text)` exists as `SECURITY DEFINER` with fixed `search_path = public, pg_temp`;
- only `anon` and `authenticated` receive EXECUTE after PUBLIC EXECUTE is revoked;
- anon successfully resolves `qa-tenant-a` as a `trialing` Bakery tenant;
- returned payload contains brand/theme/settings JSON projections and exposes `public_settings`, never `private_settings`;
- an invalid tenant slug returns zero rows;
- direct anon SELECT on `tenant_settings` still returns zero rows under RLS;
- no existing table RLS policy was relaxed by this migration.

Additional transactional RLS probe for catalog writes (rolled back intentionally):

- QA-A identity → QA-A `product_categories` write: allowed;
- QA-A identity → QA-B `product_categories` write: denied by RLS;
- post-rollback persisted probe rows: `0`.

This probe validates the authorization boundary without provisioning catalog data or leaving test rows behind.
