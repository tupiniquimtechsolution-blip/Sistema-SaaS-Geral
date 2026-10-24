# Salon + Builder — editorial QA authorization and runbook (2026-10-22)

**Owner approval:** only a third fictitious Supabase Auth user, `cms.read`/`cms.write` restricted to QA Tenant A, controlled test-only editorial content and recovery. This does **not** authorize production writes, role grants outside QA, payment, DNS, Cloudflare release or merging to `main`.

## Verified scope

- **Canonical SaaS production:** `mmykyzzkcugxunmekwew` — forbidden as a target.
- **Independent QA project:** `ynqbnimlpxlokrxlucdm` — only allowed target.
- **Tenant A:** `f92215f9-da30-4453-9190-aece00984284`, slug `qa-isolation-tenant-a`, vertical `salon`.
- **Tenant B:** `a8494bfa-ac05-478c-b06f-3031e0d2cb8c`, slug `qa-isolation-tenant-b`.
- Existing Auth QA-A and QA-B stay `Viewer` with their own one active membership. Never promote either.
- **QA-only tenant-scoped role:** `qa_salon_cms_editor`, id `a1cfc9e4-ed77-4891-a91e-568b17be40de`, `tenant_id=Tenant A`, `is_system=false`, precisely `cms.read` + `cms.write`. Created via `supabase/qa/20261022_salon_cms_editor_role.sql`, applied and verified on QA. **Not assigned to any user yet.**
- Default role `editor` was deliberately rejected because it also allows brand/catalog/media writes.

## Human step still required — official Supabase Auth creation

The connected administrative tools for this session support QA Postgres operations but do **not** expose Supabase Auth Admin `createUser`. Do **not** insert into `auth.users` with SQL.

1. Open the independent project `ynqbnimlpxlokrxlucdm` in Supabase Dashboard and verify the project reference, **not** the canonical production reference.
2. Go to **Authentication → Users → Add user → Create new user** (exact interface labels may vary). Create one *fictitious*, dedicated Salon QA editor with a unique mailbox/address suitable for the project's email-confirmation policy and a strong random password. Do not grant Platform Admin, Owner or existing default Editor. Do not use either QA-A or QA-B account. Avoid any real customer address or contact data.
3. Obtain the newly created user's **Auth UUID** and return only that UUID in the chat; **never share the password, JWT, admin token, or service-role key** in chat, Git or Notion.
4. After the UUID is known, an approved operator can run QA-only SQL with explicit project and two-Viewer checks to create exactly one active `memberships` row (Tenant A, new Auth UID) and exactly one `membership_roles` row referencing `qa_salon_cms_editor`. Verify Auth UID exists first; assert it has no platform_admin status or additional memberships; check role permissions are exactly `cms.read`, `cms.write`. This must be transactional and fail closed.
5. If CI automation requires browser login, store the new email/password as protected **environment secrets** in the GitHub `qa-isolation` environment (not in messages/files). No wider service-role key is required for a browser editor session.

## QA-only editorial E2E proof — not executed yet

- Precheck identity with official Auth `signInWithPassword`, `is_platform_admin=false`, membership restricted to Tenant A; `has_tenant_permission(A,'cms.write')=true` and `has_tenant_permission(B,'cms.write')=false`; `brand.write`, `catalog.write`, `media.write`, `tenant.settings.write`, and `members.roles.write` all false.
- Capture a read-only baseline inventory: Tenant A/B pages, page_sections, page_revisions, existing slug `inicio`, roles and memberships. Fail closed on any conflicting existing homepage or unexpected data.
- Via authenticated QA Builder only: create a page with slug `inicio` and unique QA label; create a draft revision; add harmless text `QA_SALON_EDITOR_<run identifier>`; save; submit for review, approve and publish. Use no customer content/media, no service-role credential in browser.
- Verify public Salon fetches only published enabled text for the resolved Tenant A; unpublished edits/revisions invisible; cross-tenant access B denied; original QA-A/QA-B still viewers. Record redacted, same-SHA CI evidence.
- Test recovery as a **new draft** (workflow rollback) without modifying other tenants. Confirm public content changes only after a *new* approval/publication.

## Recovery limitation and safeguards

The database currently has `page_revisions.page_id -> pages.id` with `ON DELETE RESTRICT` and no ordinary-client DELETE policy on `page_revisions`. Therefore a regular editor CANNOT automatically remove a page with history. Do not blindly delete `pages` or loosen production RLS for cleanup.

For QA fixture cleanup, use a separate privileged **QA-only** transaction after recording exact `tenant_id`, fixture `page_id` and unique test marker:
1. Verify QA project reference, tenant slug, expected exact page ID, marker and that no customer content exists.
2. Delete only fixture `page_revisions` by exact `tenant_id` + `page_id`, then fixture `pages` by exact id (sections cascade); verify affected row counts; commit atomically.
3. Confirm the initial baseline and both Viewer memberships/role assignments are unchanged.
4. Do not execute this if the fixture cannot be uniquely identified; stop for inspection.

**State at this checkpoint:** minimal role provisioned and verified; third Auth user **not yet created**; no editorial page/revision created, no QA editorial write E2E, no production mutation. Commercial release remains NO-GO.
