# SUPABASE RECONCILIATION — FREEBUFF VS CHATGPT

Status: **DOCUMENTAL ONLY**. No database command was executed against the remote project. No merge between branches. No migration rewritten. This document registers drift and proposes canonicalization for human/ChatGPT decision.

## 1. EXECUTIVE SUMMARY

Two independent infrastructure lines exist:

- **FREEBUFF** (this branch): monorepo with `apps/*` imported, saas-core TypeScript contracts (47 tests), and a minimal 10-table platform baseline migration + seed with a demo Fornalha tenant. Never executed remotely.
- **CHATGPT** (`chatgpt/supabase-vercel-foundation`, head `a3b2b1f`): a complete 81-table schema (platform core, commerce, booking/events, B2B, pet, restaurant, religious house, storage), permission-granular RLS helpers, security-hardened RPCs, and a **real provisioned Supabase project** with 8 migrations already applied remotely (86 tables documented live).

The ChatGPT line is strictly more advanced and is the one actually deployed. The Freebuff line carries the monorepo, imported verticals and application contracts. **No schema convergence decision is executed here.** The recommendation (§21) is to keep the ChatGPT remote schema as canonical DB truth and adapt the Freebuff application layer to it, with the Freebuff migration retired after reconciliation — but every KEEP decision in §21 requires explicit human/ChatGPT approval before any migration work.

## 2. SOURCES COMPARED

FREEBUFF BRANCH: `freebuff/big-master-wave-01-monorepo`
HEAD: `7d0927b18f7a18a4d8320b1d9b4bf95a1175478c`

Sources read:
- `supabase/migrations/0001_multi_tenant_schema.sql` (133 lines)
- `supabase/seed.sql` (26 lines)
- `packages/saas-core/*` (TypeScript contracts)
- `docs/BIG_MASTER_WAVE_01_HANDOFF.md`

CHATGPT INFRA BRANCH: `chatgpt/supabase-vercel-foundation`
HEAD: `a3b2b1f02ad2b2e3af5e574d3ee69a94ffb27f35`

Sources read (via `git show`, no checkout/merge):
- `supabase/migrations/20260911000100_platform_core.sql` … `20260911000800_storage_policies.sql` (8 files)
- `supabase/seed.sql`
- `docs/DATA_MODEL.md`
- `docs/DEPLOYMENT.md`
- `docs/SUPABASE_STATUS_2026-09-11.md`

REMOTE DATABASE STATUS (documented only, from `docs/SUPABASE_STATUS_2026-09-11.md` — not verified live, per instruction):
- Project ref `mmykyzzkcugxunmekwew`, region `sa-east-1`, dedicated to this SaaS (GlicoControl-MVP NOT reused).
- 8 migrations applied remotely on 2026-09-11 (platform_core_v1 → religious_public_details_v1).
- 86 tables in `public`; 76 tenant-owned (`tenant_id` column); 76/76 with RLS enabled; 0 without.
- 8 global roles, 42 permissions, 4 plans, 2 tenant-aware storage buckets.
- Demo tenant `fornalha-demo` exists explicitly.
- 2 intentional SECURITY DEFINER RPC warnings (`create_tenant_with_owner`, `write_audit_log`).
- Cross-tenant authenticated A→B test: NOT RUN / RELEASE BLOCKER (documented by ChatGPT itself).

## 3. TABLE INVENTORY

Counts: FREEBUFF 10 tables · CHATGPT 81 tables (migrations) · REMOTE DOCUMENTED 86 tables (live, includes hardening additions not present in the branch's 8 migration files — drift already flagged by ChatGPT status doc).

| TABLE | FREEBUFF | CHATGPT | REMOTE DOCUMENTED | TENANT OWNED? | RLS? | DIFFERENCES | RECOMMENDED CANONICAL MODEL |
|---|---|---|---|---|---|---|---|
| tenants | yes (JSONB brand/theme/palette/settings inline) | yes (normalized: tenant_brands/tenant_themes/tenant_settings) | yes | — (root) | both | FB inlines brand/theme/palette; CG normalizes into 3 child tables | CG normalized model |
| tenant_domains | yes | yes | yes | yes | FB membership-based / CG permission-based | FB grants full CRUD to members; CG read via `tenant.settings.read`, write via `tenant.settings.write` | CG |
| tenant_brands | no (inside tenants.brand) | yes | yes | yes | CG only | FB has no such table | CG |
| tenant_themes | no (inside tenants.theme) | yes | yes | yes | CG only | FB has no such table | CG |
| tenant_settings | no (inside tenants.settings) | yes | yes | yes | CG only | FB has no such table | CG |
| locations | no | yes | yes | yes | CG only | FB has no locations at all | CG |
| vertical_registry | no | yes | yes | no (global) | CG public read | FB absent | CG |
| profiles | yes | yes | yes | no (user-owned) | both | Equivalent shape | CG (adds `is_platform_admin` visibility) |
| platform_admins | no | yes | yes | no (global) | CG | FB absent | CG |
| memberships | yes (role enum on row) | yes (roles via membership_roles) | yes | yes | both | FB single role enum; CG multi-role via membership_roles | CG multi-role |
| roles | yes (generic, unfilled) | yes (8 global + tenant-optional) | yes (8 roles) | optional | FB none / CG authenticated read | FB table exists but never seeded | CG |
| permissions | yes (SERIAL, unfilled) | yes (42 seeded) | yes (42) | no | FB none / CG read | FB empty by design (unused) | CG |
| role_permissions | yes (unfilled) | yes (seeded matrix) | yes | no | FB none / CG read | FB unused | CG |
| membership_roles | no | yes | yes | yes | CG | FB absent (single-role) | CG |
| invitations | no | yes | yes | yes | CG | FB absent | CG |
| features | no (key/value inside plans JSONB) | yes | yes | no | CG | FB encodes features in plans.entitlements JSONB | CG |
| plans | yes (entitlements JSONB array) | yes (id text, plan_entitlements child) | yes (4 plans) | no | FB none / CG public read | FB UUID PK + JSONB; CG text id + normalized child | CG |
| plan_entitlements | no | yes | yes | no | CG | FB absent | CG |
| subscriptions | yes (entitlements snapshot JSONB) | yes | yes | yes | FB any-member / CG `billing.read` | FB snapshots entitlements on row; CG keeps normalized | CG |
| tenant_entitlements | no | yes | yes | yes | CG | FB absent | CG |
| tenant_features | yes (key/value override) | yes | yes | yes | FB member CRUD / CG member read | Name collision, same concept, different permissions | CG |
| pages / page_sections | no (TS contract only in saas-core) | yes | yes | yes | CG | FB has CMS contract in TS, no DB table | CG |
| media_assets | no (TS contract only) | yes | yes | yes | CG | FB media contract in TS only | CG |
| integration_connections | no (TS contract only) | yes | yes | yes | CG | FB integrations contract in TS only | CG |
| webhook_endpoints / webhook_deliveries | no (TS contract only) | yes | yes | yes | CG | FB webhook contract in TS only | CG |
| notifications | no | yes | yes | yes | CG | FB absent | CG |
| audit_logs | no (TS contract only) | yes | yes | yes | CG | FB audit contract in TS only | CG |
| usage_metrics | no | yes | yes | yes | CG | FB absent | CG |
| contacts / leads | no | yes | yes | yes | CG | FB absent | CG |
| commerce (11 tables) | no | yes | yes | yes | CG | FB absent | CG |
| booking/events (9 tables) | no | yes | yes | yes | CG | FB absent | CG |
| b2b/projects (16 tables) | no | yes | yes | yes | CG | FB absent | CG |
| pet (4 tables) | no | yes | yes | yes | CG | FB absent | CG |
| restaurant (6 tables) | no | yes | yes | yes | CG | FB absent | CG |
| religious (3 tables) | no | yes | yes | yes | CG | FB absent | CG |
| storage.buckets/objects | no | yes (2 buckets + policies) | yes | path-based | CG | FB storage contract in TS only | CG |

FREEBUFF TABLE COUNT: 10 · CHATGPT TABLE COUNT: 81 · REMOTE DOCUMENTED TABLE COUNT: 86

## 4. CORE PLATFORM

| Aspect | FREEBUFF | CHATGPT | Assessment |
|---|---|---|---|
| tenants.brand/theme/palette/settings | JSONB columns inline | Normalized `tenant_brands`, `tenant_themes`, `tenant_settings` tables | CG normalizes; FB matches saas-core TS shape but not DB best practice |
| locations | absent | `locations` with public/private + RLS | FB gap; bakery delivery/pickup assumptions live in JSONB settings today |
| tenant_domains | full CRUD for any member | read `tenant.settings.read`, write `tenant.settings.write` | CG permission-granular; FB over-permissive |
| vertical_registry | absent | present, public read of enabled verticals | FB gap |
| Tenant creation | seed.sql inserts demo tenant | `create_tenant_with_owner()` RPC (atomic tenant+brand+theme+settings+owner membership) | CG onboarding is atomic and auth-linked; FB seed inserts tenant without owner |

## 5. IDENTITY / RBAC

| Aspect | FREEBUFF | CHATGPT | Assessment |
|---|---|---|---|
| Membership roles | single `role` enum on memberships | `membership_roles` join table (multi-role), roles global or tenant-scoped | CG superset |
| Roles/permissions data | tables exist, never seeded (dead weight) | 8 roles + 42 permissions seeded; matrix in role_permissions | CG seeded; FB tables unused |
| saas-core TS RBAC | `DEFAULT_ROLE_PERMISSIONS` map with 8 roles / 22 permissions, default-deny asserts | DB-level equivalent via `has_tenant_permission()` | Conceptually aligned; TS permission set is a subset — alignment pass needed later |
| invitations | absent | full invitations flow with `members.invite` | FB gap |
| platform_admins | absent | present with self/platform read policies | FB gap |
| Profile onboarding | no trigger | `handle_new_auth_user()` trigger creates profile on signup | FB gap |

## 6. PLANS / ENTITLEMENTS

| Aspect | FREEBUFF | CHATGPT | Assessment |
|---|---|---|---|
| Plan identity | UUID PK | text id (`demo`,`starter`,`pro`,`business`) | Cosmetic; CG simpler |
| Entitlement storage | JSONB array on plans row + snapshot on subscriptions | `features` catalog + `plan_entitlements` + `tenant_entitlements` overrides + `tenant_features` | CG normalizes and separates catalog/plan/override |
| Feature names | FB TS union: `commerce/booking/crm/quotes/events/customDomain.enabled`, `locations/users/storage/products/media.maxFileSize/audit.retentionDays` | CG adds `orders/projects/loyalty/inventory/support.enabled` | CG superset; FB TS Entitlement union must be extended later (application adaptation, not DB) |
| Boolean entitlements | FB seed uses permission strings as entitlements (e.g. `catalog.read`) — conflation of permissions and features | CG strictly separates RBAC permissions from product features | **CONFLICTING concept** — FB seed conflates; CG clean |
| Override precedence | FB: no precedence logic (subscription snapshot only) | CG: tenant_entitlements override plan_entitlements; effective calc expected app/RPC-side | CG defined precedence |
| Effective entitlement calculation | FB TS `canUseFeature()` reads snapshot | CG effective = plan ∪ overrides, gated by `entitlement_security_gate_v1` remote migration (documented) | CG; FB TS helper needs adaptation to read effective set |

## 7. CMS / MEDIA

| Aspect | FREEBUFF | CHATGPT | Assessment |
|---|---|---|---|
| pages/page_sections | TS contract only (`Page`, `PageSection`, `publishedSections()`) | Tables with draft/published status, enabled sections, position | Aligned conceptually; CG owns persistence |
| media_assets | TS contract (`MediaAsset`, visibility public/private, tenant path `tenants/{tenantId}/...`) | Table with visibility + storage integration | FB TS path convention `tenants/<tenantId>/<file>` vs CG `<tenant-uuid>/<folder>/<file>` — **path convention differs** (extra `tenants/` prefix in FB). CG storage policies parse first path segment as tenant UUID, so FB convention would break them. |
| Public/private buckets | TS contract only | `tenant-media-public` / `tenant-media-private`, 25 MiB limit, explicit MIME allowlist | CG |

## 8. CRM

| Aspect | FREEBUFF | CHATGPT | Assessment |
|---|---|---|---|
| contacts / leads | absent (TS `IntegrationConnection` contract only) | Tables with tenant scope + RLS | CG owns persistence |
| CRM Tupiniquim (horizontal app) | Doc af3eb0b: CRM will consume Tenant/Auth/Membership/RBAC/Entitlements/Billing/Audit | Same core consumed by all apps | CRM compatibility is architectural, not schema — **no CRM tables imported now**, per instruction. CG `contacts`/`leads` are the natural landing tables for the horizontal CRM when integration begins. |

## 9. COMMERCE

FB has no commerce tables; divergence is therefore conceptual between FB TS contracts/vertical apps and CG schema:

| Aspect | FREEBUFF | CHATGPT | Notes |
|---|---|---|---|
| Money | FB: no money model in TS contracts; bakery app assumptions unknown/unaudited here | `*_cents integer` with `>= 0` CHECK + `currency` (default BRL) everywhere | CG chose integer cents; FB has no competing numeric model in the monorepo — but vertical app code must be audited before assuming compatibility |
| Modifier groups | absent | `product_modifier_groups` + `product_modifiers` | CG |
| Product options | absent | variants + modifiers + `product_media` | CG |
| Fulfillment | bakery JSONB flags (`delivery`, `pickup`) in tenant settings | `fulfillment_methods` table + per-order method + `fulfillment_fee_cents` + address JSONB | CG superset; adapter needed |
| Orders | absent | status enum (8 states), payment_status, coupon, idempotency_key unique per tenant, `source`, `external_reference` | CG |
| Status history | absent | `order_status_history` | CG |
| Multi-vertical fit | — | CG commerce is vertical-neutral (bakery/pet/restaurant share it) | Aligns with "no per-vertical fork" |

No silent choice made: money model and fulfillment model divergences are flagged for §21.

## 10. BOOKINGS / EVENTS

FB: no tables; TS has no booking contract. CG: `services`, `service_resources`, `service_resource_links`, `availability_rules`, `availability_overrides`, `bookings` (+ status history), `events`, `event_registrations`. Religious/restaurant specifics extend bookings via detail tables. FB verticals (bakery booking flags, temple calendar) will consume CG model via adapters. Classification: CHATGPT_ONLY, KEEP CHATGPT candidate.

## 11. B2B / METALART / MACHINERY / LED

CG provides a shared B2B layer: `equipment_categories`, `equipment`, `equipment_media`, `inventory_items`, `technical_solutions`, `site_surveys`, `quotes`, `quote_items`, `proposal_versions`, `projects`, `project_updates`, `documents`, `trade_in_requests`, `financing_requests`, `warranty_records`, `support_tickets`.

- **MetalArt** (main vertical): equipment/showroom, quotes, proposal versions, projects, site surveys, installations (project type), warranties, documents — fully served by shared tables.
- **Máquinas Pesadas**: same B2B layer + trade-in + financing + inventory.
- **LED (future)**: same B2B layer (vertical_registry already registers `led` modules in CG seed).

No per-vertical duplicated tables needed — the shared contract serves all three. This matches AGENTS.md architecture (shared modules + vertical packs). FB has none of these (only TS TS contracts for entitlements like `quotes.enabled`). Classification: CHATGPT_ONLY, KEEP CHATGPT candidate.

## 12. PET

| Aspect | FREEBUFF | CHATGPT |
|---|---|---|
| pets | absent | `pets` (tenant+owner scoped) |
| booking link | absent | `bookings.pet_id` |
| loyalty | absent | `loyalty_accounts` + `loyalty_transactions` |
| service history | absent | `pet_service_history` |
| veterinary records | — | explicitly excluded ("Não inclui prontuário veterinário") |

## 13. RESTAURANT

| Aspect | FREEBUFF | CHATGPT |
|---|---|---|
| menus / sections / items | absent | `menus`, `menu_sections`, `menu_items` |
| allergens | absent | `allergens` + `menu_item_allergens` |
| reservations | absent | `restaurant_reservation_details` (extends bookings) |
| waitlist | absent | **absent in CG too** — gap in both; register for future requirement, do not invent now |

## 14. RELIGIOUS HOUSE (CRITICAL)

CG structures and classification:

| Structure | Content | Classification | Rationale |
|---|---|---|---|
| `religious_event_details` | public_category, spiritual_line, guidance, dress_guidance, arrival_guidance, public_notes | PUBLIC | Public-facing event guidance; anon read via published events |
| `religious_booking_details` | public_service_type, accessibility_needs, administrative_note | PRIVATE (administrative) | Authenticated booking staff only; comment explicitly forbids spiritual narratives |
| `contribution_configs` | is_enabled, provider, public_instructions, secret_ref | PRIVATE / SENSITIVE (config) | Payment provider config; secrets only by reference |
| Sensitive member/attendance/consultation structures (remote bootstrap) | dormant | DORMANT + SENSITIVE | Protected by `religious.sensitive.*` permission AND `religious.sensitive.enabled` entitlement defaulting to `false` on every plan (documented) |

- Spiritual consultation narratives: NOT REQUIRED / must remain NOT CREATED by default. CG migration file contains none; remote has dormant structures, documented.
- No destructive decision taken. FB has no competing structures (placeholder app only, `BLOCKED_FREEBUFF_REPOSITORY_ACCESS_TEMPLO`).
- Recommendation (non-binding): keep dormant structures disabled; never store private narratives unless a separately-approved, separately-secured design exists.

## 15. RLS

| TABLE/GROUP | RLS FREEBUFF | RLS CHATGPT | POLICY MODEL | DEFAULT DENY? | MEMBERSHIP REQUIRED? | PERMISSION REQUIRED? | CROSS-TENANT RISK | RECOMMENDATION |
|---|---|---|---|---|---|---|---|---|
| tenants | enabled + FORCE; USING `auth.uid() IS NOT NULL`; **WITH CHECK identical → any authenticated user can UPDATE other tenants' rows** | `tenants_member_read` (member select only; writes via RPC) | CG: membership-gated; FB: auth-only | CG yes / FB **write hole** | CG yes / FB no (write) | CG via RPC | **FB HIGH: authenticated update on all tenants** | CG; FB write policy must not be carried forward |
| tenant_domains | member-membership | `tenant.settings.read/write` | permission-granular | both yes | both yes | CG yes | FB medium (member can alter domains) | CG |
| profiles | self only | self or platform admin | CG superset | yes | n/a | CG platform read | low | CG |
| memberships | self only (can't see staff!) | self OR `members.read` | CG granular | yes | yes | CG yes | FB low (under-read, not leak) | CG |
| plans | any authenticated CRUD (FORCE) | public read `is_public and is_active`; writes platform-only | CG | CG yes for writes / **FB write hole** | no | CG platform writes | FB medium | CG |
| subscriptions | any member (no permission check) | `billing.read` | permission-granular | yes | yes | CG yes | FB medium | CG |
| tenant_features | member CRUD (key/value override!) | member read only; overrides via controlled path | CG | yes | yes | CG effective-gate | **FB high: any member can self-escalate entitlements** | CG |
| CMS/pages/media/locations | absent (no tables) | public-published read + permission-granular admin writes | permission-granular | yes | yes | yes | n/a | CG |
| Religious details | absent | public event read; booking/contribution permission-gated | permission-granular | yes | yes (except public event read) | `cms.write` / `booking.read/write` / `tenant.settings.*` | n/a | CG |
| Storage objects | absent (TS policy only) | bucket policies: public read on public bucket; private read membership; writes require `media.write` + tenant-UUID first path segment | path-validated | yes | yes | yes | n/a | CG |

RLS DIFFERENCES summary: FB = 4 coarse policies, auth/membership-based, 3 write-permission holes (tenants, plans, tenant_features). CG = 76/76 tables RLS-enabled, operation-specific policies, permission-granular via `has_tenant_permission()`, plus hardening migration (init-plan optimization, FOR ALL split, FK indexes).

## 16. SECURITY HELPERS / RPC

| Aspect | FREEBUFF | CHATGPT | Assessment |
|---|---|---|---|
| Tenant helpers | none (TS only) | `is_tenant_member()`, `has_tenant_permission()` — SECURITY DEFINER internals behind `private` schema, public SECURITY INVOKER wrappers | CG documented privilege boundary |
| search_path | n/a | explicit `set search_path = public` on helpers (incl. `try_uuid`) | CG mitigates search-path hijack |
| Authenticated RPCs | none | `create_tenant_with_owner()` and `write_audit_log()` SECURITY DEFINER — 2 documented intentional advisor warnings | CG accepted risk, under review; Edge-Function migration possible later |
| Audit RPC | absent | `write_audit_log` (authenticated, definer) | FB audit is TS-contract only |
| Tenant provisioning | seed insert (no owner) | atomic RPC tenant+brand+theme+settings+owner membership | CG; FB seed approach leaves ownerless demo tenant |
| Least privilege | FB grants nothing (no helpers) | wrappers + explicit grants per table (`grant select ... to anon` only where public) | CG |

## 17. STORAGE

| Aspect | FREEBUFF | CHATGPT |
|---|---|---|
| Buckets | none (TS contract: `bucket` field on MediaAsset) | `tenant-media-public` (public), `tenant-media-private` (private) — note remote doc names them `tenant-public`/`tenant-private` (naming drift, see §20) |
| Size limits | TS `media.maxFileSize` entitlement (25 MiB in CG seed) | 26214400 bytes enforced at bucket level |
| MIME handling | TS allowlist regex + blocked prefixes | explicit allowed_mime_types array at bucket |
| Path convention | TS: `tenants/{tenantId}/{file}` | `<tenant-uuid>/<folder>/<file>` — **CONFLICTING convention** |
| Tenant validation | TS: path builder guarantees prefix | DB: `try_uuid(foldername(name)[1])` + `media.write` permission |
| Write permissions | TS `media.write` concept | DB-enforced insert/update/delete policies |

## 18. SEED STRATEGY

| Aspect | FREEBUFF | CHATGPT |
|---|---|---|
| Roles/permissions | not seeded (tables empty) | 8 roles + 42 permissions + matrix seeded |
| Plans | demo/starter/pro/business; entitlements as JSONB arrays **of permission strings** (conflation) | same plan names; entitlements as typed feature rows (clean separation) |
| Features | implicit in JSONB | 17-feature catalog incl. `orders/projects/loyalty/inventory/support.enabled` |
| Demo tenants | Fornalha inserted directly, status `demo`, ownerless, hard-coded demo phone/address | **no tenant in seed** — `fornalha-demo` created via `create_tenant_with_owner()` with a controlled demo owner identity (remote already has it) |
| Vertical registry | absent | 6 verticals registered with module flags |

SEED DIFFERENCES: FB seed is executable-when-DB-exists but conceptually conflates permissions/features and creates an ownerless demo tenant; CG seed is reference-data-only and delegates tenant creation to the atomic RPC. CG approach is the safe one (no hardcoded demo identity in Git).

## 19. MIGRATION HISTORY

FREEBUFF migrations:
1. `0001_multi_tenant_schema.sql` — 10 tables + 4 policies. **Classification: OVERLAPPING** (subset concept of CG platform_core) and **OBSOLETE_CANDIDATE** (superseded; contains the tenants/plans/tenant_features write-policy holes; never executed remotely).

CHATGPT migrations (branch files):
1. `20260911000100_platform_core.sql` — COMPATIBLE with remote platform_core_v1 (pending name/SHA diff)
2. `20260911000200_commerce.sql` — COMPATIBLE (business_modules_v1)
3. `20260911000300_booking_events.sql` — COMPATIBLE (business_modules_v1)
4. `20260911000400_b2b_quotes_projects.sql` — COMPATIBLE (vertical_modules_v1)
5. `20260911000500_pet_vertical.sql` — COMPATIBLE
6. `20260911000600_restaurant_vertical.sql` — COMPATIBLE
7. `20260911000700_religious_house_vertical.sql` — COMPATIBLE (religious_public_details_v1)
8. `20260911000800_storage_policies.sql` — COMPATIBLE (storage_security_v1)

REMOTE-ONLY (applied remotely, not in branch files — per status doc): `security_helpers_hardening_v1`, `performance_hardening_v1`, `entitlement_security_gate_v1` (+ hardening additions inside religious_public_details_v1). Classification: **REMOTE_ONLY** — must be fetched/reconciled into the repo before any canonical claim.

Do NOT treat names/order as equivalent merely because entities look alike: the remote 8-name list vs branch 8-file list alignment above is by content correlation, not verified SHA — confirming that mapping is part of the next exact action.

MIGRATION HISTORY DIFFERENCES: FB 1 obsolete file; CG 8 files correlated to 8 remote migrations; 3–4 remote hardening migrations exist only remotely; remote table count (86) exceeds branch-file table count (81) — drift.

## 20. SCHEMA DRIFT

1. Remote (86 tables) > CG branch migrations (81 tables): hardening migrations added structures not in branch files (e.g. sensitive religious dormant structures, possibly `booking.read/write` permissions — note `religious_booking_details_write` references `booking.write`, which is not in the branch's 42-permission seed visible here; must be verified remotely).
2. Bucket naming: branch `tenant-media-public/private` vs status doc `tenant-public`/`tenant-private`.
3. FB TS path convention (`tenants/<uuid>/...`) vs CG/remote storage (`<uuid>/...`).
4. FB plans-as-JSONB vs remote normalized plan_entitlements (already deployed remotely — FB TS `Plan` type will not map 1:1).
5. FB `tenant_features` is member-writable in FB policy vs remote entitlement security gate.
6. saas-core TS entitlement union lacks 5 CG feature keys (`orders/projects/loyalty/inventory/support.enabled`).
7. `booking.write`/`booking.read` permissions referenced by CG RLS but possibly absent from branch permission seed (verify).

Never mask drift: items 1, 2 and 7 require remote inspection to resolve, not assumption.

## 21. CANONICALIZATION PROPOSAL

| Group | Proposal | Rationale |
|---|---|---|
| Core platform (tenants, brands, themes, settings, locations, domains, vertical_registry) | KEEP CHATGPT | Normalized, permission-granular, deployed |
| Identity/RBAC (memberships, roles, permissions, membership_roles, invitations, platform_admins, profiles) | KEEP CHATGPT | Seeded, multi-role, deployed |
| Plans/entitlements | KEEP CHATGPT | Clean feature catalog + overrides + security gate; requires ADAPT APPLICATION for saas-core TS types |
| CMS/Media tables | KEEP CHATGPT | Deployed; saas-core TS contracts adapt (application layer) |
| CRM (contacts, leads) | KEEP CHATGPT | Needed by verticals now and CRM horizontal later |
| Commerce (11 tables) | KEEP CHATGPT (cents money, fulfillment_methods, modifier groups) | Only complete model; FB app audit before wiring |
| Booking/Events | KEEP CHATGPT | Complete |
| B2B layer | KEEP CHATGPT | Serves MetalArt/Machinery/LED without per-vertical forks |
| Pet / Restaurant specifics | KEEP CHATGPT | Complete; waitlist gap deferred |
| Religious house | KEEP CHATGPT + DEFER (dormant sensitive) | Sensitive structures stay disabled pending explicit decision |
| Storage | KEEP CHATGPT (remote naming to be confirmed) | DB-enforced; FB TS path builder must ADAPT APPLICATION (`tenants/` prefix removal) |
| FB `0001` migration | OBSOLETE_CANDIDATE — retire (documented, not deleted now) | Superseded; contains RLS write holes |
| FB saas-core TS contracts | KEEP FREEBUFF, ADAPT APPLICATION | Unique value (tests, SSRF/PII guards, idempotency); align entitlement keys + plan types to CG schema |
| FB demo tenant seed | REPLACE CONCEPT — bootstrap via `create_tenant_with_owner()` with controlled demo identity | No ownerless tenant, no hard-coded demo credentials |
| Effective entitlement logic | REQUIRES HUMAN/CHATGPT DECISION (RPC vs app-layer calc) | Security-sensitive; `entitlement_security_gate_v1` exists remotely |
| SECURITY DEFINER RPCs | DEFER decision (keep vs Edge Functions) | Documented advisor warnings; not urgent |

**No decision in this table has been executed.** These are proposals for owner + ChatGPT ratification.

## 22. SAFE MIGRATION STRATEGY

Non-destructive, evidence-first sequence:

1. **Estado remoto real** — export authoritative remote schema (`supabase db dump --schema public` style, read-only) and the remote migration ledger (`supabase migration list`); store under `docs/` or `supabase/remote-snapshot/` as evidence. Resolve drift items 1, 2, 7.
2. **Documentação** — ratify/adjust this reconciliation with the owner + ChatGPT line; record decisions in MIGRATION_MANIFEST.
3. **Schema canônico** — declare remote + hardening migrations as canonical history; move CG branch files to mirror remote exactly (names/order/SHA verified, not assumed).
4. **Migrations reconciliadas** — reconcile repo migration set = remote set; add new forward-only migrations for genuine gaps (e.g. waitlist, CRM horizontal needs); no drop/recreate of existing remote structures as a path.
5. **Tipos regenerados** — regenerate Supabase TS types only after 3–4, commit the type file then (per ChatGPT status doc).
6. **Aplicação adaptada** — adapt saas-core (entitlement keys, plan types, storage path convention) and vertical apps via adapters; layouts untouched.
7. **Testes cross-tenant** — provision controlled A/B identities, execute authenticated A→B/B→A negative tests (the documented release blocker), RLS validation, storage negative tests.
8. **Preview** — only after cross-tenant gates pass.

Prohibited by default: DROP/recreate of deployed structures, destructive ALTER, TRUNCATE, remote seed re-run.

## 23. BLOCKERS

- BLOCKED_REMOTE_SCHEMA_SNAPSHOT — remote dump/migration list requires Supabase credentials/access not exercised in this session (documental wave).
- BLOCKED_CROSS_TENANT_TEST — controlled A/B identities not provisioned (documented by ChatGPT status; remains release blocker).
- BLOCKED_SOURCE_REPOSITORY_LED — LED canonical repo unidentified.
- BLOCKED_FREEBUFF_REPOSITORY_ACCESS_TEMPLO — Templo repo exists; Freebuff access pending.
- BLOCKED_CANONICAL_DECISION — §21 KEEP/ADAPT proposals require owner + ChatGPT ratification before any migration work.
- BLOCKED_BILLING_PROVIDER — no credential (unchanged).

## 24. RELEASE GATES

Obrigatórios antes do primeiro Preview SaaS integrado:

| Gate | State |
|---|---|
| Migration reconciliation (repo = remote, drift resolved) | NOT RUN — this doc is step 1 |
| Auth real (controlled identities) | NOT RUN |
| RLS validada (operation-specific policy tests) | NOT RUN |
| Cross-tenant negative tests A/B | NOT RUN — documented release blocker on both lines |
| Storage security (path validation, private bucket negative tests) | NOT RUN |
| Build | PASS (bakery/pet/restaurant/heavy-machinery, earlier session) |
| Typecheck | PASS (saas-core + metalart, this session) |
| Unit/security tests | PASS — saas-core 47/47 |
| Env validation | NOT RUN (publishable key/URL not yet wired into apps) |
| Preview SaaS integrado | BLOCKED until all above |

## 25. NEXT EXACT ACTION

Fetch the authoritative remote state: run a read-only `supabase db dump --schema public` (or equivalent SQL introspection) against project `mmykyzzkcugxunmekwew` plus `supabase migration list`, commit the snapshot under `supabase/remote-snapshot/`, and resolve drift items §20.1, §20.2 and §20.7 — then ratify §21 with the owner before touching any migration file.
