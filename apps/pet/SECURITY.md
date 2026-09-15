# Security Policy

This project is being migrated from a premium white-label demo into a production SaaS vertical. Demo behavior must not be represented as production-safe until the gates below are evidenced.

## Mandatory rules

- Never commit privileged secrets, service-role keys, tokens, private certificates or production credentials.
- Authentication alone is not tenant isolation; all tenant-owned server data must be authorized and scoped server-side.
- Administrative changes require authenticated server-side authorization and auditable roles/permissions.
- Validate untrusted input at server boundaries and rate-limit auth, booking, checkout, public forms, uploads and webhooks.
- Store private tenant/customer/pet media with explicit ownership and non-public access rules.
- Production logs and analytics must minimize personal data.
- Use least privilege for database, storage, CI and external integrations.
- Irreversible migrations require backup/rollback preparation.

## Pet-specific privacy

Pet profiles can contain owner/customer personal data. Do not treat browser `localStorage` as a secure customer database. Production storage, retention, export and deletion rules must be implemented before onboarding real clients.

## SaaS production gate

Before paid multi-tenant production, require:

1. canonical tenant ownership on tenant data;
2. membership/RBAC enforced server-side;
3. tested database/storage isolation, including cross-tenant negative cases;
4. secure administration and audit logging;
5. production dependency/code scanning and release evidence.

Quality, dependency and CodeQL workflows live under `.github/workflows/` and Dependabot is configured under `.github/dependabot.yml`.
