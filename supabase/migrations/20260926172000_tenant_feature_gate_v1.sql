-- Server-side entitlement check for AI Tenant Studio and other gated capabilities.
-- Authenticated callers may ask only about tenants they can access; platform admins are
-- included through private.is_tenant_member(). No service-role/browser bypass.
create or replace function public.tenant_feature_enabled(p_tenant_id uuid, p_feature_key text)
returns boolean
language sql
stable
security definer
set search_path = public, private, auth, pg_temp
as $$
  select
    auth.uid() is not null
    and private.is_tenant_member(p_tenant_id)
    and coalesce(
      (
        select case
          when tf.feature_key is not null then tf.enabled
          when te.feature_key is not null and jsonb_typeof(te.value)='boolean' then (te.value #>> '{}')::boolean
          when pe.feature_key is not null and jsonb_typeof(pe.value)='boolean' then (pe.value #>> '{}')::boolean
          else false
        end
        from public.subscriptions s
        left join public.plan_entitlements pe on pe.plan_id=s.plan_id and pe.feature_key=p_feature_key
        left join public.tenant_entitlements te on te.tenant_id=s.tenant_id and te.feature_key=p_feature_key
        left join public.tenant_features tf on tf.tenant_id=s.tenant_id and tf.feature_key=p_feature_key
        where s.tenant_id=p_tenant_id
          and s.status in ('trialing','active','past_due')
        order by s.created_at desc
        limit 1
      ),
      false
    );
$$;

revoke all on function public.tenant_feature_enabled(uuid,text) from public, anon;
grant execute on function public.tenant_feature_enabled(uuid,text) to authenticated, service_role;
