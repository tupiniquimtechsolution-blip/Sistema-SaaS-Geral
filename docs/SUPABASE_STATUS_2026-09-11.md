# Supabase Status — 2026-09-11

## Project

- Name: `Sistema-SaaS-Geral`
- Project ref: `mmykyzzkcugxunmekwew`
- Region: `sa-east-1`
- URL: `https://mmykyzzkcugxunmekwew.supabase.co`
- Purpose: dedicated backend for the Tupiniquim Vertical SaaS
- Unrelated project `GlicoControl-MVP`: NOT reused

No service-role key or privileged credential is committed to Git.

## Remote migrations applied

1. `20260911215335 platform_core_v1`
2. `20260911215427 business_modules_v1`
3. `20260911215526 vertical_modules_v1`
4. `20260911215546 storage_security_v1`
5. `20260911215727 security_helpers_hardening_v1`
6. `20260911215831 performance_hardening_v1`
7. `20260911220412 entitlement_security_gate_v1`

The repository migration set must be reconciled with this provisioned schema before the infra PR is merged. Until that reconciliation is complete, the remote project is a provisioned foundation, not the canonical production migration history.

## Structural validation

Validated remotely:

- 83 tables in `public` at the validation checkpoint;
- 73 tenant-owned tables identified by a `tenant_id` column;
- 73/73 tenant-owned tables had RLS enabled;
- 0 tenant-owned tables without RLS;
- 8 global roles;
- 42 permissions at the first checkpoint, with sensitive-entitlement hardening added afterwards;
- 4 plans;
- 2 tenant-aware Storage buckets;
- `fornalha-demo` exists explicitly as a demo tenant.

## Tenant isolation baseline

The backend uses:

- explicit tenant ownership;
- Supabase Auth identities;
- memberships;
- roles and permissions;
- Row Level Security;
- private security-definer helper schema;
- server-side permission helpers;
- tenant-aware Storage policies.

Important: a real authenticated A→B / B→A cross-tenant negative test has NOT yet been executed because controlled test identities have not been provisioned. This remains a release blocker and must not be reported as PASS.

## Security hardening

Internal membership/permission helpers were moved behind a non-exposed `private` schema and wrapped by public security-invoker functions.

Two public authenticated RPCs intentionally remain `SECURITY DEFINER`:

- `create_tenant_with_owner(...)`
- `write_audit_log(...)`

The Supabase security advisor flags these as authenticated-executable security-definer functions. They are intentional privilege-boundary RPCs, authenticated-only, with explicit `search_path`. They remain under review and can later be moved behind Edge Functions if that becomes the preferred boundary.

Security Advisor reference:

`https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable`

## Performance hardening

Applied:

- RLS `auth.uid()` init-plan optimization;
- separation of permissive `FOR ALL` policies into operation-specific INSERT/UPDATE/DELETE policies;
- indexes for previously uncovered single-column foreign keys.

After hardening, the remaining performance-advisor notices were `unused_index` informational notices. The database is newly provisioned and has no representative workload, so indexes must not be removed based only on those notices.

Performance Advisor reference:

`https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index`

## Storage

Buckets:

- `tenant-public` — public assets only;
- `tenant-private` — private tenant/member assets.

Path convention:

`<tenant-uuid>/<path>`

Policies validate the tenant UUID from the first path segment. Write operations require `media.write`. Private reads require tenant membership.

## Sensitive religious data

Dormant sensitive-member structures created during the remote bootstrap are protected by BOTH:

- `religious.sensitive.*` permission; and
- `religious.sensitive.enabled` effective entitlement.

The entitlement defaults to `false` for every seeded plan. Therefore owner/admin status by itself is not sufficient to activate the sensitive module.

The canonical application should continue to avoid storing spiritual-consultation narratives by default.

## Seed/reference data

Provisioned reference data includes:

- vertical registry: bakery, pet, restaurant, led, heavy-machinery, religious-house;
- plans: demo, starter, pro, business;
- role matrix;
- permissions;
- features/entitlements;
- explicit demo tenant `fornalha-demo`.

No real customer records, production credentials, reviews, payment card data or private religious records were fabricated.

## TypeScript types

Types were successfully generated from the remote schema using Supabase type generation. They should be regenerated and committed after migration-history reconciliation so the checked-in type file matches the final canonical schema exactly.

## Current gates

| Gate | State |
| --- | --- |
| Dedicated Supabase project | PASS |
| Region configured | PASS |
| Core schema provisioned | PASS |
| Vertical schema provisioned | PASS |
| RLS on tenant-owned tables | PASS structurally |
| Storage policies | PASS structurally |
| Security advisors | PASS with 2 documented intentional RPC warnings |
| Performance hardening | PASS; only unused-index informational notices remain |
| Type generation | PASS |
| Cross-tenant authenticated A→B test | NOT RUN / RELEASE BLOCKER |
| Repository migration history reconciled with remote | OPEN |
| Production app integration | NOT RUN |
| Production deployment | NOT RUN |

## Next exact action

Reconcile the repository migration files with the provisioned remote migration history, then let the Big Master Wave connect the imported apps to this Supabase project and execute authenticated cross-tenant tests before any production deployment.
