# PERMISSION ALIGNMENT

Compares the **DB permission catalog** (canonical remote Supabase `public.permissions`, project `mmykyzzkcugxunmekwew`) against the **saas-core catalog** (`packages/saas-core/src/member.ts`).

Rule: DB is source of truth. saas-core mirrors it. No remote permission was altered in any session; no permission names were invented.

## 0. DRIFT HISTORY — LIVE OVERRIDES HISTORICAL SNAPSHOT (2026-09-15)

> **HISTORICAL BRANCH SNAPSHOT:** 28 permissions / 17 proposed features
> (branch `chatgpt/supabase-vercel-foundation` @ a3b2b1f, `platform_core_v1` seed).
>
> **REMOTE LIVE:** 42 permissions / 14 features (queried directly in Supabase, 2026-09-15).
>
> **REMOTE WINS.** The first alignment pass mirrored the historical snapshot; a
> direct live query superseded it. Nothing was hidden: both states are recorded
> below, and the core code + tests now assert the LIVE state
> (PERMISSIONS=42, role counts 42/40/32/9/5/5/7/19, FEATURES=14).

The 14 permissions present live but absent from the historical snapshot:
`documents.read`, `documents.write`, `events.read`, `events.write`,
`loyalty.read`, `loyalty.write`, `pets.read`, `pets.write`, `projects.read`,
`projects.write`, `religious.sensitive.read`, `religious.sensitive.write`,
`support.read`, `support.write`.

## 1. Permission catalog (42 keys — LIVE)

| DB PERMISSION | SAAS CORE PERMISSION | STATUS | ACTION |
|---|---|---|---|
| audit.read | audit.read | ALIGNED | mirrored (live) |
| billing.read | billing.read | ALIGNED | mirrored (live) |
| billing.write | billing.write | ALIGNED | mirrored (live) |
| booking.read | booking.read | ALIGNED | mirrored (live) |
| booking.write | booking.write | ALIGNED | mirrored (live) |
| brand.read | brand.read | ALIGNED | mirrored (live) |
| brand.write | brand.write | ALIGNED | mirrored (live) |
| catalog.read | catalog.read | ALIGNED | mirrored (live) |
| catalog.write | catalog.write | ALIGNED | mirrored (live) |
| cms.read | cms.read | ALIGNED | mirrored (live) |
| cms.write | cms.write | ALIGNED | mirrored (live) |
| crm.read | crm.read | ALIGNED | mirrored (live) |
| crm.write | crm.write | ALIGNED | mirrored (live) |
| documents.read | documents.read | ALIGNED | mirrored (live; DB_ONLY in snapshot) |
| documents.write | documents.write | ALIGNED | mirrored (live; DB_ONLY in snapshot) |
| events.read | events.read | ALIGNED | mirrored (live; DB_ONLY in snapshot) |
| events.write | events.write | ALIGNED | mirrored (live; DB_ONLY in snapshot) |
| integrations.read | integrations.read | ALIGNED | mirrored (live) |
| integrations.write | integrations.write | ALIGNED | mirrored (live) |
| loyalty.read | loyalty.read | ALIGNED | mirrored (live; DB_ONLY in snapshot) |
| loyalty.write | loyalty.write | ALIGNED | mirrored (live; DB_ONLY in snapshot) |
| media.read | media.read | ALIGNED | mirrored (live) |
| media.write | media.write | ALIGNED | mirrored (live) |
| members.invite | members.invite | ALIGNED | mirrored (live) |
| members.read | members.read | ALIGNED | mirrored (live) |
| members.roles.write | members.roles.write | ALIGNED | mirrored (live) |
| orders.create | orders.create | ALIGNED | mirrored (live) |
| orders.read | orders.read | ALIGNED | mirrored (live) |
| orders.status.write | orders.status.write | ALIGNED | mirrored (live) |
| pets.read | pets.read | ALIGNED | mirrored (live; DB_ONLY in snapshot) |
| pets.write | pets.write | ALIGNED | mirrored (live; DB_ONLY in snapshot) |
| projects.read | projects.read | ALIGNED | mirrored (live; DB_ONLY in snapshot) |
| projects.write | projects.write | ALIGNED | mirrored (live; DB_ONLY in snapshot) |
| quotes.read | quotes.read | ALIGNED | mirrored (live) |
| quotes.write | quotes.write | ALIGNED | mirrored (live) |
| religious.sensitive.read | religious.sensitive.read | ALIGNED | mirrored (live; DB_ONLY in snapshot; TRIPLE-GATED — owner only) |
| religious.sensitive.write | religious.sensitive.write | ALIGNED | mirrored (live; DB_ONLY in snapshot; TRIPLE-GATED — owner only) |
| support.read | support.read | ALIGNED | mirrored (live; DB_ONLY in snapshot) |
| support.write | support.write | ALIGNED | mirrored (live; DB_ONLY in snapshot) |
| tenant.read | tenant.read | ALIGNED | mirrored (live) |
| tenant.settings.read | tenant.settings.read | ALIGNED | mirrored (live) |
| tenant.settings.write | tenant.settings.write | ALIGNED | mirrored (live) |

Summary: **42/42 ALIGNED** · 0 DB_ONLY remaining · 0 CORE_ONLY (no invented keys) · 0 DEPRECATED_CANDIDATE.

## 2. Role matrix — LIVE `role_permissions` vs `DEFAULT_ROLE_PERMISSIONS`

| ROLE | LIVE GRANTS | SAAS CORE (after live alignment) | NOTES |
|---|---|---|---|
| owner | 42 (all) | 42 | incl. religious.sensitive.* |
| admin | 40 | 40 | **INTENTIONAL: no religious.sensitive.read/write** |
| manager | 32 | 32 | no members.*/billing/integrations.write/religious.sensitive |
| editor | 9 | 9 | brand/catalog/cms/media + tenant.read |
| catalog_manager | 5 | 5 | catalog/media + tenant.read |
| orders_manager | 5 | 5 | booking.*/orders.* + tenant.read |
| support | 7 | 7 | booking.read, crm.*, support.*, orders.read, tenant.read |
| viewer | 19 (all read) | 19 | read-only set incl. pets/projects/support read |

The exact live per-role permission lists provided by the owner were mirrored
verbatim into `DEFAULT_ROLE_PERMISSIONS` (see `member.ts`).

### Religious sensitive — TRIPLE GATE (non-negotiable contract)

A sensitive religious operation requires ALL of:
1. **ENTITLEMENT**: `religious.sensitive.enabled === true` (tenant plan/override; default false)
2. **RBAC**: actor holds `religious.sensitive.read`/`.write` (live default: **owner only**)
3. **TENANT/RLS**: correct tenant membership + database RLS/security gate re-validation

Neither the feature flag nor the permission alone authorizes anything.
Admin intentionally does not receive these permissions live; this asymmetry is
deliberate and must not be "fixed" in mirrors.

## 3. Standing rules

1. New permissions: added to remote `public.permissions` + role grants first, then mirrored here and in `member.ts`. Never the reverse order.
2. saas-core remains a mirror for typing/UX; authorization enforcement stays in the DB (`has_tenant_permission()`, RLS, entitlement_security_gate_v1).
3. Any future DB_ONLY / CORE_ONLY state found in drift checks must be registered in this file before code consumes it.
4. Live queries supersede branch snapshots; when they disagree, re-mirror and re-test immediately (this file records both).

Cross-checked against `docs/SUPABASE_RECONCILIATION_FREEBUFF_VS_CHATGPT.md` (§20/§21, RATIFIED) and the live-state addendum.
