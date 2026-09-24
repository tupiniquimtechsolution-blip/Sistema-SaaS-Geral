-- Keep extension objects outside the exposed public schema while preserving
-- the exclusion constraint that uses btree_gist operator classes.
create schema if not exists extensions;
alter extension btree_gist set schema extensions;
