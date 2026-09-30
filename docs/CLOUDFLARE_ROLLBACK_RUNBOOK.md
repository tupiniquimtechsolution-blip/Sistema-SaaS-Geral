# Cloudflare Rollback Runbook

Status: **CANONICAL — CLOUDFLARE ONLY**

See also: `docs/HOSTING_POLICY.md`.

## Principle

Rollback for Tupiniquim stays inside Cloudflare.

Vercel is not an active deployment target and is not a rollback source.

Historical Vercel deployments, URLs, configuration, or evidence must not be used as current release or rollback instructions.

## Standard rollback

For a deployed Worker / Static Assets application:

1. identify the last-known-good Cloudflare version;
2. list available versions with the app's canonical Wrangler config;
3. roll back to the selected version using Cloudflare/Wrangler version controls;
4. if version rollback is unavailable or unsuitable, rebuild the last-known-good Git commit and deploy it with Wrangler;
5. run the durable HTTPS smoke for the app;
6. record the version, commit SHA, hostname, smoke result, reason, and operator;
7. if a custom domain/route was changed, restore the Cloudflare route/domain mapping required by the last-known-good release.

Example commands:

```bash
npx wrangler versions list --config apps/<app>/wrangler.jsonc
npx wrangler versions rollback <version-id> --config apps/<app>/wrangler.jsonc
```

Fallback rebuild:

```bash
npm ci
npm run build:<app>
npx wrangler deploy --config apps/<app>/wrangler.jsonc
```

Use the exact workspace build command for apps whose root script differs.

## DNS / custom hostnames

A domain rollback must remain within the authorized Cloudflare routing model.

Do not redirect production traffic to Vercel.

For tenant custom domains:

- preserve hostname -> tenant fail-closed validation;
- preserve TLS requirements;
- never bypass `tenant_domains` authorization;
- record the old and new route/domain state;
- re-run tenant isolation and HTTPS smoke after rollback.

## Required evidence

A valid rollback proof records:

- app/Worker;
- release commit SHA;
- failed/current Cloudflare version;
- target last-known-good Cloudflare version;
- rollback command/action;
- durable HTTPS URL;
- HTTP/browser smoke result;
- asset loading result;
- SPA refresh result;
- console/network result where applicable;
- operator/date;
- follow-up issue if rollback was caused by a defect.

## Rules

- Cloudflare Workers / Static Assets is the only hosting target.
- Do not deploy to Vercel for preview, production, fallback, or rollback.
- Do not use temporary sandbox URLs as durable release evidence.
- Supabase remains the backend/data authority and is not modified by a frontend hosting rollback.
- After rollback, re-run the relevant Cloudflare smoke and release gates.
- No unchecked Release GREEN item may be represented as PASS.
