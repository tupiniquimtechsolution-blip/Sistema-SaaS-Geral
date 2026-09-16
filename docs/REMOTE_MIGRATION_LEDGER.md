# REMOTE MIGRATION LEDGER

Canonical remote database: **Supabase project `mmykyzzkcugxunmekwew`** (validated directly by the owner/ChatGPT on 2026-09-15).

Rule enforced by this ledger: **remote state prevails over historical/local migrations**. Remote migration SQL is NOT reconstructed by guessing; entries below record evidence only.

> **LIVE CATALOG NOTE (2026-09-15):** the live database holds **42 permissions**
> and **14 features** — the historical branch migration files (e.g. the
> platform_core seed visible at a3b2b1f) seed fewer permissions (28) and a
> proposed 17-feature catalog. Later remote migrations (entitlement_security_gate_v1,
> security_helpers_hardening_v1, etc.) evolved the catalog. This is additional
> evidence that the 20260911xxxx branch files are SOURCE_FILE_PARTIAL and that
> the REMOTE_ONLY migrations must be exported before any canonical claim.
> See docs/PERMISSION_ALIGNMENT.md §0.

## Remote migrations (8, applied — confirmed via remote migration list)

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

## Local-only migration files

| FILE | STATUS |
|---|---|
| `supabase/migrations/0001_multi_tenant_schema.sql` (Freebuff branch) | OBSOLETE_SUPERSEDED_NOT_REMOTE — never applied remotely; header warning added 2026-09-15; DO NOT PUSH TO PRODUCTION |

## Policy

1. Do not fabricate SQL for `REMOTE_ONLY / NEEDS_EXPORT` entries. Export read-only (`supabase db dump`) when credential access is granted, then commit under `supabase/remote-snapshot/`.
2. New local migrations must be written **forward** from the remote state, never re-stating 0001.
3. Remote state prevails wherever drift is proven (§20 of the reconciliation doc).

## Snapshot evidence log (2026-09-16 — Wave de Integração Real 01)

- Supabase CLI is NOT available in this sandbox (no binary, no authenticated session); the
  read-only snapshot could not be produced this wave. Status: **BLOCKED_REMOTE_SNAPSHOT_CLI_ACCESS**.
  Per the wave rules, application integration continued and was NOT blocked by this.
- No REMOTE_ONLY migration was reclassified. When the dump is eventually produced, classify
  entries as **REMOTE_STATE_SNAPSHOTTED** — a `db dump` proves final schema state, NOT the
  historical SQL of a migration — and never as SOURCE_FILE_MATCHED by dump alone.
- No database command was executed against the remote project (DATABASE MUTATIONS = NONE).
