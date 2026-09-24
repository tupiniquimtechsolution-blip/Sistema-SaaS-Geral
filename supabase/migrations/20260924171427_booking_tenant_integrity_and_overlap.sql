-- Tupiniquim Vertical SaaS — generic booking hardening for every vertical
-- Prepared from read-only audit of the canonical remote schema on 2026-09-22.
-- IMPORTANT: this migration is versioned for review/tests first. Do not apply to
-- production without the owner's explicit Supabase mutation authorization.
--
-- Goals:
--   1. prevent cross-tenant FK relationships (IDOR/BOLA integrity class);
--   2. prevent concurrent active bookings for the same resource/time range;
--   3. remain generic: no Vanessa-specific table, id, slug or business rule.

create extension if not exists btree_gist;

-- Composite FK targets need a unique key containing tenant_id. The UUID primary
-- keys remain the canonical identifiers; these constraints only establish a
-- tenant-bound reference target.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'services_tenant_id_id_key') then
    alter table public.services
      add constraint services_tenant_id_id_key unique (tenant_id, id);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'staff_resources_tenant_id_id_key') then
    alter table public.staff_resources
      add constraint staff_resources_tenant_id_id_key unique (tenant_id, id);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'locations_tenant_id_id_key') then
    alter table public.locations
      add constraint locations_tenant_id_id_key unique (tenant_id, id);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'contacts_tenant_id_id_key') then
    alter table public.contacts
      add constraint contacts_tenant_id_id_key unique (tenant_id, id);
  end if;
end
$$;

-- Booking references must belong to the same tenant declared on the booking.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'bookings_tenant_service_fkey') then
    alter table public.bookings
      add constraint bookings_tenant_service_fkey
      foreign key (tenant_id, service_id)
      references public.services (tenant_id, id)
      on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'bookings_tenant_resource_fkey') then
    alter table public.bookings
      add constraint bookings_tenant_resource_fkey
      foreign key (tenant_id, resource_id)
      references public.staff_resources (tenant_id, id)
      on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'bookings_tenant_location_fkey') then
    alter table public.bookings
      add constraint bookings_tenant_location_fkey
      foreign key (tenant_id, location_id)
      references public.locations (tenant_id, id)
      on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'bookings_tenant_contact_fkey') then
    alter table public.bookings
      add constraint bookings_tenant_contact_fkey
      foreign key (tenant_id, contact_id)
      references public.contacts (tenant_id, id)
      on delete restrict;
  end if;
end
$$;

-- Join/configuration tables receive the same invariant.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'service_resources_tenant_service_fkey') then
    alter table public.service_resources
      add constraint service_resources_tenant_service_fkey
      foreign key (tenant_id, service_id)
      references public.services (tenant_id, id)
      on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'service_resources_tenant_resource_fkey') then
    alter table public.service_resources
      add constraint service_resources_tenant_resource_fkey
      foreign key (tenant_id, resource_id)
      references public.staff_resources (tenant_id, id)
      on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'availability_rules_tenant_resource_fkey') then
    alter table public.availability_rules
      add constraint availability_rules_tenant_resource_fkey
      foreign key (tenant_id, resource_id)
      references public.staff_resources (tenant_id, id)
      on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'availability_rules_tenant_location_fkey') then
    alter table public.availability_rules
      add constraint availability_rules_tenant_location_fkey
      foreign key (tenant_id, location_id)
      references public.locations (tenant_id, id)
      on delete cascade;
  end if;
end
$$;

-- Database-level race-condition guard. Only active reservation states occupy a
-- resource slot. Canceled/rejected/no-show/completed records remain auditable
-- without blocking a new reservation.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'bookings_no_active_resource_overlap') then
    alter table public.bookings
      add constraint bookings_no_active_resource_overlap
      exclude using gist (
        tenant_id with =,
        resource_id with =,
        tstzrange(start_at, end_at, '[)') with &&
      )
      where (
        resource_id is not null
        and status in ('requested', 'confirmed')
      );
  end if;
end
$$;

comment on constraint bookings_no_active_resource_overlap on public.bookings is
  'Prevents concurrent active bookings for the same tenant/resource/time range.';
