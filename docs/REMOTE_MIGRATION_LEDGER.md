# REMOTE MIGRATION LEDGER

Canonical remote database: **Supabase project `mmykyzzkcugxunmekwew`** (validated directly by the owner/ChatGPT on 2026-09-15; migration list revalidated 2026-09-22).

Rule enforced by this ledger: **remote state prevails over historical/local migrations**. Remote migration SQL is NOT reconstructed by guessing; entries below record evidence only.

> **LIVE CATALOG NOTE (2026-09-15):** the live database holds **42 permissions**
> and **14 features** — the historical branch migration files (e.g. the
> platform_core seed visible at a3b2b1f) seed fewer permissions (28) and a
> proposed 17-feature catalog. Later remote migrations evolved the catalog.
> See docs/PERMISSION_ALIGNMENT.md §0.

## Remote migrations (12 observed applied — confirmed via remote migration list)

| VERSION | NAME | REMOTE STATUS | LOCAL SOURCE FILE | RECONCILIATION STATUS |
|---|---|---|---|---|
| 20260911215335 | platform_core_v1 | REMOTE_APPLIED | `supabase/migrations/20260911000100_platform_core.sql` (branch `chatgpt/supabase-vercel-foundation` @ a3b2b1f) | SOURCE_FILE_PARTIAL — later hardening migrations changed policies/RPCs; file predates them |
| 20260911215427 | business_modules_v1 | REMOTE_APPLIED | `supabase/migrations/20260911000200_commerce.sql` | SOURCE_FILE_PARTIAL — same caveat |
| 20260911215526 | vertical_modules_v1 | REMOTE_APPLIED | `supabase/migrations/20260911000300_booking_events.sql` + 20260911000500/00600/00700 verticals | SOURCE_FILE_PARTIAL — content correlates, no SHA provenance |
| 20260911215546 | storage_security_v1 | REMOTE_APPLIED | `supabase/migrations/20260911000800_storage_policies.sql` | SOURCE_FILE_PARTIAL — canonical buckets confirmed: `tenant-public` / `tenant-private` |
| 20260911215727 | security_helpers_hardening_v1 | REMOTE_APPLIED | none | REMOTE_ONLY / NEEDS_EXPORT |
| 20260911215831 | performance_hardening_v1 | REMOTE_APPLIED | none | REMOTE_ONLY / NEEDS_EXPORT |
| 20260911220412 | entitlement_security_gate_v1 | REMOTE_APPLIED | none | REMOTE_ONLY / NEEDS_EXPORT — canonical entitlement authority |
| 20260911220750 | religious_public_details_v1 | REMOTE_APPLIED | none | REMOTE_ONLY / NEEDS_EXPORT — religious sensitive structures gated DORMANT |
| 20260917173751 | noop_test | REMOTE_APPLIED | none | REMOTE_ONLY / EVIDENCE ONLY |
| 20260918132842 | fix_tenant_public_read_policy | REMOTE_APPLIED | `supabase/migrations/20260918132842_fix_tenant_public_read_policy.sql` | LOCAL_SOURCE_PRESENT — remote version/name confirmed; exact historical SQL not reclassified by filename alone |
| 20260922212427 | add_storefront_bootstrap_rpc | REMOTE_APPLIED | none | REMOTE_ONLY / NEEDS_EXPORT |
| 20260922235641 | builder_revision_workflow_v1 | REMOTE_APPLIED | `supabase/migrations/20260922235641_builder_revision_workflow_v1.sql` | SOURCE_FILE_MATCHED / APPLIED_FROM_THIS_FILE — exact staged SQL applied through Supabase migration API on 2026-09-22 |

## Local-only migration files

| FILE | STATUS |
|---|---|
| `supabase/migrations/0001_multi_tenant_schema.sql` (Freebuff branch) | OBSOLETE_SUPERSEDED_NOT_REMOTE — never applied remotely; header warning added 2026-09-15; DO NOT PUSH TO PRODUCTION |

## Policy

1. Do not fabricate SQL for `REMOTE_ONLY / NEEDS_EXPORT` entries. Export read-only (`supabase db dump`) when credential access is granted, then commit under `supabase/remote-snapshot/`.
2. New local migrations must be written **forward** from the remote state, never re-stating 0001.
3. Remote state prevails wherever drift is proven (§20 of the reconciliation doc).
4. A migration classified `SOURCE_FILE_MATCHED / APPLIED_FROM_THIS_FILE` requires direct evidence that the exact local/staged SQL was the payload applied to the remote migration API.

## Snapshot evidence log (2026-09-16 — Wave de Integração Real 01)

- Supabase CLI was not available in that sandbox; a full read-only snapshot could not be produced in that wave. Status: **BLOCKED_REMOTE_SNAPSHOT_CLI_ACCESS**.
- No REMOTE_ONLY migration was reclassified. A future dump can prove final schema state, not historical SQL by itself.
- No database command was executed against the remote project during that 2026-09-16 wave.

## Builder revision workflow evidence (2026-09-22)

- `builder_revision_workflow_v1` was first staged on `automation/builder-versioning-stage` and passed hygiene, locked install, lint, typecheck, unit/integration tests, build and production dependency audit before remote DDL.
- The hardened staged SQL was applied through the Supabase migration API and registered as version `20260922235641`.
- Post-apply read-only verification confirmed `page_revisions` with RLS enabled and FORCE RLS enabled; authenticated grants limited to SELECT/INSERT/UPDATE; no anon table grant; tenant membership SELECT policy; `cms.write` INSERT/UPDATE policies; single-open and single-published partial unique indexes; both Builder trigger functions with `prosecdef=false` (`SECURITY INVOKER`).
- `page_revisions` contained zero rows after schema verification; no commercial page/revision content was created as part of migration validation.
- Security Advisor after apply reported only the previously observed warnings for existing SECURITY DEFINER functions and leaked-password protection; the Builder functions did not appear as new findings.
