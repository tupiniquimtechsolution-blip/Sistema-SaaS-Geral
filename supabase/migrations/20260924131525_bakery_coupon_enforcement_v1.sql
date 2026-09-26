-- Seed the canonical demo coupons without hardcoded generated IDs.
with bakery as (
  select id from public.tenants where slug = 'fornalha-demo' and vertical_id = 'bakery' limit 1
)
insert into public.coupons (
  tenant_id, code, discount_type, value, minimum_subtotal,
  maximum_discount, is_active, metadata
)
select bakery.id, v.code, v.discount_type, v.value, 0, v.maximum_discount, true, v.metadata
from bakery
cross join (values
  ('BEMVINDO10'::text, 'percent'::text, 10::numeric, null::numeric, '{"source":"bakery-demo","scope":"subtotal"}'::jsonb),
  ('FORNOFRETE'::text, 'fixed'::text, 8.90::numeric, 8.90::numeric, '{"source":"bakery-demo","scope":"delivery_fee"}'::jsonb)
) as v(code, discount_type, value, maximum_discount, metadata)
on conflict (tenant_id, lower(code)) do update
set discount_type = excluded.discount_type,
    value = excluded.value,
    minimum_subtotal = excluded.minimum_subtotal,
    maximum_discount = excluded.maximum_discount,
    is_active = excluded.is_active,
    metadata = excluded.metadata,
    updated_at = now();

-- The original public storefront function remains for internal compatibility,
-- but no longer has browser/API execution privileges because it cannot enforce coupons.
revoke execute on function public.create_storefront_order(text,jsonb,jsonb,jsonb,text,text,text) from public, anon, authenticated;

create or replace function public.create_storefront_order(
  p_tenant_slug text,
  p_items jsonb,
  p_customer jsonb default '{}'::jsonb,
  p_fulfillment jsonb default '{}'::jsonb,
  p_fulfillment_type text default 'pickup',
  p_idempotency_key text default null,
  p_coupon_code text default null,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_tenant_id uuid;
  v_order_id uuid;
  v_order_number bigint;
  v_subtotal numeric := 0;
  v_delivery_fee numeric := 0;
  v_discount_total numeric := 0;
  v_total numeric := 0;
  v_item jsonb;
  v_product record;
  v_qty numeric;
  v_unit_price numeric;
  v_delta numeric;
  v_option jsonb;
  v_extra jsonb;
  v_allowed jsonb;
  v_existing record;
  v_coupon record;
begin
  if p_tenant_slug is null or length(p_tenant_slug) > 120 then raise exception 'invalid tenant'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items)=0 or jsonb_array_length(p_items)>50 then raise exception 'invalid items'; end if;
  if p_fulfillment_type not in ('pickup','delivery') then raise exception 'invalid fulfillment type'; end if;
  if p_notes is not null and length(p_notes)>1000 then raise exception 'notes too long'; end if;
  if p_coupon_code is not null and length(trim(p_coupon_code)) > 80 then raise exception 'invalid coupon'; end if;
  if pg_column_size(coalesce(p_customer,'{}'::jsonb))>8192 or pg_column_size(coalesce(p_fulfillment,'{}'::jsonb))>8192 then raise exception 'payload too large'; end if;

  select id into v_tenant_id
  from public.tenants
  where slug=p_tenant_slug and vertical_id='bakery' and status in ('demo','trialing','active')
  limit 1;
  if v_tenant_id is null then raise exception 'tenant not available'; end if;

  if p_idempotency_key is not null then
    select id,order_number,total,status,subtotal,delivery_fee,discount_total
      into v_existing
    from public.orders
    where tenant_id=v_tenant_id and idempotency_key=p_idempotency_key
    limit 1;
    if found then
      return jsonb_build_object(
        'id',v_existing.id,'order_number',v_existing.order_number,
        'subtotal',v_existing.subtotal,'delivery_fee',v_existing.delivery_fee,
        'discount_total',v_existing.discount_total,'total',v_existing.total,
        'status',v_existing.status,'replayed',true
      );
    end if;
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_qty := nullif(v_item->>'quantity','')::numeric;
    if v_qty is null or v_qty <= 0 or v_qty > 100 or trunc(v_qty)<>v_qty then raise exception 'invalid quantity'; end if;

    select id,name,sku,base_price,metadata into v_product
    from public.products
    where tenant_id=v_tenant_id
      and slug=v_item->>'slug'
      and status='active'
      and coalesce((availability->>'available')::boolean,true)=true
    limit 1;
    if not found then raise exception 'product unavailable'; end if;

    v_unit_price := v_product.base_price;

    if jsonb_typeof(coalesce(v_item->'options','[]'::jsonb)) <> 'array' or jsonb_array_length(coalesce(v_item->'options','[]'::jsonb))>20 then raise exception 'invalid options'; end if;
    for v_option in select value from jsonb_array_elements(coalesce(v_item->'options','[]'::jsonb)) loop
      v_allowed := null;
      v_delta := null;
      select value into v_allowed
      from jsonb_array_elements(coalesce(v_product.metadata->'options','[]'::jsonb)) o
      where o->>'id'=v_option->>'group_id'
      limit 1;
      if v_allowed is null then raise exception 'invalid option group'; end if;
      select coalesce((value->>'delta')::numeric,0) into v_delta
      from jsonb_array_elements(coalesce(v_allowed->'values','[]'::jsonb)) ov
      where ov->>'id'=v_option->>'value_id'
      limit 1;
      if v_delta is null then raise exception 'invalid option value'; end if;
      v_unit_price := v_unit_price + v_delta;
    end loop;

    if jsonb_typeof(coalesce(v_item->'extras','[]'::jsonb)) <> 'array' or jsonb_array_length(coalesce(v_item->'extras','[]'::jsonb))>20 then raise exception 'invalid extras'; end if;
    for v_extra in select value from jsonb_array_elements(coalesce(v_item->'extras','[]'::jsonb)) loop
      v_delta := null;
      select (value->>'price')::numeric into v_delta
      from jsonb_array_elements(coalesce(v_product.metadata->'extras','[]'::jsonb)) ex
      where ex->>'id'=v_extra->>'id'
      limit 1;
      if v_delta is null then raise exception 'invalid extra'; end if;
      v_unit_price := v_unit_price + v_delta;
    end loop;

    v_subtotal := v_subtotal + (v_unit_price * v_qty);
  end loop;

  if p_fulfillment_type='delivery' then
    v_delivery_fee := case when v_subtotal >= 79 then 0 else 8.90 end;
  end if;

  if nullif(trim(coalesce(p_coupon_code,'')), '') is not null then
    select id,discount_type,value,minimum_subtotal,maximum_discount,metadata
      into v_coupon
    from public.coupons
    where tenant_id=v_tenant_id
      and lower(code)=lower(trim(p_coupon_code))
      and is_active=true
      and (starts_at is null or starts_at <= now())
      and (ends_at is null or ends_at > now())
      and minimum_subtotal <= v_subtotal
    limit 1;
    if not found then raise exception 'invalid coupon'; end if;

    if coalesce(v_coupon.metadata->>'scope','subtotal')='delivery_fee' then
      if p_fulfillment_type <> 'delivery' then raise exception 'coupon not valid for fulfillment'; end if;
      v_discount_total := least(v_delivery_fee, v_coupon.value);
    elsif v_coupon.discount_type='percent' then
      v_discount_total := v_subtotal * v_coupon.value / 100;
      if v_coupon.maximum_discount is not null then
        v_discount_total := least(v_discount_total, v_coupon.maximum_discount);
      end if;
    else
      v_discount_total := least(v_subtotal, v_coupon.value);
    end if;
  end if;

  v_discount_total := greatest(0, round(v_discount_total,2));
  v_total := greatest(0, round(v_subtotal + v_delivery_fee - v_discount_total,2));

  insert into public.orders(
    tenant_id,status,fulfillment_type,currency,subtotal,discount_total,delivery_fee,total,
    coupon_id,customer_snapshot,fulfillment_snapshot,notes,source,idempotency_key,created_by
  ) values (
    v_tenant_id,'pending',p_fulfillment_type,'BRL',v_subtotal,v_discount_total,v_delivery_fee,v_total,
    v_coupon.id,coalesce(p_customer,'{}'::jsonb),coalesce(p_fulfillment,'{}'::jsonb),p_notes,'web',p_idempotency_key,auth.uid()
  ) returning id,order_number into v_order_id,v_order_number;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_qty := (v_item->>'quantity')::numeric;
    select id,name,sku,base_price,metadata into v_product
    from public.products
    where tenant_id=v_tenant_id and slug=v_item->>'slug' and status='active'
    limit 1;
    v_unit_price := v_product.base_price;

    for v_option in select value from jsonb_array_elements(coalesce(v_item->'options','[]'::jsonb)) loop
      v_allowed := null;
      v_delta := null;
      select value into v_allowed from jsonb_array_elements(coalesce(v_product.metadata->'options','[]'::jsonb)) o where o->>'id'=v_option->>'group_id' limit 1;
      select coalesce((value->>'delta')::numeric,0) into v_delta from jsonb_array_elements(coalesce(v_allowed->'values','[]'::jsonb)) ov where ov->>'id'=v_option->>'value_id' limit 1;
      v_unit_price := v_unit_price + coalesce(v_delta,0);
    end loop;
    for v_extra in select value from jsonb_array_elements(coalesce(v_item->'extras','[]'::jsonb)) loop
      v_delta := null;
      select (value->>'price')::numeric into v_delta from jsonb_array_elements(coalesce(v_product.metadata->'extras','[]'::jsonb)) ex where ex->>'id'=v_extra->>'id' limit 1;
      v_unit_price := v_unit_price + coalesce(v_delta,0);
    end loop;

    insert into public.order_items(
      tenant_id,order_id,product_id,name_snapshot,sku_snapshot,quantity,unit_price,options_snapshot,line_total
    ) values (
      v_tenant_id,v_order_id,v_product.id,v_product.name,v_product.sku,v_qty,v_unit_price,
      jsonb_build_object('options',coalesce(v_item->'options','[]'::jsonb),'extras',coalesce(v_item->'extras','[]'::jsonb)),
      v_unit_price*v_qty
    );
  end loop;

  return jsonb_build_object(
    'id',v_order_id,'order_number',v_order_number,
    'subtotal',v_subtotal,'delivery_fee',v_delivery_fee,
    'discount_total',v_discount_total,'total',v_total,
    'status','pending','replayed',false
  );
exception when unique_violation then
  if p_idempotency_key is not null then
    select id,order_number,total,status,subtotal,delivery_fee,discount_total
      into v_existing
    from public.orders
    where tenant_id=v_tenant_id and idempotency_key=p_idempotency_key
    limit 1;
    if found then
      return jsonb_build_object(
        'id',v_existing.id,'order_number',v_existing.order_number,
        'subtotal',v_existing.subtotal,'delivery_fee',v_existing.delivery_fee,
        'discount_total',v_existing.discount_total,'total',v_existing.total,
        'status',v_existing.status,'replayed',true
      );
    end if;
  end if;
  raise;
end;
$function$;

revoke all on function public.create_storefront_order(text,jsonb,jsonb,jsonb,text,text,text,text) from public;
grant execute on function public.create_storefront_order(text,jsonb,jsonb,jsonb,text,text,text,text) to anon, authenticated;
