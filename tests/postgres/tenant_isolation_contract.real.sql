-- Runs only on disposable CI PostgreSQL 17, never against hosted Supabase.
-- Simulates JWT claims with SET LOCAL; this is a SQL contract test, NOT real
-- Supabase Auth, remote policy parity, deployed UI or storage evidence.
\set ON_ERROR_STOP on

-- Structural checks verify effective remote helper schema/role boundaries modeled
-- by the synthetic fixture; no claim of full remote schema parity.
do $boundary$
declare
  public_definer_count integer;
  private_definer_count integer;
begin
  select count(*) into public_definer_count from pg_proc p
  where p.pronamespace='public'::regnamespace
    and p.proname in ('is_platform_admin','is_tenant_member','has_tenant_permission')
    and p.prosecdef;
  select count(*) into private_definer_count from pg_proc p
  where p.pronamespace='private'::regnamespace
    and p.proname in ('is_platform_admin','is_tenant_member','has_tenant_permission')
    and p.prosecdef;
  if public_definer_count<>0 or private_definer_count<>3 then
    raise exception 'Security definer boundary differs from canonical model';
  end if;
  if has_function_privilege('anon','private.has_tenant_permission(uuid,text)','EXECUTE') then
    raise exception 'Anon may execute private tenant permission helper';
  end if;
  if not has_function_privilege('authenticated','private.has_tenant_permission(uuid,text)','EXECUTE') then
    raise exception 'Authenticated may not execute private permission helper';
  end if;
  raise notice 'AUTH_HELPER_BOUNDARY=PASS (public invokers, private definers, role grants)';
end $boundary$;

-- Fixture actor A: tenant A owner (CRM and member permissions, NOT Platform Master).
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
do $checks$
declare
  affected integer;
  a constant uuid := '00000000-0000-4000-8000-00000000000a';
  b constant uuid := '00000000-0000-4000-8000-00000000000b';
begin
  if not row_security_active('public.tenants'::regclass) then raise exception 'RLS inactive under actor A'; end if;
  if public.is_platform_admin() then raise exception 'Actor A unexpectedly has Platform Master privilege'; end if;
  if not public.is_tenant_member(a) or public.is_tenant_member(b) then raise exception 'Actor A tenant memberships invalid'; end if;
  if not public.has_tenant_permission(a,'crm.write') or public.has_tenant_permission(b,'crm.write') then raise exception 'Actor A CRM permissions leaked'; end if;
  if not public.has_tenant_permission(a,'members.roles.write') or public.has_tenant_permission(b,'members.roles.write') then raise exception 'Actor A role permissions leaked'; end if;
  if (select count(*) from public.tenants)<>1 or (select count(*) from public.tenants where id=b)<>0 then raise exception 'Actor A tenant SELECT leak'; end if;
  if (select count(*) from public.memberships)<>1 or (select count(*) from public.memberships where tenant_id=b)<>0 then raise exception 'Actor A membership SELECT leak'; end if;
  if (select count(*) from public.contacts)<>1 or (select count(*) from public.contacts where tenant_id=b)<>0 then raise exception 'Actor A contact SELECT leak'; end if;
  if (select count(*) from public.subscriptions)<>1 or (select count(*) from public.subscriptions where tenant_id=b)<>0 then raise exception 'Actor A billing SELECT leak'; end if;
  if (select count(*) from public.tenant_entitlements)<>1 or (select count(*) from public.tenant_entitlements where tenant_id=b)<>0 then raise exception 'Actor A entitlement SELECT leak'; end if;

  insert into public.contacts(id,tenant_id,name)
    values ('70000000-0000-4000-8000-00000000000a',a,'allowed');
  if (select count(*) from public.contacts where name='allowed')<>1 then raise exception 'Actor A own insert denied'; end if;

  begin
    insert into public.contacts(id,tenant_id,name)
      values ('70000000-0000-4000-8000-00000000000b',b,'cross');
    raise exception 'SECURITY: Actor A inserted contact into B';
  exception when insufficient_privilege then null;
  end;
  update public.contacts set name='tampered' where tenant_id=b;
  get diagnostics affected = row_count;
  if affected<>0 then raise exception 'SECURITY: Actor A updated B contact'; end if;
  update public.memberships set status='inactive' where tenant_id=b;
  get diagnostics affected = row_count;
  if affected<>0 then raise exception 'SECURITY: Actor A updated B membership'; end if;
  delete from public.contacts where tenant_id=b;
  get diagnostics affected = row_count;
  if affected<>0 then raise exception 'SECURITY: Actor A deleted B contact'; end if;
  begin
    insert into public.memberships(id,tenant_id,user_id,status)
      values ('71000000-0000-4000-8000-00000000000a',b,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','active');
    raise exception 'SECURITY: Actor A created cross-tenant membership';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.platform_admins(user_id) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
    raise exception 'SECURITY: Actor A self-granted Platform Master';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.subscriptions(id,tenant_id,status)
      values ('72000000-0000-4000-8000-00000000000a',a,'active');
    raise exception 'SECURITY: Actor A directly created subscription';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.tenant_entitlements(id,tenant_id,feature_key)
      values ('73000000-0000-4000-8000-00000000000a',a,'unearned');
    raise exception 'SECURITY: Actor A directly created entitlement';
  exception when insufficient_privilege then null;
  end;
  raise notice 'ACTOR_A=PASS own read/write, cross-tenant read/write deny, admin/billing escalation deny';
end $checks$;
rollback;

-- Fixture actor B: tenant B viewer (read own rows but no CRM or membership writes).
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
do $checks$
declare
  affected integer;
  a constant uuid := '00000000-0000-4000-8000-00000000000a';
  b constant uuid := '00000000-0000-4000-8000-00000000000b';
begin
  if not row_security_active('public.contacts'::regclass) then raise exception 'RLS inactive under actor B'; end if;
  if public.is_platform_admin() then raise exception 'Actor B unexpectedly Platform Master'; end if;
  if public.is_tenant_member(a) or not public.is_tenant_member(b) then raise exception 'Actor B membership invalid'; end if;
  if public.has_tenant_permission(b,'crm.write') or public.has_tenant_permission(b,'members.roles.write') then raise exception 'Viewer has write capability'; end if;
  if public.has_tenant_permission(a,'crm.write') then raise exception 'Viewer can write A'; end if;
  if (select count(*) from public.tenants)<>1 or (select count(*) from public.tenants where id=a)<>0 then raise exception 'Actor B tenant SELECT leak'; end if;
  if (select count(*) from public.memberships)<>1 or (select count(*) from public.memberships where tenant_id=a)<>0 then raise exception 'Actor B membership SELECT leak'; end if;
  if (select count(*) from public.contacts)<>1 or (select count(*) from public.contacts where tenant_id=a)<>0 then raise exception 'Actor B contact SELECT leak'; end if;
  if (select count(*) from public.subscriptions)<>0 then raise exception 'Viewer billing SELECT leak'; end if;
  if (select count(*) from public.tenant_entitlements)<>1 or (select count(*) from public.tenant_entitlements where tenant_id=a)<>0 then raise exception 'Actor B entitlement SELECT leak'; end if;
  begin
    insert into public.contacts(id,tenant_id,name)
      values ('74000000-0000-4000-8000-00000000000b',b,'viewer write');
    raise exception 'SECURITY: viewer inserted into own tenant without CRM permission';
  exception when insufficient_privilege then null;
  end;
  update public.contacts set name='viewer tamper' where tenant_id=b;
  get diagnostics affected = row_count;
  if affected<>0 then raise exception 'SECURITY: viewer updated own B contact'; end if;
  update public.contacts set name='cross tamper' where tenant_id=a;
  get diagnostics affected = row_count;
  if affected<>0 then raise exception 'SECURITY: Actor B updated A contact'; end if;
  delete from public.contacts where tenant_id=a;
  get diagnostics affected = row_count;
  if affected<>0 then raise exception 'SECURITY: Actor B deleted A contact'; end if;
  begin
    insert into public.contacts(id,tenant_id,name)
      values ('74000000-0000-4000-8000-00000000000a',a,'cross write');
    raise exception 'SECURITY: viewer inserted into A';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.memberships(id,tenant_id,user_id,status)
      values ('75000000-0000-4000-8000-00000000000b',b,'dddddddd-dddd-4ddd-8ddd-dddddddddddd','active');
    raise exception 'SECURITY: viewer granted membership';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.platform_admins(user_id) values('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
    raise exception 'SECURITY: viewer self-granted Platform Master';
  exception when insufficient_privilege then null;
  end;
  raise notice 'ACTOR_B=PASS own read, cross-tenant read deny, viewer writes/escalation deny';
end $checks$;
rollback;

-- Deny even authenticated role with no valid JWT identity.
begin;
set local role authenticated;
do $checks$
begin
  if auth.uid() is not null or public.is_platform_admin() then raise exception 'Unidentified actor gained identity'; end if;
  if (select count(*) from public.tenants)<>0 or (select count(*) from public.contacts)<>0 or (select count(*) from public.memberships)<>0 then
    raise exception 'Unidentified role bypassed RLS';
  end if;
  raise notice 'NO_IDENTITY=PASS default deny';
end $checks$;
rollback;

-- Remote six-table ACL grants SELECT to anon while policies allow authenticated only.
-- Verify RLS blocks all rows despite the underlying SQL SELECT privilege.
begin;
set local role anon;
do $checks$
begin
  if not row_security_active('public.tenants'::regclass) then
    raise exception 'Anonymous role did not activate RLS';
  end if;
  if auth.uid() is not null or public.is_platform_admin() then
    raise exception 'Anonymous subject acquired a non-null identity or platform privilege';
  end if;
  if (select count(*) from public.tenants)<>0
    or (select count(*) from public.memberships)<>0
    or (select count(*) from public.contacts)<>0
    or (select count(*) from public.subscriptions)<>0
    or (select count(*) from public.tenant_entitlements)<>0
    or (select count(*) from public.platform_admins)<>0 then
      raise exception 'Anonymous subject bypassed authenticated-only RLS';
  end if;
  raise notice 'ANON_ROLE=PASS (table SELECT granted, RLS denies all)';
end $checks$;
rollback;

-- Positive control: Platform Master is a deliberately different actor.
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
do $checks$
begin
  if not public.is_platform_admin() or (select count(*) from public.tenants)<>2 then
    raise exception 'Platform Master positive control failed';
  end if;
  raise notice 'PLATFORM_MASTER=PASS intentional global read';
end $checks$;
rollback;

\echo 'TENANT_ISOLATION_PG_CONTRACT=PASS (disposable modeled-policy fixture only)'
