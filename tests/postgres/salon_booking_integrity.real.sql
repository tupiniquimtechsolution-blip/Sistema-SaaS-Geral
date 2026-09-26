\set ON_ERROR_STOP on

create extension if not exists pgcrypto;

create table public.tenants (
  id uuid primary key,
  name text not null
);

create table public.services (
  id uuid primary key,
  tenant_id uuid not null references public.tenants(id),
  name text not null
);

create table public.staff_resources (
  id uuid primary key,
  tenant_id uuid not null references public.tenants(id),
  name text not null
);

create table public.locations (
  id uuid primary key,
  tenant_id uuid not null references public.tenants(id),
  name text not null
);

create table public.contacts (
  id uuid primary key,
  tenant_id uuid not null references public.tenants(id),
  name text not null
);

create table public.service_resources (
  tenant_id uuid not null references public.tenants(id),
  service_id uuid not null references public.services(id),
  resource_id uuid not null references public.staff_resources(id),
  primary key (tenant_id, service_id, resource_id)
);

create table public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  resource_id uuid references public.staff_resources(id),
  location_id uuid references public.locations(id),
  weekday smallint not null,
  start_time time not null,
  end_time time not null
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  service_id uuid references public.services(id),
  resource_id uuid references public.staff_resources(id),
  location_id uuid references public.locations(id),
  contact_id uuid references public.contacts(id),
  status text not null default 'requested',
  start_at timestamptz not null,
  end_at timestamptz not null,
  constraint bookings_check check (end_at > start_at),
  constraint bookings_status_check check (status in ('requested','confirmed','completed','canceled','no_show','rejected'))
);

\i supabase/migrations/20260922211000_booking_tenant_integrity_and_overlap.sql

insert into public.tenants(id,name) values
  ('00000000-0000-0000-0000-00000000000a','Tenant A'),
  ('00000000-0000-0000-0000-00000000000b','Tenant B');

insert into public.services(id,tenant_id,name) values
  ('10000000-0000-0000-0000-00000000000a','00000000-0000-0000-0000-00000000000a','Service A'),
  ('10000000-0000-0000-0000-00000000000b','00000000-0000-0000-0000-00000000000b','Service B');

insert into public.staff_resources(id,tenant_id,name) values
  ('20000000-0000-0000-0000-00000000000a','00000000-0000-0000-0000-00000000000a','Staff A'),
  ('20000000-0000-0000-0000-00000000000b','00000000-0000-0000-0000-00000000000b','Staff B');

insert into public.locations(id,tenant_id,name) values
  ('30000000-0000-0000-0000-00000000000a','00000000-0000-0000-0000-00000000000a','Location A'),
  ('30000000-0000-0000-0000-00000000000b','00000000-0000-0000-0000-00000000000b','Location B');

insert into public.contacts(id,tenant_id,name) values
  ('40000000-0000-0000-0000-00000000000a','00000000-0000-0000-0000-00000000000a','Contact A'),
  ('40000000-0000-0000-0000-00000000000b','00000000-0000-0000-0000-00000000000b','Contact B');

-- Valid tenant A booking.
insert into public.bookings(
  tenant_id,service_id,resource_id,location_id,contact_id,status,start_at,end_at
) values (
  '00000000-0000-0000-0000-00000000000a',
  '10000000-0000-0000-0000-00000000000a',
  '20000000-0000-0000-0000-00000000000a',
  '30000000-0000-0000-0000-00000000000a',
  '40000000-0000-0000-0000-00000000000a',
  'confirmed','2030-01-01T10:00:00Z','2030-01-01T11:00:00Z'
);

-- A booking cannot point to another tenant's service/resource/contact/location.
do $$
begin
  begin
    insert into public.bookings(
      tenant_id,service_id,resource_id,location_id,contact_id,status,start_at,end_at
    ) values (
      '00000000-0000-0000-0000-00000000000a',
      '10000000-0000-0000-0000-00000000000b',
      '20000000-0000-0000-0000-00000000000a',
      '30000000-0000-0000-0000-00000000000a',
      '40000000-0000-0000-0000-00000000000a',
      'requested','2030-01-02T10:00:00Z','2030-01-02T11:00:00Z'
    );
    raise exception 'expected_cross_tenant_service_rejection';
  exception
    when foreign_key_violation then null;
  end;
end
$$;

-- Concurrent/overlapping active booking for the same tenant/resource is rejected.
do $$
begin
  begin
    insert into public.bookings(
      tenant_id,service_id,resource_id,status,start_at,end_at
    ) values (
      '00000000-0000-0000-0000-00000000000a',
      '10000000-0000-0000-0000-00000000000a',
      '20000000-0000-0000-0000-00000000000a',
      'requested','2030-01-01T10:30:00Z','2030-01-01T11:30:00Z'
    );
    raise exception 'expected_overlap_rejection';
  exception
    when exclusion_violation then null;
  end;
end
$$;

-- A canceled historical row may overlap and remains available for audit history.
insert into public.bookings(
  tenant_id,service_id,resource_id,status,start_at,end_at
) values (
  '00000000-0000-0000-0000-00000000000a',
  '10000000-0000-0000-0000-00000000000a',
  '20000000-0000-0000-0000-00000000000a',
  'canceled','2030-01-01T10:30:00Z','2030-01-01T11:30:00Z'
);

select 'salon_booking_integrity_pass' as result;
