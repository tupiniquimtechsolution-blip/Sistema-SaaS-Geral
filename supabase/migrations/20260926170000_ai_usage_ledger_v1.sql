create table if not exists public.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  provider text not null,
  model text not null,
  operation text not null,
  credits integer not null default 1 check (credits > 0),
  input_units bigint check (input_units is null or input_units >= 0),
  output_units bigint check (output_units is null or output_units >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.ai_usage_events enable row level security;
alter table public.ai_usage_events force row level security;
create index if not exists ai_usage_events_tenant_created_idx on public.ai_usage_events(tenant_id,created_at desc);
create index if not exists ai_usage_events_user_created_idx on public.ai_usage_events(user_id,created_at desc) where user_id is not null;
create policy ai_usage_events_authorized_read on public.ai_usage_events for select to authenticated
using (public.has_tenant_permission(tenant_id,'billing.read'));
revoke insert,update,delete,truncate on public.ai_usage_events from anon,authenticated;
grant select on public.ai_usage_events to authenticated;
