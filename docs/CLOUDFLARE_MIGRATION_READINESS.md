# Cloudflare Hosting Readiness

Status: **CURRENT POLICY SUMMARY**

Canonical policy: `docs/HOSTING_POLICY.md`

The earlier Vercel-to-Cloudflare migration phase is historical. Current product hosting is Cloudflare Workers / Static Assets only.

## Current requirements

A deployable app must have:

- locked repository install;
- successful build/typecheck gates applicable to that app;
- no browser/server secret leakage;
- canonical Wrangler configuration;
- Cloudflare-compatible static asset output;
- SPA fallback where required;
- release evidence that does not rely on temporary sandbox URLs;
- tenant/domain security rules preserved.

## Canonical tooling

- Wrangler pinned in the root repository.
- Per-app `wrangler.jsonc` configuration.
- Cloudflare Workers Builds may be connected to GitHub.
- Durable deploys require authenticated Cloudflare execution.
- Durable release proof uses the Cloudflare smoke matrix and rollback evidence.

## Vercel

Vercel is not part of the current hosting architecture.

Do not:

- create new Vercel projects;
- deploy previews or production to Vercel;
- configure Vercel environment variables/secrets;
- use Vercel as rollback;
- treat historical Vercel URLs as release evidence.

Historical documentation may retain Vercel references solely to explain migration history.

## Remaining release evidence

See `docs/RELEASE_GREEN_DOD.md`.

At the time this policy was adopted, relevant external gates still included:

- authenticated durable Cloudflare deployments;
- durable HTTPS smoke;
- authorized custom QA hostname + TLS + tenant resolution;
- rollback proof.

Those gates remain NOT RUN/BLOCKED until actual evidence exists.
