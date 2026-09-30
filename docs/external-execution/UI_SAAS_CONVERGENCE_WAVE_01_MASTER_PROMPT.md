# UI SaaS Convergence Wave 01 — Master Execution Prompt

## Execution identity

Repository: `tupiniquimtechsolution-blip/Sistema-SaaS-Geral`

Required branch: `feature/ui-saas-convergence-wave-01`

Expected base: `chatgpt/release-green-convergence`

Reference base SHA at wave creation: `727577bf0c8ebad99284c2c9dd98b74b8efb0298`

Do not work directly on `main`, `freebuff/big-master-wave-01-monorepo` or `chatgpt/release-green-convergence`.

Do not merge PR #18. Do not force-push or rewrite history.

## Mission

Execute a controlled UI/UX convergence of the Tupiniquim Vertical SaaS using these five references:

1. https://21st.dev/@kizivat/templates/sveltekit-saas-kit
2. https://21st.dev/@cult-ui/templates/polar-subscription
3. https://21st.dev/@salmanshahriar/templates/next-elite-frontend-focused-next-js-starter
4. https://21st.dev/@21st/templates/paddle-billing-starter
5. https://21st.dev/@larsen66/templates/morphic-ai-powered-answer-engine

These are reference sources, not a mandate to migrate frameworks.

The target must look like one cohesive Tupiniquim product, not five pasted templates.

## Non-negotiable architecture

Preserve the existing platform architecture:

- Cloudflare Workers / Static Assets remains canonical hosting.
- Supabase/PostgreSQL remains canonical data authority.
- Supabase Auth remains authentication.
- RLS remains the isolation authority.
- Existing SaaS Core, tenancy, RBAC and entitlements remain authoritative.
- Builder and Control Plane remain separate surfaces.
- AI Tenant Studio remains tenant-facing and proposal/tool based, not a Dev Studio.
- Stripe remains the SaaS billing provider.
- n8n is only a future private automation/orchestration engine.
- New customer = tenant, never fork.
- No service-role secret in browser code.
- No browser-selected Stripe Price IDs.
- No AI/model output grants authorization.

Do not migrate the monorepo to Next.js or SvelteKit merely to match a reference.

## Mandatory reading before edits

Read at minimum:

- `AGENTS.md`
- `SECURITY.md`
- `README.md`
- `docs/RELEASE_GREEN_DOD.md`
- `docs/AI_TENANT_STUDIO_ARCHITECTURE.md`
- `docs/TENANT_DOMAIN_ARCHITECTURE.md`
- `docs/REMOTE_MIGRATION_LEDGER.md`
- `docs/PLANEJAMENTO_MESTRE_TUPINIQUIM_VERTICAL_SAAS.md` if present
- `docs/UI_REFERENCE_ADOPTION.md`
- `docs/UI_CONVERGENCE_WAVE_01.md`
- `apps/platform/**`
- `apps/builder/**`
- `packages/saas-core/**`
- `packages/tenancy/**`
- `packages/auth/**`
- `packages/database/**`
- `supabase/functions/**`
- `supabase/migrations/**`
- `.github/workflows/**`

If documentation conflicts with executable code or verified remote state, record the divergence. Do not silently rewrite history.

## Reference adoption audit

For each of the five references determine and document:

- source repository;
- exact license of the code actually reused;
- framework;
- component library;
- CSS system;
- design tokens;
- navigation model;
- auth UX;
- billing UX;
- AI/chat UX;
- responsive behavior;
- accessibility characteristics;
- dependencies and bundle impact;
- reusable elements;
- risks.

Classify every adopted pattern as one of:

- ADOPT
- ADAPT
- REFERENCE_ONLY
- REJECT

Do not copy code whose license cannot be verified. In that case use visual/behavioral reference only.

## Target usage of the five references

### SvelteKit SaaS Kit

Use as reference for:

- marketing/application shell;
- login/signup/account UX;
- onboarding;
- settings;
- forms/cards;
- theme patterns;
- clean SaaS hierarchy.

Do not introduce SvelteKit into an app solely to obtain the visual.

### Polar Subscription

Use as visual/UX reference for:

- pricing;
- plan comparison;
- subscription/account views;
- upgrade/downgrade;
- commercial CTA flow.

Do not introduce Polar as billing authority.

Translate billing UX into:

`Tupiniquim UI -> StripeBillingProvider -> subscriptions -> entitlements`

### Next Elite

Use strongly as reference for:

- dashboard shell;
- sidebar/topbar;
- breadcrumbs;
- mobile navigation;
- account/settings;
- dashboard cards;
- table/list/empty-state patterns;
- accessible application structure.

Do not replace Supabase Auth.

### Paddle Billing Starter

Use as primary billing UI reference:

- current plan;
- pricing cards;
- checkout entry;
- renewal/status;
- invoices;
- payment method;
- cancellation;
- upgrade/downgrade.

Do not add Paddle backend, secrets, webhooks, SDK authority or subscription state.

Use existing Stripe contracts.

### Morphic

Use as reference for AI Tenant Studio:

- chat/composer;
- streamed/pending states;
- generative result cards;
- tool/result presentation;
- history;
- retry/error UX;
- progressive disclosure;
- contextual actions;
- mobile chat experience.

Do not import Morphic as a parallel application or authorization layer.

Existing path remains:

`identity -> tenant -> RBAC -> entitlement -> typed operation -> risk -> proposal -> confirmation -> revision -> RLS -> audit`

## Design system

Inspect for an existing shared UI package first.

Only create `packages/ui` if there is a real cross-app benefit and no equivalent existing solution.

Prefer semantic tokens:

- background
- foreground
- surface
- surface-muted
- border
- primary
- secondary
- accent
- success
- warning
- danger
- info
- radius
- shadow
- spacing
- typography

Do not hard-code tenant identities into the administrative design system.

## Control Plane

Modernize `apps/platform` as a premium administrative SaaS shell.

Target areas when supported by existing data/contracts:

- overview;
- tenants;
- verticals;
- subscription state;
- users;
- integrations;
- automations;
- billing;
- activity/audit;
- health/security;
- settings.

Do not invent production data. Use honest empty states where backend support is absent.

## Builder / AI Tenant Studio

Modernize `apps/builder` without removing existing behavior:

- login;
- tenant selector;
- Platform Master path;
- onboarding;
- brand/theme/settings;
- entitlements;
- Draft Studio;
- pages/sections;
- revisions;
- preview;
- review/approval;
- publish;
- rollback;
- AI Copilot.

Preferred workspace concept:

```text
Tenant | Page | Revision | Status | Publish
------------------------------------------------
Sections/Layers | Live Preview | AI Copilot
------------------------------------------------
Revision | Diff | Audit | Actions
```

Use Morphic-style interaction patterns for AI, not unrestricted code generation.

## Billing Center

Build/refactor a Stripe-oriented tenant billing UX around existing contracts.

Target information architecture:

- Billing Overview
- Current Plan
- Usage
- Upgrade
- Payment Method
- Invoices
- Manage Subscription

Respect existing `billing.read` / `billing.write` semantics.

Browser sends a canonical plan id, never an arbitrary Stripe Price ID.

Checkout success URL never activates paid entitlements. Server-side Stripe webhook state remains authoritative.

Do not claim Stripe Test Mode E2E PASS unless actually executed and evidenced.

## n8n preparation

This wave may create the UI shell for future Automations and Integrations, but must not expose the n8n editor or install a new automation authority.

Target UI concepts:

- Automation templates
- Active automations
- Trigger/action summary
- Enable/disable
- Last run
- Run history
- Integration health
- Configuration
- Error/retry state

Backend gaps must be recorded as `BACKEND_FOLLOWUP`.

## Responsive and accessibility

Require:

- desktop/tablet/mobile behavior;
- keyboard navigation;
- visible focus;
- semantic HTML;
- labels and form error associations;
- dialog focus handling;
- appropriate ARIA;
- reduced-motion compatibility;
- usable contrast.

Target WCAG 2.2 AA where practical.

## Performance

Avoid duplicated UI frameworks and oversized dependencies.

Prefer:

- existing dependencies;
- tree-shakable packages;
- lazy loading/code splitting;
- semantic CSS tokens;
- optimized assets;
- small reusable components.

Before adding a dependency record:

- reason;
- license;
- maintenance status;
- bundle impact;
- alternatives;
- existing equivalent.

## Backend boundary

This is primarily a UI/UX wave.

Do not create migrations just to satisfy a layout.

If a needed backend capability does not exist, document it as `BACKEND_FOLLOWUP`.

Never:

- apply `supabase/migrations/0001_multi_tenant_schema.sql`;
- run blind `supabase db push`;
- weaken RLS;
- modify production DNS;
- expose secrets;
- invent external deployment PASS;
- alter Stripe production state.

## Phases

- UI-G0: audit references, licenses, current UI architecture.
- UI-G1: semantic tokens and shared primitives.
- UI-G2: application shell/navigation.
- UI-G3: Control Plane redesign.
- UI-G4: Builder workspace redesign.
- UI-G5: AI Tenant Studio UX.
- UI-G6: account/settings/onboarding polish.
- UI-G7: Stripe-oriented Billing Center.
- UI-G8: Automations/Integrations shell prepared for n8n.
- UI-G9: responsive/accessibility hardening.
- UI-G10: performance, tests and documentation.

Execute incrementally. Do not stop at planning if the repository permits safe implementation.

## Required gates

At minimum run the applicable root/app gates:

- locked dependency install;
- lint;
- typecheck;
- unit/integration tests;
- builds;
- Playwright where present;
- accessibility checks where present.

Do not remove or weaken existing gates to make the redesign pass.

Regression safety must include:

- Supabase Auth;
- tenant isolation;
- RBAC;
- entitlements;
- Builder revision/publish flow;
- AI proposal flow;
- Stripe contracts;
- Cloudflare-compatible builds.

## Commit discipline

Use small, auditable commits such as:

- `docs(ui): audit template references`
- `feat(ui): add semantic design primitives`
- `feat(platform): modernize control plane shell`
- `feat(builder): modernize builder workspace`
- `feat(ai-studio): improve copilot experience`
- `feat(billing): add stripe-oriented billing center`
- `feat(automations): add automation management shell`
- `test(ui): add accessibility and responsive coverage`
- `docs(ui): record adoption and license decisions`

Do not create one giant commit.

## Stop conditions

Stop and report BLOCKED rather than bypassing controls if:

- the working branch is not `feature/ui-saas-convergence-wave-01`;
- its base is not traceable to the expected release line;
- a license forbids or makes reuse unclear;
- a requested UI requires RLS weakening;
- a secret would need to enter browser code;
- cross-tenant tests regress;
- implementation would require destructive DB work;
- external release evidence is required but unavailable.

## Final report

Return:

- BRANCH
- BASE_SHA
- HEAD_SHA
- FILES_CREATED
- FILES_CHANGED
- DEPENDENCIES_ADDED
- LICENSES_VERIFIED
- ADOPTED_PATTERNS
- ADAPTED_PATTERNS
- REFERENCE_ONLY_PATTERNS
- REJECTED_PATTERNS
- PLATFORM_STATUS
- BUILDER_STATUS
- AI_STUDIO_STATUS
- BILLING_UI_STATUS
- AUTOMATIONS_UI_STATUS
- TESTS_RUN
- TEST_RESULTS
- A11Y_RESULTS
- BUILD_RESULTS
- KNOWN_GAPS
- BACKEND_FOLLOWUPS
- SCREENSHOTS_OR_PREVIEWS
- SECURITY_IMPACT
- REGRESSION_RISK
- NEXT_EXACT_ACTION

Push the feature branch when complete. Do not merge it automatically.
