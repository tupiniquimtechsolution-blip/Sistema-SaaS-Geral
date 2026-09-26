# AI Tenant Studio — Architecture & Product Boundary

Status: **ADOPTED TARGET ARCHITECTURE**  
Scope: Tupiniquim Vertical SaaS / Site Builder  
Hosting: Cloudflare Workers + Static Assets. Supabase remains the data/auth/RLS authority.

## Product boundary

The Site Builder evolves into **AI Tenant Studio**: a tenant-facing CMS/editor for business owners and authorized staff. It is intentionally **not** a competitor to Tupiniquim Dev Studio.

AI Tenant Studio may edit tenant-owned content, media, catalog/business fields, theme tokens, registered page sections and publication revisions. It must not expose arbitrary repository editing, shell/terminal access, unrestricted SQL, Git operations, general-purpose coding agents, swarm orchestration or infrastructure administration to tenant users.

Tupiniquim Dev Studio remains the engineering/development product.

## Non-negotiable execution path

Every AI-originated mutation follows:

```
identity -> platform scope -> tenant membership -> RBAC permission
-> active subscription -> entitlement -> typed tool schema
-> risk policy -> proposed change/diff -> confirmation when required
-> revision -> database/RLS enforcement -> audit -> publish/rollback
```

The model interprets intent. It never grants authorization. Browser state, prompt text and model output are untrusted input.

## Access model

Tenant roles continue to use the canonical live RBAC catalog. A future platform-level master grant is separate from tenant roles: it must be server-side, auditable, default-deny and must not be implemented by disabling RLS. Platform masters can switch tenant context only through an explicit privileged server contract.

Ordinary tenant users can see and mutate only tenants for which the server resolves authorized scope.

## Capability model

Capabilities are entitlements, not hard-coded plan-name checks. Proposed AI capability keys are:

- `ai.chat.enabled`
- `ai.contentEdit.enabled`
- `ai.catalogEdit.enabled`
- `ai.media.enabled`
- `ai.sectionEdit.enabled`
- `ai.design.enabled`
- `ai.redesign.enabled`
- `ai.bulkEdit.enabled`
- `ai.publish.enabled`
- `ai.credits.monthly`

These keys are **PROPOSED until a forward-only Supabase migration registers them in public.features and plan_entitlements**. TypeScript must not treat them as canonical before that migration is applied and verified remotely.

Suggested packaging semantics:
- operational edits: content/contact/hours/catalog fields according to the tenant's modules;
- structural edits: registered sections/layout, higher plan capability;
- AI design/redesign: premium capability;
- expensive AI operations: additionally bounded by monthly credits/usage policy.

Plan names are commercial configuration. Runtime code asks for capabilities, never `if plan === premium`.

## Typed AI tools

The AI layer receives only domain tools, for example:

- `updateContentField`
- `updateProductPrice`
- `replaceMedia`
- `updateBusinessHours`
- `updateThemeTokens`
- `addRegisteredSection`
- `reorderSections`
- `proposePageRedesign`
- `previewRevision`
- `submitRevision`
- `publishApprovedRevision`

There is no tenant-facing `executeSql`, shell, repository write, arbitrary code execution or unrestricted HTTP tool.

Each tool declares required permission, required entitlement, accepted schema, risk class and whether explicit confirmation is required.

## Risk classes

- LOW: copy/contact/non-sensitive content edits.
- MEDIUM: prices, media, hours, catalog/service changes.
- HIGH: bulk changes, layout redesign, domain/integration changes, broad publishing.
- CRITICAL: billing, roles, platform-master grants, credentials, destructive operations.

HIGH/CRITICAL operations require explicit server-side policy and stronger confirmation/re-authentication where applicable. AI cannot downgrade risk.

## Visual editing

The existing revision workflow remains authoritative. The UI evolves toward a hybrid editor:

```
tenant/page selector | visual preview/editor | AI copilot
                     | diff / revision / publish controls
```

Manual editing and conversational editing use the same domain contracts and revision ledger.

### Component registry

Page composition must use registered, schema-constrained components (Hero, CTA, Gallery, ProductGrid, ServiceGrid, Testimonials, FAQ, Contact, Booking, etc.). AI chooses/configures registered components instead of generating arbitrary production HTML/CSS.

Puck is an **adoption candidate**, not yet a mandatory dependency. Before adoption verify license, current maintenance, React/Vite compatibility, bundle impact, accessibility and ability to keep canonical data in our revision snapshots. Craft.js remains a fallback candidate. Open-source editor state must never become authorization state.

### Design tokens

AI design changes operate primarily on tenant theme tokens/component variants: palette, typography, spacing, radius, shadows, layout and motion. Protected user constraints such as “do not change logo or products” become immutable fields in the proposed-change contract.

## AI provider boundary

Use a small provider-agnostic AI gateway. Kimi K3 and other Toolbox-discovered models may be adapters when they satisfy the required capability. Do not import Dev Studio's full agent/swarm architecture.

Provider selection is server-side. Model output must produce structured intent/tool input and is validated before execution. Provider keys are server-side only.

## Integration boundary

Future integrations use adapters with typed capabilities, scoped credentials, health state, webhook verification/idempotency, retry policy and audit. Integrations do not receive global tenant access by default.

## Open-source / Toolbox adoption protocol

For every repository, model or skill:

`DISCOVERY != TRUTH != ADOPTION != EXECUTION`

Record: problem solved, license, maintenance, security posture, dependency/bundle cost, compatibility, lock-in, data ownership, accessibility, rollback/removal path and tests. Prefer a focused library over importing a competing platform.

## Incremental delivery

1. Canonicalize AI entitlements in Supabase + TypeScript mirror.
2. Add platform-master server contract without weakening tenant RLS.
3. Add typed AI operation registry and risk/confirmation policy.
4. Add AI usage/credit ledger.
5. Add server-side AI gateway and one provider adapter.
6. Add chat UI bound to current tenant/page/revision.
7. Add structured intent -> proposed diff; no direct publish.
8. Add component registry and visual editor adapter.
9. Add content/media/catalog tools.
10. Add design/redesign capability.
11. Add integration adapters as requested.
12. Expand E2E: master access, owner isolation, A↔B denial, entitlement denial, prompt-injection resistance, revision/rollback, a11y/performance.

## Definition of Done for each future feature

A feature is not done until it is tenant-scoped, RBAC-aware, entitlement-aware when commercial, schema-validated, auditable, covered by negative cross-tenant tests, compatible with revision/rollback where applicable, documented, and verified without weakening existing release gates.
