# Salon / Vanessa Braz — RC1 Evidence

Target: `salon-v1.0.0-rc.1`  
Status: **TECHNICALLY GREEN EXCEPT CLOUDFLARE HTTPS DEPLOY — PR REMAINS DRAFT**

Este arquivo é o ledger de evidência do RC. `PASS` abaixo significa execução verificável; itens externos ou não autorizados permanecem explicitamente bloqueados.

## Candidate

- branch: `chatgpt/integrate-salon-vanessa`
- base: `freebuff/big-master-wave-01-monorepo`
- Supabase: `mmykyzzkcugxunmekwew`
- app: `apps/salon`
- final candidate SHA: `b6296ea1b3971d99fd42fdf5dfddc255f983e25c`
- PR: `#5` — DRAFT, mergeable, **não mergear em main**
- RC URL: BLOCKED — Cloudflare Worker existente ainda não recebeu este bundle
- tag: PENDING (`salon-v1.0.0-rc.1`)

## Final-head GitHub evidence

HEAD `b6296ea1b3971d99fd42fdf5dfddc255f983e25c`:

- Salon Vanessa Gates run `36043435345`: PASS
- Monorepo Quality Gates run `36043435539`: PASS
- CodeQL run `36043435058`: PASS
  - `detect-code`: PASS
  - `analyze`: PASS
- GitHub Advanced Security CodeQL check: PASS
  - result: `No new alerts in code changed by this pull request`
- repository hygiene: PASS
- locked install: PASS
- typecheck: PASS
- build: PASS
- production dependency audit: PASS
- PostgreSQL tenant-integrity/booking overlap: PASS
- provisioning/registry idempotency: PASS

The immediately preceding validated live-bundle run `36042410880` also passed all four Salon jobs and exported the exact live bundle after the hosted smoke.

## Browser / accessibility / performance

- Playwright public runtime contract: PASS
- hosted tenant resolution smoke: PASS
- no silent demo fallback in live mode: PASS
- no unapproved prices/services/hours rendered: PASS
- axe WCAG 2 A/AA + 2.1 A/AA serious/critical gate: PASS
- Lighthouse artifact: PASS
  - Performance: `0.96`
  - Accessibility: `1.00`
  - Best Practices: `0.96`
- contrast regression found by axe was corrected without relaxing thresholds.

Validated live artifact:

- workflow run: `36042410880`
- artifact: `salon-live-bundle-36042410880`
- artifact id: `10827091157`
- digest: `sha256:1ca20c1da3328d2cd7910d9b83fa6b7e3a4a2df8d0bd002d46da7f11dc0d9e72`

## Remote Supabase

Hosted Salon migrations observed/applied:

- `20260924171427 booking_tenant_integrity_and_overlap`
- `20260924171445 register_salon_vertical`
- `20260924171608 customer_booking_flow`
- `20260924171655 salon_booking_function_acl_hardening`
- `20260924171842 move_btree_gist_to_extensions`
- `20260924181329 provision_vanessa_salon_rc1_v2`
- `20260924184451 salon_performance_hardening_v1`

Hosted tenant:

- slug: `vanessa-braz`
- vertical: `salon`
- status: `demo`
- bootstrap through canonical `get_storefront_bootstrap(text)`: PASS
- `bookingEnabled=false`
- `mediaPublicationAuthorized=false`

Only confirmed public fields were provisioned: Vanessa Braz / Beleza & Autoestima, Instagram, WhatsApp/phone and `Rua Redenção 88`. City/UF/CEP, hours, commercial e-mail, service catalog, durations, prices, staff and availability remain absent by design.

## Runtime

- public tenant resolution via canonical storefront bootstrap: PASS
- publishable key only in browser: PASS
- deploy-configured tenant slug, not query-string tenant selection: PASS
- live mode fails closed when env/tenant/vertical contract is invalid: PASS
- brand/settings live: PASS
- services live: NOT ENABLED — approved service catalog is still missing
- professionals live: NOT ENABLED — approved staff data is still missing
- availability live: NOT ENABLED — approved schedule/availability is still missing
- booking persistence contract exists and PostgreSQL integrity tests pass, but public booking UI remains intentionally disabled until those approved business inputs exist.

## Auth / CRM / tenancy

- no dedicated Vanessa Supabase project: PASS
- no `vanessa_*` schema/tables: PASS
- canonical tenancy / RLS / shared booking contracts reused: PASS
- cross-tenant FK/integrity constraints and active booking overlap exclusion verified in real PostgreSQL: PASS

## Payments

RC1 deliberately does **not** claim live online payment. No simulated payment is presented as production. Mercado Pago is outside this RC until a real provider/sandbox gate is explicitly approved.

## Media/content

- identifiable-media publication authorization: PENDING_EXTERNAL
- `mediaPublicationAuthorized=false` remains enforced
- confirmed commercial data only: PASS
- city/UF/CEP: PENDING_CONFIRMATION
- opening hours: PENDING_CONFIRMATION
- commercial e-mail: PENDING_CONFIRMATION
- services/prices/staff/availability: PENDING_CONFIRMATION

## Supabase advisors

Security Advisor:

- no new missing-RLS finding was introduced for Salon.
- WARN remains for public/authenticated `SECURITY DEFINER` RPCs. Public storefront/bootstrap/slot functions are deliberate API boundaries and were **not** blindly converted to `SECURITY INVOKER` because that would change their access model without an equivalent authorization design.
- leaked-password protection remains disabled at project level and is an external project hardening item.

Performance Advisor:

- `salon_performance_hardening_v1` added tenant-composite indexes for Salon booking relations.
- `consent_records_read` now uses `(select auth.uid())`; the RLS initplan warning disappeared.
- Salon-specific unindexed FK warnings disappeared. Remaining unindexed-FK notices are Builder `page_revisions`, outside the Salon RC scope.

## Cloudflare / release blocker

Existing Worker: `vanessa-braz`.

Rollback point preserved before release attempt:

- prior deployment id: `96408014-efed-4767-bd98-f9ed18551c52`

The repository now pins production config to Worker name `vanessa-braz`, avoiding creation of a parallel `tupiniquim-salon` Worker.

**BLOCKED_EXTERNAL:** GitHub Actions does not currently expose `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` to this repository. The connected Cloudflare API can create the Static Assets upload session, but the subsequent asset upload requires Cloudflare's temporary upload JWT in an Authorization header; the current connector/tooling does not allow supplying that temporary header. No unsafe workaround was used and the existing Worker was left unchanged.

Therefore:

- Cloudflare HTTPS deploy: BLOCKED_EXTERNAL
- deployed HTTPS smoke: BLOCKED_EXTERNAL
- tag `salon-v1.0.0-rc.1`: BLOCKED
- PR #5 ready-for-review / merge: BLOCKED

## Rollback

- Cloudflare: retain deployment `96408014-efed-4767-bd98-f9ed18551c52` until the new bundle passes deployed HTTPS smoke.
- Database: migrations are forward-only. Corrective changes use a new forward migration; do not rewrite remote history.
- No destructive rollback was performed or required during this RC work.

## Promotion rule

Do not mark PR #5 ready, do not merge, and do not create `salon-v1.0.0-rc.1` until the validated live bundle is deployed to the existing `vanessa-braz` Worker and the HTTPS smoke passes. Missing business data/media authorization must remain omitted or disabled rather than invented.
