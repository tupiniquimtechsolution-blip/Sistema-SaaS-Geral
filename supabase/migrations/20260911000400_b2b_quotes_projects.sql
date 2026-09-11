-- Shared B2B module for LED / visual communication and heavy-machinery verticals.

insert into public.permissions(key, description) values
  ('inventory.read','Read inventory and availability'),
  ('inventory.write','Manage inventory and availability'),
  ('projects.read','Read projects/installations'),
  ('projects.write','Manage projects/installations'),
  ('documents.read','Read tenant documents'),
  ('documents.write','Manage tenant documents'),
  ('support.read','Read support/warranty records'),
  ('support.write','Manage support/warranty records')
on conflict (key) do update set description=excluded.description;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p
where r.tenant_id is null and r.key in ('owner','admin')
on conflict do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on p.key=any(array[
  'inventory.read','inventory.write','projects.read','projects.write','documents.read','documents.write','support.read','support.write'
]) where r.tenant_id is null and r.key='manager'
on conflict do nothing;

create table if not exists public.equipment_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  parent_id uuid references public.equipment_categories(id) on delete set null,
  slug text not null,
  name text not null,
  description text,
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create table if not exists public.equipment (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  category_id uuid references public.equipment_categories(id) on delete set null,
  location_id uuid references public.locations(id) on delete set null,
  slug text not null,
  inventory_code text,
  condition text not null default 'new' check (condition in ('new','used','refurbished','rental')),
  brand text,
  model text,
  year integer,
  hours_used numeric,
  title text not null,
  description text,
  price_cents bigint check (price_cents is null or price_cents >= 0),
  price_mode text not null default 'on_request' check (price_mode in ('fixed','from','on_request')),
  currency text not null default 'BRL',
  availability_status text not null default 'available' check (availability_status in ('available','reserved','sold','rented','maintenance','unavailable')),
  technical_specs jsonb not null default '{}'::jsonb,
  features jsonb not null default '[]'::jsonb,
  is_public boolean not null default true,
  is_featured boolean not null default false,
  seo jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create unique index if not exists equipment_inventory_code_uidx on public.equipment(tenant_id, lower(inventory_code)) where inventory_code is not null;
create index if not exists equipment_tenant_status_idx on public.equipment(tenant_id, availability_status);

create table if not exists public.equipment_media (
  equipment_id uuid not null references public.equipment(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  position integer not null default 0,
  is_primary boolean not null default false,
  primary key (equipment_id, media_asset_id)
);

create unique index if not exists equipment_media_one_primary_uidx on public.equipment_media(equipment_id) where is_primary;

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  location_id uuid references public.locations(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  equipment_id uuid references public.equipment(id) on delete cascade,
  sku text,
  quantity numeric not null default 0,
  reserved_quantity numeric not null default 0,
  reorder_point numeric,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (product_id is not null or equipment_id is not null),
  check (reserved_quantity >= 0)
);

create index if not exists inventory_items_tenant_location_idx on public.inventory_items(tenant_id, location_id);

create table if not exists public.technical_solutions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  slug text not null,
  category text,
  name text not null,
  description text,
  application text,
  specifications jsonb not null default '{}'::jsonb,
  configuration_schema jsonb not null default '{}'::jsonb,
  is_public boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create table if not exists public.site_surveys (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  location_id uuid references public.locations(id) on delete set null,
  assigned_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'requested' check (status in ('requested','scheduled','completed','canceled')),
  scheduled_for timestamptz,
  site_address jsonb not null default '{}'::jsonb,
  measurements jsonb not null default '{}'::jsonb,
  requirements jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  assigned_user_id uuid references auth.users(id) on delete set null,
  quote_number text not null,
  status text not null default 'draft' check (status in ('draft','sent','viewed','accepted','rejected','expired','canceled')),
  currency text not null default 'BRL',
  subtotal_cents bigint not null default 0,
  discount_cents bigint not null default 0,
  tax_cents bigint not null default 0,
  total_cents bigint not null default 0,
  valid_until date,
  terms text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, quote_number)
);

create index if not exists quotes_tenant_status_idx on public.quotes(tenant_id, status, created_at desc);

create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  quote_id uuid not null references public.quotes(id) on delete cascade,
  item_type text not null default 'custom' check (item_type in ('product','equipment','service','solution','custom')),
  reference_id uuid,
  description text not null,
  quantity numeric not null default 1 check (quantity > 0),
  unit_price_cents bigint not null default 0,
  line_total_cents bigint not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.proposal_versions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  quote_id uuid not null references public.quotes(id) on delete cascade,
  version integer not null check (version > 0),
  document_asset_id uuid references public.media_assets(id) on delete set null,
  content_snapshot jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (quote_id, version)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  quote_id uuid references public.quotes(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  location_id uuid references public.locations(id) on delete set null,
  project_code text not null,
  project_type text,
  name text not null,
  status text not null default 'planned' check (status in ('planned','approved','in_progress','on_hold','installed','completed','canceled')),
  start_date date,
  target_date date,
  completed_at timestamptz,
  assigned_user_id uuid references auth.users(id) on delete set null,
  specifications jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, project_code)
);

create index if not exists projects_tenant_status_idx on public.projects(tenant_id, status);

create table if not exists public.project_updates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  update_type text not null default 'note',
  title text,
  body text,
  visibility text not null default 'internal' check (visibility in ('internal','client')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  quote_id uuid references public.quotes(id) on delete set null,
  media_asset_id uuid not null references public.media_assets(id) on delete cascade,
  document_type text not null,
  title text not null,
  visibility text not null default 'private' check (visibility in ('private','client','public')),
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists documents_tenant_type_idx on public.documents(tenant_id, document_type);

create table if not exists public.trade_in_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  status text not null default 'requested' check (status in ('requested','under_review','valued','accepted','rejected','canceled')),
  equipment_data jsonb not null default '{}'::jsonb,
  estimated_value_cents bigint,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.financing_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  quote_id uuid references public.quotes(id) on delete set null,
  status text not null default 'requested' check (status in ('requested','submitted','approved','rejected','canceled')),
  requested_amount_cents bigint,
  provider text,
  provider_reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.warranty_records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  equipment_id uuid references public.equipment(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  serial_number text,
  starts_at date,
  ends_at date,
  terms text,
  status text not null default 'active' check (status in ('active','expired','void','transferred')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  equipment_id uuid references public.equipment(id) on delete set null,
  warranty_id uuid references public.warranty_records(id) on delete set null,
  assigned_user_id uuid references auth.users(id) on delete set null,
  ticket_number text not null,
  category text,
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  status text not null default 'open' check (status in ('open','in_progress','waiting_customer','resolved','closed','canceled')),
  subject text not null,
  description text,
  resolution text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz,
  unique (tenant_id, ticket_number)
);

-- updated_at triggers

do $$
declare t text;
begin
  foreach t in array array['equipment_categories','equipment','inventory_items','technical_solutions','site_surveys','quotes','projects','trade_in_requests','financing_requests','warranty_records','support_tickets'] loop
    execute format('drop trigger if exists trg_%I_updated_at on public.%I', t, t);
    execute format('create trigger trg_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- RLS
alter table public.equipment_categories enable row level security;
alter table public.equipment enable row level security;
alter table public.equipment_media enable row level security;
alter table public.inventory_items enable row level security;
alter table public.technical_solutions enable row level security;
alter table public.site_surveys enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.proposal_versions enable row level security;
alter table public.projects enable row level security;
alter table public.project_updates enable row level security;
alter table public.documents enable row level security;
alter table public.trade_in_requests enable row level security;
alter table public.financing_requests enable row level security;
alter table public.warranty_records enable row level security;
alter table public.support_tickets enable row level security;

-- Public showroom/catalog
create policy equipment_categories_public_read on public.equipment_categories for select using (is_active and exists(select 1 from public.tenants t where t.id=tenant_id and t.status in ('demo','trialing','active')));
create policy equipment_public_read on public.equipment for select using (is_public and availability_status <> 'unavailable' and exists(select 1 from public.tenants t where t.id=tenant_id and t.status in ('demo','trialing','active')));
create policy equipment_media_public_read on public.equipment_media for select using (exists(select 1 from public.tenants t where t.id=tenant_id and t.status in ('demo','trialing','active')));
create policy technical_solutions_public_read on public.technical_solutions for select using (is_public and is_active and exists(select 1 from public.tenants t where t.id=tenant_id and t.status in ('demo','trialing','active')));

-- Inventory/catalog administration
create policy equipment_categories_admin_all on public.equipment_categories for all to authenticated using (public.has_tenant_permission(tenant_id,'inventory.write')) with check (public.has_tenant_permission(tenant_id,'inventory.write'));
create policy equipment_admin_all on public.equipment for all to authenticated using (public.has_tenant_permission(tenant_id,'inventory.write')) with check (public.has_tenant_permission(tenant_id,'inventory.write'));
create policy equipment_media_admin_all on public.equipment_media for all to authenticated using (public.has_tenant_permission(tenant_id,'inventory.write')) with check (public.has_tenant_permission(tenant_id,'inventory.write'));
create policy inventory_read on public.inventory_items for select to authenticated using (public.has_tenant_permission(tenant_id,'inventory.read'));
create policy inventory_write on public.inventory_items for all to authenticated using (public.has_tenant_permission(tenant_id,'inventory.write')) with check (public.has_tenant_permission(tenant_id,'inventory.write'));
create policy technical_solutions_admin_all on public.technical_solutions for all to authenticated using (public.has_tenant_permission(tenant_id,'catalog.write')) with check (public.has_tenant_permission(tenant_id,'catalog.write'));

-- Sales/quotes
create policy site_surveys_quotes_read on public.site_surveys for select to authenticated using (public.has_tenant_permission(tenant_id,'quotes.read'));
create policy site_surveys_quotes_write on public.site_surveys for all to authenticated using (public.has_tenant_permission(tenant_id,'quotes.write')) with check (public.has_tenant_permission(tenant_id,'quotes.write'));
create policy quotes_read on public.quotes for select to authenticated using (public.has_tenant_permission(tenant_id,'quotes.read'));
create policy quotes_write on public.quotes for all to authenticated using (public.has_tenant_permission(tenant_id,'quotes.write')) with check (public.has_tenant_permission(tenant_id,'quotes.write'));
create policy quote_items_read on public.quote_items for select to authenticated using (public.has_tenant_permission(tenant_id,'quotes.read'));
create policy quote_items_write on public.quote_items for all to authenticated using (public.has_tenant_permission(tenant_id,'quotes.write')) with check (public.has_tenant_permission(tenant_id,'quotes.write'));
create policy proposal_versions_read on public.proposal_versions for select to authenticated using (public.has_tenant_permission(tenant_id,'quotes.read'));
create policy proposal_versions_write on public.proposal_versions for all to authenticated using (public.has_tenant_permission(tenant_id,'quotes.write')) with check (public.has_tenant_permission(tenant_id,'quotes.write'));
create policy tradein_read on public.trade_in_requests for select to authenticated using (public.has_tenant_permission(tenant_id,'quotes.read'));
create policy tradein_write on public.trade_in_requests for all to authenticated using (public.has_tenant_permission(tenant_id,'quotes.write')) with check (public.has_tenant_permission(tenant_id,'quotes.write'));
create policy financing_read on public.financing_requests for select to authenticated using (public.has_tenant_permission(tenant_id,'quotes.read'));
create policy financing_write on public.financing_requests for all to authenticated using (public.has_tenant_permission(tenant_id,'quotes.write')) with check (public.has_tenant_permission(tenant_id,'quotes.write'));

-- Projects/documents/support
create policy projects_read on public.projects for select to authenticated using (public.has_tenant_permission(tenant_id,'projects.read'));
create policy projects_write on public.projects for all to authenticated using (public.has_tenant_permission(tenant_id,'projects.write')) with check (public.has_tenant_permission(tenant_id,'projects.write'));
create policy project_updates_read on public.project_updates for select to authenticated using (public.has_tenant_permission(tenant_id,'projects.read'));
create policy project_updates_write on public.project_updates for all to authenticated using (public.has_tenant_permission(tenant_id,'projects.write')) with check (public.has_tenant_permission(tenant_id,'projects.write'));
create policy documents_read on public.documents for select to authenticated using (public.has_tenant_permission(tenant_id,'documents.read'));
create policy documents_write on public.documents for all to authenticated using (public.has_tenant_permission(tenant_id,'documents.write')) with check (public.has_tenant_permission(tenant_id,'documents.write'));
create policy warranty_read on public.warranty_records for select to authenticated using (public.has_tenant_permission(tenant_id,'support.read'));
create policy warranty_write on public.warranty_records for all to authenticated using (public.has_tenant_permission(tenant_id,'support.write')) with check (public.has_tenant_permission(tenant_id,'support.write'));
create policy support_read on public.support_tickets for select to authenticated using (public.has_tenant_permission(tenant_id,'support.read'));
create policy support_write on public.support_tickets for all to authenticated using (public.has_tenant_permission(tenant_id,'support.write')) with check (public.has_tenant_permission(tenant_id,'support.write'));

-- Grants
 grant select on public.equipment_categories, public.equipment, public.equipment_media, public.technical_solutions to anon;
 grant select, insert, update, delete on public.equipment_categories, public.equipment, public.equipment_media, public.inventory_items, public.technical_solutions, public.site_surveys, public.quotes, public.quote_items, public.proposal_versions, public.projects, public.project_updates, public.documents, public.trade_in_requests, public.financing_requests, public.warranty_records, public.support_tickets to authenticated;
 grant usage, select on all sequences in schema public to authenticated;
