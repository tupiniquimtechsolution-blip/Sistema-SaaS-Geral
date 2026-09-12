# Security Policy

This repository is being migrated from a premium restaurant site/demo into a production SaaS vertical.

## Mandatory rules

- Never commit privileged secrets, provider tokens, private keys or production credentials.
- Authentication is not tenant isolation. Tenant-owned server data must be scoped and authorized server-side.
- Administrative changes require authenticated server-side authorization, roles/permissions and audit events.
- Validate untrusted input at server boundaries and rate-limit auth, reservation, order, public-form, upload and webhook endpoints.
- Keep payment-provider secrets and privileged integration credentials server-side.
- Minimize customer personal data in logs and analytics.
- Use least privilege for database, storage, CI and external providers.
- Irreversible migrations require a backup/rollback plan.

## Restaurant-specific production gate

Browser cart state is acceptable for convenience, but reservations, orders, customer records, payment state and tenant configuration require a reliable server-side system of record before production SaaS use.

Before paid multi-tenant release require:

1. tenant ownership on all tenant records;
2. server-side membership/RBAC;
3. tested database/storage isolation including cross-tenant negative tests;
4. validated reservation/order mutations;
5. auditable privileged actions;
6. dependency/code scanning and release evidence.

Quality and CodeQL workflows are under `.github/workflows/`; dependency update automation is under `.github/dependabot.yml`.
