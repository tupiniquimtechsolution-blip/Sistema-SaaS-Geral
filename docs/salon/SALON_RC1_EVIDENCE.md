# Salon / Vanessa Braz — RC1 Evidence

Target: `salon-v1.0.0-rc.1`  
Status: **RC1 TECHNICALLY COMPLETE — DEPLOYED AND HTTPS-SMOKED**

Este arquivo é o ledger de evidência do RC. `PASS` abaixo significa execução verificável. Dados comerciais e mídia ainda não aprovados permanecem explicitamente omitidos/fail-closed e não são tratados como defeito técnico do RC.

## Candidate

- branch: `chatgpt/integrate-salon-vanessa`
- base: `freebuff/big-master-wave-01-monorepo`
- Supabase: `mmykyzzkcugxunmekwew`
- app: `apps/salon`
- deployed source SHA: `cbc47a15e03ca080b87a9e409bf60fe6306634e0`
- PR: `#5` — **não mergear em main nesta etapa**
- RC URL: `https://vanessa-braz.tupiniquim-techsolution.workers.dev`
- planned tag: `salon-v1.0.0-rc.1`

## GitHub quality/security evidence

At the final application candidate lineage:

- Salon Vanessa Gates: PASS
- Monorepo Quality Gates: PASS
- CodeQL workflow: PASS
  - `detect-code`: PASS
  - `analyze`: PASS
- GitHub Advanced Security CodeQL: PASS
  - `No new alerts in code changed by this pull request`
- repository hygiene: PASS
- locked install: PASS
- typecheck: PASS
- build: PASS
- production dependency audit: PASS
- PostgreSQL tenant-integrity/booking overlap: PASS
- provisioning/registry idempotency: PASS

Validated live-bundle run `36042410880` passed all four Salon jobs and exported the exact hosted-mode bundle after Supabase live smoke.

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

### Hosted tenant-isolation / concurrency proof

A temporary hosted QA transaction created tenant A and tenant B and verified:

- valid same-tenant booking: PASS
- tenant A booking with tenant B service: REJECTED by tenant-scoped FK — PASS
- tenant B booking with tenant A service: REJECTED by tenant-scoped FK — PASS
- tenant A service linked to tenant B resource: REJECTED by tenant-scoped FK — PASS
- overlapping active booking for the same resource: REJECTED by exclusion constraint — PASS
- cleanup: PASS; temporary QA tenants were removed and dependent rows cascaded.

No QA tenant was intentionally retained.

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
- hosted A↔B tenant isolation and active booking overlap enforcement: PASS

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

These external content inputs do not unblock unsafe defaults; the deployed RC intentionally hides/disables unavailable capabilities.

## Supabase advisors

Security Advisor:

- no new missing-RLS finding was introduced for Salon.
- WARN remains for public/authenticated `SECURITY DEFINER` RPCs. Public storefront/bootstrap/slot functions are deliberate API boundaries and were **not** blindly converted to `SECURITY INVOKER` because that would change their access model without an equivalent authorization design.
- leaked-password protection remains disabled at project level and is a separate project hardening item.

Performance Advisor:

- `salon_performance_hardening_v1` added tenant-composite indexes for Salon booking relations.
- `consent_records_read` now uses `(select auth.uid())`; the RLS initplan warning disappeared.
- Salon-specific unindexed FK warnings disappeared. Remaining unindexed-FK notices are Builder `page_revisions`, outside the Salon RC scope.

## Cloudflare deploy and HTTPS smoke

Existing Worker reused: `vanessa-braz` — no parallel Salon Worker was created.

Deployment source:

- Cloudflare Build UUID: `b8cbdf24-7b92-40fc-9a08-b3e50ae0edaa`
- source repository: `tupiniquimtechsolution-blip/Sistema-SaaS-Geral`
- source SHA: `cbc47a15e03ca080b87a9e409bf60fe6306634e0`
- build command: `npm ci && npm run build:salon`
- deploy command: `npx wrangler deploy --config apps/salon/wrangler.production.jsonc`
- build outcome: PASS

Active deployment after RC:

- deployment id: `57695d4e-cade-418f-89c9-56652d92af64`
- version id: `cf1776fa-0ba4-4f30-be72-9d1b499826d7`
- traffic: 100%

Rollback preserved before release:

- previous deployment id: `0c5a9742-eb0d-47b8-8ac7-bcd0c6eb4773`
- previous version id: `01874a2d-8593-4c19-be20-6a0bc307f1eb`

Deployed HTTPS smoke:

- technical branch: `automation/salon-deployed-smoke`
- workflow: `Salon Deployed HTTPS Smoke`
- run: `36048305048`
- `curl` reachability: PASS
- Playwright deployed public contract over HTTPS: PASS
- target: `https://vanessa-braz.tupiniquim-techsolution.workers.dev`

After deployment, the temporary Cloudflare trigger for `Sistema-SaaS-Geral` was removed and the original `Vanessa-Braz` trigger was restored. The active RC deployment was left intact.

## Cloudflare trigger isolation hardening

Unrelated monorepo Workers previously used `path_includes: ["*"]`, causing Salon-only changes to trigger Pet/Bakery/MetalArt/Restaurant/Platform builds. Their triggers were narrowed to the corresponding app plus shared packages/root manifests. This removes the observed cross-vertical deployment noise while preserving rebuilds for shared package changes.

## Rollback

- Cloudflare: redeploy previous version `01874a2d-8593-4c19-be20-6a0bc307f1eb` (deployment `0c5a9742-eb0d-47b8-8ac7-bcd0c6eb4773`) if a post-release regression requires rollback.
- Database: migrations are forward-only. Corrective changes use a new forward migration; do not rewrite remote history.
- No destructive database rollback was performed or required during this RC work.

## Promotion rule result

Technical RC promotion gates are now satisfied: code quality, CodeQL/GHAS, hosted Supabase contract, a11y/Lighthouse, Cloudflare deploy and deployed HTTPS smoke all have evidence. Missing business data/media authorization remain external inputs and stay fail-closed rather than invented.
