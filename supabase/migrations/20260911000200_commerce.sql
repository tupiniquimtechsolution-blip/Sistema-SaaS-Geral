-- Shared commerce module: bakery, pet, restaurant and future retail verticals.

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  parent_id uuid references public.product_categories(id) on delete set null,
  slug text not null,
  name text not null,
  description text,
  image_asset_id uuid references public.media_assets(id) on delete set null,
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create index if not exists product_categories_tenant_position_idx on public.product_categories(tenant_id, position);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  category_id uuid references public.product_categories(id) on delete set null,
  slug text not null,
  sku text,
  name text not null,
  short_description text,
  description text,
  base_price_cents integer not null default 0 check (base_price_cents >= 0),
  compare_at_price_cents integer check (compare_at_price_cents is null or compare_at_price_cents >= 0),
  currency text not null default 'BRL',
  unit_label text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  is_available boolean not null default true,
  track_inventory boolean not null default false,
  stock_quantity integer,
  preparation_minutes integer,
  attributes jsonb not null default '{}'::jsonb,
  tags text[] not null default '{}',
  seo jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create unique index if not exists products_tenant_sku_uidx on public.products(tenant_id, lower(sku)) where sku is not null;
create index if not exists products_tenant_category_idx on public.products(tenant_id, category_id);
create index if not exists products_tags_gin_idx on public.products using gin(tags);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  sku text,
  name text not null,
  price_delta_cents integer not null default 0,
  absolute_price_cents integer check (absolute_price_cents is null or absolute_price_cents >= 0),
  is_active boolean not null default true,
  is_available boolean not null default true,
  track_inventory boolean not null default false,
  stock_quantity integer,
  attributes jsonb not null default '{}'::jsonb,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists product_variants_tenant_sku_uidx on public.product_variants(tenant_id, lower(sku)) where sku is not null;
create index if not exists product_variants_product_idx on public.product_variants(product_id, position);

create table if not exists public.product_modifier_groups (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  min_select integer not null default 0 check (min_select >= 0),
  max_select integer check (max_select is null or max_select >= 0),
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (max_select is null or max_select >= min_select)
);

create table if not exists public.product_modifiers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  group_id uuid not null references public.product_modifier_groups(id) on delete cascade,
  name text not null,
  price_delta_cents integer not null default 0,
  is_active boolean not null default true,
  position integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_media (
  product_id uuid not null references public.products(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  position integer not null default 0,
  is_primary boolean not null default false,
  primary key (product_id, media_asset_id)
);

create unique index if not exists product_media_one_primary_uidx on public.product_media(product_id) where is_primary;

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  code text not null,
  discount_type text not null check (discount_type in ('percent','fixed')),
  value integer not null check (value > 0),
  minimum_subtotal_cents integer not null default 0 check (minimum_subtotal_cents >= 0),
  maximum_discount_cents integer,
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit integer,
  per_contact_limit integer,
  current_usage integer not null default 0,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists coupons_tenant_code_uidx on public.coupons(tenant_id, lower(code));

create table if not exists public.fulfillment_methods (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  location_id uuid references public.locations(id) on delete cascade,
  kind text not null check (kind in ('pickup','delivery','dine_in','shipping','external')),
  name text not null,
  is_active boolean not null default true,
  fee_cents integer not null default 0 check (fee_cents >= 0),
  free_above_cents integer,
  min_order_cents integer not null default 0,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fulfillment_methods_tenant_idx on public.fulfillment_methods(tenant_id);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  location_id uuid references public.locations(id) on delete set null,
  fulfillment_method_id uuid references public.fulfillment_methods(id) on delete set null,
  public_code text not null,
  status text not null default 'pending' check (status in ('pending','confirmed','preparing','ready','out_for_delivery','completed','canceled','refunded')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','pending','paid','failed','refunded','partially_refunded')),
  currency text not null default 'BRL',
  subtotal_cents integer not null default 0 check (subtotal_cents >= 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  fulfillment_fee_cents integer not null default 0 check (fulfillment_fee_cents >= 0),
  tax_cents integer not null default 0 check (tax_cents >= 0),
  total_cents integer not null default 0 check (total_cents >= 0),
  coupon_id uuid references public.coupons(id) on delete set null,
  customer_name text,
  customer_email text,
  customer_phone text,
  fulfillment_address jsonb,
  scheduled_for timestamptz,
  notes text,
  idempotency_key text,
  source text not null default 'site',
  external_reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, public_code)
);

create unique index if not exists orders_tenant_idempotency_uidx on public.orders(tenant_id, idempotency_key) where idempotency_key is not null;
create index if not exists orders_tenant_status_created_idx on public.orders(tenant_id, status, created_at desc);
create index if not exists orders_contact_idx on public.orders(contact_id, created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  variant_name text,
  sku text,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  modifiers_total_cents integer not null default 0,
  line_total_cents integer not null check (line_total_cents >= 0),
  modifiers jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_idx on public.order_items(order_id);

create table if not exists public.order_status_history (
  id bigint generated always as identity primary key,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by uuid references auth.users(id) on delete set null,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists order_status_history_order_idx on public.order_status_history(order_id, created_at);

-- updated_at triggers

do $$
declare t text;
begin
  foreach t in array array['product_categories','products','product_variants','product_modifier_groups','product_modifiers','coupons','fulfillment_methods','orders'] loop
    execute format('drop trigger if exists trg_%I_updated_at on public.%I', t, t);
    execute format('create trigger trg_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- RLS
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_modifier_groups enable row level security;
alter table public.product_modifiers enable row level security;
alter table public.product_media enable row level security;
alter table public.coupons enable row level security;
alter table public.fulfillment_methods enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;

-- Public storefront reads
create policy product_categories_public_read on public.product_categories for select using (is_active and exists(select 1 from public.tenants t where t.id=tenant_id and t.status in ('demo','trialing','active')));
create policy products_public_read on public.products for select using (is_active and is_available and exists(select 1 from public.tenants t where t.id=tenant_id and t.status in ('demo','trialing','active')));
create policy product_variants_public_read on public.product_variants for select using (is_active and is_available and exists(select 1 from public.tenants t where t.id=tenant_id and t.status in ('demo','trialing','active')));
create policy modifier_groups_public_read on public.product_modifier_groups for select using (is_active and exists(select 1 from public.tenants t where t.id=tenant_id and t.status in ('demo','trialing','active')));
create policy modifiers_public_read on public.product_modifiers for select using (is_active and exists(select 1 from public.tenants t where t.id=tenant_id and t.status in ('demo','trialing','active')));
create policy product_media_public_read on public.product_media for select using (exists(select 1 from public.tenants t where t.id=tenant_id and t.status in ('demo','trialing','active')));
create policy fulfillment_public_read on public.fulfillment_methods for select using (is_active and exists(select 1 from public.tenants t where t.id=tenant_id and t.status in ('demo','trialing','active')));

-- Catalog admin
create policy categories_admin_write on public.product_categories for all to authenticated using (public.has_tenant_permission(tenant_id,'catalog.write')) with check (public.has_tenant_permission(tenant_id,'catalog.write'));
create policy products_admin_all on public.products for all to authenticated using (public.has_tenant_permission(tenant_id,'catalog.write')) with check (public.has_tenant_permission(tenant_id,'catalog.write'));
create policy variants_admin_all on public.product_variants for all to authenticated using (public.has_tenant_permission(tenant_id,'catalog.write')) with check (public.has_tenant_permission(tenant_id,'catalog.write'));
create policy modifier_groups_admin_all on public.product_modifier_groups for all to authenticated using (public.has_tenant_permission(tenant_id,'catalog.write')) with check (public.has_tenant_permission(tenant_id,'catalog.write'));
create policy modifiers_admin_all on public.product_modifiers for all to authenticated using (public.has_tenant_permission(tenant_id,'catalog.write')) with check (public.has_tenant_permission(tenant_id,'catalog.write'));
create policy product_media_admin_all on public.product_media for all to authenticated using (public.has_tenant_permission(tenant_id,'catalog.write')) with check (public.has_tenant_permission(tenant_id,'catalog.write'));
create policy coupons_admin_all on public.coupons for all to authenticated using (public.has_tenant_permission(tenant_id,'catalog.write')) with check (public.has_tenant_permission(tenant_id,'catalog.write'));
create policy fulfillment_admin_all on public.fulfillment_methods for all to authenticated using (public.has_tenant_permission(tenant_id,'tenant.settings.write')) with check (public.has_tenant_permission(tenant_id,'tenant.settings.write'));

-- Orders are private operational data.
create policy orders_admin_read on public.orders for select to authenticated using (public.has_tenant_permission(tenant_id,'orders.read'));
create policy orders_admin_insert on public.orders for insert to authenticated with check (public.has_tenant_permission(tenant_id,'orders.create'));
create policy orders_admin_update on public.orders for update to authenticated using (public.has_tenant_permission(tenant_id,'orders.status.write')) with check (public.has_tenant_permission(tenant_id,'orders.status.write'));
create policy order_items_admin_read on public.order_items for select to authenticated using (public.has_tenant_permission(tenant_id,'orders.read'));
create policy order_items_admin_write on public.order_items for all to authenticated using (public.has_tenant_permission(tenant_id,'orders.create')) with check (public.has_tenant_permission(tenant_id,'orders.create'));
create policy order_history_admin_read on public.order_status_history for select to authenticated using (public.has_tenant_permission(tenant_id,'orders.read'));

-- Order status audit trigger
create or replace function public.audit_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    insert into public.order_status_history(tenant_id,order_id,from_status,to_status,changed_by)
    values(new.tenant_id,new.id,old.status,new.status,auth.uid());
    insert into public.audit_logs(tenant_id,actor_user_id,action,resource_type,resource_id,metadata)
    values(new.tenant_id,auth.uid(),'order.status_changed','order',new.id::text,jsonb_build_object('from',old.status,'to',new.status));
  end if;
  return new;
end;
$$;

revoke all on function public.audit_order_status_change() from public;

drop trigger if exists trg_orders_status_audit on public.orders;
create trigger trg_orders_status_audit after update of status on public.orders for each row execute function public.audit_order_status_change();

-- Grants. RLS still controls access.
grant select on public.product_categories, public.products, public.product_variants, public.product_modifier_groups, public.product_modifiers, public.product_media, public.fulfillment_methods to anon;
grant select, insert, update, delete on public.product_categories, public.products, public.product_variants, public.product_modifier_groups, public.product_modifiers, public.product_media, public.coupons, public.fulfillment_methods, public.orders, public.order_items, public.order_status_history to authenticated;
grant usage, select on all sequences in schema public to authenticated;
