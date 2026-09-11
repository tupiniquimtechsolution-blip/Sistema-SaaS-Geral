-- Religious House vertical.
-- Sensitive member/attendance/private-consultation modules are intentionally NOT created here.

create table if not exists public.religious_event_details (
  event_id uuid primary key references public.events(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  public_category text,
  spiritual_line text,
  guidance text,
  dress_guidance text,
  arrival_guidance text,
  public_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.religious_booking_details (
  booking_id uuid primary key references public.bookings(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  public_service_type text,
  accessibility_needs text,
  administrative_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.religious_booking_details is
'Administrative scheduling metadata only. Do not store spiritual consultation narratives or sensitive religious records by default.';

create table if not exists public.contribution_configs (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  is_enabled boolean not null default false,
  provider text,
  public_instructions text,
  public_config jsonb not null default '{}'::jsonb,
  secret_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Triggers
 drop trigger if exists trg_religious_event_details_updated_at on public.religious_event_details;
 create trigger trg_religious_event_details_updated_at before update on public.religious_event_details for each row execute function public.set_updated_at();
 drop trigger if exists trg_religious_booking_details_updated_at on public.religious_booking_details;
 create trigger trg_religious_booking_details_updated_at before update on public.religious_booking_details for each row execute function public.set_updated_at();
 drop trigger if exists trg_contribution_configs_updated_at on public.contribution_configs;
 create trigger trg_contribution_configs_updated_at before update on public.contribution_configs for each row execute function public.set_updated_at();

-- RLS
alter table public.religious_event_details enable row level security;
alter table public.religious_booking_details enable row level security;
alter table public.contribution_configs enable row level security;

create policy religious_event_details_public_read on public.religious_event_details for select using (
  exists(select 1 from public.events e join public.tenants t on t.id=e.tenant_id where e.id=event_id and e.status='published' and t.status in ('demo','trialing','active'))
);
create policy religious_event_details_admin_all on public.religious_event_details for all to authenticated using (public.has_tenant_permission(tenant_id,'cms.write')) with check (public.has_tenant_permission(tenant_id,'cms.write'));
create policy religious_booking_details_read on public.religious_booking_details for select to authenticated using (public.has_tenant_permission(tenant_id,'booking.read'));
create policy religious_booking_details_write on public.religious_booking_details for all to authenticated using (public.has_tenant_permission(tenant_id,'booking.write')) with check (public.has_tenant_permission(tenant_id,'booking.write'));
create policy contribution_configs_member_read on public.contribution_configs for select to authenticated using (public.has_tenant_permission(tenant_id,'tenant.settings.read'));
create policy contribution_configs_admin_write on public.contribution_configs for all to authenticated using (public.has_tenant_permission(tenant_id,'tenant.settings.write')) with check (public.has_tenant_permission(tenant_id,'tenant.settings.write'));

grant select on public.religious_event_details to anon;
grant select, insert, update, delete on public.religious_event_details, public.religious_booking_details, public.contribution_configs to authenticated;
