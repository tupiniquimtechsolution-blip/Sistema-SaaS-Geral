-- Auth helpers, booking RPC (server-side price + overlap lock), LGPD consents.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'professional')
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_staff() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_staff() to authenticated;

-- Customers cannot change their own role or id.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    new.id := old.id;
    new.email := old.email;
    if new.role is distinct from old.role and not public.is_admin() then
      raise exception 'role_change_denied' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- Create profile + operational consent on signup. Never stores a password.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_policy text;
  v_marketing boolean;
  v_image boolean;
begin
  select lgpd_policy_version into v_policy from public.business_settings limit 1;
  v_policy := coalesce(v_policy, '1.0');

  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'customer'
  );

  v_marketing := coalesce(new.raw_user_meta_data->>'marketing_consent', 'false') in ('true', '1');
  v_image := coalesce(new.raw_user_meta_data->>'image_consent', 'false') in ('true', '1');

  insert into public.consents (user_id, kind, granted, policy_version, source)
  values
    (new.id, 'operational', true, v_policy, 'signup'),
    (new.id, 'marketing', v_marketing, v_policy, 'signup'),
    (new.id, 'image_use', v_image, v_policy, 'signup');

  insert into public.audit_logs (actor_id, action, entity, entity_id, metadata)
  values (
    new.id,
    'auth.signup',
    'profiles',
    new.id,
    jsonb_build_object('email', new.email)
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Overlap guard (works even if the gist exclusion cannot be applied).
create or replace function public.assert_no_appointment_overlap()
returns trigger
language plpgsql
as $$
begin
  if new.status in ('cancelled', 'no_show') then
    return new;
  end if;

  if exists (
    select 1
    from public.appointments a
    where a.professional_id = new.professional_id
      and a.id is distinct from new.id
      and a.status not in ('cancelled', 'no_show')
      and tstzrange(a.starts_at, a.ends_at, '[)') && tstzrange(new.starts_at, new.ends_at, '[)')
  ) then
    raise exception 'double_booking'
      using errcode = '23P01';
  end if;

  return new;
end;
$$;

create trigger appointments_assert_no_overlap
  before insert or update of starts_at, ends_at, status, professional_id
  on public.appointments
  for each row execute function public.assert_no_appointment_overlap();

create or replace function public.record_appointment_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.appointment_status_history (
      appointment_id, from_status, to_status, changed_by, reason
    ) values (
      new.id, null, new.status, auth.uid(), 'created'
    );
  elsif new.status is distinct from old.status then
    insert into public.appointment_status_history (
      appointment_id, from_status, to_status, changed_by, reason
    ) values (
      new.id, old.status, new.status, auth.uid(), 'status_change'
    );
  end if;
  return new;
end;
$$;

create trigger appointments_status_history
  after insert or update of status on public.appointments
  for each row execute function public.record_appointment_status();

-- Slot listing: occupancy only, never other customers' PII.
create or replace function public.list_available_slots(
  p_professional_id uuid,
  p_service_id uuid,
  p_date date
)
returns table (slot_start timestamptz, available boolean)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_duration integer;
  v_slot integer;
  v_tz text := 'America/Sao_Paulo';
  v_weekday integer;
  v_open time;
  v_close time;
  v_cursor timestamptz;
  v_end timestamptz;
  v_slot_end timestamptz;
  v_blocked boolean;
begin
  select s.duration_minutes into v_duration
  from public.services s
  where s.id = p_service_id and s.active;

  if v_duration is null then
    raise exception 'service_not_found';
  end if;

  if not exists (
    select 1
    from public.professional_services ps
    join public.professionals p on p.id = ps.professional_id
    where ps.professional_id = p_professional_id
      and ps.service_id = p_service_id
      and p.active
  ) then
    raise exception 'professional_not_available';
  end if;

  select timezone into v_tz from public.business_settings limit 1;
  v_tz := coalesce(v_tz, 'America/Sao_Paulo');
  select booking_slot_minutes into v_slot from public.business_settings limit 1;
  v_slot := coalesce(v_slot, 30);

  v_weekday := extract(dow from p_date)::integer;

  select bh.open_time, bh.close_time
    into v_open, v_close
  from public.business_hours bh
  where bh.weekday = v_weekday
    and (
      bh.professional_id = p_professional_id
      or (
        bh.professional_id is null
        and not exists (
          select 1 from public.business_hours x
          where x.professional_id = p_professional_id and x.weekday = v_weekday
        )
      )
    )
  order by bh.professional_id nulls last
  limit 1;

  if v_open is null then
    return;
  end if;

  v_cursor := (p_date::timestamp || ' ' || v_open::text)::timestamp at time zone v_tz;
  v_end := (p_date::timestamp || ' ' || v_close::text)::timestamp at time zone v_tz;

  while v_cursor + make_interval(mins => v_duration) <= v_end loop
    v_slot_end := v_cursor + make_interval(mins => v_duration);

    v_blocked := exists (
      select 1 from public.appointments a
      where a.professional_id = p_professional_id
        and a.status not in ('cancelled', 'no_show')
        and tstzrange(a.starts_at, a.ends_at, '[)') && tstzrange(v_cursor, v_slot_end, '[)')
    ) or exists (
      select 1 from public.blocked_periods b
      where (b.professional_id = p_professional_id or b.professional_id is null)
        and tstzrange(b.starts_at, b.ends_at, '[)') && tstzrange(v_cursor, v_slot_end, '[)')
    );

    slot_start := v_cursor;
    available := not v_blocked;
    return next;

    v_cursor := v_cursor + make_interval(mins => v_slot);
  end loop;
end;
$$;

grant execute on function public.list_available_slots(uuid, uuid, date) to anon, authenticated;

-- Authoritative booking. Price is copied from services; never trusted from the client.
create or replace function public.create_appointment(
  p_service_id uuid,
  p_professional_id uuid,
  p_starts_at timestamptz,
  p_notes text default '',
  p_operational_consent boolean default false,
  p_marketing_consent boolean default false,
  p_image_consent boolean default false
)
returns public.appointments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_service public.services%rowtype;
  v_ends timestamptz;
  v_appt public.appointments%rowtype;
  v_policy text;
  v_tz text := 'America/Sao_Paulo';
  v_weekday integer;
  v_open time;
  v_close time;
  v_local_start time;
  v_local_end time;
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  if coalesce(p_operational_consent, false) is not true then
    raise exception 'operational_consent_required' using errcode = 'P0001';
  end if;

  if p_starts_at <= now() then
    raise exception 'starts_in_past' using errcode = 'P0001';
  end if;

  select * into v_service
  from public.services
  where id = p_service_id and active;

  if not found then
    raise exception 'service_not_found' using errcode = 'P0001';
  end if;

  perform 1 from public.professionals
  where id = p_professional_id and active
  for update;

  if not found then
    raise exception 'professional_not_available' using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from public.professional_services
    where professional_id = p_professional_id
      and service_id = p_service_id
  ) then
    raise exception 'professional_not_available' using errcode = 'P0001';
  end if;

  v_ends := p_starts_at + make_interval(mins => v_service.duration_minutes);

  select timezone, lgpd_policy_version
    into v_tz, v_policy
  from public.business_settings
  limit 1;
  v_tz := coalesce(v_tz, 'America/Sao_Paulo');
  v_policy := coalesce(v_policy, '1.0');

  v_weekday := extract(dow from (p_starts_at at time zone v_tz))::integer;
  v_local_start := (p_starts_at at time zone v_tz)::time;
  v_local_end := (v_ends at time zone v_tz)::time;

  select bh.open_time, bh.close_time
    into v_open, v_close
  from public.business_hours bh
  where bh.weekday = v_weekday
    and (
      bh.professional_id = p_professional_id
      or (
        bh.professional_id is null
        and not exists (
          select 1 from public.business_hours x
          where x.professional_id = p_professional_id and x.weekday = v_weekday
        )
      )
    )
  order by bh.professional_id nulls last
  limit 1;

  if v_open is null or v_local_start < v_open or v_local_end > v_close then
    raise exception 'outside_business_hours' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.blocked_periods b
    where (b.professional_id = p_professional_id or b.professional_id is null)
      and tstzrange(b.starts_at, b.ends_at, '[)') && tstzrange(p_starts_at, v_ends, '[)')
  ) then
    raise exception 'period_blocked' using errcode = 'P0001';
  end if;

  insert into public.appointments (
    customer_id,
    professional_id,
    service_id,
    starts_at,
    ends_at,
    status,
    price_cents,
    notes
  ) values (
    v_user,
    p_professional_id,
    p_service_id,
    p_starts_at,
    v_ends,
    'pending',
    v_service.price_cents,
    coalesce(p_notes, '')
  )
  returning * into v_appt;

  insert into public.consents (user_id, kind, granted, policy_version, source)
  values
    (v_user, 'operational', true, v_policy, 'booking'),
    (v_user, 'marketing', coalesce(p_marketing_consent, false), v_policy, 'booking'),
    (v_user, 'image_use', coalesce(p_image_consent, false), v_policy, 'booking');

  insert into public.audit_logs (actor_id, action, entity, entity_id, metadata)
  values (
    v_user,
    'appointment.create',
    'appointments',
    v_appt.id,
    jsonb_build_object(
      'service_id', p_service_id,
      'professional_id', p_professional_id,
      'price_cents', v_service.price_cents,
      'starts_at', p_starts_at
    )
  );

  return v_appt;
end;
$$;

grant execute on function public.create_appointment(uuid, uuid, timestamptz, text, boolean, boolean, boolean)
  to authenticated;

create or replace function public.cancel_appointment(p_appointment_id uuid)
returns public.appointments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_appt public.appointments%rowtype;
  v_hours integer;
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  select * into v_appt
  from public.appointments
  where id = p_appointment_id
  for update;

  if not found then
    raise exception 'appointment_not_found' using errcode = 'P0001';
  end if;

  if v_appt.customer_id <> v_user and not public.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  if v_appt.status in ('cancelled', 'completed', 'no_show') then
    raise exception 'cannot_cancel' using errcode = 'P0001';
  end if;

  select cancellation_hours into v_hours from public.business_settings limit 1;
  v_hours := coalesce(v_hours, 24);

  if not public.is_admin() and v_appt.starts_at < now() + make_interval(hours => v_hours) then
    raise exception 'cancellation_window_closed' using errcode = 'P0001';
  end if;

  update public.appointments
     set status = 'cancelled'
   where id = v_appt.id
  returning * into v_appt;

  insert into public.audit_logs (actor_id, action, entity, entity_id, metadata)
  values (v_user, 'appointment.cancel', 'appointments', v_appt.id, '{}'::jsonb);

  return v_appt;
end;
$$;

grant execute on function public.cancel_appointment(uuid) to authenticated;

create or replace function public.admin_set_appointment_status(
  p_appointment_id uuid,
  p_status public.appointment_status,
  p_reason text default ''
)
returns public.appointments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_appt public.appointments%rowtype;
begin
  if not public.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  update public.appointments
     set status = p_status
   where id = p_appointment_id
  returning * into v_appt;

  if not found then
    raise exception 'appointment_not_found';
  end if;

  insert into public.audit_logs (actor_id, action, entity, entity_id, metadata)
  values (
    auth.uid(),
    'appointment.status',
    'appointments',
    v_appt.id,
    jsonb_build_object('status', p_status, 'reason', p_reason)
  );

  return v_appt;
end;
$$;

grant execute on function public.admin_set_appointment_status(uuid, public.appointment_status, text)
  to authenticated;

-- Record extra consents from the authenticated client (append-only).
create or replace function public.record_consents(
  p_operational boolean,
  p_marketing boolean,
  p_image boolean,
  p_source text default 'settings'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_policy text;
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  select lgpd_policy_version into v_policy from public.business_settings limit 1;
  v_policy := coalesce(v_policy, '1.0');

  insert into public.consents (user_id, kind, granted, policy_version, source)
  values
    (v_user, 'operational', coalesce(p_operational, false), v_policy, p_source),
    (v_user, 'marketing', coalesce(p_marketing, false), v_policy, p_source),
    (v_user, 'image_use', coalesce(p_image, false), v_policy, p_source);
end;
$$;

grant execute on function public.record_consents(boolean, boolean, boolean, text) to authenticated;
