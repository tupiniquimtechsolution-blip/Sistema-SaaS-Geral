# SitePetPremium — SaaS Vertical Plan

This repository becomes the **Pet Shop vertical pack** of the Tupiniquim Vertical SaaS platform.

## Preserve

- premium pet-shop UX and visual identity;
- configurable brand/theme/content;
- catalog/product detail/cart/checkout;
- pet profiles;
- grooming/service catalog;
- professional selection and booking;
- PWA/mobile experience.

## Replace for production

- browser-only customer/pet/order/booking persistence;
- single hard-coded demo business configuration as the runtime source of truth;
- unverified demo reviews/contacts/assets;
- direct source-code edits for every client.

## Shared SaaS contracts to adopt

- Tenant / TenantDomain / TenantBrand / TenantTheme
- User / Membership / Role / Permission
- Page / PageSection / MediaAsset
- Plan / Subscription / Entitlement
- IntegrationConnection / Notification / AuditLog
- Contact / Lead / UsageMetric

## Pet vertical entities

- Customer/Tutor
- Pet
- Service
- Professional
- Booking
- Product/Variant
- Cart/Order
- LoyaltyAccount
- RecurringOrder (optional entitlement)
- Location

Every tenant-owned entity must be scoped and authorized server-side.

## Delivery phases

1. Canonicalize application + governance on `main`.
2. Replace demo-only state with server API/data contracts.
3. Add tenant/auth/membership/RBAC and storage isolation.
4. Add Brand Studio + Media Manager + safe CMS sections.
5. Add entitlements/billing and client admin.
6. Migrate booking, pet profiles, commerce and loyalty to the shared backend.
7. Add automated test coverage, including cross-tenant negative cases.
8. Release a demo tenant and a production-tenant onboarding path without code forks.

## Definition of Done

A new pet shop can be provisioned without cloning the repository and can independently configure logo, palette, typography, media, contacts, units, services, professionals, products and enabled modules. Its data is isolated from every other tenant and its admin permissions are enforced and audited server-side.
