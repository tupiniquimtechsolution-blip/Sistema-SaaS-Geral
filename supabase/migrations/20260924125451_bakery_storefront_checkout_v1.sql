-- Wave 01: server-validated storefront checkout for the canonical bakery demo.
-- Public table writes remain denied; checkout is the only anon write surface.

revoke insert, update, delete, truncate, references, trigger on table public.products from anon;
revoke insert, update, delete, truncate, references, trigger on table public.product_categories from anon;
revoke insert, update, delete, truncate, references, trigger on table public.orders from anon;
revoke insert, update, delete, truncate, references, trigger on table public.order_items from anon;

-- Seed the canonical Fornalha demo catalog without hardcoding generated UUIDs.
with tenant as (
  select id from public.tenants where slug = 'fornalha-demo' and vertical_id = 'bakery' limit 1
), seed(slug,name,position) as (
  values
    ('paes','Pães',0),('folhados','Folhados',1),('salgados','Salgados',2),
    ('doces','Doces & Bolos',3),('cafe','Cafés',4),('sanduiches','Sanduíches',5),('combos','Combos & Cestas',6)
)
insert into public.product_categories (tenant_id, slug, name, position, is_active)
select tenant.id, seed.slug, seed.name, seed.position, true from tenant cross join seed
on conflict (tenant_id, slug) do update set name=excluded.name, position=excluded.position, is_active=true, updated_at=now();

with tenant as (
  select id from public.tenants where slug = 'fornalha-demo' and vertical_id = 'bakery' limit 1
), seed(slug,name,category_slug,description,short_description,base_price,metadata) as (
  values
  ('sourdough-da-casa','Sourdough da Casa','paes','Assado duas vezes ao dia em forno de lastro, com levain e fermentação lenta.','Fermentação de 48h, casca grossa e miolo úmido.',28.00,'{"legacy_id":"p01","featured":true,"bestseller":true,"options":[{"id":"peso","name":"Peso","values":[{"id":"500","label":"500g","delta":0},{"id":"1kg","label":"1kg","delta":14}]}]}'::jsonb),
  ('pao-fermentacao-48h','Pão de Fermentação Lenta','paes','Integral de fermentação longa com sementes tostadas.','Integral de fermentação longa, com sementes tostadas na casca.',26.00,'{"legacy_id":"p02","featured":true,"is_new":true,"original_price":32}'::jsonb),
  ('baguete-classica','Baguete Clássica','paes','Trigo francês, poolish e vapor no forno.','Casca que estala, miolo aberto.',14.00,'{"legacy_id":"p03","bestseller":true}'::jsonb),
  ('pao-de-queijo-mineiro','Pão de Queijo Mineiro','salgados','Polvilho de Minas, queijo canastra e ovos caipiras.','Polvilho de Minas, queijo canastra curado. Caixa com 6.',18.00,'{"legacy_id":"p04","featured":true,"bestseller":true}'::jsonb),
  ('croissant-de-manteiga','Croissant de Manteiga','folhados','Laminado à mão com manteiga e fermentação lenta.','27 camadas de manteiga francesa. O favorito da casa.',12.00,'{"legacy_id":"p05","featured":true,"bestseller":true}'::jsonb),
  ('croissant-de-amendoas','Croissant de Amêndoas','folhados','Croissant recheado com frangipane e amêndoas tostadas.','Recheado com creme de amêndoas.',16.00,'{"legacy_id":"p06","is_new":true}'::jsonb),
  ('bolo-chocolate-70','Bolo de Chocolate 70%','doces','Massa úmida de cacau e ganache de chocolate 70%.','Chocolate 70% de origem baiana, ganache brilhante.',15.00,'{"legacy_id":"p07","featured":true,"options":[{"id":"formato","name":"Formato","values":[{"id":"fatia","label":"Fatia","delta":0},{"id":"inteiro","label":"Inteiro (12 fatias)","delta":89}]}]}'::jsonb),
  ('bolo-cenoura-brigadeiro','Bolo de Cenoura com Brigadeiro','doces','Bolo de cenoura com cobertura de brigadeiro.','O clássico brasileiro, com brigadeiro de cacau 50%.',13.00,'{"legacy_id":"p08","bestseller":true}'::jsonb),
  ('cappuccino-da-casa','Cappuccino da Casa','cafe','Espresso duplo com leite vaporizado.','Espresso duplo, leite vaporizado e canela fresca.',11.00,'{"legacy_id":"p09","featured":true,"bestseller":true,"options":[{"id":"tamanho","name":"Tamanho","values":[{"id":"200","label":"200ml","delta":0},{"id":"300","label":"300ml","delta":3}]}]}'::jsonb),
  ('espresso-duplo','Espresso Duplo','cafe','Blend da semana moído na hora.','18g de café, extração de 27 segundos.',8.00,'{"legacy_id":"p10"}'::jsonb),
  ('cafe-coado-v60','Café Coado na V60','cafe','Microlote do Cerrado Mineiro coado na V60.','Origem única do Cerrado Mineiro, moído na hora.',10.00,'{"legacy_id":"p11","is_new":true}'::jsonb),
  ('sanduiche-da-fornalha','Sanduíche da Fornalha','sanduiches','Pernil, queijo meia-cura, rúcula e maionese de alho no pão da casa.','Pernil desfiado 12h, queijo derretido e rúcula no sourdough.',26.00,'{"legacy_id":"p12","featured":true,"bestseller":true,"options":[{"id":"pao","name":"Pão","values":[{"id":"sourdough","label":"Sourdough","delta":0},{"id":"baguete","label":"Baguete","delta":0}]}],"extras":[{"id":"queijo","name":"Queijo extra","price":5},{"id":"bacon","name":"Bacon crocante","price":6},{"id":"ovo","name":"Ovo caipira","price":4}]}'::jsonb),
  ('manteiga-da-casa','Manteiga Artesanal','paes','Manteiga artesanal com flor de sal.','Batida na casa, com flor de sal. Pote de 200g.',22.00,'{"legacy_id":"p13"}'::jsonb),
  ('combo-manha-fornalha','Combo Manhã da Fornalha','combos','Croissant de manteiga com cappuccino 200ml.','Croissant de manteiga + cappuccino 200ml.',19.90,'{"legacy_id":"p14","featured":true}'::jsonb),
  ('combo-duplo','Combo Duplo','combos','Dois cappuccinos e duas caixas de pão de queijo.','2 cappuccinos + 2 caixas de pão de queijo.',44.90,'{"legacy_id":"p15"}'::jsonb),
  ('cesta-de-cafe-da-manha','Cesta de Café da Manhã','combos','Cesta completa para duas pessoas.','Pães, folhados, geleias, frutas e café para 2 pessoas.',89.00,'{"legacy_id":"p16","featured":true}'::jsonb)
)
insert into public.products (tenant_id,category_id,slug,name,description,short_description,base_price,currency,status,availability,metadata)
select tenant.id,c.id,seed.slug,seed.name,seed.description,seed.short_description,seed.base_price,'BRL','active','{"available":true}'::jsonb,seed.metadata
from tenant cross join seed join public.product_categories c on c.tenant_id=tenant.id and c.slug=seed.category_slug
on conflict (tenant_id,slug) do update set category_id=excluded.category_id,name=excluded.name,description=excluded.description,short_description=excluded.short_description,base_price=excluded.base_price,status='active',availability=excluded.availability,metadata=excluded.metadata,updated_at=now();

create or replace function public.create_storefront_order(
  p_tenant_slug text,
  p_items jsonb,
  p_customer jsonb default '{}'::jsonb,
  p_fulfillment jsonb default '{}'::jsonb,
  p_fulfillment_type text default 'pickup',
  p_idempotency_key text default null,
  p_notes text default null
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_tenant_id uuid;
  v_order_id uuid;
  v_order_number bigint;
  v_subtotal numeric := 0;
  v_delivery_fee numeric := 0;
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
begin
  if p_tenant_slug is null or length(p_tenant_slug) > 120 then raise exception 'invalid tenant'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items)=0 or jsonb_array_length(p_items)>50 then raise exception 'invalid items'; end if;
  if p_fulfillment_type not in ('pickup','delivery') then raise exception 'invalid fulfillment type'; end if;
  if p_notes is not null and length(p_notes)>1000 then raise exception 'notes too long'; end if;
  if pg_column_size(coalesce(p_customer,'{}'::jsonb))>8192 or pg_column_size(coalesce(p_fulfillment,'{}'::jsonb))>8192 then raise exception 'payload too large'; end if;

  select id into v_tenant_id from public.tenants where slug=p_tenant_slug and vertical_id='bakery' and status in ('demo','trialing','active') limit 1;
  if v_tenant_id is null then raise exception 'tenant not available'; end if;

  if p_idempotency_key is not null then
    select id,order_number,total,status into v_existing from public.orders where tenant_id=v_tenant_id and idempotency_key=p_idempotency_key limit 1;
    if found then return jsonb_build_object('id',v_existing.id,'order_number',v_existing.order_number,'total',v_existing.total,'status',v_existing.status,'replayed',true); end if;
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_qty := nullif(v_item->>'quantity','')::numeric;
    if v_qty is null or v_qty <= 0 or v_qty > 100 or trunc(v_qty)<>v_qty then raise exception 'invalid quantity'; end if;
    select id,name,sku,base_price,metadata into v_product from public.products
      where tenant_id=v_tenant_id and slug=v_item->>'slug' and status='active' and coalesce((availability->>'available')::boolean,true)=true limit 1;
    if not found then raise exception 'product unavailable'; end if;
    v_unit_price := v_product.base_price;

    if jsonb_typeof(coalesce(v_item->'options','[]'::jsonb)) <> 'array' or jsonb_array_length(coalesce(v_item->'options','[]'::jsonb))>20 then raise exception 'invalid options'; end if;
    for v_option in select value from jsonb_array_elements(coalesce(v_item->'options','[]'::jsonb)) loop
      select value into v_allowed from jsonb_array_elements(coalesce(v_product.metadata->'options','[]'::jsonb)) o where o->>'id'=v_option->>'group_id' limit 1;
      if v_allowed is null then raise exception 'invalid option group'; end if;
      select coalesce((value->>'delta')::numeric,0) into v_delta from jsonb_array_elements(coalesce(v_allowed->'values','[]'::jsonb)) ov where ov->>'id'=v_option->>'value_id' limit 1;
      if v_delta is null then raise exception 'invalid option value'; end if;
      v_unit_price := v_unit_price + v_delta;
      v_allowed := null;
    end loop;

    if jsonb_typeof(coalesce(v_item->'extras','[]'::jsonb)) <> 'array' or jsonb_array_length(coalesce(v_item->'extras','[]'::jsonb))>20 then raise exception 'invalid extras'; end if;
    for v_extra in select value from jsonb_array_elements(coalesce(v_item->'extras','[]'::jsonb)) loop
      select (value->>'price')::numeric into v_delta from jsonb_array_elements(coalesce(v_product.metadata->'extras','[]'::jsonb)) ex where ex->>'id'=v_extra->>'id' limit 1;
      if v_delta is null then raise exception 'invalid extra'; end if;
      v_unit_price := v_unit_price + v_delta;
      v_delta := null;
    end loop;
    v_subtotal := v_subtotal + (v_unit_price * v_qty);
  end loop;

  if p_fulfillment_type='delivery' then
    v_delivery_fee := case when v_subtotal >= 79 then 0 else 8.90 end;
  end if;
  v_total := v_subtotal + v_delivery_fee;

  perform pg_advisory_xact_lock(hashtextextended(v_tenant_id::text,0));
  select coalesce(max(order_number),0)+1 into v_order_number from public.orders where tenant_id=v_tenant_id;
  insert into public.orders(tenant_id,order_number,status,fulfillment_type,currency,subtotal,discount_total,delivery_fee,total,customer_snapshot,fulfillment_snapshot,notes,source,idempotency_key,created_by)
  values(v_tenant_id,v_order_number,'pending',p_fulfillment_type,'BRL',v_subtotal,0,v_delivery_fee,v_total,coalesce(p_customer,'{}'::jsonb),coalesce(p_fulfillment,'{}'::jsonb),p_notes,'web',p_idempotency_key,auth.uid()) returning id into v_order_id;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_qty := (v_item->>'quantity')::numeric;
    select id,name,sku,base_price,metadata into v_product from public.products where tenant_id=v_tenant_id and slug=v_item->>'slug' and status='active' limit 1;
    v_unit_price := v_product.base_price;
    for v_option in select value from jsonb_array_elements(coalesce(v_item->'options','[]'::jsonb)) loop
      select value into v_allowed from jsonb_array_elements(coalesce(v_product.metadata->'options','[]'::jsonb)) o where o->>'id'=v_option->>'group_id' limit 1;
      select coalesce((value->>'delta')::numeric,0) into v_delta from jsonb_array_elements(coalesce(v_allowed->'values','[]'::jsonb)) ov where ov->>'id'=v_option->>'value_id' limit 1;
      v_unit_price := v_unit_price + coalesce(v_delta,0);
    end loop;
    for v_extra in select value from jsonb_array_elements(coalesce(v_item->'extras','[]'::jsonb)) loop
      select (value->>'price')::numeric into v_delta from jsonb_array_elements(coalesce(v_product.metadata->'extras','[]'::jsonb)) ex where ex->>'id'=v_extra->>'id' limit 1;
      v_unit_price := v_unit_price + coalesce(v_delta,0);
    end loop;
    insert into public.order_items(tenant_id,order_id,product_id,name_snapshot,sku_snapshot,quantity,unit_price,options_snapshot,line_total)
      values(v_tenant_id,v_order_id,v_product.id,v_product.name,v_product.sku,v_qty,v_unit_price,jsonb_build_object('options',coalesce(v_item->'options','[]'::jsonb),'extras',coalesce(v_item->'extras','[]'::jsonb)),v_unit_price*v_qty);
  end loop;

  return jsonb_build_object('id',v_order_id,'order_number',v_order_number,'subtotal',v_subtotal,'delivery_fee',v_delivery_fee,'total',v_total,'status','pending','replayed',false);
exception when unique_violation then
  if p_idempotency_key is not null then
    select id,order_number,total,status into v_existing from public.orders where tenant_id=v_tenant_id and idempotency_key=p_idempotency_key limit 1;
    if found then return jsonb_build_object('id',v_existing.id,'order_number',v_existing.order_number,'total',v_existing.total,'status',v_existing.status,'replayed',true); end if;
  end if;
  raise;
end;
$$;

revoke all on function public.create_storefront_order(text,jsonb,jsonb,jsonb,text,text,text) from public;
grant execute on function public.create_storefront_order(text,jsonb,jsonb,jsonb,text,text,text) to anon, authenticated;
comment on function public.create_storefront_order(text,jsonb,jsonb,jsonb,text,text,text) is 'Server-validated storefront checkout: tenant/product scope and prices are resolved in Postgres; direct anon writes stay revoked.';
