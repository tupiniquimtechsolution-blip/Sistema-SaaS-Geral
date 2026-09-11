# Migration — Religious House

- Source repository: `tupiniquimtechsolution-blip/TemploCabocloTupinamba-FlechaDourada`
- Source branch: `main`
- Source HEAD prepared for import: `226056e71fdc082d0f92ffa15715889033285f44`
- Destination: `apps/religious-house`
- Import status: `PREPARED_NOT_IMPORTED`
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
