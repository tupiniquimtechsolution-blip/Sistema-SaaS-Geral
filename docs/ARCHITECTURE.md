# Architecture — Tupiniquim Vertical SaaS

## Architectural decision

The platform is a **modular multi-tenant monorepo** with independent premium vertical frontends and a shared SaaS Core.

The architecture explicitly avoids two failure modes:

1. independent SaaS codebases per app/vertical that duplicate auth/billing/CMS/security;
2. one generic frontend that destroys the identity of the existing premium sites.

The platform supports an expandable set of verticals plus reusable horizontal SaaS applications (for example CRM).

## Layers

```text
PUBLIC EXPERIENCE / VERTICAL UI
        │
        ▼
VERTICAL ADAPTERS + MODULE COMPOSITION
        │
        ▼
SHARED BUSINESS MODULES
        │
        ▼
SAAS PLATFORM SERVICES
        │
        ▼
DATABASE / AUTH / STORAGE / PROVIDERS
```

## Public experience

Each app owns its visual composition and domain-specific routes.

Examples:

- bakery preserves the Padoca premium experience;
- pet preserves the pet-store/service-booking experience;
- restaurant preserves the gastronomic identity;
- heavy machinery preserves the B2B showroom;
- religious house preserves the cultural/religious identity.

The visual layer reads tenant-aware data through shared contracts instead of hard-coded client values.

## Platform packages

### `saas-core`

Cross-cutting domain primitives, IDs, errors and platform contracts.

### `tenancy`

Tenant resolution, tenant context, domain mapping and lifecycle.

### `auth`

Session/user abstraction.

### `authorization`

Membership, role/permission evaluation and server authorization helpers.

### `brand` / `theme`

Tenant Brand Studio data and semantic design tokens.

### `cms`

Structured pages/sections with safe render contracts.

### `media`

Metadata, upload policies, tenant storage and asset selection.

### `entitlements`

Feature/limit resolution independent of billing provider.

### `billing`

Provider-neutral billing interfaces and subscription synchronization.

### `integrations`

Adapters for WhatsApp, email, maps, analytics, payments, marketplaces and webhooks.

### `audit`

Append-oriented security/operations trail.

### `observability`

Structured telemetry with tenant context and PII minimization.

### `vertical-contracts`

Stable domain contracts needed across vertical implementations without forcing all verticals to install all modules.

## Shared business modules

Modules should be independently entitlement-gated and tenant-aware.

- Commerce
- Orders
- Booking
- CRM/Leads
- Quotes/Proposals
- Events
- Documents
- Loyalty
- Support

## Dependency rule

Preferred direction:

```text
apps → vertical contracts/modules → platform packages
```

Platform packages must not import client/vertical-specific content from apps.

Avoid circular dependencies and avoid importing an entire app into another app.

## Multi-tenancy

Every tenant-owned server record has an explicit tenant boundary.

Security is enforced at multiple layers:

1. hostname/domain resolves tenant;
2. session resolves user;
3. membership establishes allowed tenants;
4. permission establishes allowed action;
5. RLS/policy establishes data boundary;
6. tests prove negative cross-tenant access.

No layer is considered sufficient alone.

## Backend baseline

Preferred when no equivalent backend already exists:

- PostgreSQL / Supabase;
- Supabase Auth;
- RLS;
- Supabase Storage;
- Edge Functions/RPC for privileged/provider operations.

Service-role credentials never reach the browser.

## Frontend integration strategy

Migration follows a strangler pattern:

```text
legacy config/state
      │
      ▼
compatibility adapter
      │
      ▼
new platform contract
      │
      ▼
backend/provider
```

Remove legacy state only after the new path is tested and no longer has consumers.

## Data classes

At minimum classify data as:

- public content;
- tenant operational;
- personal;
- sensitive;
- secret/credential;
- audit/security.

Storage, retention and telemetry rules depend on classification.

## Deployment principle

One codebase may produce multiple deployable surfaces, but tenants are runtime configuration/data, not per-client branches.

Custom domains resolve to tenant configuration.

## Release principle

A green build does not mean SaaS-ready. Release requires evidence of auth, authorization, tenant isolation, operational persistence, storage isolation, tests, security gates and rollback readiness.
