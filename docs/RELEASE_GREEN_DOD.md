# RELEASE GREEN — Definition of Done

Release candidate must satisfy all items on the SAME commit SHA.

## Automated
- [ ] repository hygiene PASS
- [ ] locked npm install PASS
- [ ] lint/typecheck/unit/integration PASS
- [ ] all workspace builds PASS, including religious-house
- [ ] production dependency audit PASS
- [ ] CodeQL PASS
- [ ] Salon Vanessa Gates PASS
- [ ] Bakery real Postgres checkout security contract PASS
- [ ] secret/bundle scan PASS
- [ ] tenant/RLS A↔B regression PASS

## Billing
- [x] Stripe server-only provider adapter exists
- [x] plan -> Stripe Price mapping is server-owned
- [x] durable webhook event ledger with unique provider event id
- [x] signed webhook edge boundary; no browser/service_role exposure
- [ ] Stripe Test Mode checkout -> webhook -> subscription/entitlement lifecycle PASS

## Domain / Cloudflare
- [x] fail-closed hostname -> tenant resolver with unknown/unverified/A↔B tests
- [x] Cloudflare-only architecture and Worker configs
- [x] remote smoke rejects temporary preview URLs
- [ ] authenticated durable deployments for release verticals
- [ ] durable HTTPS smoke matrix PASS
- [ ] one authorized custom QA hostname + TLS + tenant resolution PASS
- [ ] rollback proof recorded

## Product / tenant
- [x] Builder + private preview/revision workflow
- [x] AI Tenant Studio architecture/product boundary adopted
- [x] AI capabilities registered in live feature/plan entitlement catalog
- [x] two existing owner accounts granted explicit Platform Master scope; RLS remains enabled
- [x] typed AI operation policy + cross-tenant/entitlement/confirmation tests committed
- [x] controlled component registry committed; arbitrary component types default-denied
- [x] proposal-only tenant AI Edge gateway deployed with JWT verification
- [ ] AI provider server secrets/model configured and authenticated proposal smoke PASS
- [ ] visual/manual editor + AI proposal path verified live against same tenant revision
- [x] database/RLS proof: ordinary tenant actor sees only own tenant and cross-tenant SELECT returns zero
- [ ] tenant owner A cannot inspect/edit tenant B through deployed UI, URL or AI tool path PASS
- [x] database/RLS proof: Platform Master sees all 4 current tenants while RLS remains authority
- [ ] deployed Builder Platform Master tenant selector smoke PASS
- [ ] design/redesign plan gates + protected-field constraint E2E PASS
- [x] authenticated atomic onboarding RPC (tenant + owner + brand + theme + settings + subscription + audit)
- [x] LED removed from release scope
- [x] Templo real source imported without modifying standalone source
- [ ] Templo SaaS Core/CMS adaptation and durable Cloudflare smoke PASS
- [ ] first new tenant provisioned and published through standard no-fork flow

## Convergence
- [x] stale/superseded PRs #3 #6 #12 #14 #16 #17 closed
- [ ] PR #18 same-SHA gates all GREEN and ready for review
- [ ] PR #18 merged into Wave 01
- [ ] PR #2 Wave 01 -> main gates GREEN
- [ ] PR #2 merged into main
- [ ] production smoke + rollback proof
- [ ] release tag/notes created

No unchecked item may be represented as PASS.
