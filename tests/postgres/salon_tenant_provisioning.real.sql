\set ON_ERROR_STOP on

create extension if not exists pgcrypto;

create table public.vertical_registry (
  id text primary key,
  name text not null,
  description text,
  is_enabled boolean not null default true,
  default_theme jsonb not null default '{}'::jsonb,
  default_modules jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  vertical_id text not null references public.vertical_registry(id),
  status text not null default 'trialing' check (status in ('demo','trialing','active','suspended','canceled')),
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index tenants_slug_lower_uidx on public.tenants(lower(slug));

create table public.tenant_brands (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  display_name text not null,
  legal_name text,
  tagline text,
  logo_url text,
  logo_alt_url text,
  favicon_url text,
  hero_media_url text,
  phone text,
  whatsapp text,
  email text,
  instagram_url text,
  facebook_url text,
  other_socials jsonb not null default '{}'::jsonb,
  address jsonb not null default '{}'::jsonb,
  opening_hours jsonb not null default '{}'::jsonb,
  primary_cta_label text,
  primary_cta_url text,
  seo_defaults jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tenant_settings (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  locale text not null default 'pt-BR',
  timezone text not null default 'America/Sao_Paulo',
  currency text not null default 'BRL',
  public_settings jsonb not null default '{}'::jsonb,
  private_settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tenant_themes (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  tokens jsonb not null default '{}'::jsonb,
  typography jsonb not null default '{}'::jsonb,
  component_style jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  slug text not null,
  is_primary boolean not null default false,
  is_public boolean not null default true,
  phone text,
  whatsapp text,
  email text,
  address jsonb not null default '{}'::jsonb,
  latitude numeric,
  longitude numeric,
  opening_hours jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

\i supabase/migrations/20260922211500_register_salon_vertical.sql
\i scripts/provisioning/vanessa_braz_tenant.sql

-- Prove idempotency: a second execution must update the same tenant, not fork it.
\i supabase/migrations/20260922211500_register_salon_vertical.sql
\i scripts/provisioning/vanessa_braz_tenant.sql

do $$
declare
  v_count integer;
  v_vertical text;
  v_whatsapp text;
  v_instagram text;
  v_address text;
  v_booking boolean;
begin
  select count(*) into v_count from public.tenants where lower(slug)=lower('vanessa-braz');
  if v_count <> 1 then
    raise exception 'expected_exactly_one_vanessa_tenant, got %', v_count;
  end if;

  select t.vertical_id, b.whatsapp, b.instagram_url, b.address->>'street',
         (s.public_settings->>'bookingEnabled')::boolean
    into v_vertical, v_whatsapp, v_instagram, v_address, v_booking
  from public.tenants t
  join public.tenant_brands b on b.tenant_id=t.id
  join public.tenant_settings s on s.tenant_id=t.id
  where lower(t.slug)=lower('vanessa-braz');

  if v_vertical <> 'salon' then raise exception 'vertical_not_salon'; end if;
  if v_whatsapp <> '5511988149152' then raise exception 'whatsapp_mismatch'; end if;
  if v_instagram <> 'https://www.instagram.com/vanessabraz_belezaeautoestima/' then raise exception 'instagram_mismatch'; end if;
  if v_address <> 'Rua Redenção 88' then raise exception 'address_mismatch'; end if;
  if v_booking is distinct from false then raise exception 'booking_must_start_disabled_until_live_gate'; end if;
end
$$;

select 'salon_tenant_provisioning_pass' as result;
