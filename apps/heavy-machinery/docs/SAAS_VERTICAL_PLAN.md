# BigMachines — SaaS Vertical Plan

This repository becomes the **Heavy Machinery / Industrial Equipment vertical pack** of the Tupiniquim Vertical SaaS platform.

## Preserve

- premium digital showroom/catalog UX;
- machine/parts detail presentation;
- configurable business and theme data;
- seller/contact conversion flows;
- source/replacement documentation;
- premium motion only where it does not hurt performance or accessibility.

## Replace for production

- hard-coded single-company runtime data as the tenant source of truth;
- mutable external branding/media URLs as critical production dependencies;
- source-code edits for each new dealer/distributor;
- presentation-only lead/quote flows where persistent SaaS records are required.

## Shared SaaS contracts

Adopt shared Tenant, Domain, Brand, Theme, CMS, Media, User/Membership/RBAC, Plan/Subscription/Entitlement, Integration, Audit and Usage contracts.

## Heavy-machinery vertical entities

- Company/Customer
- Contact
- Seller
- Location/Branch
- EquipmentCategory
- Equipment/Machine
- Part/Product
- InventoryItem
- Lead
- LeadAssignment
- Quote
- QuoteLine
- ProposalVersion
- TradeInRequest
- FinancingRequest
- Document
- ServiceTicket
- WarrantyRecord

All tenant-owned records require explicit tenant ownership and server-side authorization.

## Delivery phases

1. Canonicalize application + governance on `main`.
2. Convert business/theme/catalog data into tenant-managed contracts.
3. Add auth/membership/RBAC, tenant database/storage isolation and audit.
4. Implement Brand Studio, Media Manager and safe CMS sections.
5. Implement persistent CRM/leads, routing, quotes/proposals and document flows.
6. Add plans/entitlements/billing/client admin and Super Admin integration.
7. Add inventory/location, trade-in, financing and support modules as entitlements.
8. Add unit/integration/E2E, security and cross-tenant negative coverage.

## Definition of Done

A dealer/distributor can onboard without cloning the repository and independently configure brand, palette, media, contacts, branches, sellers, catalog, lead forms and enabled modules. Customer/company, lead, quote and document data is isolated, permissioned and audited server-side, and release gates have reproducible evidence.
