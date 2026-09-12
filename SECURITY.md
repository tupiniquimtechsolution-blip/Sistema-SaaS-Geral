# Security Policy

## Supported state

The repository is being hardened from a white-label demo into a production SaaS foundation. Until the production gates documented in `docs/TOOLBOX_AUDIT_2026-09-10.md` are satisfied, demo-only flows must not be represented as production-safe.

## Reporting a vulnerability

Do not open public issues containing secrets, credentials, personal data, exploit payloads, or sensitive tenant information. Report the minimum reproducible information to the repository owner through a private channel.

## Mandatory security rules

- Never commit secrets, privileged API keys, service-role keys, session tokens, private certificates, or production credentials.
- Public clients may only receive public configuration intended for browsers.
- Authentication is not tenant isolation. Every server-side data access must enforce tenant scope and authorization.
- Administrative mutations must be authenticated and authorized server-side.
- Validate untrusted input at server boundaries.
- Apply rate limits to authentication, public forms, webhooks, uploads, and expensive endpoints.
- Store tenant media with explicit ownership and access rules; private assets must not be world-readable.
- Production logs must not contain credentials, full payment data, or unnecessary personal data.
- Security-sensitive actions must produce auditable events.
- Use least privilege for database, storage, CI, integrations, and provider credentials.
- Irreversible migrations require a rollback/backup plan before execution.

## SaaS isolation gate

Production multi-tenancy is blocked until the implementation has, at minimum:

1. a canonical `tenant_id` or equivalent on tenant-owned records;
2. server-side authorization tied to tenant membership;
3. database/storage isolation policies tested with cross-tenant negative cases;
4. role/permission checks for administrative actions;
5. audit logging for privileged mutations.

## Dependency and code scanning

GitHub Actions in `.github/workflows/` run the repository quality gates and CodeQL. Dependabot is configured for npm and GitHub Actions updates. Findings must be triaged by evidence and severity before release.
