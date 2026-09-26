-- Vanessa Braz — tenant provisioning for the reusable `salon` vertical.
-- SOURCE: owner-confirmed data on 2026-09-22.
-- STATUS: prepared, NOT APPLIED.
--
-- Preconditions:
--   - public.vertical_registry contains id='salon';
--   - generic booking hardening has passed review/tests;
--   - owner explicitly authorizes Supabase production mutation.
--
-- Do not add guessed city/state/CEP, hours, e-mail, services, prices or claims.

begin;

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
    values ('vanessa-braz', 'Vanessa Braz', 'salon', 'trialing')
    returning id into v_tenant_id;
  else
    update public.tenants
       set name = 'Vanessa Braz',
           vertical_id = 'salon',
           updated_at = now()
     where id = v_tenant_id;
  end if;

  insert into public.tenant_brands (
    tenant_id,
    display_name,
    tagline,
    phone,
    whatsapp,
    instagram_url,
    address,
    opening_hours,
    primary_cta_label,
    primary_cta_url
  ) values (
    v_tenant_id,
    'Vanessa Braz',
    'Beleza & Autoestima',
    '(11) 98814-9152',
    '5511988149152',
    'https://www.instagram.com/vanessabraz_belezaeautoestima/',
    jsonb_build_object('street', 'Rua Redenção 88'),
    '{}'::jsonb,
    'Agendar pelo WhatsApp',
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

  insert into public.tenant_settings (
    tenant_id,
    locale,
    timezone,
    currency,
    public_settings,
    private_settings
  ) values (
    v_tenant_id,
    'pt-BR',
    'America/Sao_Paulo',
    'BRL',
    jsonb_build_object(
      'phoneDisplay', '(11) 98814-9152',
      'whatsapp', '5511988149152',
      'address', 'Rua Redenção 88',
      'bookingEnabled', false,
      'mediaPublicationAuthorized', false,
      'social', jsonb_build_object(
        'instagram', '@vanessabraz_belezaeautoestima',
        'instagramUrl', 'https://www.instagram.com/vanessabraz_belezaeautoestima/'
      ),
      'integrations', jsonb_build_object(
        'whatsapp', jsonb_build_object('number', '5511988149152')
      )
    ),
    '{}'::jsonb
  )
  on conflict (tenant_id) do update set
    locale = excluded.locale,
    timezone = excluded.timezone,
    currency = excluded.currency,
    public_settings = public.tenant_settings.public_settings || excluded.public_settings,
    updated_at = now();

  insert into public.tenant_themes (
    tenant_id,
    tokens,
    typography,
    component_style
  ) values (
    v_tenant_id,
    '{
      "background":"#f7f3f0",
      "surface":"#fffaf7",
      "text":"#342c2a",
      "muted":"#756a66",
      "accent":"#b77a75",
      "accentDark":"#83534f"
    }'::jsonb,
    '{
      "display":"Playfair Display",
      "body":"DM Sans"
    }'::jsonb,
    '{"radius":"soft","density":"comfortable"}'::jsonb
  )
  on conflict (tenant_id) do update set
    tokens = public.tenant_themes.tokens || excluded.tokens,
    typography = public.tenant_themes.typography || excluded.typography,
    component_style = public.tenant_themes.component_style || excluded.component_style,
    updated_at = now();

  insert into public.locations (
    tenant_id,
    name,
    slug,
    is_primary,
    is_public,
    phone,
    whatsapp,
    address,
    opening_hours,
    metadata
  ) values (
    v_tenant_id,
    'Unidade principal',
    'principal',
    true,
    true,
    '(11) 98814-9152',
    '5511988149152',
    jsonb_build_object('street', 'Rua Redenção 88'),
    '{}'::jsonb,
    jsonb_build_object('source', 'owner-confirmed-2026-09-22')
  )
  on conflict (tenant_id, slug) do update set
    name = excluded.name,
    is_primary = true,
    is_public = true,
    phone = excluded.phone,
    whatsapp = excluded.whatsapp,
    address = excluded.address,
    updated_at = now();
end
$$;

commit;

-- Post-provision verification (read-only):
-- select t.id,t.slug,t.name,t.vertical_id,t.status,b.display_name,b.whatsapp,b.instagram_url
-- from public.tenants t
-- join public.tenant_brands b on b.tenant_id=t.id
-- where lower(t.slug)=lower('vanessa-braz');
