# Planejamento Mestre — Tupiniquim Vertical SaaS

Status: Foundation / migration design
Canonical seed: `PadocaAppPremium`
Verticals in scope:

1. Padaria
2. Pet shop
3. Restaurante
4. Empresa de painéis de LED
5. Máquinas pesadas
6. Templo/casa religiosa

## 1. Product decision

Do not build six unrelated SaaS products. Build one multi-tenant SaaS core with reusable business modules and six vertical packs. Existing sites remain the UX/product references for each vertical and must be migrated without losing their premium visual identity.

## 2. Shared SaaS core

### Tenancy

- `Tenant`
- `TenantDomain`
- `TenantBrand`
- `TenantTheme`
- `TenantSetting`
- `TenantFeature`

Every tenant-owned server record must carry an enforceable tenant scope. Authentication alone is not tenant isolation.

### Identity and access

- User
- Membership
- Role
- Permission
- invitation/onboarding
- session management
- optional MFA-ready architecture
- audit trail for privileged operations

### Brand Studio

Per-tenant editable:

- commercial name
- logos and favicon
- palette tokens
- typography
- radii/shadows/density
- hero and social media
- contact information
- units/hours
- CTA labels

Theme changes must be data/config driven, not source-code forks.

### CMS / Page Builder

Safe structured sections, not arbitrary HTML:

- hero
- rich text
- image/video
- gallery
- products/services
- CTA
- FAQ
- reviews
- map/location
- team
- booking
- catalog
- forms
- events
- social feed references

Sections can be enabled, disabled, reordered and configured per tenant.

### Media Manager

- tenant-owned assets
- public/private visibility
- signed URLs for private media
- image optimization and responsive derivatives
- alt text
- tags/folders
- replacement without broken references
- storage quotas by entitlement
- lifecycle/retention policies

### Plans / entitlements

Do not scatter `if (plan === 'pro')` through the UI. Resolve capabilities through entitlements such as:

- `commerce.enabled`
- `booking.enabled`
- `crm.enabled`
- `locations.max`
- `users.max`
- `storage.bytes`
- `customDomain.enabled`

### Billing

Use a provider abstraction. Billing state must drive entitlements without coupling product logic to one payment provider. Support trial, active, past-due, canceled and recovery flows.

### Integrations

Provider adapters for:

- WhatsApp
- email
- analytics
- maps
- delivery/marketplaces
- payments
- webhooks
- CRM/export

Secrets remain server-side.

### Observability

- tenant-aware errors
- tenant-aware usage metrics
- audit log
- billing/entitlement events
- integration failures
- deployment/version visibility

No unnecessary PII in telemetry.

## 3. Shared business modules

Build reusable modules with vertical configuration:

- Commerce
- Orders
- Catalog
- Booking
- CRM / Leads
- Quotes / Proposals
- Inventory
- Projects
- Events
- Loyalty
- Notifications
- Support tickets
- Documents

## 4. Vertical packs

### Bakery

Core: catalog, product variations/extras, cart, checkout, orders, delivery, pickup, scheduled/custom orders, coupons, WhatsApp, delivery channels, PWA.

Expansion: recurring baskets, bake/production windows, loyalty, customer CRM, stock-lite.

### Pet shop

Core: tutors, pet profiles, services, professionals, booking, reminders, shop, cart, delivery/pickup, loyalty and service history.

Do not turn the first version into a veterinary medical-record system.

### Restaurant

Core: digital menu, availability, allergens, reservations, waitlist-ready model, orders, pickup/delivery, events and WhatsApp.

Expansion: QR-by-table, multi-menu by daypart, CRM, loyalty and integrations with POS/KDS rather than prematurely replacing them.

### LED / visual communication

Core: B2B catalog, technical specification, solution configurator, qualified lead capture, quote/proposal pipeline, site survey, project/install status and support.

Expansion: proposal PDFs, versioning, warranties, serials, maintenance and client portal.

### Heavy machinery

Core: machine/parts catalog, advanced filters, comparison, sales-lead routing, quotes, trade-in/used evaluation, documents, branch inventory and seller assignment.

Expansion: financing integrations, service tickets, warranty, purchased-equipment area and telemetry adapters.

### Temple / religious house

Core: public CMS, calendar, events/giras, booking/attendance windows, gallery, guidance/FAQ, WhatsApp and donations/contributions when explicitly enabled.

Sensitive modules (members, mediums, private attendance data) require stronger RBAC, minimization, retention, audit and LGPD treatment because religious-affiliation information may be sensitive personal data.

## 5. Data architecture baseline

Shared platform entities:

```text
Tenant
TenantDomain
TenantBrand
TenantTheme
TenantSetting
User
Membership
Role
Permission
Plan
Subscription
Entitlement
Feature
TenantFeature
Page
PageSection
MediaAsset
IntegrationConnection
Contact
Lead
Notification
AuditLog
WebhookEndpoint
WebhookDelivery
UsageMetric
```

Vertical tables must use explicit tenant ownership and server-side policies.

## 6. Production security gates

Required before paid multi-tenant production:

- server-side tenant isolation;
- cross-tenant negative tests;
- authenticated admin;
- RBAC/permissions;
- input validation at server boundaries;
- rate limiting for auth/forms/uploads/webhooks;
- storage isolation;
- least-privilege credentials;
- audit log;
- secure headers/CORS/session policy;
- dependency and code scanning;
- backup/rollback strategy;
- privacy/retention/export/delete workflows;
- no demo secrets or fake operational claims.

## 7. Repository migration strategy

### Phase 0 — Canonicalize

For each vertical repository:

1. identify the real application branch;
2. preserve all current work;
3. reconcile it with `main` via PR, never force-push;
4. bring project governance and Toolbox baseline together with the application code;
5. add automated quality/security gates;
6. record evidence-based audit findings.

### Phase 1 — Extract shared contracts

From Padoca and the other sites, define stable interfaces for branding, content, media, tenancy, identity, entitlements and integrations. Do not copy-paste vertical UI into the core.

### Phase 2 — Backend foundation

Implement tenant lifecycle, auth/membership/RBAC, database isolation, audit, media storage and settings APIs.

### Phase 3 — SaaS operations

Implement onboarding, custom domains, plan/entitlements, billing provider abstraction, notifications, usage metrics and Super Admin.

### Phase 4 — Vertical migration

Migrate each site to shared platform modules while retaining its own vertical configuration, media, design and premium motion system.

### Phase 5 — Hardening

Add unit/integration/E2E coverage, cross-tenant security tests, accessibility, performance budgets, backup/restore test and deployment gates.

### Phase 6 — Release

Launch only after quality, security, billing, tenancy and operational gates are evidenced. Demo tenant data must remain clearly separated from client production data.

## 8. Git governance

- `main` is the canonical releasable branch after reconciliation.
- Work through scoped branches and PRs.
- No history rewriting or force-push.
- Every material change includes objective checks and a rollback path when relevant.
- Confirmed defects become small issues with acceptance criteria.
- Do not mark tests or security checks as passed without an executed result.

## 9. Definition of Done for the platform

The overall SaaS project is complete only when:

- all six verticals use the shared tenant/brand/content infrastructure;
- clients can change logo, colors, typography, media, contacts, pages and enabled modules without code forks;
- tenant isolation is tested server-side;
- client admin and Tupiniquim Super Admin are permissioned and audited;
- plans/entitlements and billing lifecycle work;
- production media storage and custom domains work;
- each vertical's main commercial workflow works end-to-end;
- CI includes typecheck/build plus project lint/tests;
- security/dependency scanning is active;
- accessibility and performance gates are documented;
- privacy/LGPD workflows exist where applicable;
- there are no unverified production claims, demo credentials or fake client data presented as real.

## 10. Current execution order

1. Reconcile Padoca application + governance and make `main` canonical.
2. Repeat canonicalization for Pet, Restaurant, BigMachines and Temple.
3. Locate/confirm the LED repository and apply the same baseline.
4. Extract shared SaaS contracts from the proven white-label patterns.
5. Implement backend tenancy/auth/RBAC/media.
6. Implement plans/entitlements/billing/Super Admin.
7. Migrate vertical workflows and harden with E2E/security tests.
