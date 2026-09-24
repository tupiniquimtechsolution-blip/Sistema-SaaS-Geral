-- Salon / Vanessa Braz RC1 — hosted tenant provisioning.
-- Applies only owner-confirmed public data. Missing city/UF/CEP, schedule,
-- commercial email, services, prices and media authorization remain unset.
-- Booking stays disabled until real service/staff/availability data is approved.

do $$
declare
  v_tenant_id uuid;
begin
  select id into v_tenant_id
  from public.tenants
  where lower(slug) = lower('vanessa-braz')
  limit 1;

  if v_tenant_id is null then
    insert into public.tenants (slug, name, vertical_id, status)
    values ('vanessa-braz', 'Vanessa Braz — Beleza & Autoestima', 'salon', 'demo')
    returning id into v_tenant_id;
  else
    update public.tenants
    set name = 'Vanessa Braz — Beleza & Autoestima',
        vertical_id = 'salon',
        status = 'demo',
        updated_at = now()
    where id = v_tenant_id;
  end if;

  insert into public.tenant_brands (
    tenant_id, display_name, tagline, phone, whatsapp, instagram_url,
    address, primary_cta_label, primary_cta_url
  ) values (
    v_tenant_id,
    'Vanessa Braz — Beleza & Autoestima',
    'Beleza & Autoestima',
    '5511988149152',
    '5511988149152',
    'https://www.instagram.com/vanessabraz_belezaeautoestima/',
    jsonb_build_object('line1', 'Rua Redenção 88'),
    'Solicitar agendamento',
    'https://wa.me/5511988149152'
  )
  on conflict (tenant_id) do update set
    display_name = excluded.display_name,
    tagline = excluded.tagline,
    phone = excluded.phone,
    whatsapp = excluded.whatsapp,
    instagram_url = excluded.instagram_url,
    address = excluded.address,
    primary_cta_label = excluded.primary_cta_label,
    primary_cta_url = excluded.primary_cta_url,
    updated_at = now();

  insert into public.tenant_themes (tenant_id, tokens, typography, component_style)
  values (
    v_tenant_id,
    '{"preset":"salon-premium"}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb
  )
  on conflict (tenant_id) do update set
    tokens = public.tenant_themes.tokens || excluded.tokens,
    updated_at = now();

  insert into public.tenant_settings (
    tenant_id, locale, timezone, currency, public_settings, private_settings
  ) values (
    v_tenant_id,
    'pt-BR',
    'America/Sao_Paulo',
    'BRL',
    jsonb_build_object(
      'instagram', '@vanessabraz_belezaeautoestima',
      'instagramUrl', 'https://www.instagram.com/vanessabraz_belezaeautoestima/',
      'social', jsonb_build_object(
        'instagram', '@vanessabraz_belezaeautoestima',
        'instagramUrl', 'https://www.instagram.com/vanessabraz_belezaeautoestima/'
      ),
      'integrations', jsonb_build_object(
        'whatsapp', jsonb_build_object('number', '5511988149152')
      ),
      'whatsapp', '5511988149152',
      'phoneDisplay', '(11) 98814-9152',
      'address', 'Rua Redenção 88',
      'bookingEnabled', false,
      'mediaPublicationAuthorized', false
    ),
    '{}'::jsonb
  )
  on conflict (tenant_id) do update set
    locale = excluded.locale,
    timezone = excluded.timezone,
    currency = excluded.currency,
    public_settings = public.tenant_settings.public_settings || excluded.public_settings,
    updated_at = now();
end
$$;
