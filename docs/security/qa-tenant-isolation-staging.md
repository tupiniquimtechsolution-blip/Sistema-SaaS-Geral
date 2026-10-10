# Isolated QA Tenant A/B — execution runbook

**Status: prepared; not yet executed against a Supabase development branch.** Canonical release subject: `e49598f73f9d4f5df43ce272d002d4bbf2c1154b`. This is not a Commercial Ready approval or a production deployment.

## Safety boundaries

- Canonical SaaS Supabase project `mmykyzzkcugxunmekwew` remains **unchanged**. No QA users, test rows, migrations or policy changes in production.
- Never use unrelated Pausa AI, AI Dev Studio, or another customer project.
- `supabase/migrations/0001_multi_tenant_schema.sql` is obsolete and MUST NOT be applied or reconstructed. Remote canonical migration state prevails.
- Supabase branch hourly cost quoted on 2026-10-10: **US$ 0.01344/hour**. Creating it requires the owner's explicit confirmation of the amount and SaaS organization. Plan teardown to avoid ongoing charges.
- Supabase development branches are independent projects with separate project refs and no production data copy. Verify which remote migrations/functions are present; do not assume zero schema drift.

## Two independent QA identities

1. After branch cost approval, create **one isolated Supabase development branch** from the canonical SaaS project, with no production-data copy. Inspect its applied migrations, schema, RLS policies, and functions.
2. In the **development branch Auth Admin UI**, create exactly two controlled, fictitious test identities, each with a unique strong password and confirmed email state. Never insert users directly into `auth.users` or use customer identities.
3. Sign in as each QA identity and invoke the canonical `create_tenant_with_owner` RPC if valid plan and vertical seed catalogs exist in this branch. Create `qa-isolation-a` and `qa-isolation-b`, respectively, using a valid non-billable QA plan. **Do not grant Platform Master**, and do not create other memberships. Fail if any existing slug/account conflicts.
4. Configure the GitHub Actions environment `qa-isolation` with required reviewer approval and environment **variable** `QA_APPROVED_PROJECT_REF` equal to the new development branch project ref. Add environment **secrets** `QA_SUPABASE_URL`, `QA_SUPABASE_PUBLISHABLE_KEY`, `QA_TEST_A_EMAIL`, `QA_TEST_A_PASSWORD`, `QA_TEST_B_EMAIL`, `QA_TEST_B_PASSWORD`. No service-role token belongs in code, CI output or browser variables.
5. Once the workflow is available on an authorized GitHub Actions ref, run `QA Tenant Isolation Staging` with `qa_project_ref=<exact development branch ref>`, `matrix_mode=readonly`. Only after that PASS run `matrix_mode=write` and input exact confirmation `AUTHORIZE_ISOLATED_QA_WRITES`. Each run checks the exact separately approved hostname and denies canonical production.
6. Identities are verified using real Supabase Auth password grants and `is_platform_admin() == false`, precisely one active tenant membership each, different user IDs and tenant IDs. Failure prevents any write.
7. Test-only writes to the branch can be cleaned up by `scripts/rls-gate.ts`. Review cleanup manually if the workflow fails. Collect redacted CI artifacts and evidence; remove the development branch after authorizing teardown. Do not promote staging data to production.

## Coverage and explicit limits

- Read-only regression: `scripts/cross-tenant-smoke.ts` checks A→A, B→B allow and cross-tenant A→B, B→A deny on configured RLS scope.
- Staging-only write regression: `scripts/rls-gate.ts` tests contact inserts/updates, memberships and entitlements; neither a missing test nor an auth error is counted as PASS.
- NOT RUN until separately validated: deployed Builder tenant switch, UI URL bypass, AI tool path, role-escalation writes, Storage permissions, backup/restore and point-in-time recovery, durable Cloudflare deployment, Stripe Test Mode and Commercial Ready.
- New code/workflow SHA requires independent CI; this branch does not inherit the original six same-SHA release gates.

## Execution checkpoint

PROJETO: Sistema-SaaS-Geral
BRANCH: qa/tenant-isolation-staging-20261010
FASE/STATUS: P0 staging harness prepared; live isolated QA matrix BLOCKED pending Supabase branch and QA identities
ÚLTIMA ALTERAÇÃO: isolated GitHub development PR, no production changes
DECISÕES CONFIRMADAS: remote schema is authoritative; do not weaken RLS or use production QA users
NÃO ALTERAR: canonical Supabase, main, Cloudflare production, customer identities
MIGRATIONS: reconcile read-only; do not apply 0001 historical
TESTES/GATES: fail-closed guard unit tests; real staging matrix pending
SEGURANÇA: prevent Platform Master, demand two distinct identities, approved branch ref and write confirmation
BLOQUEIOS: owner cost/organization approval; Supabase branch creation; QA Auth and isolated tenant creation; GitHub isolated environment secrets
PRÓXIMA AÇÃO EXATA: approve US$ 0.01344/hour and org zpusjqgknrdhhpozrwgh; then create the isolated branch and provision QA identities
