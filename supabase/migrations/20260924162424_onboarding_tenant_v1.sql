create or replace function public.create_tenant_with_owner(
  p_name text,
  p_slug text,
  p_vertical_id text,
  p_plan_id text default 'starter'
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $function$
declare
  v_user uuid := auth.uid();
  v_tenant uuid;
  v_membership uuid;
  v_owner_role uuid;
  v_vertical record;
  v_plan record;
begin
  if v_user is null then raise exception 'authentication_required'; end if;
  if length(trim(p_name)) < 2 or length(trim(p_name)) > 120 then raise exception 'invalid_tenant_name'; end if;
  if p_slug !~ '^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$' then raise exception 'invalid_tenant_slug'; end if;

  select id, default_theme, default_modules into v_vertical
  from public.vertical_registry
  where id = p_vertical_id and is_enabled
  limit 1;
  if not found then raise exception 'invalid_vertical'; end if;

  select id into v_plan
  from public.plans
  where id = p_plan_id and is_active
  limit 1;
  if not found then raise exception 'invalid_plan'; end if;

  insert into public.tenants(name, slug, vertical_id, created_by)
  values (trim(p_name), lower(p_slug), p_vertical_id, v_user)
  returning id into v_tenant;

  insert into public.tenant_brands(tenant_id, display_name)
  values (v_tenant, trim(p_name));

  insert into public.tenant_themes(tenant_id, component_style)
  values (v_tenant, coalesce(v_vertical.default_theme, '{}'::jsonb));

  insert into public.tenant_settings(tenant_id, public_settings)
  values (
    v_tenant,
    jsonb_build_object(
      'onboarding', jsonb_build_object('completed', false, 'created_at', now()),
      'vertical_modules', coalesce(v_vertical.default_modules, '{}'::jsonb)
    )
  );

  insert into public.memberships(tenant_id, user_id, status, joined_at)
  values (v_tenant, v_user, 'active', now())
  returning id into v_membership;

  select id into v_owner_role
  from public.roles
  where tenant_id is null and key = 'owner'
  limit 1;
  if v_owner_role is null then raise exception 'owner_role_missing'; end if;

  insert into public.membership_roles(membership_id, role_id, granted_by)
  values (v_membership, v_owner_role, v_user);

  insert into public.subscriptions(tenant_id, plan_id, provider, status)
  values (v_tenant, v_plan.id, 'manual', 'trialing');

  insert into public.audit_logs(tenant_id, actor_id, action, resource_type, resource_id, metadata)
  values (
    v_tenant,
    v_user,
    'tenant.created',
    'tenant',
    v_tenant::text,
    jsonb_build_object('vertical_id', p_vertical_id, 'plan_id', p_plan_id, 'provisioning', 'self_service')
  );

  return v_tenant;
end;
$function$;

revoke all on function public.create_tenant_with_owner(text,text,text,text) from public;
grant execute on function public.create_tenant_with_owner(text,text,text,text) to authenticated, service_role;
