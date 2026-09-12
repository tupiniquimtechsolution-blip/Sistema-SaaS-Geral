# Security Policy

This repository is being migrated from a premium heavy-machinery/parts showroom into a production SaaS vertical.

## Mandatory rules

- Never commit privileged secrets, provider tokens, private keys or production credentials.
- Authentication is not tenant isolation. Tenant-owned server data must be scoped and authorized server-side.
- Administrative changes, quote/proposal changes and lead assignment require authenticated server-side authorization, roles/permissions and audit events.
- Validate untrusted input at server boundaries and rate-limit auth, public lead forms, quote requests, uploads, webhooks and expensive search endpoints.
- Keep private customer, proposal, financing and equipment documents non-public and tenant-scoped.
- Minimize customer/company personal data in logs and analytics.
- Use least privilege for database, storage, CI and external providers.
- Irreversible migrations require a backup/rollback plan.

## B2B production gate

Before paid multi-tenant release require:

1. tenant ownership on catalog, leads, quotes, proposals, users, locations and documents;
2. server-side membership/RBAC;
3. tested database/storage isolation including cross-tenant negative tests;
4. auditable lead assignment and privileged mutations;
5. validation and anti-abuse protection on public quote forms;
6. dependency/code scanning and release evidence.

Quality and CodeQL workflows are under `.github/workflows/`; dependency update automation is under `.github/dependabot.yml`.
