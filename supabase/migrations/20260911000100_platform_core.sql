-- Tupiniquim Vertical SaaS — Platform Core
-- Non-destructive initial schema. Designed for Supabase/PostgreSQL.

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Utility
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Platform / tenancy
-- -----------------------------------------------------------------------------

create table if not exists public.vertical_registry (
  id text primary key,
  name text not null,
  description text,
  is_enabled boolean not null default true,
  default_theme jsonb not null default '{}'::jsonb,
  default_modules jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  vertical_id text not null references public.vertical_registry(id),
  status text not null default 'trialing' check (status in ('demo','trialing','active','suspended','canceled')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists tenants_slug_lower_uidx on public.tenants (lower(slug));
create index if not exists tenants_vertical_idx on public.tenants(vertical_id);
create index if not exists tenants_status_idx on public.tenants(status);

create table if not exists public.tenant_domains (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  hostname text not null,
  is_primary boolean not null default false,
  status text not null default 'pending' check (status in ('pending','verified','active','failed','disabled')),
  verification_token text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists tenant_domains_hostname_lower_uidx on public.tenant_domains (lower(hostname));
create unique index if not exists tenant_domains_one_primary_uidx on public.tenant_domains (tenant_id) where is_primary;
create index if not exists tenant_domains_tenant_idx on public.tenant_domains(tenant_id);

create table if not exists public.tenant_brands (
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

create table if not exists public.tenant_themes (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  tokens jsonb not null default '{}'::jsonb,
  typography jsonb not null default '{}'::jsonb,
  component_style jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tenant_settings (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  locale text not null default 'pt-BR',
  timezone text not null default 'America/Sao_Paulo',
  currency text not null default 'BRL',
  public_settings jsonb not null default '{}'::jsonb,
  private_settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.locations (
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
  latitude numeric(9,6),
  longitude numeric(9,6),
  opening_hours jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create unique index if not exists locations_one_primary_uidx on public.locations(tenant_id) where is_primary;
create index if not exists locations_tenant_idx on public.locations(tenant_id);

-- -----------------------------------------------------------------------------
-- Identity / RBAC
-- -----------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  locale text not null default 'pt-BR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now()
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('invited','active','suspended','revoked')),
  invited_by uuid references auth.users(id) on delete set null,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

create index if not exists memberships_user_idx on public.memberships(user_id);
create index if not exists memberships_tenant_idx on public.memberships(tenant_id);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  key text not null,
  name text not null,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists roles_global_key_uidx on public.roles(lower(key)) where tenant_id is null;
create unique index if not exists roles_tenant_key_uidx on public.roles(tenant_id, lower(key)) where tenant_id is not null;

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists public.membership_roles (
  membership_id uuid not null references public.memberships(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (membership_id, role_id)
);

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  email text not null,
  role_ids uuid[] not null default '{}',
  token_hash text not null unique,
  status text not null default 'pending' check (status in ('pending','accepted','expired','revoked')),
  expires_at timestamptz not null,
  invited_by uuid not null references auth.users(id) on delete cascade,
  accepted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invitations_tenant_idx on public.invitations(tenant_id);
create index if not exists invitations_email_lower_idx on public.invitations(lower(email));

-- -----------------------------------------------------------------------------
-- Plans / features / entitlements
-- -----------------------------------------------------------------------------

create table if not exists public.features (
  key text primary key,
  description text,
  value_type text not null default 'boolean' check (value_type in ('boolean','integer','string','json')),
  created_at timestamptz not null default now()
);

create table if not exists public.plans (
  id text primary key,
  name text not null,
  description text,
  is_public boolean not null default true,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.plan_entitlements (
  plan_id text not null references public.plans(id) on delete cascade,
  feature_key text not null references public.features(key) on delete cascade,
  value jsonb not null,
  primary key (plan_id, feature_key)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  plan_id text not null references public.plans(id),
  provider text not null default 'manual',
  provider_customer_id text,
  provider_subscription_id text,
  status text not null default 'trialing' check (status in ('trialing','active','past_due','canceled','incomplete','unpaid','paused')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists subscriptions_provider_subscription_uidx on public.subscriptions(provider, provider_subscription_id) where provider_subscription_id is not null;
create index if not exists subscriptions_tenant_idx on public.subscriptions(tenant_id);

create table if not exists public.tenant_entitlements (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  feature_key text not null references public.features(key) on delete cascade,
  value jsonb not null,
  reason text,
  expires_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (tenant_id, feature_key)
);

create table if not exists public.tenant_features (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  feature_key text not null references public.features(key) on delete cascade,
  enabled boolean not null default true,
  configuration jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (tenant_id, feature_key)
);

-- -----------------------------------------------------------------------------
-- CMS / media
-- -----------------------------------------------------------------------------

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  slug text not null,
  title text not null,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  seo jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create index if not exists pages_tenant_status_idx on public.pages(tenant_id, status);

create table if not exists public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  section_type text not null,
  position integer not null default 0,
  is_enabled boolean not null default true,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists page_sections_page_position_idx on public.page_sections(page_id, position);
create index if not exists page_sections_tenant_idx on public.page_sections(tenant_id);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  storage_bucket text not null,
  storage_path text not null,
  visibility text not null default 'public' check (visibility in ('public','private')),
  filename text not null,
  mime_type text not null,
  byte_size bigint not null check (byte_size >= 0),
  width integer,
  height integer,
  duration_ms integer,
  alt_text text,
  tags text[] not null default '{}',
  folder text,
  checksum_sha256 text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (storage_bucket, storage_path)
);

create index if not exists media_assets_tenant_idx on public.media_assets(tenant_id);
create index if not exists media_assets_tags_gin_idx on public.media_assets using gin(tags);

-- -----------------------------------------------------------------------------
-- Integrations / webhooks / notifications / audit / usage
-- -----------------------------------------------------------------------------

create table if not exists public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  provider text not null,
  kind text not null,
  status text not null default 'disconnected' check (status in ('disconnected','connected','degraded','error','disabled')),
  public_config jsonb not null default '{}'::jsonb,
  secret_ref text,
  last_verified_at timestamptz,
  last_error text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists integration_connections_tenant_idx on public.integration_connections(tenant_id);
create unique index if not exists integration_connections_unique_kind_idx on public.integration_connections(tenant_id, provider, kind);

create table if not exists public.webhook_endpoints (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  url text not null,
  event_types text[] not null default '{}',
  status text not null default 'active' check (status in ('active','disabled')),
  secret_ref text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists webhook_endpoints_tenant_idx on public.webhook_endpoints(tenant_id);

create table if not exists public.webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  endpoint_id uuid not null references public.webhook_endpoints(id) on delete cascade,
  event_type text not null,
  event_id text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','delivered','failed','dead_letter')),
  attempt_count integer not null default 0,
  next_attempt_at timestamptz,
  last_attempt_at timestamptz,
  response_status integer,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (endpoint_id, event_id)
);

create index if not exists webhook_deliveries_retry_idx on public.webhook_deliveries(status, next_attempt_at);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  recipient_user_id uuid references auth.users(id) on delete cascade,
  channel text not null check (channel in ('in_app','email','whatsapp','sms','webhook')),
  template_key text,
  subject text,
  body text,
  status text not null default 'pending' check (status in ('pending','sent','failed','read','canceled')),
  provider_message_id text,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_recipient_idx on public.notifications(recipient_user_id, created_at desc);
create index if not exists notifications_tenant_idx on public.notifications(tenant_id, created_at desc);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  tenant_id uuid references public.tenants(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text,
  request_id text,
  ip_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_tenant_created_idx on public.audit_logs(tenant_id, created_at desc);
create index if not exists audit_logs_actor_created_idx on public.audit_logs(actor_user_id, created_at desc);

create table if not exists public.usage_metrics (
  id bigint generated always as identity primary key,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  metric_key text not null,
  metric_value numeric not null default 1,
  dimensions jsonb not null default '{}'::jsonb,
  period_start timestamptz not null,
  period_end timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists usage_metrics_tenant_metric_period_idx on public.usage_metrics(tenant_id, metric_key, period_start desc);

-- -----------------------------------------------------------------------------
-- CRM base
-- -----------------------------------------------------------------------------

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  kind text not null default 'person' check (kind in ('person','company')),
  name text not null,
  email text,
  phone text,
  whatsapp text,
  document_ref text,
  consent jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contacts_tenant_idx on public.contacts(tenant_id);
create index if not exists contacts_email_lower_idx on public.contacts(tenant_id, lower(email)) where email is not null;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  source text,
  status text not null default 'new' check (status in ('new','qualified','contacted','proposal','won','lost','archived')),
  owner_user_id uuid references auth.users(id) on delete set null,
  subject text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_tenant_status_idx on public.leads(tenant_id, status);
create index if not exists leads_owner_idx on public.leads(owner_user_id);

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array[
    'vertical_registry','tenants','tenant_domains','tenant_brands','tenant_themes','tenant_settings','locations',
    'profiles','memberships','roles','invitations','plans','subscriptions','tenant_entitlements','tenant_features',
    'pages','page_sections','media_assets','integration_connections','webhook_endpoints','webhook_deliveries',
    'contacts','leads'
  ] loop
    execute format('drop trigger if exists trg_%I_updated_at on public.%I', t, t);
    execute format('create trigger trg_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'))
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_auth_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.validate_membership_role_scope()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  membership_tenant uuid;
  role_tenant uuid;
begin
  select tenant_id into membership_tenant from public.memberships where id = new.membership_id;
  select tenant_id into role_tenant from public.roles where id = new.role_id;
  if membership_tenant is null then
    raise exception 'membership not found';
  end if;
  if role_tenant is not null and role_tenant <> membership_tenant then
    raise exception 'role tenant does not match membership tenant';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_validate_membership_role_scope on public.membership_roles;
create trigger trg_validate_membership_role_scope
before insert or update on public.membership_roles
for each row execute function public.validate_membership_role_scope();

-- -----------------------------------------------------------------------------
-- Authorization helpers
-- -----------------------------------------------------------------------------

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and exists (select 1 from public.platform_admins pa where pa.user_id = auth.uid());
$$;

create or replace function public.is_tenant_member(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_admin()
    or exists (
      select 1
      from public.memberships m
      where m.tenant_id = p_tenant_id
        and m.user_id = auth.uid()
        and m.status = 'active'
    );
$$;

create or replace function public.has_tenant_permission(p_tenant_id uuid, p_permission_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_admin()
    or exists (
      select 1
      from public.memberships m
      join public.membership_roles mr on mr.membership_id = m.id
      join public.role_permissions rp on rp.role_id = mr.role_id
      join public.permissions p on p.id = rp.permission_id
      where m.tenant_id = p_tenant_id
        and m.user_id = auth.uid()
        and m.status = 'active'
        and p.key = p_permission_key
    );
$$;

revoke all on function public.is_platform_admin() from public;
revoke all on function public.is_tenant_member(uuid) from public;
revoke all on function public.has_tenant_permission(uuid, text) from public;
grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.is_tenant_member(uuid) to authenticated;
grant execute on function public.has_tenant_permission(uuid, text) to authenticated;

-- -----------------------------------------------------------------------------
-- Seed invariant system permissions / roles required by onboarding
-- -----------------------------------------------------------------------------

insert into public.permissions(key, description) values
  ('tenant.read','Read tenant metadata'),
  ('tenant.settings.read','Read tenant settings'),
  ('tenant.settings.write','Update tenant settings'),
  ('brand.read','Read tenant brand/theme'),
  ('brand.write','Update tenant brand/theme'),
  ('cms.read','Read CMS drafts and structure'),
  ('cms.write','Create/update/publish CMS content'),
  ('media.read','Read tenant media metadata/private assets'),
  ('media.write','Upload/update/delete tenant media'),
  ('catalog.read','Read private catalog/admin catalog state'),
  ('catalog.write','Create/update catalog data'),
  ('orders.read','Read tenant orders'),
  ('orders.create','Create orders'),
  ('orders.status.write','Change order status'),
  ('members.read','Read tenant members'),
  ('members.invite','Invite tenant members'),
  ('members.roles.write','Manage member roles'),
  ('integrations.read','Read integration configuration'),
  ('integrations.write','Manage integrations'),
  ('billing.read','Read subscription/billing state'),
  ('billing.write','Manage billing actions'),
  ('audit.read','Read tenant audit trail'),
  ('crm.read','Read CRM contacts/leads'),
  ('crm.write','Create/update CRM contacts/leads'),
  ('booking.read','Read bookings'),
  ('booking.write','Create/update bookings'),
  ('quotes.read','Read quotes/proposals'),
  ('quotes.write','Create/update quotes/proposals')
on conflict (key) do update set description = excluded.description;

insert into public.roles(tenant_id, key, name, description, is_system)
select null, v.key, v.name, v.description, true
from (values
  ('owner','Owner','Full tenant control'),
  ('admin','Admin','Tenant administration'),
  ('manager','Manager','Operational management'),
  ('editor','Editor','Content and brand editing'),
  ('catalog_manager','Catalog Manager','Catalog administration'),
  ('orders_manager','Orders Manager','Order operations'),
  ('support','Support','Customer/support operations'),
  ('viewer','Viewer','Read-only access')
) as v(key,name,description)
where not exists (select 1 from public.roles r where r.tenant_id is null and lower(r.key)=lower(v.key));

-- Owner: all permissions
insert into public.role_permissions(role_id, permission_id)
select r.id, p.id
from public.roles r cross join public.permissions p
where r.tenant_id is null and r.key = 'owner'
on conflict do nothing;

-- Admin: all tenant permissions except no platform-level capability exists here anyway
insert into public.role_permissions(role_id, permission_id)
select r.id, p.id
from public.roles r cross join public.permissions p
where r.tenant_id is null and r.key = 'admin'
on conflict do nothing;

-- Manager
insert into public.role_permissions(role_id, permission_id)
select r.id, p.id
from public.roles r join public.permissions p on p.key = any(array[
  'tenant.read','tenant.settings.read','brand.read','cms.read','cms.write','media.read','media.write',
  'catalog.read','catalog.write','orders.read','orders.status.write','members.read','integrations.read',
  'audit.read','crm.read','crm.write','booking.read','booking.write','quotes.read','quotes.write'
])
where r.tenant_id is null and r.key='manager'
on conflict do nothing;

-- Editor
insert into public.role_permissions(role_id, permission_id)
select r.id, p.id from public.roles r join public.permissions p on p.key = any(array[
  'tenant.read','brand.read','brand.write','cms.read','cms.write','media.read','media.write','catalog.read'
]) where r.tenant_id is null and r.key='editor'
on conflict do nothing;

-- Catalog manager
insert into public.role_permissions(role_id, permission_id)
select r.id, p.id from public.roles r join public.permissions p on p.key = any(array[
  'tenant.read','media.read','media.write','catalog.read','catalog.write'
]) where r.tenant_id is null and r.key='catalog_manager'
on conflict do nothing;

-- Orders manager
insert into public.role_permissions(role_id, permission_id)
select r.id, p.id from public.roles r join public.permissions p on p.key = any(array[
  'tenant.read','catalog.read','orders.read','orders.create','orders.status.write','crm.read','crm.write'
]) where r.tenant_id is null and r.key='orders_manager'
on conflict do nothing;

-- Support
insert into public.role_permissions(role_id, permission_id)
select r.id, p.id from public.roles r join public.permissions p on p.key = any(array[
  'tenant.read','orders.read','crm.read','crm.write','booking.read','booking.write','quotes.read'
]) where r.tenant_id is null and r.key='support'
on conflict do nothing;

-- Viewer
insert into public.role_permissions(role_id, permission_id)
select r.id, p.id from public.roles r join public.permissions p on p.key = any(array[
  'tenant.read','tenant.settings.read','brand.read','cms.read','media.read','catalog.read','orders.read','members.read','integrations.read','billing.read','audit.read','crm.read','booking.read','quotes.read'
]) where r.tenant_id is null and r.key='viewer'
on conflict do nothing;

-- -----------------------------------------------------------------------------
-- Atomic tenant onboarding
-- -----------------------------------------------------------------------------

create or replace function public.create_tenant_with_owner(
  p_name text,
  p_slug text,
  p_vertical_id text,
  p_demo boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_tenant uuid;
  v_membership uuid;
  v_owner_role uuid;
begin
  if v_user is null then raise exception 'authentication required'; end if;
  if p_name is null or length(trim(p_name)) < 2 then raise exception 'invalid tenant name'; end if;
  if p_slug !~ '^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$' then raise exception 'invalid tenant slug'; end if;
  if not exists(select 1 from public.vertical_registry where id = p_vertical_id and is_enabled) then
    raise exception 'invalid or disabled vertical';
  end if;

  insert into public.tenants(slug,name,vertical_id,status,created_by)
  values(lower(p_slug),trim(p_name),p_vertical_id,case when p_demo then 'demo' else 'trialing' end,v_user)
  returning id into v_tenant;

  insert into public.tenant_brands(tenant_id,display_name) values(v_tenant,trim(p_name));
  insert into public.tenant_themes(tenant_id) values(v_tenant);
  insert into public.tenant_settings(tenant_id) values(v_tenant);

  insert into public.memberships(tenant_id,user_id,status,joined_at)
  values(v_tenant,v_user,'active',now()) returning id into v_membership;

  select id into v_owner_role from public.roles where tenant_id is null and key='owner' limit 1;
  if v_owner_role is null then raise exception 'owner role missing'; end if;

  insert into public.membership_roles(membership_id,role_id,granted_by)
  values(v_membership,v_owner_role,v_user);

  return v_tenant;
end;
$$;

revoke all on function public.create_tenant_with_owner(text,text,text,boolean) from public;
grant execute on function public.create_tenant_with_owner(text,text,text,boolean) to authenticated;

-- -----------------------------------------------------------------------------
-- RLS enablement
-- -----------------------------------------------------------------------------

alter table public.vertical_registry enable row level security;
alter table public.tenants enable row level security;
alter table public.tenant_domains enable row level security;
alter table public.tenant_brands enable row level security;
alter table public.tenant_themes enable row level security;
alter table public.tenant_settings enable row level security;
alter table public.locations enable row level security;
alter table public.profiles enable row level security;
alter table public.platform_admins enable row level security;
alter table public.memberships enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.membership_roles enable row level security;
alter table public.invitations enable row level security;
alter table public.features enable row level security;
alter table public.plans enable row level security;
alter table public.plan_entitlements enable row level security;
alter table public.subscriptions enable row level security;
alter table public.tenant_entitlements enable row level security;
alter table public.tenant_features enable row level security;
alter table public.pages enable row level security;
alter table public.page_sections enable row level security;
alter table public.media_assets enable row level security;
alter table public.integration_connections enable row level security;
alter table public.webhook_endpoints enable row level security;
alter table public.webhook_deliveries enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.usage_metrics enable row level security;
alter table public.contacts enable row level security;
alter table public.leads enable row level security;

-- Public/reference data
create policy vertical_registry_public_read on public.vertical_registry for select using (is_enabled);
create policy features_authenticated_read on public.features for select to authenticated using (true);
create policy plans_public_read on public.plans for select using (is_public and is_active);
create policy plan_entitlements_authenticated_read on public.plan_entitlements for select to authenticated using (true);
create policy permissions_authenticated_read on public.permissions for select to authenticated using (true);
create policy roles_authenticated_read on public.roles for select to authenticated using (tenant_id is null or public.is_tenant_member(tenant_id));
create policy role_permissions_authenticated_read on public.role_permissions for select to authenticated using (true);

-- Tenant metadata / branding
create policy tenants_member_read on public.tenants for select to authenticated using (public.is_tenant_member(id));
create policy tenant_domains_member_read on public.tenant_domains for select to authenticated using (public.has_tenant_permission(tenant_id,'tenant.settings.read'));
create policy tenant_domains_admin_write on public.tenant_domains for all to authenticated using (public.has_tenant_permission(tenant_id,'tenant.settings.write')) with check (public.has_tenant_permission(tenant_id,'tenant.settings.write'));
create policy tenant_brands_public_read on public.tenant_brands for select using (exists(select 1 from public.tenants t where t.id=tenant_id and t.status in ('demo','trialing','active')));
create policy tenant_brands_admin_write on public.tenant_brands for all to authenticated using (public.has_tenant_permission(tenant_id,'brand.write')) with check (public.has_tenant_permission(tenant_id,'brand.write'));
create policy tenant_themes_public_read on public.tenant_themes for select using (exists(select 1 from public.tenants t where t.id=tenant_id and t.status in ('demo','trialing','active')));
create policy tenant_themes_admin_write on public.tenant_themes for all to authenticated using (public.has_tenant_permission(tenant_id,'brand.write')) with check (public.has_tenant_permission(tenant_id,'brand.write'));
create policy tenant_settings_member_read on public.tenant_settings for select to authenticated using (public.has_tenant_permission(tenant_id,'tenant.settings.read'));
create policy tenant_settings_admin_write on public.tenant_settings for all to authenticated using (public.has_tenant_permission(tenant_id,'tenant.settings.write')) with check (public.has_tenant_permission(tenant_id,'tenant.settings.write'));
create policy locations_public_read on public.locations for select using (is_public and exists(select 1 from public.tenants t where t.id=tenant_id and t.status in ('demo','trialing','active')));
create policy locations_admin_write on public.locations for all to authenticated using (public.has_tenant_permission(tenant_id,'tenant.settings.write')) with check (public.has_tenant_permission(tenant_id,'tenant.settings.write'));

-- Identity
create policy profiles_self_read on public.profiles for select to authenticated using (id = auth.uid() or public.is_platform_admin());
create policy profiles_self_update on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy platform_admins_self_read on public.platform_admins for select to authenticated using (user_id = auth.uid() or public.is_platform_admin());
create policy memberships_self_or_admin_read on public.memberships for select to authenticated using (user_id=auth.uid() or public.has_tenant_permission(tenant_id,'members.read'));
create policy membership_roles_admin_read on public.membership_roles for select to authenticated using (exists(select 1 from public.memberships m where m.id=membership_id and (m.user_id=auth.uid() or public.has_tenant_permission(m.tenant_id,'members.read'))));
create policy membership_roles_admin_write on public.membership_roles for all to authenticated using (exists(select 1 from public.memberships m where m.id=membership_id and public.has_tenant_permission(m.tenant_id,'members.roles.write'))) with check (exists(select 1 from public.memberships m where m.id=membership_id and public.has_tenant_permission(m.tenant_id,'members.roles.write')));
create policy invitations_admin_read on public.invitations for select to authenticated using (public.has_tenant_permission(tenant_id,'members.read'));
create policy invitations_admin_write on public.invitations for all to authenticated using (public.has_tenant_permission(tenant_id,'members.invite')) with check (public.has_tenant_permission(tenant_id,'members.invite'));

-- Billing / entitlements
create policy subscriptions_member_read on public.subscriptions for select to authenticated using (public.has_tenant_permission(tenant_id,'billing.read'));
create policy tenant_entitlements_member_read on public.tenant_entitlements for select to authenticated using (public.is_tenant_member(tenant_id));
create policy tenant_features_member_read on public.tenant_features for select to authenticated using (public.is_tenant_member(tenant_id));

-- CMS
create policy pages_public_published_read on public.pages for select using (status='published' and exists(select 1 from public.tenants t where t.id=tenant_id and t.status in ('demo','trialing','active')));
create policy pages_admin_read on public.pages for select to authenticated using (public.has_tenant_permission(tenant_id,'cms.read'));
create policy pages_admin_write on public.pages for all to authenticated using (public.has_tenant_permission(tenant_id,'cms.write')) with check (public.has_tenant_permission(tenant_id,'cms.write'));
create policy page_sections_public_published_read on public.page_sections for select using (is_enabled and exists(select 1 from public.pages p join public.tenants t on t.id=p.tenant_id where p.id=page_id and p.status='published' and t.status in ('demo','trialing','active')));
create policy page_sections_admin_read on public.page_sections for select to authenticated using (public.has_tenant_permission(tenant_id,'cms.read'));
create policy page_sections_admin_write on public.page_sections for all to authenticated using (public.has_tenant_permission(tenant_id,'cms.write')) with check (public.has_tenant_permission(tenant_id,'cms.write'));

-- Media metadata
create policy media_public_read on public.media_assets for select using (visibility='public' and exists(select 1 from public.tenants t where t.id=tenant_id and t.status in ('demo','trialing','active')));
create policy media_admin_read on public.media_assets for select to authenticated using (public.has_tenant_permission(tenant_id,'media.read'));
create policy media_admin_write on public.media_assets for all to authenticated using (public.has_tenant_permission(tenant_id,'media.write')) with check (public.has_tenant_permission(tenant_id,'media.write'));

-- Integrations/webhooks
create policy integrations_admin_read on public.integration_connections for select to authenticated using (public.has_tenant_permission(tenant_id,'integrations.read'));
create policy integrations_admin_write on public.integration_connections for all to authenticated using (public.has_tenant_permission(tenant_id,'integrations.write')) with check (public.has_tenant_permission(tenant_id,'integrations.write'));
create policy webhook_endpoints_admin_read on public.webhook_endpoints for select to authenticated using (public.has_tenant_permission(tenant_id,'integrations.read'));
create policy webhook_endpoints_admin_write on public.webhook_endpoints for all to authenticated using (public.has_tenant_permission(tenant_id,'integrations.write')) with check (public.has_tenant_permission(tenant_id,'integrations.write'));
create policy webhook_deliveries_admin_read on public.webhook_deliveries for select to authenticated using (public.has_tenant_permission(tenant_id,'integrations.read'));

-- Notifications / audit / usage
create policy notifications_recipient_read on public.notifications for select to authenticated using (recipient_user_id=auth.uid() or public.is_platform_admin());
create policy audit_admin_read on public.audit_logs for select to authenticated using ((tenant_id is not null and public.has_tenant_permission(tenant_id,'audit.read')) or public.is_platform_admin());
create policy usage_tenant_read on public.usage_metrics for select to authenticated using (public.has_tenant_permission(tenant_id,'tenant.settings.read'));

-- CRM
create policy contacts_crm_read on public.contacts for select to authenticated using (public.has_tenant_permission(tenant_id,'crm.read'));
create policy contacts_crm_write on public.contacts for all to authenticated using (public.has_tenant_permission(tenant_id,'crm.write')) with check (public.has_tenant_permission(tenant_id,'crm.write'));
create policy leads_crm_read on public.leads for select to authenticated using (public.has_tenant_permission(tenant_id,'crm.read'));
create policy leads_crm_write on public.leads for all to authenticated using (public.has_tenant_permission(tenant_id,'crm.write')) with check (public.has_tenant_permission(tenant_id,'crm.write'));

-- Explicit grants; RLS still applies.
grant usage on schema public to anon, authenticated;
grant select on public.vertical_registry, public.plans, public.tenant_brands, public.tenant_themes, public.locations, public.pages, public.page_sections, public.media_assets to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
