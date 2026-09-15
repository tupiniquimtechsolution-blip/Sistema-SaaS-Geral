# Migration — Restaurant

- Source repository: `tupiniquimtechsolution-blip/RestauranteSite`
- Source branch: `main`
- Source HEAD prepared for import: `2c01650004fcf86864e51be79f59a9a3b346054b`
- Destination: `apps/restaurant`
- Import status: `PREPARED_NOT_IMPORTED`
- Preferred method: `git subtree`
- Layout preservation: REQUIRED
- Source repository deletion: PROHIBITED during Wave 01

## Presentation

Preserve:

`docs/CHEZ_AMIS_BISTRO_PROPOSTA_COMERCIAL.pdf`

Expected destination:

`apps/restaurant/docs/CHEZ_AMIS_BISTRO_PROPOSTA_COMERCIAL.pdf`

## Known SaaS documents

- `docs/SAAS_VERTICAL_PLAN.md`
- `docs/TOOLBOX_AUDIT_2026-09-10.md`
- `SECURITY.md`
- `CLIENT_REPLACEMENT_GUIDE.md`

## Post-import gates

- baseline install/typecheck/build;
- screenshot/layout equivalence;
- PDF presence;
- source SHA confirmation;
- no nested `.git`;
- separate verified and demonstrative restaurant data;
- document reservation/order flows that need persistent backend state.
