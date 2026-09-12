# RestauranteSite

Premium restaurant/bistro experience being migrated into the **Restaurant vertical** of the Tupiniquim Vertical SaaS platform.

## Current product baseline

The application includes configurable business/menu/theme data, a digital menu, cart, WhatsApp contact/reservation flows and local SEO foundations. Some business fields are explicitly demonstrative and must remain separate from verified tenant data.

## SaaS direction

The target architecture uses a shared multi-tenant core for tenancy, identity/RBAC, Brand Studio, CMS, Media Manager, plans/entitlements, billing, integrations, audit and observability. Restaurant-specific modules remain in this vertical without code forks per client.

Read:

- [`docs/SAAS_VERTICAL_PLAN.md`](docs/SAAS_VERTICAL_PLAN.md)
- [`docs/TOOLBOX_AUDIT_2026-09-10.md`](docs/TOOLBOX_AUDIT_2026-09-10.md)
- [`SECURITY.md`](SECURITY.md)
- [Chez Amis Bistrô — proposta comercial](docs/CHEZ_AMIS_BISTRO_PROPOSTA_COMERCIAL.pdf)

## Quality gates

GitHub Actions runs locked dependency installation, available scripts, TypeScript/build checks, production dependency audit and CodeQL. Missing lint/test coverage remains an explicit release blocker.
