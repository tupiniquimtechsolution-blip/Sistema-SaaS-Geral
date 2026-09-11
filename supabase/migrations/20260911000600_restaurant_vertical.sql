-- Restaurant vertical: menu composition, allergen metadata and reservation details.

create table if not exists public.menus (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  location_id uuid references public.locations(id) on delete cascade,
  slug text not null,
  name text not null,
  description text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  valid_from date,
  valid_until date,
  dayparts text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create table if not exists public.menu_sections (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  menu_id uuid not null references public.menus(id) on delete cascade,
  name text not null,
  description text,
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  section_id uuid not null references public.menu_sections(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name text not null,
  description text,
  price_cents integer check (price_cents is null or price_cents >= 0),
  currency text not null default 'BRL',
  image_asset_id uuid references public.media_assets(id) on delete set null,
  is_active boolean not null default true,
  is_available boolean not null default true,
  position integer not null default 0,
  dietary_tags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists menu_items_section_position_idx on public.menu_items(section_id, position);

create table if not exists public.allergens (
  key text primary key,
  name text not null,
  description text
);

create table if not exists public.menu_item_allergens (
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  allergen_key text not null references public.allergens(key) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contains boolean not null default true,
  may_contain boolean not null default false,
  primary key (menu_item_id, allergen_key)
);

create table if not exists public.restaurant_reservation_details (
  booking_id uuid primary key references public.bookings(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  seating_area text,
  occasion text,
  accessibility_needs text,
  high_chair_count integer not null default 0 check (high_chair_count >= 0),
  table_preference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seed common allergen vocabulary; tenants can render localized labels.
insert into public.allergens(key,name) values
  ('gluten','Glúten'),
  ('crustaceans','Crustáceos'),
  ('eggs','Ovos'),
  ('fish','Peixes'),
  ('peanuts','Amendoim'),
  ('soy','Soja'),
  ('milk','Leite'),
  ('tree_nuts','Castanhas/Nozes'),
  ('celery','Aipo'),
  ('mustard','Mostarda'),
  ('sesame','Gergelim'),
  ('sulfites','Sulfitos'),
  ('lupin','Tremoço'),
  ('mollusks','Moluscos')
on conflict (key) do update set name=excluded.name;

-- Triggers

do $$
declare t text;
begin
  foreach t in array array['menus','menu_sections','menu_items','restaurant_reservation_details'] loop
    execute format('drop trigger if exists trg_%I_updated_at on public.%I', t, t);
    execute format('create trigger trg_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- RLS
alter table public.menus enable row level security;
alter table public.menu_sections enable row level security;
alter table public.menu_items enable row level security;
alter table public.allergens enable row level security;
alter table public.menu_item_allergens enable row level security;
alter table public.restaurant_reservation_details enable row level security;

create policy allergens_public_read on public.allergens for select using (true);
create policy menus_public_read on public.menus for select using (status='published' and exists(select 1 from public.tenants t where t.id=tenant_id and t.status in ('demo','trialing','active')));
create policy menu_sections_public_read on public.menu_sections for select using (is_active and exists(select 1 from public.menus m join public.tenants t on t.id=m.tenant_id where m.id=menu_id and m.status='published' and t.status in ('demo','trialing','active')));
create policy menu_items_public_read on public.menu_items for select using (is_active and is_available and exists(select 1 from public.menu_sections s join public.menus m on m.id=s.menu_id join public.tenants t on t.id=m.tenant_id where s.id=section_id and s.is_active and m.status='published' and t.status in ('demo','trialing','active')));
create policy menu_item_allergens_public_read on public.menu_item_allergens for select using (exists(select 1 from public.tenants t where t.id=tenant_id and t.status in ('demo','trialing','active')));

create policy menus_admin_all on public.menus for all to authenticated using (public.has_tenant_permission(tenant_id,'catalog.write')) with check (public.has_tenant_permission(tenant_id,'catalog.write'));
create policy menu_sections_admin_all on public.menu_sections for all to authenticated using (public.has_tenant_permission(tenant_id,'catalog.write')) with check (public.has_tenant_permission(tenant_id,'catalog.write'));
create policy menu_items_admin_all on public.menu_items for all to authenticated using (public.has_tenant_permission(tenant_id,'catalog.write')) with check (public.has_tenant_permission(tenant_id,'catalog.write'));
create policy menu_item_allergens_admin_all on public.menu_item_allergens for all to authenticated using (public.has_tenant_permission(tenant_id,'catalog.write')) with check (public.has_tenant_permission(tenant_id,'catalog.write'));
create policy restaurant_reservation_details_read on public.restaurant_reservation_details for select to authenticated using (public.has_tenant_permission(tenant_id,'booking.read'));
create policy restaurant_reservation_details_write on public.restaurant_reservation_details for all to authenticated using (public.has_tenant_permission(tenant_id,'booking.write')) with check (public.has_tenant_permission(tenant_id,'booking.write'));

grant select on public.menus, public.menu_sections, public.menu_items, public.allergens, public.menu_item_allergens to anon;
grant select, insert, update, delete on public.menus, public.menu_sections, public.menu_items, public.menu_item_allergens, public.restaurant_reservation_details to authenticated;
grant select on public.allergens to authenticated;
