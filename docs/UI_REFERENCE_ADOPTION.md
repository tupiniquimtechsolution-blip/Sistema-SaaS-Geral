# UI Reference Adoption — Wave 01

Status: **AUDITED / IMPLEMENTATION IN PROGRESS**
Execution branch: `arena/01a0f263-sistema-saas-geral`
Start HEAD: `6ce5ac2b7185aaf698ff8c97264c06ab9a68372d`
Audit date: 2026-09-30

The references inform visual patterns only. No upstream code/assets have been copied. The repository's current React/Vite stack, Supabase Auth, RLS, SaaS Core, Stripe contracts and Cloudflare hosting remain authoritative.

## Reference audit

| ID / URL | Source / inspected revision | License evidence | Stack / UI / styling | Patterns observed and disposition |
|---|---|---|---|---|
| REF-01 [SvelteKit SaaS Kit](https://21st.dev/@kizivat/templates/sveltekit-saas-kit) | `kizivat/saas-kit`, `b953870`; listing inspected 2026-09-30 | MIT stated by 21st listing and linked LICENSE at pinned revision. License verified at listing level; no source downloaded or reused. | SvelteKit, Supabase, shadcn-svelte per listing; CSS/font/icon details not independently verified. | ADAPT: account/auth hierarchy, forms, spacing, cards and clear CTA. Supabase Auth only; no Svelte dependencies. Responsive/accessibility details not independently tested. |
| REF-02 [Polar Subscription](https://21st.dev/@cult-ui/templates/polar-subscription) | Listing by cult/ui; source commit/tag not exposed by inspected listing | Exact project code license/source commit not established; **license unverified**. | Listing describes Next.js, Supabase and Polar. Preview shows marketing/pricing sections; component library/CSS/icons/fonts not verified. | REFERENCE_ONLY: pricing comparison and subscription story only. No Polar SDK, code, pricing, testimonials, claims, or checkout URLs reused. |
| REF-03 [Next Elite](https://21st.dev/@salmanshahriar/templates/next-elite-frontend-focused-next-js-starter) | `salmanshahriar/Next-Elite`, `bf1a302`; listing inspected 2026-09-30 | MIT stated by listing and linked LICENSE at pinned revision. No code reused. | Next.js 16, React 19, TypeScript, Tailwind v4, shadcn, Better Auth, RBAC per listing. | ADAPT: dashboard shell, sidebar/topbar, navigation, responsive affordances and component hierarchy. Reject Next.js/Better Auth/Vercel and dependency adoption. Accessibility claims not independently measured. |
| REF-04 [Paddle Billing Starter](https://21st.dev/@21st/templates/paddle-billing-starter) | `PaddleHQ/paddle-nextjs-starter-kit`, `a8c5168`; listing inspected 2026-09-30 | Apache-2.0 stated and linked by 21st listing at pinned revision. No code reused. | Next.js, Supabase, Tailwind, shadcn and Paddle per listing. | ADAPT UX ONLY: current-plan/pricing/subscription/invoice presentation concepts. Reject Paddle, external Price IDs, SDK/webhook and checkout code. Backend stays server-owned Stripe mapping + signed webhook + entitlements. |
| REF-05 [Morphic](https://21st.dev/@larsen66/templates/morphic-ai-powered-answer-engine) | Listing attributed to 21st Indexer; source repository and commit/tag not disclosed in inspected page | License/source not established; **license unverified**. | Described as AI answer engine with generative UI; framework, component library, CSS, icons/fonts and dependencies not verified. | REFERENCE_ONLY: chat/composer/progressive disclosure/result presentation at concept level. No app/code/model/tools imported. Preserve typed proposal, risk policy, confirmation, revision, RLS and audit flow. |

## Design/system and behavior audit

- **Navigation/dashboard:** REF-03 listing describes reusable dashboard components; use a compact persistent desktop rail, contextual header/breadcrumb and responsive drawer, without adopting its framework or auth.
- **Auth/account:** REF-01 listing covers sign-up, OAuth, verification and account; only information hierarchy/forms are useful. Those auth capabilities are not assumed to exist in this repo.
- **Billing:** REF-02 has pricing/subscription marketing structure; REF-04 surfaces localized plan cards and checkout. Recreate only neutral UX concepts against current plans/contracts; never copy sample prices/claims/IDs or provider behavior.
- **AI:** REF-05 exposes a generative answer-engine concept, but source details are insufficient for code/security review. Keep existing AI authorization boundary, proposal-only semantics and risk/confirmation communication.
- **Accessibility/responsive:** Reference listing content is not a substitute for testing. No template accessibility claim is treated as evidence. Implementation uses semantic landmarks, visible focus, keyboard-operable links/buttons, responsive CSS and reduced-motion preference.
- **Dependencies/icons/fonts/assets:** none adopted; no dependency or bundle impact. System font stack and lightweight text glyph navigation avoid icon/font additions.
- **Security:** no upstream runtime or third-party checkout/auth/AI endpoint added. Templates are not architectural authority.
- **Attribution:** no upstream code/assets copied; no attribution obligation inferred. This ledger records source provenance and license state.

## Pattern classification

- **ADOPT:** semantic landmarks, visible focus, responsive navigation state, clear status hierarchy, concise card/table patterns implemented with existing React/CSS.
- **ADAPT:** REF-01 form/account hierarchy; REF-03 shell/navigation/dashboard; REF-04 billing information architecture; REF-05 proposal/chat interaction ideas — all independently implemented in existing stack and only where current contracts support them.
- **REFERENCE_ONLY:** REF-02 Polar implementation (license unresolved); REF-05 implementation/code (repository/license/dependencies inaccessible/unverified); all provider-specific behavior and sample claims/prices from templates.
- **REJECT:** framework/auth/provider/hosting changes (SvelteKit, Next.js, Better Auth, Polar, Paddle, Vercel), copied source without complete license review, invented production data, arbitrary browser Price IDs, n8n tenant-facing editor, AI direct mutation, heavy/duplicated UI dependencies.

## Local architecture inspected

- `apps/platform`: React 18 + Vite, existing hash navigation and data-driven catalog/status views; no UI component framework.
- `apps/builder`: React/Vite + Supabase client and shared auth/database/tenancy/SaaS Core workspaces; current revision/publish path and AI gateway remain in place.
- Shared domain packages: `packages/saas-core`, `packages/tenancy`, `packages/auth`, `packages/database`.
- No duplicate shared UI package created: current implementation is limited to an app shell and semantic CSS tokens; extracting a package is not justified by current reuse.
- No migrations, dependency changes, auth/billing provider changes, or privileged browser configuration.

## Evidence and remaining uncertainty

The 21st.dev reference listings were fetched on 2026-09-30. REF-01/03/04 show upstream repositories and pinned revisions/licenses. REF-02 and REF-05 do not expose sufficient source/license provenance for code reuse; therefore code remains reference-only. The templates' full source, bundle size, exact icon/font/CSS details and accessibility behavior were not independently inspected or measured. No screenshots from proprietary/template sources are committed.
