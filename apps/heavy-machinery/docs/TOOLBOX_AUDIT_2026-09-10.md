# Tupiniquim Toolbox Audit — 2026-09-10

Project: `BigMachines`
Working branch: `tupiniquim/saas-foundation`
Application baseline reviewed: `heavy-machinery-digital-showroom-4554c`
Target canonical branch: `main`

## Executive status

The repository contains a substantial premium B2B showroom/catalog application centered on the Lusomaq demonstration/current business configuration. It is not yet a production multi-tenant SaaS. The reviewed baseline has no evidenced server-side tenant isolation, authenticated administration, CRM/quote backend or automated test suite.

## Evidence reviewed

- Application branch and `main` are diverged; the application baseline was 6 commits ahead and 9 commits behind `main` before this hardening branch.
- `src/config/business.ts` centralizes company identity, contacts, salespeople, address, social links, brands and commercial statistics; some fields are explicitly pending confirmation (for example CNPJ), while time-sensitive figures are hard-coded.
- `package.json` defines `dev`, `build` and `typecheck`; no lint/test script was present in the reviewed baseline.
- `docs/checkpoints/PHASE-0.1-FOUNDATION.md` is a historical context-mismatch artifact whose declared target is CRM Tupiniquim, not BigMachines. It must not be used as current BigMachines implementation guidance.

## Confirmed strengths

- Strong B2B catalog/showroom structure with machine/parts data, detail pages and forms.
- Central business and theme configuration.
- Existing client-replacement and asset-source documentation.
- Premium motion stack with Framer Motion/GSAP/Lenis.
- A historical build result inside the misrouted checkpoint reported success for the Vite workspace, but this audit does not reuse that as a current CI result.

## Confirmed blockers

### P0 — Repository canonicalization

The real application lives outside `main`; governance is on `main`. Reconcile via PR without rewriting history.

### P0 — Mis-targeted active-looking checkpoint

`docs/checkpoints/PHASE-0.1-FOUNDATION.md` discusses CRM Tupiniquim/Prisma/NextAuth and explicitly describes a context mismatch. A canonical checkpoint index is being added so agents cannot treat it as current BigMachines guidance.

### P1 — SaaS tenant/auth backend

No server-enforced tenant ownership, membership/RBAC, audit log or cross-tenant isolation evidence was found in the reviewed baseline.

### P1 — B2B operational backend

A SaaS release requires persistent leads, seller assignment, quotes/proposals, customer/company records, documents and workflow statuses rather than only presentation/configuration data.

### P1 — Commercial data provenance

Tenant onboarding must distinguish verified, tenant-supplied and demonstrative data. Time-sensitive claims such as years in market, stock counts and delivery coverage must not silently become permanent hard-coded truth.

### P1 — Automated quality coverage

No lint/test scripts were present. CI now executes locked install, available scripts, typecheck/build and production dependency audit. Missing unit/integration/E2E tests remain a release blocker.

### P2 — External assets

Production logos/media should be imported or referenced according to client authorization and controlled by an asset/media policy; avoid depending on mutable third-party website paths for critical tenant branding.

## Heavy-machinery SaaS target

- Tenant / Brand Studio / CMS / Media Manager
- Machine and parts catalog with advanced search/filtering
- Inventory/location and availability status
- Qualified lead capture and routing
- Seller assignment
- Quote/proposal workflow and document storage
- Trade-in/used evaluation
- Financing integration adapters
- Customer/company CRM
- Service/warranty/support tickets
- Client portal for acquired equipment/documents where enabled
- Plans/entitlements, billing and usage/audit metrics

## Gate matrix

| Gate | State |
| --- | --- |
| Branch reconciliation | IN PROGRESS |
| npm install/ci | NOT RUN HERE — CI configured |
| Typecheck | NOT RUN HERE — CI configured |
| Build | NOT RUN HERE — CI configured |
| Lint | MISSING |
| Unit/integration/E2E tests | MISSING |
| Dependency audit | NOT RUN HERE — CI configured |
| CodeQL | NOT RUN HERE — workflow added |
| Server auth/RBAC | MISSING |
| Tenant DB/storage isolation | MISSING |
| Cross-tenant negative tests | MISSING |
| Lead/quote backend | OPEN |
| Data provenance model | OPEN |
| Historical checkpoint isolation | IN PROGRESS |

## Release rule

Do not mark production-ready until server-side SaaS isolation, authenticated administration, operational B2B workflows and automated release gates have executed evidence.
