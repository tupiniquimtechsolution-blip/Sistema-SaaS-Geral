# UI Convergence Wave 01

## Goal

Create a unified, premium SaaS design language for Tupiniquim's administrative surfaces while preserving the existing multi-tenant architecture and the identities of public vertical experiences.

## Branch

`feature/ui-saas-convergence-wave-01`

Base line at creation:

`chatgpt/release-green-convergence`

Reference base SHA:

`727577bf0c8ebad99284c2c9dd98b74b8efb0298`

This wave must not be merged into the current Release GREEN line until its own gates pass and the owner deliberately chooses the integration point.

## In scope

- shared visual language/tokens;
- Control Plane shell;
- Builder workspace;
- AI Tenant Studio interaction UX;
- account/settings/onboarding polish;
- Stripe-oriented Billing Center;
- Automations/Integrations UI shell prepared for future n8n;
- responsive/accessibility/performance hardening;
- documentation and regression tests.

## Out of scope

- replacing Supabase;
- replacing Supabase Auth;
- replacing RLS/RBAC/entitlements;
- replacing Stripe with Paddle or Polar;
- installing/exposing n8n editor;
- changing Cloudflare as canonical hosting;
- destructive database changes;
- production DNS changes;
- merging PR #18;
- redesigning public verticals into one generic template.

## Phases

### UI-G0 — Reference and repository audit
- [ ] Read mandatory project docs.
- [ ] Audit existing UI primitives and dependencies.
- [ ] Inspect all five references.
- [ ] Verify licenses for any code intended for reuse.
- [ ] Complete ADOPT/ADAPT/REFERENCE_ONLY/REJECT matrix.

### UI-G1 — Design foundations
- [ ] Establish semantic tokens.
- [ ] Reuse existing shared components where possible.
- [ ] Create a shared UI package only if justified.
- [ ] Establish responsive/accessibility conventions.

### UI-G2 — Application shell
- [ ] Sidebar/topbar/breadcrumb patterns.
- [ ] Mobile navigation.
- [ ] Empty/loading/error states.
- [ ] Shared forms/cards/table/list primitives.

### UI-G3 — Control Plane
- [ ] Modernize `apps/platform`.
- [ ] Preserve all current authorization boundaries.
- [ ] Use real data/contracts or explicit empty states.

### UI-G4 — Builder
- [ ] Modernize `apps/builder`.
- [ ] Preserve revision/publish/rollback behavior.
- [ ] Improve tenant/page/revision context visibility.
- [ ] Maintain cross-tenant denial behavior.

### UI-G5 — AI Tenant Studio
- [ ] Modernize copilot/chat surface.
- [ ] Add clear proposal/result/risk/confirmation states.
- [ ] Preserve typed operation and entitlement flow.
- [ ] Do not add arbitrary code/SQL/shell execution.

### UI-G6 — Account/onboarding/settings
- [ ] Improve onboarding UX without changing atomic provisioning.
- [ ] Improve account/settings hierarchy.
- [ ] Preserve Supabase Auth.

### UI-G7 — Billing Center
- [ ] Current plan.
- [ ] Pricing/upgrade.
- [ ] Usage.
- [ ] Portal entry.
- [ ] Invoice/payment states when supported.
- [ ] Preserve server-owned Stripe Price mapping.
- [ ] Do not claim E2E billing success without real evidence.

### UI-G8 — Automations/Integrations
- [ ] Add shell and management UX.
- [ ] Do not expose n8n editor.
- [ ] Record missing backend capabilities as BACKEND_FOLLOWUP.

### UI-G9 — Hardening
- [ ] Responsive desktop/tablet/mobile.
- [ ] Keyboard/focus/dialog/form accessibility.
- [ ] Reduced motion.
- [ ] Contrast checks.
- [ ] Bundle/dependency review.

### UI-G10 — Gates and handoff
- [ ] Locked install.
- [ ] Lint.
- [ ] Typecheck.
- [ ] Tests.
- [ ] Builds.
- [ ] Playwright where available.
- [ ] Accessibility gates where available.
- [ ] Update docs.
- [ ] Produce screenshots/previews.
- [ ] Final implementation report.
- [ ] Push branch.
- [ ] Keep PR draft until reviewed.

## Security invariants

The following may not regress:

- RLS;
- tenant isolation;
- RBAC;
- entitlements;
- service-role confinement;
- server-side Stripe control;
- AI authorization policy;
- revision/audit flow.

## Backend follow-up format

When a visual feature reveals a missing backend capability, record:

```text
BACKEND_FOLLOWUP:
surface:
capability:
current evidence:
required contract:
security impact:
proposed owner:
blocking UI? yes/no
```

Do not invent schema or production state to make the UI look complete.

## Definition of done

The wave is complete only when the changed surfaces build, applicable tests pass, reference-license decisions are recorded, accessibility has been checked, no security invariant is weakened, and the branch is ready for human review without automatic merge.
