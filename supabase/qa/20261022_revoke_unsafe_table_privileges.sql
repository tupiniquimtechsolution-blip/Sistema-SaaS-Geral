-- QA-only hardening: remove dangerous SQL grants not controlled by RLS.
-- Target: Supabase QA ynqbnimlpxlokrxlucdm only. Never run against production.
-- TRUNCATE, TRIGGER and REFERENCES privileges are not required for normal
-- tenant CRUD through Supabase/PostgREST; preserve SELECT/INSERT/UPDATE/DELETE.
-- Future tables created by supabase_admin require separate default ACL review.
DO $qa_scope$
BEGIN
  IF current_user <> 'postgres'
     OR (SELECT count(*) FROM public.tenants) <> 2
     OR (SELECT count(*) FROM public.tenants
         WHERE slug IN ('qa-isolation-tenant-a','qa-isolation-tenant-b')) <> 2
  THEN
     RAISE EXCEPTION 'Refusing to apply QA-only privileges outside the isolated two-tenant QA state';
  END IF;
END;
$qa_scope$;

REVOKE TRUNCATE, TRIGGER, REFERENCES ON ALL TABLES IN SCHEMA public
FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
REVOKE TRUNCATE, TRIGGER, REFERENCES ON TABLES
FROM anon, authenticated;

DO $verify_acl$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_class c
      JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND c.relkind IN ('r','p')
       AND (has_table_privilege('anon',c.oid,'TRUNCATE')
         OR has_table_privilege('authenticated',c.oid,'TRUNCATE')
         OR has_table_privilege('anon',c.oid,'TRIGGER')
         OR has_table_privilege('authenticated',c.oid,'TRIGGER')
         OR has_table_privilege('anon',c.oid,'REFERENCES')
         OR has_table_privilege('authenticated',c.oid,'REFERENCES'))
  ) THEN
    RAISE EXCEPTION 'Unsafe inherited privileges remain on public tables';
  END IF;
END;
$verify_acl$;
