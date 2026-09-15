# RestauranteSite — SaaS Vertical Plan

This repository becomes the **Restaurant vertical pack** of the Tupiniquim Vertical SaaS platform.

## Preserve

- premium gastronomic UX and identity;
- configurable business/menu/theme content;
- digital menu and cart experience;
- WhatsApp/contact/reservation conversion paths;
- real-location/SEO content patterns;
- accessibility and premium motion where performant.

## Replace for production

- hard-coded single-business runtime configuration as the tenant source of truth;
- demonstrative values mixed with verified tenant data;
- browser-only operational state where server persistence is required;
- source-code edits for each new client.

## Shared SaaS contracts

Adopt the shared Tenant, Domain, Brand, Theme, CMS, Media, User/Membership/RBAC, Plan/Subscription/Entitlement, Integration, Audit and Usage contracts.

## Restaurant vertical entities

- Menu
- MenuSection
- MenuItem
- Option/Extra
- AvailabilityWindow
- AllergenTag
- Reservation
- ReservationCapacityRule
- WaitlistEntry
- Order
- FulfillmentMethod
- Location
- Event
- Customer/Contact

All tenant-owned records require server-side tenant scoping.

## Delivery phases

1. Canonicalize application + governance on `main`.
2. Convert business/menu/theme config into tenant-managed data contracts.
3. Add auth/membership/RBAC, tenant isolation and audit.
4. Implement Brand Studio, Media Manager and safe CMS sections.
5. Add reservation/order APIs and operational status model.
6. Add plans/entitlements/billing/client admin.
7. Add multi-location, CRM/analytics and provider adapters.
8. Add unit/integration/E2E and cross-tenant tests.

## Definition of Done

A restaurant can onboard without a repository fork and configure its logo, palette, media, contacts, location, hours, menus, reservation/order modules and integrations through authenticated administration, with isolated data and evidenced release gates.
