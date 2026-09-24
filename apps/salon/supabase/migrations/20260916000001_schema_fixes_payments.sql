-- Review fixes: real singleton, unique global business_hours, payment uniqueness, webhook apply RPC.

alter table public.business_settings
  drop constraint if exists business_settings_singleton;

alter table public.business_settings
  add column if not exists singleton boolean not null default true;

alter table public.business_settings
  drop constraint if exists business_settings_singleton_true;

alter table public.business_settings
  add constraint business_settings_singleton_true check (singleton = true);

create unique index if not exists business_settings_one_row
  on public.business_settings (singleton);

-- NULL professional_id is the global calendar; Postgres unique (a,b) allows many NULLs.
create unique index if not exists business_hours_global_weekday_uidx
  on public.business_hours (weekday)
  where professional_id is null;

drop index if exists public.payments_provider_ref_unique;

update public.payments
   set provider_ref = id::text
 where provider_ref is null;

alter table public.payments
  alter column provider_ref set not null;

alter table public.payments
  drop constraint if exists payments_provider_ref_key;

alter table public.payments
  add constraint payments_provider_ref_key unique (provider, provider_ref);

create or replace function public.apply_payment_event(
  p_provider text,
  p_event_id text,
  p_event_type text,
  p_provider_ref text,
  p_appointment_id uuid,
  p_status public.payment_status,
  p_amount_cents integer,
  p_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id uuid;
  v_payment public.payments%rowtype;
  v_appt public.appointments%rowtype;
begin
  if p_provider is null or p_provider = '' or p_event_id is null or p_event_id = '' then
    raise exception 'event_identity_required';
  end if;
  if p_provider_ref is null or p_provider_ref = '' then
    raise exception 'provider_ref_required';
  end if;

  select id into v_event_id
  from public.payment_events
  where provider = p_provider
    and provider_event_id = p_event_id;

  if found then
    return jsonb_build_object('ok', true, 'duplicate', true, 'event_id', v_event_id);
  end if;

  select * into v_appt
  from public.appointments
  where id = p_appointment_id
  for update;

  if not found then
    raise exception 'appointment_not_found';
  end if;

  if p_amount_cents is distinct from v_appt.price_cents then
    insert into public.audit_logs (action, entity, entity_id, metadata)
    values (
      'payment.price_mismatch',
      'appointments',
      v_appt.id,
      jsonb_build_object(
        'expected', v_appt.price_cents,
        'received', p_amount_cents,
        'event_id', p_event_id
      )
    );
    raise exception 'price_mismatch';
  end if;

  insert into public.payments (
    appointment_id, provider, provider_ref, status, amount_cents, metadata
  ) values (
    v_appt.id, p_provider, p_provider_ref, p_status, v_appt.price_cents, coalesce(p_payload, '{}'::jsonb)
  )
  on conflict (provider, provider_ref)
  do update set
    status = excluded.status,
    amount_cents = excluded.amount_cents,
    metadata = excluded.metadata,
    updated_at = now()
  returning * into v_payment;

  insert into public.payment_events (
    payment_id, provider, provider_event_id, event_type, payload
  ) values (
    v_payment.id, p_provider, p_event_id, p_event_type, coalesce(p_payload, '{}'::jsonb)
  );

  if p_status = 'paid' and v_appt.status = 'pending' then
    update public.appointments
       set status = 'confirmed'
     where id = v_appt.id;
  end if;

  insert into public.audit_logs (action, entity, entity_id, metadata)
  values (
    'payment.apply',
    'payments',
    v_payment.id,
    jsonb_build_object('status', p_status, 'event_id', p_event_id, 'duplicate', false)
  );

  return jsonb_build_object(
    'ok', true,
    'duplicate', false,
    'payment_id', v_payment.id,
    'appointment_id', v_appt.id
  );
end;
$$;

revoke all on function public.apply_payment_event(text, text, text, text, uuid, public.payment_status, integer, jsonb) from public;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on function public.apply_payment_event(text, text, text, text, uuid, public.payment_status, integer, jsonb) from anon;
    grant usage on schema public to anon;
    grant select on all tables in schema public to anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on function public.apply_payment_event(text, text, text, text, uuid, public.payment_status, integer, jsonb) from authenticated;
    grant usage on schema public to authenticated;
    grant select, insert, update, delete on all tables in schema public to authenticated;
    grant usage, select on all sequences in schema public to authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function public.apply_payment_event(text, text, text, text, uuid, public.payment_status, integer, jsonb) to service_role;
    grant usage on schema public to service_role;
    grant select, insert, update, delete on all tables in schema public to service_role;
    grant usage, select on all sequences in schema public to service_role;
  end if;
end $$;
