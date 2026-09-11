-- Pet Shop vertical. Intentionally excludes veterinary medical records.

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  name text not null,
  species text not null,
  breed text,
  birth_date date,
  approximate_age_years numeric,
  weight_kg numeric,
  sex text check (sex is null or sex in ('female','male','unknown')),
  avatar_asset_id uuid references public.media_assets(id) on delete set null,
  grooming_preferences jsonb not null default '{}'::jsonb,
  behavior_notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pets_tenant_contact_idx on public.pets(tenant_id, contact_id);

create table if not exists public.pet_service_history (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  resource_id uuid references public.service_resources(id) on delete set null,
  occurred_at timestamptz not null default now(),
  public_summary text,
  internal_notes text,
  before_media_asset_id uuid references public.media_assets(id) on delete set null,
  after_media_asset_id uuid references public.media_assets(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists pet_service_history_pet_idx on public.pet_service_history(pet_id, occurred_at desc);

alter table public.bookings add column if not exists pet_id uuid references public.pets(id) on delete set null;

create table if not exists public.loyalty_accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  points_balance bigint not null default 0,
  tier text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, contact_id)
);

create table if not exists public.loyalty_transactions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  account_id uuid not null references public.loyalty_accounts(id) on delete cascade,
  points_delta bigint not null,
  reason text not null,
  reference_type text,
  reference_id text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists loyalty_transactions_account_idx on public.loyalty_transactions(account_id, created_at desc);

-- Permission seed
insert into public.permissions(key,description) values
  ('pets.read','Read tenant pet profiles and service history'),
  ('pets.write','Manage tenant pet profiles and service history'),
  ('loyalty.read','Read loyalty accounts'),
  ('loyalty.write','Manage loyalty balances and transactions')
on conflict (key) do update set description=excluded.description;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p
where r.tenant_id is null and r.key in ('owner','admin')
on conflict do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on p.key=any(array['pets.read','pets.write','loyalty.read','loyalty.write'])
where r.tenant_id is null and r.key in ('manager','support')
on conflict do nothing;

-- Triggers
 drop trigger if exists trg_pets_updated_at on public.pets;
 create trigger trg_pets_updated_at before update on public.pets for each row execute function public.set_updated_at();
 drop trigger if exists trg_loyalty_accounts_updated_at on public.loyalty_accounts;
 create trigger trg_loyalty_accounts_updated_at before update on public.loyalty_accounts for each row execute function public.set_updated_at();

-- RLS
alter table public.pets enable row level security;
alter table public.pet_service_history enable row level security;
alter table public.loyalty_accounts enable row level security;
alter table public.loyalty_transactions enable row level security;

create policy pets_read on public.pets for select to authenticated using (public.has_tenant_permission(tenant_id,'pets.read'));
create policy pets_write on public.pets for all to authenticated using (public.has_tenant_permission(tenant_id,'pets.write')) with check (public.has_tenant_permission(tenant_id,'pets.write'));
create policy pet_history_read on public.pet_service_history for select to authenticated using (public.has_tenant_permission(tenant_id,'pets.read'));
create policy pet_history_write on public.pet_service_history for all to authenticated using (public.has_tenant_permission(tenant_id,'pets.write')) with check (public.has_tenant_permission(tenant_id,'pets.write'));
create policy loyalty_accounts_read on public.loyalty_accounts for select to authenticated using (public.has_tenant_permission(tenant_id,'loyalty.read'));
create policy loyalty_accounts_write on public.loyalty_accounts for all to authenticated using (public.has_tenant_permission(tenant_id,'loyalty.write')) with check (public.has_tenant_permission(tenant_id,'loyalty.write'));
create policy loyalty_transactions_read on public.loyalty_transactions for select to authenticated using (public.has_tenant_permission(tenant_id,'loyalty.read'));
create policy loyalty_transactions_write on public.loyalty_transactions for all to authenticated using (public.has_tenant_permission(tenant_id,'loyalty.write')) with check (public.has_tenant_permission(tenant_id,'loyalty.write'));

grant select, insert, update, delete on public.pets, public.pet_service_history, public.loyalty_accounts, public.loyalty_transactions to authenticated;
grant usage, select on all sequences in schema public to authenticated;
