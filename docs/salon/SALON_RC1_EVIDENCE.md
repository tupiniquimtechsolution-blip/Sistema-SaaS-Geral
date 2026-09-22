# Salon / Vanessa Braz — RC1 Evidence

Target: `salon-v1.0.0-rc.1`  
Status: **IN PROGRESS — NOT YET PROMOTABLE**

Este arquivo é o ledger de evidência do RC. Só registrar `PASS` quando houver execução verificável.

## Candidate

- branch: `chatgpt/integrate-salon-vanessa`
- base: `freebuff/big-master-wave-01-monorepo`
- Supabase: `mmykyzzkcugxunmekwew`
- app: `apps/salon`
- final candidate SHA: PENDING
- RC URL: PENDING
- tag: PENDING (`salon-v1.0.0-rc.1`)

## Evidence already verified

Checkpoint `59db6b5c7f072811f74194723790268c479f78c5`:

- Salon Vanessa Gates run `35785311397`: PASS
- `salon-quality`: PASS
- locked install: PASS
- typecheck: PASS
- build: PASS
- production dependency audit: PASS
- `salon-postgres-integrity`: PASS
- tenant FK/integrity + booking overlap in PostgreSQL real: PASS
- salon registry + Vanessa provisioning idempotency test: PASS

Estas evidências continuam históricas; o HEAD final do RC deverá repetir os gates.

## Remote Supabase

- migration reconciliation: PENDING
- migrations applied for RC: PENDING
- hosted RLS verification: PENDING
- A→B cross-tenant: PENDING
- B→A cross-tenant: PENDING
- booking concurrency hosted proof: PENDING
- Security Advisor: PENDING
- Performance Advisor: PENDING

## Runtime

- public tenant resolution: PENDING
- no silent demo fallback: PENDING
- brand/theme/settings live: PENDING
- services live: PENDING
- professionals live: PENDING
- availability live: PENDING
- booking persistence live: PENDING
- customer/auth flow: PENDING

## Payments

- RC scope decision: PENDING
- Mercado Pago sandbox, if included: PENDING

## Media/content

- media technical gate: source project has prior evidence
- publication authorization imported into Salon: PENDING
- confirmed commercial data only: PENDING
- city/UF/CEP: PENDING_CONFIRMATION
- opening hours: PENDING_CONFIRMATION
- commercial email: PENDING_CONFIRMATION
- services/prices: PENDING_CONFIRMATION unless loaded from approved tenant data

## Release quality

- current final-head Salon Gates: PENDING
- CodeQL: PENDING
- secret/client bundle check: PENDING
- WCAG/a11y: PENDING
- Lighthouse mobile: PENDING
- Cloudflare HTTPS deploy: PENDING
- smoke end-to-end: PENDING
- critical console/network errors: PENDING

## Rollback

PENDING — document exact deploy rollback and database migration rollback/forward-fix strategy before promotion.

## Known issues

PENDING — must be explicit before marking the PR ready.

## Promotion rule

Do not mark PR #5 ready and do not create `salon-v1.0.0-rc.1` while any blocking item in `docs/salon/SALON_RC1_RELEASE_PLAN.md` remains unresolved.
