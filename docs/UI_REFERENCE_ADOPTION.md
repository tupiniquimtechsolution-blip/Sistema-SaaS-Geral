# UI Reference Adoption

Status: PLANNING / EXECUTION INPUT  
Wave: `feature/ui-saas-convergence-wave-01`

This document is the canonical adoption ledger for the five external visual references selected for the SaaS UI convergence.

## Rules

1. Visual inspiration does not imply framework migration.
2. Reused code requires verified license compatibility.
3. Existing Tupiniquim security and backend contracts prevail.
4. No template can replace Supabase Auth, RLS, SaaS Core, Stripe or Cloudflare architecture.
5. Final UI must look like one Tupiniquim product.
6. Public vertical sites keep their premium identities; convergence focuses on SaaS administration surfaces.

## Reference matrix

| ID | Reference | Intended surface | Initial classification | License gate |
|---|---|---|---|---|
| REF-01 | SvelteKit SaaS Kit — https://21st.dev/@kizivat/templates/sveltekit-saas-kit | auth/account/onboarding/settings/application shell | ADAPT | verify exact reused source |
| REF-02 | Polar Subscription — https://21st.dev/@cult-ui/templates/polar-subscription | pricing/subscription/commercial UX | REFERENCE_ONLY until source/license confirmed | REQUIRED |
| REF-03 | Next Elite — https://21st.dev/@salmanshahriar/templates/next-elite-frontend-focused-next-js-starter | Control Plane/dashboard/navigation | ADAPT | verify exact reused source |
| REF-04 | Paddle Billing Starter — https://21st.dev/@21st/templates/paddle-billing-starter | billing center/pricing/invoices/subscription UX | ADAPT UX ONLY; Stripe backend remains | verify exact reused source |
| REF-05 | Morphic — https://21st.dev/@larsen66/templates/morphic-ai-powered-answer-engine | AI Tenant Studio/chat/generative UI | ADAPT | verify exact reused source |

## Required per-reference audit

For each reference record:

- upstream repository:
- commit/tag inspected:
- license:
- framework:
- UI library:
- CSS system:
- icon system:
- fonts:
- responsive model:
- accessibility notes:
- useful patterns:
- rejected patterns:
- copied files/components:
- transformed files/components:
- new dependencies:
- attribution required:
- security implications:
- final decision: ADOPT / ADAPT / REFERENCE_ONLY / REJECT

## Architectural mappings

### Authentication

Reference UX may be reused. Authentication authority stays Supabase Auth.

### Billing

Reference UX may be reused. Billing authority stays:

`Stripe -> signed webhook -> Supabase subscription state -> entitlements`

No Paddle or Polar billing state should be introduced.

### AI

Reference UX may be reused. AI authorization stays:

`identity -> tenant -> permission -> entitlement -> typed operation -> policy -> proposal -> confirmation -> revision/RLS/audit`

### Automations

Reference UI may introduce management surfaces only. n8n remains a future private orchestration engine and is not a tenant-facing editor.

## Final acceptance

Before closing the wave, replace every unverified item with evidence or mark it explicitly as unresolved. Do not silently assume license compatibility.
