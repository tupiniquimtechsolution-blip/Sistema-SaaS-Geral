# SitePetPremium

Premium white-label pet-shop experience being migrated into the **Pet Shop vertical** of the Tupiniquim Vertical SaaS platform.

## Current product baseline

The application includes pet profiles, services, booking, product catalog, cart/checkout, customer/account flows and PWA foundations. The current Amora Pet content is a demonstration tenant and must not be treated as a production client dataset without verification.

## SaaS direction

The target architecture uses one shared platform core for tenancy, identity/RBAC, Brand Studio, CMS, Media Manager, plans/entitlements, integrations, audit and observability. Pet-specific modules remain in this vertical without code forks per client.

Read:

- [`docs/SAAS_VERTICAL_PLAN.md`](docs/SAAS_VERTICAL_PLAN.md)
- [`docs/TOOLBOX_AUDIT_2026-09-10.md`](docs/TOOLBOX_AUDIT_2026-09-10.md)
- [`SECURITY.md`](SECURITY.md)
- [Amora Pet — proposta comercial](docs/AMORA_PET_PROPOSTA_COMERCIAL.pdf)

## Quality gates

GitHub Actions runs locked dependency installation, available repository scripts, TypeScript/build gates, production dependency audit and CodeQL. Missing lint/test coverage is tracked as a release blocker rather than being reported as passed.
