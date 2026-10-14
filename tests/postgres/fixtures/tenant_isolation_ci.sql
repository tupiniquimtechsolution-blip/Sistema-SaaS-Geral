-- Disposable PostgreSQL 17 RLS fixture for CI ONLY.
-- Explicitly models the authorization helpers and selected RLS policy predicates
-- observed in the canonical project on 2026-10-14. NOT a remote migration,
-- full schema export, proof of current production RLS, or deployable SQL.
-- Never run against any hosted Supabase project.
\set ON_ERROR_STOP on

do $bootstrap$
begin
  if not exists(select 1 from pg_roles where rolname='authenticated') then
    create role authenticated nologin;
  end if;
end $bootstrap$;

create schema if not exists auth;
create or replace function auth.uid() returns uuid language sql stable
as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;

create table public.tenants (
  id uuid primary key, slug text not null unique
);
create table public.memberships (
  id uuid primary key, tenant_id uuid not null references public.tenants(id),
  user_id uuid not null, status text not null
);
create table public.platform_admins (user_id uuid primary key);
create table public.roles (id uuid primary key, tenant_id uuid, key text not null);
create table public.permissions (id uuid primary key, key text not null unique);
create table public.membership_roles (
  membership_id uuid not null references public.memberships(id),
  role_id uuid not null references public.roles(id),
  primary key(membership_id,role_id)
);
create table public.role_permissions (
  role_id uuid not null references public.roles(id),
  permission_id uuid not null references public.permissions(id),
  primary key(role_id,permission_id)
);
create table public.contacts (
  id uuid primary key, tenant_id uuid not null references public.tenants(id), name text not null
);
create table public.subscriptions (
  id uuid primary key, tenant_id uuid not null references public.tenants(id), status text not null
);
create table public.tenant_entitlements (
  id uuid primary key, tenant_id uuid not null references public.tenants(id), feature_key text not null
);

-- SECURITY DEFINER here deliberately emulates the effective current remote
-- private.* functions; explicit auth.uid check, membership and permission
-- semantics reflect the read-only inspected definitions.
create or replace function public.is_platform_admin() returns boolean
language sql stable security definer set search_path=public,auth,pg_temp
as $$
  select auth.uid() is not null
    and exists(select 1 from public.platform_admins pa where pa.user_id=auth.uid())
$$;
create or replace function public.is_tenant_member(p_tenant_id uuid) returns boolean
language sql stable security definer set search_path=public,auth,pg_temp
as $$
  select auth.uid() is not null and (
    public.is_platform_admin() or exists(
      select 1 from public.memberships m
      where m.tenant_id=p_tenant_id and m.user_id=auth.uid() and m.status='active'
    )
  )
$$;
create or replace function public.has_tenant_permission(p_tenant_id uuid,p_permission text)
returns boolean language sql stable security definer set search_path=public,auth,pg_temp
as $$
  select auth.uid() is not null and (
    public.is_platform_admin() or exists(
      select 1 from public.memberships m
      join public.membership_roles mr on mr.membership_id=m.id
      join public.roles r on r.id=mr.role_id
      join public.role_permissions rp on rp.role_id=r.id
      join public.permissions p on p.id=rp.permission_id
      where m.tenant_id=p_tenant_id and m.user_id=auth.uid() and m.status='active'
        and (r.tenant_id is null or r.tenant_id=p_tenant_id)
        and p.key=p_permission
    )
  )
$$;

revoke all on function public.is_platform_admin() from public;
revoke all on function public.is_tenant_member(uuid) from public;
revoke all on function public.has_tenant_permission(uuid,text) from public;
grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.is_tenant_member(uuid) to authenticated;
grant execute on function public.has_tenant_permission(uuid,text) to authenticated;
grant usage on schema auth to authenticated;
grant execute on function auth.uid() to authenticated;

alter table public.tenants enable row level security;
alter table public.memberships enable row level security;
alter table public.platform_admins enable row level security;
alter table public.contacts enable row level security;
alter table public.subscriptions enable row level security;
alter table public.tenant_entitlements enable row level security;
grant select,update on public.tenants to authenticated;
grant select,insert,update,delete on public.memberships to authenticated;
grant select,insert,update,delete on public.platform_admins to authenticated;
grant select,insert,update,delete on public.contacts to authenticated;
grant select,insert,update,delete on public.subscriptions to authenticated;
grant select,insert,update,delete on public.tenant_entitlements to authenticated;

create policy tenants_member_read on public.tenants for select to authenticated
  using(public.is_tenant_member(id));
create policy tenants_admin_update on public.tenants for update to authenticated
  using(public.has_tenant_permission(id,'tenant.settings.write'))
  with check(public.has_tenant_permission(id,'tenant.settings.write'));

create policy memberships_member_read on public.memberships for select to authenticated
  using(public.is_tenant_member(tenant_id));
create policy memberships_manage_insert on public.memberships for insert to authenticated
  with check(public.has_tenant_permission(tenant_id,'members.roles.write'));
create policy memberships_manage_update on public.memberships for update to authenticated
  using(public.has_tenant_permission(tenant_id,'members.roles.write'))
  with check(public.has_tenant_permission(tenant_id,'members.roles.write'));
create policy memberships_manage_delete on public.memberships for delete to authenticated
  using(public.has_tenant_permission(tenant_id,'members.roles.write'));

create policy contacts_read on public.contacts for select to authenticated
  using(public.is_tenant_member(tenant_id));
create policy contacts_manage_insert on public.contacts for insert to authenticated
  with check(public.has_tenant_permission(tenant_id,'crm.write'));
create policy contacts_manage_update on public.contacts for update to authenticated
  using(public.has_tenant_permission(tenant_id,'crm.write'))
  with check(public.has_tenant_permission(tenant_id,'crm.write'));
create policy contacts_manage_delete on public.contacts for delete to authenticated
  using(public.has_tenant_permission(tenant_id,'crm.write'));

create policy platform_admins_self_or_admin_read on public.platform_admins for select to authenticated
  using(user_id=auth.uid() or public.is_platform_admin());
create policy platform_admins_admin_insert on public.platform_admins for insert to authenticated
  with check(public.is_platform_admin());
create policy platform_admins_admin_update on public.platform_admins for update to authenticated
  using(public.is_platform_admin()) with check(public.is_platform_admin());
create policy platform_admins_admin_delete on public.platform_admins for delete to authenticated
  using(public.is_platform_admin());

create policy subscriptions_read on public.subscriptions for select to authenticated
  using(public.has_tenant_permission(tenant_id,'billing.read'));
create policy subscriptions_admin_insert on public.subscriptions for insert to authenticated
  with check(public.is_platform_admin());
create policy subscriptions_admin_update on public.subscriptions for update to authenticated
  using(public.is_platform_admin()) with check(public.is_platform_admin());
create policy subscriptions_admin_delete on public.subscriptions for delete to authenticated
  using(public.is_platform_admin());

create policy tenant_entitlements_read on public.tenant_entitlements for select to authenticated
  using(public.is_tenant_member(tenant_id));
create policy tenant_entitlements_admin_insert on public.tenant_entitlements for insert to authenticated
  with check(public.is_platform_admin());
create policy tenant_entitlements_admin_update on public.tenant_entitlements for update to authenticated
  using(public.is_platform_admin()) with check(public.is_platform_admin());
create policy tenant_entitlements_admin_delete on public.tenant_entitlements for delete to authenticated
  using(public.is_platform_admin());

-- Generated, non-customer values only. Owner A is NOT Platform Master; B is viewer.
insert into public.tenants(id,slug) values
 ('00000000-0000-4000-8000-00000000000a','qa-isolation-a'),
 ('00000000-0000-4000-8000-00000000000b','qa-isolation-b');
insert into public.memberships(id,tenant_id,user_id,status) values
 ('10000000-0000-4000-8000-00000000000a','00000000-0000-4000-8000-00000000000a','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','active'),
 ('10000000-0000-4000-8000-00000000000b','00000000-0000-4000-8000-00000000000b','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','active');
insert into public.roles(id,tenant_id,key) values
 ('20000000-0000-4000-8000-00000000000a',null,'owner'),
 ('20000000-0000-4000-8000-00000000000b',null,'viewer');
insert into public.permissions(id,key) values
 ('30000000-0000-4000-8000-00000000000a','crm.write'),
 ('30000000-0000-4000-8000-00000000000b','members.roles.write'),
 ('30000000-0000-4000-8000-00000000000c','billing.read');
insert into public.membership_roles(membership_id,role_id) values
 ('10000000-0000-4000-8000-00000000000a','20000000-0000-4000-8000-00000000000a'),
 ('10000000-0000-4000-8000-00000000000b','20000000-0000-4000-8000-00000000000b');
insert into public.role_permissions(role_id,permission_id)
select '20000000-0000-4000-8000-00000000000a',id from public.permissions;
insert into public.contacts(id,tenant_id,name) values
 ('40000000-0000-4000-8000-00000000000a','00000000-0000-4000-8000-00000000000a','fixture A'),
 ('40000000-0000-4000-8000-00000000000b','00000000-0000-4000-8000-00000000000b','fixture B');
insert into public.subscriptions(id,tenant_id,status) values
 ('50000000-0000-4000-8000-00000000000a','00000000-0000-4000-8000-00000000000a','trialing'),
 ('50000000-0000-4000-8000-00000000000b','00000000-0000-4000-8000-00000000000b','trialing');
insert into public.tenant_entitlements(id,tenant_id,feature_key) values
 ('60000000-0000-4000-8000-00000000000a','00000000-0000-4000-8000-00000000000a','feature-a'),
 ('60000000-0000-4000-8000-00000000000b','00000000-0000-4000-8000-00000000000b','feature-b');
insert into public.platform_admins(user_id)
values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc');
\echo 'FIXTURE_READY (disposable CI only, not remote Supabase)'
