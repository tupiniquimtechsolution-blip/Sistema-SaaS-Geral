-- Tupiniquim Vertical SaaS — reusable customer booking flow.
-- Prepared for Salon first, intentionally generic for Pet/Restaurant/other booking verticals.
-- Review/tests first. Production application requires explicit owner authorization.
-- Depends on 20260922211000_booking_tenant_integrity_and_overlap.sql.

-- ---------------------------------------------------------------------------
-- Audit-grade booking status history
-- ---------------------------------------------------------------------------
create table if not exists public.booking_status_history (
  id bigint generated always as identity primary key,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  booking_id uuid not null,
  from_status text,
  to_status text not null,
  changed_by uuid,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists booking_status_history_tenant_booking_idx
  on public.booking_status_history (tenant_id, booking_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Versioned consent records. Operational, marketing and image-use are separate.
-- ---------------------------------------------------------------------------
create table if not exists public.consent_records (
  id bigint generated always as identity primary key,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null,
  booking_id uuid,
  kind text not null check (kind in ('operational', 'marketing', 'image_use')),
  granted boolean not null,
  policy_version text not null,
  source text not null default 'booking',
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists consent_records_tenant_user_idx
  on public.consent_records (tenant_id, user_id, created_at desc);
create index if not exists consent_records_booking_idx
  on public.consent_records (booking_id) where booking_id is not null;

-- Tenant-bound history/consent references.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'bookings_tenant_id_id_key') then
    alter table public.bookings
      add constraint bookings_tenant_id_id_key unique (tenant_id, id);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'booking_status_history_tenant_booking_fkey') then
    alter table public.booking_status_history
      add constraint booking_status_history_tenant_booking_fkey
      foreign key (tenant_id, booking_id)
      references public.bookings (tenant_id, id)
      on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'consent_records_tenant_booking_fkey') then
    alter table public.consent_records
      add constraint consent_records_tenant_booking_fkey
      foreign key (tenant_id, booking_id)
      references public.bookings (tenant_id, id)
      on delete set null;
  end if;
end
$$;

alter table public.booking_status_history enable row level security;
alter table public.booking_status_history force row level security;
alter table public.consent_records enable row level security;
alter table public.consent_records force row level security;

drop policy if exists booking_status_history_read on public.booking_status_history;
create policy booking_status_history_read on public.booking_status_history
  for select to authenticated
  using (public.has_tenant_permission(tenant_id, 'booking.read'));

drop policy if exists consent_records_read on public.consent_records;
create policy consent_records_read on public.consent_records
  for select to authenticated
  using (
    user_id = auth.uid()
    or public.has_tenant_permission(tenant_id, 'crm.read')
  );

revoke insert, update, delete on public.booking_status_history from anon, authenticated;
revoke insert, update, delete on public.consent_records from anon, authenticated;
grant select on public.booking_status_history to authenticated;
grant select on public.consent_records to authenticated;

-- ---------------------------------------------------------------------------
-- Status history trigger: catches customer RPC and staff/admin direct mutations.
-- ---------------------------------------------------------------------------
create or replace function public.record_booking_status_history()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.booking_status_history (
      tenant_id, booking_id, from_status, to_status, changed_by, reason
    ) values (
      new.tenant_id, new.id, null, new.status, auth.uid(), 'created'
    );
  elsif new.status is distinct from old.status then
    insert into public.booking_status_history (
      tenant_id, booking_id, from_status, to_status, changed_by, reason
    ) values (
      new.tenant_id, new.id, old.status, new.status, auth.uid(), 'status_change'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists bookings_status_history on public.bookings;
create trigger bookings_status_history
  after insert or update of status on public.bookings
  for each row execute function public.record_booking_status_history();

-- ---------------------------------------------------------------------------
-- Public slot discovery. Returns occupancy only, never another customer's PII.
-- ---------------------------------------------------------------------------
create or replace function public.list_available_booking_slots(
  p_tenant_id uuid,
  p_service_id uuid,
  p_resource_id uuid,
  p_location_id uuid,
  p_date date
)
returns table (
  slot_start timestamptz,
  slot_end timestamptz
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_duration integer;
  v_slot_minutes integer := 30;
  v_timezone text := 'America/Sao_Paulo';
  v_weekday integer;
  v_public_settings jsonb := '{}'::jsonb;
begin
  if p_date is null then
    raise exception 'date_required' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.tenants t
    where t.id = p_tenant_id
      and t.status in ('demo', 'trialing', 'active')
  ) then
    raise exception 'tenant_not_available' using errcode = 'P0001';
  end if;

  select s.duration_minutes into v_duration
  from public.services s
  where s.id = p_service_id
    and s.tenant_id = p_tenant_id
    and s.is_active;

  if v_duration is null or v_duration <= 0 then
    raise exception 'service_not_available' using errcode = 'P0001';
  end if;

  if not exists (
    select 1
    from public.staff_resources r
    join public.service_resources sr
      on sr.tenant_id = r.tenant_id
     and sr.resource_id = r.id
     and sr.service_id = p_service_id
    where r.id = p_resource_id
      and r.tenant_id = p_tenant_id
      and r.is_active
  ) then
    raise exception 'resource_not_available_for_service' using errcode = 'P0001';
  end if;

  if p_location_id is not null and not exists (
    select 1 from public.locations l
    where l.id = p_location_id and l.tenant_id = p_tenant_id and l.is_public
  ) then
    raise exception 'location_not_available' using errcode = 'P0001';
  end if;

  select ts.timezone, ts.public_settings
    into v_timezone, v_public_settings
  from public.tenant_settings ts
  where ts.tenant_id = p_tenant_id;

  v_timezone := coalesce(nullif(v_timezone, ''), 'America/Sao_Paulo');
  v_public_settings := coalesce(v_public_settings, '{}'::jsonb);

  if coalesce(v_public_settings->>'bookingSlotMinutes', '') ~ '^[0-9]{1,3}$' then
    v_slot_minutes := greatest(5, least(120, (v_public_settings->>'bookingSlotMinutes')::integer));
  end if;

  v_weekday := extract(dow from p_date)::integer;

  return query
  with matching_rules as (
    select distinct ar.start_time, ar.end_time
    from public.availability_rules ar
    where ar.tenant_id = p_tenant_id
      and ar.is_active
      and ar.weekday = v_weekday
      and (ar.effective_from is null or ar.effective_from <= p_date)
      and (ar.effective_to is null or ar.effective_to >= p_date)
      and (ar.resource_id = p_resource_id or ar.resource_id is null)
      and (
        (p_location_id is null and ar.location_id is null)
        or
        (p_location_id is not null and (ar.location_id = p_location_id or ar.location_id is null))
      )
      -- Prefer resource-specific rules if they exist for the day.
      and (
        ar.resource_id = p_resource_id
        or not exists (
          select 1 from public.availability_rules specific
          where specific.tenant_id = p_tenant_id
            and specific.resource_id = p_resource_id
            and specific.is_active
            and specific.weekday = v_weekday
            and (specific.effective_from is null or specific.effective_from <= p_date)
            and (specific.effective_to is null or specific.effective_to >= p_date)
        )
      )
  ), raw_slots as (
    select
      gs as candidate_start,
      gs + make_interval(mins => v_duration) as candidate_end
    from matching_rules mr
    cross join lateral generate_series(
      (p_date + mr.start_time) at time zone v_timezone,
      ((p_date + mr.end_time) at time zone v_timezone) - make_interval(mins => v_duration),
      make_interval(mins => v_slot_minutes)
    ) as gs
  )
  select distinct rs.candidate_start, rs.candidate_end
  from raw_slots rs
  where rs.candidate_start > now()
    and not exists (
      select 1 from public.bookings b
      where b.tenant_id = p_tenant_id
        and b.resource_id = p_resource_id
        and b.status in ('requested', 'confirmed')
        and tstzrange(b.start_at, b.end_at, '[)')
            && tstzrange(rs.candidate_start, rs.candidate_end, '[)')
    )
  order by 1;
end;
$$;

revoke all on function public.list_available_booking_slots(uuid, uuid, uuid, uuid, date) from public;
grant execute on function public.list_available_booking_slots(uuid, uuid, uuid, uuid, date) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Authenticated customer booking. No price/duration/end timestamp is trusted
-- from the browser. The available slot and service duration are authoritative.
-- ---------------------------------------------------------------------------
create or replace function public.create_customer_booking(
  p_tenant_id uuid,
  p_service_id uuid,
  p_resource_id uuid,
  p_location_id uuid,
  p_starts_at timestamptz,
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text default null,
  p_notes text default null,
  p_operational_consent boolean default false,
  p_marketing_consent boolean default false,
  p_image_consent boolean default false
)
returns public.bookings
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_phone text;
  v_email text;
  v_name text;
  v_contact_id uuid;
  v_slot_end timestamptz;
  v_booking public.bookings%rowtype;
  v_policy_version text := '1.0';
begin
  if v_user_id is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  if coalesce(p_operational_consent, false) is not true then
    raise exception 'operational_consent_required' using errcode = '22023';
  end if;

  v_name := nullif(btrim(coalesce(p_customer_name, '')), '');
  v_phone := regexp_replace(coalesce(p_customer_phone, ''), '[^0-9]', '', 'g');
  v_email := nullif(lower(btrim(coalesce(p_customer_email, ''))), '');

  if v_name is null or char_length(v_name) > 160 then
    raise exception 'invalid_customer_name' using errcode = '22023';
  end if;
  if char_length(v_phone) < 8 or char_length(v_phone) > 15 then
    raise exception 'invalid_customer_phone' using errcode = '22023';
  end if;
  if v_email is not null and (char_length(v_email) > 254 or v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$') then
    raise exception 'invalid_customer_email' using errcode = '22023';
  end if;
  if p_starts_at is null or p_starts_at <= now() then
    raise exception 'invalid_booking_start' using errcode = '22023';
  end if;

  select s.slot_end into v_slot_end
  from public.list_available_booking_slots(
    p_tenant_id, p_service_id, p_resource_id, p_location_id, (p_starts_at at time zone 'UTC')::date
  ) s
  where s.slot_start = p_starts_at
  limit 1;

  -- The tenant timezone can make the UTC date differ. Retry using the tenant-local date.
  if v_slot_end is null then
    select s.slot_end into v_slot_end
    from public.list_available_booking_slots(
      p_tenant_id,
      p_service_id,
      p_resource_id,
      p_location_id,
      (p_starts_at at time zone coalesce(
        (select timezone from public.tenant_settings where tenant_id = p_tenant_id),
        'America/Sao_Paulo'
      ))::date
    ) s
    where s.slot_start = p_starts_at
    limit 1;
  end if;

  if v_slot_end is null then
    raise exception 'slot_not_available' using errcode = 'P0001';
  end if;

  select c.id into v_contact_id
  from public.contacts c
  where c.tenant_id = p_tenant_id
    and (
      (v_email is not null and lower(coalesce(c.email, '')) = v_email)
      or regexp_replace(coalesce(c.phone, ''), '[^0-9]', '', 'g') = v_phone
    )
  order by c.created_at asc
  limit 1;

  if v_contact_id is null then
    insert into public.contacts (
      tenant_id, kind, name, email, phone, source, consent, metadata
    ) values (
      p_tenant_id,
      'person',
      v_name,
      v_email,
      v_phone,
      'booking',
      jsonb_build_object(
        'operational', true,
        'marketing', coalesce(p_marketing_consent, false),
        'image_use', coalesce(p_image_consent, false)
      ),
      jsonb_build_object('auth_user_id', v_user_id)
    ) returning id into v_contact_id;
  end if;

  select coalesce(nullif(ts.public_settings->>'privacyPolicyVersion', ''), '1.0')
    into v_policy_version
  from public.tenant_settings ts
  where ts.tenant_id = p_tenant_id;
  v_policy_version := coalesce(v_policy_version, '1.0');

  insert into public.bookings (
    tenant_id,
    service_id,
    resource_id,
    location_id,
    contact_id,
    status,
    start_at,
    end_at,
    customer_snapshot,
    notes,
    source
  ) values (
    p_tenant_id,
    p_service_id,
    p_resource_id,
    p_location_id,
    v_contact_id,
    'requested',
    p_starts_at,
    v_slot_end,
    jsonb_build_object(
      'auth_user_id', v_user_id,
      'name', v_name,
      'phone', v_phone,
      'email', v_email
    ),
    nullif(btrim(coalesce(p_notes, '')), ''),
    'web'
  ) returning * into v_booking;

  insert into public.consent_records (
    tenant_id, user_id, booking_id, kind, granted, policy_version, source
  ) values
    (p_tenant_id, v_user_id, v_booking.id, 'operational', true, v_policy_version, 'booking'),
    (p_tenant_id, v_user_id, v_booking.id, 'marketing', coalesce(p_marketing_consent, false), v_policy_version, 'booking'),
    (p_tenant_id, v_user_id, v_booking.id, 'image_use', coalesce(p_image_consent, false), v_policy_version, 'booking');

  insert into public.audit_logs (
    tenant_id, actor_id, action, resource_type, resource_id, metadata
  ) values (
    p_tenant_id,
    v_user_id,
    'booking.customer_create',
    'booking',
    v_booking.id::text,
    jsonb_build_object(
      'service_id', p_service_id,
      'resource_id', p_resource_id,
      'location_id', p_location_id,
      'start_at', p_starts_at
    )
  );

  return v_booking;
end;
$$;

revoke all on function public.create_customer_booking(uuid, uuid, uuid, uuid, timestamptz, text, text, text, text, boolean, boolean, boolean) from public;
grant execute on function public.create_customer_booking(uuid, uuid, uuid, uuid, timestamptz, text, text, text, text, boolean, boolean, boolean) to authenticated;

comment on function public.create_customer_booking(uuid, uuid, uuid, uuid, timestamptz, text, text, text, text, boolean, boolean, boolean) is
  'Authenticated, tenant-aware customer booking boundary. Duration/end are server-derived and overlap is DB-enforced.';
