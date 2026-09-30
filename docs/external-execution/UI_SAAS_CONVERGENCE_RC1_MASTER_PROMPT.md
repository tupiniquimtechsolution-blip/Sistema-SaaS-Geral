# UI SaaS Convergence RC1 — Master Execution Prompt

## RC identity

Repository: `tupiniquimtechsolution-blip/Sistema-SaaS-Geral`

RC branch: `rc/ui-saas-convergence-01`

Accepted Wave 0 / source feature head:

`692a17503a89bebc4d2acae435daeae587ab9612`

Source feature branch:

`feature/ui-saas-convergence-wave-01`

Tracking PR:

`#19 — feat(ui): converge SaaS admin experience — Wave 01`

Do not create one branch per phase. Do not create one PR per phase.

UI-G0 is accepted. Execute UI-G1 through UI-G10 in this single RC lineage.

## Core rule

Every phase keeps separate evidence, commits and status, but the implementation remains in one RC.

Continue automatically from one phase to the next when the previous phase is PASS or PARTIAL/non-blocking.

Stop the RC only for a real safety, security, licensing or destructive-change blocker.

Allowed evidence states:

- PASS
- PARTIAL
- BLOCKED
- NOT RUN
- MISSING

Never convert incomplete work into PASS.

## Mandatory architecture

Preserve:

- Supabase/PostgreSQL as data authority.
- Supabase Auth.
- RLS as tenant isolation authority.
- RBAC as user action authorization.
- Entitlements as tenant/product capability authorization.
- SaaS Core.
- Cloudflare Workers / Static Assets as canonical hosting.
- Stripe as SaaS billing provider.
- Builder revision/review/publish/rollback flow.
- AI Tenant Studio proposal/tool model.
- n8n only as a future private orchestration engine.

Never:

- disable/weaken RLS;
- place service_role in browser code;
- trust tenant selector/localStorage/browser state as authorization;
- trust AI output as authorization;
- accept arbitrary Stripe Price IDs from browser;
- replace Stripe with Paddle/Polar;
- replace Supabase Auth;
- migrate the monorepo to Next.js/SvelteKit merely for templates;
- expose n8n editor to tenants;
- run destructive migrations;
- run blind `supabase db push`;
- invent external PASS evidence.

## Required reading

Before implementation read:

- `AGENTS.md`
- `SECURITY.md`
- `README.md`
- `docs/RELEASE_GREEN_DOD.md`
- `docs/REMOTE_MIGRATION_LEDGER.md`
- `docs/AI_TENANT_STUDIO_ARCHITECTURE.md`
- `docs/TENANT_DOMAIN_ARCHITECTURE.md`
- `docs/UI_REFERENCE_ADOPTION.md`
- `docs/UI_CONVERGENCE_WAVE_01.md`
- `docs/external-execution/UI_SAAS_CONVERGENCE_WAVE_01_MASTER_PROMPT.md`
- `docs/UI_SAAS_CONVERGENCE_RC1_EVIDENCE.md`
- relevant app/package/source files.

## UI-G1 — Design foundations

Complete the shared visual foundations.

Target:

- semantic tokens;
- typography;
- spacing;
- radii;
- shadows;
- focus;
- status colors;
- cards;
- forms;
- tables;
- dialogs;
- navigation primitives;
- empty/loading/error states.

Inspect existing reuse first.

Create/evolve `packages/ui` only if actual cross-app duplication justifies it.

Do not introduce a second UI framework just to imitate references.

## UI-G2 — Application shell

Complete the unified SaaS shell.

Target:

- desktop sidebar;
- mobile drawer;
- contextual topbar;
- breadcrumbs;
- tenant/workspace/page context;
- focus entry/return;
- keyboard behavior;
- responsive navigation;
- coherent PT-BR labels.

Preserve the already-corrected mobile drawer behavior.

## UI-G3 — Control Plane

Complete the Control Plane.

Target supported surfaces:

- Visão geral;
- Tenants;
- Verticais;
- SaaS Core;
- Implantações;
- Cobrança;
- Automações;
- Integrações;
- Saúde e segurança;
- Configurações where supported.

Reconcile stale data before showing it as current.

When backend/live evidence is absent, use explicit honest states.

Do not fabricate metrics, billing state, deployment state or external health.

## UI-G4 — Builder

Execute the actual structural Builder redesign.

Target workspace:

```text
Tenant | Página | Revisão | Status | Publicar
------------------------------------------------
Sections/Layers | Live Preview | AI Tenant Studio
------------------------------------------------
Revision | Diff | Audit | Actions
```

Preserve:

- Supabase Auth;
- tenant membership/authorization;
- onboarding;
- Draft Studio;
- pages/sections;
- revisions;
- preview;
- review;
- approval;
- publish;
- rollback;
- RLS.

Do not remove existing behavior merely to achieve the new layout.

## UI-G5 — AI Tenant Studio

Implement substantive proposal-centered UX inspired by the approved reference concepts.

Support clear states:

- idle;
- thinking;
- proposal;
- confirmation required;
- executing;
- completed;
- failed;
- retryable.

Show, when current contracts provide them:

- operation;
- capability;
- permission;
- risk;
- affected fields;
- proposal;
- diff;
- confirmation requirement;
- result.

Do not invent backend fields.

The model never grants authorization.

## UI-G6 — Account / settings / onboarding

Polish:

- sign-in/session states;
- tenant onboarding;
- brand/theme/settings;
- account;
- plan context.

Preserve:

- Supabase Auth;
- `create_tenant_with_owner`.

Do not fake unsupported OAuth/MFA/magic-link/password-recovery functionality.

## UI-G7 — Stripe Billing Center

Move from the current empty state toward the maximum truthful functional UI supported by existing backend contracts.

Target:

- current plan;
- subscription status;
- usage where real;
- upgrade;
- downgrade;
- portal entry;
- invoices;
- payment method;
- cancellation state.

Rules:

- browser sends canonical `planId`, never arbitrary Price ID;
- server resolves approved Stripe Price;
- success redirect never activates plan;
- signed Stripe webhook/server state remains authority;
- no fake invoices/payment methods/subscriptions;
- Stripe Test Mode E2E remains NOT RUN/BLOCKED until actually proven.

If a missing backend contract blocks a functional surface, record `BACKEND_FOLLOWUP` instead of fabricating it.

## UI-G8 — Automations / Integrations

Implement all safe UI and contracts currently supported.

Target:

- automation templates;
- active automations;
- triggers/actions summary;
- enable/disable where authorized;
- run history;
- integration connections;
- provider health;
- errors/retry states.

n8n remains private orchestration.

Do not expose the n8n editor or tenant credentials.

If backend contracts are missing, keep honest partial states and record exact follow-ups.

## UI-G9 — Hardening

Complete:

- desktop/tablet/mobile behavior;
- keyboard navigation;
- focus management;
- modal/drawer behavior;
- screen-reader semantics;
- reduced-motion;
- contrast;
- form labels/errors;
- table overflow;
- loading/error states.

Execute Playwright and axe when browser infrastructure is available.

If browser still cannot run, mark BLOCKED, not PASS.

Do not claim WCAG 2.2 AA without evidence.

## UI-G10 — RC validation

Run the full applicable RC gates.

At minimum:

- locked install;
- `npm run lint`;
- `npm run typecheck`;
- `npm test`;
- `npm run build`;
- app/workspace-specific builds;
- Playwright where available;
- axe where available;
- `npm audit --omit=dev --audit-level=moderate`.

Do not use `npm audit fix --force`.

Do not perform major dependency upgrades automatically merely to obtain a clean audit.

Record dependency findings and proposed triage separately.

## Security regression gates

No RC acceptance if the work regresses:

- tenant isolation;
- RLS;
- RBAC;
- entitlements;
- service-role confinement;
- Stripe server ownership;
- AI policy;
- revision/publish/rollback flow;
- cross-tenant negative behavior;
- Cloudflare-compatible builds.

## Reference policy

Continue using the five approved references only as documented in `docs/UI_REFERENCE_ADOPTION.md`.

No code reuse without verified compatible license.

REF-02/REF-05 remain reference-only where exact source/license provenance is unresolved.

## Commit policy

Use small, phase-oriented commits.

Do not create one giant RC commit.

Examples:

- `feat(ui): complete shared design foundations`
- `feat(platform): complete control plane convergence`
- `feat(builder): implement RC workspace redesign`
- `feat(ai-studio): implement proposal-centered tenant AI UX`
- `feat(account): polish onboarding and settings`
- `feat(billing): connect supported stripe billing experience`
- `feat(automations): complete automation and integration shell`
- `fix(a11y): harden responsive interactions`
- `test(rc): record convergence release candidate gates`
- `docs(rc): publish RC1 evidence`

## Documentation

Maintain:

- `docs/UI_REFERENCE_ADOPTION.md`
- `docs/UI_CONVERGENCE_WAVE_01.md`
- `docs/UI_SAAS_CONVERGENCE_RC1_EVIDENCE.md`

The RC evidence document is the canonical execution ledger for UI-G1 through UI-G10.

## Stop conditions

Stop and report BLOCKED only for a real blocker such as:

- branch/session cannot safely represent the RC lineage;
- local unknown changes before execution;
- license issue preventing planned reuse;
- RLS weakening requirement;
- secret exposure requirement;
- destructive migration requirement;
- cross-tenant regression;
- critical security regression;
- irreconcilable build failure;
- branch divergence invalidating the RC.

Otherwise continue through all phases without asking for a new branch/prompt between them.

## Final push

Push all RC execution commits to the branch authorized for the external session.

If the external tool forces an `arena/...'` execution lane, that lane MUST start from the current `rc/ui-saas-convergence-01` head and must remain a linear descendant. Do not create unrelated history.

Do not merge automatically.

Do not touch `main` or PR #18.

## Final report

Return:

- RC_NAME
- EXECUTION_BRANCH
- RC_BASE_BRANCH
- BASE_SHA
- START_HEAD_SHA
- FINAL_HEAD_SHA
- COMMITS_CREATED
- FILES_CREATED
- FILES_CHANGED
- DEPENDENCIES_ADDED
- DEPENDENCIES_REMOVED
- LICENSES_VERIFIED
- UI_G1_STATUS
- UI_G2_STATUS
- UI_G3_STATUS
- UI_G4_STATUS
- UI_G5_STATUS
- UI_G6_STATUS
- UI_G7_STATUS
- UI_G8_STATUS
- UI_G9_STATUS
- UI_G10_STATUS
- PLATFORM_STATUS
- BUILDER_STATUS
- AI_STUDIO_STATUS
- ACCOUNT_STATUS
- BILLING_STATUS
- AUTOMATIONS_STATUS
- INTEGRATIONS_STATUS
- RESPONSIVE_STATUS
- A11Y_STATUS
- SECURITY_STATUS
- LINT
- TYPECHECK
- UNIT_TESTS
- BUILD
- PLAYWRIGHT
- AXE
- NPM_AUDIT
- BACKEND_FOLLOWUPS
- KNOWN_GAPS
- BLOCKERS
- SCREENSHOTS_OR_PREVIEWS
- ROLLBACK_NOTES
- FINAL_PUSH_STATUS
- RC_RECOMMENDATION
- NEXT_EXACT_ACTION

The objective is one auditable RC containing the full safe implementation of UI-G1 through UI-G10 after accepted UI-G0.
