-- fix_tenant_public_read_policy.sql — FORWARD-ONLY, LOCAL PREPARATION
-- Sistema SaaS Geral — Supabase canônico: mmykyzzkcugxunmekwew
--
-- ⚠️  STATUS: NOT APPLIED — prepared locally 2026-09-17, pending owner approval.
-- ⚠️  This file has NEVER been pushed/applied to the remote database.
-- ⚠️  Do NOT run `supabase db push` / `supabase migration up` without explicit
--     owner authorization (see docs/PUBLIC_STORAGE_POLICY_FIX.md).
--
-- ROOT CAUSE (CONFIRMED via live pg_policies inspection + empirical harness):
--   tenant_public_read evaluates storage_tenant_id(t.name) against the TENANT
--   TABLE ALIAS, i.e. it applies storage_tenant_id() to the tenant NAME instead
--   of storage.objects.name (the object path). The SELECT policy therefore
--   never matches real object paths for RLS-governed reads (anon list = 0 rows)
--   and breaks upsert flows (upsert = INSERT + SELECT/UPDATE internally).
--
-- FIX SCOPE: replace ONLY tenant_public_read. No other policy is touched.
--   tenant_media_insert / tenant_media_update / tenant_media_delete /
--   tenant_private_read remain exactly as they are.
--
-- SECURITY GUARANTEES of the new policy:
--   - READ-ONLY for anon, authenticated (FOR SELECT only);
--   - only bucket tenant-public;
--   - only objects whose FIRST PATH SEGMENT is a valid tenant UUID
--     (storage_tenant_id(name) IS NOT NULL — rejects malformed/traversal paths);
--   - only tenants whose status ∈ ('demo','trialing','active') — this restricts
--     visibility in RLS-governed storage.objects operations (SELECT/list and
--     internally dependent flows such as upsert).
--     SEMANTIC LIMIT (empirically proven): tenant-public is a public=true
--     bucket and the direct route /storage/v1/object/public/... serves
--     objects WITHOUT evaluating this RLS policy. This policy does NOT
--     revoke the direct public URL; immediate revocation of public media
--     for suspended/disabled tenants is FUTURE HARDENING (non-blocking —
--     see docs/PUBLIC_STORAGE_POLICY_FIX.md).
--   - NO public write, NO cross-tenant write, NO private-bucket read
--     (those remain governed by the untouched write policies + private read).
--
-- ROLLBACK: see docs/PUBLIC_STORAGE_POLICY_FIX.md § ROLLBACK (recreate the
-- previous expression; backup of the current definition is recorded in the doc).

-- Replace the broken public SELECT policy.
DROP POLICY IF EXISTS tenant_public_read ON storage.objects;

CREATE POLICY tenant_public_read
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'tenant-public'
  AND public.storage_tenant_id(storage.objects.name) IS NOT NULL
  AND public.storage_tenant_id(storage.objects.name) IN (
    SELECT t.id
    FROM public.tenants t
    WHERE t.status IN ('demo', 'trialing', 'active')
  )
);
