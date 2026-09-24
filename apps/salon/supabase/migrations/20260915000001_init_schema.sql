-- Vanessa Braz — core schema
-- Privacy-by-design: no plaintext passwords, append-only consents/audit,
-- money stored as integer cents, default-deny RLS applied in a later migration.

create extension if not exists "pgcrypto";
create extension if not exists "btree_gist";

create type public.user_role as enum ('customer', 'professional', 'admin');
create type public.appointment_status as enum (
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'no_show'
);
create type public.payment_status as enum (
  'pending',
  'authorized',
  'paid',
  'failed',
  'refunded',
  'cancelled'
);
create type public.consent_kind as enum ('operational', 'marketing', 'image_use');
create type public.notification_channel as enum ('email', 'whatsapp', 'in_app');
create type public.media_kind as enum ('image', 'video', 'other');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  phone text not null default '',
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- business_settings (single-row)
-- ---------------------------------------------------------------------------
create table public.business_settings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tagline text not null default '',
  description text not null default '',
  phone text not null default 'PENDENTE_DE_CONFIRMACAO',
  whatsapp text not null default '',
  email text not null default '',
  instagram text not null default '',
  address text not null default 'PENDENTE_DE_CONFIRMACAO',
  city text not null default 'PENDENTE_DE_CONFIRMACAO',
  state text not null default 'SP',
  timezone text not null default 'America/Sao_Paulo',
  booking_slot_minutes integer not null default 30,
  cancellation_hours integer not null default 24,
  lgpd_policy_version text not null default '1.0',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_settings_singleton check (id = id)
);

create trigger business_settings_set_updated_at
  before update on public.business_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- professionals / catalog
-- ---------------------------------------------------------------------------
create table public.professionals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles (id) on delete set null,
  display_name text not null,
  bio text not null default '',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger professionals_set_updated_at
  before update on public.professionals
  for each row execute function public.set_updated_at();

create table public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger service_categories_set_updated_at
  before update on public.service_categories
  for each row execute function public.set_updated_at();

create table public.services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.service_categories (id),
  name text not null,
  slug text not null unique,
  description text not null default '',
  duration_minutes integer not null check (duration_minutes > 0),
  price_cents integer not null check (price_cents >= 0),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

create table public.professional_services (
  professional_id uuid not null references public.professionals (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (professional_id, service_id)
);

create table public.business_hours (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid references public.professionals (id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  open_time time not null,
  close_time time not null,
  constraint business_hours_window check (close_time > open_time),
  unique (professional_id, weekday)
);

create table public.availability (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (id) on delete cascade,
  on_date date not null,
  start_time time not null,
  end_time time not null,
  constraint availability_window check (end_time > start_time)
);

create index availability_professional_date_idx
  on public.availability (professional_id, on_date);

create table public.blocked_periods (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid references public.professionals (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text not null default '',
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  constraint blocked_periods_window check (ends_at > starts_at)
);

create index blocked_periods_range_idx
  on public.blocked_periods (professional_id, starts_at, ends_at);

-- ---------------------------------------------------------------------------
-- appointments
-- ---------------------------------------------------------------------------
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id),
  professional_id uuid not null references public.professionals (id),
  service_id uuid not null references public.services (id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'pending',
  price_cents integer not null check (price_cents >= 0),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointments_window check (ends_at > starts_at)
);

create trigger appointments_set_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

create index appointments_customer_idx on public.appointments (customer_id);
create index appointments_professional_starts_idx
  on public.appointments (professional_id, starts_at);

-- Database-level double-booking prevention (not UI-only).
alter table public.appointments
  add constraint appointments_no_overlap
  exclude using gist (
    professional_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  )
  where (status not in ('cancelled', 'no_show'));

create table public.appointment_status_history (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments (id) on delete cascade,
  from_status public.appointment_status,
  to_status public.appointment_status not null,
  changed_by uuid references public.profiles (id),
  reason text not null default '',
  created_at timestamptz not null default now()
);

create index appointment_status_history_appt_idx
  on public.appointment_status_history (appointment_id, created_at);

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments (id),
  provider text not null,
  provider_ref text,
  status public.payment_status not null default 'pending',
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'BRL',
  checkout_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

create unique index payments_provider_ref_unique
  on public.payments (provider, provider_ref)
  where provider_ref is not null;

create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references public.payments (id) on delete set null,
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

-- ---------------------------------------------------------------------------
-- notes, media, notifications, audit, consents
-- ---------------------------------------------------------------------------
create table public.customer_notes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  author_id uuid not null references public.profiles (id),
  body text not null,
  created_at timestamptz not null default now()
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  repository_path text not null unique,
  kind public.media_kind not null,
  mime_type text not null,
  sha256 text,
  alt text not null default '',
  section text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  channel public.notification_channel not null default 'in_app',
  title text not null,
  body text not null default '',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, created_at desc);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id),
  action text not null,
  entity text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_entity_idx on public.audit_logs (entity, entity_id, created_at desc);

-- Append-only consent ledger (LGPD). Never update/delete from the client.
create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind public.consent_kind not null,
  granted boolean not null,
  policy_version text not null,
  source text not null,
  created_at timestamptz not null default now()
);

create index consents_user_kind_idx on public.consents (user_id, kind, created_at desc);
