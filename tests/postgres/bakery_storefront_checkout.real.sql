-- Real Postgres contract tests for bakery storefront checkout.
-- Run inside a transaction and ROLLBACK. Assumes canonical bakery seed exists.
begin;

do $test$
declare
  v_tenant uuid;
  v_product record;
  v_result jsonb;
  v_replay jsonb;
  v_key text := 'qa-bakery-' || gen_random_uuid()::text;
begin
  select id into v_tenant from public.tenants where slug='fornalha-demo' and vertical_id='bakery';
  if v_tenant is null then raise exception 'TEST_SETUP: fornalha-demo missing'; end if;
  select slug,base_price into v_product from public.products where tenant_id=v_tenant and status='active' order by slug limit 1;
  if v_product.slug is null then raise exception 'TEST_SETUP: bakery product missing'; end if;

  -- Browser cannot directly insert canonical orders.
  if has_table_privilege('anon','public.orders','INSERT') then raise exception 'SECURITY: anon direct order insert granted'; end if;
  if has_table_privilege('anon','public.order_items','INSERT') then raise exception 'SECURITY: anon direct item insert granted'; end if;

  -- Client sends no price. DB owns base_price and total.
  v_result := public.create_storefront_order(
    'fornalha-demo',
    jsonb_build_array(jsonb_build_object('slug',v_product.slug,'quantity',1,'options','[]'::jsonb,'extras','[]'::jsonb)),
    '{}'::jsonb,'{}'::jsonb,'pickup',v_key,null,null
  );
  if (v_result->>'subtotal')::numeric <> v_product.base_price then raise exception 'SECURITY: server subtotal mismatch'; end if;

  -- Same tenant + idempotency key must replay, not create another order.
  v_replay := public.create_storefront_order(
    'fornalha-demo',
    jsonb_build_array(jsonb_build_object('slug',v_product.slug,'quantity',1,'options','[]'::jsonb,'extras','[]'::jsonb)),
    '{}'::jsonb,'{}'::jsonb,'pickup',v_key,null,null
  );
  if coalesce((v_replay->>'replayed')::boolean,false) is not true then raise exception 'SECURITY: idempotency replay failed'; end if;
  if v_replay->>'id' <> v_result->>'id' then raise exception 'SECURITY: replay created another order'; end if;

  -- Unknown tenant and product must fail closed.
  begin
    perform public.create_storefront_order('not-a-real-tenant',jsonb_build_array(jsonb_build_object('slug',v_product.slug,'quantity',1)), '{}'::jsonb,'{}'::jsonb,'pickup',gen_random_uuid()::text,null,null);
    raise exception 'SECURITY: unknown tenant accepted';
  exception when others then
    if sqlerrm='SECURITY: unknown tenant accepted' then raise; end if;
  end;

  begin
    perform public.create_storefront_order('fornalha-demo',jsonb_build_array(jsonb_build_object('slug','not-a-product','quantity',1)), '{}'::jsonb,'{}'::jsonb,'pickup',gen_random_uuid()::text,null,null);
    raise exception 'SECURITY: cross/unknown product accepted';
  exception when others then
    if sqlerrm='SECURITY: cross/unknown product accepted' then raise; end if;
  end;
end
$test$;

rollback;
