# Hosting Policy — Cloudflare Only

Status: **CANONICAL**

Effective: 2026-09-30

## Decision

The Tupiniquim Vertical SaaS product is deployed and operated through **Cloudflare Workers / Static Assets**.

Vercel is **not** an active hosting target, preview target, production target, deployment fallback, or rollback mechanism.

Any Vercel references retained in historical documents are evidence of earlier migration stages only. They are not operational instructions.

## Canonical hosting

- Platform: Cloudflare Workers / Static Assets
- Builder: Cloudflare Workers / Static Assets
- Vertical apps: Cloudflare Workers / Static Assets
- Tenant model: tenant configuration in the canonical Supabase data plane; never one deployment per tenant
- Backend/data authority: Supabase/PostgreSQL
- Production promotion: explicit Cloudflare deployment plus release gates and durable HTTPS evidence

## Deployment tooling

Allowed deployment tooling:

- `wrangler preview` for isolated non-production RC/branch staging
- `wrangler deploy`
- `wrangler versions upload`
- `wrangler versions list`
- `wrangler versions rollback`
- Cloudflare Workers Builds connected to GitHub
- Cloudflare routes/custom domains only after the required authorization and release gates

Not allowed as active deployment tooling:

- `vercel`
- `npx vercel`
- `vercel deploy`
- Vercel GitHub Actions
- Vercel project configuration such as `vercel.json`
- `.vercel/` project state
- Vercel environment variables/secrets for deployment
- Vercel as rollback target

## Rollback

Rollback remains inside Cloudflare.

Preferred sequence:

1. identify the last-known-good Cloudflare Worker version;
2. rollback using Wrangler/Cloudflare version controls;
3. if necessary, rebuild the last-known-good commit and deploy it with Wrangler;
4. re-run durable HTTPS smoke and release evidence;
5. if a custom hostname is involved, change only the Cloudflare route/domain mapping required by the rollback plan.

Do not redirect product traffic to Vercel as a rollback strategy.

## CI enforcement

`npm run hosting:policy` validates the repository for active Vercel deployment configuration.

The repository quality workflow must run this gate.

Historical prose may mention Vercel when clearly describing past state. Executable deployment configuration must remain Cloudflare-only.

## Release rule

A product surface is not considered deployed because a local preview, temporary sandbox URL, Vercel deployment, or historical URL exists.

An isolated Worker Preview may satisfy the RC **staging** gate when its immutable
Preview deployment URL passes the required smoke tests, but it is never counted
as a durable or production deployment.

Current release evidence requires the Cloudflare gates defined by
`docs/RELEASE_GREEN_DOD.md`, including separate durable deployment, hostname/TLS
and rollback evidence where applicable.
