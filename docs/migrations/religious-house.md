# Migration — Religious House

- Source repository: `tupiniquimtechsolution-blip/TemploCabocloTupinamba-FlechaDourada`
- Source branch: `main`
- Source HEAD prepared for import: `226056e71fdc082d0f92ffa15715889033285f44`
- Destination: `apps/religious-house`
- Import status: `BLOCKED_FREEBUFF_REPOSITORY_ACCESS_TEMPLO`
- Access status (2026-09-12): the repository exists per project owner, but the Freebuff/GitHub App credential of this session cannot access it. Three `git ls-remote` attempts returned `Repository not found` (GitHub's standard response for both missing and unauthorized private repos). Other org repos are accessible with the same credential. This is an access-scope blocker, NOT a missing repository. Action: reconnect the repository in Freebuff or extend Freebuff GitHub App permissions to include this repo.
- Preferred method: `git subtree`
- Layout preservation: REQUIRED
- Source repository deletion: PROHIBITED during Wave 01

## Presentation

Preserve:

`docs/APRESENTACAO_PROJETO.pdf`

Expected destination:

`apps/religious-house/docs/APRESENTACAO_PROJETO.pdf`

## Known SaaS/security documents

- `docs/SAAS_VERTICAL_PLAN.md`
- `docs/TOOLBOX_AUDIT_2026-09-10.md`
- `docs/TOOLBOX_AUDIT_2026-09-08.md`
- `SECURITY.md`

## Sensitive-data warning

Membership, medium/volunteer, attendance and private-service modules can reveal religious participation. Keep them off by default until tenant isolation, RBAC, retention, audit and LGPD gates are implemented. Do not collect private spiritual-consultation narratives by default.

## Post-import gates

- baseline install/typecheck/build/contact-link validation;
- screenshot/layout equivalence;
- PDF presence;
- source SHA confirmation;
- no nested `.git`;
- no secrets/build artifacts;
- preserve confirmed-event/availability anti-hallucination rules;
- map calendar/booking/content to tenant-aware backend contracts.
