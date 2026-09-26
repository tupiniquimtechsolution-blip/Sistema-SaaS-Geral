# Religious House — Canonical SaaS Reconciliation Contract

Status: **CANONICAL CONTRACT FOR IMPORT — UI IMPORT NOT YET COMPLETE**

Source application: `tupiniquimtechsolution-blip/TemploCabocloTupinamba-FlechaDourada` (`main`).
Target application: `apps/religious-house` in `Sistema-SaaS-Geral`.

## Non-negotiable architecture

The source site's visual experience may be preserved, but production authority belongs to the shared SaaS platform. Do not introduce a second Supabase project, a `temple_*` or tenant-specific schema, a parallel auth system, or a repository fork per religious house.

The target must reuse the canonical shared contracts for:

- tenant/domain resolution;
- brand/theme/settings;
- CMS pages/sections and media assets;
- auth, memberships, roles and permissions;
- subscriptions/entitlements;
- audit/usage;
- locations;
- services;
- events;
- availability rules/date overrides;
- bookings;
- public religious details already present in the shared database model.

## Source-to-SaaS mapping

| Standalone source | Canonical SaaS authority | Migration rule |
| --- | --- | --- |
| `templeConfig.name`, short name, phone, Instagram, address | tenant + brand + public tenant settings + location | Move to tenant-managed data. No source-code edits per customer. |
| hard-coded logo/media/Drive URLs | `media_assets` / CMS media references | Keep only media with explicit publication authorization. |
| `giras` / `GiraEvent` | shared `events` plus religious public details where applicable | Tenant-scoped, public only when explicitly publishable. |
| `services` / `ServiceDef` | shared public services | Preserve labels/descriptions; pricing and schedules only from approved tenant data. |
| `mariaMulamboWeeklyRule`, `bookingAvailability` | shared `availability_rules` | Do not invent slots. Empty/unconfirmed availability stays fail-closed. |
| `bookingDateOverrides`, `blockedDates` | shared `date_overrides` | Tenant-scoped exceptions only. |
| `BookingPayload` | shared booking flow / `bookings` | Persistence must happen server-side before visual confirmation. |
| gallery | CMS/media contracts | No identifiable religious media without publication consent. |
| testimonials | CMS content | Only verified/authorized content; never synthesize social proof. |
| route-specific SEO | CMS/public settings | Tenant-configurable metadata with safe defaults. |

## Sensitive-data boundary

Religious affiliation is sensitive personal data. Optional member, medium/volunteer, attendance, scale/assignment and consultation-related modules remain **off by default** and require explicit entitlement, server-side RBAC, tenant isolation, minimization, retention controls and auditable privileged access.

The public site must not expose or infer:

- attendance/member rosters;
- private spiritual consultation narratives;
- internal development/scale information not explicitly public;
- consent records;
- private booking notes;
- unpublished media.

Analytics must not include sensitive attendance or consultation content.

## Public runtime contract

Production runtime resolves the tenant by canonical domain/slug infrastructure and reads only public brand/theme/settings/content. There is no silent fallback to the standalone `templeConfig` in production.

Required fail-closed states:

1. unknown tenant/domain -> error/not-found, not demo content;
2. unavailable booking service/slots -> contact/availability-pending state, not fabricated schedule;
3. media without publication authorization -> omitted;
4. sensitive modules without entitlement -> unavailable and not queried by public UI.

## Existing source facts that may be migrated only as approved tenant seed data

The standalone source currently contains house-specific name/contact/address, Wednesday consultation window, services, leadership/history copy, testimonials and media links. These are **seed inputs**, not reusable product defaults. They must never become defaults for a new tenant.

## UI preservation

Preserve, subject to accessibility and security gates:

- premium visual identity;
- Home / Quem Somos / Calendário / Atendimentos / Galeria / Contato experience;
- reduced-motion support;
- reveal/parallax behavior where it does not harm accessibility/performance;
- calendar/event experience;
- WhatsApp/location flows.

Do not preserve source-code coupling to one religious house.

## Import sequence

1. Create complete `apps/religious-house` workspace in one buildable change.
2. Port visual components/styles from the standalone source without changing the canonical data authority.
3. Add a SaaS adapter that maps public bootstrap + event/service/availability data into UI view models.
4. Replace local booking authority with the shared customer booking flow.
5. Register the vertical using the existing vertical registry/onboarding contracts; do not create a parallel provisioning path.
6. Add tenant-isolation and public-data negative tests.
7. Add typecheck/build/browser/a11y/deployed smoke gates.
8. Add the durable Worker to the canonical Cloudflare smoke matrix only after a real deployment exists.

## Definition of Done

A second religious house can onboard without a repository fork and configure its brand, palette, public media, contacts, location, content, calendar, services and enabled modules through shared SaaS contracts. Public runtime contains no tenant-specific structural branch, private religious data is not exposed, sensitive modules are off by default, booking is server-authoritative, and all release/deploy gates have reproducible evidence.
