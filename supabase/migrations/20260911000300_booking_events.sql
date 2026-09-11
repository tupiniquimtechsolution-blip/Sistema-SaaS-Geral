-- Shared booking/events module for Pet, Restaurant, Temple and service-based verticals.

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  slug text not null,
  name text not null,
  description text,
  duration_minutes integer check (duration_minutes is null or duration_minutes > 0),
  price_cents integer check (price_cents is null or price_cents >= 0),
  currency text not null default 'BRL',
  is_active boolean not null default true,
  is_public boolean not null default true,
  requires_resource boolean not null default false,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create table if not exists public.service_resources (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  location_id uuid references public.locations(id) on delete set null,
  kind text not null default 'professional' check (kind in ('professional','room','table','equipment','other')),
  name text not null,
  description text,
  user_id uuid references auth.users(id) on delete set null,
  image_asset_id uuid references public.media_assets(id) on delete set null,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists service_resources_tenant_idx on public.service_resources(tenant_id);

create table if not exists public.service_resource_links (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  resource_id uuid not null references public.service_resources(id) on delete cascade,
  primary key (service_id, resource_id)
);

create table if not exists public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  location_id uuid references public.locations(id) on delete cascade,
  service_id uuid references public.services(id) on delete cascade,
  resource_id uuid references public.service_resources(id) on delete cascade,
  weekday smallint check (weekday is null or weekday between 0 and 6),
  start_time time,
  end_time time,
  valid_from date,
  valid_until date,
  timezone text not null default 'America/Sao_Paulo',
  capacity integer not null default 1 check (capacity > 0),
  is_available boolean not null default true,
  recurrence jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((start_time is null and end_time is null) or (start_time is not null and end_time is not null and start_time < end_time))
);

create index if not exists availability_rules_tenant_idx on public.availability_rules(tenant_id);
create index if not exists availability_rules_lookup_idx on public.availability_rules(tenant_id, service_id, resource_id, weekday);

create table if not exists public.availability_overrides (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  location_id uuid references public.locations(id) on delete cascade,
  service_id uuid references public.services(id) on delete cascade,
  resource_id uuid references public.service_resources(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_available boolean not null,
  capacity integer check (capacity is null or capacity > 0),
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at < ends_at)
);

create index if not exists availability_overrides_lookup_idx on public.availability_overrides(tenant_id, starts_at, ends_at);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  location_id uuid references public.locations(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  resource_id uuid references public.service_resources(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  public_code text not null,
  status text not null default 'requested' check (status in ('requested','confirmed','checked_in','completed','canceled','no_show','declined')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  party_size integer not null default 1 check (party_size > 0),
  customer_name text,
  customer_email text,
  customer_phone text,
  notes text,
  source text not null default 'site',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, public_code),
  check (starts_at < ends_at)
);

create index if not exists bookings_tenant_time_idx on public.bookings(tenant_id, starts_at);
create index if not exists bookings_resource_time_idx on public.bookings(resource_id, starts_at) where status in ('requested','confirmed','checked_in');

create table if not exists public.booking_status_history (
  id bigint generated always as identity primary key,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by uuid references auth.users(id) on delete set null,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists booking_status_history_booking_idx on public.booking_status_history(booking_id, created_at);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  location_id uuid references public.locations(id) on delete set null,
  slug text not null,
  event_type text not null default 'event',
  title text not null,
  description text,
  status text not null default 'draft' check (status in ('draft','published','canceled','completed','archived')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  capacity integer check (capacity is null or capacity >= 0),
  registration_mode text not null default 'none' check (registration_mode in ('none','booking','registration','external')),
  external_url text,
  image_asset_id uuid references public.media_assets(id) on delete set null,
  recurrence jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug),
  check (ends_at is null or starts_at < ends_at)
);

create index if not exists events_tenant_time_idx on public.events(tenant_id, starts_at);

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'registered' check (status in ('registered','waitlisted','confirmed','canceled','attended','no_show')),
  quantity integer not null default 1 check (quantity > 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists event_registrations_event_idx on public.event_registrations(event_id, status);

-- Triggers

do $$
declare t text;
begin
  foreach t in array array['services','service_resources','availability_rules','availability_overrides','bookings','events','event_registrations'] loop
    execute format('drop trigger if exists trg_%I_updated_at on public.%I', t, t);
    execute format('create trigger trg_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

create or replace function public.audit_booking_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    insert into public.booking_status_history(tenant_id,booking_id,from_status,to_status,changed_by)
    values(new.tenant_id,new.id,old.status,new.status,auth.uid());
    insert into public.audit_logs(tenant_id,actor_user_id,action,resource_type,resource_id,metadata)
    values(new.tenant_id,auth.uid(),'booking.status_changed','booking',new.id::text,jsonb_build_object('from',old.status,'to',new.status));
  end if;
  return new;
end;
$$;

revoke all on function public.audit_booking_status_change() from public;

drop trigger if exists trg_bookings_status_audit on public.bookings;
create trigger trg_bookings_status_audit after update of status on public.bookings for each row execute function public.audit_booking_status_change();

-- RLS
alter table public.services enable row level security;
alter table public.service_resources enable row level security;
alter table public.service_resource_links enable row level security;
alter table public.availability_rules enable row level security;
alter table public.availability_overrides enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_status_history enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;

-- Public service/event discovery
create policy services_public_read on public.services for select using (is_active and is_public and exists(select 1 from public.tenants t where t.id=tenant_id and t.status in ('demo','trialing','active')));
create policy resources_public_read on public.service_resources for select using (is_active and exists(select 1 from public.tenants t where t.id=tenant_id and t.status in ('demo','trialing','active')));
create policy service_resource_links_public_read on public.service_resource_links for select using (exists(select 1 from public.tenants t where t.id=tenant_id and t.status in ('demo','trialing','active')));
create policy events_public_read on public.events for select using (status='published' and exists(select 1 from public.tenants t where t.id=tenant_id and t.status in ('demo','trialing','active')));

-- Availability is public only as scheduling metadata; no private customer data exists here.
create policy availability_rules_public_read on public.availability_rules for select using (is_available and exists(select 1 from public.tenants t where t.id=tenant_id and t.status in ('demo','trialing','active')));
create policy availability_overrides_public_read on public.availability_overrides for select using (exists(select 1 from public.tenants t where t.id=tenant_id and t.status in ('demo','trialing','active')));

-- Admin write/read
create policy services_admin_all on public.services for all to authenticated using (public.has_tenant_permission(tenant_id,'booking.write')) with check (public.has_tenant_permission(tenant_id,'booking.write'));
create policy resources_admin_all on public.service_resources for all to authenticated using (public.has_tenant_permission(tenant_id,'booking.write')) with check (public.has_tenant_permission(tenant_id,'booking.write'));
create policy service_resource_links_admin_all on public.service_resource_links for all to authenticated using (public.has_tenant_permission(tenant_id,'booking.write')) with check (public.has_tenant_permission(tenant_id,'booking.write'));
create policy availability_rules_admin_all on public.availability_rules for all to authenticated using (public.has_tenant_permission(tenant_id,'booking.write')) with check (public.has_tenant_permission(tenant_id,'booking.write'));
create policy availability_overrides_admin_all on public.availability_overrides for all to authenticated using (public.has_tenant_permission(tenant_id,'booking.write')) with check (public.has_tenant_permission(tenant_id,'booking.write'));
create policy bookings_admin_read on public.bookings for select to authenticated using (public.has_tenant_permission(tenant_id,'booking.read'));
create policy bookings_admin_write on public.bookings for all to authenticated using (public.has_tenant_permission(tenant_id,'booking.write')) with check (public.has_tenant_permission(tenant_id,'booking.write'));
create policy booking_history_admin_read on public.booking_status_history for select to authenticated using (public.has_tenant_permission(tenant_id,'booking.read'));
create policy events_admin_all on public.events for all to authenticated using (public.has_tenant_permission(tenant_id,'cms.write')) with check (public.has_tenant_permission(tenant_id,'cms.write'));
create policy registrations_admin_read on public.event_registrations for select to authenticated using (public.has_tenant_permission(tenant_id,'booking.read'));
create policy registrations_admin_write on public.event_registrations for all to authenticated using (public.has_tenant_permission(tenant_id,'booking.write')) with check (public.has_tenant_permission(tenant_id,'booking.write'));

-- Grants
 grant select on public.services, public.service_resources, public.service_resource_links, public.availability_rules, public.availability_overrides, public.events to anon;
 grant select, insert, update, delete on public.services, public.service_resources, public.service_resource_links, public.availability_rules, public.availability_overrides, public.bookings, public.booking_status_history, public.events, public.event_registrations to authenticated;
 grant usage, select on all sequences in schema public to authenticated;
