# Tupiniquim Toolbox Audit — 2026-09-10

Project: `SitePetPremium`
Working branch: `tupiniquim/saas-foundation`
Application baseline reviewed: `premium-platform-for-pet-shops-350bd`
Target canonical branch: `main`

## Executive status

The repository contains a substantial premium pet-shop frontend with shop, booking, customer account and pet-profile concepts. It is not yet a production multi-tenant SaaS because customer, pet, order and booking state is persisted in the browser and there is no evidenced server-side tenant isolation/auth/RBAC in the reviewed baseline.

## Evidence reviewed

- Application branch and `main` are diverged; the application baseline was 3 commits ahead and 10 commits behind `main` before this hardening branch.
- `src/config/business.ts` implements an Amora Pet white-label configuration with theme, products, services, professionals, coupons, reviews, delivery, booking and feature flags.
- The same configuration contains demonstration contact/location/catalog/rating data and generated media URLs under `image.qwenlm.ai`.
- `src/lib/core.tsx` stores pets, orders, bookings, customer contact/address and loyalty points in `localStorage` under a single key (`amorapet.state.v1`).
- `package.json` defines `dev`, `build` and `typecheck`; no lint/test script was present in the reviewed baseline.

## Confirmed strengths

- Strong vertical domain model for products, grooming/services, professionals, pet profiles and booking.
- Config-driven brand/theme/content.
- E-commerce, cart, checkout, booking and customer-account UX foundations.
- PWA files are present.
- Motion/reduced-motion patterns exist in the frontend stack.

## Confirmed blockers

### P0 — Repository canonicalization

The real application is outside `main`, while governance/presentation work is on `main`. Reconcile through PR without history rewriting.

### P1 — Customer and pet data persistence

Real customer/pet/order/booking data must not use browser `localStorage` as the system of record. Move production data to authenticated server APIs/database with tenant ownership and appropriate retention controls.

### P1 — SaaS tenant isolation and admin

No server-enforced tenant membership/RBAC/database isolation was evidenced in the reviewed baseline. These are mandatory before paid multi-tenant use.

### P1 — Demo data separation

Amora Pet contact/location/catalog/review data must remain explicitly demo-only unless verified for a real tenant. Generated demo images must not be presented as client-owned photography.

### P1 — Automated quality coverage

No project lint/test script was present. CI has been added to execute all existing scripts plus a production dependency audit. Missing lint/unit/integration/E2E suites must be added before release.

### P2 — Controlled media

Move production media away from generated external-host URLs to tenant-owned storage/CDN with access/lifecycle rules.

## Pet SaaS target

Required vertical capabilities:

- Tenant/brand/theme/media administration
- Tutors/customers
- Pet profiles
- Services and professionals
- Booking, reschedule/cancel and reminders
- E-commerce/cart/checkout
- Delivery/pickup
- Loyalty and recurring orders where enabled
- CRM/communication history
- Multi-location and staff permissions

Do not expand the first SaaS release into a veterinary medical-record product without a separate scope/security/legal review.

## Gate matrix

| Gate | State |
| --- | --- |
| Branch reconciliation | IN PROGRESS |
| npm install/ci | NOT RUN HERE — GitHub Actions configured |
| Typecheck | NOT RUN HERE — CI configured |
| Build | NOT RUN HERE — CI configured |
| Lint | MISSING |
| Unit/integration/E2E tests | MISSING |
| Dependency audit | NOT RUN HERE — CI configured |
| CodeQL | NOT RUN HERE — workflow added |
| Server auth/RBAC | MISSING |
| Tenant DB/storage isolation | MISSING |
| Cross-tenant negative tests | MISSING |
| Demo data separation | OPEN |
| Production media ownership | OPEN |

## Release rule

Do not mark production-ready until the missing server-side SaaS/security gates and automated tests have executed evidence.
