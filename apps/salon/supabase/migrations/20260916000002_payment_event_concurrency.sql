-- Atomically claim a provider event before mutating payments or appointments.
-- A competing notification waits on payment_events(provider, provider_event_id)
-- and returns duplicate=true after the first transaction commits.

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

  -- This unique insert is the event acquisition. It is intentionally before
  -- any payment or appointment mutation so a concurrent duplicate cannot
  -- apply state twice.
  insert into public.payment_events (
    provider,
    provider_event_id,
    event_type,
    payload
  ) values (
    p_provider,
    p_event_id,
    p_event_type,
    coalesce(p_payload, '{}'::jsonb)
  )
  on conflict (provider, provider_event_id) do nothing
  returning id into v_event_id;

  if v_event_id is null then
    select id into v_event_id
    from public.payment_events
    where provider = p_provider
      and provider_event_id = p_event_id;

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
    appointment_id,
    provider,
    provider_ref,
    status,
    amount_cents,
    metadata
  ) values (
    v_appt.id,
    p_provider,
    p_provider_ref,
    p_status,
    v_appt.price_cents,
    coalesce(p_payload, '{}'::jsonb)
  )
  on conflict (provider, provider_ref)
  do update set
    status = excluded.status,
    amount_cents = excluded.amount_cents,
    metadata = excluded.metadata,
    updated_at = now()
  returning * into v_payment;

  update public.payment_events
  set payment_id = v_payment.id
  where id = v_event_id;

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
    'event_id', v_event_id,
    'payment_id', v_payment.id,
    'appointment_id', v_appt.id
  );
end;
$$;
