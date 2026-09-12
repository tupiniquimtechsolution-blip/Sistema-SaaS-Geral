# Tupiniquim Toolbox Audit — 2026-09-10

Project: `RestauranteSite`
Working branch: `tupiniquim/saas-foundation`
Application baseline reviewed: `premium-gastronomic-restaurant-93bd7`
Target canonical branch: `main`

## Executive status

The repository contains a polished restaurant frontend with digital menu, cart, WhatsApp contact/reservation flows and configurable business/menu/theme data. It is not yet a production multi-tenant SaaS because the reviewed baseline has no evidenced tenant/auth/RBAC/backend isolation layer and still mixes verified business information with explicitly demonstrative values.

## Evidence reviewed

- Application branch and `main` are diverged; the application baseline was 7 commits ahead and 10 commits behind `main` before this hardening branch.
- `src/config/business.ts` centralizes business identity, contacts, address, hours, rating and delivery settings. It explicitly marks some data, such as founding year and delivery fees, as demonstrative/pending confirmation.
- `src/context/CartContext.tsx` persists cart convenience state in browser `localStorage`.
- `src/pages/ContactPage.tsx` validates basic fields client-side and opens a prefilled WhatsApp message; the page explicitly states there is no automatic submission backend.
- `package.json` defines `dev`, `build` and `typecheck`; no lint/test script was present in the reviewed baseline.

## Confirmed strengths

- Business/menu/theme configuration is separated from major UI components.
- Digital-menu and cart foundations exist.
- WhatsApp contact flow is transparent about opening a message rather than pretending server delivery.
- Accessibility/reduced-motion patterns are present in UI helpers.
- SEO assets such as robots/sitemap exist on the application branch.

## Confirmed blockers

### P0 — Repository canonicalization

The real application is outside `main`, while current governance/commercial documentation is on `main`. Reconcile through PR without rewriting history.

### P1 — SaaS tenant/auth backend

No server-enforced tenant ownership, memberships/RBAC, audit log or cross-tenant isolation evidence was found in the reviewed baseline.

### P1 — Reservation/order system of record

WhatsApp is currently the primary handoff for contact/reservation and cart is browser-local. A SaaS release needs persisted reservation/order state where those modules are enabled, with validated server-side mutations and operational statuses.

### P1 — Verified versus demonstrative business data

Values explicitly marked as demonstrative must never be exposed as verified tenant facts. Production onboarding must require provenance/confirmation for commercial claims, fees, reviews and contact data.

### P1 — Automated quality coverage

No lint/test scripts were present. CI now executes locked install, available scripts, typecheck/build and a production dependency audit. Missing test coverage remains a release blocker.

## Restaurant SaaS target

- Tenant/Brand Studio/CMS/Media Manager
- Digital menu with categories, availability, variants/extras and allergen fields
- Daypart/seasonal menus
- Reservations, capacity rules and waitlist-ready data model
- Orders with pickup/delivery where enabled
- WhatsApp/provider adapters
- Customer CRM and consent-aware analytics
- Multi-location/staff permissions
- Events and configurable CTAs
- Plans/entitlements and billing

Integrate with mature POS/KDS/fiscal systems before attempting to replace them in the first SaaS release.

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
| Reservation/order backend | OPEN |
| Demonstrative-data separation | OPEN |

## Release rule

Do not mark production-ready until SaaS isolation, authenticated administration, server-side operational data and automated release gates have evidence.
