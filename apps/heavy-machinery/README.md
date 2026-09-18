# BigMachines

Premium heavy-machinery/industrial-parts showroom being migrated into the **Heavy Machinery vertical** of the Tupiniquim Vertical SaaS platform.

## Current product baseline

The application includes a configurable company profile, machine/parts catalog, detail pages, lead/contact forms and premium visual/motion foundations. Current Lusomaq-specific content must be treated according to its verification/provenance status and must not become permanent SaaS defaults.

## SaaS direction

The target architecture uses a shared multi-tenant core for tenancy, identity/RBAC, Brand Studio, CMS, Media Manager, plans/entitlements, billing, CRM/leads, quotes/proposals, integrations, audit and observability. Vertical-specific catalog and B2B workflows remain modular without repository forks per client.

Read:

- [`docs/SAAS_VERTICAL_PLAN.md`](docs/SAAS_VERTICAL_PLAN.md)
- [`docs/TOOLBOX_AUDIT_2026-09-10.md`](docs/TOOLBOX_AUDIT_2026-09-10.md)
- [`docs/checkpoints/README.md`](docs/checkpoints/README.md)
- [`SECURITY.md`](SECURITY.md)

## Quality gates

GitHub Actions runs locked dependency installation, available scripts, TypeScript/build checks, production dependency audit and CodeQL. Missing lint/test coverage remains an explicit release blocker.
