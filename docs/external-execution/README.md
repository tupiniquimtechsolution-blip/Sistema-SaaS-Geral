# External Execution — UI SaaS Convergence Wave 01

Use this directory when handing the repository to Freebuff, Arena AI, Codex or another coding agent.

## What to select

Repository:

`tupiniquimtechsolution-blip/Sistema-SaaS-Geral`

Working branch:

`feature/ui-saas-convergence-wave-01`

Do not select `main` for implementation.

## What prompt to give the coding agent

Use:

`docs/external-execution/UI_SAAS_CONVERGENCE_WAVE_01_MASTER_PROMPT.md`

The agent must read that file and execute it as the primary implementation specification.

A minimal launcher prompt is:

> Work only on the currently selected branch. Read `AGENTS.md`, `SECURITY.md`, `docs/external-execution/UI_SAAS_CONVERGENCE_WAVE_01_MASTER_PROMPT.md`, `docs/UI_REFERENCE_ADOPTION.md` and `docs/UI_CONVERGENCE_WAVE_01.md`. Then execute UI-G0 through UI-G10 as far as safely possible. Do not merge, weaken RLS, expose secrets, replace Supabase/Stripe/Cloudflare architecture, or claim external gates you did not run. Commit incrementally, run the repository gates, push the branch, and return the required final report.

## Expected output

The external coding tool should:

1. inspect and document the five references;
2. implement the wave on this feature branch;
3. use small commits;
4. run the applicable gates;
5. update the adoption ledger and wave status;
6. push changes;
7. leave merge decisions to the owner.

## External credentials

Do not paste production secrets into prompts, commits, issue comments or PR comments.

If an external tool requires credentials to run a live gate, configure them only through that tool/provider's secure secret mechanism.

## Return to ChatGPT

After execution, provide either:

- the final report produced by the coding agent; or
- the branch/PR URL.

The branch can then be audited against the master prompt, security invariants and test evidence.
