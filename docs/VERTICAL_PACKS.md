# Vertical Packs

Vertical packs keep domain-specific workflows and premium UX while consuming the shared SaaS Core.

## Common contract

Each vertical declares:

- `verticalId`;
- display name;
- default theme tokens;
- default page/section composition;
- supported modules;
- onboarding fields;
- default entitlements;
- domain-specific entities;
- admin navigation contributions;
- optional integrations;
- feature flags;
- privacy classification notes.

## Horizontal apps

The platform can also host shared SaaS applications that are sold/contracted across tenants, for example CRM. Horizontal apps must consume the same SaaS Core contracts (tenant, auth, membership, RBAC, entitlements, billing, audit, integrations, observability) without creating per-client forks.

CRM Tupiniquim is the first confirmed horizontal app. Its integration strategy and boundaries are documented in `docs/integrations/CRM_TUPINIQUIM_SAAS_INTEGRATION.md`.

## Bakery

Primary modules:

- catalog;
- commerce;
- orders;
- delivery/pickup;
- scheduled/custom orders;
- coupons;
- external ordering channels;
- PWA.

Premium UX to preserve: PadocaAppPremium layout, bread/motion experience, storefront/cart/checkout journey.

## Pet Shop

Primary modules:

- customers/tutors;
- pets;
- services;
- professionals;
- booking;
- commerce/orders;
- loyalty;
- service history.

Veterinary medical records are explicitly outside the default vertical scope.

## Restaurant

Primary modules:

- menus;
- item options/extras;
- availability/dayparts;
- allergens;
- reservations;
- waitlist-ready model;
- commerce/orders;
- events.

Integrate with mature POS/KDS/fiscal providers instead of prematurely replacing them.

## LED / Visual Communication

Primary modules:

- B2B solutions catalog;
- technical specification;
- solution configuration request;
- site survey;
- CRM leads;
- quotes/proposals;
- projects/installations;
- warranties/support.

Source repository is currently blocked. Do not create fake business content.

## Heavy Machinery

Primary modules:

- equipment/parts catalog;
- inventory/branch;
- advanced search/filtering;
- seller routing;
- leads;
- quotes/proposals;
- trade-in;
- financing adapters;
- documents;
- service/warranty/support.

## Religious House

Primary modules:

- public CMS;
- services;
- calendar/events/giras;
- recurrence/availability;
- booking requests;
- gallery;
- announcements;
- WhatsApp/contact;
- optional contributions.

Sensitive opt-in modules:

- members;
- mediums/volunteers;
- assignments/scales;
- attendance.

These require separate privacy/security gates and must be disabled by default.

## Modular rule

A vertical does not receive every module automatically. Composition depends on domain relevance and tenant entitlements.

Do not create empty menu items or dead code for modules a vertical does not support.

## MetalArt

Vertical principal de design/arte/metal. Définir em docs/migrations/metalart.md e preservar layout e processos comerciais reais.

Módulos futuros possíveis:

- lead capture
- service catalog
- quotes
- projects
- commercial pipeline
- scheduling quando aplicável
- media/gallery
- contact attribution
- CRM integration

Não inventar preços, resultados, depoimentos ou dados comerciais.
