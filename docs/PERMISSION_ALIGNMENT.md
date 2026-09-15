# PERMISSION ALIGNMENT

Compares the **DB permission catalog** (canonical remote Supabase `public.permissions`, project `mmykyzzkcugxunmekwew`, seeded by platform_core_v1 — confirmed remotely 2026-09-15) against the **saas-core catalog** (`packages/saas-core/src/member.ts`).

Rule: DB is source of truth. saas-core mirrors it. No remote permission was altered in this session; no permission names were invented.

## 1. Permission catalog (28 keys)

| DB PERMISSION | SAAS CORE PERMISSION | STATUS | ACTION |
|---|---|---|---|
| tenant.read | tenant.read | ALIGNED | mirrored (pre-existing) |
| tenant.settings.read | tenant.settings.read | ALIGNED | mirrored (pre-existing) |
| tenant.settings.write | tenant.settings.write | ALIGNED | mirrored (pre-existing) |
| brand.read | brand.read | ALIGNED | mirrored (pre-existing) |
| brand.write | brand.write | ALIGNED | mirrored (pre-existing) |
| cms.read | cms.read | ALIGNED | mirrored (pre-existing) |
| cms.write | cms.write | ALIGNED | mirrored (pre-existing) |
| media.read | media.read | ALIGNED | mirrored (pre-existing) |
| media.write | media.write | ALIGNED | mirrored (pre-existing) |
| catalog.read | catalog.read | ALIGNED | mirrored (pre-existing) |
| catalog.write | catalog.write | ALIGNED | mirrored (pre-existing) |
| orders.read | orders.read | ALIGNED | mirrored (pre-existing) |
| orders.create | orders.create | ALIGNED | mirrored (pre-existing) |
| orders.status.write | orders.status.write | ALIGNED | mirrored (pre-existing) |
| members.read | members.read | ALIGNED | mirrored (pre-existing) |
| members.invite | members.invite | ALIGNED | mirrored (pre-existing) |
| members.roles.write | members.roles.write | ALIGNED | mirrored (pre-existing) |
| integrations.read | integrations.read | ALIGNED | mirrored (pre-existing) |
| integrations.write | integrations.write | ALIGNED | mirrored (pre-existing) |
| billing.read | billing.read | ALIGNED | mirrored (pre-existing) |
| billing.write | billing.write | ALIGNED | mirrored (pre-existing) |
| audit.read | audit.read | ALIGNED | mirrored (pre-existing) |
| crm.read | crm.read | ALIGNED | DB_ONLY → mirrored in this alignment (was missing) |
| crm.write | crm.write | ALIGNED | DB_ONLY → mirrored in this alignment (was missing) |
| booking.read | booking.read | ALIGNED | DB_ONLY → mirrored in this alignment (was missing; remote existence confirmed) |
| booking.write | booking.write | ALIGNED | DB_ONLY → mirrored in this alignment (was missing; remote existence confirmed) |
| quotes.read | quotes.read | ALIGNED | DB_ONLY → mirrored in this alignment (was missing) |
| quotes.write | quotes.write | ALIGNED | DB_ONLY → mirrored in this alignment (was missing) |

Summary: 28/28 ALIGNED · 0 DB_ONLY remaining · 0 CORE_ONLY (no invented keys) · 0 DEPRECATED_CANDIDATE (no deprecation signal from remote).

## 2. Role matrix — `DEFAULT_ROLE_PERMISSIONS` vs remote `role_permissions`

| ROLE | REMOTE GRANTS | SAAS CORE (after alignment) | KEY DELTAS APPLIED |
|---|---|---|---|
| owner | all 28 (cross join) | 28 | +6 (crm/booking/quotes) |
| admin | all 28 (cross join) | 28 | +6; also +orders.create (old local matrix omitted it — DB grants it) |
| manager | 20 | 20 | +tenant.settings.read, +cms.write, +media.read/write, +catalog.write, +orders.status.write, +integrations.read, +crm.*/booking.*/quotes.* |
| editor | 8 | 8 | +brand.write, +media.read/write; −catalog.write (remote editor does NOT hold it) |
| catalog_manager | 5 | 5 | −brand.read; +media.write |
| orders_manager | 7 | 7 | +catalog.read, +crm.read/write |
| support | 7 | 7 | −members.read; +crm.*/booking.*/quotes.read |
| viewer | 14 (all read) | 14 | +11 read permissions (settings/brand/cms/media/catalog/orders/members/integrations/billing/audit/crm/booking/quotes) |

Exact remote matrix statements (platform_core_v1, `git show` @ a3b2b1f): owner/admin = cross join all; manager/editor/catalog_manager/orders_manager/support/viewer = explicit `key = any(array[...])` lists — all mirrored verbatim into `DEFAULT_ROLE_PERMISSIONS`.

## 3. Standing rules

1. New permissions: added to remote `public.permissions` + role grants first, then mirrored here and in `member.ts`. Never the reverse order.
2. saas-core remains a mirror for typing/UX; authorization enforcement stays in the DB (`has_tenant_permission()`, RLS, entitlement_security_gate_v1).
3. Any future DB_ONLY / CORE_ONLY state found in drift checks must be registered in this file before code consumes it.

Cross-checked against the pre-alignment reconciliation (§5/§6 of `docs/SUPABASE_RECONCILIATION_FREEBUFF_VS_CHATGPT.md`): the 6 missing keys were classified DB_ONLY and are now ALIGNED.
