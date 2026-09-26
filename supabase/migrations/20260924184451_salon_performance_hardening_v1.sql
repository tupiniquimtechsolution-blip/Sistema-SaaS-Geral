create index if not exists availability_rules_tenant_location_idx
  on public.availability_rules (tenant_id, location_id)
  where location_id is not null;

create index if not exists availability_rules_tenant_resource_idx
  on public.availability_rules (tenant_id, resource_id)
  where resource_id is not null;

create index if not exists bookings_tenant_contact_idx
  on public.bookings (tenant_id, contact_id)
  where contact_id is not null;

create index if not exists bookings_tenant_location_idx
  on public.bookings (tenant_id, location_id)
  where location_id is not null;

create index if not exists bookings_tenant_service_idx
  on public.bookings (tenant_id, service_id);

create index if not exists service_resources_tenant_resource_idx
  on public.service_resources (tenant_id, resource_id);

create index if not exists service_resources_tenant_service_idx
  on public.service_resources (tenant_id, service_id);

create index if not exists consent_records_tenant_booking_idx
  on public.consent_records (tenant_id, booking_id)
  where booking_id is not null;

drop policy if exists consent_records_read on public.consent_records;
create policy consent_records_read
  on public.consent_records
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or has_tenant_permission(tenant_id, 'crm.read'::text)
  );
