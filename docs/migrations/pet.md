# Migration — Pet Shop

- Source repository: `tupiniquimtechsolution-blip/SitePetPremium`
- Source branch: `main`
- Source HEAD prepared for import: `c73fa617c891fe28b6e2a23f93c12db28df74e68`
- Destination: `apps/pet`
- Import status: `PREPARED_NOT_IMPORTED`
- Preferred method: `git subtree`
- Layout preservation: REQUIRED
- Source repository deletion: PROHIBITED during Wave 01

## Presentation

Preserve:

`docs/AMORA_PET_PROPOSTA_COMERCIAL.pdf`

Expected destination:

`apps/pet/docs/AMORA_PET_PROPOSTA_COMERCIAL.pdf`

## Known SaaS documents

- `docs/SAAS_VERTICAL_PLAN.md`
- `docs/TOOLBOX_AUDIT_2026-09-10.md`
- `SECURITY.md`

## Post-import gates

- baseline install/typecheck/build;
- screenshot/layout equivalence;
- PDF byte/path presence;
- source SHA confirmation;
- no nested `.git`;
- no secrets/build artifacts;
- document browser/localStorage operational data that must migrate server-side.
