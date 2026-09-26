-- Atomic monthly AI credit consumption. User JWT remains the identity boundary.
create or replace function public.consume_ai_credit(
  p_tenant_id uuid,
  p_provider text,
  p_model text,
  p_operation text,
  p_credits integer default 1,
  p_input_units bigint default null,
  p_output_units bigint default null
) returns jsonb
language plpgsql
security definer
set search_path = public, private, auth, pg_temp
as $$
declare
  v_limit integer := 0;
  v_used bigint := 0;
begin
  if auth.uid() is null or not private.is_tenant_member(p_tenant_id) then
    raise exception 'access denied' using errcode='42501';
  end if;
  if p_credits <= 0 or p_credits > 1000 then raise exception 'invalid credits'; end if;
  if length(coalesce(p_provider,'')) not between 1 and 80 or length(coalesce(p_model,'')) not between 1 and 160 or length(coalesce(p_operation,'')) not between 1 and 120 then raise exception 'invalid usage metadata'; end if;

  perform pg_advisory_xact_lock(hashtextextended(p_tenant_id::text, 0));

  select coalesce(
    case
      when te.feature_key is not null and jsonb_typeof(te.value)='number' then (te.value #>> '{}')::integer
      when pe.feature_key is not null and jsonb_typeof(pe.value)='number' then (pe.value #>> '{}')::integer
      else 0
    end,0)
  into v_limit
  from public.subscriptions s
  left join public.plan_entitlements pe on pe.plan_id=s.plan_id and pe.feature_key='ai.credits.monthly'
  left join public.tenant_entitlements te on te.tenant_id=s.tenant_id and te.feature_key='ai.credits.monthly'
  where s.tenant_id=p_tenant_id and s.status in ('trialing','active','past_due')
  order by s.created_at desc limit 1;

  select coalesce(sum(credits),0) into v_used
  from public.ai_usage_events
  where tenant_id=p_tenant_id and created_at >= date_trunc('month',now());

  if v_limit <= 0 or v_used + p_credits > v_limit then
    raise exception 'ai credit limit reached' using errcode='P0001';
  end if;

  insert into public.ai_usage_events(tenant_id,user_id,provider,model,operation,credits,input_units,output_units)
  values(p_tenant_id,auth.uid(),p_provider,p_model,p_operation,p_credits,p_input_units,p_output_units);

  return jsonb_build_object('limit',v_limit,'used',v_used+p_credits,'remaining',v_limit-(v_used+p_credits));
end;
$$;
revoke all on function public.consume_ai_credit(uuid,text,text,text,integer,bigint,bigint) from public,anon;
grant execute on function public.consume_ai_credit(uuid,text,text,text,integer,bigint,bigint) to authenticated,service_role;
